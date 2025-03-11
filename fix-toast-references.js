const fs = require('fs');
const path = require('path');
require('child_process');

// Get a list of all TypeScript files
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      fileList = getAllFiles(filePath, fileList);
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) && 
      !file.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
};

// Fix ToastService.toast references in a file
const fixToastReferences = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace ToastService.toast.success with ToastService.success
    if (content.includes('ToastService.toast.success')) {
      content = content.replace(/ToastService\.toast\.success/g, 'ToastService.success');
      modified = true;
    }
    
    // Replace ToastService.toast.error with ToastService.error
    if (content.includes('ToastService.toast.error')) {
      content = content.replace(/ToastService\.toast\.error/g, 'ToastService.error');
      modified = true;
    }
    
    // Replace ToastService.toast.warning with ToastService.warning
    if (content.includes('ToastService.toast.warning')) {
      content = content.replace(/ToastService\.toast\.warning/g, 'ToastService.warning');
      modified = true;
    }
    
    // Replace ToastService.toast.info with ToastService.info
    if (content.includes('ToastService.toast.info')) {
      content = content.replace(/ToastService\.toast\.info/g, 'ToastService.info');
      modified = true;
    }
    
    // Save the file if it was modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ToastService references in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Main function
const main = () => {
  const rootDir = process.cwd();
  const files = getAllFiles(rootDir);
  
  console.log(`Found ${files.length} TypeScript files to process`);
  
  // Process each file
  files.forEach(file => {
    fixToastReferences(file);
  });
  
  console.log('Done!');
};

// Run the script
main(); 