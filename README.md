# Movie Booking System

A full-stack movie booking and recommendation system built with Node.js, Express, MongoDB, and EJS.

## Features
- **Authentication**: Register, Login, Session Management.
- **Movies**: Browse, search, filter by genre. Includes "Recommended for You" and "Popular Right Now".
- **Booking**: Pick a showtime, choose seats, and book tickets. Live seat availability calculation.
- **Admin**: Dashboard with revenue and booking stats. Full CRUD for movies and showtimes.
- **Reviews**: Leave ratings and reviews for movies.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and adjust the variables if needed (e.g., your MongoDB URI).
   ```bash
   cp .env.example .env
   ```
   *Make sure you have a local instance of MongoDB running on `mongodb://127.0.0.1:27017`.*

3. **Seed the Database**
   Populate the database with sample movies and an admin account.
   ```bash
   npm run seed
   ```
   **Admin credentials:**
   - Email: `admin@cineplex.com`
   - Password: `admin123`
   
   **Test user credentials:**
   - Email: `user@cineplex.com`
   - Password: `user123`

4. **Start the Application**
   For development (uses nodemon):
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

5. **Access the App**
   Open your browser and navigate to `http://localhost:3000`.
