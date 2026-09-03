/**
 * ============================================================================
 * Authentication Routes (authRoutes.js)
 * ============================================================================
 * Defines endpoints for user registration, verification, login, and logout.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/auth');

// --- Registration Routes ---
router.get('/register', redirectIfAuth, authController.getRegister);
router.post('/register', redirectIfAuth, authController.postRegister);

// --- Account Verification Routes ---
router.get('/verify', authController.getVerify);
router.post('/verify', authController.postVerify);

// --- Login Routes ---
router.get('/login', redirectIfAuth, authController.getLogin);
router.post('/login', redirectIfAuth, authController.postLogin);

// --- Logout Routes ---
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
