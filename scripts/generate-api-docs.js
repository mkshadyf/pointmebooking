#!/usr/bin/env node

/**
 * API Documentation Generator
 * 
 * This script generates OpenAPI/Swagger documentation for API routes in the project.
 * It scans the API routes directory and extracts JSDoc comments with @swagger annotations.
 * 
 * @example
 * // Generate API documentation
 * node generate-api-docs.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const API_ROUTES_DIR = path.join(process.cwd(), 'src', 'app', 'api');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'api-docs', 'swagger.json');
const OUTPUT_YAML_FILE = path.join(process.cwd(), 'public', 'api-docs', 'swagger.yaml');

// Base OpenAPI document
const baseDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PointMe API',
    version: '1.0.0',
    description: 'API documentation for the PointMe application',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
    {
      url: 'https://pointme.app',
      description: 'Production server',
    },
  ],
  paths: {},
  components: {
    schemas: {},
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

/**
 * Extracts Swagger documentation from JSDoc comments in a file
 * 
 * @param {string} filePath - Path to the file
 * @returns {Object|null} - Extracted Swagger documentation or null if none found
 */
function extractSwaggerDocs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const swaggerComments = [];
    
    // Extract JSDoc comments with @swagger annotation
    const regex = /\/\*\*\s*\n(?:\s*\*.*\n)*\s*\*\s*@swagger\s*\n(?:\s*\*.*\n)*\s*\*\//g;
    const matches = content.match(regex);
    
    if (!matches) {
      return null;
    }
    
    // Process each comment block
    matches.forEach(comment => {
      // Extract the lines after @swagger
      const swaggerLines = comment
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('* ') || line === '*')
        .map(line => line === '*' ? '' : line.substring(2))
        .join('\n');
      
      // Parse YAML content
      try {
        const swaggerDoc = yaml.load(swaggerLines);
        swaggerComments.push(swaggerDoc);
      } catch (error) {
        console.error(`Error parsing Swagger comment in ${filePath}:`, error);
      }
    });
    
    return swaggerComments;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Recursively scans a directory for API route files
 * 
 * @param {string} dirPath - Path to the directory
 * @returns {string[]} - Array of file paths
 */
function scanDirectory(dirPath) {
  let files = [];
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      files = files.concat(scanDirectory(fullPath));
    } else if (entry.isFile() && 
              (entry.name === 'route.ts' || entry.name === 'route.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Merges Swagger documentation into the base document
 * 
 * @param {Object} baseDoc - Base OpenAPI document
 * @param {Object[]} swaggerDocs - Array of Swagger documentation objects
 * @returns {Object} - Merged OpenAPI document
 */
function mergeSwaggerDocs(baseDoc, swaggerDocs) {
  const result = { ...baseDoc };
  
  swaggerDocs.forEach(docs => {
    if (!docs) return;
    
    // Merge paths
    if (docs.paths) {
      Object.keys(docs.paths).forEach(path => {
        if (!result.paths[path]) {
          result.paths[path] = {};
        }
        
        Object.keys(docs.paths[path]).forEach(method => {
          result.paths[path][method] = docs.paths[path][method];
        });
      });
    }
    
    // Merge components
    if (docs.components) {
      // Merge schemas
      if (docs.components.schemas) {
        Object.keys(docs.components.schemas).forEach(schema => {
          result.components.schemas[schema] = docs.components.schemas[schema];
        });
      }
      
      // Merge other component types if needed
      // ...
    }
  });
  
  return result;
}

/**
 * Main function to generate API documentation
 */
function main() {
  console.log('Generating API documentation...');
  
  // Create output directory if it doesn't exist
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Scan API routes directory
  const routeFiles = scanDirectory(API_ROUTES_DIR);
  console.log(`Found ${routeFiles.length} API route files`);
  
  // Extract Swagger documentation from each file
  const swaggerDocs = [];
  routeFiles.forEach(file => {
    const docs = extractSwaggerDocs(file);
    if (docs && docs.length > 0) {
      swaggerDocs.push(...docs);
      console.log(`Extracted Swagger documentation from ${file}`);
    }
  });
  
  // Merge documentation into base document
  const mergedDoc = mergeSwaggerDocs(baseDocument, swaggerDocs);
  
  // Write output files
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedDoc, null, 2));
  fs.writeFileSync(OUTPUT_YAML_FILE, yaml.dump(mergedDoc));
  
  console.log(`Generated API documentation at ${OUTPUT_FILE}`);
  console.log(`Generated YAML documentation at ${OUTPUT_YAML_FILE}`);
}

// Execute the script
main(); 