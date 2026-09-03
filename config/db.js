/**
 * ============================================================================
 * Database Configuration (config/db.js)
 * ============================================================================
 * Connects Mongoose to MongoDB Atlas in production or local MongoDB in development.
 * Handles graceful connection errors without crashing the container process.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Read from environment variable; in local development, fall back to localhost if not set
    const mongoUri = process.env.MONGO_URI || (process.env.NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017/movie_booking_system' : null);
    
    if (!mongoUri) {
      console.error('CRITICAL ERROR: MONGO_URI environment variable is missing in environment variables!');
      return;
    }

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
