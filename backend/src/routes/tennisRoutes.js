import express from 'express';
import {
  getRankings,
  getPlayerById,
  getPlayerMatches,
  getPlayerStats,
  getPlayerForm,
  getPlayerInjury,
  getPlayerRankingHistory,
  getTournaments,
  getTournamentById,
  getTournamentsByStatus,
  getTournamentsByCategory,
  getTournamentDetailsById,
  getTournamentDraw
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
router.get('/players/:id/stats', getPlayerStats);
router.get('/players/:id/form', getPlayerForm);
router.get('/players/:id/injury', getPlayerInjury);
router.get('/players/:id/ranking-history', getPlayerRankingHistory);

// Tournament routes
router.get('/tournaments', getTournaments);
router.get('/tournaments/status/:status', getTournamentsByStatus);
router.get('/tournaments/category/:category', getTournamentsByCategory);

// Important: The order of these routes matters
// The more specific routes should come first
router.get('/tournaments/:id/details', (req, res) => {
  console.log(`Route matched for tournament details with id: ${req.params.id}`);
  return getTournamentDetailsById(req, res);
});

router.get('/tournaments/:id/draw', getTournamentDraw);
router.get('/tournaments/:id', getTournamentById);

export default router;
