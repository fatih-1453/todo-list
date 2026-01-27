import { eq, desc, and } from 'drizzle-orm';
import { db } from '../config/database';
import { chatConversations, chatMessages, chatParticipants, NewChatConversation, NewChatMessage } from '../db/schema/index';

export const chatService = {
    // Get all conversations for a user (via participants)
    async getConversationsByUser(userId: string) {
        // Find conversation IDs where user is a participant
        const participations = await db.query.chatParticipants.findMany({
            where: eq(chatParticipants.userId, userId),
            with: {
                conversation: {
                    with: {
                        participants: {
                            with: {
                                user: true
                            }
                        },
                        messages: {
                            orderBy: [desc(chatMessages.createdAt)],
                            // limit: 1 // Don't limit if we want to count unread correctly? 
                            // Actually, fetching ALL messages for ALL conversations is heavy.
                            // Better to use SQL count or fetch just enough.
                            // For MVP: let's fetch last 50 and count unread among them? 
                            // Or just fetch all messages for now (assuming low volume).
                            // Optimization: Separate query for unread count?
                            // Let's rely on Drizzle's ability. 
                            // But `with` loads data in memory app-side (after join).
                            // Let's grab all messages for now to ensure accuracy of unread count.
                        }
                    }
                }
            }
        });

        // Extract conversations and sort by updatedAt
        const conversations = participations
            .map(p => {
                const conv = p.conversation;
                const lastReadAt = p.lastReadAt ? new Date(p.lastReadAt).getTime() : 0;

                // Calculate unread count
                const unreadCount = (conv as any).messages.filter((m: any) =>
                    new Date(m.createdAt || 0).getTime() > lastReadAt &&
                    m.senderId !== userId // Don't count own messages
                ).length;

                const latestMessage = (conv as any).messages[0];

                return {
                    ...conv,
                    unreadCount,
                    latestMessage: latestMessage ? {
                        text: latestMessage.text,
                        createdAt: latestMessage.createdAt
                    } : null,
                    // Remove full messages list to reduce payload
                    messages: undefined
                };
            })
            .sort((a, b) => {
                const dateA = (a as any).updatedAt ? new Date((a as any).updatedAt).getTime() : 0;
                const dateB = (b as any).updatedAt ? new Date((b as any).updatedAt).getTime() : 0;
                return dateB - dateA;
            });

        return conversations;
    },

    // Get a single conversation with messages
    async getConversationById(id: number, userId: string) {
        // Verify multiple checks: ownership OR participation
        // Simplified: check participation
        const participation = await db.query.chatParticipants.findFirst({
            where: and(
                eq(chatParticipants.conversationId, id),
                eq(chatParticipants.userId, userId)
            ),
        });

        if (!participation) return null;

        return db.query.chatConversations.findFirst({
            where: eq(chatConversations.id, id),
            with: {
                messages: {
                    orderBy: [desc(chatMessages.createdAt)],
                },
                participants: {
                    with: {
                        user: true
                    }
                }
            },
        });
    },

    // Get messages for a conversation
    async getMessages(conversationId: number) {
        return db.query.chatMessages.findMany({
            where: eq(chatMessages.conversationId, conversationId),
            orderBy: [desc(chatMessages.createdAt)],
        });
    },

    // Create a new conversation (Generic)
    async createConversation(data: NewChatConversation & { participantIds?: string[] }) {
        const { participantIds, ...conversationData } = data;

        const [newConversation] = await db.insert(chatConversations).values(conversationData).returning();

        // Add creator as participant
        await db.insert(chatParticipants).values({
            conversationId: newConversation.id,
            userId: conversationData.userId,
        });

        // Add other participants
        if (participantIds && participantIds.length > 0) {
            const participants = participantIds.map(pid => ({
                conversationId: newConversation.id,
                userId: pid
            }));
            await db.insert(chatParticipants).values(participants);
        }

        return newConversation;
    },

    // Create P2P Conversation
    async createP2PConversation(userId1: string, userId2: string) {
        // Check if exists
        // Complex query: find conversation with exactly these 2 participants and type 'p2p'
        // For simplicity, just create new one or check client side? 
        // Let's try to find one.
        // Doing this in SQL is efficient, but in simple Drizzle:

        // Find convs where user1 is participant
        const convs1 = await db.query.chatParticipants.findMany({
            where: eq(chatParticipants.userId, userId1),
            with: { conversation: true }
        });

        // Filter for P2P and check if user2 is in it
        for (const p of convs1) {
            if ((p.conversation as any).type === 'p2p') {
                const p2 = await db.query.chatParticipants.findFirst({
                    where: and(
                        eq(chatParticipants.conversationId, p.conversationId),
                        eq(chatParticipants.userId, userId2)
                    )
                });
                if (p2) return p.conversation;
            }
        }

        // Create new
        const [newConversation] = await db.insert(chatConversations).values({
            userId: userId1, // Creator
            type: 'p2p',
            title: 'Direct Message', // Can be dynamic
        }).returning();

        await db.insert(chatParticipants).values([
            { conversationId: newConversation.id, userId: userId1 },
            { conversationId: newConversation.id, userId: userId2 }
        ]);

        return newConversation;
    },

    // Send a message
    async sendMessage(data: NewChatMessage) {
        // Ensure senderId is set if sender is 'user' or 'member'
        // But data should have it if we pass it.
        const [newMessage] = await db.insert(chatMessages).values(data).returning();

        // Update conversation's updatedAt
        await db
            .update(chatConversations)
            .set({ updatedAt: new Date() })
            .where(eq(chatConversations.id, data.conversationId));

        return newMessage;
    },

    // Get or create AI assistant conversation
    async getOrCreateAiConversation(userId: string) {
        let conversation = await db.query.chatConversations.findFirst({
            where: and(
                eq(chatConversations.userId, userId),
                eq(chatConversations.isAiAssistant, true)
            ),
        });

        if (!conversation) {
            [conversation] = await db
                .insert(chatConversations)
                .values({
                    userId,
                    title: 'AI Assistant',
                    isAiAssistant: true,
                    type: 'ai'
                })
                .returning();

            await db.insert(chatParticipants).values({
                conversationId: conversation.id,
                userId
            });
        }

        return conversation;
    },

    // Delete a conversation
    async deleteConversation(id: number, userId: string) {
        // Ensure user is participant/owner?
        // Let's allow any participant to "leave" or "delete" for now?
        // Usually owner deletes.
        // Let's stick to owner for DELETE.
        const [deleted] = await db
            .delete(chatConversations)
            .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)))
            .returning();

        return deleted;
    },

    // Mark conversation as read
    async markAsRead(conversationId: number, userId: string) {
        // Update user's participant entry
        await db.update(chatParticipants)
            .set({ lastReadAt: new Date() })
            .where(and(
                eq(chatParticipants.conversationId, conversationId),
                eq(chatParticipants.userId, userId)
            ));

        return { success: true };
    }
};
