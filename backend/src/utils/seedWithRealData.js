import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import { getRankings, getTournaments } from '../services/tennisApiService.js';

dotenv.config();

const seedWithRealData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully to MongoDB');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Player.deleteMany({});
    await Tournament.deleteMany({});
    console.log('Previous data cleared');
    
    // Fetch ATP rankings from the API
    console.log('Fetching ATP rankings from the API...');
    const atpResponse = await getRankings('ATP');
    if (atpResponse.status !== 'success') {
      throw new Error('Failed to fetch ATP rankings');
    }
    
    // Fetch WTA rankings from the API
    console.log('Fetching WTA rankings from the API...');
    const wtaResponse = await getRankings('WTA');
    if (wtaResponse.status !== 'success') {
      throw new Error('Failed to fetch WTA rankings');
    }
    
    // Prepare player data for database
    const atpPlayers = atpResponse.data.rankings.map(player => ({
      player_id: player.player_id,
      player_name: player.player_name,
      country: player.country,
      type: 'ATP',
      rank: player.rank,
      points: player.points,
      movement: player.movement || 0
    }));
    
    const wtaPlayers = wtaResponse.data.rankings.map(player => ({
      player_id: player.player_id,
      player_name: player.player_name,
      country: player.country,
      type: 'WTA',
      rank: player.rank,
      points: player.points,
      movement: player.movement || 0
    }));
    
    // Fetch tournaments from the API
    console.log('Fetching tournaments from the API...');
    const tournamentsResponse = await getTournaments();
    if (tournamentsResponse.status !== 'success') {
      throw new Error('Failed to fetch tournaments');
    }
    
    // Prepare tournament data for database
    const tournaments = tournamentsResponse.data.tournaments.map(tournament => ({
      tournament_id: tournament.tournament_id,
      name: tournament.name,
      location: tournament.location,
      surface: tournament.surface,
      category: tournament.category,
      prize_money: tournament.prize_money,
      start_date: new Date(tournament.start_date),
      end_date: new Date(tournament.end_date),
      status: tournament.status
    }));
    
    // Insert data into the database
    console.log('Inserting player data into the database...');
    await Player.insertMany([...atpPlayers, ...wtaPlayers]);
    
    console.log('Inserting tournament data into the database...');
    await Tournament.insertMany(tournaments);
    
    console.log('Database seeded successfully with real data from the API');
    
    // Log some stats
    console.log(`Inserted ${atpPlayers.length} ATP players`);
    console.log(`Inserted ${wtaPlayers.length} WTA players`);
    console.log(`Inserted ${tournaments.length} tournaments`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database with real data:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Code:', error.code);
    }
    
    process.exit(1);
  }
};

// Run the seed function
seedWithRealData();
