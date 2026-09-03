const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format YYYY-MM-DD
  time: { type: String, required: true }, // Format HH:MM
  totalSeats: { type: Number, required: true, default: 100 },
  bookedSeats: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true }
});

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: [{
    type: String,
  }],
  language: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  releaseDate: {
    type: Date,
  },
  posterUrl: {
    type: String,
  },
  director: {
    type: String,
  },
  cast: [{
    type: String,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  bookingCount: {
    type: Number,
    default: 0,
  },
  showtimes: [showtimeSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create text index for search with language_override: 'none' to allow any movie language
movieSchema.index({ title: 'text', description: 'text', genre: 'text' }, { language_override: 'none' });

module.exports = mongoose.model('Movie', movieSchema);
