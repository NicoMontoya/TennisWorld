import mongoose from 'mongoose';

const userBracketSchema = new mongoose.Schema({
  bracket_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: Number,
    required: true,
    ref: 'User'
  },
  tournament_id: {
    type: Number,
    required: true,
    ref: 'Tournament'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  is_public: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'locked'],
    default: 'draft'
  },
  score: {
    type: Number,
    default: 0
  },
  bracket_data: {
    // Array of predictions for each match in the tournament
    predictions: [{
      match_position: Number, // Position in the tournament bracket
      round: Number,
      predicted_winner_id: Number,
      predicted_winner_name: String,
      predicted_score: String,
      is_correct: {
        type: Boolean,
        default: null
      },
      points_earned: {
        type: Number,
        default: 0
      },
      match_id: {
        type: Number,
        ref: 'Match'
      }
    }],
    // Champion prediction
    champion: {
      player_id: Number,
      player_name: String,
      is_correct: {
        type: Boolean,
        default: null
      },
      points_earned: {
        type: Number,
        default: 0
      }
    }
  },
  // Statistics about the bracket
  stats: {
    correct_picks: {
      type: Number,
      default: 0
    },
    total_picks: {
      type: Number,
      default: 0
    },
    accuracy_percentage: {
      type: Number,
      default: 0
    },
    round_scores: [{
      round: Number,
      points: Number
    }]
  },
  // Comments or notes about the bracket
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userBracketSchema.index({ bracket_id: 1 }, { unique: true });
userBracketSchema.index({ user_id: 1 });
userBracketSchema.index({ tournament_id: 1 });
userBracketSchema.index({ user_id: 1, tournament_id: 1 });
userBracketSchema.index({ status: 1 });
userBracketSchema.index({ created_at: 1 });

// Virtual for getting the user
userBracketSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: 'user_id',
  justOne: true
});

// Virtual for getting the tournament
userBracketSchema.virtual('tournament', {
  ref: 'Tournament',
  localField: 'tournament_id',
  foreignField: 'tournament_id',
  justOne: true
});

// Method to calculate score based on correct predictions
userBracketSchema.methods.calculateScore = async function() {
  let totalScore = 0;
  let correctPicks = 0;
  let totalPicks = 0;
  const roundScores = [];
  
  // Points per round (increase as rounds progress)
  const pointsPerRound = {
    1: 10,   // Round of 64
    2: 20,   // Round of 32
    3: 40,   // Round of 16
    4: 80,   // Quarterfinals
    5: 160,  // Semifinals
    6: 320   // Final
  };
  
  // Calculate points for each prediction
  if (this.bracket_data && this.bracket_data.predictions) {
    // Group predictions by round
    const predictionsByRound = {};
    
    this.bracket_data.predictions.forEach(prediction => {
      if (!predictionsByRound[prediction.round]) {
        predictionsByRound[prediction.round] = [];
      }
      
      predictionsByRound[prediction.round].push(prediction);
      
      if (prediction.is_correct === true) {
        const roundPoints = pointsPerRound[prediction.round] || 10;
        prediction.points_earned = roundPoints;
        totalScore += roundPoints;
        correctPicks++;
      }
      
      if (prediction.is_correct !== null) {
        totalPicks++;
      }
    });
    
    // Calculate round scores
    Object.keys(predictionsByRound).forEach(round => {
      const predictions = predictionsByRound[round];
      const roundScore = predictions.reduce((sum, pred) => sum + (pred.points_earned || 0), 0);
      
      roundScores.push({
        round: parseInt(round),
        points: roundScore
      });
    });
  }
  
  // Add champion prediction points
  if (this.bracket_data && this.bracket_data.champion && this.bracket_data.champion.is_correct === true) {
    const championPoints = 500; // Bonus points for correctly predicting the champion
    this.bracket_data.champion.points_earned = championPoints;
    totalScore += championPoints;
    correctPicks++;
    totalPicks++;
  } else if (this.bracket_data && this.bracket_data.champion && this.bracket_data.champion.is_correct !== null) {
    totalPicks++;
  }
  
  // Update stats
  this.score = totalScore;
  this.stats.correct_picks = correctPicks;
  this.stats.total_picks = totalPicks;
  this.stats.accuracy_percentage = totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : 0;
  this.stats.round_scores = roundScores;
  
  return this.save();
};

// Static method to get user brackets for a tournament
userBracketSchema.statics.getUserBracketsForTournament = async function(userId, tournamentId) {
  return this.find({
    user_id: userId,
    tournament_id: tournamentId
  }).sort({ created_at: -1 });
};

// Static method to get all brackets for a user
userBracketSchema.statics.getAllUserBrackets = async function(userId) {
  return this.find({
    user_id: userId
  }).sort({ created_at: -1 });
};

// Static method to get public brackets for a tournament
userBracketSchema.statics.getPublicBracketsForTournament = async function(tournamentId) {
  return this.find({
    tournament_id: tournamentId,
    is_public: true,
    status: 'completed'
  }).sort({ score: -1 }).limit(20);
};

// Static method to get leaderboard for a tournament
userBracketSchema.statics.getTournamentLeaderboard = async function(tournamentId) {
  return this.find({
    tournament_id: tournamentId,
    status: 'completed'
  })
  .sort({ score: -1 })
  .limit(100)
  .populate('user', 'username');
};

const UserBracket = mongoose.model('UserBracket', userBracketSchema);

export default UserBracket;
