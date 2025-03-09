import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  player_id: {
    type: Number,
    required: true,
    unique: true
  },
  player_name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
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
  movement: {
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

// Index for faster queries
playerSchema.index({ type: 1, rank: 1 });
playerSchema.index({ player_name: 1 });

const Player = mongoose.model('Player', playerSchema);

export default Player;
