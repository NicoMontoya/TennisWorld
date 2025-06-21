import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import PlayerRanking from '../models/PlayerRanking.js';
import HeadToHead from '../models/HeadToHead.js';
import TournamentDraw from '../models/TournamentDraw.js';
import PlayerStats from '../models/PlayerStats.js';
import PlayerForm from '../models/PlayerForm.js';
import MatchPrediction from '../models/MatchPrediction.js';
import User from '../models/User.js';
import UserPrediction from '../models/UserPrediction.js';
import PredictionLeaderboard from '../models/PredictionLeaderboard.js';
import PlayerRankingHistory from '../models/PlayerRankingHistory.js';
import PlayerInjury from '../models/PlayerInjury.js';

// Load environment variables
dotenv.config();

// Helper function to generate random date within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get random item from array
const randomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random number within a range
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get random boolean
const randomBoolean = () => {
  return Math.random() > 0.5;
};

// Helper function to generate random score
const generateRandomScore = () => {
  const sets = randomNumber(2, 3);
  let score = '';
  
  for (let i = 0; i < sets; i++) {
    const player1Games = randomNumber(0, 7);
    let player2Games = 0;
    
    if (player1Games === 6) {
      player2Games = randomNumber(0, 4);
    } else if (player1Games === 7) {
      player2Games = randomNumber(5, 6);
    } else if (player1Games < 6) {
      player2Games = 6;
    }
    
    score += `${player1Games}-${player2Games}`;
    if (i < sets - 1) score += ', ';
  }
  
  return score;
};

// Main function to seed all enhanced data
async function seedAllEnhancedData() {
  console.log('Starting to seed enhanced data...');
  
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Seed data in sequence
    await seedUsers();
    await seedPlayerStats();
    await seedPlayerForm();
    await seedTournamentDraws();
    await seedMatchPredictions();
    await seedUserPredictions();
    await seedPredictionLeaderboards();
    await seedPlayerRankingHistory();
    await seedPlayerInjuries();
    
    console.log('All enhanced data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding enhanced data:', error);
    process.exit(1);
  }
}

// Seed Users
async function seedUsers() {
  console.log('Seeding Users...');
  
  // Check if users already exist
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log(`Skipping User seeding, ${userCount} users already exist`);
    return;
  }
  
  const users = [];
  
  // Create admin user
  users.push({
    user_id: 1,
    username: 'admin',
    email: 'admin@tennisworld.com',
    password: 'password123',
    first_name: 'Admin',
    last_name: 'User',
    account_type: 'Admin',
    registration_date: new Date('2024-01-01'),
    last_login: new Date(),
    preferences: {
      favorite_players: [1, 2, 3],
      favorite_tournaments: [1, 2, 3, 4],
      preferred_surfaces: ['Hard', 'Clay', 'Grass'],
      notification_settings: {
        email_notifications: true,
        match_alerts: true,
        tournament_updates: true,
        player_news: true
      },
      display_settings: {
        dark_mode: false,
        stats_display_preference: 'Advanced',
        default_ranking_type: 'ATP'
      }
    }
  });
  
  // Create regular users
  for (let i = 2; i <= 20; i++) {
    users.push({
      user_id: i,
      username: `user${i}`,
      email: `user${i}@example.com`,
      password: 'password123',
      first_name: `User${i}`,
      last_name: 'Test',
      account_type: randomItem(['Free', 'Premium', 'Free']),
      registration_date: randomDate(new Date('2024-01-01'), new Date()),
      last_login: randomDate(new Date('2024-06-01'), new Date()),
      prediction_stats: {
        total_predictions: randomNumber(10, 100),
        correct_predictions: randomNumber(5, 50),
        accuracy_percentage: randomNumber(40, 90),
        points: randomNumber(100, 1000)
      }
    });
  }
  
  // Save users to database
  await User.insertMany(users);
  console.log(`${users.length} users seeded successfully`);
}

// Seed PlayerStats
async function seedPlayerStats() {
  console.log('Seeding PlayerStats...');
  
  // Check if player stats already exist
  const statsCount = await PlayerStats.countDocuments();
  if (statsCount > 0) {
    console.log(`Skipping PlayerStats seeding, ${statsCount} stats already exist`);
    return;
  }
  
  // Get all players
  const players = await Player.find().limit(30);
  
  const playerStats = [];
  const currentYear = new Date().getFullYear();
  
  // Create stats for each player
  for (const player of players) {
    // Create overall stats for current year
    playerStats.push({
      player_id: player.player_id,
      year: currentYear,
      surface: 'All',
      tournament_level: 'All',
      serve_stats: {
        aces_per_match: randomNumber(1, 20),
        first_serve_percentage: randomNumber(50, 75),
        service_games_won_percentage: randomNumber(60, 95)
      },
      return_stats: {
        break_points_converted_percentage: randomNumber(30, 60)
      },
      overall_stats: {
        win_percentage: randomNumber(40, 80)
      },
      matches_played: randomNumber(20, 60),
      matches_won: randomNumber(10, 40),
      matches_lost: randomNumber(5, 20)
    });
    
    // Create stats for each surface
    for (const surface of ['Hard', 'Clay', 'Grass']) {
      playerStats.push({
        player_id: player.player_id,
        year: currentYear,
        surface: surface,
        tournament_level: 'All',
        serve_stats: {
          aces_per_match: randomNumber(1, 20),
          first_serve_percentage: randomNumber(50, 75),
          service_games_won_percentage: randomNumber(60, 95)
        },
        return_stats: {
          break_points_converted_percentage: randomNumber(30, 60)
        },
        overall_stats: {
          win_percentage: randomNumber(40, 80)
        },
        matches_played: randomNumber(5, 20),
        matches_won: randomNumber(2, 15),
        matches_lost: randomNumber(1, 10)
      });
    }
  }
  
  // Save player stats to database
  await PlayerStats.insertMany(playerStats);
  console.log(`${playerStats.length} player stats seeded successfully`);
}

// Seed PlayerForm
async function seedPlayerForm() {
  console.log('Seeding PlayerForm...');
  
  // Check if player form already exists
  const formCount = await PlayerForm.countDocuments();
  if (formCount > 0) {
    console.log(`Skipping PlayerForm seeding, ${formCount} forms already exist`);
    return;
  }
  
  // Get all players
  const players = await Player.find().limit(30);
  
  const playerForms = [];
  
  // Create form for each player
  for (const player of players) {
    // Create player form
    playerForms.push({
      player_id: player.player_id,
      current_streak: {
        type: randomItem(['Win', 'Loss']),
        count: randomNumber(1, 5)
      },
      form_rating: randomNumber(1, 10),
      recent_performance: {
        matches_played: randomNumber(5, 20),
        wins: randomNumber(2, 15),
        losses: randomNumber(1, 10),
        win_percentage: randomNumber(20, 90)
      },
      surface_form: {
        hard: {
          matches: randomNumber(5, 20),
          wins: randomNumber(2, 15),
          losses: randomNumber(1, 10),
          win_percentage: randomNumber(40, 80)
        },
        clay: {
          matches: randomNumber(5, 20),
          wins: randomNumber(2, 15),
          losses: randomNumber(1, 10),
          win_percentage: randomNumber(40, 80)
        },
        grass: {
          matches: randomNumber(5, 20),
          wins: randomNumber(2, 15),
          losses: randomNumber(1, 10),
          win_percentage: randomNumber(40, 80)
        }
      },
      momentum_indicators: {
        ranking_trend: randomNumber(-5, 5),
        injury_status: randomItem(['Healthy', 'Minor Injury', 'Recovering', 'Healthy']),
        confidence_rating: randomNumber(3, 10)
      }
    });
  }
  
  // Save player forms to database
  await PlayerForm.insertMany(playerForms);
  console.log(`${playerForms.length} player forms seeded successfully`);
}

// Seed TournamentDraws
async function seedTournamentDraws() {
  console.log('Seeding TournamentDraws...');
  
  // Check if tournament draws already exist
  const drawCount = await TournamentDraw.countDocuments();
  if (drawCount > 0) {
    console.log(`Skipping TournamentDraw seeding, ${drawCount} draws already exist`);
    return;
  }
  
  // Get upcoming tournaments
  const tournaments = await Tournament.find({ status: { $in: ['Upcoming', 'Ongoing'] } }).limit(5);
  
  const tournamentDraws = [];
  
  // Create draw for each tournament
  for (const tournament of tournaments) {
    // Create tournament draw
    tournamentDraws.push({
      draw_id: tournament.tournament_id * 10 + 1,
      tournament_id: tournament.tournament_id,
      draw_type: 'Main',
      draw_size: 32,
      seeded_players: [],
      draw_structure: [],
      draw_ceremony_date: new Date(tournament.start_date)
    });
  }
  
  // Save tournament draws to database
  await TournamentDraw.insertMany(tournamentDraws);
  console.log(`${tournamentDraws.length} tournament draws seeded successfully`);
}

// Seed MatchPredictions
async function seedMatchPredictions() {
  console.log('Seeding MatchPredictions...');
  
  // Check if match predictions already exist
  const predictionCount = await MatchPrediction.countDocuments();
  if (predictionCount > 0) {
    console.log(`Skipping MatchPrediction seeding, ${predictionCount} predictions already exist`);
    return;
  }
  
  // Get upcoming matches
  const matches = await Match.find({ status: 'Scheduled' }).limit(10);
  
  const matchPredictions = [];
  
  // Create prediction for each match
  for (const match of matches) {
    // Calculate win probabilities
    const player1Probability = randomNumber(30, 70);
    const player2Probability = 100 - player1Probability;
    
    // Determine predicted winner
    const predictedWinnerId = player1Probability > player2Probability ? match.player1_id : match.player2_id;
    
    // Create match prediction
    matchPredictions.push({
      prediction_id: match.match_id * 10 + 1,
      match_id: match.match_id,
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      tournament_id: match.tournament_id,
      prediction_date: new Date(),
      predicted_winner_id: predictedWinnerId,
      win_probability: {
        player1: player1Probability,
        player2: player2Probability
      },
      predicted_score: generateRandomScore(),
      predicted_duration: randomNumber(90, 240),
      factors: {
        head_to_head: 0.2,
        recent_form: 0.25,
        surface_performance: 0.2,
        tournament_history: 0.1,
        ranking: 0.15,
        playing_style_matchup: 0.1
      },
      model_version: '1.0',
      is_system_prediction: true
    });
  }
  
  // Save match predictions to database
  await MatchPrediction.insertMany(matchPredictions);
  console.log(`${matchPredictions.length} match predictions seeded successfully`);
}

// Seed UserPredictions
async function seedUserPredictions() {
  console.log('Seeding UserPredictions...');
  
  // Check if user predictions already exist
  const predictionCount = await UserPrediction.countDocuments();
  if (predictionCount > 0) {
    console.log(`Skipping UserPrediction seeding, ${predictionCount} predictions already exist`);
    return;
  }
  
  // Get upcoming matches
  const matches = await Match.find({ status: 'Scheduled' }).limit(10);
  
  // Get users
  const users = await User.find().limit(5);
  
  const userPredictions = [];
  let predictionId = 1;
  
  // Create predictions for each user
  for (const user of users) {
    // Each user predicts some matches
    for (const match of matches) {
      // Determine predicted winner
      const predictedWinnerId = randomBoolean() ? match.player1_id : match.player2_id;
      
      // Create user prediction
      userPredictions.push({
        prediction_id: predictionId++,
        user_id: user.user_id,
        match_id: match.match_id,
        tournament_id: match.tournament_id,
        predicted_winner_id: predictedWinnerId,
        predicted_score: generateRandomScore(),
        prediction_date: new Date(),
        confidence_level: randomNumber(1, 10),
        is_public: randomBoolean()
      });
    }
  }
  
  // Save user predictions to database
  await UserPrediction.insertMany(userPredictions);
  console.log(`${userPredictions.length} user predictions seeded successfully`);
}

// Seed PredictionLeaderboards
async function seedPredictionLeaderboards() {
  console.log('Seeding PredictionLeaderboards...');
  
  // Check if prediction leaderboards already exist
  const leaderboardCount = await PredictionLeaderboard.countDocuments();
  if (leaderboardCount > 0) {
    console.log(`Skipping PredictionLeaderboard seeding, ${leaderboardCount} leaderboards already exist`);
    return;
  }
  
  // Get users
  const users = await User.find().limit(10);
  
  const leaderboards = [];
  const currentYear = new Date().getFullYear();
  
  // Create season leaderboard
  const seasonRankings = users.map((user, index) => {
    return {
      rank: index + 1,
      user_id: user.user_id,
      username: user.username,
      points: randomNumber(100, 1000),
      predictions_made: randomNumber(10, 100),
      correct_predictions: randomNumber(5, 50),
      accuracy_percentage: randomNumber(40, 90)
    };
  });
  
  leaderboards.push({
    leaderboard_id: 1,
    season: currentYear,
    timeframe: 'Season',
    start_date: new Date(`${currentYear}-01-01`),
    end_date: new Date(`${currentYear}-12-31`),
    rankings: seasonRankings
  });
  
  // Save leaderboards to database
  await PredictionLeaderboard.insertMany(leaderboards);
  console.log(`${leaderboards.length} prediction leaderboards seeded successfully`);
}

// Seed PlayerRankingHistory
async function seedPlayerRankingHistory() {
  console.log('Seeding PlayerRankingHistory...');
  
  // Check if player ranking history already exists
  const historyCount = await PlayerRankingHistory.countDocuments();
  if (historyCount > 0) {
    console.log(`Skipping PlayerRankingHistory seeding, ${historyCount} history records already exist`);
    return;
  }
  
  // Get players
  const players = await Player.find().limit(10);
  
  const rankingHistories = [];
  const currentYear = new Date().getFullYear();
  
  // Create ranking history for each player
  for (const player of players) {
    // Create weekly rankings for the past year
    for (let week = 1; week <= 52; week++) {
      const rankingDate = new Date(currentYear, 0, week * 7);
      const rank = randomNumber(1, 100);
      const points = randomNumber(1000, 10000);
      
      rankingHistories.push({
        player_id: player.player_id,
        type: player.type || 'ATP',
        rank: rank,
        points: points,
        ranking_date: rankingDate,
        week_number: week,
        year: currentYear
      });
    }
  }
  
  // Save ranking histories to database
  await PlayerRankingHistory.insertMany(rankingHistories);
  console.log(`${rankingHistories.length} player ranking history records seeded successfully`);
}

// Seed PlayerInjuries
async function seedPlayerInjuries() {
  console.log('Seeding PlayerInjuries...');
  
  // Check if player injuries already exist
  const injuryCount = await PlayerInjury.countDocuments();
  if (injuryCount > 0) {
    console.log(`Skipping PlayerInjury seeding, ${injuryCount} injuries already exist`);
    return;
  }
  
  // Get players
  const players = await Player.find().limit(20);
  
  const injuries = [];
  let injuryId = 1;
  
  // Create injuries for some players
  for (let i = 0; i < 5; i++) {
    const player = players[i];
    
    // Create injury
    injuries.push({
      injury_id: injuryId++,
      player_id: player.player_id,
      injury_type: randomItem(['Sprain', 'Strain', 'Tear', 'Fracture', 'Inflammation']),
      body_part: randomItem(['Ankle', 'Knee', 'Shoulder', 'Wrist', 'Back', 'Hip']),
      severity: randomItem(['Minor', 'Moderate', 'Severe']),
      start_date: randomDate(new Date(new Date().setMonth(new Date().getMonth() - 3)), new Date()),
      expected_return_date: randomDate(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 3))),
      status: randomItem(['Active', 'Recovering', 'Returned']),
      notes: `${player.player_name} is dealing with a ${randomItem(['minor', 'serious', 'nagging'])} injury.`
    });
  }
  
  // Save injuries to database
  await PlayerInjury.insertMany(injuries);
  console.log(`${injuries.length} player injuries seeded successfully`);
}

// Run the seeding process
seedAllEnhancedData();
