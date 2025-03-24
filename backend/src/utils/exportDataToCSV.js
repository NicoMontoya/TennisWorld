import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';

dotenv.config();

// Function to convert array of objects to CSV
const convertToCSV = (objArray) => {
  if (objArray.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(objArray[0]);
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  objArray.forEach(obj => {
    const values = headers.map(header => {
      const value = obj[header];
      // Handle different data types
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
      return String(value).replace(/,/g, ';'); // Replace commas in values to avoid CSV issues
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
};

// Function to write data to CSV file
const writeToCSV = (data, filename) => {
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, data);
  console.log(`Data exported to ${filePath}`);
};

const exportDataToCSV = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Export Players data
    console.log('Exporting Players data...');
    const players = await Player.find({}).lean();
    
    // Flatten the player data
    const flatPlayers = players.map(player => {
      return {
        _id: player._id.toString(),
        player_id: player.player_id,
        player_name: player.player_name,
        country: player.country,
        type: player.type,
        rank: player.rank,
        points: player.points,
        movement: player.movement,
        lastUpdated: player.lastUpdated ? player.lastUpdated.toISOString() : '',
        createdAt: player.createdAt ? player.createdAt.toISOString() : '',
        updatedAt: player.updatedAt ? player.updatedAt.toISOString() : ''
      };
    });
    
    const playersCSV = convertToCSV(flatPlayers);
    writeToCSV(playersCSV, 'players.csv');
    
    // Export Tournaments data
    console.log('Exporting Tournaments data...');
    const tournaments = await Tournament.find({}).lean();
    
    // Flatten the tournament data
    const flatTournaments = tournaments.map(tournament => {
      return {
        _id: tournament._id.toString(),
        tournament_id: tournament.tournament_id,
        name: tournament.name,
        location: tournament.location,
        surface: tournament.surface,
        category: tournament.category,
        prize_money: tournament.prize_money,
        start_date: tournament.start_date ? tournament.start_date.toISOString() : '',
        end_date: tournament.end_date ? tournament.end_date.toISOString() : '',
        status: tournament.status,
        lastUpdated: tournament.lastUpdated ? tournament.lastUpdated.toISOString() : '',
        createdAt: tournament.createdAt ? tournament.createdAt.toISOString() : '',
        updatedAt: tournament.updatedAt ? tournament.updatedAt.toISOString() : ''
      };
    });
    
    const tournamentsCSV = convertToCSV(flatTournaments);
    writeToCSV(tournamentsCSV, 'tournaments.csv');
    
    console.log('Data export completed successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error exporting data to CSV:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Code:', error.code);
    }
    
    process.exit(1);
  }
};

// Run the export function
exportDataToCSV();
