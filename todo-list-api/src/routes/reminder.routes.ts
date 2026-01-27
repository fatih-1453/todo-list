import { Router, Response } from 'express';
import { reminderService } from '../services/reminder.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/reminders - Get all reminders
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const reminders = await reminderService.getAll(req.activeOrgId!, req.isGlobalView);
        res.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

// GET /api/reminders/today - Get today's reminders
router.get('/today', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const reminders = await reminderService.getTodayByOrg(req.activeOrgId!);
        res.json(reminders);
    } catch (error) {
        console.error('Error fetching today reminders:', error);
        res.status(500).json({ error: 'Failed to fetch today reminders' });
    }
});

// GET /api/reminders/:id - Get single reminder
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const reminder = await reminderService.getById(parseInt(id), req.activeOrgId!);
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        res.json(reminder);
    } catch (error) {
        console.error('Error fetching reminder:', error);
        res.status(500).json({ error: 'Failed to fetch reminder' });
    }
});

// POST /api/reminders - Create reminder
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, time, date, color, isRecurring, assigneeIds } = req.body;

        if (!time || !date) {
            return res.status(400).json({ error: 'Time and date are required' });
        }

        const reminder = await reminderService.create(
            {
                userId: req.user!.id,
                orgId: req.activeOrgId!,
                title,
                time,
                date,
                color,
                isRecurring,
            },
            assigneeIds
        );

        res.status(201).json(reminder);
    } catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({ error: 'Failed to create reminder' });
    }
});

// PUT /api/reminders/:id - Update reminder
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, time, date, color, isRecurring } = req.body;

        const reminder = await reminderService.update(parseInt(id), req.activeOrgId!, {
            title,
            time,
            date,
            color,
            isRecurring,
        });

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json(reminder);
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ error: 'Failed to update reminder' });
    }
});

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const reminder = await reminderService.delete(parseInt(id), req.activeOrgId!);
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        res.json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ error: 'Failed to delete reminder' });
    }
});

export default router;
