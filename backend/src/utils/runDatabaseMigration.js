#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script runs the database migration to update the MongoDB schema
 * with the enhanced models and migrate existing data.
 * 
 * Usage:
 * node runDatabaseMigration.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the migration script
const migrationScriptPath = path.join(__dirname, 'databaseMigration.js');

console.log('Starting TennisWorld database migration...');
console.log(`Migration script path: ${migrationScriptPath}`);

// Run the migration script
const migrationProcess = spawn('node', [migrationScriptPath], {
  stdio: 'inherit',
  shell: true
});

migrationProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Database migration completed successfully!');
    console.log('\nThe following enhancements have been made to the database:');
    console.log('1. Enhanced Player model with detailed stats and biographical information');
    console.log('2. Enhanced Tournament model with venue details and points structure');
    console.log('3. Enhanced Match model with detailed statistics and momentum tracking');
    console.log('4. Enhanced HeadToHead model with surface and tournament category stats');
    console.log('5. Enhanced PlayerRanking model with race rankings and points breakdown');
    console.log('6. Added new models:');
    console.log('   - TournamentDraw: For tournament brackets and seeding');
    console.log('   - PlayerStats: For detailed player statistics by surface and tournament level');
    console.log('   - PlayerForm: For tracking player momentum and recent performance');
    console.log('   - MatchPrediction: For system-generated match predictions');
    console.log('   - User: Enhanced user model with preferences and activity tracking');
    console.log('   - UserPrediction: For user-generated match predictions');
    console.log('   - PredictionLeaderboard: For tracking prediction accuracy across users');
    console.log('   - PlayerRankingHistory: For historical ranking data and analysis');
    console.log('   - PlayerInjury: For tracking player injuries and recovery');
    console.log('\nYou can now use these enhanced models in your application.');
  } else {
    console.error(`\n❌ Database migration failed with code ${code}`);
    console.error('Please check the error messages above and try again.');
    console.error('If the problem persists, you may need to manually fix the issues.');
  }
});
