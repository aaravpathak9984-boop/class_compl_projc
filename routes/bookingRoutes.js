const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');

router.get('/my', requireAuth, bookingController.getMyBookings);
router.get('/movies/:id/book', requireAuth, bookingController.getBookMovie); // NOTE: This is mounted on /bookings but conceptually applies to a movie
router.post('/movies/:id/book', requireAuth, bookingController.postBookMovie);
router.post('/:id/cancel', requireAuth, bookingController.cancelBooking);

module.exports = router;
