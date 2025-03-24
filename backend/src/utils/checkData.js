import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';

dotenv.config();

// Function to write results to a file
const writeToFile = (data) => {
  const filePath = path.join(process.cwd(), 'db-check-results.txt');
  fs.writeFileSync(filePath, data);
  console.log(`Results written to ${filePath}`);
};

const checkData = async () => {
  let results = '';
  const log = (message) => {
    console.log(message);
    results += message + '\n';
  };
  try {
    log('Connecting to MongoDB...');
    log(`Using connection string: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Check Players collection
    const playerCount = await Player.countDocuments();
    log(`Number of players in the database: ${playerCount}`);
    
    if (playerCount > 0) {
      // Get sample of ATP players
      const atpPlayers = await Player.find({ type: 'ATP' }).limit(3);
      log('Sample ATP players:');
      log(JSON.stringify(atpPlayers, null, 2));
      
      // Get sample of WTA players
      const wtaPlayers = await Player.find({ type: 'WTA' }).limit(3);
      log('Sample WTA players:');
      log(JSON.stringify(wtaPlayers, null, 2));
    }
    
    // Check Tournaments collection
    const tournamentCount = await Tournament.countDocuments();
    log(`Number of tournaments in the database: ${tournamentCount}`);
    
    if (tournamentCount > 0) {
      // Get sample tournaments
      const tournaments = await Tournament.find().limit(3);
      log('Sample tournaments:');
      log(JSON.stringify(tournaments, null, 2));
    }
    
    // Close the connection
    await mongoose.connection.close();
    log('Connection closed successfully');
    
    // Write results to file
    writeToFile(results);
    
    process.exit(0);
  } catch (error) {
    let errorMessage = 'Error checking database:\n';
    errorMessage += `Error name: ${error.name}\n`;
    errorMessage += `Error message: ${error.message}\n`;
    
    if (error.name === 'MongoServerError') {
      errorMessage += `MongoDB Server Error Code: ${error.code}\n`;
    }
    
    console.error(errorMessage);
    writeToFile(errorMessage);
    
    process.exit(1);
  }
};

// Run the check function
checkData();
