import { Router, Response } from 'express';
import { taskService } from '../services/task.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/tasks - Get all tasks for current user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { programId } = req.query;
        const tasks = await taskService.getAll(req.activeOrgId!, {
            programId: programId ? parseInt(programId as string) : undefined
        }, req.isGlobalView);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const task = await taskService.getById(parseInt(id), req.user!.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

// POST /api/tasks - Create new task
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { text, priority, dueDate, tags } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Task text is required' });
        }

        const task = await taskService.create(
            {
                userId: req.user!.id,
                orgId: req.activeOrgId!,
                text,
                priority: priority || 'Medium',
                dueDate: dueDate ? new Date(dueDate) : null,
                startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
                progress: req.body.progress || 0,
                dependencies: req.body.dependencies || [],
                group: req.body.group || 'Tasks',
                programId: req.body.programId
            },
            tags
        );

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { text, priority, dueDate, done, tags, startDate, progress, dependencies, group } = req.body;

        const task = await taskService.update(parseInt(id), req.user!.id, {
            text,
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            progress,
            dependencies,
            group,
            done,

        }, req.isGlobalView);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (tags) {
            await taskService.updateTags(task.id, tags);
        }

        res.json(await taskService.getById(task.id, req.user!.id));
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// PATCH /api/tasks/:id/toggle - Toggle task done status
router.patch('/:id/toggle', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const task = await taskService.toggleDone(parseInt(id), req.activeOrgId!);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({ error: 'Failed to toggle task' });
    }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const task = await taskService.delete(parseInt(id), req.activeOrgId!);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;
