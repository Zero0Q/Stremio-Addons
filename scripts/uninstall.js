#!/usr/bin/env node

/**
 * Uninstallation script for EpisoNext
 * This script cleans up directories and files created by the addon
 */

const fs = require('fs');
const path = require('path');

console.log('Running EpisoNext uninstallation cleanup...');

// Directories to clean up
const directories = [
  'dist',
  'logs'
];

// Clean up directories
directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing directory: ${dir}`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Error removing ${dir}: ${err.message}`);
    }
  }
});

console.log('EpisoNext uninstallation cleanup completed!');
console.log('Note: Your configuration files have not been removed.');
console.log('To completely remove all data, delete the EpisoNext configuration directory.'); 