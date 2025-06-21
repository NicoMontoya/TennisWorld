import mongoose from 'mongoose';

const playerInjurySchema = new mongoose.Schema({
  injury_id: {
    type: Number,
    required: true,
    unique: true
  },
  player_id: {
    type: Number,
    required: true,
    ref: 'Player'
  },
  injury_type: {
    type: String,
    required: true,
    trim: true
  },
  body_part: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['Minor', 'Moderate', 'Severe'],
    default: 'Moderate'
  },
  start_date: {
    type: Date,
    required: true
  },
  expected_return_date: {
    type: Date
  },
  actual_return_date: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Recovering', 'Returned'],
    default: 'Active'
  },
  tournaments_missed: [{
    type: Number,
    ref: 'Tournament'
  }],
  notes: {
    type: String,
    trim: true
  },
  medical_updates: [{
    date: { type: Date, default: Date.now },
    update: { type: String, trim: true },
    status_change: { type: String, enum: ['Active', 'Recovering', 'Returned'] }
  }],
  recovery_timeline: {
    initial_estimate_weeks: { type: Number },
    current_estimate_weeks: { type: Number },
    recovery_percentage: { type: Number, min: 0, max: 100, default: 0 }
  },
  impact_on_ranking: {
    points_protected: { type: Number, default: 0 },
    ranking_protected: { type: Boolean, default: false },
    protected_ranking: { type: Number }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
playerInjurySchema.index({ injury_id: 1 }, { unique: true });
playerInjurySchema.index({ player_id: 1 });
playerInjurySchema.index({ status: 1 });
playerInjurySchema.index({ start_date: 1 });
playerInjurySchema.index({ body_part: 1 });
playerInjurySchema.index({ severity: 1 });

// Virtual for getting the player
playerInjurySchema.virtual('player', {
  ref: 'Player',
  localField: 'player_id',
  foreignField: 'player_id',
  justOne: true
});

// Virtual for getting the tournaments
playerInjurySchema.virtual('missedTournaments', {
  ref: 'Tournament',
  localField: 'tournaments_missed',
  foreignField: 'tournament_id'
});

// Virtual for calculating injury duration in days
playerInjurySchema.virtual('durationDays').get(function() {
  const endDate = this.actual_return_date || this.expected_return_date || new Date();
  const startDate = this.start_date;
  
  if (!startDate) return 0;
  
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update status based on dates
playerInjurySchema.pre('save', function(next) {
  const now = new Date();
  
  // If actual return date is set, status should be 'Returned'
  if (this.actual_return_date && this.actual_return_date <= now) {
    this.status = 'Returned';
  } 
  // If expected return date is in the future, but we're past the start date, status should be 'Recovering'
  else if (this.expected_return_date && this.expected_return_date > now && this.start_date <= now) {
    this.status = 'Recovering';
  }
  // Otherwise, if start date is in the past or present, status should be 'Active'
  else if (this.start_date <= now) {
    this.status = 'Active';
  }
  
  // Update recovery percentage based on timeline
  if (this.status === 'Recovering' && this.recovery_timeline.initial_estimate_weeks) {
    const totalRecoveryTime = this.recovery_timeline.initial_estimate_weeks * 7 * 24 * 60 * 60 * 1000;
    const timeElapsed = now - this.start_date;
    const recoveryPercentage = Math.min(100, Math.round((timeElapsed / totalRecoveryTime) * 100));
    this.recovery_timeline.recovery_percentage = recoveryPercentage;
  } else if (this.status === 'Returned') {
    this.recovery_timeline.recovery_percentage = 100;
  }
  
  next();
});

// Static method to get active injuries for a player
playerInjurySchema.statics.getActiveInjuries = async function(player_id) {
  return this.find({
    player_id,
    status: { $in: ['Active', 'Recovering'] }
  })
  .sort({ start_date: -1 });
};

// Static method to get injury history for a player
playerInjurySchema.statics.getInjuryHistory = async function(player_id) {
  return this.find({ player_id })
    .sort({ start_date: -1 });
};

// Method to add a medical update
playerInjurySchema.methods.addMedicalUpdate = function(update, statusChange = null) {
  this.medical_updates.push({
    date: new Date(),
    update,
    status_change: statusChange
  });
  
  // Update status if status change is provided
  if (statusChange) {
    this.status = statusChange;
    
    // If status is 'Returned', set actual return date
    if (statusChange === 'Returned' && !this.actual_return_date) {
      this.actual_return_date = new Date();
    }
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update recovery timeline
playerInjurySchema.methods.updateRecoveryTimeline = function(currentEstimateWeeks) {
  this.recovery_timeline.current_estimate_weeks = currentEstimateWeeks;
  
  // Update expected return date based on new estimate
  if (this.start_date && currentEstimateWeeks) {
    const expectedReturn = new Date(this.start_date);
    expectedReturn.setDate(expectedReturn.getDate() + (currentEstimateWeeks * 7));
    this.expected_return_date = expectedReturn;
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to mark as returned
playerInjurySchema.methods.markAsReturned = function(returnDate = new Date()) {
  this.status = 'Returned';
  this.actual_return_date = returnDate;
  this.recovery_timeline.recovery_percentage = 100;
  
  this.medical_updates.push({
    date: returnDate,
    update: 'Player has returned to competition',
    status_change: 'Returned'
  });
  
  this.lastUpdated = new Date();
  return this.save();
};

const PlayerInjury = mongoose.model('PlayerInjury', playerInjurySchema);

export default PlayerInjury;
