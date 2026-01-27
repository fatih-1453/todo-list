import { Router, Response } from 'express';
import { actionPlanService } from '../services/actionPlan.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

// GET /api/action-plans
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { department, pic } = req.query;
        const plans = await actionPlanService.getAllByOrg(req.activeOrgId!, {
            department: department as string,
            pic: pic as string
        });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching action plans:', error);
        res.status(500).json({ error: 'Failed to fetch action plans' });
    }
});

// POST /api/action-plans
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const plan = await actionPlanService.create({
            ...req.body,
            orgId: req.activeOrgId!,
            createdById: req.user!.id
        });
        res.status(201).json(plan);
    } catch (error: any) {
        console.error('Error creating action plan:', error);
        res.status(500).json({
            error: 'Failed to create action plan',
            details: error.message
        });
    }
});

// POST /api/action-plans/bulk
router.post('/bulk', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const plansData = req.body; // Expecting array
        if (!Array.isArray(plansData)) {
            return res.status(400).json({ error: 'Invalid data format. Expected array.' });
        }

        const enrichedData = plansData.map(p => ({
            ...p,
            orgId: req.activeOrgId!,
            createdById: req.user!.id
        }));

        const plans = await actionPlanService.bulkCreate(enrichedData);
        res.status(201).json(plans);
    } catch (error: any) {
        console.error('Error bulk creating action plans:', error);
        res.status(500).json({
            error: 'Failed to upload action plans',
            details: error.message
        });
    }
});

// PUT /api/action-plans/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const plan = await actionPlanService.update(id, req.activeOrgId!, req.body);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json(plan);
    } catch (error: any) {
        console.error('Error updating action plan:', error);
        res.status(500).json({
            error: 'Failed to update action plan',
            details: error.message
        });
    }
});

// DELETE /api/action-plans/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const plan = await actionPlanService.delete(id, req.activeOrgId!);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting action plan:', error);
        res.status(500).json({ error: 'Failed to delete action plan' });
    }
});

// DELETE /api/action-plans/all
router.delete('/all', async (req: AuthenticatedRequest, res: Response) => {
    try {
        await actionPlanService.deleteAll(req.activeOrgId!);
        res.json({ message: 'All plans deleted successfully' });
    } catch (error) {
        console.error('Error deleting all action plans:', error);
        res.status(500).json({ error: 'Failed to delete action plans' });
    }
});

// POST /api/action-plans/delete-bulk
router.post('/delete-bulk', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty IDs array' });
        }
        await actionPlanService.bulkDelete(ids, req.activeOrgId!);
        res.json({ message: 'Plans deleted successfully' });
    } catch (error) {
        console.error('Error bulk deleting plans:', error);
        res.status(500).json({ error: 'Failed to delete plans' });
    }
});

export default router;
