import { db } from '../config/database';
import { transactions, NewTransaction } from '../db/schema/transactions';
import { eq, desc, and } from 'drizzle-orm';

export const transactionService = {
    // Get all transactions for an organization
    getAll: async (orgId: string) => {
        return await db.query.transactions.findMany({
            where: eq(transactions.orgId, orgId),
            orderBy: [desc(transactions.createdAt)],
        });
    },

    create: async (data: NewTransaction) => {
        const [newItem] = await db.insert(transactions).values(data).returning();
        return newItem;
    },

    update: async (id: number, orgId: string, data: Partial<NewTransaction>) => {
        const [updated] = await db.update(transactions)
            .set(data)
            .where(and(eq(transactions.id, id), eq(transactions.orgId, orgId)))
            .returning();
        return updated;
    },

    delete: async (id: number, orgId: string) => {
        await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.orgId, orgId)));
        return true;
    },
};
