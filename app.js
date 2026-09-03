/**
 * ============================================================================
 * Application Entrypoint (app.js)
 * ============================================================================
 * Sets up Express with MongoDB Atlas database connection, production-safe
 * session storage in MongoStore, EJS view templating, and route handlers.
 */

// Load environment variables from .env file in development
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Import authentication and authorization middleware
const { setCurrentUser } = require('./middleware/auth');

// Initialize the Express application
const app = express();

// Connect to MongoDB Atlas (or local development database)
connectDB();

// ----------------------------------------------------------------------------
// View Engine & Layout Configuration
// ----------------------------------------------------------------------------
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); // Master layout: views/layout.ejs

// ----------------------------------------------------------------------------
// Request Body Parsing & HTTP Method Override
// ----------------------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Allows forms to issue PUT and DELETE requests via ?_method=PUT/DELETE
app.use(methodOverride('_method'));

// ----------------------------------------------------------------------------
// Static Assets Folder
// ----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------------------------------
// Development Request Logger
// ----------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ----------------------------------------------------------------------------
// Session & Cookie Configuration (Production-Ready)
// ----------------------------------------------------------------------------
// Trust reverse proxy (e.g. Render / Cloudflare) to ensure secure cookies work
app.set('trust proxy', 1);

// Determine the MongoDB connection string for MongoStore session persistence
const sessionMongoUri = process.env.MONGO_URI || (process.env.NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017/movie_booking_system' : null);

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'cineplex_production_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Enable secure cookies exclusively on HTTPS in production
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Mitigate XSS cookie theft
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days expiration
    sameSite: 'lax', // CSRF defense
  }
};

// Connect session store to MongoDB Atlas so user sessions survive server restarts
if (sessionMongoUri) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: sessionMongoUri,
  });
} else {
  console.warn('WARNING: MONGO_URI is missing. Session will fall back to MemoryStore.');
}

app.use(session(sessionConfig));

// ----------------------------------------------------------------------------
// Flash Messages & User Context Middleware
// ----------------------------------------------------------------------------
app.use(flash());
// Exposes currentUser, success_msg, and error_msg globally to all EJS templates
app.use(setCurrentUser);

// ----------------------------------------------------------------------------
// Application Route Handlers
// ----------------------------------------------------------------------------
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);

// ----------------------------------------------------------------------------
// Health Check Route (Used by Render for Liveness Monitoring)
// ----------------------------------------------------------------------------
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// ----------------------------------------------------------------------------
// Default Home Route -> Redirect to Movie Catalog
// ----------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.redirect('/movies');
});

// ----------------------------------------------------------------------------
// 404 Error Handler (Page Not Found)
// ----------------------------------------------------------------------------
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// ----------------------------------------------------------------------------
// Server Initialization
// ----------------------------------------------------------------------------
// Render automatically assigns process.env.PORT; bind to 0.0.0.0 for container routing
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started and listening on port ${PORT}`);
});
