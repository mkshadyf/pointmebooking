/**
 * Auth Imports Audit Script
 * 
 * This script audits the codebase for imports of the deprecated auth service
 * and suggests replacements with the comprehensive implementation.
 */

const fs = require('fs');
const glob = require('glob');

// Patterns to search for
const PATTERNS = [
  {
    pattern: /from ['"]@\/lib\/core\/auth['"]/g,
    replacement: 'from \'@/lib/supabase/services/auth/auth.service\'',
    description: 'Deprecated core auth import'
  },
  {
    pattern: /import [^;]*AuthService[^;]*from/g,
    replacement: 'import { authService } from',
    description: 'AuthService class import'
  },
  {
    pattern: /AuthService\./g,
    replacement: 'authService.',
    description: 'AuthService static method usage'
  }
];

// Directories to search
const SEARCH_DIRS = ['src/**/*.ts', 'src/**/*.tsx'];

// Files to ignore
const IGNORE_FILES = [
  'src/lib/core/auth/index.ts', // compatibility layer
  'src/lib/core/compat/auth-compat.ts', // compatibility layer
  'src/lib/core/README.md', // documentation
  'src/lib/core/auth/README.md', // documentation
];

// Function to audit imports
function auditImports() {
  // Results storage
  const results = {
    total: 0,
    importReferences: [],
    usageReferences: [],
    files: new Set()
  };

  // Process each directory pattern
  SEARCH_DIRS.forEach(pattern => {
    // Get all matching files
    const files = glob.sync(pattern);
    
    // Process each file
    files.forEach(file => {
      // Skip ignored files
      if (IGNORE_FILES.includes(file)) {
        return;
      }
      
      // Skip test and generated files
      if (file.includes('.test.') || file.includes('.spec.') || file.includes('.generated.')) {
        return;
      }
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        let hasMatch = false;
        
        // Check each pattern
        PATTERNS.forEach(({ pattern, description }) => {
          const matches = content.match(pattern);
          
          if (matches) {
            hasMatch = true;
            matches.forEach(match => {
              results.total++;
              
              if (pattern.toString().includes('import')) {
                results.importReferences.push({
                  file,
                  match,
                  description
                });
              } else {
                results.usageReferences.push({
                  file,
                  match,
                  description
                });
              }
            });
          }
        });
        
        // Add file to set if it has matches
        if (hasMatch) {
          results.files.add(file);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
      }
    });
  });
  
  return results;
}

// Generate a markdown report
function generateReport(results) {
  const { total, importReferences, usageReferences, files } = results;
  
  let report = '# Auth Import Audit Report\n\n';
  
  report += `## Summary\n\n`;
  report += `- **Total references:** ${total}\n`;
  report += `- **Files affected:** ${files.size}\n`;
  report += `- **Import references:** ${importReferences.length}\n`;
  report += `- **Usage references:** ${usageReferences.length}\n\n`;
  
  report += `## Files Needing Updates\n\n`;
  
  // List all files with references
  Array.from(files).sort().forEach(file => {
    report += `- \`${file}\`\n`;
  });
  
  report += `\n## Import References\n\n`;
  
  if (importReferences.length === 0) {
    report += `No import references found.\n\n`;
  } else {
    report += `| File | Import Statement | Replacement |\n`;
    report += `|------|-----------------|-------------|\n`;
    
    importReferences.forEach(({ file, match }) => {
      const replacement = match.replace(/AuthService/g, 'authService')
        .replace(/from ['"]@\/lib\/core\/auth['"]/g, 'from \'@/lib/supabase/services/auth/auth.service\'');
      
      report += `| \`${file}\` | \`${match}\` | \`${replacement}\` |\n`;
    });
  }
  
  report += `\n## Usage References\n\n`;
  
  if (usageReferences.length === 0) {
    report += `No usage references found.\n\n`;
  } else {
    report += `| File | Usage Pattern | Replacement |\n`;
    report += `|------|---------------|-------------|\n`;
    
    usageReferences.forEach(({ file, match }) => {
      const replacement = match.replace(/AuthService\./g, 'authService.');
      
      report += `| \`${file}\` | \`${match}\` | \`${replacement}\` |\n`;
    });
  }
  
  report += `\n## Migration Instructions\n\n`;
  
  report += `1. Update imports to use the comprehensive implementation:\n`;
  report += `   \`\`\`typescript\n`;
  report += `   // Before\n`;
  report += `   import { AuthService } from '@/lib/core/auth';\n\n`;
  report += `   // After\n`;
  report += `   import { authService } from '@/lib/supabase/services/auth/auth.service';\n`;
  report += `   \`\`\`\n\n`;
  
  report += `2. Update method calls to use the instance instead of static methods:\n`;
  report += `   \`\`\`typescript\n`;
  report += `   // Before\n`;
  report += `   const result = await AuthService.signInWithEmail(email, password);\n\n`;
  report += `   // After\n`;
  report += `   const result = await authService.login({ email, password });\n`;
  report += `   \`\`\`\n\n`;
  
  report += `3. Reference the method mapping table in the documentation for equivalent methods.\n`;
  
  return report;
}

// Main function
function main() {
  console.log('Auditing auth imports...');
  const results = auditImports();
  
  console.log(`Found ${results.total} references in ${results.files.size} files.`);
  
  // Generate report
  const report = generateReport(results);
  
  // Write report to file
  fs.writeFileSync('AUTH_IMPORT_AUDIT.md', report);
  
  console.log('Report generated: AUTH_IMPORT_AUDIT.md');
}

// Run the script
main(); 