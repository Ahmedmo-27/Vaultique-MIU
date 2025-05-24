/**
 * Cleanup Script
 *
 * This script helps identify and clean up unused files and dependencies
 * after migrating from CSRF to JWT authentication.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting codebase cleanup...');

// Files that may be safely removed
const potentiallyUnusedFiles = ['middleware/auth.js', 'scripts/update-auth.js'];

// Check for files and remove if they exist
potentiallyUnusedFiles.forEach((filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);

  try {
    if (fs.existsSync(fullPath)) {
      console.log(`Found unused file: ${filePath}`);
      console.log(`  Removing ${filePath}...`);
      fs.unlinkSync(fullPath);
      console.log(`  ✓ Removed successfully`);
    }
  } catch (err) {
    console.error(`  ❌ Error removing ${filePath}:`, err.message);
  }
});

// Dependencies that may no longer be needed
const potentiallyUnusedDeps = ['csurf', 'express-session'];

// Check package.json for dependencies
console.log('\nChecking for unused dependencies...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = require(packageJsonPath);

potentiallyUnusedDeps.forEach((dep) => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`Found unused dependency: ${dep}`);
    console.log(`  Run 'npm uninstall ${dep}' to remove it`);
  } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    console.log(`Found unused dev dependency: ${dep}`);
    console.log(`  Run 'npm uninstall ${dep}' to remove it`);
  }
});

// Format code
console.log('\nRunning code formatter...');
try {
  execSync('npm run format', { stdio: 'inherit' });
  console.log('✓ Code formatting complete');
} catch (err) {
  console.error('❌ Error formatting code:', err.message);
}

console.log('\n🎉 Cleanup complete!');
console.log('Run the application and check that everything is working as expected.');
