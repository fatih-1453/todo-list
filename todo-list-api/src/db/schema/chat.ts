import { pgTable, text, timestamp, boolean, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const chatConversations = pgTable('chat_conversations', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title'),
    isAiAssistant: boolean('is_ai_assistant').default(false),
    type: text('type', { enum: ['p2p', 'group', 'ai'] }).default('ai'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatParticipants = pgTable('chat_participants', {
    id: serial('id').primaryKey(),
    conversationId: integer('conversation_id').notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow(),
    lastReadAt: timestamp('last_read_at').defaultNow(), // Track when user last read the conversation
});

export const chatMessages = pgTable('chat_messages', {
    id: serial('id').primaryKey(),
    conversationId: integer('conversation_id').notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
    sender: text('sender', { enum: ['user', 'assistant', 'member'] }).notNull(),
    senderId: text('sender_id'), // Add senderId to track specific user
    text: text('text').notNull(),
    type: text('type', { enum: ['text', 'suggestion'] }).default('text'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
    user: one(users, {
        fields: [chatConversations.userId],
        references: [users.id],
    }),
    messages: many(chatMessages),
    participants: many(chatParticipants),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
    conversation: one(chatConversations, {
        fields: [chatParticipants.conversationId],
        references: [chatConversations.id],
    }),
    user: one(users, {
        fields: [chatParticipants.userId],
        references: [users.id],
    }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
    conversation: one(chatConversations, {
        fields: [chatMessages.conversationId],
        references: [chatConversations.id],
    }),
}));

export type ChatConversation = typeof chatConversations.$inferSelect;
export type NewChatConversation = typeof chatConversations.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
