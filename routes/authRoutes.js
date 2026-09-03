/**
 * ============================================================================
 * Authentication Routes (authRoutes.js)
 * ============================================================================
 * Defines endpoints for user registration, authentication login, and logout.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/auth');

// --- Registration Routes ---
// GET /auth/register: Display registration form (redirects to /movies if already authenticated)
router.get('/register', redirectIfAuth, authController.getRegister);
// POST /auth/register: Process registration with strong password rules & Bcrypt
router.post('/register', redirectIfAuth, authController.postRegister);

// --- Login Routes ---
// GET /auth/login: Display login form (redirects to /movies if already authenticated)
router.get('/login', redirectIfAuth, authController.getLogin);
// POST /auth/login: Validate credentials and establish session
router.post('/login', redirectIfAuth, authController.postLogin);

// --- Logout Routes ---
// Support both GET and POST for logout to ensure reliability from links and forms
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
