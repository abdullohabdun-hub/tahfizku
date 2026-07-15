// src/db/schema/impersonation.ts
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { users } from './users'

export const impersonationTargetRoleEnum = pgEnum('impersonation_target_role', ['ustadz', 'santri', 'wali'])

export const impersonationLogs = pgTable('impersonation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  adminId: uuid('admin_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  targetRole: impersonationTargetRoleEnum('target_role').notNull(),
  targetId: varchar('target_id', { length: 255 }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
})
