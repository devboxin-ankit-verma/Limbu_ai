#!/usr/bin/env node
/**
 * LAYER 3: Environment variable validation script.
 * 
 * This script enforces .cursor/rules.md compliance by checking
 * that environment variables are only accessed via config layer.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validating environment variable usage...\n');

// Find all TypeScript files in src/
let files = [];
try {
  const result = execSync('find src -name "*.ts" -type f 2>/dev/null', { encoding: 'utf-8' });
  files = result.trim().split('\n').filter(Boolean);
} catch (error) {
  console.error('❌ Error finding TypeScript files');
  process.exit(1);
}

if (files.length === 0) {
  console.log('⚠️  No TypeScript files found in src/');
  process.exit(0);
}

let violations = [];

files.forEach(file => {
  // Skip config files - they're allowed to use process.env
  if (file.includes('config/')) {
    return;
  }
  
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for direct process.env usage
      if (line.includes('process.env') && !line.trim().startsWith('//')) {
        violations.push({
          file,
          line: index + 1,
          content: line.trim(),
        });
      }
    });
  } catch (error) {
    console.error(`⚠️  Error reading file ${file}: ${error.message}`);
  }
});

if (violations.length > 0) {
  console.error('❌ FAIL: Direct process.env access found:\n');
  violations.forEach(v => {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    ${v.content}\n`);
  });
  console.error('💡 Use config layer instead. See .cursor/rules.md');
  console.error('💡 Example: import { config } from "./config"; const url = config.databaseUrl;');
  process.exit(1);
}

console.log('✅ No direct environment variable access detected');
console.log('✅ All environment variables accessed via config layer');
