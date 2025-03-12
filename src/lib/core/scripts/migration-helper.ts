/**
 * Migration Helper Script
 * 
 * This script helps identify files that need to be updated to use the new core services.
 * It can be run with `npx ts-node src/lib/core/scripts/migration-helper.ts`
 */

// @ts-nocheck
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to search for
const patterns = {
  authFeedback: /import.*from.*['"](\.\.\/|@\/)lib\/auth\/authFeedback['"]/,
  errorLogger: /import.*from.*['"](\.\.\/|@\/)lib\/error\/error-logger['"]/,
  useToast: /import.*useToast.*from.*['"](\.\.\/|@\/)hooks\/ui\/useToast['"]/,
  withAuthFeedback: /withAuthFeedback/,
  logError: /logError\(/,
  showToast: /showToast\(/,
  authServiceImport: /import.*\{\s*AuthService\s*\}.*from.*['"](\.\.\/|@\/)lib\/supabase\/services\/auth\/auth\.service['"]/,
  authService: /authService\./,
};

// Replacement suggestions
const replacements = {
  authFeedback: "import { useAuth } from '@/lib/supabase/auth/context/AuthContext';",
  errorLogger: "import { convertToAuthError } from '@/lib/error/auth-error-utils';",
  useToast: "import { ToastService } from '@/lib/core/toast';",
  withAuthFeedback: "// Replace withAuthFeedback with useAuth() hook methods",
  logError: "console.error",
  showToast: "ToastService.success/error/warning/info",
  authServiceImport: "import { authService } from '@/lib/supabase/services/auth/auth.service';",
  authService: "authService",
};

// For compatibility during transition
const compatReplacements = {
  authFeedback: "import { compat } from '@/lib/core';",
  errorLogger: "import { compat } from '@/lib/core';",
  withAuthFeedback: "compat.withAuthFeedback",
  logError: "compat.logError",
  showToast: "compat.showToast",
  authServiceImport: "import { authService } from '@/lib/supabase/services/auth/auth.service';",
  authService: "authService",
};

// Find files that need to be updated
function findFilesToUpdate(rootDir) {
  const files = glob.sync(`${rootDir}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  });

  const results = {
    authFeedback: [],
    errorLogger: [],
    useToast: [],
    withAuthFeedback: [],
    logError: [],
    showToast: [],
    authServiceImport: [],
    authService: [],
  };

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    
    Object.entries(patterns).forEach(([key, pattern]) => {
      if (pattern.test(content)) {
        results[key].push(file);
      }
    });
  });

  // Print results
  console.log('Files that need to be updated:');
  console.log('==============================\n');

  Object.entries(results).forEach(([key, files]) => {
    if (files.length > 0) {
      console.log(`\n${key} (${files.length} files):`);
      console.log('------------------');
      console.log('Suggested replacement:');
      console.log(`  ${replacements[key]}`);
      console.log('Or for compatibility during transition:');
      console.log(`  ${compatReplacements[key]}`);
      console.log('\nFiles:');
      files.forEach((file) => {
        console.log(`  - ${file}`);
      });
      console.log('\n');
    }
  });
}

// Run the script
const rootDir = path.resolve(__dirname, '../../../');
findFilesToUpdate(rootDir);

console.log('Migration steps:');
console.log('1. Update imports to use the new core services or compatibility layer');
console.log('2. Replace function calls with the new service methods');
console.log('3. Replace AuthService.getInstance() with authService singleton');
console.log('4. Test thoroughly before removing old modules');
console.log('\nSee the authentication consolidation progress at AUTH_CONSOLIDATION_PROGRESS.md for more details.'); 