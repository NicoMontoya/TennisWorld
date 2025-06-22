import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  first_name: {
    type: String,
    trim: true
  },
  last_name: {
    type: String,
    trim: true
  },
  profile_image: {
    type: String,
    trim: true
  },
  account_type: {
    type: String,
    enum: ['Free', 'Premium', 'Admin'],
    default: 'Free'
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  },
  preferences: {
    favorite_players: [Number], // Array of player_ids
    favorite_tournaments: [Number], // Array of tournament_ids
    preferred_surfaces: [String], // Array of surfaces
    notification_settings: {
      email_notifications: { type: Boolean, default: true },
      match_alerts: { type: Boolean, default: true },
      tournament_updates: { type: Boolean, default: true },
      player_news: { type: Boolean, default: true }
    },
    display_settings: {
      dark_mode: { type: Boolean, default: false },
      stats_display_preference: { 
        type: String, 
        enum: ['Basic', 'Advanced', 'All'],
        default: 'Basic'
      },
      default_ranking_type: {
        type: String,
        enum: ['ATP', 'WTA'],
        default: 'ATP'
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['Free', 'Monthly', 'Annual'],
      default: 'Free'
    },
    start_date: Date,
    end_date: Date,
    auto_renew: { type: Boolean, default: false },
    payment_method: String
  },
  activity: {
    last_viewed_players: [{
      player_id: Number,
      timestamp: { type: Date, default: Date.now }
    }],
    last_viewed_tournaments: [{
      tournament_id: Number,
      timestamp: { type: Date, default: Date.now }
    }],
    last_viewed_matches: [{
      match_id: Number,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  social: {
    following_users: [Number], // User IDs being followed
    followers: [Number] // User IDs following this user
  },
  prediction_stats: {
    total_predictions: { type: Number, default: 0 },
    correct_predictions: { type: Number, default: 0 },
    accuracy_percentage: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    rank: { type: Number }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userSchema.index({ user_id: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ account_type: 1 });
userSchema.index({ 'preferences.favorite_players': 1 });
userSchema.index({ 'preferences.favorite_tournaments': 1 });
userSchema.index({ 'prediction_stats.points': -1 }); // For leaderboards

// Virtual for getting full name
userSchema.virtual('fullName').get(function() {
  if (this.first_name && this.last_name) {
    return `${this.first_name} ${this.last_name}`;
  }
  return this.username;
});

// Virtual for getting user predictions
userSchema.virtual('predictions', {
  ref: 'MatchPrediction',
  localField: 'user_id',
  foreignField: 'user_id'
});

// Pre-save middleware to hash password
// Commenting out for now to debug login issues
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   
//   try {
//     // Generate salt
//     const salt = await bcrypt.genSalt(10);
//     
//     // Hash password
//     this.password = await bcrypt.hash(this.password, salt);
//     console.log('Password hashed in pre-save middleware:', this.password);
//     next();
//   } catch (error) {
//     console.error('Error hashing password in pre-save middleware:', error);
//     next(error);
//   }
// });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords in comparePassword method:');
    console.log('Candidate password:', candidatePassword);
    console.log('Stored password:', this.password);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords in comparePassword method:', error);
    throw error;
  }
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.last_login = new Date();
  return this.save();
};

// Method to add viewed player to history
userSchema.methods.addViewedPlayer = function(playerId) {
  // Remove if already exists
  this.activity.last_viewed_players = this.activity.last_viewed_players.filter(
    item => item.player_id !== playerId
  );
  
  // Add to beginning of array
  this.activity.last_viewed_players.unshift({
    player_id: playerId,
    timestamp: new Date()
  });
  
  // Keep only the last 10
  if (this.activity.last_viewed_players.length > 10) {
    this.activity.last_viewed_players = this.activity.last_viewed_players.slice(0, 10);
  }
  
  return this.save();
};

// Method to add viewed tournament to history
userSchema.methods.addViewedTournament = function(tournamentId) {
  // Remove if already exists
  this.activity.last_viewed_tournaments = this.activity.last_viewed_tournaments.filter(
    item => item.tournament_id !== tournamentId
  );
  
  // Add to beginning of array
  this.activity.last_viewed_tournaments.unshift({
    tournament_id: tournamentId,
    timestamp: new Date()
  });
  
  // Keep only the last 10
  if (this.activity.last_viewed_tournaments.length > 10) {
    this.activity.last_viewed_tournaments = this.activity.last_viewed_tournaments.slice(0, 10);
  }
  
  return this.save();
};

// Method to add viewed match to history
userSchema.methods.addViewedMatch = function(matchId) {
  // Remove if already exists
  this.activity.last_viewed_matches = this.activity.last_viewed_matches.filter(
    item => item.match_id !== matchId
  );
  
  // Add to beginning of array
  this.activity.last_viewed_matches.unshift({
    match_id: matchId,
    timestamp: new Date()
  });
  
  // Keep only the last 10
  if (this.activity.last_viewed_matches.length > 10) {
    this.activity.last_viewed_matches = this.activity.last_viewed_matches.slice(0, 10);
  }
  
  return this.save();
};

// Method to update prediction stats
userSchema.methods.updatePredictionStats = function(correct) {
  this.prediction_stats.total_predictions += 1;
  
  if (correct) {
    this.prediction_stats.correct_predictions += 1;
    this.prediction_stats.points += 10; // Award 10 points for correct prediction
  }
  
  // Update accuracy percentage
  if (this.prediction_stats.total_predictions > 0) {
    this.prediction_stats.accuracy_percentage = 
      (this.prediction_stats.correct_predictions / this.prediction_stats.total_predictions) * 100;
  }
  
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
