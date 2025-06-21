import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import PlayerStats from '../models/PlayerStats.js';
import PlayerForm from '../models/PlayerForm.js';
import PlayerInjury from '../models/PlayerInjury.js';
import PlayerRankingHistory from '../models/PlayerRankingHistory.js';
import TournamentDraw from '../models/TournamentDraw.js';
import { getTournamentDetails, getRankings as fetchRankings, getTournaments as fetchTournaments } from '../services/tennisApiService.js';

// @desc    Get player rankings by type (ATP or WTA)
// @route   GET /api/tennis/rankings/:type
// @access  Public
export const getRankings = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate type parameter
    if (type !== 'ATP' && type !== 'WTA') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ranking type. Must be ATP or WTA'
      });
    }
    
    // Get rankings from MongoDB
    console.log(`Getting ${type} rankings from MongoDB...`);
    const players = await Player.find({ type })
      .sort({ rank: 1 })
      .lean();
    
    if (!players || players.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `No ${type} rankings found in the database`
      });
    }
    
    // Format the response to match the API response structure
    // that the frontend expects
    res.json({
      status: 'success',
      data: {
        rankings: players
      }
    });
  } catch (error) {
    console.error('Error fetching rankings from MongoDB:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching rankings'
    });
  }
};

// @desc    Get player details by ID
// @route   GET /api/tennis/players/:id
// @access  Public
export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findOne({ player_id: id });
    
    if (!player) {
      return res.status(404).json({
        status: 'error',
        message: 'Player not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        player
      }
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching player details'
    });
  }
};

// @desc    Get player matches by player ID
// @route   GET /api/tennis/players/:id/matches
// @access  Public
export const getPlayerMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const playerId = parseInt(id, 10);
    
    // Find matches where the player is either player1 or player2
    const matches = await Match.find({
      $or: [
        { player1_id: playerId },
        { player2_id: playerId }
      ]
    }).sort({ date: -1 }).limit(20).lean(); // Get most recent 20 matches
    
    if (!matches || matches.length === 0) {
      return res.json({
        status: 'success',
        data: {
          matches: []
        }
      });
    }
    
    // Get tournament details for these matches
    const tournamentIds = [...new Set(matches.map(match => match.tournament_id))];
    const tournaments = await Tournament.find({ tournament_id: { $in: tournamentIds } }).lean();
    
    // Create a map of tournament_id to tournament details
    const tournamentMap = {};
    tournaments.forEach(tournament => {
      tournamentMap[tournament.tournament_id] = tournament;
    });
    
    // Get opponent player details
    const opponentIds = matches.map(match => 
      match.player1_id === playerId ? match.player2_id : match.player1_id
    );
    const opponents = await Player.find({ player_id: { $in: opponentIds } }).lean();
    
    // Create a map of player_id to player details
    const opponentMap = {};
    opponents.forEach(opponent => {
      opponentMap[opponent.player_id] = opponent;
    });
    
    // Enhance matches with tournament and opponent details
    const enhancedMatches = matches.map(match => {
      const tournament = tournamentMap[match.tournament_id] || {};
      const isPlayer1 = match.player1_id === playerId;
      const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
      const opponent = opponentMap[opponentId] || {};
      
      return {
        ...match,
        tournament_name: tournament.name || 'Unknown Tournament',
        tournament_category: tournament.category || 'Unknown',
        tournament_surface: tournament.surface || 'Unknown',
        opponent_name: isPlayer1 ? match.player2_name : match.player1_name,
        opponent_country: opponent.country || 'Unknown',
        is_winner: match.winner_id === playerId
      };
    });
    
    res.json({
      status: 'success',
      data: {
        matches: enhancedMatches
      }
    });
  } catch (error) {
    console.error('Error fetching player matches:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching player matches'
    });
  }
};

// @desc    Get player statistics by player ID
// @route   GET /api/tennis/players/:id/stats
// @access  Public
export const getPlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const playerId = parseInt(id, 10);
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Find player stats for the current year and all surfaces
    const stats = await PlayerStats.findOne({
      player_id: playerId,
      year: currentYear,
      surface: 'All',
      tournament_level: 'All'
    }).lean();
    
    if (!stats) {
      return res.status(404).json({
        status: 'success',
        data: {
          stats: null
        }
      });
    }
    
    res.json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching player statistics'
    });
  }
};

// @desc    Get player form by player ID
// @route   GET /api/tennis/players/:id/form
// @access  Public
export const getPlayerForm = async (req, res) => {
  try {
    const { id } = req.params;
    const playerId = parseInt(id, 10);
    
    // Find player form
    const form = await PlayerForm.findOne({ player_id: playerId }).lean();
    
    if (!form) {
      return res.status(404).json({
        status: 'success',
        data: {
          form: null
        }
      });
    }
    
    res.json({
      status: 'success',
      data: {
        form
      }
    });
  } catch (error) {
    console.error('Error fetching player form:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching player form'
    });
  }
};

// @desc    Get player injury by player ID
// @route   GET /api/tennis/players/:id/injury
// @access  Public
export const getPlayerInjury = async (req, res) => {
  try {
    const { id } = req.params;
    const playerId = parseInt(id, 10);
    
    // Find active injuries for the player
    const injury = await PlayerInjury.findOne({
      player_id: playerId,
      status: { $in: ['Active', 'Recovering'] }
    }).lean();
    
    // If no active injury, return null
    if (!injury) {
      return res.json({
        status: 'success',
        data: {
          injury: null
        }
      });
    }
    
    res.json({
      status: 'success',
      data: {
        injury
      }
    });
  } catch (error) {
    console.error('Error fetching player injury:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching player injury'
    });
  }
};

// @desc    Get player ranking history by player ID
// @route   GET /api/tennis/players/:id/ranking-history
// @access  Public
export const getPlayerRankingHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const playerId = parseInt(id, 10);
    
    // Find player ranking history for the last year
    const history = await PlayerRankingHistory.find({
      player_id: playerId
    })
    .sort({ ranking_date: -1 })
    .limit(52) // Last 52 weeks
    .lean();
    
    if (!history || history.length === 0) {
      return res.json({
        status: 'success',
        data: {
          history: []
        }
      });
    }
    
    res.json({
      status: 'success',
      data: {
        history
      }
    });
  } catch (error) {
    console.error('Error fetching player ranking history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching player ranking history'
    });
  }
};

// @desc    Get all tournaments
// @route   GET /api/tennis/tournaments
// @access  Public
export const getTournaments = async (req, res) => {
  try {
    // Get tournaments from MongoDB
    console.log('Getting tournaments from MongoDB...');
    const tournaments = await Tournament.find()
      .sort({ start_date: 1 })
      .lean();
    
    if (!tournaments || tournaments.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No tournaments found in the database'
      });
    }
    
    // Format the response to match the API response structure
    // that the frontend expects
    res.json({
      status: 'success',
      data: {
        tournaments: tournaments
      }
    });
  } catch (error) {
    console.error('Error fetching tournaments from MongoDB:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournaments'
    });
  }
};

// @desc    Get tournament by ID
// @route   GET /api/tennis/tournaments/:id
// @access  Public
export const getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tournament = await Tournament.findOne({ tournament_id: id });
    
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        tournament
      }
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournament details'
    });
  }
};

// @desc    Get tournaments by status
// @route   GET /api/tennis/tournaments/status/:status
// @access  Public
export const getTournamentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status parameter
    if (!['Upcoming', 'Ongoing', 'Completed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid tournament status. Must be Upcoming, Ongoing, or Completed'
      });
    }
    
    const tournaments = await Tournament.find({ status })
      .sort({ start_date: 1 });
    
    res.json({
      status: 'success',
      data: {
        tournaments
      }
    });
  } catch (error) {
    console.error('Error fetching tournaments by status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournaments'
    });
  }
};

// @desc    Get tournaments by category
// @route   GET /api/tennis/tournaments/category/:category
// @access  Public
export const getTournamentsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const tournaments = await Tournament.find({ category })
      .sort({ start_date: 1 });
    
    res.json({
      status: 'success',
      data: {
        tournaments
      }
    });
  } catch (error) {
    console.error('Error fetching tournaments by category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournaments'
    });
  }
};

// @desc    Get tournament details including fixtures and live scores
// @route   GET /api/tennis/tournaments/:id/details
// @access  Public
export const getTournamentDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`getTournamentDetailsById called with id: ${id}`);
    
    // Convert id to number if it's a string
    const tournamentId = parseInt(id, 10);
    
    // Get tournament details from MongoDB
    const tournament = await Tournament.findOne({ tournament_id: tournamentId }).lean();
    
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }
    
    // Get matches for this tournament from MongoDB
    const matches = await Match.find({ tournament_id: tournamentId }).lean();
    
    // Group matches by round
    const matchesByRound = {};
    matches.forEach(match => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = [];
      }
      matchesByRound[match.round].push(match);
    });
    
    // Get player details for all matches
    const playerIds = [...new Set(matches.flatMap(match => [match.player1_id, match.player2_id]))];
    const players = await Player.find({ player_id: { $in: playerIds } }).lean();
    
    // Create a map of player_id to player details
    const playerMap = {};
    players.forEach(player => {
      playerMap[player.player_id] = player;
    });
    
    // Enhance matches with player details
    const enhancedMatches = matches.map(match => ({
      ...match,
      player1: playerMap[match.player1_id] || { player_name: 'Unknown Player' },
      player2: playerMap[match.player2_id] || { player_name: 'Unknown Player' },
      winner: match.winner_id ? playerMap[match.winner_id] : null
    }));
    
    // Try to get tournament draw if available
    let draw = null;
    try {
      draw = await TournamentDraw.findOne({ tournament_id: tournamentId }).lean();
    } catch (drawError) {
      console.log('Tournament draw not available:', drawError);
    }
    
    console.log(`Successfully fetched tournament details for id: ${id}`);
    res.json({
      status: 'success',
      data: {
        tournament,
        matches: enhancedMatches,
        matchesByRound,
        draw
      }
    });
  } catch (error) {
    console.error('Error fetching tournament details from MongoDB:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournament details'
    });
  }
};

// @desc    Get tournament draw by tournament ID
// @route   GET /api/tennis/tournaments/:id/draw
// @access  Public
export const getTournamentDraw = async (req, res) => {
  try {
    const { id } = req.params;
    const tournamentId = parseInt(id, 10);
    
    // Find tournament draw
    const draw = await TournamentDraw.findOne({ tournament_id: tournamentId }).lean();
    
    if (!draw) {
      return res.status(404).json({
        status: 'success',
        data: {
          draw: null
        }
      });
    }
    
    res.json({
      status: 'success',
      data: {
        draw
      }
    });
  } catch (error) {
    console.error('Error fetching tournament draw:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournament draw'
    });
  }
};
