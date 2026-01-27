import { Router, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/dashboard/stats - Get organization's dashboard statistics
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const stats = await dashboardService.getStats(req.activeOrgId!);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// GET /api/dashboard/performance - Get performance metrics
router.get('/performance', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const performance = await dashboardService.getPerformance(req.activeOrgId!);
        res.json(performance);
    } catch (error) {
        console.error('Error fetching performance:', error);
        res.status(500).json({ error: 'Failed to fetch performance' });
    }
});

// GET /api/dashboard/weekly-report - Get weekly report data
router.get('/weekly-report', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const report = await dashboardService.getWeeklyReport(req.activeOrgId!);
        res.json(report);
    } catch (error) {
        console.error('Error fetching weekly report:', error);
        res.status(500).json({ error: 'Failed to fetch weekly report' });
    }
});

export default router;
