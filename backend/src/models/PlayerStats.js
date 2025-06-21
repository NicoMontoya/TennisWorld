import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema({
  player_id: {
    type: Number,
    required: true,
    ref: 'Player'
  },
  year: {
    type: Number,
    required: true
  },
  surface: {
    type: String,
    required: true,
    enum: ['All', 'Hard', 'Clay', 'Grass', 'Indoor'],
    default: 'All'
  },
  tournament_level: {
    type: String,
    required: true,
    enum: ['All', 'Grand Slam', 'Masters', 'ATP 500', 'ATP 250', 'Other'],
    default: 'All'
  },
  serve_stats: {
    aces_per_match: { type: Number, default: 0 },
    double_faults_per_match: { type: Number, default: 0 },
    first_serve_percentage: { type: Number, default: 0 },
    first_serve_points_won_percentage: { type: Number, default: 0 },
    second_serve_points_won_percentage: { type: Number, default: 0 },
    break_points_saved_percentage: { type: Number, default: 0 },
    service_games_won_percentage: { type: Number, default: 0 }
  },
  return_stats: {
    first_serve_return_points_won_percentage: { type: Number, default: 0 },
    second_serve_return_points_won_percentage: { type: Number, default: 0 },
    break_points_converted_percentage: { type: Number, default: 0 },
    return_games_won_percentage: { type: Number, default: 0 }
  },
  overall_stats: {
    win_percentage: { type: Number, default: 0 },
    tiebreak_win_percentage: { type: Number, default: 0 },
    deciding_set_win_percentage: { type: Number, default: 0 },
    comeback_wins: { type: Number, default: 0 },
    total_points_won_percentage: { type: Number, default: 0 }
  },
  pressure_stats: {
    break_point_performance: { type: Number, default: 0 },
    tiebreak_performance: { type: Number, default: 0 },
    deciding_set_performance: { type: Number, default: 0 }
  },
  matches_played: {
    type: Number,
    default: 0
  },
  matches_won: {
    type: Number,
    default: 0
  },
  matches_lost: {
    type: Number,
    default: 0
  },
  sets_played: {
    type: Number,
    default: 0
  },
  sets_won: {
    type: Number,
    default: 0
  },
  games_played: {
    type: Number,
    default: 0
  },
  games_won: {
    type: Number,
    default: 0
  },
  tiebreaks_played: {
    type: Number,
    default: 0
  },
  tiebreaks_won: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness for player, year, surface, and tournament level
playerStatsSchema.index({ 
  player_id: 1, 
  year: 1, 
  surface: 1, 
  tournament_level: 1 
}, { unique: true });

// Indexes for faster queries
playerStatsSchema.index({ player_id: 1, year: 1 });
playerStatsSchema.index({ player_id: 1, surface: 1 });
playerStatsSchema.index({ year: 1, surface: 1 });
playerStatsSchema.index({ 'serve_stats.aces_per_match': -1 }); // For leaderboards
playerStatsSchema.index({ 'overall_stats.win_percentage': -1 }); // For leaderboards

// Virtual for getting the player
playerStatsSchema.virtual('player', {
  ref: 'Player',
  localField: 'player_id',
  foreignField: 'player_id',
  justOne: true
});

// Virtual for calculating combined serve/return rating
playerStatsSchema.virtual('combinedRating').get(function() {
  const serveRating = (
    this.serve_stats.first_serve_percentage +
    this.serve_stats.first_serve_points_won_percentage +
    this.serve_stats.second_serve_points_won_percentage +
    this.serve_stats.break_points_saved_percentage
  ) / 4;
  
  const returnRating = (
    this.return_stats.first_serve_return_points_won_percentage +
    this.return_stats.second_serve_return_points_won_percentage +
    this.return_stats.break_points_converted_percentage +
    this.return_stats.return_games_won_percentage
  ) / 4;
  
  return (serveRating + returnRating) / 2;
});

// Pre-save middleware to calculate derived stats
playerStatsSchema.pre('save', function(next) {
  // Calculate win percentage if not explicitly set
  if (this.matches_played > 0 && this.overall_stats.win_percentage === 0) {
    this.overall_stats.win_percentage = (this.matches_won / this.matches_played) * 100;
  }
  
  // Calculate break point performance
  if (this.serve_stats.break_points_saved_percentage > 0 && this.return_stats.break_points_converted_percentage > 0) {
    this.pressure_stats.break_point_performance = 
      (this.serve_stats.break_points_saved_percentage + this.return_stats.break_points_converted_percentage) / 2;
  }
  
  next();
});

const PlayerStats = mongoose.model('PlayerStats', playerStatsSchema);

export default PlayerStats;
