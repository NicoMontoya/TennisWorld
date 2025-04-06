import express from 'express';
import {
  getRankings,
  getPlayerById,
  getPlayerMatches,
  getTournaments,
  getTournamentById,
  getTournamentsByStatus,
  getTournamentsByCategory,
  getTournamentDetailsById
} from '../controllers/tennisController.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  console.log('Test route called');
  res.json({ message: 'Test route works!' });
});

// Rankings routes
router.get('/rankings/:type', getRankings);

// Player routes
router.get('/players/:id', getPlayerById);
router.get('/players/:id/matches', getPlayerMatches);

// Tournament routes
router.get('/tournaments', getTournaments);
router.get('/tournaments/status/:status', getTournamentsByStatus);
router.get('/tournaments/category/:category', getTournamentsByCategory);

// Important: The order of these two routes matters
// The more specific route should come first
router.get('/tournaments/:id/details', (req, res) => {
  console.log(`Route matched for tournament details with id: ${req.params.id}`);
  return getTournamentDetailsById(req, res);
});

router.get('/tournaments/:id', getTournamentById);

export default router;
