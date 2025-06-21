#!/usr/bin/env node

/**
 * Enhanced Database Setup Script
 * 
 * This script runs the database migration to update the MongoDB schema
 * with the enhanced models and then seeds the database with mock data.
 * 
 * Usage:
 * node setupEnhancedDatabase.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the migration and seed scripts
const migrationScriptPath = path.join(__dirname, 'databaseMigration.js');
const seedScriptPath = path.join(__dirname, 'seedEnhancedData.js');

console.log('Starting TennisWorld enhanced database setup...');

// Function to run a script and return a promise
const runScript = (scriptPath, name) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running ${name}...`);
    console.log(`Script path: ${scriptPath}`);
    
    const process = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${name} completed successfully!`);
        resolve();
      } else {
        console.error(`\n❌ ${name} failed with code ${code}`);
        reject(new Error(`${name} failed with code ${code}`));
      }
    });
  });
};

// Run the scripts in sequence
async function runSetup() {
  try {
    // Step 1: Run database migration
    await runScript(migrationScriptPath, 'Database migration');
    
    // Step 2: Seed enhanced data
    await runScript(seedScriptPath, 'Enhanced data seeding');
    
    console.log('\n🎉 TennisWorld enhanced database setup completed successfully!');
    console.log('\nYou can now start the application with:');
    console.log('cd backend && npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('Please check the error messages above and try again.');
    process.exit(1);
  }
}

// Start the setup process
runSetup();
