import { config } from 'dotenv'
config()
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from './src/db/index'
import { santri, users } from './src/db/schema/index'
import { bangunUrutanHafalan, getAyatTerakhirJuz } from './src/lib/quranMapper'
import { AppError, ValidationError } from './src/lib/errors'

async function run() {
  const payload = {
    id: "4771ad67-47c5-4134-a106-e47b961a134b",
    nama: "Hendri Edit",
    targetJuz: 30,
    juzProgress: [30, 29, 28],
    tipe: "dewasa",
    username: "hendri@test.com"
  }
  
  const tenantId = "7fae19f0-fd8f-4049-9f16-46e1a762f5e3"; // Hardcoded from previous query

  try {
    const schema = z.object({
      id: z.string(),
      nama: z.string().min(1, 'Nama santri wajib diisi'),
      targetJuz: z.number().min(1).max(30),
      juzProgress: z.array(z.number().int().min(1).max(30)).transform(val => Array.from(new Set(val))).default([]),
      batasHafalanJuz: z.number().optional().nullable(),
      batasHafalanSurah: z.string().optional().nullable(),
      batasHafalanAyat: z.number().optional().nullable(),
      kelasId: z.string().optional().nullable(),
      tipe: z.enum(['reguler', 'dewasa']).default('dewasa'),
      username: z.string().optional(),
      password: z.string().optional()
    })

    const data = schema.parse(payload) as any;

    await db.transaction(async (tx) => {
        const [currentSantri] = await tx.select().from(santri).where(eq(santri.id, data.id)).limit(1)
        
        let newPosisiTerakhir = currentSantri?.posisiTerakhir
        let newUrutanHafalan = currentSantri?.urutanHafalan || bangunUrutanHafalan(data.juzProgress)
        
        if (currentSantri?.posisiTerakhir !== null && currentSantri?.posisiTerakhir !== undefined) {
          data.juzProgress = currentSantri.juzProgress || []
        } else {
          if (data.juzProgress.length > 0) {
             newPosisiTerakhir = getAyatTerakhirJuz(data.juzProgress[data.juzProgress.length - 1])
             newUrutanHafalan = bangunUrutanHafalan(data.juzProgress)
          }
        }

        await tx.update(santri).set({
          nama: data.nama,
          targetJuz: data.targetJuz,
          juzProgress: data.juzProgress,
          batasHafalanJuz: data.batasHafalanJuz,
          batasHafalanSurah: data.batasHafalanSurah,
          batasHafalanAyat: data.batasHafalanAyat,
          kelasId: data.kelasId || null,
          tipe: data.tipe,
          posisiTerakhir: newPosisiTerakhir,
          urutanHafalan: newUrutanHafalan,
        }).where(and(eq(santri.id, data.id), eq(santri.tenantId, tenantId)))

        if (data.tipe === 'dewasa') {
          if (!data.username) throw new ValidationError('Username wajib diisi untuk Santri Dewasa')
          
          const existing = await tx.select({ id: users.id }).from(users).where(eq(users.email, data.username))
          const existingUser = existing.find(u => u.id)
          
          const userForSantri = await tx.select({ id: users.id }).from(users).where(eq(users.santriId, data.id))

          if (userForSantri.length > 0) {
            if (existingUser && existingUser.id !== userForSantri[0].id) {
              throw new ValidationError('Username sudah terdaftar')
            }
            const updateData: any = { nama: data.nama, email: data.username }
            if (data.password) updateData.passwordHash = data.password
            await tx.update(users).set(updateData).where(eq(users.id, userForSantri[0].id))
          } else {
            if (!data.password) throw new ValidationError('Password wajib diisi untuk akun baru')
            if (existingUser) throw new ValidationError('Username sudah terdaftar')
            await tx.insert(users).values({
              tenantId,
              nama: data.nama,
              email: data.username,
              passwordHash: data.password,
              role: 'santri',
              santriId: data.id
            })
          }
        }
    })
    
    console.log("SUCCESS!")
  } catch (err: any) {
    console.error("CAUGHT ERROR:", err.stack)
  }
}

run()
