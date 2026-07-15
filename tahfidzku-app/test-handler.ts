import { config } from 'dotenv'
config()
import { updateSantri } from './src/server-fns/santri'

async function run() {
  const payload = {
    id: "4771ad67-47c5-4134-a106-e47b961a134b", // Hendri's ID
    nama: "Hendri",
    targetJuz: 30,
    juzProgress: [30, 29, 28],
    tipe: "dewasa",
    username: "hendri@test.com"
  }
  
  try {
    // Calling the handler
    console.log("Calling updateSantri handler...")
    const res = await updateSantri({ data: payload } as any)
    console.log("Result:", res)
  } catch (err) {
    console.error("CAUGHT ERROR IN TEST SCRIPT:", err)
  }
}

run()
