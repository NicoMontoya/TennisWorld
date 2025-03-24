import Player from '../models/Player.js';
import Tournament from '../models/Tournament.js';
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
    
    // Get rankings directly from the API
    console.log(`Getting ${type} rankings from API...`);
    const response = await fetchRankings(type);
    
    if (response.status === 'error') {
      return res.status(500).json({
        status: 'error',
        message: response.message || 'Error fetching rankings'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        rankings: response.data.rankings
      }
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
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

// @desc    Get all tournaments
// @route   GET /api/tennis/tournaments
// @access  Public
export const getTournaments = async (req, res) => {
  try {
    // Get tournaments directly from the API
    console.log('Getting tournaments from API...');
    const response = await fetchTournaments();
    
    if (response.status === 'error') {
      return res.status(500).json({
        status: 'error',
        message: response.message || 'Error fetching tournaments'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        tournaments: response.data.tournaments
      }
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
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
    
    // Get tournament details from the API
    const response = await getTournamentDetails(id);
    
    if (response.status === 'error') {
      console.log(`Error response from getTournamentDetails: ${response.message}`);
      return res.status(500).json({
        status: 'error',
        message: response.message || 'Error fetching tournament details'
      });
    }
    
    console.log(`Successfully fetched tournament details for id: ${id}`);
    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching tournament details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournament details'
    });
  }
};
