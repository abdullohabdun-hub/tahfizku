import { config } from 'dotenv'
config()
import fs from 'fs'
import { isNull, sql, eq } from 'drizzle-orm'
import { db } from '../src/db/index'
import { santri } from '../src/db/schema/index'
import { bangunUrutanHafalan, getAyatTerakhirJuz } from '../src/lib/quranMapper'

async function run() {
  // 1. BACKUP SELURUH TABEL SANTRI
  const allSantri = await db.select().from(santri)
  fs.writeFileSync('santri_backup_before_migration.json', JSON.stringify(allSantri, null, 2))
  console.log('✅ Backup berhasil disimpan ke santri_backup_before_migration.json')

  // 2. MIGRASI
  const affected = await db.select().from(santri).where(
    sql`${santri.posisiTerakhir} IS NULL AND array_length(${santri.juzProgress}, 1) > 0`
  )
  
  if (affected.length === 0) {
    console.log("0 santri ditemukan untuk migrasi.")
    process.exit(0)
  }

  const auditLog = []
  
  for (const s of affected) {
    const urutanAkanDihasilkan = bangunUrutanHafalan(s.juzProgress)
    const posisiAkanDihasilkan = getAyatTerakhirJuz(s.juzProgress[s.juzProgress.length - 1])
    
    auditLog.push({
      id: s.id,
      nama: s.nama,
      juzProgress_saatIni: s.juzProgress,
      before: {
        urutanHafalan: s.urutanHafalan,
        posisiTerakhir: s.posisiTerakhir
      },
      after: {
        urutanHafalan: urutanAkanDihasilkan,
        posisiTerakhir: posisiAkanDihasilkan
      }
    })

    await db.update(santri).set({
      urutanHafalan: urutanAkanDihasilkan,
      posisiTerakhir: posisiAkanDihasilkan
    }).where(eq(santri.id, s.id))
  }

  // Simpan audit log
  fs.writeFileSync('migration_audit_log.json', JSON.stringify(auditLog, null, 2))
  console.log(`✅ Migrasi selesai untuk ${affected.length} santri. Audit log disimpan ke migration_audit_log.json`)

  // 3. POST-VALIDASI
  const remaining = await db.select().from(santri).where(
    sql`${santri.posisiTerakhir} IS NULL AND array_length(${santri.juzProgress}, 1) > 0`
  )
  console.log(`✅ Post-validasi: Tersisa ${remaining.length} baris dengan kondisi posisiTerakhir NULL & juzProgress tidak kosong.`)
  
  process.exit(0)
}

run().catch(err => {
  console.error("Error during migration:", err)
  process.exit(1)
})
