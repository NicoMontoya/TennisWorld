import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import { getRankings, getTournaments } from '../services/tennisApiService.js';

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

// Generate more mock data to have 100 players
for (let i = 11; i <= 100; i++) {
  mockATPRankings.push({
    player_id: i,
    player_name: `ATP Player ${i}`,
    country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'ARG', 'CAN', 'JPN'][i % 10],
    type: 'ATP',
    rank: i,
    points: Math.floor(3500 - (i * 30)),
    movement: Math.floor(Math.random() * 5) - 2
  });
  
  mockWTARankings.push({
    player_id: 100 + i,
    player_name: `WTA Player ${i}`,
    country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'CHN', 'CAN', 'JPN'][i % 10],
    type: 'WTA',
    rank: i,
    points: Math.floor(3300 - (i * 30)),
    movement: Math.floor(Math.random() * 5) - 2
  });
}

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
  },
  {
    tournament_id: 6,
    name: 'Madrid Open',
    location: 'Madrid, Spain',
    surface: 'Clay',
    category: 'Masters 1000',
    prize_money: '$7,500,000',
    start_date: new Date('2025-04-28'),
    end_date: new Date('2025-05-11'),
    status: 'Upcoming'
  },
  {
    tournament_id: 7,
    name: 'Italian Open',
    location: 'Rome, Italy',
    surface: 'Clay',
    category: 'Masters 1000',
    prize_money: '$7,000,000',
    start_date: new Date('2025-05-12'),
    end_date: new Date('2025-05-19'),
    status: 'Upcoming'
  },
  {
    tournament_id: 8,
    name: 'Cincinnati Masters',
    location: 'Cincinnati, USA',
    surface: 'Hard',
    category: 'Masters 1000',
    prize_money: '$6,600,000',
    start_date: new Date('2025-08-11'),
    end_date: new Date('2025-08-18'),
    status: 'Upcoming'
  },
  {
    tournament_id: 9,
    name: 'Indian Wells Masters',
    location: 'Indian Wells, USA',
    surface: 'Hard',
    category: 'Masters 1000',
    prize_money: '$9,000,000',
    start_date: new Date('2025-03-06'),
    end_date: new Date('2025-03-16'),
    status: 'Upcoming'
  },
  {
    tournament_id: 10,
    name: 'ATP Finals',
    location: 'Turin, Italy',
    surface: 'Hard (Indoor)',
    category: 'Tour Finals',
    prize_money: '$14,750,000',
    start_date: new Date('2025-11-09'),
    end_date: new Date('2025-11-16'),
    status: 'Upcoming'
  },
  {
    tournament_id: 11,
    name: 'Dubai Tennis Championships',
    location: 'Dubai, UAE',
    surface: 'Hard',
    category: 'ATP 500',
    prize_money: '$3,000,000',
    start_date: new Date('2025-02-24'),
    end_date: new Date('2025-03-01'),
    status: 'Upcoming'
  },
  {
    tournament_id: 12,
    name: 'Barcelona Open',
    location: 'Barcelona, Spain',
    surface: 'Clay',
    category: 'ATP 500',
    prize_money: '$2,800,000',
    start_date: new Date('2025-04-15'),
    end_date: new Date('2025-04-21'),
    status: 'Upcoming'
  },
  {
    tournament_id: 13,
    name: 'Queen\'s Club Championships',
    location: 'London, UK',
    surface: 'Grass',
    category: 'ATP 500',
    prize_money: '$2,500,000',
    start_date: new Date('2025-06-16'),
    end_date: new Date('2025-06-22'),
    status: 'Upcoming'
  },
  {
    tournament_id: 14,
    name: 'Halle Open',
    location: 'Halle, Germany',
    surface: 'Grass',
    category: 'ATP 500',
    prize_money: '$2,300,000',
    start_date: new Date('2025-06-16'),
    end_date: new Date('2025-06-22'),
    status: 'Upcoming'
  },
  {
    tournament_id: 15,
    name: 'Stuttgart Open',
    location: 'Stuttgart, Germany',
    surface: 'Grass',
    category: 'ATP 250',
    prize_money: '$800,000',
    start_date: new Date('2025-06-09'),
    end_date: new Date('2025-06-15'),
    status: 'Upcoming'
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Using connection string: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
    
    // Connect to the database
    await connectDB();
    console.log('Successfully connected to MongoDB');
    
    // Clear existing data
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
    
    console.log('Database seeded successfully with data from the API');
    
    // Log some stats
    console.log(`Inserted ${atpPlayers.length} ATP players`);
    console.log(`Inserted ${wtaPlayers.length} WTA players`);
    console.log(`Inserted ${tournaments.length} tournaments`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Error details:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Code:', error.code);
    }
    
    // If API fails, fall back to mock data
    console.log('Falling back to mock data...');
    try {
      // Insert mock data
      await Player.insertMany([...mockATPRankings, ...mockWTARankings]);
      await Tournament.insertMany(mockTournaments);
      
      console.log('Database seeded successfully with mock data');
      process.exit(0);
    } catch (fallbackError) {
      console.error('Error seeding database with mock data:', fallbackError);
      process.exit(1);
    }
  }
};

// Run the seed function
seedDatabase();
