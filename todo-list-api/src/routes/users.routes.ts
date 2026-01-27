import { Router } from 'express';
import { db } from '../config/database';
import { users, employees, organizationMembers } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '../config/auth';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { randomUUID } from 'crypto';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
// Get all users (with optional filtering by groupId)
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const { groupId } = req.query;
        // const isGlobalView = req.isGlobalView; // Assuming middleware sets this

        let result;

        if (req.isGlobalView) {
            // Global View: Fetch all users directly
            const whereCondition = groupId ? eq(users.groupId, Number(groupId)) : undefined;

            result = await db.query.users.findMany({
                where: whereCondition,
                with: {
                    employee: true,
                    group: true,
                },
                orderBy: [desc(users.createdAt)],
            });
        } else {
            // Restricted View: Fetch users belonging to activeOrgId
            // Restricted View: Fetch users belonging to activeOrgId
            const orgId = req.activeOrgId;
            if (!orgId) return res.status(400).json({ message: 'Organization context required' });

            // We query organizationMembers to find users in this org
            // And use 'with' to fetch the actual user profile
            const members = await db.query.organizationMembers.findMany({
                where: eq(organizationMembers.organizationId, orgId),
                with: {
                    user: {
                        with: {
                            employee: true,
                            group: true,
                        }
                    }
                }
            });

            // Map back to User objects to match expected API response structure
            // Also apply groupId filter in memory if necessary, or we could have filtered query
            result = members.map(m => m.user);

            if (groupId) {
                result = result.filter(u => u.groupId === Number(groupId));
            }
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// GET /api/users/me - Get current authenticated user
router.get('/me', async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                employee: true,
                group: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});

// GET /api/users/:id - Get single user by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;

        const user = await db.query.users.findFirst({
            where: eq(users.id, id as string),
            with: {
                employee: true,
                group: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});

// Create new user
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const { name, email, password, username, role, wig, employeeId, groupId, status } = req.body;

        // 1. Create user using better-auth
        // This handles password hashing and basic user creation
        const authResponse = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            }
        });

        if (!authResponse?.user) {
            return res.status(400).json({ message: 'Failed to create user authentication' });
        }

        const userId = authResponse.user.id;

        // 2. Update the user with additional application-specific fields
        // better-auth might not support custom fields in signUpEmail body by default unless mapped,
        // so we explicitly update the record to be safe.
        const [updatedUser] = await db.update(users)
            .set({
                username,
                role: role || 'user',
                wig,
                employeeId: employeeId ? Number(employeeId) : null,
                groupId: groupId ? Number(groupId) : null,
                status: status || 'active',
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        // 3. Link user to the current organization
        // 3. Link user to the current organization
        const orgId = req.activeOrgId;
        if (orgId) {
            await db.insert(organizationMembers)
                .values({
                    id: randomUUID(),
                    userId,
                    organizationId: orgId,
                    role: role || 'member', // Default role in org
                })
                .onConflictDoNothing(); // Prevent duplicates if already member
        }

        // 3. Return the complete user object (without sensitive auth data if possible, but updatedUser is safe-ish)
        res.status(201).json(updatedUser);

    } catch (error: any) {
        console.error('Error creating user:', error);

        // Check for specific better-auth or db errors (like duplicate email)
        if (error?.body?.code === 'USER_ALREADY_EXISTS' || error?.code === '23505') { // Postgres unique violation
            return res.status(409).json({ message: 'User with this email or username already exists' });
        }

        res.status(500).json({
            message: 'Failed to create user',
            error: error?.message || error?.body?.message || String(error)
        });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, username, role, wig, employeeId, groupId, status } = req.body;

        const updatedUser = await db.update(users)
            .set({
                name,
                email,
                username,
                role,
                wig,
                employeeId: employeeId ? Number(employeeId) : null,
                groupId: groupId ? Number(groupId) : null,
                status,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning();

        res.json(updatedUser[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// Delete user - Only admins can delete, or users can delete themselves
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.id;

        // Check if user is admin or deleting their own account
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, currentUserId!),
        });

        const isAdmin = currentUser?.role === 'admin';
        const isDeletingSelf = currentUserId === id;

        if (!isAdmin && !isDeletingSelf) {
            return res.status(403).json({ message: 'Forbidden: Only admins can delete other users' });
        }

        await db.delete(users).where(eq(users.id, id as string));
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

export default router;
