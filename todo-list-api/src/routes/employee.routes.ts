
import { Router, Response } from 'express';
import { employeeService } from '../services/employee.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/employees - Get all employees
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const search = req.query.search as string;
        const employees = await employeeService.getAllByOrg(req.activeOrgId!, search, req.isGlobalView);
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// GET /api/employees/:id - Get single employee
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const employee = await employeeService.getById(id, req.activeOrgId!);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// POST /api/employees - Create employee
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const employeeData = {
            ...req.body,
            orgId: req.activeOrgId!,
            // Ensure dates are parsed correctly if sent as strings
            dateOfBirth: req.body.dateOfBirth ? req.body.dateOfBirth.split('T')[0] : null,
            joinDate: req.body.joinDate ? req.body.joinDate.split('T')[0] : null,
        };

        const newEmployee = await employeeService.create(employeeData);
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const updateData = {
            ...req.body,
            // Ensure dates are parsed correctly if sent as strings (only if present)
            ...(req.body.dateOfBirth && { dateOfBirth: req.body.dateOfBirth.split('T')[0] }),
            ...(req.body.joinDate && { joinDate: req.body.joinDate.split('T')[0] }),
        };

        const updatedEmployee = await employeeService.update(id, req.activeOrgId!, updateData);

        if (!updatedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const deletedEmployee = await employeeService.delete(id, req.activeOrgId!);

        if (!deletedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

export default router;
