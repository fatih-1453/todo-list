import { Router } from 'express';
import { db } from '../config/database';
import { groups } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Get all groups
router.get('/', async (req, res) => {
    try {
        const allGroups = await db.select().from(groups).orderBy(desc(groups.createdAt));
        res.json(allGroups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
});

// Create group
router.post('/', async (req, res) => {
    try {
        const { name, permissions, status } = req.body;
        const newGroup = await db.insert(groups).values({
            name,
            permissions: permissions || [],
            status: status || 'active',
        }).returning();
        res.status(201).json(newGroup[0]);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Failed to create group' });
    }
});

// Update group
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissions, status } = req.body;

        const updatedGroup = await db.update(groups)
            .set({
                name,
                permissions,
                status,
                updatedAt: new Date(),
            })
            .where(eq(groups.id, Number(id)))
            .returning();

        if (updatedGroup.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(updatedGroup[0]);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Failed to update group' });
    }
});

// Delete group
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(groups).where(eq(groups.id, Number(id)));
        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Failed to delete group' });
    }
});

export default router;
