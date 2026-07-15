import 'dotenv/config';
import { db } from './src/db';
import { users } from './src/db/schema';
import { normalisasiEmail, normalisasiUsername, normalisasiNoWa } from './src/lib/string-utils';

async function main() {
  console.log('--- DRY RUN MIGRASI IDENTITAS (MOVE STRATEGY) ---');
  
  const allUsers = await db.select({
    id: users.id,
    role: users.role,
    nama: users.nama,
    emailLama: users.email
  }).from(users);

  const dryRunResults = allUsers.map(user => {
    let oldVal = user.emailLama || '';
    let newVal = { username: null as string | null, email: null as string | null, noWa: null as string | null };

    // 1. Jika mengandung '@' -> email
    if (oldVal.includes('@')) {
      newVal.email = normalisasiEmail(oldVal);
    }
    // 2. Jika hanya berisi angka, spasi, strip, plus -> noWa
    else if (/^[\d\s\-+]+$/.test(oldVal)) {
      newVal.noWa = normalisasiNoWa(oldVal);
    }
    // 3. Teks bebas
    else {
      if (user.role === 'admin' || user.role === 'ustadz') {
        newVal.username = normalisasiUsername(oldVal);
      } else {
        // Untuk santri/wali yang bukan email/noWa (meskipun aneh), terpaksa ditandai / disimpan manual 
        // tapi di plan kita sebutkan wali/santri tidak punya username, jadi kita mungkin simpan ke username 
        // sementara untuk direview, atau biarkan di email dan kasih tanda?
        // Sesuai plan: santri dengan teks bebas akan masuk ke username TAPI untuk ditandai manual
        newVal.username = normalisasiUsername(oldVal) + ' (NEEDS REVIEW)';
      }
    }

    return {
      nama: user.nama,
      role: user.role,
      oldEmailColumn: oldVal,
      newUsername: newVal.username,
      newEmail: newVal.email,
      newNoWa: newVal.noWa
    };
  });

  console.table(dryRunResults);
  
  const adaYangMasihDiEmailBukanEmail = dryRunResults.some(r => r.newEmail && !r.newEmail.includes('@'));
  if (adaYangMasihDiEmailBukanEmail) {
    console.log('\n❌ WARNING: Ada row yang masuk ke newEmail tapi bukan format email valid!');
  } else {
    console.log('\n✅ Cek integritas: Semua yang masuk ke kolom newEmail adalah email valid.');
  }

  process.exit(0);
}
main();
