const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const User = require('../models/User');

exports.getBookMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      req.flash('error_msg', 'Movie not found');
      return res.redirect('/movies');
    }
    res.render('bookings/book', { title: `Book ${movie.title}`, movie });
  } catch (err) {
    console.error(err);
    res.redirect('/movies');
  }
};

exports.postBookMovie = async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;
    const numSeats = Number(seats);
    
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.redirect('/movies');

    const showtime = movie.showtimes.id(showtimeId);
    if (!showtime) {
      req.flash('error_msg', 'Invalid showtime');
      return res.redirect(`/movies/${movie._id}/book`);
    }

    if (showtime.totalSeats - showtime.bookedSeats < numSeats) {
      req.flash('error_msg', 'Not enough seats available');
      return res.redirect(`/movies/${movie._id}/book`);
    }

    const totalPrice = numSeats * showtime.price;

    const booking = new Booking({
      user: req.session.user.id,
      movie: movie._id,
      showtimeId: showtime._id,
      date: showtime.date,
      time: showtime.time,
      seats: numSeats,
      totalPrice
    });

    await booking.save();

    // Update showtime booked seats
    showtime.bookedSeats += numSeats;
    movie.bookingCount += 1;
    await movie.save();

    // Update user's favorite genres via $addToSet
    await User.findByIdAndUpdate(req.session.user.id, {
      $addToSet: { favoriteGenres: { $each: movie.genre } }
    });
    
    // Also update session
    req.session.user.favoriteGenres = [...new Set([...req.session.user.favoriteGenres, ...movie.genre])];

    req.flash('success_msg', 'Booking confirmed!');
    res.redirect('/bookings/my');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Booking failed');
    res.redirect(`/movies/${req.params.id}/book`);
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.session.user.id })
      .populate('movie', 'title posterUrl')
      .sort({ createdAt: -1 });
    
    res.render('bookings/my-bookings', { title: 'My Bookings', bookings });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load bookings');
    res.redirect('/movies');
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.user.toString() !== req.session.user.id) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/bookings/my');
    }

    if (booking.status === 'cancelled') {
      req.flash('error_msg', 'Booking already cancelled');
      return res.redirect('/bookings/my');
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up the seats
    const movie = await Movie.findById(booking.movie);
    if (movie) {
      const showtime = movie.showtimes.id(booking.showtimeId);
      if (showtime) {
        showtime.bookedSeats -= booking.seats;
        await movie.save();
      }
    }

    req.flash('success_msg', 'Booking cancelled successfully');
    res.redirect('/bookings/my');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to cancel booking');
    res.redirect('/bookings/my');
  }
};
