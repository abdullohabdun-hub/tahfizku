import 'dotenv/config';
import { db } from './src/db';
import { users } from './src/db/schema';

async function main() {
  const allUsers = await db.select({ id: users.id, role: users.role, email: users.email, nama: users.nama }).from(users);
  console.log(JSON.stringify(allUsers, null, 2));
  process.exit(0);
}
main();
