/**
 * ============================================================================
 * Authentication Controller (authController.js)
 * ============================================================================
 * Handles user registration with custom strong-password validation, secure
 * login with Bcrypt credential verification, cryptographic token generation
 * for login & signup, and clean session teardown.
 */

const crypto = require('crypto');
const User = require('../models/User');

/**
 * Render the Registration View
 * GET /auth/register
 */
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

/**
 * Handle User Registration
 * POST /auth/register
 * 
 * - Validates matching passwords
 * - Validates strong password recommendations:
 *     * Minimum 8 characters
 *     * At least one uppercase letter (A-Z)
 *     * At least one number (0-9)
 *     * At least one special symbol (!@#$%^&*...)
 * - Normalizes and verifies unique email address
 * - Hashes password using Bcrypt with 10 salt rounds (via User model pre-save hook)
 * - Generates secure cryptographic authentication token for the session
 * - Persists user to MongoDB Atlas and auto-authenticates
 */
exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword, favoriteGenres } = req.body;
  
  // 1. Check if passwords match
  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match. Please re-enter.');
    return res.redirect('/auth/register');
  }

  // 2. Custom Strong Password Validation Recommendations
  if (!password || password.length < 8) {
    req.flash('error_msg', 'Weak Password: Must be at least 8 characters long.');
    return res.redirect('/auth/register');
  }

  if (!/[A-Z]/.test(password)) {
    req.flash('error_msg', 'Weak Password: Must contain at least one uppercase letter (A-Z).');
    return res.redirect('/auth/register');
  }

  if (!/[0-9]/.test(password)) {
    req.flash('error_msg', 'Weak Password: Must contain at least one number (0-9).');
    return res.redirect('/auth/register');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    req.flash('error_msg', 'Weak Password: Must contain at least one special character (!@#$%^&*...).');
    return res.redirect('/auth/register');
  }

  try {
    // 3. Normalize email: trim whitespaces and lowercase
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    
    // 4. Verify if email is already in use
    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      req.flash('error_msg', 'An account with this email already exists.');
      return res.redirect('/auth/register');
    }

    // 5. Format favorite genres array
    const genresArray = favoriteGenres 
      ? (Array.isArray(favoriteGenres) ? favoriteGenres : [favoriteGenres]) 
      : [];

    // 6. Generate cryptographic authentication token for this signup
    const token = crypto.randomBytes(32).toString('hex');

    // 7. Create new User document
    // NOTE: Password is automatically hashed using Bcrypt in User.js pre('save') hook
    const user = new User({
      name: name ? name.trim() : 'Anonymous User',
      email: cleanEmail,
      password: password, // Pre-save hook hashes this with bcrypt
      favoriteGenres: genresArray,
      token: token
    });

    // 8. Save to MongoDB
    await user.save();
    
    // 9. Auto-login newly registered user with session and token
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      favoriteGenres: user.favoriteGenres
    };
    req.session.token = token;

    req.flash('success_msg', 'Registration successful! Welcome to Cineplex.');
    res.redirect('/movies');
  } catch (err) {
    console.error('Registration Error:', err);
    req.flash('error_msg', 'A server error occurred during registration. Please try again.');
    res.redirect('/auth/register');
  }
};

/**
 * Render the Login View
 * GET /auth/login
 */
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

/**
 * Handle User Login
 * POST /auth/login
 * 
 * - Normalizes submitted email
 * - Finds user in MongoDB
 * - Compares plaintext password against Bcrypt hash
 * - Generates a new cryptographic authentication token on each login
 * - Establishes express session saved in MongoDB (connect-mongo)
 */
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Clean email input
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    
    // 2. Query user by email
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    // 3. Check password using bcrypt.compare
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    // 4. Generate new cryptographic authentication token for this login session
    const token = crypto.randomBytes(32).toString('hex');
    user.token = token;
    await user.save();

    // 5. Create session payload with token
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      favoriteGenres: user.favoriteGenres
    };
    req.session.token = token;

    req.flash('success_msg', `Welcome back, ${user.name}!`);
    res.redirect('/movies');
  } catch (err) {
    console.error('Login Error:', err);
    req.flash('error_msg', 'A server error occurred during login.');
    res.redirect('/auth/login');
  }
};

/**
 * Handle User Logout
 * GET /auth/logout or POST /auth/logout
 * 
 * - Clears cryptographic token from user database record
 * - Explicitly destroys session record in MongoDB
 * - Clears the session cookie from the user's browser
 * - Redirects to login page with clean state
 */
exports.logout = async (req, res) => {
  try {
    // Clear user token in database upon logout
    if (req.session && req.session.user) {
      await User.findByIdAndUpdate(req.session.user.id, { token: null });
    }
  } catch (err) {
    console.error('Error clearing token on logout:', err);
  }

  if (req.session) {
    // 1. Destroy session in MongoDB Atlas store
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      // 2. Clear connect.sid cookie from browser
      res.clearCookie('connect.sid', { path: '/' });
      // 3. Redirect to login view
      return res.redirect('/auth/login');
    });
  } else {
    res.clearCookie('connect.sid', { path: '/' });
    res.redirect('/auth/login');
  }
};
