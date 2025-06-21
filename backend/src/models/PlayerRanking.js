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
  },
  race_rank: {
    type: Number
  },
  race_points: {
    type: Number
  },
  defending_points: {
    type: Number,
    default: 0
  },
  points_breakdown: {
    grand_slam: { type: Number, default: 0 },
    masters_1000: { type: Number, default: 0 },
    atp_500: { type: Number, default: 0 },
    atp_250: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
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
playerRankingSchema.index({ type: 1, race_rank: 1 });

// Virtual for getting the player
playerRankingSchema.virtual('player', {
  ref: 'Player',
  localField: 'player_id',
  foreignField: 'player_id',
  justOne: true
});

// Pre-save middleware to set default values
playerRankingSchema.pre('save', function(next) {
  // Set race_rank to rank if not explicitly set
  if (!this.race_rank && this.rank) {
    this.race_rank = this.rank;
  }
  
  // Set race_points to points if not explicitly set
  if (!this.race_points && this.points) {
    this.race_points = this.points;
  }
  
  // Ensure points breakdown adds up to total points
  const breakdownTotal = 
    this.points_breakdown.grand_slam + 
    this.points_breakdown.masters_1000 + 
    this.points_breakdown.atp_500 + 
    this.points_breakdown.atp_250 + 
    this.points_breakdown.other;
  
  if (breakdownTotal === 0 && this.points > 0) {
    // If no breakdown is provided, assign all points to 'other'
    this.points_breakdown.other = this.points;
  }
  
  next();
});

const PlayerRanking = mongoose.model('PlayerRanking', playerRankingSchema);

export default PlayerRanking;
