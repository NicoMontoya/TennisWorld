import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to create all models
const createModels = async () => {
  console.log('Creating and updating MongoDB models...');
  
  // Get all model files from the models directory
  const modelsDir = path.join(__dirname, '../models');
  const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
  
  // Import all model files
  for (const file of modelFiles) {
    try {
      const modelPath = `../models/${file}`;
      console.log(`Importing model: ${modelPath}`);
      await import(modelPath);
    } catch (error) {
      console.error(`Error importing model ${file}:`, error);
    }
  }
  
  console.log('All models created successfully');
};

// Function to set up indexes
const setupIndexes = async () => {
  console.log('Setting up indexes...');
  
  // Get all mongoose models
  const models = mongoose.models;
  
  for (const [modelName, model] of Object.entries(models)) {
    try {
      console.log(`Setting up indexes for ${modelName}...`);
      
      // Each model should have its indexes defined in the schema
      // This will create all indexes defined in the schema
      await model.createIndexes();
      
      console.log(`Indexes for ${modelName} set up successfully`);
    } catch (error) {
      console.error(`Error setting up indexes for ${modelName}:`, error);
    }
  }
  
  console.log('All indexes set up successfully');
};

// Function to migrate existing data
const migrateData = async () => {
  console.log('Migrating existing data...');
  
  // Get all mongoose models
  const models = mongoose.models;
  
  // Migrate Player data
  if (models.Player) {
    try {
      console.log('Migrating Player data...');
      
      // Get all existing players
      const players = await models.Player.find({});
      
      // Update each player with the new schema fields
      for (const player of players) {
        // Add new fields with default values
        player.first_name = player.player_name.split(' ')[0];
        player.last_name = player.player_name.split(' ').slice(1).join(' ');
        player.country_name = getCountryName(player.country);
        player.career_high_rank = player.rank;
        player.career_high_rank_date = new Date();
        player.bio = `Professional tennis player from ${player.country_name}`;
        player.image_url = '';
        player.social_media = {
          twitter: '',
          instagram: '',
          facebook: ''
        };
        player.equipment = {
          racquet: '',
          apparel: '',
          shoes: ''
        };
        player.career_stats = {
          titles: 0,
          finals: 0,
          win_loss: {
            total: { wins: 0, losses: 0 },
            hard: { wins: 0, losses: 0 },
            clay: { wins: 0, losses: 0 },
            grass: { wins: 0, losses: 0 },
            indoor: { wins: 0, losses: 0 }
          },
          prize_money: 0
        };
        player.season_stats = {
          titles: 0,
          finals: 0,
          win_loss: {
            total: { wins: 0, losses: 0 },
            hard: { wins: 0, losses: 0 },
            clay: { wins: 0, losses: 0 },
            grass: { wins: 0, losses: 0 },
            indoor: { wins: 0, losses: 0 }
          },
          prize_money: 0
        };
        player.playing_style = [];
        player.notable_achievements = [];
        
        // Save the updated player
        await player.save();
      }
      
      console.log(`Migrated ${players.length} players successfully`);
    } catch (error) {
      console.error('Error migrating Player data:', error);
    }
  }
  
  // Migrate Tournament data
  if (models.Tournament) {
    try {
      console.log('Migrating Tournament data...');
      
      // Get all existing tournaments
      const tournaments = await models.Tournament.find({});
      
      // Update each tournament with the new schema fields
      for (const tournament of tournaments) {
        // Add new fields with default values
        tournament.city = tournament.location.split(',')[0].trim();
        tournament.country = getCountryCode(tournament.location);
        tournament.country_name = tournament.location.split(',')[1]?.trim() || '';
        tournament.indoor = tournament.surface.includes('Indoor');
        tournament.draw_size = 32;
        tournament.prize_money_currency = 'USD';
        tournament.type = tournament.category.includes('WTA') ? 'WTA' : 'ATP';
        tournament.court_speed = getCourtSpeed(tournament.surface);
        tournament.tournament_director = '';
        tournament.website = '';
        tournament.previous_champions = [];
        tournament.points = getDefaultPoints(tournament.category);
        tournament.venue_details = {
          name: '',
          capacity: 0,
          courts: 0,
          image_url: ''
        };
        tournament.weather_conditions = {
          avg_temperature: 0,
          avg_humidity: 0,
          precipitation_chance: 0
        };
        
        // Save the updated tournament
        await tournament.save();
      }
      
      console.log(`Migrated ${tournaments.length} tournaments successfully`);
    } catch (error) {
      console.error('Error migrating Tournament data:', error);
    }
  }
  
  // Migrate Match data
  if (models.Match) {
    try {
      console.log('Migrating Match data...');
      
      // Get all existing matches
      const matches = await models.Match.find({});
      
      // Update each match with the new schema fields
      for (const match of matches) {
        // Parse the score to create score_breakdown
        match.score_breakdown = parseScore(match.score);
        match.round_number = getRoundNumber(match.round);
        match.match_num = 0; // Default value
        match.player1_seed = null;
        match.player2_seed = null;
        match.retirement = false;
        match.walkover = false;
        match.momentum_shifts = [];
        match.highlights = [];
        match.live_tracking = {
          current_set: 0,
          current_game: '',
          server_id: null,
          current_point: '',
          last_point_winner: null,
          last_point_description: ''
        };
        match.weather_conditions = {
          temperature: 0,
          humidity: 0,
          wind_speed: 0
        };
        
        // Save the updated match
        await match.save();
      }
      
      console.log(`Migrated ${matches.length} matches successfully`);
    } catch (error) {
      console.error('Error migrating Match data:', error);
    }
  }
  
  // Migrate HeadToHead data
  if (models.HeadToHead) {
    try {
      console.log('Migrating HeadToHead data...');
      
      // Get all existing head-to-head records
      const headToHeads = await models.HeadToHead.find({});
      
      // Update each head-to-head with the new schema fields
      for (const h2h of headToHeads) {
        // Add new fields with default values
        h2h.set_stats = {
          player1_sets_won: 0,
          player2_sets_won: 0,
          tiebreaks_played: 0,
          player1_tiebreaks_won: 0,
          player2_tiebreaks_won: 0
        };
        h2h.game_stats = {
          player1_games_won: 0,
          player2_games_won: 0,
          player1_service_games_won_percentage: 0,
          player2_service_games_won_percentage: 0
        };
        h2h.match_history = [];
        h2h.style_matchup_analysis = '';
        
        // Save the updated head-to-head
        await h2h.save();
      }
      
      console.log(`Migrated ${headToHeads.length} head-to-head records successfully`);
    } catch (error) {
      console.error('Error migrating HeadToHead data:', error);
    }
  }
  
  // Migrate PlayerRanking data
  if (models.PlayerRanking) {
    try {
      console.log('Migrating PlayerRanking data...');
      
      // Get all existing player rankings
      const rankings = await models.PlayerRanking.find({});
      
      // Update each ranking with the new schema fields
      for (const ranking of rankings) {
        // Add new fields with default values
        ranking.race_rank = ranking.rank;
        ranking.race_points = ranking.points;
        ranking.defending_points = 0;
        ranking.points_breakdown = {
          grand_slam: 0,
          masters_1000: 0,
          atp_500: 0,
          atp_250: 0,
          other: 0
        };
        
        // Save the updated ranking
        await ranking.save();
      }
      
      console.log(`Migrated ${rankings.length} player rankings successfully`);
    } catch (error) {
      console.error('Error migrating PlayerRanking data:', error);
    }
  }
  
  console.log('Data migration completed successfully');
};

// Helper function to get country name from country code
const getCountryName = (countryCode) => {
  const countries = {
    'USA': 'United States',
    'GBR': 'Great Britain',
    'ESP': 'Spain',
    'SRB': 'Serbia',
    'RUS': 'Russia',
    'ITA': 'Italy',
    'GER': 'Germany',
    'FRA': 'France',
    'AUS': 'Australia',
    'CAN': 'Canada',
    'JPN': 'Japan',
    'CHN': 'China',
    'POL': 'Poland',
    'NOR': 'Norway',
    'BUL': 'Bulgaria',
    'BLR': 'Belarus',
    'KAZ': 'Kazakhstan',
    'TUN': 'Tunisia',
    'CZE': 'Czech Republic',
    'GRE': 'Greece',
    'LAT': 'Latvia',
    // Add more countries as needed
  };
  
  return countries[countryCode] || countryCode;
};

// Helper function to get country code from location
const getCountryCode = (location) => {
  const countryName = location.split(',')[1]?.trim() || '';
  
  const countryCodes = {
    'United States': 'USA',
    'Great Britain': 'GBR',
    'Spain': 'ESP',
    'Serbia': 'SRB',
    'Russia': 'RUS',
    'Italy': 'ITA',
    'Germany': 'GER',
    'France': 'FRA',
    'Australia': 'AUS',
    'Canada': 'CAN',
    'Japan': 'JPN',
    'China': 'CHN',
    'Poland': 'POL',
    'Norway': 'NOR',
    'Bulgaria': 'BUL',
    'Belarus': 'BLR',
    'Kazakhstan': 'KAZ',
    'Tunisia': 'TUN',
    'Czech Republic': 'CZE',
    'Greece': 'GRE',
    'Latvia': 'LAT',
    // Add more countries as needed
  };
  
  return countryCodes[countryName] || 'UNK';
};

// Helper function to get court speed based on surface
const getCourtSpeed = (surface) => {
  if (surface.includes('Clay')) return 4;
  if (surface.includes('Grass')) return 8;
  if (surface.includes('Hard')) return 6;
  if (surface.includes('Indoor')) return 7;
  return 5; // Default
};

// Helper function to get default points based on tournament category
const getDefaultPoints = (category) => {
  const points = {
    winner: 0,
    finalist: 0,
    semi_finalist: 0,
    quarter_finalist: 0,
    fourth_round: 0,
    third_round: 0,
    second_round: 0,
    first_round: 0
  };
  
  if (category === 'Grand Slam') {
    points.winner = 2000;
    points.finalist = 1200;
    points.semi_finalist = 720;
    points.quarter_finalist = 360;
    points.fourth_round = 180;
    points.third_round = 90;
    points.second_round = 45;
    points.first_round = 10;
  } else if (category === 'Masters 1000') {
    points.winner = 1000;
    points.finalist = 600;
    points.semi_finalist = 360;
    points.quarter_finalist = 180;
    points.fourth_round = 90;
    points.third_round = 45;
    points.second_round = 25;
    points.first_round = 10;
  } else if (category === 'ATP 500') {
    points.winner = 500;
    points.finalist = 300;
    points.semi_finalist = 180;
    points.quarter_finalist = 90;
    points.second_round = 45;
    points.first_round = 0;
  } else if (category === 'ATP 250') {
    points.winner = 250;
    points.finalist = 150;
    points.semi_finalist = 90;
    points.quarter_finalist = 45;
    points.second_round = 20;
    points.first_round = 0;
  }
  
  return points;
};

// Helper function to parse score string into score breakdown
const parseScore = (scoreString) => {
  if (!scoreString) return [];
  
  const scoreBreakdown = [];
  const sets = scoreString.split(', ');
  
  sets.forEach((set, index) => {
    const scores = set.split('-').map(s => s.trim());
    
    if (scores.length === 2) {
      const player1Games = parseInt(scores[0]);
      const player2Games = parseInt(scores[1]);
      
      // Check for tiebreak
      let player1Tiebreak = null;
      let player2Tiebreak = null;
      
      if (scores[0].includes('(')) {
        const tiebreakMatch = scores[0].match(/\((\d+)\)/);
        if (tiebreakMatch) player1Tiebreak = parseInt(tiebreakMatch[1]);
      }
      
      if (scores[1].includes('(')) {
        const tiebreakMatch = scores[1].match(/\((\d+)\)/);
        if (tiebreakMatch) player2Tiebreak = parseInt(tiebreakMatch[1]);
      }
      
      scoreBreakdown.push({
        set: index + 1,
        player1_games: player1Games,
        player2_games: player2Games,
        player1_tiebreak: player1Tiebreak,
        player2_tiebreak: player2Tiebreak
      });
    }
  });
  
  return scoreBreakdown;
};

// Helper function to get round number from round name
const getRoundNumber = (roundName) => {
  const roundMap = {
    'First Round': 1,
    'Round of 128': 1,
    'Second Round': 2,
    'Round of 64': 2,
    'Third Round': 3,
    'Round of 32': 3,
    'Fourth Round': 4,
    'Round of 16': 4,
    'Quarter-final': 5,
    'Quarter-finals': 5,
    'Semi-final': 6,
    'Semi-finals': 6,
    'Final': 7
  };
  
  return roundMap[roundName] || 0;
};

// Main migration function
const migrateDatabase = async () => {
  try {
    console.log('Starting database migration...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Create models
    await createModels();
    
    // Migrate existing data
    await migrateData();
    
    // Set up indexes
    await setupIndexes();
    
    console.log('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during database migration:', error);
    process.exit(1);
  }
};

// Run the migration
migrateDatabase();
