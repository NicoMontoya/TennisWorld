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

const HeadToHead = mongoose.model('HeadToHead', headToHeadSchema);

export default HeadToHead;
