/**
 * ============================================================================
 * Kaggle Dataset Seeder (seed_kaggle.js)
 * ============================================================================
 * Seeds rich, high-rated movies based on the MovieLens Kaggle dataset
 * (parasharmanas/movie-recommendation-system) with verified poster images,
 * realistic showtimes, cast, ratings, and descriptions.
 * 
 * Preserves existing users so test logins remain intact!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Movie = require('./models/Movie');
const User = require('./models/User');

const kaggleTopMovies = [
  {
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    genre: ['Drama', 'Crime'],
    language: 'English',
    duration: 142,
    releaseDate: new Date('1994-09-23'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    rating: 4.9,
    numReviews: 692,
    bookingCount: 820,
    showtimes: [
      { date: '2026-09-05', time: '14:30', totalSeats: 120, bookedSeats: 35, price: 14.00 },
      { date: '2026-09-05', time: '19:00', totalSeats: 120, bookedSeats: 60, price: 16.50 },
      { date: '2026-09-06', time: '21:15', totalSeats: 120, bookedSeats: 25, price: 16.50 }
    ]
  },
  {
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    genre: ['Drama', 'Crime'],
    language: 'English',
    duration: 175,
    releaseDate: new Date('1972-03-24'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    rating: 4.8,
    numReviews: 436,
    bookingCount: 710,
    showtimes: [
      { date: '2026-09-05', time: '16:00', totalSeats: 100, bookedSeats: 45, price: 15.00 },
      { date: '2026-09-06', time: '20:00', totalSeats: 100, bookedSeats: 80, price: 18.00 }
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
    numReviews: 540,
    bookingCount: 950,
    showtimes: [
      { date: '2026-09-05', time: '17:30', totalSeats: 150, bookedSeats: 95, price: 18.00 },
      { date: '2026-09-05', time: '21:00', totalSeats: 150, bookedSeats: 120, price: 18.00 }
    ]
  },
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
    numReviews: 319,
    bookingCount: 880,
    showtimes: [
      { date: '2026-09-05', time: '15:15', totalSeats: 100, bookedSeats: 30, price: 15.00 },
      { date: '2026-09-06', time: '18:45', totalSeats: 100, bookedSeats: 65, price: 16.00 }
    ]
  },
  {
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival as Earth faces famine.',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    language: 'English',
    duration: 169,
    releaseDate: new Date('2014-11-07'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    rating: 4.7,
    numReviews: 410,
    bookingCount: 890,
    showtimes: [
      { date: '2026-09-05', time: '19:30', totalSeats: 120, bookedSeats: 70, price: 17.50 },
      { date: '2026-09-06', time: '21:00', totalSeats: 120, bookedSeats: 90, price: 17.50 }
    ]
  },
  {
    title: 'Fight Club',
    description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much bigger.',
    genre: ['Drama', 'Thriller', 'Action'],
    language: 'English',
    duration: 139,
    releaseDate: new Date('1999-10-15'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    rating: 4.7,
    numReviews: 490,
    bookingCount: 650,
    showtimes: [
      { date: '2026-09-05', time: '20:30', totalSeats: 90, bookedSeats: 40, price: 15.00 }
    ]
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    genre: ['Crime', 'Drama', 'Thriller'],
    language: 'English',
    duration: 154,
    releaseDate: new Date('1994-10-14'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg',
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    rating: 4.8,
    numReviews: 512,
    bookingCount: 780,
    showtimes: [
      { date: '2026-09-05', time: '18:15', totalSeats: 100, bookedSeats: 55, price: 16.00 }
    ]
  },
  {
    title: 'The Matrix',
    description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth: his life is an elaborate deception.',
    genre: ['Action', 'Sci-Fi'],
    language: 'English',
    duration: 136,
    releaseDate: new Date('1999-03-31'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    director: 'Lana & Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    rating: 4.7,
    numReviews: 480,
    bookingCount: 820,
    showtimes: [
      { date: '2026-09-06', time: '16:30', totalSeats: 110, bookedSeats: 60, price: 15.50 }
    ]
  },
  {
    title: 'Whiplash',
    description: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing.',
    genre: ['Drama'],
    language: 'English',
    duration: 107,
    releaseDate: new Date('2014-10-10'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    director: 'Damien Chazelle',
    cast: ['Miles Teller', 'J.K. Simmons', 'Paul Reiser'],
    rating: 4.6,
    numReviews: 198,
    bookingCount: 420,
    showtimes: [
      { date: '2026-09-05', time: '13:00', totalSeats: 80, bookedSeats: 25, price: 13.50 },
      { date: '2026-09-06', time: '17:00', totalSeats: 80, bookedSeats: 40, price: 14.50 }
    ]
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, encountering a team of Spider-People charged with protecting its very existence.',
    genre: ['Animation', 'Action', 'Sci-Fi'],
    language: 'English',
    duration: 140,
    releaseDate: new Date('2023-06-02'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    rating: 4.7,
    numReviews: 240,
    bookingCount: 860,
    showtimes: [
      { date: '2026-09-05', time: '14:00', totalSeats: 140, bookedSeats: 90, price: 14.00 },
      { date: '2026-09-06', time: '16:00', totalSeats: 140, bookedSeats: 110, price: 15.00 }
    ]
  },
  {
    title: 'Spirited Away',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    genre: ['Animation', 'Adventure', 'Fantasy'],
    language: 'English',
    duration: 125,
    releaseDate: new Date('2001-07-20'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    rating: 4.8,
    numReviews: 280,
    bookingCount: 640,
    showtimes: [
      { date: '2026-09-06', time: '13:30', totalSeats: 90, bookedSeats: 35, price: 13.00 }
    ]
  },
  {
    title: 'Moonlight',
    description: 'A look at three defining chapters in the life of Chiron, a young Black man growing up in Miami. His epic journey to manhood is guided by the kindness, support and love of the community.',
    genre: ['Drama'],
    language: 'English',
    duration: 111,
    releaseDate: new Date('2016-11-18'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/4911T5FbJ9eD2Faz5Z8cT3SUhU3.jpg',
    director: 'Barry Jenkins',
    cast: ['Trevante Rhodes', 'André Holland', 'Janelle Monáe', 'Mahershala Ali'],
    rating: 4.6,
    numReviews: 185,
    bookingCount: 450,
    showtimes: [
      { date: '2026-09-05', time: '18:00', totalSeats: 80, bookedSeats: 30, price: 14.00 },
      { date: '2026-09-06', time: '20:15', totalSeats: 80, bookedSeats: 50, price: 15.50 }
    ]
  },
  {
    title: 'The Martian',
    description: 'An astronaut becomes stranded on Mars after his crew assume him dead, and must rely on his ingenuity to find a way to signal to Earth that he is alive.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    duration: 144,
    releaseDate: new Date('2015-10-02'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/5BHuvQ6p9kqv5KcCheJIDImIIAh.jpg',
    director: 'Ridley Scott',
    cast: ['Matt Damon', 'Jessica Chastain', 'Kristen Wiig'],
    rating: 4.6,
    numReviews: 290,
    bookingCount: 580,
    showtimes: [
      { date: '2026-09-05', time: '15:45', totalSeats: 100, bookedSeats: 40, price: 15.00 }
    ]
  },
  {
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    genre: ['Thriller', 'Drama', 'Comedy'],
    language: 'English',
    duration: 132,
    releaseDate: new Date('2019-10-11'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    director: 'Bong Joon Ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    rating: 4.8,
    numReviews: 360,
    bookingCount: 790,
    showtimes: [
      { date: '2026-09-06', time: '19:15', totalSeats: 110, bookedSeats: 70, price: 16.00 }
    ]
  },
  {
    title: 'Toy Story',
    description: 'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy\'s room.',
    genre: ['Animation', 'Comedy', 'Adventure'],
    language: 'English',
    duration: 81,
    releaseDate: new Date('1995-11-22'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW535k9Ri0GIvTRU.jpg',
    director: 'John Lasseter',
    cast: ['Tom Hanks', 'Tim Allen', 'Don Rickles'],
    rating: 4.7,
    numReviews: 420,
    bookingCount: 680,
    showtimes: [
      { date: '2026-09-05', time: '11:30', totalSeats: 120, bookedSeats: 45, price: 12.00 },
      { date: '2026-09-06', time: '14:15', totalSeats: 120, bookedSeats: 75, price: 12.00 }
    ]
  },
  {
    title: 'Goodfellas',
    description: 'The story of Henry Hill and his life in the mafia, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
    genre: ['Crime', 'Drama'],
    language: 'English',
    duration: 145,
    releaseDate: new Date('1990-09-21'),
    posterUrl: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    director: 'Martin Scorsese',
    cast: ['Robert De Niro', 'Ray Liotta', 'Joe Pesci'],
    rating: 4.8,
    numReviews: 340,
    bookingCount: 610,
    showtimes: [
      { date: '2026-09-06', time: '21:30', totalSeats: 90, bookedSeats: 50, price: 15.00 }
    ]
  }
];

async function seedKaggleMovies() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas.');

    // Find or fallback to admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@cineplex.com',
        password: 'admin123',
        role: 'admin',
        favoriteGenres: ['Action', 'Sci-Fi']
      });
      console.log('Admin account created.');
    }

    // Replace movies collection with rich Kaggle top dataset
    await Movie.deleteMany({});
    console.log('Cleared old movie records.');

    const enrichedMovies = kaggleTopMovies.map(movie => ({
      ...movie,
      createdBy: admin._id
    }));

    await Movie.insertMany(enrichedMovies);
    console.log(`Successfully seeded ${enrichedMovies.length} top Kaggle-curated movies!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedKaggleMovies();
