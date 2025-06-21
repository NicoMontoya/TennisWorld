import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  tournament_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  country_name: {
    type: String,
    trim: true
  },
  surface: {
    type: String,
    required: true,
    trim: true
  },
  indoor: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  draw_size: {
    type: Number,
    default: 32
  },
  prize_money: {
    type: String,
    required: true,
    trim: true
  },
  prize_money_currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },
  type: {
    type: String,
    enum: ['ATP', 'WTA', 'Mixed'],
    default: 'ATP'
  },
  court_speed: {
    type: Number,
    min: 1,
    max: 10
  },
  tournament_director: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  previous_champions: [{
    year: Number,
    player_id: Number,
    player_name: String
  }],
  points: {
    winner: { type: Number, default: 0 },
    finalist: { type: Number, default: 0 },
    semi_finalist: { type: Number, default: 0 },
    quarter_finalist: { type: Number, default: 0 },
    fourth_round: { type: Number, default: 0 },
    third_round: { type: Number, default: 0 },
    second_round: { type: Number, default: 0 },
    first_round: { type: Number, default: 0 }
  },
  venue_details: {
    name: { type: String, trim: true },
    capacity: { type: Number, default: 0 },
    courts: { type: Number, default: 0 },
    image_url: { type: String, trim: true }
  },
  weather_conditions: {
    avg_temperature: { type: Number, default: 0 },
    avg_humidity: { type: Number, default: 0 },
    precipitation_chance: { type: Number, default: 0 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
tournamentSchema.index({ tournament_id: 1 }, { unique: true });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ category: 1 });
tournamentSchema.index({ start_date: 1 });
tournamentSchema.index({ surface: 1 });
tournamentSchema.index({ type: 1 });
tournamentSchema.index({ name: 'text' });

// Virtual for calculating duration in days
tournamentSchema.virtual('duration').get(function() {
  if (this.start_date && this.end_date) {
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for determining if tournament is a Grand Slam
tournamentSchema.virtual('isGrandSlam').get(function() {
  return this.category === 'Grand Slam';
});

// Pre-save middleware to set default values
tournamentSchema.pre('save', function(next) {
  // Set indoor based on surface if not explicitly set
  if (this.surface && this.indoor === undefined) {
    this.indoor = this.surface.toLowerCase().includes('indoor');
  }
  
  // Set type based on category if not explicitly set
  if (this.category && !this.type) {
    if (this.category.includes('WTA')) {
      this.type = 'WTA';
    } else if (this.category.includes('ATP')) {
      this.type = 'ATP';
    } else if (this.category.includes('Mixed')) {
      this.type = 'Mixed';
    }
  }
  
  // Set court speed based on surface if not explicitly set
  if (this.surface && !this.court_speed) {
    if (this.surface.toLowerCase().includes('clay')) {
      this.court_speed = 4;
    } else if (this.surface.toLowerCase().includes('grass')) {
      this.court_speed = 8;
    } else if (this.surface.toLowerCase().includes('hard')) {
      this.court_speed = 6;
    } else if (this.surface.toLowerCase().includes('indoor')) {
      this.court_speed = 7;
    } else {
      this.court_speed = 5;
    }
  }
  
  next();
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;
