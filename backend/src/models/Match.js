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
  draw_id: {
    type: Number,
    ref: 'TournamentDraw'
  },
  round: {
    type: String,
    required: true,
    trim: true
  },
  round_number: {
    type: Number
  },
  match_num: {
    type: Number
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
  player1_seed: {
    type: Number
  },
  player2_seed: {
    type: Number
  },
  winner_id: {
    type: Number,
    ref: 'Player'
  },
  score: {
    type: String,
    trim: true
  },
  score_breakdown: [{
    set: Number,
    player1_games: Number,
    player2_games: Number,
    player1_tiebreak: Number,
    player2_tiebreak: Number
  }],
  match_date: {
    type: Date,
    required: true
  },
  match_time: {
    type: String,
    trim: true
  },
  court: {
    type: String,
    trim: true
  },
  duration: {
    type: Number // Duration in minutes
  },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Walkover'],
    default: 'Scheduled'
  },
  retirement: {
    type: Boolean,
    default: false
  },
  walkover: {
    type: Boolean,
    default: false
  },
  stats: {
    player1: {
      aces: { type: Number },
      double_faults: { type: Number },
      first_serve_percentage: { type: Number },
      first_serve_points_won_percentage: { type: Number },
      second_serve_points_won_percentage: { type: Number },
      break_points_saved: { type: Number },
      break_points_faced: { type: Number },
      service_games_played: { type: Number },
      service_games_won: { type: Number },
      total_service_points_won: { type: Number },
      first_serve_return_points_won: { type: Number },
      second_serve_return_points_won: { type: Number },
      break_points_converted: { type: Number },
      break_points_opportunities: { type: Number },
      return_games_played: { type: Number },
      return_games_won: { type: Number },
      total_return_points_won: { type: Number },
      total_points_won: { type: Number },
      winners: { type: Number },
      unforced_errors: { type: Number },
      net_points_won: { type: Number },
      net_points_total: { type: Number },
      fastest_serve: { type: Number },
      average_first_serve_speed: { type: Number },
      average_second_serve_speed: { type: Number }
    },
    player2: {
      aces: { type: Number },
      double_faults: { type: Number },
      first_serve_percentage: { type: Number },
      first_serve_points_won_percentage: { type: Number },
      second_serve_points_won_percentage: { type: Number },
      break_points_saved: { type: Number },
      break_points_faced: { type: Number },
      service_games_played: { type: Number },
      service_games_won: { type: Number },
      total_service_points_won: { type: Number },
      first_serve_return_points_won: { type: Number },
      second_serve_return_points_won: { type: Number },
      break_points_converted: { type: Number },
      break_points_opportunities: { type: Number },
      return_games_played: { type: Number },
      return_games_won: { type: Number },
      total_return_points_won: { type: Number },
      total_points_won: { type: Number },
      winners: { type: Number },
      unforced_errors: { type: Number },
      net_points_won: { type: Number },
      net_points_total: { type: Number },
      fastest_serve: { type: Number },
      average_first_serve_speed: { type: Number },
      average_second_serve_speed: { type: Number }
    }
  },
  momentum_shifts: [{
    point: String,
    set: Number,
    description: String,
    importance_rating: Number
  }],
  highlights: [String],
  live_tracking: {
    current_set: { type: Number },
    current_game: { type: String },
    server_id: { type: Number },
    current_point: { type: String },
    last_point_winner: { type: Number },
    last_point_description: { type: String }
  },
  weather_conditions: {
    temperature: { type: Number },
    humidity: { type: Number },
    wind_speed: { type: Number }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
matchSchema.index({ match_id: 1 }, { unique: true });
matchSchema.index({ tournament_id: 1, round: 1 });
matchSchema.index({ tournament_id: 1, round_number: 1 });
matchSchema.index({ player1_id: 1 });
matchSchema.index({ player2_id: 1 });
matchSchema.index({ winner_id: 1 });
matchSchema.index({ match_date: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ draw_id: 1, match_num: 1 });

// Compound index for finding matches between two players
matchSchema.index({ 
  player1_id: 1, 
  player2_id: 1 
});

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

// Virtual for getting the draw
matchSchema.virtual('draw', {
  ref: 'TournamentDraw',
  localField: 'draw_id',
  foreignField: 'draw_id',
  justOne: true
});

// Virtual for determining if the match is a Grand Slam match
matchSchema.virtual('isGrandSlam').get(function() {
  return this.tournament && this.tournament.category === 'Grand Slam';
});

// Virtual for determining if the match is a final
matchSchema.virtual('isFinal').get(function() {
  return this.round === 'Final';
});

// Pre-save middleware to set default values and update related data
matchSchema.pre('save', function(next) {
  // Set round_number based on round if not explicitly set
  if (this.round && !this.round_number) {
    const roundMap = {
      'First Round': 1,
      'Round of 128': 1,
      'Second Round': 2,
      'Round of 64': 2,
      'Third Round': 3,
      'Round of 32': 3,
      'Fourth Round': 4,
      'Round of 16': 4,
      'Quarter-final': 5,
      'Quarter-finals': 5,
      'Semi-final': 6,
      'Semi-finals': 6,
      'Final': 7
    };
    
    this.round_number = roundMap[this.round] || 0;
  }
  
  // Set walkover flag if status is Walkover
  if (this.status === 'Walkover' && !this.walkover) {
    this.walkover = true;
  }
  
  next();
});

const Match = mongoose.model('Match', matchSchema);

export default Match;
