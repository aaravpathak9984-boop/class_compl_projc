require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Movie = require('./models/Movie');
const connectDB = require('./config/db');

const movies = [
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    language: 'English',
    duration: 148,
    releaseDate: new Date('2010-07-16'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    rating: 4.8,
    numReviews: 120,
    bookingCount: 500,
    showtimes: [
      { date: '2024-12-01', time: '18:00', totalSeats: 100, bookedSeats: 20, price: 15.00 },
      { date: '2024-12-01', time: '21:00', totalSeats: 100, bookedSeats: 50, price: 15.00 }
    ]
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: ['Action', 'Drama', 'Thriller'],
    language: 'English',
    duration: 152,
    releaseDate: new Date('2008-07-18'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    rating: 4.9,
    numReviews: 200,
    bookingCount: 750,
    showtimes: [
      { date: '2024-12-01', time: '19:30', totalSeats: 120, bookedSeats: 10, price: 18.00 }
    ]
  },
  {
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    genre: ['Drama', 'Sci-Fi'],
    language: 'English',
    duration: 169,
    releaseDate: new Date('2014-11-07'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    rating: 4.7,
    numReviews: 150,
    bookingCount: 600,
    showtimes: [
      { date: '2024-12-02', time: '15:00', totalSeats: 80, bookedSeats: 5, price: 12.00 }
    ]
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genre: ['Animation', 'Action', 'Action'],
    language: 'English',
    duration: 140,
    releaseDate: new Date('2023-06-02'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    rating: 4.6,
    numReviews: 80,
    bookingCount: 400,
    showtimes: [
      { date: '2024-12-01', time: '14:00', totalSeats: 150, bookedSeats: 100, price: 10.00 }
    ]
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    
    await User.deleteMany();
    await Movie.deleteMany();
    
    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@cineplex.com',
      password: 'admin123',
      role: 'admin',
      favoriteGenres: ['Action', 'Sci-Fi']
    });

    console.log('Admin user created: admin@cineplex.com / admin123');

    // Create a regular user
    await User.create({
      name: 'Regular User',
      email: 'user@cineplex.com',
      password: 'user123',
      role: 'user',
      favoriteGenres: ['Drama', 'Romance']
    });

    // Seed movies
    const moviesWithAdmin = movies.map(movie => ({ ...movie, createdBy: admin._id }));
    await Movie.insertMany(moviesWithAdmin);

    console.log('Movies seeded successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
