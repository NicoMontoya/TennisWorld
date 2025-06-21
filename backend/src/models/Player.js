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
  first_name: {
    type: String,
    trim: true
  },
  last_name: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  country_name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['ATP', 'WTA'],
    default: 'ATP'
  },
  birthdate: {
    type: Date
  },
  age: {
    type: Number
  },
  height_cm: {
    type: Number
  },
  weight_kg: {
    type: Number
  },
  plays: {
    type: String,
    enum: ['Right-handed', 'Left-handed', null]
  },
  backhand: {
    type: String,
    enum: ['One-handed', 'Two-handed', null]
  },
  turned_pro: {
    type: Number
  },
  coach: {
    type: String,
    trim: true
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
  current_rank: {
    type: Number
  },
  career_high_rank: {
    type: Number
  },
  career_high_rank_date: {
    type: Date
  },
  bio: {
    type: String
  },
  image_url: {
    type: String
  },
  social_media: {
    twitter: { type: String },
    instagram: { type: String },
    facebook: { type: String }
  },
  equipment: {
    racquet: { type: String },
    apparel: { type: String },
    shoes: { type: String }
  },
  career_stats: {
    titles: { type: Number, default: 0 },
    finals: { type: Number, default: 0 },
    win_loss: {
      total: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      },
      hard: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      },
      clay: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      },
      grass: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      },
      indoor: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      }
    },
    prize_money: { type: Number, default: 0 }
  },
  season_stats: {
    titles: { type: Number, default: 0 },
    finals: { type: Number, default: 0 },
    win_loss: {
      total: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      },
      hard: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      },
      clay: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      },
      grass: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      },
      indoor: { 
        wins: { type: Number, default: 0 }, 
        losses: { type: Number, default: 0 } 
      }
    },
    prize_money: { type: Number, default: 0 }
  },
  playing_style: [String],
  notable_achievements: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
playerSchema.index({ player_id: 1 }, { unique: true });
playerSchema.index({ type: 1, rank: 1 });
playerSchema.index({ player_name: 'text', first_name: 'text', last_name: 'text' });
playerSchema.index({ country: 1 });
playerSchema.index({ current_rank: 1 });
playerSchema.index({ career_high_rank: 1 });

// Virtual for calculating age if birthdate is provided
playerSchema.virtual('calculatedAge').get(function() {
  if (this.birthdate) {
    const today = new Date();
    const birthDate = new Date(this.birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

// Pre-save middleware to update age based on birthdate
playerSchema.pre('save', function(next) {
  if (this.birthdate && !this.age) {
    this.age = this.calculatedAge;
  }
  
  // Ensure current_rank is set if not already
  if (!this.current_rank && this.rank) {
    this.current_rank = this.rank;
  }
  
  // Ensure career_high_rank is set if not already
  if (!this.career_high_rank || (this.rank && this.rank < this.career_high_rank)) {
    this.career_high_rank = this.rank;
    this.career_high_rank_date = new Date();
  }
  
  next();
});

const Player = mongoose.model('Player', playerSchema);

export default Player;
