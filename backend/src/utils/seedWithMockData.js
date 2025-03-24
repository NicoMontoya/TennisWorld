import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';

dotenv.config();

// Mock data for ATP rankings
const mockATPRankings = [
  { player_id: 1, player_name: 'Novak Djokovic', country: 'SRB', type: 'ATP', rank: 1, points: 11245, movement: 0 },
  { player_id: 2, player_name: 'Carlos Alcaraz', country: 'ESP', type: 'ATP', rank: 2, points: 9255, movement: 1 },
  { player_id: 3, player_name: 'Jannik Sinner', country: 'ITA', type: 'ATP', rank: 3, points: 8710, movement: 2 },
  { player_id: 4, player_name: 'Daniil Medvedev', country: 'RUS', type: 'ATP', rank: 4, points: 7165, movement: -2 },
  { player_id: 5, player_name: 'Alexander Zverev', country: 'GER', type: 'ATP', rank: 5, points: 6885, movement: 0 },
  { player_id: 6, player_name: 'Andrey Rublev', country: 'RUS', type: 'ATP', rank: 6, points: 4970, movement: 0 },
  { player_id: 7, player_name: 'Hubert Hurkacz', country: 'POL', type: 'ATP', rank: 7, points: 4035, movement: 1 },
  { player_id: 8, player_name: 'Casper Ruud', country: 'NOR', type: 'ATP', rank: 8, points: 3855, movement: -1 },
  { player_id: 9, player_name: 'Grigor Dimitrov', country: 'BUL', type: 'ATP', rank: 9, points: 3775, movement: 0 },
  { player_id: 10, player_name: 'Alex de Minaur', country: 'AUS', type: 'ATP', rank: 10, points: 3765, movement: 2 }
];

// Mock data for WTA rankings
const mockWTARankings = [
  { player_id: 101, player_name: 'Iga Swiatek', country: 'POL', type: 'WTA', rank: 1, points: 10715, movement: 0 },
  { player_id: 102, player_name: 'Aryna Sabalenka', country: 'BLR', type: 'WTA', rank: 2, points: 8725, movement: 0 },
  { player_id: 103, player_name: 'Coco Gauff', country: 'USA', type: 'WTA', rank: 3, points: 7150, movement: 0 },
  { player_id: 104, player_name: 'Elena Rybakina', country: 'KAZ', type: 'WTA', rank: 4, points: 6516, movement: 0 },
  { player_id: 105, player_name: 'Jessica Pegula', country: 'USA', type: 'WTA', rank: 5, points: 5705, movement: 0 },
  { player_id: 106, player_name: 'Marketa Vondrousova', country: 'CZE', type: 'WTA', rank: 6, points: 4075, movement: 0 },
  { player_id: 107, player_name: 'Ons Jabeur', country: 'TUN', type: 'WTA', rank: 7, points: 3946, movement: 0 },
  { player_id: 108, player_name: 'Qinwen Zheng', country: 'CHN', type: 'WTA', rank: 8, points: 3910, movement: 2 },
  { player_id: 109, player_name: 'Maria Sakkari', country: 'GRE', type: 'WTA', rank: 9, points: 3835, movement: -1 },
  { player_id: 110, player_name: 'Jelena Ostapenko', country: 'LAT', type: 'WTA', rank: 10, points: 3438, movement: 1 }
];

// Mock data for tournaments
const mockTournaments = [
  {
    tournament_id: 1,
    name: 'Australian Open',
    location: 'Melbourne, Australia',
    surface: 'Hard',
    category: 'Grand Slam',
    prize_money: '$75,000,000',
    start_date: new Date('2025-01-13'),
    end_date: new Date('2025-01-26'),
    status: 'Completed'
  },
  {
    tournament_id: 2,
    name: 'Roland Garros',
    location: 'Paris, France',
    surface: 'Clay',
    category: 'Grand Slam',
    prize_money: '$50,000,000',
    start_date: new Date('2025-05-25'),
    end_date: new Date('2025-06-08'),
    status: 'Upcoming'
  },
  {
    tournament_id: 3,
    name: 'Wimbledon',
    location: 'London, UK',
    surface: 'Grass',
    category: 'Grand Slam',
    prize_money: '$60,000,000',
    start_date: new Date('2025-06-30'),
    end_date: new Date('2025-07-13'),
    status: 'Upcoming'
  },
  {
    tournament_id: 4,
    name: 'US Open',
    location: 'New York, USA',
    surface: 'Hard',
    category: 'Grand Slam',
    prize_money: '$65,000,000',
    start_date: new Date('2025-08-25'),
    end_date: new Date('2025-09-07'),
    status: 'Upcoming'
  },
  {
    tournament_id: 5,
    name: 'Miami Open',
    location: 'Miami, USA',
    surface: 'Hard',
    category: 'Masters 1000',
    prize_money: '$8,800,000',
    start_date: new Date('2025-03-17'),
    end_date: new Date('2025-03-30'),
    status: 'Upcoming'
  }
];

// Function to seed the database with mock data
const seedWithMockData = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Try different connection strings
    const connectionStrings = [
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/tennisworld',
      'mongodb+srv://nicomontoya:todpij-8sunwa-jizgUs@startertw.xzcxt.mongodb.net/tennisworld?retryWrites=true&w=majority&appName=StarterTW',
      'mongodb+srv://nicomontoya%40hey.com:todpij-8sunwa-jizgUs@startertw.xzcxt.mongodb.net/tennisworld?retryWrites=true&w=majority&appName=StarterTW'
    ];
    
    let connected = false;
    let conn;
    
    for (const connectionString of connectionStrings) {
      if (!connectionString) continue;
      
      try {
        console.log(`Trying connection string: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
        conn = await mongoose.connect(connectionString);
        connected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        break;
      } catch (error) {
        console.error(`Failed to connect with connection string: ${error.message}`);
      }
    }
    
    if (!connected) {
      throw new Error('Failed to connect to MongoDB with any of the connection strings');
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Player.deleteMany({});
    await Tournament.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Insert mock data
    console.log('Inserting mock player data...');
    await Player.insertMany([...mockATPRankings, ...mockWTARankings]);
    
    console.log('Inserting mock tournament data...');
    await Tournament.insertMany(mockTournaments);
    
    console.log('Database seeded successfully with mock data');
    console.log(`Inserted ${mockATPRankings.length + mockWTARankings.length} players`);
    console.log(`Inserted ${mockTournaments.length} tournaments`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database with mock data:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Code:', error.code);
    }
    
    process.exit(1);
  }
};

// Run the seed function
seedWithMockData();
