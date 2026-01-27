import { eq, and, gte, lte, sql, count } from 'drizzle-orm';
import { db } from '../config/database';
import { tasks, performanceStats, NewPerformanceStat } from '../db/schema/index';

export const dashboardService = {
    // Get organization stats
    async getStats(orgId: string) {
        const allTasks = await db.query.tasks.findMany({
            where: eq(tasks.orgId, orgId),
        });

        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.done).length;
        const pendingTasks = totalTasks - completedTasks;
        const highPriorityTasks = allTasks.filter(t => t.priority === 'High' && !t.done).length;

        return {
            totalTasks,
            completedTasks,
            pendingTasks,
            highPriorityTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
    },

    // Get performance metrics
    async getPerformance(orgId: string) {
        const latestStat = await db.query.performanceStats.findFirst({
            where: eq(performanceStats.orgId, orgId),
            orderBy: (stats, { desc }) => [desc(stats.date)],
        });

        return latestStat || {
            tasksDone: 0,
            tasksOngoing: 0,
            hoursSaved: 0,
        };
    },

    // Get weekly report data for organization
    async getWeeklyReport(orgId: string) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyTasks = await db.query.tasks.findMany({
            where: and(
                eq(tasks.orgId, orgId),
                gte(tasks.createdAt, oneWeekAgo)
            ),
        });

        // Group by day
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const report = days.map(day => ({
            day,
            count: 0,
            done: 0,
            ongoing: 0,
        }));

        for (const task of weeklyTasks) {
            if (task.createdAt) {
                const dayIndex = task.createdAt.getDay();
                const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust for Mon-Sun
                report[adjustedIndex].count++;
                if (task.done) {
                    report[adjustedIndex].done++;
                } else {
                    report[adjustedIndex].ongoing++;
                }
            }
        }

        return report;
    },

    // Record performance stat
    async recordPerformance(data: NewPerformanceStat) {
        const [stat] = await db.insert(performanceStats).values(data).returning();
        return stat;
    },
};
