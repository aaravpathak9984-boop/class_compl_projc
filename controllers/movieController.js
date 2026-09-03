const Movie = require('../models/Movie');
const Review = require('../models/Review');

exports.getMovies = async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (genre) {
      query.genre = genre;
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 });

    // Recommendation logic
    let recommended = [];
    let popular = [];

    popular = await Movie.find().sort({ bookingCount: -1, rating: -1 }).limit(10);

    if (req.session && req.session.user && req.session.user.favoriteGenres && req.session.user.favoriteGenres.length > 0) {
      recommended = await Movie.find({ genre: { $in: req.session.user.favoriteGenres } })
        .sort({ rating: -1, bookingCount: -1 })
        .limit(10);
    }

    res.render('movies/list', { 
      title: 'Movies', 
      movies, 
      searchQuery: search || '',
      selectedGenre: genre || '',
      recommended,
      popular
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to fetch movies');
    res.redirect('/');
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      req.flash('error_msg', 'Movie not found');
      return res.redirect('/movies');
    }

    const reviews = await Review.find({ movie: movie._id }).populate('user', 'name');
    const moreLikeThis = await Movie.find({ 
      genre: { $in: movie.genre }, 
      _id: { $ne: movie._id } 
    }).limit(4);

    res.render('movies/detail', { title: movie.title, movie, reviews, moreLikeThis });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/movies');
  }
};

// Admin only: render new movie form
exports.getNewMovie = (req, res) => {
  res.render('movies/add', { title: 'Add New Movie', movie: null });
};

// Admin only: create movie
exports.postMovie = async (req, res) => {
  try {
    const { title, description, genre, language, duration, releaseDate, posterUrl, director, cast } = req.body;
    const genresArray = genre ? (Array.isArray(genre) ? genre : [genre]) : [];
    const castArray = cast ? cast.split(',').map(c => c.trim()) : [];

    const movie = new Movie({
      title, description, genre: genresArray, language, duration, releaseDate, posterUrl, director, cast: castArray, createdBy: req.session.user.id
    });
    
    await movie.save();
    req.flash('success_msg', 'Movie added successfully');
    res.redirect('/movies');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add movie');
    res.redirect('/movies/new');
  }
};

// Admin only: render edit movie form
exports.getEditMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      req.flash('error_msg', 'Movie not found');
      return res.redirect('/movies');
    }
    res.render('movies/add', { title: 'Edit Movie', movie });
  } catch (err) {
    console.error(err);
    res.redirect('/movies');
  }
};

// Admin only: update movie
exports.putMovie = async (req, res) => {
  try {
    const { title, description, genre, language, duration, releaseDate, posterUrl, director, cast } = req.body;
    const genresArray = genre ? (Array.isArray(genre) ? genre : [genre]) : [];
    const castArray = cast ? cast.split(',').map(c => c.trim()) : [];

    await Movie.findByIdAndUpdate(req.params.id, {
      title, description, genre: genresArray, language, duration, releaseDate, posterUrl, director, cast: castArray
    });

    req.flash('success_msg', 'Movie updated successfully');
    res.redirect(`/movies/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update movie');
    res.redirect(`/movies/${req.params.id}/edit`);
  }
};

// Admin only: delete movie
exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Movie deleted successfully');
    res.redirect('/movies');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete movie');
    res.redirect(`/movies/${req.params.id}`);
  }
};

// Admin only: add showtime
exports.addShowtime = async (req, res) => {
  try {
    const { date, time, totalSeats, price } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.redirect('/movies');

    movie.showtimes.push({ date, time, totalSeats: Number(totalSeats), price: Number(price) });
    await movie.save();
    
    req.flash('success_msg', 'Showtime added successfully');
    res.redirect(`/movies/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add showtime');
    res.redirect(`/movies/${req.params.id}`);
  }
};

// User only: post review
exports.postReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) return res.redirect('/movies');

    const review = new Review({
      user: req.session.user.id,
      movie: movie._id,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Recompute average rating
    const reviews = await Review.find({ movie: movie._id });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    
    movie.rating = avgRating;
    movie.numReviews = reviews.length;
    await movie.save();

    req.flash('success_msg', 'Review submitted successfully');
    res.redirect(`/movies/${req.params.id}`);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      req.flash('error_msg', 'You have already reviewed this movie');
    } else {
      req.flash('error_msg', 'Failed to submit review');
    }
    res.redirect(`/movies/${req.params.id}`);
  }
};
