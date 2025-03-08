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

// Tennis API proxy endpoint (for future use)
app.get('/api/tennis/rankings/:type', (req, res) => {
  const { type } = req.params;
  
  // In the future, we'll fetch data from the tennis-api
  // For now, return mock data
  
  res.json({
    success: true,
    message: `${type} rankings retrieved`,
    data: {
      rankings: [
        { rank: 1, name: 'Player One', points: 10000 },
        { rank: 2, name: 'Player Two', points: 9500 },
        { rank: 3, name: 'Player Three', points: 9000 }
      ]
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
