import { config } from 'dotenv'
config()
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './src/db/schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle({ client: pool, schema })

async function run() {
  try {
    await db.transaction(async (tx) => {
      const users = await tx.select().from(schema.users).limit(1)
      console.log("Transaction works! Users count:", users.length)
    })
    process.exit(0)
  } catch (e) {
    console.error("Error:", e)
    process.exit(1)
  }
}

run()
