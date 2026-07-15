import { config } from 'dotenv'
config()
import { isNull, sql } from 'drizzle-orm'
import { db } from '../src/db/index'
import { santri } from '../src/db/schema/index'
import { bangunUrutanHafalan, getAyatTerakhirJuz } from '../src/lib/quranMapper'

async function run() {
  // Filter: posisiTerakhir IS NULL AND juzProgress punya isi
  const affected = await db.select().from(santri).where(
    sql`${santri.posisiTerakhir} IS NULL AND array_length(${santri.juzProgress}, 1) > 0`
  )
  
  if (affected.length === 0) {
    console.log("DRY RUN: 0 santri ditemukan dengan kondisi posisiTerakhir NULL & juzProgress tidak kosong.")
    process.exit(0)
  }
  
  const results = affected.map(s => {
    const urutanAkanDihasilkan = bangunUrutanHafalan(s.juzProgress)
    const posisiAkanDihasilkan = getAyatTerakhirJuz(s.juzProgress[s.juzProgress.length - 1])
    return {
      id: s.id,
      nama: s.nama,
      juzProgress_saatIni: s.juzProgress,
      urutanHafalan_akanDihasilkan: urutanAkanDihasilkan,
      posisiTerakhir_akanDihasilkan: posisiAkanDihasilkan
    }
  })
  
  console.log(`DRY RUN: Ditemukan ${results.length} santri yang perlu dimigrasi.\n`)
  console.log(JSON.stringify(results, null, 2))
  
  process.exit(0)
}

run().catch(err => {
  console.error("Error during dry run:", err)
  process.exit(1)
})
