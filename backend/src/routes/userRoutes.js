import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserBrackets,
  getUserBracketById,
  createUserBracket,
  updateUserBracket,
  deleteUserBracket,
  getTournamentLeaderboard,
  getDashboardData,
  getUserStats,
  getUserRecommendations
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/brackets/leaderboard/:tournamentId', getTournamentLeaderboard);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Dashboard routes
router.get('/dashboard', protect, getDashboardData);
router.get('/stats', protect, getUserStats);
router.get('/recommendations', protect, getUserRecommendations);

// Bracket routes
router.get('/brackets', protect, getUserBrackets);
router.post('/brackets', protect, createUserBracket);
router.get('/brackets/:id', protect, getUserBracketById);
router.put('/brackets/:id', protect, updateUserBracket);
router.delete('/brackets/:id', protect, deleteUserBracket);

export default router;
