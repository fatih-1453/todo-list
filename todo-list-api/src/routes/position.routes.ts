import { Router, Request, Response, NextFunction } from 'express';
import { positionService } from '../services/position.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/positions - Get all positions (optionally by organization)
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, orgId: queryOrgId } = req.query;

        // Use orgId from query if provided, otherwise use activeOrgId
        const orgId = queryOrgId ? (queryOrgId as string) : req.activeOrgId;

        if (!orgId) {
            return res.status(400).json({ error: 'Organization ID required' });
        }

        const positions = await positionService.getAllByOrg(
            orgId,
            name as string | undefined,
            req.isGlobalView
        );
        res.json(positions);
    } catch (error) {
        next(error);
    }
});

// GET /api/positions/:id - Get single position
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);
        const position = await positionService.getById(id, orgId);

        if (!position) {
            return res.status(404).json({ error: 'Position not found' });
        }

        res.json(position);
    } catch (error) {
        next(error);
    }
});

// POST /api/positions - Create new position
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, description, status, orgId: bodyOrgId } = req.body;

        // Use orgId from body if provided, otherwise use activeOrgId
        const orgId = bodyOrgId ? bodyOrgId : req.activeOrgId;

        if (!orgId) {
            return res.status(400).json({ error: 'Organization ID required' });
        }

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const position = await positionService.create({
            orgId,
            name,
            description,
            status: status !== undefined ? status : true,
        });

        res.status(201).json(position);
    } catch (error) {
        next(error);
    }
});

// PUT /api/positions/:id - Update position
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name, description, status, orgId: bodyOrgId } = req.body;

        // Use orgId from body if provided, otherwise use activeOrgId
        const orgId = bodyOrgId ? bodyOrgId : req.activeOrgId;

        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);

        const position = await positionService.update(id, orgId, {
            name,
            description,
            status,
        });

        if (!position) {
            return res.status(404).json({ error: 'Position not found' });
        }

        res.json(position);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/positions/:id - Delete position
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);
        const position = await positionService.delete(id, orgId);

        if (!position) {
            return res.status(404).json({ error: 'Position not found' });
        }

        res.json({ message: 'Position deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
