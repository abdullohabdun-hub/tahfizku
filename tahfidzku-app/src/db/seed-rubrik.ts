import 'dotenv/config'
import { db } from './index'
import { tenants, rubrikPenilaian, rubrikOpsi } from './schema'
import { eq, and, ne } from 'drizzle-orm'

const isDryRun = process.argv.includes('--dry-run')

async function main() {
  console.log(`\n=== BACKFILL RUBRIK DEFAULT ${isDryRun ? '(DRY RUN)' : ''} ===`)
  
  const allTenants = await db
    .select({ id: tenants.id, namaLembaga: tenants.namaLembaga })
    .from(tenants)
    .where(ne(tenants.slug, '_system'))
  console.log(`Menemukan ${allTenants.length} lembaga untuk diperiksa.`)

  const tenantDiproses: string[] = []
  const tenantDiSkip: string[] = []

  for (const t of allTenants) {
    if (isDryRun) {
      // Cek apakah rubrik 'kualitas' sudah ada
      const [existing] = await db
        .select({ id: rubrikPenilaian.id })
        .from(rubrikPenilaian)
        .where(and(eq(rubrikPenilaian.tenantId, t.id), eq(rubrikPenilaian.key, 'kualitas')))
        .limit(1)

      if (existing) {
        tenantDiSkip.push(t.namaLembaga)
      } else {
        tenantDiproses.push(t.namaLembaga)
      }
      continue
    }

    // Eksekusi nyata dengan pola catch-conflict
    try {
      const [newRubrik] = await db.insert(rubrikPenilaian).values({
        tenantId: t.id,
        key: 'kualitas',
        label: 'Kualitas Hafalan',
        urutan: 1,
        aktif: true
      }).returning({ id: rubrikPenilaian.id })

      // Insert opsi default
      await db.insert(rubrikOpsi).values([
        { rubrikId: newRubrik.id, value: 'lancar', label: 'Lancar', urutan: 1 },
        { rubrikId: newRubrik.id, value: 'mengulang', label: 'Mengulang', urutan: 2 },
        { rubrikId: newRubrik.id, value: 'terbata', label: 'Terbata-bata', urutan: 3 },
      ])

      tenantDiproses.push(t.namaLembaga)
    } catch (err: any) {
      // Tangkap error duplikat (Postgres 23505) atau DrizzleQueryError yang membungkusnya
      const isDuplicate = err.code === '23505' || err?.cause?.code === '23505'
      if (isDuplicate) {
        tenantDiSkip.push(t.namaLembaga)
      } else {
        console.error(`Gagal memproses tenant ${t.namaLembaga}:`, err)
        throw err
      }
    }
  }

  console.log('\n--- RINGKASAN ---')
  console.log(`Lembaga yang AKAN/SUDAH DIBERI seed default (${tenantDiproses.length}):`)
  tenantDiproses.forEach(n => console.log(` - ${n}`))
  
  console.log(`\nLembaga yang DI-SKIP karena sudah punya (${tenantDiSkip.length}):`)
  tenantDiSkip.forEach(n => console.log(` - ${n}`))

  if (isDryRun) {
    console.log('\n⚠️ INI HANYA DRY RUN. Tidak ada data yang disimpan ke database.')
  } else {
    console.log('\n✅ Backfill Selesai.')
  }
  
  process.exit(0)
}

main().catch(console.error)
