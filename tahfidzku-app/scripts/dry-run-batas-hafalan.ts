import { config } from 'dotenv'
config()
import { db } from '../src/db/index'
import { santri } from '../src/db/schema/index'
import { bangunPosisiDariAdminInput } from '../src/lib/quranMapper'

async function run() {
  try {
    const allSantri = await db.select().from(santri)
    
    console.log(`\n=== DRY RUN MIGRATION: UPDATE POSISI TERAKHIR DARI BATAS HAFALAN SAAT INI ===\n`)
    let updatedCount = 0;

    for (const s of allSantri) {
      if (s.batasHafalanJuz !== null || s.batasHafalanSurah !== null || s.batasHafalanAyat !== null) {
        
        const build = bangunPosisiDariAdminInput(s.juzProgress || [], s.batasHafalanJuz, s.batasHafalanSurah, s.batasHafalanAyat);
        
        const oldPos = s.posisiTerakhir ? `${s.posisiTerakhir.surahNomor}:${s.posisiTerakhir.ayat}` : 'NULL';
        const newPos = build.posisiTerakhir ? `${build.posisiTerakhir.surahNomor}:${build.posisiTerakhir.ayat}` : 'NULL';
        
        if (oldPos !== newPos) {
           updatedCount++;
           console.log(`[UBAH] ${s.nama}`)
           console.log(`  Lama: ${oldPos}`)
           console.log(`  Baru: ${newPos}`)
           console.log(`  Input: Juz ${s.batasHafalanJuz}, Surah ${s.batasHafalanSurah}, Ayat ${s.batasHafalanAyat}`)
           console.log(`  juzProgress: ${JSON.stringify(s.juzProgress)}\n`)
        }
      }
    }
    
    console.log(`\nTotal santri yang akan diupdate: ${updatedCount}`)
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()
