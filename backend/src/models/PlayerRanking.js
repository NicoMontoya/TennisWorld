import mongoose from 'mongoose';

const playerRankingSchema = new mongoose.Schema({
  player_id: {
    type: Number,
    required: true,
    ref: 'Player'
  },
  type: {
    type: String,
    required: true,
    enum: ['ATP', 'WTA'],
    default: 'ATP'
  },
  rank: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  ranking_date: {
    type: Date,
    required: true
  },
  movement: {
    type: Number,
    default: 0
  },
  week_number: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness for player, type, and date
playerRankingSchema.index({ player_id: 1, type: 1, ranking_date: 1 }, { unique: true });

// Indexes for faster queries
playerRankingSchema.index({ type: 1, ranking_date: 1, rank: 1 });
playerRankingSchema.index({ player_id: 1, ranking_date: 1 });
playerRankingSchema.index({ year: 1, week_number: 1 });

// Virtual for getting the player
playerRankingSchema.virtual('player', {
  ref: 'Player',
  localField: 'player_id',
  foreignField: 'player_id',
  justOne: true
});

const PlayerRanking = mongoose.model('PlayerRanking', playerRankingSchema);

export default PlayerRanking;
