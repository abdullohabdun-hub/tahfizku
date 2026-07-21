import { pgTable, uuid, varchar, timestamp, pgEnum, time } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { tenants } from './tenants'
import { users } from './users'

export const hariEnum = pgEnum('hari', [
  'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'
])

export const kelas = pgTable('kelas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  nama: varchar('nama', { length: 255 }).notNull(),
  ustadzId: uuid('ustadz_id').references(() => users.id, { onDelete: 'set null' }), // Penanggung jawab halaqoh
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  hariPertemuan: hariEnum('hari_pertemuan').array().notNull().default(sql`'{}'::hari[]`),
  jamMulai: time('jam_mulai'),
  jamSelesai: time('jam_selesai'),
})
