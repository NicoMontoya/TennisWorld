import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/authMiddleware.js';
import { getRankingsFromMCP, getTournamentsFromMCP, getTournamentDetails } from './services/tennisApiService.js';
import startMcpProxy from './services/mcpProxy.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// In-memory data store (temporary until MongoDB is set up)
// Mock data for ATP rankings
const mockATPRankings = [
  { rank: 1, player_id: 1, player_name: 'Novak Djokovic', country: 'SRB', points: 11245, movement: 0 },
  { rank: 2, player_id: 2, player_name: 'Carlos Alcaraz', country: 'ESP', points: 9255, movement: 1 },
  { rank: 3, player_id: 3, player_name: 'Jannik Sinner', country: 'ITA', points: 8710, movement: 2 },
  { rank: 4, player_id: 4, player_name: 'Daniil Medvedev', country: 'RUS', points: 7165, movement: -2 },
  { rank: 5, player_id: 5, player_name: 'Alexander Zverev', country: 'GER', points: 6885, movement: 0 },
  { rank: 6, player_id: 6, player_name: 'Andrey Rublev', country: 'RUS', points: 4970, movement: 0 },
  { rank: 7, player_id: 7, player_name: 'Hubert Hurkacz', country: 'POL', points: 4035, movement: 1 },
  { rank: 8, player_id: 8, player_name: 'Casper Ruud', country: 'NOR', points: 3855, movement: -1 },
  { rank: 9, player_id: 9, player_name: 'Grigor Dimitrov', country: 'BUL', points: 3775, movement: 0 },
  { rank: 10, player_id: 10, player_name: 'Alex de Minaur', country: 'AUS', points: 3765, movement: 2 }
];

// Mock data for WTA rankings
const mockWTARankings = [
  { rank: 1, player_id: 101, player_name: 'Iga Swiatek', country: 'POL', points: 10715, movement: 0 },
  { rank: 2, player_id: 102, player_name: 'Aryna Sabalenka', country: 'BLR', points: 8725, movement: 0 },
  { rank: 3, player_id: 103, player_name: 'Coco Gauff', country: 'USA', points: 7150, movement: 0 },
  { rank: 4, player_id: 104, player_name: 'Elena Rybakina', country: 'KAZ', points: 6516, movement: 0 },
  { rank: 5, player_id: 105, player_name: 'Jessica Pegula', country: 'USA', points: 5705, movement: 0 },
  { rank: 6, player_id: 106, player_name: 'Marketa Vondrousova', country: 'CZE', points: 4075, movement: 0 },
  { rank: 7, player_id: 107, player_name: 'Ons Jabeur', country: 'TUN', points: 3946, movement: 0 },
  { rank: 8, player_id: 108, player_name: 'Qinwen Zheng', country: 'CHN', points: 3910, movement: 2 },
  { rank: 9, player_id: 109, player_name: 'Maria Sakkari', country: 'GRE', points: 3835, movement: -1 },
  { rank: 10, player_id: 110, player_name: 'Jelena Ostapenko', country: 'LAT', points: 3438, movement: 1 }
];

// Generate more mock data to have 100 players
for (let i = 11; i <= 100; i++) {
  mockATPRankings.push({
    rank: i,
    player_id: i,
    player_name: `ATP Player ${i}`,
    country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'ARG', 'CAN', 'JPN'][i % 10],
    points: Math.floor(3500 - (i * 30)),
    movement: Math.floor(Math.random() * 5) - 2
  });
  
  mockWTARankings.push({
    rank: i,
    player_id: 100 + i,
    player_name: `WTA Player ${i}`,
    country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'CHN', 'CAN', 'JPN'][i % 10],
    points: Math.floor(3300 - (i * 30)),
    movement: Math.floor(Math.random() * 5) - 2
  });
}

// Mock data for tournaments
const mockTournaments = [
  {
    tournament_id: 1,
    name: 'Australian Open',
    location: 'Melbourne, Australia',
    surface: 'Hard',
    category: 'Grand Slam',
    prize_money: '$75,000,000',
    start_date: '2025-01-13',
    end_date: '2025-01-26',
    status: 'Completed'
  },
  {
    tournament_id: 2,
    name: 'Roland Garros',
    location: 'Paris, France',
    surface: 'Clay',
    category: 'Grand Slam',
    prize_money: '$50,000,000',
    start_date: '2025-05-25',
    end_date: '2025-06-08',
    status: 'Upcoming'
  },
  {
    tournament_id: 3,
    name: 'Wimbledon',
    location: 'London, UK',
    surface: 'Grass',
    category: 'Grand Slam',
    prize_money: '$60,000,000',
    start_date: '2025-06-30',
    end_date: '2025-07-13',
    status: 'Upcoming'
  },
  {
    tournament_id: 4,
    name: 'US Open',
    location: 'New York, USA',
    surface: 'Hard',
    category: 'Grand Slam',
    prize_money: '$65,000,000',
    start_date: '2025-08-25',
    end_date: '2025-09-07',
    status: 'Upcoming'
  },
  {
    tournament_id: 5,
    name: 'Miami Open',
    location: 'Miami, USA',
    surface: 'Hard',
    category: 'Masters 1000',
    prize_money: '$8,800,000',
    start_date: '2025-03-17',
    end_date: '2025-03-30',
    status: 'Upcoming'
  },
  {
    tournament_id: 6,
    name: 'Madrid Open',
    location: 'Madrid, Spain',
    surface: 'Clay',
    category: 'Masters 1000',
    prize_money: '$7,500,000',
    start_date: '2025-04-28',
    end_date: '2025-05-11',
    status: 'Upcoming'
  },
  {
    tournament_id: 7,
    name: 'Italian Open',
    location: 'Rome, Italy',
    surface: 'Clay',
    category: 'Masters 1000',
    prize_money: '$7,000,000',
    start_date: '2025-05-12',
    end_date: '2025-05-19',
    status: 'Upcoming'
  },
  {
    tournament_id: 8,
    name: 'Cincinnati Masters',
    location: 'Cincinnati, USA',
    surface: 'Hard',
    category: 'Masters 1000',
    prize_money: '$6,600,000',
    start_date: '2025-08-11',
    end_date: '2025-08-18',
    status: 'Upcoming'
  },
  {
    tournament_id: 9,
    name: 'Indian Wells Masters',
    location: 'Indian Wells, USA',
    surface: 'Hard',
    category: 'Masters 1000',
    prize_money: '$9,000,000',
    start_date: '2025-03-06',
    end_date: '2025-03-16',
    status: 'Upcoming'
  },
  {
    tournament_id: 10,
    name: 'ATP Finals',
    location: 'Turin, Italy',
    surface: 'Hard (Indoor)',
    category: 'Tour Finals',
    prize_money: '$14,750,000',
    start_date: '2025-11-09',
    end_date: '2025-11-16',
    status: 'Upcoming'
  },
  {
    tournament_id: 11,
    name: 'Dubai Tennis Championships',
    location: 'Dubai, UAE',
    surface: 'Hard',
    category: 'ATP 500',
    prize_money: '$3,000,000',
    start_date: '2025-02-24',
    end_date: '2025-03-01',
    status: 'Upcoming'
  },
  {
    tournament_id: 12,
    name: 'Barcelona Open',
    location: 'Barcelona, Spain',
    surface: 'Clay',
    category: 'ATP 500',
    prize_money: '$2,800,000',
    start_date: '2025-04-15',
    end_date: '2025-04-21',
    status: 'Upcoming'
  },
  {
    tournament_id: 13,
    name: 'Queen\'s Club Championships',
    location: 'London, UK',
    surface: 'Grass',
    category: 'ATP 500',
    prize_money: '$2,500,000',
    start_date: '2025-06-16',
    end_date: '2025-06-22',
    status: 'Upcoming'
  },
  {
    tournament_id: 14,
    name: 'Halle Open',
    location: 'Halle, Germany',
    surface: 'Grass',
    category: 'ATP 500',
    prize_money: '$2,300,000',
    start_date: '2025-06-16',
    end_date: '2025-06-22',
    status: 'Upcoming'
  },
  {
    tournament_id: 15,
    name: 'Stuttgart Open',
    location: 'Stuttgart, Germany',
    surface: 'Grass',
    category: 'ATP 250',
    prize_money: '$800,000',
    start_date: '2025-06-09',
    end_date: '2025-06-15',
    status: 'Upcoming'
  }
];

// In-memory users store
const users = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TennisWorld API' });
});

// User routes
app.post('/api/users/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if user already exists
  const userExists = users.find(u => u.email === email || u.username === username);
  if (userExists) {
    return res.status(400).json({
      status: 'error',
      message: 'User with that email or username already exists'
    });
  }
  
  // Create new user (in a real app, we would hash the password)
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password
  };
  
  users.push(newUser);
  
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    }
  });
});


// Tennis API endpoints using our service
app.get('/api/tennis/rankings/:type', async (req, res) => {
  const { type } = req.params;
  
  // Validate type parameter
  if (type !== 'ATP' && type !== 'WTA') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ranking type. Must be ATP or WTA'
    });
  }
  
  try {
    // Get rankings from our service
    const result = await getRankingsFromMCP(type);
    res.json(result);
  } catch (error) {
    console.error('Error in rankings endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching rankings'
    });
  }
});

app.get('/api/tennis/players/:id', (req, res) => {
  const { id } = req.params;
  const playerId = parseInt(id);
  
  // Find player in either ATP or WTA rankings
  const player = [...mockATPRankings, ...mockWTARankings].find(p => p.player_id === playerId);
  
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
});

app.get('/api/tennis/tournaments', async (req, res) => {
  try {
    // Get tournaments from our service
    const result = await getTournamentsFromMCP();
    res.json(result);
  } catch (error) {
    console.error('Error in tournaments endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tournaments'
    });
  }
});

app.get('/api/tennis/tournaments/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Tournament details endpoint called with id: ${id}`);
    
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
});

app.get('/api/tennis/tournaments/:id', (req, res) => {
  const { id } = req.params;
  const tournamentId = parseInt(id);
  
  const tournament = mockTournaments.find(t => t.tournament_id === tournamentId);
  
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
});

app.get('/api/tennis/tournaments/status/:status', (req, res) => {
  const { status } = req.params;
  
  // Validate status parameter
  if (!['Upcoming', 'Ongoing', 'Completed'].includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid tournament status. Must be Upcoming, Ongoing, or Completed'
    });
  }
  
  const tournaments = mockTournaments.filter(t => t.status === status);
  
  res.json({
    status: 'success',
    data: {
      tournaments
    }
  });
});

app.get('/api/tennis/tournaments/category/:category', (req, res) => {
  const { category } = req.params;
  
  const tournaments = mockTournaments.filter(t => t.category === category);
  
  res.json({
    status: 'success',
    data: {
      tournaments
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the MCP proxy server
  startMcpProxy();
});

export default app;
