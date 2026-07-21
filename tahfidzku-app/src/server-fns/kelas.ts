import { createServerFn } from '@tanstack/react-start'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { kelas } from '../db/schema'
import { getAuthSession, requireRole } from '../middleware/auth.middleware'
import { success, handleError } from '../lib/response'
import { AuthenticationError } from '../lib/errors'

// ==========================================
// KELAS CRUD (ADMIN ONLY)
// ==========================================

export const getKelasList = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const session = await getAuthSession()
      if (!session) throw new AuthenticationError()
      requireRole(session, 'admin')

      const kelasList = await db.query.kelas.findMany({
        where: eq(kelas.tenantId, session.user.tenantId),
        orderBy: [desc(kelas.createdAt)],
        with: {
          ustadz: { columns: { nama: true } }
        }
      })

      const mapped = kelasList.map(k => ({
        id: k.id,
        nama: k.nama,
        ustadzId: k.ustadzId,
        ustadzNama: k.ustadz?.nama || null,
        hariPertemuan: k.hariPertemuan,
        jamMulai: k.jamMulai,
        jamSelesai: k.jamSelesai,
      }))

      return success(mapped, 'Berhasil mengambil daftar kelas')
    } catch (err) {
      return handleError(err)
    }
  }
)

export const createKelas = createServerFn({ method: 'POST' })
  .validator((data: unknown) => z.object({ 
    nama: z.string().min(1, 'Nama kelas wajib diisi'),
    ustadzId: z.string().optional(),
    hariPertemuan: z.array(z.enum(['senin','selasa','rabu','kamis','jumat','sabtu','minggu']))
      .default([])
      .transform(days => [...new Set(days)]),
    jamMulai: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    jamSelesai: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  }).refine(d => {
    if (d.jamMulai && d.jamSelesai) return d.jamSelesai > d.jamMulai
    return true
  }, { message: 'Jam selesai harus lebih akhir dari jam mulai', path: ['jamSelesai'] })
  .parse(data))
  .handler(async ({ data }) => {
    try {
      const session = await getAuthSession()
      if (!session) throw new AuthenticationError()
      requireRole(session, 'admin')

      const newKelas = await db.insert(kelas).values({
        tenantId: session.user.tenantId,
        nama: data.nama,
        ustadzId: data.ustadzId || null,
        hariPertemuan: data.hariPertemuan,
        jamMulai: data.jamMulai || null,
        jamSelesai: data.jamSelesai || null,
      }).returning({ id: kelas.id, nama: kelas.nama })

      return success(newKelas[0], 'Berhasil membuat Kelas/Halaqoh')
    } catch (err) {
      return handleError(err)
    }
  })

export const deleteKelas = createServerFn({ method: 'POST' })
  .validator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const session = await getAuthSession()
      if (!session) throw new AuthenticationError()
      requireRole(session, 'admin')

      await db.delete(kelas).where(and(eq(kelas.id, data.id), eq(kelas.tenantId, session.user.tenantId)))
      return success(null, 'Berhasil menghapus Kelas/Halaqoh')
    } catch (err) {
      return handleError(err)
    }
  })

export const updateKelas = createServerFn({ method: 'POST' })
  .validator((data: unknown) => z.object({ 
    id: z.string(),
    nama: z.string().min(1, 'Nama kelas wajib diisi'),
    ustadzId: z.string().optional().nullable(),
    hariPertemuan: z.array(z.enum(['senin','selasa','rabu','kamis','jumat','sabtu','minggu']))
      .default([])
      .transform(days => [...new Set(days)]),
    jamMulai: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    jamSelesai: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  }).refine(d => {
    if (d.jamMulai && d.jamSelesai) return d.jamSelesai > d.jamMulai
    return true
  }, { message: 'Jam selesai harus lebih akhir dari jam mulai', path: ['jamSelesai'] })
  .parse(data))
  .handler(async ({ data }) => {
    try {
      const session = await getAuthSession()
      if (!session) throw new AuthenticationError()
      requireRole(session, 'admin')

      await db.update(kelas).set({
        nama: data.nama,
        ustadzId: data.ustadzId || null,
        hariPertemuan: data.hariPertemuan,
        jamMulai: data.jamMulai || null,
        jamSelesai: data.jamSelesai || null,
      }).where(and(eq(kelas.id, data.id), eq(kelas.tenantId, session.user.tenantId)))

      return success(null, 'Berhasil menyimpan Kelas/Halaqoh')
    } catch (err) {
      return handleError(err)
    }
  })
