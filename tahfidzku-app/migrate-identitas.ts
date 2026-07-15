import 'dotenv/config';
import { db } from './src/db';
import { users } from './src/db/schema';
import { normalisasiEmail, normalisasiUsername, normalisasiNoWa } from './src/lib/string-utils';
import { eq, sql } from 'drizzle-orm';

async function main() {
  console.log('--- EXECUTING SCHEMA UPDATE ---');
  try {
    await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" varchar(255);`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "no_wa" varchar(50);`);
    
    // Catch existing constraints just in case it was partially applied
    await db.execute(sql`ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");`).catch(e => console.log('Constraint users_username_unique exists or skipped'));
    await db.execute(sql`ALTER TABLE "users" ADD CONSTRAINT "users_no_wa_unique" UNIQUE("no_wa");`).catch(e => console.log('Constraint users_no_wa_unique exists or skipped'));
    console.log('Schema updated successfully.');
  } catch (err) {
    console.error('Schema update failed', err);
  }

  console.log('\n--- EXECUTING DATA MIGRATION (MOVE) ---');
  
  const allUsers = await db.select({
    id: users.id,
    role: users.role,
    nama: users.nama,
    emailLama: users.email
  }).from(users);

  for (const user of allUsers) {
    let oldVal = user.emailLama || '';
    if (!oldVal) {
      // It's already null or empty
      continue;
    }

    let newVal = { username: null as string | null, email: null as string | null, noWa: null as string | null };

    if (oldVal.includes('@')) {
      newVal.email = normalisasiEmail(oldVal);
    } else if (/^[\d\s\-+]+$/.test(oldVal)) {
      newVal.noWa = normalisasiNoWa(oldVal);
    } else {
      if (user.role === 'admin' || user.role === 'ustadz') {
        newVal.username = normalisasiUsername(oldVal);
      } else {
        newVal.username = normalisasiUsername(oldVal) + ' (NEEDS REVIEW)';
      }
    }

    await db.update(users)
      .set({
        email: newVal.email,
        username: newVal.username,
        noWa: newVal.noWa
      })
      .where(eq(users.id, user.id));
      
    console.log(`Updated ${user.nama} (${user.role}): ${oldVal} -> email=${newVal.email}, wa=${newVal.noWa}, user=${newVal.username}`);
  }

  console.log('\n✅ Migrasi identitas selesai.');
  process.exit(0);
}
main();
