import { db } from './src/db'; 
import { users } from './src/db/schema'; 
import { eq, or } from 'drizzle-orm';
import { normalisasiEmail, normalisasiNoWa, normalisasiUsername } from './src/lib/string-utils';

async function main() { 
  const identifier = '082116108180'; // Ustadz Fahmi's number
  const [user] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, normalisasiEmail(identifier)),
        eq(users.noWa, normalisasiNoWa(identifier)),
        eq(users.username, normalisasiUsername(identifier))
      )
    )
    .limit(1);
    
  console.log('LOGGED IN USER:', user); 
  process.exit(0); 
} 
main();
