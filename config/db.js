const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || (process.env.NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017/movie_booking_system' : null);
    if (!mongoUri) {
      console.error('CRITICAL ERROR: MONGO_URI environment variable is missing in environment variables!');
      return;
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
