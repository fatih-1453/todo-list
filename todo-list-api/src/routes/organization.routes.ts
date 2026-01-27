import { Router, Request, Response, NextFunction } from 'express';
import { organizationService } from '../services/organization.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/organizations - Get user's organizations
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const organizations = await organizationService.getUserOrganizations(userId);
        res.json(organizations);
    } catch (error) {
        next(error);
    }
});

// GET /api/organizations/:id - Get single organization
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = req.params.id as string;
        const organization = await organizationService.getById(id, userId);

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        res.json(organization);
    } catch (error) {
        next(error);
    }
});

// PUT /api/organizations/:id - Update organization
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = req.params.id as string;
        const { name, status } = req.body;

        // Check if user has access and is Owner/Admin
        const org = await organizationService.getById(id, userId);
        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        if (org.role !== 'Owner' && org.role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updatedOrg = await organizationService.update(id, { name, status });
        res.json(updatedOrg);
    } catch (error) {
        next(error);
    }
});

// POST /api/organizations - Create new organization
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const organization = await organizationService.create({
            name,
            ownerId: userId,
        });

        res.status(201).json(organization);
    } catch (error) {
        next(error);
    }
});

// GET /api/organizations/:id/members - Get organization members
router.get('/:id/members', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const id = req.params.id as string;

        // Check if user has access to this organization
        const org = await organizationService.getById(id, userId);
        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        const members = await organizationService.getMembers(id);
        res.json(members);
    } catch (error) {
        next(error);
    }
});

export default router;
