#!/usr/bin/env node

/**
 * Barrel File Generator
 * 
 * This script generates barrel files (index.ts) for directories in the project.
 * It exports all TypeScript files in a directory from a single index.ts file.
 * 
 * @example
 * // Generate barrels for a specific directory
 * node generate-barrels.js src/components
 * 
 * // Generate barrels recursively for all directories
 * node generate-barrels.js src --recursive
 */

const fs = require('fs');
const path = require('path');

// Configuration
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'public'
];

const IGNORE_FILES = [
  'index.ts',
  'index.tsx',
  '.d.ts'
];

/**
 * Generates a barrel file (index.ts) for the specified directory
 * 
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} - True if a barrel file was generated, false otherwise
 */
function generateBarrel(dirPath) {
  try {
    // Skip if directory doesn't exist
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      console.error(`Directory does not exist: ${dirPath}`);
      return false;
    }

    const files = fs.readdirSync(dirPath);
    const exports = [];
    let hasExportableFiles = false;
    
    // Add header comment
    exports.push('/**');
    exports.push(' * Barrel file for directory:');
    exports.push(` * ${path.relative(process.cwd(), dirPath)}`);
    exports.push(' *');
    exports.push(' * This file is auto-generated. Do not edit directly.');
    exports.push(' */');
    exports.push('');
    
    // Process each file in the directory
    files.forEach(file => {
      // Skip ignored files
      if (IGNORE_FILES.some(ignore => file.endsWith(ignore))) {
        return;
      }
      
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      // Handle TypeScript files
      if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
        const baseName = path.basename(file, path.extname(file));
        
        // Check if file has a default export
        const content = fs.readFileSync(filePath, 'utf8');
        const hasDefaultExport = content.includes('export default') || 
                                content.match(/export\s+\{\s*default\s*\}/);
        
        if (hasDefaultExport) {
          exports.push(`export { default as ${baseName} } from './${baseName}';`);
        }
        
        // Always add a wildcard export
        exports.push(`export * from './${baseName}';`);
        hasExportableFiles = true;
      }
    });
    
    // Only create barrel file if there are exportable files
    if (hasExportableFiles) {
      const indexPath = path.join(dirPath, 'index.ts');
      const content = exports.join('\n') + '\n';
      
      // Check if file exists and content is different
      let shouldWrite = true;
      if (fs.existsSync(indexPath)) {
        const existingContent = fs.readFileSync(indexPath, 'utf8');
        if (existingContent === content) {
          shouldWrite = false;
        }
      }
      
      if (shouldWrite) {
        fs.writeFileSync(indexPath, content);
        console.log(`Generated barrel file: ${indexPath}`);
        return true;
      } else {
        console.log(`Barrel file already up to date: ${indexPath}`);
        return false;
      }
    } else {
      console.log(`No exportable files found in: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error generating barrel for ${dirPath}:`, error);
    return false;
  }
}

/**
 * Recursively processes directories to generate barrel files
 * 
 * @param {string} dirPath - Path to the directory
 * @param {boolean} recursive - Whether to process subdirectories
 * @returns {number} - Number of barrel files generated
 */
function processDirectory(dirPath, recursive) {
  let count = 0;
  
  // Skip ignored directories
  const dirName = path.basename(dirPath);
  if (IGNORE_DIRS.includes(dirName)) {
    return 0;
  }
  
  // Generate barrel for current directory
  if (generateBarrel(dirPath)) {
    count++;
  }
  
  // Process subdirectories if recursive flag is set
  if (recursive) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      
      if (fs.statSync(filePath).isDirectory() && !IGNORE_DIRS.includes(file)) {
        count += processDirectory(filePath, recursive);
      }
    });
  }
  
  return count;
}

/**
 * Main function to parse arguments and execute the script
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Please provide a directory path');
    console.log('Usage: node generate-barrels.js <directory> [--recursive]');
    process.exit(1);
  }
  
  const dirPath = args[0];
  const recursive = args.includes('--recursive');
  
  console.log(`Generating barrel files for: ${dirPath}`);
  if (recursive) {
    console.log('Mode: Recursive (including subdirectories)');
  } else {
    console.log('Mode: Single directory only');
  }
  
  const count = processDirectory(dirPath, recursive);
  console.log(`Done! Generated ${count} barrel file(s)`);
}

// Execute the script
main(); 