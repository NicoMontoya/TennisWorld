import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import PlayerRanking from '../models/PlayerRanking.js';
import HeadToHead from '../models/HeadToHead.js';

dotenv.config();

const seedRelationalData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully to MongoDB');
    
    // Get existing players and tournaments
    const atpPlayers = await Player.find({ type: 'ATP' }).sort({ rank: 1 }).limit(20);
    const wtaPlayers = await Player.find({ type: 'WTA' }).sort({ rank: 1 }).limit(20);
    const tournaments = await Tournament.find().sort({ start_date: 1 });
    
    if (atpPlayers.length === 0 || wtaPlayers.length === 0 || tournaments.length === 0) {
      throw new Error('No existing players or tournaments found. Please seed the database with basic data first.');
    }
    
    console.log(`Found ${atpPlayers.length} ATP players, ${wtaPlayers.length} WTA players, and ${tournaments.length} tournaments`);
    
    // Clear existing relational data
    console.log('Clearing existing relational data...');
    await Match.deleteMany({});
    await PlayerRanking.deleteMany({});
    await HeadToHead.deleteMany({});
    console.log('Previous relational data cleared');
    
    // Seed PlayerRanking data (historical rankings)
    console.log('Seeding PlayerRanking data...');
    const rankingData = [];
    
    // Create 10 weeks of historical ranking data
    const currentDate = new Date();
    for (let week = 0; week < 10; week++) {
      const rankingDate = new Date(currentDate);
      rankingDate.setDate(rankingDate.getDate() - (week * 7)); // Go back by weeks
      
      const weekNumber = Math.floor((rankingDate - new Date(rankingDate.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)) + 1;
      const year = rankingDate.getFullYear();
      
      // Add ATP rankings for this week
      atpPlayers.forEach((player, index) => {
        // Randomize some movement in rankings over time
        const randomMovement = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const randomPointsChange = Math.floor(Math.random() * 100) - 50; // -50 to +50
        
        rankingData.push({
          player_id: player.player_id,
          type: 'ATP',
          rank: index + 1 + (week > 0 ? randomMovement : 0), // Small random movement in rank
          points: player.points + (week > 0 ? randomPointsChange : 0), // Small random change in points
          ranking_date: rankingDate,
          movement: randomMovement,
          week_number: weekNumber,
          year: year
        });
      });
      
      // Add WTA rankings for this week
      wtaPlayers.forEach((player, index) => {
        const randomMovement = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const randomPointsChange = Math.floor(Math.random() * 100) - 50; // -50 to +50
        
        rankingData.push({
          player_id: player.player_id,
          type: 'WTA',
          rank: index + 1 + (week > 0 ? randomMovement : 0),
          points: player.points + (week > 0 ? randomPointsChange : 0),
          ranking_date: rankingDate,
          movement: randomMovement,
          week_number: weekNumber,
          year: year
        });
      });
    }
    
    await PlayerRanking.insertMany(rankingData);
    console.log(`Inserted ${rankingData.length} historical ranking records`);
    
    // Seed Match data
    console.log('Seeding Match data...');
    const matchData = [];
    let matchId = 1;
    
    // Create matches for each tournament
    for (const tournament of tournaments) {
      const isAtp = Math.random() > 0.5; // Randomly choose ATP or WTA
      const players = isAtp ? atpPlayers : wtaPlayers;
      const rounds = ['First Round', 'Second Round', 'Quarter-Final', 'Semi-Final', 'Final'];
      
      // For simplicity, create a single-elimination tournament structure
      for (const round of rounds) {
        const matchesInRound = round === 'Final' ? 1 : 
                              round === 'Semi-Final' ? 2 : 
                              round === 'Quarter-Final' ? 4 : 
                              round === 'Second Round' ? 8 : 16;
        
        for (let i = 0; i < matchesInRound; i++) {
          // Select two random players for the match
          const player1Index = Math.floor(Math.random() * players.length);
          let player2Index;
          do {
            player2Index = Math.floor(Math.random() * players.length);
          } while (player1Index === player2Index);
          
          const player1 = players[player1Index];
          const player2 = players[player2Index];
          
          // Determine winner (higher-ranked player has better chance)
          const player1Rank = player1.rank;
          const player2Rank = player2.rank;
          const totalRank = player1Rank + player2Rank;
          const player1WinProbability = 1 - (player1Rank / totalRank); // Higher rank (lower number) = higher probability
          const isPlayer1Winner = Math.random() < player1WinProbability;
          const winnerId = isPlayer1Winner ? player1.player_id : player2.player_id;
          
          // Generate a realistic tennis score
          const score = generateTennisScore();
          
          // Set match date within tournament dates
          const tournamentDuration = (new Date(tournament.end_date) - new Date(tournament.start_date)) / (1000 * 60 * 60 * 24);
          const dayOffset = Math.floor(Math.random() * tournamentDuration);
          const matchDate = new Date(tournament.start_date);
          matchDate.setDate(matchDate.getDate() + dayOffset);
          
          // Create match
          matchData.push({
            match_id: matchId++,
            tournament_id: tournament.tournament_id,
            round: round,
            player1_id: player1.player_id,
            player2_id: player2.player_id,
            winner_id: winnerId,
            score: score,
            match_date: matchDate,
            status: 'Completed',
            court: ['Center Court', 'Court 1', 'Court 2', 'Court 3'][Math.floor(Math.random() * 4)],
            duration: Math.floor(Math.random() * 180) + 60, // 60-240 minutes
            stats: {
              player1_aces: Math.floor(Math.random() * 15),
              player2_aces: Math.floor(Math.random() * 15),
              player1_double_faults: Math.floor(Math.random() * 8),
              player2_double_faults: Math.floor(Math.random() * 8),
              player1_first_serve_percentage: Math.floor(Math.random() * 30) + 50, // 50-80%
              player2_first_serve_percentage: Math.floor(Math.random() * 30) + 50, // 50-80%
            }
          });
        }
      }
    }
    
    await Match.insertMany(matchData);
    console.log(`Inserted ${matchData.length} match records`);
    
    // Seed HeadToHead data based on matches
    console.log('Seeding HeadToHead data...');
    const headToHeadMap = new Map();
    
    // Process all matches to build head-to-head records
    for (const match of matchData) {
      const player1Id = Math.min(match.player1_id, match.player2_id);
      const player2Id = Math.max(match.player1_id, match.player2_id);
      const key = `${player1Id}-${player2Id}`;
      
      // Find the tournament for this match
      const tournament = tournaments.find(t => t.tournament_id === match.tournament_id);
      if (!tournament) continue;
      
      // Determine surface and category
      const surface = tournament.surface.toLowerCase().includes('hard') ? 'hard' : 
                     tournament.surface.toLowerCase().includes('clay') ? 'clay' : 
                     tournament.surface.toLowerCase().includes('grass') ? 'grass' : 'indoor';
      
      const category = tournament.category.toLowerCase().includes('grand slam') ? 'grand_slam' : 
                      tournament.category.toLowerCase().includes('masters 1000') ? 'masters_1000' : 
                      tournament.category.toLowerCase().includes('500') ? 'atp_500' : 
                      tournament.category.toLowerCase().includes('250') ? 'atp_250' : 'other';
      
      // Get or create head-to-head record
      if (!headToHeadMap.has(key)) {
        headToHeadMap.set(key, {
          player1_id: player1Id,
          player2_id: player2Id,
          matches_count: 0,
          player1_wins: 0,
          player2_wins: 0,
          last_match_date: null,
          last_match_id: null,
          surface_stats: {
            hard: { matches: 0, player1_wins: 0, player2_wins: 0 },
            clay: { matches: 0, player1_wins: 0, player2_wins: 0 },
            grass: { matches: 0, player1_wins: 0, player2_wins: 0 },
            indoor: { matches: 0, player1_wins: 0, player2_wins: 0 }
          },
          tournament_category_stats: {
            grand_slam: { matches: 0, player1_wins: 0, player2_wins: 0 },
            masters_1000: { matches: 0, player1_wins: 0, player2_wins: 0 },
            atp_500: { matches: 0, player1_wins: 0, player2_wins: 0 },
            atp_250: { matches: 0, player1_wins: 0, player2_wins: 0 },
            other: { matches: 0, player1_wins: 0, player2_wins: 0 }
          }
        });
      }
      
      const h2h = headToHeadMap.get(key);
      h2h.matches_count++;
      
      // Update last match info
      if (!h2h.last_match_date || new Date(match.match_date) > new Date(h2h.last_match_date)) {
        h2h.last_match_date = match.match_date;
        h2h.last_match_id = match.match_id;
      }
      
      // Update win counts
      const isPlayer1Winner = match.winner_id === player1Id;
      if (isPlayer1Winner) {
        h2h.player1_wins++;
        h2h.surface_stats[surface].player1_wins++;
        h2h.tournament_category_stats[category].player1_wins++;
      } else {
        h2h.player2_wins++;
        h2h.surface_stats[surface].player2_wins++;
        h2h.tournament_category_stats[category].player2_wins++;
      }
      
      // Update surface and category stats
      h2h.surface_stats[surface].matches++;
      h2h.tournament_category_stats[category].matches++;
    }
    
    // Convert map to array and insert
    const headToHeadData = Array.from(headToHeadMap.values());
    await HeadToHead.insertMany(headToHeadData);
    console.log(`Inserted ${headToHeadData.length} head-to-head records`);
    
    console.log('Database seeded successfully with relational data');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database with relational data:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Code:', error.code);
    }
    
    process.exit(1);
  }
};

// Helper function to generate realistic tennis scores
function generateTennisScore() {
  const sets = Math.random() > 0.2 ? 3 : 5; // 20% chance of 5 sets, 80% chance of 3 sets
  let score = '';
  
  for (let i = 0; i < sets; i++) {
    const player1Games = Math.floor(Math.random() * 5) + 2; // 2-6 games
    let player2Games;
    
    if (player1Games === 6) {
      // If player1 has 6 games, player2 has 0-4 games
      player2Games = Math.floor(Math.random() * 5);
    } else {
      // If player1 has 2-5 games, player2 has 6 or 7 games
      player2Games = Math.random() > 0.8 ? 7 : 6;
    }
    
    // Add tiebreak score if 6-6
    if (player1Games === 6 && player2Games === 6) {
      const tiebreakScore = Math.floor(Math.random() * 5) + 7; // 7-11 points
      const otherScore = Math.floor(Math.random() * (tiebreakScore - 2)) + 1; // 1 to (tiebreakScore-2)
      
      if (Math.random() > 0.5) {
        score += `${player1Games}-${player2Games}(${tiebreakScore}-${otherScore}) `;
      } else {
        score += `${player1Games}-${player2Games}(${otherScore}-${tiebreakScore}) `;
      }
    } else {
      score += `${player1Games}-${player2Games} `;
    }
  }
  
  return score.trim();
}

// Run the seed function
seedRelationalData();
