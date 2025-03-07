#!/usr/bin/env ts-node
/**
 * Migration Script
 * 
 * This script helps migrate the application from the old Pages Router to the App Router.
 * It also helps migrate from duplicated types and constants to the unified structure.
 * 
 * Usage:
 * ```
 * npx ts-node src/scripts/migrate.ts
 * ```
 */
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Paths
const PAGES_DIR = path.resolve(process.cwd(), 'src/pages');
const APP_DIR = path.resolve(process.cwd(), 'src/app');

// Migration steps
interface MigrationStep {
  name: string;
  description: string;
  check: () => boolean;
  execute: () => void;
}

/**
 * Check if a directory exists
 */
function directoryExists(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Count files in a directory (recursively)
 */
function countFiles(dirPath: string): number {
  if (!directoryExists(dirPath)) return 0;
  
  let count = 0;
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      count += countFiles(itemPath);
    } else if (stats.isFile()) {
      count++;
    }
  }
  
  return count;
}

/**
 * Migration steps
 */
const migrationSteps: MigrationStep[] = [
  {
    name: 'Check Routing Structure',
    description: 'Check if the application is using both Pages Router and App Router',
    check: () => directoryExists(PAGES_DIR) && directoryExists(APP_DIR),
    execute: () => {
      const pagesCount = countFiles(PAGES_DIR);
      const appCount = countFiles(APP_DIR);
      
      console.log(chalk.yellow(`Found ${pagesCount} files in Pages Router and ${appCount} files in App Router.`));
      console.log(chalk.yellow('The application is using both routing systems, which can cause conflicts.'));
      console.log(chalk.blue('Recommendation: Migrate all routes to the App Router and remove the Pages Router.'));
    }
  },
  {
    name: 'Check Constants Structure',
    description: 'Check if constants are properly structured',
    check: () => {
      const entitiesPath = path.resolve(process.cwd(), 'src/constants/entities.ts');
      return !fs.existsSync(entitiesPath);
    },
    execute: () => {
      console.log(chalk.yellow('Constants should be centralized in the constants directory.'));
      console.log(chalk.blue('Recommendation: Move all constants to src/constants/entities.ts and import from there.'));
    }
  },
  {
    name: 'Check Supabase Client Usage',
    description: 'Check if the Supabase client is being used consistently',
    check: () => {
      // This is a simplified check - in reality, we would scan all files
      return true;
    },
    execute: () => {
      console.log(chalk.yellow('Supabase client should be used consistently throughout the application.'));
      console.log(chalk.blue('Recommendation: Use the createSupabaseClient function from src/lib/supabase/client.ts instead of direct imports.'));
    }
  },
  {
    name: 'Check Type Structure',
    description: 'Check if types are properly structured',
    check: () => {
      // This is a simplified check - in reality, we would scan all files
      return true;
    },
    execute: () => {
      console.log(chalk.yellow('Types should be centralized and avoid duplication.'));
      console.log(chalk.blue('Recommendation: Use the types from src/types directory and avoid redefining types.'));
    }
  }
];

/**
 * Run the migration
 */
async function runMigration() {
  console.log(chalk.green('PointMe Migration Tool'));
  console.log(chalk.green('====================='));
  console.log('');
  
  for (const step of migrationSteps) {
    console.log(chalk.cyan(`Step: ${step.name}`));
    console.log(chalk.gray(`- ${step.description}`));
    
    const needsMigration = step.check();
    
    if (needsMigration) {
      console.log(chalk.red('✖ Migration needed'));
      step.execute();
    } else {
      console.log(chalk.green('✓ Already migrated'));
    }
    
    console.log('');
  }
  
  console.log(chalk.green('Migration check completed!'));
  console.log(chalk.yellow('Follow the recommendations above to complete the migration.'));
}

runMigration().catch(console.error); 