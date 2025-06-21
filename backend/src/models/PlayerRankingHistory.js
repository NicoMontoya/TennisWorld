import mongoose from 'mongoose';

const playerRankingHistorySchema = new mongoose.Schema({
  player_id: {
    type: Number,
    required: true,
    ref: 'Player'
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
  ranking_date: {
    type: Date,
    required: true
  },
  week_number: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  tournament_points_change: [{
    tournament_id: Number,
    points_added: Number,
    points_dropped: Number,
    date: Date
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness for player, type, and date
playerRankingHistorySchema.index({ 
  player_id: 1, 
  type: 1, 
  ranking_date: 1 
}, { unique: true });

// Indexes for faster queries
playerRankingHistorySchema.index({ player_id: 1, year: 1 });
playerRankingHistorySchema.index({ type: 1, ranking_date: 1 });
playerRankingHistorySchema.index({ type: 1, year: 1, week_number: 1 });
playerRankingHistorySchema.index({ rank: 1, type: 1, ranking_date: 1 });

// Virtual for getting the player
playerRankingHistorySchema.virtual('player', {
  ref: 'Player',
  localField: 'player_id',
  foreignField: 'player_id',
  justOne: true
});

// Static method to record a new ranking
playerRankingHistorySchema.statics.recordRanking = async function(rankingData) {
  const { 
    player_id, 
    type, 
    rank, 
    points, 
    ranking_date,
    tournament_points_change
  } = rankingData;
  
  // Calculate week number and year
  const date = new Date(ranking_date);
  const year = date.getFullYear();
  
  // Calculate week number (1-53)
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const week_number = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  // Check if a ranking already exists for this player, type, and date
  const existingRanking = await this.findOne({
    player_id,
    type,
    ranking_date
  });
  
  if (existingRanking) {
    // Update existing ranking
    existingRanking.rank = rank;
    existingRanking.points = points;
    
    // Add tournament points changes if provided
    if (tournament_points_change && tournament_points_change.length > 0) {
      existingRanking.tournament_points_change = tournament_points_change;
    }
    
    existingRanking.lastUpdated = new Date();
    return existingRanking.save();
  } else {
    // Create new ranking record
    return this.create({
      player_id,
      type,
      rank,
      points,
      ranking_date,
      week_number,
      year,
      tournament_points_change: tournament_points_change || [],
      lastUpdated: new Date()
    });
  }
};

// Static method to get ranking history for a player
playerRankingHistorySchema.statics.getPlayerRankingHistory = async function(player_id, type, options = {}) {
  const { 
    startDate, 
    endDate, 
    limit = 52 // Default to one year of weekly rankings
  } = options;
  
  const query = { player_id, type };
  
  // Add date range if provided
  if (startDate || endDate) {
    query.ranking_date = {};
    
    if (startDate) {
      query.ranking_date.$gte = new Date(startDate);
    }
    
    if (endDate) {
      query.ranking_date.$lte = new Date(endDate);
    }
  }
  
  // Get ranking history sorted by date (descending)
  return this.find(query)
    .sort({ ranking_date: -1 })
    .limit(limit);
};

// Static method to get rankings for a specific date
playerRankingHistorySchema.statics.getRankingsForDate = async function(type, date, limit = 100) {
  // Find the closest ranking date on or before the specified date
  const closestRankingDate = await this.findOne({
    type,
    ranking_date: { $lte: new Date(date) }
  })
  .sort({ ranking_date: -1 })
  .select('ranking_date');
  
  if (!closestRankingDate) {
    return [];
  }
  
  // Get rankings for that date
  return this.find({
    type,
    ranking_date: closestRankingDate.ranking_date
  })
  .sort({ rank: 1 })
  .limit(limit);
};

// Static method to get career high ranking for a player
playerRankingHistorySchema.statics.getCareerHighRanking = async function(player_id, type) {
  return this.findOne({
    player_id,
    type
  })
  .sort({ rank: 1, ranking_date: -1 })
  .limit(1);
};

const PlayerRankingHistory = mongoose.model('PlayerRankingHistory', playerRankingHistorySchema);

export default PlayerRankingHistory;
