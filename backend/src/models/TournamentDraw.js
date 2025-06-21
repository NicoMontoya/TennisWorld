import mongoose from 'mongoose';

const tournamentDrawSchema = new mongoose.Schema({
  draw_id: {
    type: Number,
    required: true,
    unique: true
  },
  tournament_id: {
    type: Number,
    required: true,
    ref: 'Tournament'
  },
  draw_type: {
    type: String,
    required: true,
    enum: ['Main', 'Qualifying', 'Doubles'],
    default: 'Main'
  },
  draw_size: {
    type: Number,
    required: true,
    enum: [16, 32, 64, 128]
  },
  seeded_players: [{
    seed: Number,
    player_id: Number,
    player_name: String
  }],
  qualifiers: [{
    position: Number,
    player_id: Number,
    player_name: String
  }],
  wildcards: [{
    position: Number,
    player_id: Number,
    player_name: String
  }],
  lucky_losers: [{
    position: Number,
    player_id: Number,
    player_name: String
  }],
  draw_structure: [{
    round: Number,
    match_num: Number,
    position: Number,
    player_id: Number,
    player_name: String,
    seed: Number,
    next_match: Number
  }],
  draw_image_url: {
    type: String,
    trim: true
  },
  draw_ceremony_date: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
tournamentDrawSchema.index({ draw_id: 1 }, { unique: true });
tournamentDrawSchema.index({ tournament_id: 1, draw_type: 1 });
tournamentDrawSchema.index({ 'seeded_players.player_id': 1 });

// Virtual for getting the tournament
tournamentDrawSchema.virtual('tournament', {
  ref: 'Tournament',
  localField: 'tournament_id',
  foreignField: 'tournament_id',
  justOne: true
});

// Virtual for getting all matches in this draw
tournamentDrawSchema.virtual('matches', {
  ref: 'Match',
  localField: 'draw_id',
  foreignField: 'draw_id'
});

// Pre-save middleware to validate draw structure
tournamentDrawSchema.pre('save', function(next) {
  // Ensure draw_size matches the number of positions in draw_structure
  if (this.draw_structure && this.draw_structure.length > 0) {
    const positions = this.draw_structure.map(item => item.position);
    const uniquePositions = [...new Set(positions)];
    
    if (uniquePositions.length !== this.draw_size) {
      const error = new Error(`Draw structure has ${uniquePositions.length} positions but draw_size is ${this.draw_size}`);
      return next(error);
    }
  }
  
  // Ensure seeded players have valid seeds
  if (this.seeded_players && this.seeded_players.length > 0) {
    for (const seededPlayer of this.seeded_players) {
      if (seededPlayer.seed > this.draw_size / 2) {
        const error = new Error(`Invalid seed ${seededPlayer.seed} for draw size ${this.draw_size}`);
        return next(error);
      }
    }
  }
  
  next();
});

const TournamentDraw = mongoose.model('TournamentDraw', tournamentDrawSchema);

export default TournamentDraw;
