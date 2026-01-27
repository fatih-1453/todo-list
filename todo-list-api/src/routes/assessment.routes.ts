import { Router, Response, Request } from 'express';
import { assessmentService } from '../services/assessment.service';
import { fileService } from '../services/file.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();
router.use(authMiddleware);

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// GET /api/assessments
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const assessments = await assessmentService.getAll(req.activeOrgId!, req.isGlobalView);
        res.json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
});

// POST /api/assessments
router.post('/', upload.array('files'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, tag, tagColor, dueDate, assigneeId, subtasks, status } = req.body;

        if (!title) {
            console.error('[API] Missing title');
            return res.status(400).json({ error: 'Title is required' });
        }

        // Parse subtasks potentially sent as JSON string or array
        let parsedSubtasks: string[] = [];
        if (typeof subtasks === 'string') {
            try {
                // Try JSON parse first
                const parsed = JSON.parse(subtasks);
                if (Array.isArray(parsed)) parsedSubtasks = parsed;
                else parsedSubtasks = [subtasks];
            } catch (e) {
                parsedSubtasks = [subtasks]; // Fallback to raw string
            }
        } else if (Array.isArray(subtasks)) {
            parsedSubtasks = subtasks as string[];
        }

        const assessment = await assessmentService.create({
            title,
            tag: tag || null,
            tagColor: tagColor || null,
            dueDate: dueDate ? new Date(dueDate) : null,
            assigneeId: assigneeId || req.user!.id,
            orgId: req.activeOrgId!,
            status: status || 'new'
        }, parsedSubtasks);

        if (!assessment) {
            throw new Error('Failed to create assessment');
        }

        // Handle File Uploads
        // Type assertion to access 'files' which provides array of files
        const reqWithFiles = req as AuthenticatedRequest & { files?: Express.Multer.File[] };
        const files = reqWithFiles.files;

        if (files && files.length > 0) {
            for (const file of files) {
                await fileService.createFile({
                    name: file.originalname,
                    size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                    type: file.mimetype,
                    path: `/uploads/${file.filename}`,
                    folderId: null,
                    orgId: req.activeOrgId!,
                    uploadedById: req.user!.id,
                    assessmentId: assessment.id
                });
            }
        }

        res.status(201).json(assessment);
    } catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({ error: 'Failed to create assessment' });
    }
});

// PUT /api/assessments/:id/status
router.put('/:id/status', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status } = req.body;

        if (!['new', 'acc_direksi', 'progress', 'complete'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updated = await assessmentService.updateStatus(id, req.activeOrgId!, status);
        res.json(updated);
    } catch (error) {
        console.error('Error updating assessment status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE /api/assessments/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        await assessmentService.delete(id, req.activeOrgId!);
        res.json({ message: 'Assessment deleted' });
    } catch (error) {
        console.error('Error deleting assessment:', error);
        res.status(500).json({ error: 'Failed to delete assessment' });
    }
});

// PATCH /api/assessments/subtasks/:id
router.patch('/subtasks/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { completed } = req.body;
        const updated = await assessmentService.toggleSubtask(id, completed);
        res.json(updated);
    } catch (error) {
        console.error('Error toggling subtask:', error);
        res.status(500).json({ error: 'Failed to toggle subtask' });
    }
});

// POST /api/assessments/:id/comments
router.post('/:id/comments', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const assessmentId = parseInt(req.params.id as string);
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const comment = await assessmentService.addComment({
            text,
            assessmentId,
            userId: req.user!.id
        });
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

export default router;
