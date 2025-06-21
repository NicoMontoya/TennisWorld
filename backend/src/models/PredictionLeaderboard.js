import mongoose from 'mongoose';

const predictionLeaderboardSchema = new mongoose.Schema({
  leaderboard_id: {
    type: Number,
    required: true,
    unique: true
  },
  tournament_id: {
    type: Number,
    ref: 'Tournament'
  },
  season: {
    type: Number,
    required: true
  },
  timeframe: {
    type: String,
    required: true,
    enum: ['Tournament', 'Month', 'Season', 'All-time'],
    default: 'Season'
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  rankings: [{
    rank: Number,
    user_id: Number,
    username: String,
    points: Number,
    predictions_made: Number,
    correct_predictions: Number,
    accuracy_percentage: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
predictionLeaderboardSchema.index({ leaderboard_id: 1 }, { unique: true });
predictionLeaderboardSchema.index({ tournament_id: 1 });
predictionLeaderboardSchema.index({ season: 1, timeframe: 1 });
predictionLeaderboardSchema.index({ start_date: 1, end_date: 1 });
predictionLeaderboardSchema.index({ 'rankings.user_id': 1 });

// Virtual for getting the tournament
predictionLeaderboardSchema.virtual('tournament', {
  ref: 'Tournament',
  localField: 'tournament_id',
  foreignField: 'tournament_id',
  justOne: true
});

// Static method to create or update a leaderboard
predictionLeaderboardSchema.statics.createOrUpdateLeaderboard = async function(options) {
  const { 
    leaderboard_id, 
    tournament_id, 
    season, 
    timeframe, 
    start_date, 
    end_date 
  } = options;
  
  // Find existing leaderboard or create new one
  let leaderboard = await this.findOne({ leaderboard_id });
  
  if (!leaderboard) {
    leaderboard = new this({
      leaderboard_id,
      tournament_id,
      season,
      timeframe,
      start_date,
      end_date,
      rankings: []
    });
  }
  
  // Update dates if provided
  if (start_date) leaderboard.start_date = start_date;
  if (end_date) leaderboard.end_date = end_date;
  
  // Get all user predictions within the date range
  const UserPrediction = mongoose.model('UserPrediction');
  
  const query = {
    prediction_date: { $gte: leaderboard.start_date, $lte: leaderboard.end_date }
  };
  
  // Add tournament filter if specified
  if (tournament_id) {
    query.tournament_id = tournament_id;
  }
  
  const predictions = await UserPrediction.find(query);
  
  // Group predictions by user
  const userStats = {};
  
  predictions.forEach(prediction => {
    const userId = prediction.user_id;
    
    if (!userStats[userId]) {
      userStats[userId] = {
        user_id: userId,
        predictions_made: 0,
        correct_predictions: 0,
        points: 0
      };
    }
    
    userStats[userId].predictions_made++;
    
    if (prediction.prediction_accuracy && prediction.prediction_accuracy.winner_correct) {
      userStats[userId].correct_predictions++;
    }
    
    userStats[userId].points += prediction.points_earned || 0;
  });
  
  // Get user details
  const User = mongoose.model('User');
  const userIds = Object.keys(userStats).map(id => parseInt(id));
  const users = await User.find({ user_id: { $in: userIds } }, 'user_id username');
  
  // Create user map for quick lookup
  const userMap = {};
  users.forEach(user => {
    userMap[user.user_id] = user.username;
  });
  
  // Create rankings array
  const rankings = Object.values(userStats).map(stats => {
    const accuracy = stats.predictions_made > 0 
      ? (stats.correct_predictions / stats.predictions_made) * 100 
      : 0;
    
    return {
      user_id: stats.user_id,
      username: userMap[stats.user_id] || `User ${stats.user_id}`,
      points: stats.points,
      predictions_made: stats.predictions_made,
      correct_predictions: stats.correct_predictions,
      accuracy_percentage: Math.round(accuracy * 100) / 100
    };
  });
  
  // Sort by points (descending)
  rankings.sort((a, b) => b.points - a.points);
  
  // Assign ranks
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });
  
  // Update leaderboard rankings
  leaderboard.rankings = rankings;
  leaderboard.lastUpdated = new Date();
  
  // Save and return the updated leaderboard
  return leaderboard.save();
};

// Static method to get current season leaderboard
predictionLeaderboardSchema.statics.getCurrentSeasonLeaderboard = async function() {
  const currentYear = new Date().getFullYear();
  
  // Find or create the current season leaderboard
  let leaderboard = await this.findOne({ 
    season: currentYear, 
    timeframe: 'Season',
    tournament_id: { $exists: false }
  });
  
  if (!leaderboard) {
    // Create new season leaderboard
    const startDate = new Date(currentYear, 0, 1); // January 1st
    const endDate = new Date(currentYear, 11, 31); // December 31st
    
    leaderboard = await this.createOrUpdateLeaderboard({
      leaderboard_id: Date.now(), // Generate unique ID
      season: currentYear,
      timeframe: 'Season',
      start_date: startDate,
      end_date: endDate
    });
  }
  
  return leaderboard;
};

// Static method to get tournament leaderboard
predictionLeaderboardSchema.statics.getTournamentLeaderboard = async function(tournamentId) {
  // Find the tournament
  const Tournament = mongoose.model('Tournament');
  const tournament = await Tournament.findOne({ tournament_id: tournamentId });
  
  if (!tournament) {
    throw new Error(`Tournament with ID ${tournamentId} not found`);
  }
  
  // Find or create the tournament leaderboard
  let leaderboard = await this.findOne({ 
    tournament_id: tournamentId,
    timeframe: 'Tournament'
  });
  
  if (!leaderboard) {
    // Create new tournament leaderboard
    const season = new Date(tournament.start_date).getFullYear();
    
    leaderboard = await this.createOrUpdateLeaderboard({
      leaderboard_id: Date.now(), // Generate unique ID
      tournament_id: tournamentId,
      season: season,
      timeframe: 'Tournament',
      start_date: tournament.start_date,
      end_date: tournament.end_date
    });
  }
  
  return leaderboard;
};

const PredictionLeaderboard = mongoose.model('PredictionLeaderboard', predictionLeaderboardSchema);

export default PredictionLeaderboard;
