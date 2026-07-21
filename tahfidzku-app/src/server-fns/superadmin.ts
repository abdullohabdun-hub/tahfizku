// src/server-fns/superadmin.ts
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ⚠️  PERINGATAN KEAMANAN — BACA SEBELUM MENGUBAH FILE INI  ⚠️   ║
// ║                                                                  ║
// ║  QUERY DI FILE INI SENGAJA TIDAK DI-SCOPE PER TENANT.           ║
// ║  INI ADALAH SATU-SATUNYA FILE DI SELURUH CODEBASE YANG          ║
// ║  DIIZINKAN MEMBACA DATA LINTAS TENANT.                           ║
// ║                                                                  ║
// ║  ❌ JANGAN COPY POLA QUERY INI KE FILE LAIN.                     ║
// ║  ❌ JANGAN HAPUS/LEMAHKAN requireSuperAdmin() DI BAWAH.          ║
// ╚══════════════════════════════════════════════════════════════════╝
import { createServerFn } from '@tanstack/react-start'
import { eq, desc, ne, sql, count, gte, and, inArray } from 'drizzle-orm'
import { db } from '../db'
import { tenants, santri, setoran, billingLogs } from '../db/schema'
import { getAuthSession, requireSuperAdmin } from '../middleware/auth.middleware'
import { success, error, handleError } from '../lib/response'
import { z } from 'zod'
export const getSuperAdminStats = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const session = await getAuthSession()
      requireSuperAdmin(session)
      const allTenants = await db.select({ status: tenants.status, count: count(tenants.id) })
      .from(tenants)
      .where(ne(tenants.slug, '_system'))
      .groupBy(tenants.status)
      let aktif = 0, trial = 0, suspend = 0
      allTenants.forEach(t => {
        if (t.status === 'aktif') aktif = t.count
        else if (t.status === 'trial') trial = t.count
        else if (t.status === 'suspend') suspend = t.count
      })
      const totalLembaga = aktif + trial + suspend
      const [santriData] = await db.select({ total: count(santri.id) }).from(santri)
      const hariIni = new Date()
      hariIni.setHours(0, 0, 0, 0)
      const [setoranData] = await db.select({ total: count(setoran.id) }).from(setoran).where(gte(setoran.createdAt, hariIni))
      return success({ totalLembaga, aktif, trial, suspend, totalSantri: santriData.total, setoranHariIni: setoranData.total }, 'Berhasil mengambil statistik')
    } catch (error) {
      return handleError(error)
    }
  })
export const getAllTenants = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const session = await getAuthSession()
      requireSuperAdmin(session)
      const listTenants = await db.select({ id: tenants.id, namaLembaga: tenants.namaLembaga, slug: tenants.slug, status: tenants.status, trialEndsAt: tenants.trialEndsAt, createdAt: tenants.createdAt, lastActiveAt: tenants.lastActiveAt })
      .from(tenants)
      .where(ne(tenants.slug, '_system'))
      .orderBy(desc(tenants.createdAt))
      return success(listTenants, 'Berhasil mengambil daftar lembaga')
    } catch (error) {
      return handleError(error)
    }
  })
const tenantDetailSchema = z.object({ tenantId: z.string().uuid() })
export const getTenantDetail = createServerFn({ method: 'GET' })
  .validator(tenantDetailSchema)
  .handler(async ({ data }) => {
    try {
      const session = await getAuthSession()
      requireSuperAdmin(session)
      const [tenantInfo] = await db.select().from(tenants).where(eq(tenants.id, data.tenantId)).limit(1)
      if (!tenantInfo) return error('NOT_FOUND', 'Lembaga tidak ditemukan')
      if (tenantInfo.slug === '_system') return error('FORBIDDEN', 'Lembaga dengan ID Sistem (tahfidzku) tidak bisa dikelola dari panel ini.')
      const [santriData] = await db.select({ total: count(santri.id) }).from(santri).where(eq(santri.tenantId, data.tenantId))
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const [setoranData] = await db.select({ total: count(setoran.id) }).from(setoran).where(and(eq(setoran.tenantId, data.tenantId), gte(setoran.createdAt, thirtyDaysAgo)))
      const logs = await db.select().from(billingLogs).where(eq(billingLogs.tenantId, data.tenantId)).orderBy(desc(billingLogs.createdAt))
      return success({ tenant: tenantInfo, stats: { totalSantri: santriData.total, setoran30Hari: setoranData.total }, logs }, 'Berhasil mengambil detail lembaga')
    } catch (error) {
      return handleError(error)
    }
  })
const updateStatusSchema = z.object({ tenantId: z.string().uuid(), status: z.enum(['trial', 'aktif', 'suspend']), catatan: z.string().optional() })
export const updateTenantStatus = createServerFn({ method: 'POST' })
  .validator(updateStatusSchema)
  .handler(async ({ data }) => {
    try {
      const session = await getAuthSession()
      requireSuperAdmin(session)
      const [current] = await db.select({ status: tenants.status, slug: tenants.slug }).from(tenants).where(eq(tenants.id, data.tenantId)).limit(1)
      if (!current) return error('NOT_FOUND', 'Lembaga tidak ditemukan')
      if (current.slug === '_system') return error('FORBIDDEN', 'Status lembaga sistem tidak dapat diubah.')
      await db.update(tenants).set({ status: data.status }).where(eq(tenants.id, data.tenantId))
      let action: 'aktifkan' | 'suspend' | 'perpanjang_trial' = 'aktifkan'
      if (data.status === 'suspend') action = 'suspend'
      else if (data.status === 'trial') action = 'perpanjang_trial'
      await db.insert(billingLogs).values({ tenantId: data.tenantId, action, statusBefore: current.status, statusAfter: data.status, catatan: data.catatan })
      return success({ success: true }, 'Berhasil memperbarui status')
    } catch (error) {
      return handleError(error)
    }
  })
const updateInfoSchema = z.object({ tenantId: z.string().uuid(), email: z.string().email().optional().or(z.literal('')), noWa: z.string().optional(), catatan: z.string().optional() })
export const updateTenantInfo = createServerFn({ method: 'POST' })
  .validator(updateInfoSchema)
  .handler(async ({ data }) => {
    try {
      const session = await getAuthSession()
      requireSuperAdmin(session)
      const [current] = await db.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.id, data.tenantId)).limit(1)
      if (!current) return error('NOT_FOUND', 'Lembaga tidak ditemukan')
      if (current.slug === '_system') return error('FORBIDDEN', 'Informasi lembaga sistem tidak dapat diubah.')
      await db.update(tenants).set({ email: data.email || null, noWa: data.noWa || null, catatan: data.catatan || null }).where(eq(tenants.id, data.tenantId))
      return success({ success: true }, 'Berhasil memperbarui informasi lembaga')
    } catch (error) {
      return handleError(error)
    }
  })

// ════════════════════════════════════════════════════════
// 4. CLEANUP GHOST TENANTS (Tenants without any users)
// ════════════════════════════════════════════════════════
export const cleanupGhostTenants = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      const session = await getAuthSession()
      requireSuperAdmin(session)

      const _systemTenantId = '7fae19f0-fd8f-4049-9f16-46e1a762f5e3'
      
      const ghostTenants = await db
        .select({ id: tenants.id, namaLembaga: tenants.namaLembaga })
        .from(tenants)
        .where(
          and(
            ne(tenants.id, _systemTenantId),
            sql`${tenants.id} NOT IN (SELECT tenant_id FROM users)`
          )
        )

      if (ghostTenants.length === 0) {
        return success({ deletedCount: 0 }, 'Tidak ada tenant hantu (0 user) yang ditemukan.')
      }

      const ghostIds = ghostTenants.map(t => t.id)
      
      await db.delete(tenants).where(inArray(tenants.id, ghostIds))

      console.log(`✅ Superadmin mem-purge ${ghostIds.length} tenant hantu.`)

      return success({ deletedCount: ghostIds.length, deletedTenants: ghostTenants }, `Berhasil menghapus ${ghostIds.length} tenant hantu.`)
    } catch (err) {
      console.error('❌ Superadmin Cleanup Error:', err)
      return handleError(err)
    }
  })
