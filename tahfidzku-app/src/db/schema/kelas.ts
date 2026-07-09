import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { users } from './users'

export const kelas = pgTable('kelas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  nama: varchar('nama', { length: 255 }).notNull(),
  ustadzId: uuid('ustadz_id').references(() => users.id, { onDelete: 'set null' }), // Penanggung jawab halaqoh
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
