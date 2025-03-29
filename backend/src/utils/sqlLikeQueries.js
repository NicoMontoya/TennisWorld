import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import PlayerRanking from '../models/PlayerRanking.js';
import HeadToHead from '../models/HeadToHead.js';

dotenv.config();

const runSqlLikeQueries = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    console.log('\n=== SQL-like Queries in MongoDB ===\n');
    
    // Example 1: Simple SELECT
    // SQL: SELECT player_name, country, rank FROM players WHERE type = 'ATP' ORDER BY rank LIMIT 10
    console.log('Example 1: SELECT player_name, country, rank FROM players WHERE type = "ATP" ORDER BY rank LIMIT 10');
    const topAtpPlayers = await Player.find({ type: 'ATP' })
      .select('player_name country rank')
      .sort({ rank: 1 })
      .limit(10);
    
    console.table(topAtpPlayers.map(p => ({
      player_name: p.player_name,
      country: p.country,
      rank: p.rank
    })));
    
    // Example 2: JOIN (using populate)
    // SQL: SELECT m.match_id, m.score, t.name as tournament_name, t.surface 
    //      FROM matches m JOIN tournaments t ON m.tournament_id = t.tournament_id LIMIT 5
    console.log('\nExample 2: SELECT m.match_id, m.score, t.name as tournament_name, t.surface FROM matches m JOIN tournaments t ON m.tournament_id = t.tournament_id LIMIT 5');
    
    // First check if we have match data
    const matchCount = await Match.countDocuments();
    if (matchCount === 0) {
      console.log('No match data found. Please run seedRelationalData.js first.');
    } else {
      const matchesWithTournaments = await Match.aggregate([
        { $limit: 5 },
        {
          $lookup: {
            from: 'tournaments',
            localField: 'tournament_id',
            foreignField: 'tournament_id',
            as: 'tournament'
          }
        },
        { $unwind: '$tournament' },
        {
          $project: {
            match_id: 1,
            score: 1,
            'tournament_name': '$tournament.name',
            'tournament_surface': '$tournament.surface'
          }
        }
      ]);
      
      console.table(matchesWithTournaments);
    }
    
    // Example 3: Multiple JOINs
    // SQL: SELECT m.match_id, p1.player_name as player1, p2.player_name as player2, 
    //      t.name as tournament, m.score
    //      FROM matches m 
    //      JOIN players p1 ON m.player1_id = p1.player_id
    //      JOIN players p2 ON m.player2_id = p2.player_id
    //      JOIN tournaments t ON m.tournament_id = t.tournament_id
    //      LIMIT 5
    console.log('\nExample 3: Multiple JOINs - Match details with player names and tournament');
    
    if (matchCount === 0) {
      console.log('No match data found. Please run seedRelationalData.js first.');
    } else {
      const matchDetails = await Match.aggregate([
        { $limit: 5 },
        {
          $lookup: {
            from: 'players',
            localField: 'player1_id',
            foreignField: 'player_id',
            as: 'player1'
          }
        },
        { $unwind: '$player1' },
        {
          $lookup: {
            from: 'players',
            localField: 'player2_id',
            foreignField: 'player_id',
            as: 'player2'
          }
        },
        { $unwind: '$player2' },
        {
          $lookup: {
            from: 'tournaments',
            localField: 'tournament_id',
            foreignField: 'tournament_id',
            as: 'tournament'
          }
        },
        { $unwind: '$tournament' },
        {
          $project: {
            match_id: 1,
            player1: '$player1.player_name',
            player2: '$player2.player_name',
            tournament: '$tournament.name',
            score: 1,
            match_date: 1
          }
        }
      ]);
      
      console.table(matchDetails);
    }
    
    // Example 4: GROUP BY with aggregation
    // SQL: SELECT surface, COUNT(*) as tournament_count FROM tournaments GROUP BY surface
    console.log('\nExample 4: GROUP BY - Tournament count by surface');
    const tournamentsBySurface = await Tournament.aggregate([
      {
        $group: {
          _id: '$surface',
          tournament_count: { $sum: 1 }
        }
      },
      {
        $project: {
          surface: '$_id',
          tournament_count: 1,
          _id: 0
        }
      },
      { $sort: { tournament_count: -1 } }
    ]);
    
    console.table(tournamentsBySurface);
    
    // Example 5: Complex aggregation (player win percentage)
    // SQL-like: SELECT player_id, player_name, 
    //           COUNT(CASE WHEN winner_id = player_id THEN 1 END) as wins,
    //           COUNT(*) as total_matches,
    //           (wins / total_matches) * 100 as win_percentage
    //           FROM matches JOIN players ON player_id IN (player1_id, player2_id)
    //           GROUP BY player_id
    //           ORDER BY win_percentage DESC
    //           LIMIT 10
    console.log('\nExample 5: Complex aggregation - Player win percentage');
    
    if (matchCount === 0) {
      console.log('No match data found. Please run seedRelationalData.js first.');
    } else {
      // First get all matches
      const allMatches = await Match.find().lean();
      
      // Create a map to track player stats
      const playerStats = new Map();
      
      // Process each match
      allMatches.forEach(match => {
        // Player 1
        if (!playerStats.has(match.player1_id)) {
          playerStats.set(match.player1_id, { wins: 0, matches: 0 });
        }
        playerStats.get(match.player1_id).matches++;
        if (match.winner_id === match.player1_id) {
          playerStats.get(match.player1_id).wins++;
        }
        
        // Player 2
        if (!playerStats.has(match.player2_id)) {
          playerStats.set(match.player2_id, { wins: 0, matches: 0 });
        }
        playerStats.get(match.player2_id).matches++;
        if (match.winner_id === match.player2_id) {
          playerStats.get(match.player2_id).wins++;
        }
      });
      
      // Get player details
      const players = await Player.find({
        player_id: { $in: Array.from(playerStats.keys()) }
      }).lean();
      
      // Create player map for lookup
      const playerMap = new Map(players.map(p => [p.player_id, p]));
      
      // Calculate win percentages
      const winPercentages = Array.from(playerStats.entries())
        .map(([playerId, stats]) => {
          const player = playerMap.get(playerId) || {};
          return {
            player_id: playerId,
            player_name: player.player_name || 'Unknown',
            wins: stats.wins,
            matches: stats.matches,
            win_percentage: (stats.matches > 0) ? ((stats.wins / stats.matches) * 100).toFixed(2) : 0
          };
        })
        .sort((a, b) => b.win_percentage - a.win_percentage)
        .slice(0, 10);
      
      console.table(winPercentages);
    }
    
    // Example 6: Subquery-like operation (players who have won against top 10 players)
    // SQL-like: SELECT p.player_name, p.rank
    //           FROM players p
    //           WHERE p.player_id IN (
    //             SELECT m.winner_id 
    //             FROM matches m
    //             JOIN players top ON (m.player1_id = top.player_id OR m.player2_id = top.player_id)
    //             WHERE top.rank <= 10 AND m.winner_id != top.player_id
    //           )
    //           ORDER BY p.rank
    console.log('\nExample 6: Subquery-like - Players who have won against top 10 players');
    
    if (matchCount === 0) {
      console.log('No match data found. Please run seedRelationalData.js first.');
    } else {
      // Get top 10 players
      const top10Players = await Player.find({ type: 'ATP' })
        .sort({ rank: 1 })
        .limit(10)
        .lean();
      
      const top10Ids = top10Players.map(p => p.player_id);
      
      // Find matches where a top 10 player lost
      const upsetMatches = await Match.find({
        $or: [
          { player1_id: { $in: top10Ids }, winner_id: { $ne: null }, winner_id: { $not: { $in: top10Ids } } },
          { player2_id: { $in: top10Ids }, winner_id: { $ne: null }, winner_id: { $not: { $in: top10Ids } } }
        ]
      }).lean();
      
      // Get unique winner IDs
      const giantKillerIds = [...new Set(upsetMatches.map(m => m.winner_id))];
      
      // Get player details
      const giantKillers = await Player.find({
        player_id: { $in: giantKillerIds }
      })
        .select('player_id player_name rank country')
        .sort({ rank: 1 })
        .lean();
      
      console.table(giantKillers);
    }
    
    // Example 7: Historical ranking trends for a specific player
    // SQL-like: SELECT ranking_date, rank, points
    //           FROM player_rankings
    //           WHERE player_id = ? AND type = 'ATP'
    //           ORDER BY ranking_date
    console.log('\nExample 7: Historical ranking trends for a specific player');
    
    // First check if we have ranking data
    const rankingCount = await PlayerRanking.countDocuments();
    if (rankingCount === 0) {
      console.log('No ranking data found. Please run seedRelationalData.js first.');
    } else {
      // Get a random player
      const randomPlayer = await Player.findOne({ type: 'ATP' }).lean();
      
      if (randomPlayer) {
        console.log(`Historical rankings for ${randomPlayer.player_name}:`);
        
        const rankingHistory = await PlayerRanking.find({
          player_id: randomPlayer.player_id,
          type: 'ATP'
        })
          .select('ranking_date rank points')
          .sort({ ranking_date: 1 })
          .lean();
        
        console.table(rankingHistory.map(r => ({
          date: r.ranking_date.toISOString().split('T')[0],
          rank: r.rank,
          points: r.points
        })));
      }
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error running SQL-like queries:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error Code:', error.code);
    }
    
    process.exit(1);
  }
};

// Run the queries
runSqlLikeQueries();
