import { Router, Request, Response, NextFunction } from 'express';
import { departmentService } from '../services/department.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/departments - Get all departments in organization
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const { code, name } = req.query;
        const departments = await departmentService.getAll(req.activeOrgId!, code as string | undefined, name as string | undefined, req.isGlobalView);
        res.json(departments);
    } catch (error) {
        next(error);
    }
});

// GET /api/departments/:id - Get single department
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);
        const department = await departmentService.getById(id, orgId);

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(department);
    } catch (error) {
        next(error);
    }
});

// POST /api/departments - Create new department
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const { code, name, description, status } = req.body;

        if (!code || !name) {
            return res.status(400).json({ error: 'Code and name are required' });
        }

        const department = await departmentService.create({
            orgId,
            code,
            name,
            description,
            status: status !== undefined ? status : true,
        });

        res.status(201).json(department);
    } catch (error) {
        next(error);
    }
});

// PUT /api/departments/:id - Update department
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);
        const { code, name, description, status } = req.body;

        const department = await departmentService.update(id, orgId, {
            code,
            name,
            description,
            status,
        });

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(department);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/departments/:id - Delete department
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const orgId = req.activeOrgId;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization context required' });
        }

        const id = parseInt(req.params.id as string);
        const department = await departmentService.delete(id, orgId);

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
