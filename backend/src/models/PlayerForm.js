import mongoose from 'mongoose';

const playerFormSchema = new mongoose.Schema({
  player_id: {
    type: Number,
    required: true,
    unique: true,
    ref: 'Player'
  },
  current_streak: {
    type: { type: String, enum: ['Win', 'Loss'] },
    count: { type: Number, default: 0 }
  },
  last_10_matches: [{
    match_id: Number,
    tournament_id: Number,
    tournament_name: String,
    round: String,
    opponent_id: Number,
    opponent_name: String,
    result: { type: String, enum: ['Win', 'Loss'] },
    score: String,
    date: Date
  }],
  form_rating: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  recent_performance: {
    matches_played: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    win_percentage: { type: Number, default: 0 },
    sets_won_percentage: { type: Number, default: 0 },
    games_won_percentage: { type: Number, default: 0 },
    notable_wins: [{
      match_id: Number,
      opponent_id: Number,
      opponent_name: String,
      opponent_rank: Number
    }]
  },
  surface_form: {
    hard: {
      matches: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      win_percentage: { type: Number, default: 0 }
    },
    clay: {
      matches: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      win_percentage: { type: Number, default: 0 }
    },
    grass: {
      matches: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      win_percentage: { type: Number, default: 0 }
    },
    indoor: {
      matches: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      win_percentage: { type: Number, default: 0 }
    }
  },
  momentum_indicators: {
    ranking_trend: { type: Number, default: 0 },
    recent_tournament_results: [{
      tournament_id: Number,
      tournament_name: String,
      result: String
    }],
    injury_status: {
      type: String,
      enum: ['Healthy', 'Minor Injury', 'Recovering', 'Unknown'],
      default: 'Healthy'
    },
    confidence_rating: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
playerFormSchema.index({ player_id: 1 }, { unique: true });
playerFormSchema.index({ form_rating: -1 }); // For sorting by form
playerFormSchema.index({ 'recent_performance.win_percentage': -1 }); // For sorting by recent performance
playerFormSchema.index({ 'momentum_indicators.confidence_rating': -1 }); // For sorting by confidence

// Virtual for getting the player
playerFormSchema.virtual('player', {
  ref: 'Player',
  localField: 'player_id',
  foreignField: 'player_id',
  justOne: true
});

// Pre-save middleware to calculate derived stats
playerFormSchema.pre('save', function(next) {
  // Calculate win percentage for recent performance
  if (this.recent_performance.matches_played > 0) {
    this.recent_performance.win_percentage = 
      (this.recent_performance.wins / this.recent_performance.matches_played) * 100;
  }
  
  // Calculate win percentage for each surface
  for (const surface of ['hard', 'clay', 'grass', 'indoor']) {
    if (this.surface_form[surface].matches > 0) {
      this.surface_form[surface].win_percentage = 
        (this.surface_form[surface].wins / this.surface_form[surface].matches) * 100;
    }
  }
  
  // Calculate form rating based on recent performance and momentum indicators
  if (this.recent_performance.matches_played > 0) {
    // Base form rating on win percentage
    let baseRating = this.recent_performance.win_percentage / 10;
    
    // Adjust for streak
    if (this.current_streak.type === 'Win') {
      baseRating += Math.min(this.current_streak.count * 0.5, 2);
    } else if (this.current_streak.type === 'Loss') {
      baseRating -= Math.min(this.current_streak.count * 0.5, 2);
    }
    
    // Adjust for notable wins
    baseRating += Math.min(this.recent_performance.notable_wins.length * 0.5, 1.5);
    
    // Adjust for injury status
    if (this.momentum_indicators.injury_status === 'Minor Injury') {
      baseRating -= 1;
    } else if (this.momentum_indicators.injury_status === 'Recovering') {
      baseRating -= 0.5;
    }
    
    // Ensure rating is between 1 and 10
    this.form_rating = Math.max(1, Math.min(10, Math.round(baseRating)));
  }
  
  next();
});

const PlayerForm = mongoose.model('PlayerForm', playerFormSchema);

export default PlayerForm;
