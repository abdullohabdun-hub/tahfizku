import { pgTable, uuid, timestamp, date, uniqueIndex, pgEnum, text, jsonb } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { kelas } from './kelas'
import { santri } from './santri'
import { users } from './users'

export const statusAbsensiEnum = pgEnum('status_absensi', [
  'hadir', 'izin', 'sakit', 'alpa', 'terlambat'
])

export const sesiKelas = pgTable('sesi_kelas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  kelasId: uuid('kelas_id').notNull().references(() => kelas.id, { onDelete: 'cascade' }),
  tanggal: date('tanggal').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqSesi: uniqueIndex('uniq_sesi_kelas_tanggal').on(table.kelasId, table.tanggal),
}))

export const absensi = pgTable('absensi', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  sesiKelasId: uuid('sesi_kelas_id').notNull().references(() => sesiKelas.id, { onDelete: 'cascade' }),
  santriId: uuid('santri_id').notNull().references(() => santri.id, { onDelete: 'cascade' }),
  status: statusAbsensiEnum('status').notNull(),
  catatan: text('catatan'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  previousData: jsonb('previous_data'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
}, (table) => ({
  uniqAbsensi: uniqueIndex('uniq_absensi_santri_sesi').on(table.santriId, table.sesiKelasId),
}))
