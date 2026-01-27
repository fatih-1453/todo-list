import { Router } from 'express';
import taskRoutes from './task.routes';
import teamRoutes from './team.routes';
import reminderRoutes from './reminder.routes';
import chatRoutes from './chat.routes';
import dashboardRoutes from './dashboard.routes';
import employeeRoutes from './employee.routes';
import userRoutes from './users.routes';
import groupsRoutes from './groups.routes';
import departmentRoutes from './department.routes';
import organizationRoutes from './organization.routes';
import positionRoutes from './position.routes';
import actionPlanRoutes from './actionPlan.routes';
import fileRoutes from './file.routes';
import assessmentRoutes from './assessment.routes';
import programRoutes from './program.routes';
import canvassingRoutes from './canvassing.routes';

const router = Router();

// API Routes
router.use('/users', userRoutes);
router.use('/groups', groupsRoutes);
router.use('/tasks', taskRoutes);
router.use('/team', teamRoutes);
router.use('/reminders', reminderRoutes);
router.use('/chat', chatRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/organizations', organizationRoutes);
router.use('/positions', positionRoutes);
router.use('/action-plans', actionPlanRoutes);
router.use('/files', fileRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/programs', programRoutes);
router.use('/canvassing', canvassingRoutes);

export default router;
