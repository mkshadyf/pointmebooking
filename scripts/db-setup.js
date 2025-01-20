import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET
);

async function runMigrations() {
  console.log('Running migrations...');
  const migrationsDir = join(__dirname, '../supabase/migrations');
  const migrationFiles = readdirSync(migrationsDir).sort();

  for (const file of migrationFiles) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const migration = readFileSync(join(migrationsDir, file), 'utf8');
      const { error } = await supabase.sql(migration);
      if (error) {
        console.error(`Error running migration ${file}:`, error);
        process.exit(1);
      }
    }
  }
  console.log('Migrations completed successfully');
}

async function runSeeds() {
  console.log('Running seeds...');
  const seedFile = join(__dirname, '../supabase/seed.sql');
  const seed = readFileSync(seedFile, 'utf8');
  const { error } = await supabase.sql(seed);
  if (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
  console.log('Seeds completed successfully');
}

async function main() {
  try {
    await runMigrations();
    await runSeeds();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

main();
