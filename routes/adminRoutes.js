const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/dashboard', requireAuth, requireAdmin, adminController.getDashboard);

module.exports = router;
