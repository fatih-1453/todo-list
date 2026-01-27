import { Router, Request, Response, NextFunction } from 'express';
import { programService } from '../services/program.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/programs - Get all programs in organization
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const { search } = req.query;
        const programs = await programService.getAll(
            orgId,
            req.isGlobalView
        );
        res.json(programs);
    } catch (error) {
        next(error);
    }
});

// GET /api/programs/:id - Get single program
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);
        const program = await programService.getById(id, orgId, req.isGlobalView);

        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        res.json(program);
    } catch (error) {
        next(error);
    }
});

// POST /api/programs - Create new program
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        const userId = req.user?.id;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const { title, status, deadline, departments, progress, description, color, startDate, category, isTemplate, projectManager } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const program = await programService.create({
            orgId,
            title,
            status: status || 'Planning',
            deadline,
            departments: departments || [],
            progress: progress || 0,
            description,
            color,
            startDate: startDate ? new Date(startDate) : undefined,
            category,
            isTemplate: isTemplate || false,
            projectManager,
            createdBy: userId,
        });

        res.status(201).json(program);
    } catch (error) {
        next(error);
    }
});

// PUT /api/programs/:id - Update program
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);
        const { title, status, deadline, departments, progress, description, color, startDate, category, isTemplate, projectManager } = req.body;

        const program = await programService.update(id, orgId, {
            title,
            status,
            deadline,
            departments,
            progress,
            description,
            color,
            startDate: startDate ? new Date(startDate) : undefined,
            category,
            isTemplate,
            projectManager,
        });

        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        res.json(program);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/programs/:id - Delete program
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);
        const program = await programService.delete(id, orgId);

        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        res.json({ message: 'Program deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// GET /api/programs/:id/intelligence-report - Get intelligence report for a program
router.get('/:id/intelligence-report', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        const report = await programService.getIntelligenceReport(id);
        res.json(report);
    } catch (error) {
        next(error);
    }
});

// GET /api/programs/:id/discussions - Get all discussions for a program
router.get('/:id/discussions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        const discussions = await programService.getDiscussions(id);
        res.json(discussions);
    } catch (error) {
        next(error);
    }
});

// POST /api/programs/:id/discussions - Create new discussion
router.post('/:id/discussions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const programId = parseInt(req.params.id as string);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { content, type, tags, parentId, mediaUrl, mediaType, fileName, fileSize, metadata } = req.body;

        // Content is required only if there's no media or metadata (e.g. poll/event)
        if (!content && !mediaUrl && !metadata) {
            return res.status(400).json({ error: 'Content, media, or metadata is required' });
        }

        const discussion = await programService.createDiscussion({
            programId,
            userId,
            content: content || '', // Allow empty content if media exists
            type: type || 'discussion',
            tags: tags || [],
            mediaUrl,
            mediaType,
            fileName,
            fileSize,
            metadata,
            parentId: parentId || null,
        });

        res.status(201).json(discussion);
    } catch (error) {
        next(error);
    }
});

// Delete discussion
router.delete('/:id/discussions/:discussionId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const discussionId = parseInt(req.params.discussionId as string);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        await programService.deleteDiscussion(discussionId, userId);
        res.status(200).json({ success: true });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Discussion not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Not authorized to delete this discussion') {
                return res.status(403).json({ error: error.message });
            }
        }
        next(error);
    }
});

// POST /api/programs/:id/discussions/:discussionId/vote - Vote on a poll
router.post('/:id/discussions/:discussionId/vote', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const discussionId = parseInt(req.params.discussionId as string);
        const userId = req.user?.id;
        const { optionIds } = req.body; // Array of selected option IDs

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!optionIds || !Array.isArray(optionIds)) {
            return res.status(400).json({ error: 'Invalid options' });
        }

        const updatedDiscussion = await programService.votePoll(discussionId, userId, optionIds);
        res.json(updatedDiscussion);
    } catch (error) {
        next(error);
    }
});

export default router;
