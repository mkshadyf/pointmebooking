#!/usr/bin/env node

/**
 * Batch Migration Helper Script
 * 
 * This script helps migrate multiple files to use the new core services.
 * Usage: node migrate-batch.js <directory-path> [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to search for and their replacements
const replacements = [
  // Auth feedback imports
  {
    pattern: /import\s+\{\s*withAuthFeedback\s*\}\s+from\s+['"](@\/lib|\.\.\/\.\.\/lib)\/auth\/authFeedback['"]/g,
    replacement: "import { compat } from '@/lib/core';"
  },
  // Auth state imports
  {
    pattern: /import\s+\{\s*useAuthState\s*\}\s+from\s+['"](@\/lib|\.\.\/\.\.\/lib)\/auth\/authFeedback['"]/g,
    replacement: "import { useAuthService } from '@/hooks/auth/useAuthService';"
  },
  // Error logger imports
  {
    pattern: /import\s+\{\s*logError\s*\}\s+from\s+['"](@\/lib|\.\.\/\.\.\/lib)\/error\/error-logger['"]/g,
    replacement: "import { ErrorService } from '@/lib/core/error';"
  },
  // withAuthFeedback function calls
  {
    pattern: /withAuthFeedback\(\s*['"]([^'"]+)['"]\s*,\s*async\s*\(\)\s*=>\s*\{/g,
    replacement: "compat.withAuthFeedback('$1', async () => {"
  },
  // logError function calls
  {
    pattern: /logError\(\s*([^,)]+)(?:\s*,\s*['"]([^'"]+)['"])?\s*(?:,\s*\{([^}]*)\})?\s*\)/g,
    replacement: "ErrorService.handleError($1, { context: '$2', additionalData: {$3} })"
  },
  // useAuthState hook usage
  {
    pattern: /const\s+\{\s*isLoading\s*,\s*currentOperation\s*\}\s*=\s*useAuthState\(\)/g,
    replacement: "const authService = useAuthService();\n  const { isLoading, currentOperation } = authService"
  }
];

// Process a file
function processFile(filePath, dryRun = false) {
  console.log(`Processing file: ${filePath}`);
  
  // Read the file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    return false;
  }
  
  // Apply replacements
  let newContent = content;
  let changes = 0;
  
  replacements.forEach(({ pattern, replacement }) => {
    const matches = newContent.match(pattern);
    if (matches) {
      changes += matches.length;
      newContent = newContent.replace(pattern, replacement);
    }
  });
  
  // If no changes were made, exit
  if (changes === 0) {
    console.log('No changes needed for this file.');
    return true;
  }
  
  // If dry run, just report changes
  if (dryRun) {
    console.log(`Would make ${changes} changes to ${filePath}`);
    return true;
  }
  
  // Create a backup
  const backupPath = `${filePath}.bak`;
  try {
    fs.writeFileSync(backupPath, content);
    console.log(`Backup created at: ${backupPath}`);
  } catch (error) {
    console.error(`Error creating backup: ${error.message}`);
    return false;
  }
  
  // Write the updated file
  try {
    fs.writeFileSync(filePath, newContent);
    console.log(`File updated with ${changes} changes.`);
    return true;
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
    return false;
  }
}

// Process a directory
function processDirectory(dirPath, dryRun = false) {
  console.log(`Processing directory: ${dirPath}`);
  
  // Find all TypeScript and TSX files
  const files = glob.sync(`${dirPath}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  });
  
  console.log(`Found ${files.length} files to process.`);
  
  // Process each file
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  
  files.forEach((file) => {
    console.log(`\n--- Processing ${file} ---`);
    const result = processFile(file, dryRun);
    
    if (result === true) {
      succeeded++;
    } else if (result === false) {
      failed++;
    } else {
      skipped++;
    }
  });
  
  // Print summary
  console.log('\n--- Summary ---');
  console.log(`Total files: ${files.length}`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node migrate-batch.js <directory-path> [--dry-run]');
    process.exit(1);
  }
  
  const dirPath = path.resolve(args[0]);
  const dryRun = args.includes('--dry-run');
  
  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory not found: ${dirPath}`);
    process.exit(1);
  }
  
  // Check if it's a directory
  if (!fs.statSync(dirPath).isDirectory()) {
    console.error(`Not a directory: ${dirPath}`);
    process.exit(1);
  }
  
  // Process the directory
  console.log(`Mode: ${dryRun ? 'Dry run' : 'Live'}`);
  processDirectory(dirPath, dryRun);
}

// Run the script
main(); 