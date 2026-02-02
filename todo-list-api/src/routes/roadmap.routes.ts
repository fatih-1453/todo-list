import { Router, Request, Response, NextFunction } from 'express';
import { roadmapService } from '../services/roadmap.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /api/roadmap - Public access
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await roadmapService.getAll();
        res.json(items);
    } catch (error) {
        next(error);
    }
});

// Protected routes
router.use(authMiddleware);

// POST /api/roadmap
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await roadmapService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
});

// PUT /api/roadmap/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt((req.params.id as string) || '0');
        const item = await roadmapService.update(id, req.body);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/roadmap/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt((req.params.id as string) || '0');
        const item = await roadmapService.delete(id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
