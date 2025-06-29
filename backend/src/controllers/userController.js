import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import UserBracket from '../models/UserBracket.js';
import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import UserPrediction from '../models/UserPrediction.js';
import PredictionLeaderboard from '../models/PredictionLeaderboard.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    
    console.log('Registration attempt with:', { username, email, password: '***', first_name, last_name });

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('User already exists with email:', email);
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email',
      });
    }
    
    // Also check if username is taken
    const usernameExists = await User.findOne({ username });
    
    if (usernameExists) {
      console.log('Username already taken:', username);
      return res.status(400).json({
        status: 'error',
        message: 'Username already taken',
      });
    }
    
    // Log all existing users for debugging
    const allUsers = await User.find({});
    console.log('All existing users:', allUsers.map(u => ({ id: u.user_id, username: u.username, email: u.email })));

    // Get the highest user_id to generate a new one
    const highestUser = await User.findOne().sort('-user_id');
    const nextUserId = highestUser ? highestUser.user_id + 1 : 1;
    console.log('Generated new user_id:', nextUserId);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);

    // Create user
    console.log('Attempting to create user with:', { 
      user_id: nextUserId, 
      username, 
      email, 
      first_name, 
      last_name 
    });
    
    // Store the plain password for debugging
    const plainPassword = password;
    
    const user = await User.create({
      user_id: nextUserId,
      username,
      email,
      password: hashedPassword, // Already hashed above
      first_name,
      last_name,
      account_type: 'Free',
      registration_date: new Date(),
      last_login: new Date(),
      preferences: {
        notification_settings: {
          email_notifications: true,
          match_alerts: true,
          tournament_updates: true,
          player_news: true
        },
        display_settings: {
          dark_mode: false,
          stats_display_preference: 'Basic',
          default_ranking_type: 'ATP'
        }
      }
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        data: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          account_type: user.account_type,
          token: generateToken(user.user_id),
        },
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    console.error('Error stack:', error.stack);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      // Extract validation error messages
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      console.error('Validation errors:', validationErrors);
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Check for duplicate key error
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      
      return res.status(400).json({
        status: 'error',
        message: `${field} '${value}' is already taken`
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while registering user',
    });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Check password
    try {
      console.log('Login attempt - Email:', email);
      console.log('Login attempt - Password:', password);
      console.log('Stored hashed password:', user.password);
      
      // Try direct bcrypt comparison
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result from direct bcrypt.compare:', isMatch);
      
      // For debugging, try to hash the password again and compare the hashes
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('Newly hashed password for comparison:', hashedPassword);
      
      // Try manual string comparison (just for debugging)
      const stringMatch = user.password === hashedPassword;
      console.log('String comparison result:', stringMatch);

      if (!isMatch) {
        console.log('Password comparison failed');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
        });
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error while checking credentials',
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    res.json({
      status: 'success',
      data: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        account_type: user.account_type,
        token: generateToken(user.user_id),
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while logging in',
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id }).select('-password');

    if (user) {
      res.json({
        status: 'success',
        data: {
          user
        },
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user profile',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Update fields
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    
    // Update preferences if provided
    if (req.body.preferences) {
      // Merge existing preferences with new ones
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences,
        notification_settings: {
          ...user.preferences.notification_settings,
          ...(req.body.preferences.notification_settings || {})
        },
        display_settings: {
          ...user.preferences.display_settings,
          ...(req.body.preferences.display_settings || {})
        }
      };
    }

    // Update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      status: 'success',
      data: {
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        account_type: updatedUser.account_type,
        preferences: updatedUser.preferences,
        token: generateToken(updatedUser.user_id),
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating user profile',
    });
  }
};

// @desc    Get user brackets
// @route   GET /api/users/brackets
// @access  Private
export const getUserBrackets = async (req, res) => {
  try {
    const brackets = await UserBracket.getAllUserBrackets(req.user.user_id);
    
    // Group brackets by tournament
    const tournaments = await Promise.all(
      [...new Set(brackets.map(b => b.tournament_id))].map(async (tournamentId) => {
        const tournament = await Tournament.findOne({ tournament_id: tournamentId });
        return tournament;
      })
    );
    
    const tournamentMap = {};
    tournaments.forEach(tournament => {
      if (tournament) {
        tournamentMap[tournament.tournament_id] = tournament;
      }
    });
    
    // Organize brackets by tournament
    const bracketsByTournament = brackets.reduce((acc, bracket) => {
      const tournamentId = bracket.tournament_id;
      if (!acc[tournamentId]) {
        acc[tournamentId] = {
          tournament: tournamentMap[tournamentId] || { name: 'Unknown Tournament' },
          brackets: []
        };
      }
      
      acc[tournamentId].brackets.push(bracket);
      return acc;
    }, {});
    
    res.json({
      status: 'success',
      data: {
        bracketsByTournament
      },
    });
  } catch (error) {
    console.error('Error fetching user brackets:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user brackets',
    });
  }
};

// @desc    Get user bracket by ID
// @route   GET /api/users/brackets/:id
// @access  Private
export const getUserBracketById = async (req, res) => {
  try {
    const bracket = await UserBracket.findOne({ 
      bracket_id: req.params.id,
      user_id: req.user.user_id
    });
    
    if (!bracket) {
      return res.status(404).json({
        status: 'error',
        message: 'Bracket not found',
      });
    }
    
    // Get tournament details
    const tournament = await Tournament.findOne({ tournament_id: bracket.tournament_id });
    
    res.json({
      status: 'success',
      data: {
        bracket,
        tournament
      },
    });
  } catch (error) {
    console.error('Error fetching user bracket:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user bracket',
    });
  }
};

// @desc    Create a new bracket
// @route   POST /api/users/brackets
// @access  Private
export const createUserBracket = async (req, res) => {
  try {
    const { tournament_id, name, bracket_data, is_public, notes } = req.body;
    
    // Check if tournament exists
    const tournament = await Tournament.findOne({ tournament_id });
    
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found',
      });
    }
    
    // Generate a unique bracket ID
    const bracketId = `${req.user.user_id}-${tournament_id}-${Date.now()}`;
    
    // Create the bracket
    const bracket = await UserBracket.create({
      bracket_id: bracketId,
      user_id: req.user.user_id,
      tournament_id,
      name,
      bracket_data: bracket_data || { predictions: [], champion: null },
      is_public: is_public !== undefined ? is_public : true,
      notes,
      status: 'draft'
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        bracket
      },
    });
  } catch (error) {
    console.error('Error creating user bracket:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating user bracket',
    });
  }
};

// @desc    Update a bracket
// @route   PUT /api/users/brackets/:id
// @access  Private
export const updateUserBracket = async (req, res) => {
  try {
    const bracket = await UserBracket.findOne({ 
      bracket_id: req.params.id,
      user_id: req.user.user_id
    });
    
    if (!bracket) {
      return res.status(404).json({
        status: 'error',
        message: 'Bracket not found',
      });
    }
    
    // Check if bracket is locked
    if (bracket.status === 'locked') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update a locked bracket',
      });
    }
    
    // Update fields
    bracket.name = req.body.name || bracket.name;
    bracket.is_public = req.body.is_public !== undefined ? req.body.is_public : bracket.is_public;
    bracket.notes = req.body.notes || bracket.notes;
    bracket.status = req.body.status || bracket.status;
    
    // Update bracket data if provided
    if (req.body.bracket_data) {
      bracket.bracket_data = req.body.bracket_data;
    }
    
    bracket.last_updated = new Date();
    
    const updatedBracket = await bracket.save();
    
    res.json({
      status: 'success',
      data: {
        bracket: updatedBracket
      },
    });
  } catch (error) {
    console.error('Error updating user bracket:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating user bracket',
    });
  }
};

// @desc    Delete a bracket
// @route   DELETE /api/users/brackets/:id
// @access  Private
export const deleteUserBracket = async (req, res) => {
  try {
    const bracket = await UserBracket.findOne({ 
      bracket_id: req.params.id,
      user_id: req.user.user_id
    });
    
    if (!bracket) {
      return res.status(404).json({
        status: 'error',
        message: 'Bracket not found',
      });
    }
    
    // Check if bracket is locked
    if (bracket.status === 'locked') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete a locked bracket',
      });
    }
    
    await bracket.remove();
    
    res.json({
      status: 'success',
      message: 'Bracket deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user bracket:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting user bracket',
    });
  }
};

// @desc    Get tournament leaderboard
// @route   GET /api/users/brackets/leaderboard/:tournamentId
// @access  Public
export const getTournamentLeaderboard = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    // Get tournament details
    const tournament = await Tournament.findOne({ tournament_id: tournamentId });
    
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found',
      });
    }
    
    // Get leaderboard
    const leaderboard = await UserBracket.getTournamentLeaderboard(tournamentId);
    
    res.json({
      status: 'success',
      data: {
        tournament,
        leaderboard
      },
    });
  } catch (error) {
    console.error('Error fetching tournament leaderboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournament leaderboard',
    });
  }
};

// @desc    Get dashboard data
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Get user's prediction stats
    const userPredictions = await UserPrediction.find({ user_id: req.user.user_id });
    const totalPredictions = userPredictions.length;
    const correctPredictions = userPredictions.filter(p => p.is_correct === true).length;
    const accuracyPercentage = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0;

    // Get user's rank from leaderboard
    const leaderboard = await PredictionLeaderboard.findOne({ 
      timeframe: 'Season',
      season: new Date().getFullYear()
    });
    
    let userRank = null;
    if (leaderboard && leaderboard.rankings) {
      const userRanking = leaderboard.rankings.find(r => r.user_id === req.user.user_id);
      userRank = userRanking ? userRanking.rank : null;
    }

    // Get favorite players with current rankings
    const favoritePlayerIds = user.preferences?.favorite_players || [];
    const favoritePlayers = [];
    
    if (favoritePlayerIds.length > 0) {
      const players = await Player.find({ 
        player_id: { $in: favoritePlayerIds.slice(0, 3) } 
      }).limit(3);
      favoritePlayers.push(...players);
    }

    // Get upcoming tournaments
    const upcomingTournaments = await Tournament.find({ 
      status: { $in: ['Upcoming', 'Ongoing'] },
      start_date: { $gte: new Date() }
    })
    .sort({ start_date: 1 })
    .limit(3);

    // Get user's recent brackets
    const recentBrackets = await UserBracket.find({ user_id: req.user.user_id })
      .sort({ last_updated: -1 })
      .limit(3);

    // Get upcoming matches for favorite players
    const upcomingMatches = await Match.find({
      $or: [
        { player1_id: { $in: favoritePlayerIds } },
        { player2_id: { $in: favoritePlayerIds } }
      ],
      status: 'Scheduled',
      match_date: { $gte: new Date() }
    })
    .sort({ match_date: 1 })
    .limit(5);

    // Calculate days since registration
    const daysSinceRegistration = Math.floor(
      (new Date() - new Date(user.registration_date)) / (1000 * 60 * 60 * 24)
    );

    const dashboardData = {
      user: {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        account_type: user.account_type,
        registration_date: user.registration_date,
        last_login: user.last_login,
        days_since_registration: daysSinceRegistration
      },
      stats: {
        total_predictions: totalPredictions,
        correct_predictions: correctPredictions,
        accuracy_percentage: accuracyPercentage,
        points: user.prediction_stats?.points || 0,
        rank: userRank,
        brackets_created: recentBrackets.length
      },
      favorite_players: favoritePlayers,
      upcoming_tournaments: upcomingTournaments,
      recent_brackets: recentBrackets,
      upcoming_matches: upcomingMatches,
      activity: {
        last_viewed_players: user.activity?.last_viewed_players || [],
        last_viewed_tournaments: user.activity?.last_viewed_tournaments || [],
        last_viewed_matches: user.activity?.last_viewed_matches || []
      }
    };

    res.json({
      status: 'success',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching dashboard data',
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Get detailed prediction statistics
    const userPredictions = await UserPrediction.find({ user_id: req.user.user_id });
    const totalPredictions = userPredictions.length;
    const correctPredictions = userPredictions.filter(p => p.is_correct === true).length;
    const accuracyPercentage = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0;

    // Get predictions by confidence level
    const predictionsByConfidence = userPredictions.reduce((acc, pred) => {
      const confidence = pred.confidence_level || 5;
      const range = confidence <= 3 ? 'low' : confidence <= 7 ? 'medium' : 'high';
      if (!acc[range]) acc[range] = { total: 0, correct: 0 };
      acc[range].total++;
      if (pred.is_correct) acc[range].correct++;
      return acc;
    }, {});

    // Get user's brackets statistics
    const userBrackets = await UserBracket.find({ user_id: req.user.user_id });
    const bracketsStats = {
      total: userBrackets.length,
      draft: userBrackets.filter(b => b.status === 'draft').length,
      submitted: userBrackets.filter(b => b.status === 'submitted').length,
      locked: userBrackets.filter(b => b.status === 'locked').length
    };

    // Calculate activity metrics
    const activityMetrics = {
      total_player_views: user.activity?.last_viewed_players?.length || 0,
      total_tournament_views: user.activity?.last_viewed_tournaments?.length || 0,
      total_match_views: user.activity?.last_viewed_matches?.length || 0,
      favorite_players_count: user.preferences?.favorite_players?.length || 0,
      favorite_tournaments_count: user.preferences?.favorite_tournaments?.length || 0
    };

    const stats = {
      predictions: {
        total: totalPredictions,
        correct: correctPredictions,
        accuracy_percentage: accuracyPercentage,
        by_confidence: predictionsByConfidence,
        points: user.prediction_stats?.points || 0
      },
      brackets: bracketsStats,
      activity: activityMetrics,
      account: {
        days_active: Math.floor((new Date() - new Date(user.registration_date)) / (1000 * 60 * 60 * 24)),
        account_type: user.account_type,
        last_login: user.last_login
      }
    };

    res.json({
      status: 'success',
      data: { stats },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user stats',
    });
  }
};

// @desc    Get personalized recommendations
// @route   GET /api/users/recommendations
// @access  Private
export const getUserRecommendations = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const favoritePlayerIds = user.preferences?.favorite_players || [];
    const favoriteTournamentIds = user.preferences?.favorite_tournaments || [];
    const preferredSurfaces = user.preferences?.preferred_surfaces || [];

    // Recommend players based on preferences
    const recommendedPlayers = await Player.find({
      player_id: { $nin: favoritePlayerIds }, // Exclude already favorite players
      rank: { $lte: 50 } // Top 50 players
    }).limit(5);

    // Recommend tournaments based on preferences and upcoming dates
    const recommendedTournaments = await Tournament.find({
      tournament_id: { $nin: favoriteTournamentIds },
      status: { $in: ['Upcoming', 'Ongoing'] },
      start_date: { $gte: new Date() },
      ...(preferredSurfaces.length > 0 && { surface: { $in: preferredSurfaces } })
    })
    .sort({ start_date: 1 })
    .limit(5);

    // Recommend matches featuring top players
    const recommendedMatches = await Match.find({
      status: 'Scheduled',
      match_date: { $gte: new Date() }
    })
    .sort({ match_date: 1 })
    .limit(5);

    const recommendations = {
      players: recommendedPlayers,
      tournaments: recommendedTournaments,
      matches: recommendedMatches,
      surfaces_to_explore: ['Hard', 'Clay', 'Grass'].filter(s => !preferredSurfaces.includes(s))
    };

    res.json({
      status: 'success',
      data: { recommendations },
    });
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user recommendations',
    });
  }
};
