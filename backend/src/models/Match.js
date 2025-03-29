import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  match_id: {
    type: Number,
    required: true,
    unique: true
  },
  tournament_id: {
    type: Number,
    required: true,
    ref: 'Tournament'
  },
  round: {
    type: String,
    required: true,
    trim: true
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
  winner_id: {
    type: Number,
    ref: 'Player'
  },
  score: {
    type: String,
    trim: true
  },
  match_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  court: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // Duration in minutes
  },
  stats: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
matchSchema.index({ tournament_id: 1, round: 1 });
matchSchema.index({ player1_id: 1 });
matchSchema.index({ player2_id: 1 });
matchSchema.index({ winner_id: 1 });
matchSchema.index({ match_date: 1 });
matchSchema.index({ status: 1 });

// Virtual for getting both players
matchSchema.virtual('players', {
  ref: 'Player',
  localField: ['player1_id', 'player2_id'],
  foreignField: 'player_id'
});

// Virtual for getting the tournament
matchSchema.virtual('tournament', {
  ref: 'Tournament',
  localField: 'tournament_id',
  foreignField: 'tournament_id',
  justOne: true
});

const Match = mongoose.model('Match', matchSchema);

export default Match;
