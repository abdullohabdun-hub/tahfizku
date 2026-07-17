import { relations } from 'drizzle-orm'
import { tenants } from './tenants'
import { users } from './users'
import { kelas } from './kelas'
import { santri } from './santri'
import { setoran } from './setoran'
import { ujian } from './ujian'
import { impersonationLogs } from './impersonation'

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  kelas: many(kelas),
  santri: many(santri),
  setoran: many(setoran),
  ujian: many(ujian),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  kelasDiampu: many(kelas), // Sebagai Ustadz
  setoranDiterima: many(setoran), // Sebagai Ustadz
  santriTerkait: one(santri, { // Untuk role wali/santri
    fields: [users.santriId],
    references: [santri.id],
  }),
}))

export const kelasRelations = relations(kelas, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [kelas.tenantId],
    references: [tenants.id],
  }),
  ustadz: one(users, {
    fields: [kelas.ustadzId],
    references: [users.id],
  }),
  santri: many(santri),
}))

export const santriRelations = relations(santri, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [santri.tenantId],
    references: [tenants.id],
  }),
  kelas: one(kelas, {
    fields: [santri.kelasId],
    references: [kelas.id],
  }),
  setoran: many(setoran),
  ujian: many(ujian),
  akun: many(users), // Akun wali / santri yang terhubung ke santri ini
}))

export const setoranRelations = relations(setoran, ({ one }) => ({
  tenant: one(tenants, {
    fields: [setoran.tenantId],
    references: [tenants.id],
  }),
  santri: one(santri, {
    fields: [setoran.santriId],
    references: [santri.id],
  }),
  ustadz: one(users, {
    fields: [setoran.ustadzId],
    references: [users.id],
  }),
}))

export const ujianRelations = relations(ujian, ({ one }) => ({
  tenant: one(tenants, {
    fields: [ujian.tenantId],
    references: [tenants.id],
  }),
  santri: one(santri, {
    fields: [ujian.santriId],
    references: [santri.id],
  }),
  ustadz: one(users, {
    fields: [ujian.ustadzId],
    references: [users.id],
  }),
}))

export const impersonationLogsRelations = relations(impersonationLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [impersonationLogs.tenantId],
    references: [tenants.id],
  }),
  admin: one(users, {
    fields: [impersonationLogs.adminId],
    references: [users.id],
  }),
}))

