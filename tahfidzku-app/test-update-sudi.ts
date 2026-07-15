import { config } from 'dotenv'
config()
import { updateSantri } from './src/server-fns/santri'

async function run() {
  try {
    const res = await updateSantri({
      data: {
        id: "87d9a3ab-d4a8-4243-9d6d-5df9e0932c74", // Sudi Arif ID from earlier audit log
        nama: "Sudi Arif updated",
        targetJuz: 30,
        juzProgress: [30, 29],
        batasHafalanJuz: 29,
        batasHafalanSurah: "Al-Jinn",
        batasHafalanAyat: 28,
        tipe: "reguler"
      }
    })
    console.log("Update Success:", res)
  } catch (e) {
    console.error("Update Failed:", e)
  }
}

run()
