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

// Import Middleware
const { setCurrentUser } = require('./middleware/auth');

// Initialize app
const app = express();

// Connect to Database
connectDB();

// EJS & Layouts Setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); // default layout is views/layout.ejs

// Body Parsing & Method Override
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Session Setup
app.set('trust proxy', 1);

let sessionMongoUri = process.env.MONGO_URI;
if (process.env.NODE_ENV !== 'production' && !sessionMongoUri) {
  sessionMongoUri = 'mongodb://127.0.0.1:27017/movie_booking_system';
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: sessionMongoUri,
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    }
  })
);

// Flash Messages
app.use(flash());

// Set Current User & Flash Globals
app.use(setCurrentUser);

// Routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);

// Health check route for Render
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Home Route
app.get('/', (req, res) => {
  res.redirect('/movies');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
