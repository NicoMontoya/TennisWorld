import mongoose from 'mongoose';

const headToHeadSchema = new mongoose.Schema({
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
  matches_count: {
    type: Number,
    default: 0
  },
  player1_wins: {
    type: Number,
    default: 0
  },
  player2_wins: {
    type: Number,
    default: 0
  },
  last_match_date: {
    type: Date
  },
  last_match_id: {
    type: Number,
    ref: 'Match'
  },
  surface_stats: {
    hard: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    },
    clay: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    },
    grass: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    },
    indoor: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    }
  },
  tournament_category_stats: {
    grand_slam: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    },
    masters_1000: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    },
    atp_500: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    },
    atp_250: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    },
    other: {
      matches: { type: Number, default: 0 },
      player1_wins: { type: Number, default: 0 },
      player2_wins: { type: Number, default: 0 }
    }
  },
  set_stats: {
    player1_sets_won: { type: Number, default: 0 },
    player2_sets_won: { type: Number, default: 0 },
    tiebreaks_played: { type: Number, default: 0 },
    player1_tiebreaks_won: { type: Number, default: 0 },
    player2_tiebreaks_won: { type: Number, default: 0 }
  },
  game_stats: {
    player1_games_won: { type: Number, default: 0 },
    player2_games_won: { type: Number, default: 0 },
    player1_service_games_won_percentage: { type: Number, default: 0 },
    player2_service_games_won_percentage: { type: Number, default: 0 }
  },
  match_history: [{
    match_id: Number,
    tournament_id: Number,
    tournament_name: String,
    round: String,
    date: Date,
    surface: String,
    winner_id: Number,
    score: String
  }],
  style_matchup_analysis: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness for player pairs
// Also ensures we only store one record per player pair (not duplicating player1/player2 and player2/player1)
headToHeadSchema.index({ player1_id: 1, player2_id: 1 }, { unique: true });

// Ensure player1_id is always less than player2_id to avoid duplicates
headToHeadSchema.pre('save', function(next) {
  if (this.player1_id > this.player2_id) {
    // Swap players and their stats
    const temp = this.player1_id;
    this.player1_id = this.player2_id;
    this.player2_id = temp;
    
    // Swap win counts
    const tempWins = this.player1_wins;
    this.player1_wins = this.player2_wins;
    this.player2_wins = tempWins;
    
    // Swap surface stats
    for (const surface in this.surface_stats) {
      const tempSurfaceWins = this.surface_stats[surface].player1_wins;
      this.surface_stats[surface].player1_wins = this.surface_stats[surface].player2_wins;
      this.surface_stats[surface].player2_wins = tempSurfaceWins;
    }
    
    // Swap tournament category stats
    for (const category in this.tournament_category_stats) {
      const tempCategoryWins = this.tournament_category_stats[category].player1_wins;
      this.tournament_category_stats[category].player1_wins = this.tournament_category_stats[category].player2_wins;
      this.tournament_category_stats[category].player2_wins = tempCategoryWins;
    }
    
    // Swap set stats
    const tempSetsWon = this.set_stats.player1_sets_won;
    this.set_stats.player1_sets_won = this.set_stats.player2_sets_won;
    this.set_stats.player2_sets_won = tempSetsWon;
    
    const tempTiebreaksWon = this.set_stats.player1_tiebreaks_won;
    this.set_stats.player1_tiebreaks_won = this.set_stats.player2_tiebreaks_won;
    this.set_stats.player2_tiebreaks_won = tempTiebreaksWon;
    
    // Swap game stats
    const tempGamesWon = this.game_stats.player1_games_won;
    this.game_stats.player1_games_won = this.game_stats.player2_games_won;
    this.game_stats.player2_games_won = tempGamesWon;
    
    const tempServiceGamesWonPct = this.game_stats.player1_service_games_won_percentage;
    this.game_stats.player1_service_games_won_percentage = this.game_stats.player2_service_games_won_percentage;
    this.game_stats.player2_service_games_won_percentage = tempServiceGamesWonPct;
    
    // Update match history winner references if needed
    if (this.match_history && this.match_history.length > 0) {
      this.match_history.forEach(match => {
        if (match.winner_id === this.player2_id) {
          match.winner_id = this.player1_id;
        } else if (match.winner_id === this.player1_id) {
          match.winner_id = this.player2_id;
        }
      });
    }
  }
  next();
});

// Virtual for getting player1
headToHeadSchema.virtual('player1', {
  ref: 'Player',
  localField: 'player1_id',
  foreignField: 'player_id',
  justOne: true
});

// Virtual for getting player2
headToHeadSchema.virtual('player2', {
  ref: 'Player',
  localField: 'player2_id',
  foreignField: 'player_id',
  justOne: true
});

// Virtual for getting the last match
headToHeadSchema.virtual('lastMatch', {
  ref: 'Match',
  localField: 'last_match_id',
  foreignField: 'match_id',
  justOne: true
});

// Virtual for calculating win percentage for player1
headToHeadSchema.virtual('player1WinPercentage').get(function() {
  if (this.matches_count === 0) return 0;
  return (this.player1_wins / this.matches_count) * 100;
});

// Virtual for calculating win percentage for player2
headToHeadSchema.virtual('player2WinPercentage').get(function() {
  if (this.matches_count === 0) return 0;
  return (this.player2_wins / this.matches_count) * 100;
});

// Virtual for determining the dominant player
headToHeadSchema.virtual('dominantPlayer').get(function() {
  if (this.player1_wins > this.player2_wins) {
    return 1;
  } else if (this.player2_wins > this.player1_wins) {
    return 2;
  }
  return 0; // Tied
});

const HeadToHead = mongoose.model('HeadToHead', headToHeadSchema);

export default HeadToHead;
