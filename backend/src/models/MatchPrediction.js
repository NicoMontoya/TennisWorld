import mongoose from 'mongoose';

const matchPredictionSchema = new mongoose.Schema({
  prediction_id: {
    type: Number,
    required: true,
    unique: true
  },
  match_id: {
    type: Number,
    required: true,
    ref: 'Match'
  },
  player1_id: {
    type: Number,
    required: true,
    ref: 'Player'
  },
  player2_id: {
    type: Number,
    required: true,
    ref: 'Player'
  },
  tournament_id: {
    type: Number,
    required: true,
    ref: 'Tournament'
  },
  prediction_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  predicted_winner_id: {
    type: Number,
    required: true,
    ref: 'Player'
  },
  win_probability: {
    player1: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    player2: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  predicted_score: {
    type: String,
    trim: true
  },
  predicted_duration: {
    type: Number // in minutes
  },
  factors: {
    head_to_head: { type: Number, min: 0, max: 1, default: 0.2 },
    recent_form: { type: Number, min: 0, max: 1, default: 0.25 },
    surface_performance: { type: Number, min: 0, max: 1, default: 0.2 },
    tournament_history: { type: Number, min: 0, max: 1, default: 0.1 },
    ranking: { type: Number, min: 0, max: 1, default: 0.15 },
    playing_style_matchup: { type: Number, min: 0, max: 1, default: 0.1 }
  },
  model_version: {
    type: String,
    trim: true
  },
  actual_result: {
    winner_id: { type: Number, ref: 'Player' },
    score: { type: String, trim: true },
    duration: { type: Number }
  },
  prediction_accuracy: {
    winner_correct: { type: Boolean },
    score_accuracy: { type: Number, min: 0, max: 100 },
    duration_accuracy: { type: Number, min: 0, max: 100 }
  },
  user_id: {
    type: Number,
    ref: 'User'
  },
  is_system_prediction: {
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
matchPredictionSchema.index({ prediction_id: 1 }, { unique: true });
matchPredictionSchema.index({ match_id: 1, is_system_prediction: 1 });
matchPredictionSchema.index({ player1_id: 1, player2_id: 1 });
matchPredictionSchema.index({ tournament_id: 1 });
matchPredictionSchema.index({ user_id: 1 });
matchPredictionSchema.index({ prediction_date: 1 });
matchPredictionSchema.index({ 'prediction_accuracy.winner_correct': 1 });

// Virtual for getting the match
matchPredictionSchema.virtual('match', {
  ref: 'Match',
  localField: 'match_id',
  foreignField: 'match_id',
  justOne: true
});

// Virtual for getting player1
matchPredictionSchema.virtual('player1', {
  ref: 'Player',
  localField: 'player1_id',
  foreignField: 'player_id',
  justOne: true
});

// Virtual for getting player2
matchPredictionSchema.virtual('player2', {
  ref: 'Player',
  localField: 'player2_id',
  foreignField: 'player_id',
  justOne: true
});

// Virtual for getting the tournament
matchPredictionSchema.virtual('tournament', {
  ref: 'Tournament',
  localField: 'tournament_id',
  foreignField: 'tournament_id',
  justOne: true
});

// Virtual for getting the predicted winner
matchPredictionSchema.virtual('predictedWinner', {
  ref: 'Player',
  localField: 'predicted_winner_id',
  foreignField: 'player_id',
  justOne: true
});

// Virtual for getting the user (if user prediction)
matchPredictionSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: 'user_id',
  justOne: true
});

// Pre-save middleware to validate probabilities
matchPredictionSchema.pre('save', function(next) {
  // Ensure win probabilities sum to 100%
  const totalProbability = this.win_probability.player1 + this.win_probability.player2;
  if (Math.abs(totalProbability - 100) > 0.1) {
    const error = new Error(`Win probabilities must sum to 100%. Current sum: ${totalProbability}`);
    return next(error);
  }
  
  // Ensure factor weights sum to 1
  const totalFactorWeight = 
    this.factors.head_to_head + 
    this.factors.recent_form + 
    this.factors.surface_performance + 
    this.factors.tournament_history + 
    this.factors.ranking + 
    this.factors.playing_style_matchup;
  
  if (Math.abs(totalFactorWeight - 1) > 0.01) {
    const error = new Error(`Factor weights must sum to 1. Current sum: ${totalFactorWeight}`);
    return next(error);
  }
  
  next();
});

// Method to update prediction accuracy after match completion
matchPredictionSchema.methods.updateAccuracy = async function(match) {
  if (!match || !match.winner_id) {
    throw new Error('Cannot update accuracy: match not completed');
  }
  
  // Check if winner was predicted correctly
  this.prediction_accuracy.winner_correct = (match.winner_id === this.predicted_winner_id);
  
  // Calculate score accuracy if score is available
  if (match.score && this.predicted_score) {
    // Simple string comparison for now - could be more sophisticated
    this.prediction_accuracy.score_accuracy = match.score === this.predicted_score ? 100 : 0;
  }
  
  // Calculate duration accuracy if duration is available
  if (match.duration && this.predicted_duration) {
    const durationDiff = Math.abs(match.duration - this.predicted_duration);
    const durationAccuracy = Math.max(0, 100 - (durationDiff / match.duration * 100));
    this.prediction_accuracy.duration_accuracy = durationAccuracy;
  }
  
  // Update actual result
  this.actual_result = {
    winner_id: match.winner_id,
    score: match.score,
    duration: match.duration
  };
  
  this.lastUpdated = new Date();
  return this.save();
};

const MatchPrediction = mongoose.model('MatchPrediction', matchPredictionSchema);

export default MatchPrediction;
