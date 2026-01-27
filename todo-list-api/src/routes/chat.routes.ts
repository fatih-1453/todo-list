import { Router, Response } from 'express';
import { chatService } from '../services/chat.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/chat/conversations - Get user's conversations
router.get('/conversations', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const conversations = await chatService.getConversationsByUser(req.user!.id);
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// POST /api/chat/conversations - Create new conversation
router.post('/conversations', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, isAiAssistant, type, participantId, participantIds } = req.body;

        if (type === 'p2p' && participantId) {
            const conversation = await chatService.createP2PConversation(
                req.user!.id,
                participantId
            );
            return res.status(201).json(conversation);
        }

        const conversation = await chatService.createConversation({
            userId: req.user!.id,
            title: title || 'New Conversation',
            isAiAssistant: isAiAssistant || false,
            type: type || 'group',
            participantIds: participantIds
        });

        res.status(201).json(conversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// GET /api/chat/conversations/:id - Get conversation details
router.get('/conversations/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const conversation = await chatService.getConversationById(
            parseInt(id),
            req.user!.id
        );

        if (!conversation) {
            console.log(`[ChatDebug] Conversation ${id} not found for user ${req.user!.id} (Participation check failed)`);
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json(conversation);
    } catch (error) {
        console.error(`[ChatDebug] Error fetching conversation ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// GET /api/chat/conversations/:id/messages - Get messages in conversation
router.get('/conversations/:id/messages', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const conversation = await chatService.getConversationById(
            parseInt(id),
            req.user!.id
        );

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json(conversation.messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /api/chat/conversations/:id/messages - Send a message
router.post('/conversations/:id/messages', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { text, type } = req.body;
        const conversationId = parseInt(id);

        // Verify ownership
        const conversation = await chatService.getConversationById(conversationId, req.user!.id);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (!text) {
            return res.status(400).json({ error: 'Message text is required' });
        }

        const message = await chatService.sendMessage({
            conversationId,
            sender: 'user',
            senderId: req.user!.id,
            text,
            type: type || 'text',
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// POST /api/chat/ai - Send message to AI assistant
router.post('/ai', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Message text is required' });
        }

        // Get or create AI conversation
        const conversation = await chatService.getOrCreateAiConversation(req.user!.id);

        // Save user message
        await chatService.sendMessage({
            conversationId: conversation.id,
            sender: 'user',
            text,
            type: 'text',
        });

        // TODO: Integrate with actual AI service (OpenAI, Gemini, etc.)
        // For now, return a placeholder response
        const aiResponse = await chatService.sendMessage({
            conversationId: conversation.id,
            sender: 'assistant',
            senderId: 'ai-assistant', // Added for consistency
            text: "I've noted that. How else can I help you with your tasks?",
            type: 'text',
        });

        res.json({
            conversationId: conversation.id,
            message: aiResponse,
        });
    } catch (error) {
        console.error('Error with AI chat:', error);
        res.status(500).json({ error: 'Failed to process AI request' });
    }
});

// DELETE /api/chat/conversations/:id - Delete conversation
router.delete('/conversations/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const deleted = await chatService.deleteConversation(
            parseInt(id),
            req.user!.id
        );

        if (!deleted) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// POST /api/chat/conversations/:id/read - Mark conversation as read
router.post('/conversations/:id/read', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        await chatService.markAsRead(parseInt(id), req.user!.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking conversation as read:', error);
        res.status(500).json({ error: 'Failed to mark conversation as read' });
    }
});

export default router;
