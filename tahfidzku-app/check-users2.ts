import { db } from './src/db'; 
import { users, kelas } from './src/db/schema'; 

async function main() { 
  const u = await db.select().from(users); 
  console.log('USERS:', u); 
  const k = await db.select().from(kelas); 
  console.log('KELAS:', k); 
  process.exit(0); 
} 
main();
