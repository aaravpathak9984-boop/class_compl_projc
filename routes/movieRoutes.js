const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', movieController.getMovies);
router.get('/new', requireAdmin, movieController.getNewMovie);
router.post('/', requireAdmin, movieController.postMovie);
router.get('/:id', movieController.getMovie);
router.get('/:id/edit', requireAdmin, movieController.getEditMovie);
router.put('/:id', requireAdmin, movieController.putMovie);
router.delete('/:id', requireAdmin, movieController.deleteMovie);
router.post('/:id/showtimes', requireAdmin, movieController.addShowtime);
router.post('/:id/reviews', requireAuth, movieController.postReview);

module.exports = router;
