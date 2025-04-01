#!/usr/bin/env node

/**
 * Post-installation script for EpisoNext
 * This script runs after npm install and sets up necessary directories and files
 */

const fs = require('fs');
const path = require('path');

console.log('Running EpisoNext post-installation setup...');

// Ensure required directories exist
const directories = [
  'dist',
  'logs'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Check if manifest.json exists in resources directory
const resourcesDir = path.join(__dirname, '..', 'src', 'main', 'resources');
const manifestPath = path.join(resourcesDir, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.log('Warning: manifest.json not found in resources directory.');
  console.log('Make sure to create it before starting the addon.');
}

console.log('EpisoNext post-installation setup completed successfully!'); 