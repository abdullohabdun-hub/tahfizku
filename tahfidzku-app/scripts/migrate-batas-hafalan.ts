import { config } from 'dotenv'
config()
import { db } from '../src/db/index'
import { santri } from '../src/db/schema/index'
import { bangunPosisiDariAdminInput } from '../src/lib/quranMapper'
import { eq } from 'drizzle-orm'
import fs from 'fs'

async function run() {
  try {
    const allSantri = await db.select().from(santri)
    
    // Backup
    fs.writeFileSync('santri_backup_batas_hafalan.json', JSON.stringify(allSantri, null, 2))
    
    console.log(`\n=== EKSEKUSI MIGRASI: UPDATE POSISI TERAKHIR DARI BATAS HAFALAN SAAT INI ===\n`)
    let updatedCount = 0;
    const auditLogs = [];

    for (const s of allSantri) {
      if (s.batasHafalanJuz !== null || s.batasHafalanSurah !== null || s.batasHafalanAyat !== null) {
        
        const build = bangunPosisiDariAdminInput(s.juzProgress || [], s.batasHafalanJuz, s.batasHafalanSurah, s.batasHafalanAyat);
        
        const oldPos = s.posisiTerakhir ? `${s.posisiTerakhir.surahNomor}:${s.posisiTerakhir.ayat}` : 'NULL';
        const newPos = build.posisiTerakhir ? `${build.posisiTerakhir.surahNomor}:${build.posisiTerakhir.ayat}` : 'NULL';
        
        if (oldPos !== newPos) {
           await db.update(santri)
             .set({ posisiTerakhir: build.posisiTerakhir, urutanHafalan: build.urutanHafalan })
             .where(eq(santri.id, s.id));

           updatedCount++;
           const log = {
              id: s.id,
              nama: s.nama,
              oldPos,
              newPos,
              input: `Juz ${s.batasHafalanJuz}, Surah ${s.batasHafalanSurah}, Ayat ${s.batasHafalanAyat}`
           }
           auditLogs.push(log)
           console.log(`[SUKSES UPDATE] ${s.nama}`)
        }
      }
    }
    
    fs.writeFileSync('migration_batas_hafalan_audit.json', JSON.stringify(auditLogs, null, 2))
    console.log(`\nTotal santri yang diupdate: ${updatedCount}`)
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()
