import express from 'express';
import {
  getRankings,
  getPlayerById,
  getTournaments,
  getTournamentById,
  getTournamentsByStatus,
  getTournamentsByCategory
} from '../controllers/tennisController.js';

const router = express.Router();

// Rankings routes
router.get('/rankings/:type', getRankings);

// Player routes
router.get('/players/:id', getPlayerById);

// Tournament routes
router.get('/tournaments', getTournaments);
router.get('/tournaments/:id', getTournamentById);
router.get('/tournaments/status/:status', getTournamentsByStatus);
router.get('/tournaments/category/:category', getTournamentsByCategory);

export default router;
