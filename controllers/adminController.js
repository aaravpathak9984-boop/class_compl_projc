const Movie = require('../models/Movie');
const User = require('../models/User');
const Booking = require('../models/Booking');

exports.getDashboard = async (req, res) => {
  try {
    const movieCount = await Movie.countDocuments();
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments({ status: 'confirmed' });
    
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const topMovies = await Movie.find().sort({ bookingCount: -1 }).limit(5);
    
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { movieCount, userCount, bookingCount, totalRevenue },
      topMovies,
      recentBookings
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load dashboard data');
    res.redirect('/movies');
  }
};
