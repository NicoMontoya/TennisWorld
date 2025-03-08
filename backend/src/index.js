import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection (commented out for now until we have a real database)
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('MongoDB connected');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TennisWorld API' });
});

// User registration endpoint (simple version for now)
app.post('/api/users/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // In a real app, we would validate the input and store in the database
  // For now, we'll just return a success message
  
  console.log('New user registered:', { username, email });
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: Date.now().toString(),
      username,
      email
    }
  });
});

// Tennis API endpoints
app.get('/api/tennis/rankings/:type', (req, res) => {
  const { type } = req.params;
  
  // Mock data for rankings
  // In a real app, we would fetch this from the tennis API
  const mockATPRankings = [
    { rank: 1, player_id: 1, player_name: 'Novak Djokovic', country: 'SRB', points: 11245 },
    { rank: 2, player_id: 2, player_name: 'Carlos Alcaraz', country: 'ESP', points: 9255 },
    { rank: 3, player_id: 3, player_name: 'Jannik Sinner', country: 'ITA', points: 8710 },
    { rank: 4, player_id: 4, player_name: 'Daniil Medvedev', country: 'RUS', points: 7165 },
    { rank: 5, player_id: 5, player_name: 'Alexander Zverev', country: 'GER', points: 6885 },
    { rank: 6, player_id: 6, player_name: 'Andrey Rublev', country: 'RUS', points: 4970 },
    { rank: 7, player_id: 7, player_name: 'Hubert Hurkacz', country: 'POL', points: 4035 },
    { rank: 8, player_id: 8, player_name: 'Casper Ruud', country: 'NOR', points: 3855 },
    { rank: 9, player_id: 9, player_name: 'Grigor Dimitrov', country: 'BUL', points: 3775 },
    { rank: 10, player_id: 10, player_name: 'Alex de Minaur', country: 'AUS', points: 3765 }
  ];
  
  const mockWTARankings = [
    { rank: 1, player_id: 101, player_name: 'Iga Swiatek', country: 'POL', points: 10715 },
    { rank: 2, player_id: 102, player_name: 'Aryna Sabalenka', country: 'BLR', points: 8725 },
    { rank: 3, player_id: 103, player_name: 'Coco Gauff', country: 'USA', points: 7150 },
    { rank: 4, player_id: 104, player_name: 'Elena Rybakina', country: 'KAZ', points: 6516 },
    { rank: 5, player_id: 105, player_name: 'Jessica Pegula', country: 'USA', points: 5705 },
    { rank: 6, player_id: 106, player_name: 'Marketa Vondrousova', country: 'CZE', points: 4075 },
    { rank: 7, player_id: 107, player_name: 'Ons Jabeur', country: 'TUN', points: 3946 },
    { rank: 8, player_id: 108, player_name: 'Qinwen Zheng', country: 'CHN', points: 3910 },
    { rank: 9, player_id: 109, player_name: 'Maria Sakkari', country: 'GRE', points: 3835 },
    { rank: 10, player_id: 110, player_name: 'Jelena Ostapenko', country: 'LAT', points: 3438 }
  ];
  
  // Generate more mock data to have 100 players
  for (let i = 11; i <= 100; i++) {
    mockATPRankings.push({
      rank: i,
      player_id: i,
      player_name: `ATP Player ${i}`,
      country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'ARG', 'CAN', 'JPN'][i % 10],
      points: Math.floor(3500 - (i * 30))
    });
    
    mockWTARankings.push({
      rank: i,
      player_id: 100 + i,
      player_name: `WTA Player ${i}`,
      country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'CHN', 'CAN', 'JPN'][i % 10],
      points: Math.floor(3300 - (i * 30))
    });
  }
  
  const rankings = type === 'WTA' ? mockWTARankings : mockATPRankings;
  
  res.json({
    status: 'success',
    data: {
      rankings
    }
  });
});

// Tournaments endpoint
app.get('/api/tennis/tournaments', (req, res) => {
  // Mock data for tournaments
  const tournaments = [
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
  
  res.json({
    status: 'success',
    data: {
      tournaments
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB (commented out for now)
// connectDB();

export default app;
