import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { transactionService } from '../services/transaction.service';

const router = Router();
router.use(authMiddleware);

// Get All
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const results = await transactionService.getAll(req.activeOrgId!);
        res.json(results);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Create
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const newItem = await transactionService.create({
            ...req.body,
            orgId: req.activeOrgId!
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

export default router;
