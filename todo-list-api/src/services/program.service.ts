import { eq, and, desc, like, or, ne, isNull } from 'drizzle-orm';
import { db } from '../config/database';
import { programs, NewProgram, programDiscussions, NewProgramDiscussion } from '../db/schema/index';

export const programService = {
    // Get all programs for an organization
    async getAll(orgId: string, isGlobalView?: boolean, search?: string) {
        let whereCondition = isGlobalView
            ? undefined
            : or(
                eq(programs.orgId, orgId),
                ne(programs.category, 'Management'),
                isNull(programs.category)
            );

        if (search) {
            const searchFilter = like(programs.title, `%${search}%`);
            whereCondition = whereCondition ? and(whereCondition, searchFilter)! : searchFilter;
        }

        const result = await db.query.programs.findMany({
            where: whereCondition,
            orderBy: [desc(programs.createdAt)],
            with: {
                creator: {
                    with: {
                        employee: true
                    }
                },
            }
        });

        return result;
    },

    // Get single program by ID
    async getById(id: number, orgId: string, isGlobalView?: boolean) {
        let whereCondition = isGlobalView
            ? eq(programs.id, id)
            : and(
                eq(programs.id, id),
                or(
                    eq(programs.orgId, orgId),
                    ne(programs.category, 'Management'),
                    isNull(programs.category)
                )
            );

        const program = await db.query.programs.findFirst({
            where: whereCondition,
            with: {
                creator: {
                    with: {
                        employee: true
                    }
                },
            }
        });
        return program;
    },

    // Create new program
    async create(data: NewProgram) {
        const [newProgram] = await db.insert(programs).values(data).returning();
        return newProgram;
    },

    // Update program
    async update(id: number, orgId: string, data: Partial<NewProgram>) {
        const [updated] = await db
            .update(programs)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(programs.id, id), eq(programs.orgId, orgId)))
            .returning();
        return updated;
    },

    // Delete program
    async delete(id: number, orgId: string) {
        const [deleted] = await db
            .delete(programs)
            .where(and(eq(programs.id, id), eq(programs.orgId, orgId)))
            .returning();
        return deleted;
    },

    // Get Program Discussions
    async getDiscussions(programId: number) {
        return await db.query.programDiscussions.findMany({
            where: and(
                eq(programDiscussions.programId, programId),
                isNull(programDiscussions.parentId) // Only fetch top-level discussions
            ),
            orderBy: [desc(programDiscussions.createdAt)],
            with: {
                user: {
                    with: {
                        employee: true
                    }
                },
                replies: {
                    with: {
                        user: {
                            with: {
                                employee: true
                            }
                        },
                        // Level 2 replies
                        replies: {
                            with: {
                                user: {
                                    with: {
                                        employee: true
                                    }
                                },
                                // Level 3 replies
                                replies: {
                                    with: {
                                        user: {
                                            with: {
                                                employee: true
                                            }
                                        }
                                    },
                                    orderBy: (programDiscussions, { asc }) => [asc(programDiscussions.createdAt)]
                                }
                            },
                            orderBy: (programDiscussions, { asc }) => [asc(programDiscussions.createdAt)]
                        }
                    },
                    orderBy: (programDiscussions, { asc }) => [asc(programDiscussions.createdAt)]
                }
            }
        });
    },

    // Create Discussion
    async createDiscussion(data: NewProgramDiscussion) {
        const [discussion] = await db.insert(programDiscussions)
            .values(data)
            .returning();

        // Fetch with user details for immediate UI update
        return await db.query.programDiscussions.findFirst({
            where: eq(programDiscussions.id, discussion.id),
            with: {
                user: {
                    with: {
                        employee: true
                    }
                }
            }
        });
    },

    // Delete Discussion
    async deleteDiscussion(discussionId: number, userId: string) {
        // First check if the user owns this discussion
        const discussion = await db.query.programDiscussions.findFirst({
            where: eq(programDiscussions.id, discussionId)
        });

        if (!discussion) {
            throw new Error('Discussion not found');
        }

        if (discussion.userId !== userId) {
            throw new Error('Not authorized to delete this discussion');
        }

        // Delete the discussion (cascade will delete replies)
        const [deleted] = await db.delete(programDiscussions)
            .where(eq(programDiscussions.id, discussionId))
            .returning();

        return deleted;
    },

    // Vote on a poll
    async votePoll(discussionId: number, userId: string, optionIds: string[]) {
        const discussion = await db.query.programDiscussions.findFirst({
            where: eq(programDiscussions.id, discussionId)
        });

        if (!discussion) throw new Error('Discussion not found');

        const metadata = discussion.metadata as any;
        if (!metadata || !metadata.options) throw new Error('Not a poll');

        // Update votes
        const updatedOptions = metadata.options.map((opt: any) => {
            const currentVoters = Array.isArray(opt.voterIds) ? opt.voterIds : [];
            const newVoterIds = currentVoters.filter((id: string) => id !== userId); // Remove user

            if (optionIds.includes(opt.id)) {
                newVoterIds.push(userId); // Add user back if selected
            }
            return { ...opt, voterIds: newVoterIds };
        });

        const updatedMetadata = { ...metadata, options: updatedOptions };

        const [updated] = await db
            .update(programDiscussions)
            .set({ metadata: updatedMetadata, updatedAt: new Date() })
            .where(eq(programDiscussions.id, discussionId))
            .returning();

        // Return with user details for UI update
        return await db.query.programDiscussions.findFirst({
            where: eq(programDiscussions.id, updated.id),
            with: {
                user: {
                    with: {
                        employee: true
                    }
                }
            }
        });
    },

    // Get Intelligence Report for a program
    async getIntelligenceReport(programId: number) {
        // Get all discussions from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const allDiscussions = await db.query.programDiscussions.findMany({
            where: eq(programDiscussions.programId, programId),
            with: {
                user: {
                    with: {
                        employee: true
                    }
                }
            },
            orderBy: [desc(programDiscussions.createdAt)]
        });

        // Filter today's discussions
        const todayDiscussions = allDiscussions.filter(d =>
            d.createdAt && new Date(d.createdAt) >= today
        );

        // Count discussions per department
        const deptActivity: Record<string, number> = {};
        const deptUsers: Record<string, Set<string>> = {};

        allDiscussions.forEach(d => {
            const dept = d.user?.employee?.department || 'Unknown';
            deptActivity[dept] = (deptActivity[dept] || 0) + 1;

            if (!deptUsers[dept]) deptUsers[dept] = new Set();
            deptUsers[dept].add(d.userId);
        });

        // Get most active department
        const departments = Object.entries(deptActivity)
            .sort((a, b) => b[1] - a[1]);

        const mostActive = departments[0];
        const secondActive = departments[1];

        // Calculate collaboration level based on department diversity
        const totalDepts = Object.keys(deptActivity).length;
        const totalDiscussions = allDiscussions.length;
        const todayCount = todayDiscussions.length;

        let collaborationLevel: 'high' | 'medium' | 'low' = 'low';
        if (totalDepts >= 3 && todayCount >= 5) {
            collaborationLevel = 'high';
        } else if (totalDepts >= 2 && todayCount >= 2) {
            collaborationLevel = 'medium';
        }

        // Get recent activity (last 3 unique actions)
        const recentActivity: string[] = [];
        const seenDepts = new Set<string>();

        for (const d of allDiscussions.slice(0, 10)) {
            const dept = d.user?.employee?.department;
            const userName = d.user?.name?.split(' ')[0] || 'Someone';

            if (dept && !seenDepts.has(dept) && recentActivity.length < 3) {
                recentActivity.push(`${userName} (${dept}) posted an update`);
                seenDepts.add(dept);
            }
        }

        // Generate summary message
        let summary = '';

        if (totalDiscussions === 0) {
            summary = 'No discussions yet. Start a conversation to get collaboration insights.';
        } else {
            const collabText = collaborationLevel === 'high'
                ? 'Collaboration is high today.'
                : collaborationLevel === 'medium'
                    ? 'Collaboration is moderate.'
                    : 'Collaboration is getting started.';

            if (mostActive) {
                summary = `${collabText} ${mostActive[0]} is leading with ${mostActive[1]} message${mostActive[1] > 1 ? 's' : ''}.`;

                if (secondActive && secondActive[1] > 0) {
                    summary += ` ${secondActive[0]} follows with ${secondActive[1]} message${secondActive[1] > 1 ? 's' : ''}.`;
                }
            } else {
                summary = collabText;
            }

            if (todayCount > 0) {
                summary += ` ${todayCount} new update${todayCount > 1 ? 's' : ''} today.`;
            }
        }

        return {
            summary,
            collaborationLevel,
            totalDiscussions,
            todayCount,
            departmentActivity: departments.map(([dept, count]) => ({
                department: dept,
                count,
                users: deptUsers[dept]?.size || 0
            })),
            recentActivity
        };
    }
};
