#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execSync } = require('child_process');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Error: Please provide a subdirectory name within public/memes/');
  console.error('Usage: node process-meme-subdirectory.js <subdirectory-name> [--force]');
  process.exit(1);
}

// Get subdirectory name and force flag
const subdirName = args[0];
const forceFlag = args.includes('--force') ? '--force' : '';

// Configuration
const BASE_MEMES_DIR = path.join(__dirname, '..', 'public', 'memes');
const TARGET_DIR = path.join(BASE_MEMES_DIR, subdirName);
const LOG_FILE = path.join(__dirname, 'process-subdir-log.txt');

// Initialize log file
fs.writeFileSync(LOG_FILE, `Starting subdirectory processing at ${new Date().toISOString()}\n`);
console.log(`Processing subdirectory: ${subdirName}`);

// Helper function to log messages
function log(message) {
  fs.appendFileSync(LOG_FILE, message + '\n');
  console.log(message);
}

// Main function
async function processSubdirectory() {
  try {
    // Check if subdirectory exists
    try {
      await stat(TARGET_DIR);
    } catch (err) {
      log(`Error: Subdirectory ${subdirName} does not exist in ${BASE_MEMES_DIR}`);
      process.exit(1);
    }
    
    log(`Step 1: Renaming image files in ${TARGET_DIR}`);
    try {
      execSync(`node ${path.join(__dirname, 'rename-meme-images.js')} "${TARGET_DIR}" ${forceFlag}`, { stdio: 'inherit' });
      log('Renaming completed successfully');
    } catch (error) {
      log(`Error during renaming: ${error.message}`);
      process.exit(1);
    }
    
    log(`\nStep 2: Creating matching markdown files for images in ${TARGET_DIR}`);
    try {
      execSync(`node ${path.join(__dirname, 'create-matching-markdown.js')} "${TARGET_DIR}" ${forceFlag}`, { stdio: 'inherit' });
      log('Markdown file creation completed successfully');
    } catch (error) {
      log(`Error during markdown file creation: ${error.message}`);
      process.exit(1);
    }
    
    log(`\nProcessing of subdirectory ${subdirName} completed at ${new Date().toISOString()}`);
    log(`Check individual log files for details on renamed files and created markdown files.`);
    
  } catch (error) {
    log(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
processSubdirectory();
