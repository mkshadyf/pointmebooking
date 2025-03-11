#!/usr/bin/env node

/**
 * Migration Helper Script for Individual Files
 * 
 * This script helps migrate a single file to use the new core services.
 * Usage: node migrate-file.js <file-path>
 */

const fs = require('fs');
const path = require('path');

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
function processFile(filePath) {
  console.log(`Processing file: ${filePath}`);
  
  // Read the file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
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
    return;
  }
  
  // Create a backup
  const backupPath = `${filePath}.bak`;
  try {
    fs.writeFileSync(backupPath, content);
    console.log(`Backup created at: ${backupPath}`);
  } catch (error) {
    console.error(`Error creating backup: ${error.message}`);
    process.exit(1);
  }
  
  // Write the updated file
  try {
    fs.writeFileSync(filePath, newContent);
    console.log(`File updated with ${changes} changes.`);
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
    process.exit(1);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.log('Usage: node migrate-file.js <file-path>');
    process.exit(1);
  }
  
  const filePath = path.resolve(args[0]);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  // Process the file
  processFile(filePath);
}

// Run the script
main(); 