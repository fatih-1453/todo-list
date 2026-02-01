import { pgTable, text, serial, timestamp, integer, numeric } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

    // Transaction Details
    donationMethod: text('donation_method'), // Cara Donasi: Transfer, Tunai
    collectionMethod: text('collection_method'), // Cara Penghimpunan: Komunitas, Individu
    transactionNumber: text('transaction_number').notNull().unique(), // Nomor Transaksi
    date: timestamp('date'), // Tanggal
    amount: numeric('amount', { precision: 15, scale: 2 }).default('0'), // Nominal

    // Classification
    contract: text('contract'), // Akad: Penerimaan Insho Umum
    contractType: text('contract_type'), // Jenis Akad: Penerimaan Shodaqoh Umum
    program: text('program'), // Program: Sosial Kemanusiaan
    programType: text('program_type'), // Jenis Program: Santunan Yatim

    status: text('status').default('Completed'), // Completed, Pending
    notes: text('notes'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
