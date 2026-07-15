import { config } from 'dotenv'
config()
import { db } from './src/db/index'
import { santri } from './src/db/schema/index'
import { like } from 'drizzle-orm'

async function run() {
  const s = await db.select().from(santri).where(like(santri.nama, '%Hendri%'))
  console.log(JSON.stringify(s, null, 2))
  process.exit(0)
}
run()
