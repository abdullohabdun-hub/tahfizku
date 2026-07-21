import 'dotenv/config';
import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function runMigration() {
  try {
    const filename = process.argv[2];
    if (!filename) {
      console.error('Usage: tsx scripts/run-migration.ts <migration_file_path>');
      process.exit(1);
    }
    const fileContent = fs.readFileSync(filename, 'utf8');
    const statements = fileContent.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement [${i + 1}/${statements.length}]:`, stmt.substring(0, 50) + '...');
      try {
        await db.execute(sql.raw(stmt));
        console.log('✅ Success');
      } catch (e: any) {
        if (e.message && e.message.includes('already exists')) {
          console.log('⚠️ Already exists (Skipping safely)');
        } else {
          console.error(`❌ FATAL ERROR on statement [${i + 1}/${statements.length}]:`);
          console.error(e);
          console.error('MIGRATION HALTED.');
          process.exit(1); // FAIL FAST
        }
      }
    }
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (e: any) {
    console.error('Migration script failed:', e);
    process.exit(1);
  }
}
runMigration();
