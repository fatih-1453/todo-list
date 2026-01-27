import { pgTable, text, serial, timestamp, integer } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const bigData = pgTable('big_data', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    entryType: text('entry_type').default('Retail'), // 'Retail' or 'Canvassing'
    name: text('name').notNull(), // Donor Name
    email: text('email'),
    phone: text('phone'), // Donor Phone
    address: text('address'),
    province: text('province'),
    district: text('district'),
    coordinate: text('coordinate'), // Lat, Long
    landmark: text('landmark'), // Patokan

    // Retail Specifics (some shared)
    category: text('category'), // Retail: Kenclong/Donasi/Qris. 
    placeName: text('place_name'), // Nama Tempat
    boxType: text('box_type'), // Jenis Kotak
    officerName: text('officer_name'), // Nama Petugas

    // Canvassing Specifics
    donorType: text('donor_type'), // Individu/Masjid/etc.
    donorSubType: text('donor_sub_type'), // Masjid: Komplek/Perusahaan/etc. Sekolah: SD/SMP/etc.
    program: text('program'), // Qurban/Ramadhan/etc.

    // Process/Result
    result: text('result'), // Visit Result: Closing/Reschedule/etc.
    confirmationType: text('confirmation_type'), // Email/HP if result is Konfirmasi

    status: text('status').default('New'),
    source: text('source'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type BigData = typeof bigData.$inferSelect;
export type NewBigData = typeof bigData.$inferInsert;
