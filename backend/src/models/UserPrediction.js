import mongoose from 'mongoose';

const userPredictionSchema = new mongoose.Schema({
  prediction_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: {
    type: Number,
    required: true,
    ref: 'User'
  },
  match_id: {
    type: Number,
    required: true,
    ref: 'Match'
  },
  tournament_id: {
    type: Number,
    required: true,
    ref: 'Tournament'
  },
  predicted_winner_id: {
    type: Number,
    required: true,
    ref: 'Player'
  },
  predicted_score: {
    type: String,
    trim: true
  },
  prediction_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  confidence_level: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  notes: {
    type: String,
    trim: true
  },
  actual_result: {
    winner_id: { type: Number, ref: 'Player' },
    score: { type: String, trim: true }
  },
  points_earned: {
    type: Number,
    default: 0
  },
  prediction_accuracy: {
    winner_correct: { type: Boolean },
    score_accuracy: { type: Number, min: 0, max: 100 }
  },
  is_public: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userPredictionSchema.index({ prediction_id: 1 }, { unique: true });
userPredictionSchema.index({ user_id: 1 });
userPredictionSchema.index({ match_id: 1 });
userPredictionSchema.index({ tournament_id: 1 });
userPredictionSchema.index({ prediction_date: 1 });
userPredictionSchema.index({ points_earned: -1 }); // For leaderboards
userPredictionSchema.index({ 'prediction_accuracy.winner_correct': 1 });

// Virtual for getting the user
userPredictionSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: 'user_id',
  justOne: true
});

// Virtual for getting the match
userPredictionSchema.virtual('match', {
  ref: 'Match',
  localField: 'match_id',
  foreignField: 'match_id',
  justOne: true
});

// Virtual for getting the tournament
userPredictionSchema.virtual('tournament', {
  ref: 'Tournament',
  localField: 'tournament_id',
  foreignField: 'tournament_id',
  justOne: true
});

// Virtual for getting the predicted winner
userPredictionSchema.virtual('predictedWinner', {
  ref: 'Player',
  localField: 'predicted_winner_id',
  foreignField: 'player_id',
  justOne: true
});

// Method to update prediction accuracy after match completion
userPredictionSchema.methods.updateAccuracy = async function(match, user) {
  if (!match || !match.winner_id) {
    throw new Error('Cannot update accuracy: match not completed');
  }
  
  // Check if winner was predicted correctly
  const winnerCorrect = (match.winner_id === this.predicted_winner_id);
  this.prediction_accuracy.winner_correct = winnerCorrect;
  
  // Calculate score accuracy if score is available
  if (match.score && this.predicted_score) {
    // Simple string comparison for now - could be more sophisticated
    this.prediction_accuracy.score_accuracy = match.score === this.predicted_score ? 100 : 0;
  }
  
  // Calculate points earned
  let pointsEarned = 0;
  
  if (winnerCorrect) {
    // Base points for correct winner
    pointsEarned += 10;
    
    // Bonus points based on confidence level (higher confidence = higher risk/reward)
    const confidenceBonus = Math.max(0, this.confidence_level - 5);
    pointsEarned += confidenceBonus * 2;
    
    // Bonus for correct score
    if (this.prediction_accuracy.score_accuracy === 100) {
      pointsEarned += 15;
    }
  }
  
  this.points_earned = pointsEarned;
  
  // Update actual result
  this.actual_result = {
    winner_id: match.winner_id,
    score: match.score
  };
  
  this.lastUpdated = new Date();
  
  // Update user's prediction stats if user is provided
  if (user) {
    await user.updatePredictionStats(winnerCorrect);
  }
  
  return this.save();
};

const UserPrediction = mongoose.model('UserPrediction', userPredictionSchema);

export default UserPrediction;
