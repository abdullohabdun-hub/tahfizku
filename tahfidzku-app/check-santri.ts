import { db } from './src/db'; 
import { santri } from './src/db/schema'; 

async function main() { 
  const s = await db.select().from(santri); 
  console.log('SANTRI:', s); 
  process.exit(0); 
} 
main();
