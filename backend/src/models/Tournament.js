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
  surface: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  prize_money: {
    type: String,
    required: true,
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
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ category: 1 });
tournamentSchema.index({ start_date: 1 });

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;
