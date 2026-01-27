import { Router, Response } from 'express';
import { teamService } from '../services/team.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/team - Get all team members
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const members = await teamService.getAll();
        res.json(members);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
});

// GET /api/team/:id - Get single member
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const member = await teamService.getById(parseInt(id));
        if (!member) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.json(member);
    } catch (error) {
        console.error('Error fetching team member:', error);
        res.status(500).json({ error: 'Failed to fetch team member' });
    }
});

// POST /api/team - Add team member
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, email, phone, role, avatarColor } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const member = await teamService.create({
            name,
            email,
            phone,
            role,
            avatarColor,
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Error creating team member:', error);
        res.status(500).json({ error: 'Failed to create team member' });
    }
});

// PUT /api/team/:id - Update member
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, email, phone, role, avatarColor } = req.body;

        const member = await teamService.update(parseInt(id), {
            name,
            email,
            phone,
            role,
            avatarColor,
        });

        if (!member) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        res.json(member);
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ error: 'Failed to update team member' });
    }
});

// PATCH /api/team/:id/status - Update member status
router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        if (!['Online', 'Offline', 'Busy', 'In Meeting'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const member = await teamService.updateStatus(parseInt(id), status);
        if (!member) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        res.json(member);
    } catch (error) {
        console.error('Error updating team member status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE /api/team/:id - Remove member
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const member = await teamService.delete(parseInt(id));
        if (!member) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.json({ message: 'Team member removed successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ error: 'Failed to delete team member' });
    }
});

export default router;
