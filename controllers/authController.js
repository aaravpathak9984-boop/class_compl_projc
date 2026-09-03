/**
 * ============================================================================
 * Authentication Controller (authController.js)
 * ============================================================================
 * Handles user registration with strict Gmail validation, 6-digit verification
 * email dispatch, account activation, secure login with Bcrypt, and logout.
 */

const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');

/**
 * Render Registration View
 * GET /auth/register
 */
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

/**
 * Handle User Registration
 * POST /auth/register
 * 
 * - Enforces mandatory fields
 * - Validates strict Gmail address format (@gmail.com)
 * - Checks matching passwords (min. 6 characters)
 * - Generates 6-digit verification security code
 * - Sends verification email via Nodemailer
 * - Saves user in unverified state (isVerified: false)
 * - Redirects to /auth/verify
 */
exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword, favoriteGenres } = req.body;
  
  // 1. Mandatory fields check
  if (!name || !name.trim() || !email || !email.trim() || !password || !confirmPassword) {
    req.flash('error_msg', 'All fields are mandatory. Please fill in all fields.');
    return res.redirect('/auth/register');
  }

  // 2. Strict Gmail Address Check
  const cleanEmail = email.trim().toLowerCase();
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  if (!gmailRegex.test(cleanEmail)) {
    req.flash('error_msg', 'Invalid Email: Please enter a valid Gmail address ending with @gmail.com (e.g. yourname@gmail.com).');
    return res.redirect('/auth/register');
  }

  // 3. Check passwords match
  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match. Please re-enter.');
    return res.redirect('/auth/register');
  }

  // 4. Minimum password length
  if (password.length < 6) {
    req.flash('error_msg', 'Password must be at least 6 characters long.');
    return res.redirect('/auth/register');
  }

  try {
    // 5. Verify email uniqueness
    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      if (existingUser.isVerified === false) {
        // Allow re-verification if user previously signed up without verifying
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.verificationCode = verificationCode;
        existingUser.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        await existingUser.save();

        await sendVerificationEmail(cleanEmail, verificationCode);
        req.session.pendingVerification = { email: cleanEmail, code: verificationCode };

        req.flash('error_msg', 'Account already exists but is not verified. A new verification code has been sent!');
        return res.redirect(`/auth/verify?email=${encodeURIComponent(cleanEmail)}`);
      }
      req.flash('error_msg', 'An account with this Gmail address already exists.');
      return res.redirect('/auth/register');
    }

    // 6. Format favorite genres array for recommendation engine
    const genresArray = favoriteGenres 
      ? (Array.isArray(favoriteGenres) ? favoriteGenres : [favoriteGenres]) 
      : [];

    // 7. Generate 6-digit verification code & session token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // 8. Create new User document with isVerified: false
    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: password, // Pre-save hook hashes this with bcrypt
      favoriteGenres: genresArray,
      token: sessionToken,
      isVerified: false,
      verificationCode: verificationCode,
      verificationExpires: verificationExpires
    });

    await user.save();

    // 9. Dispatch verification email via Nodemailer
    await sendVerificationEmail(cleanEmail, verificationCode);

    // Save pending info to session for instant preview helper
    req.session.pendingVerification = {
      email: cleanEmail,
      code: verificationCode
    };

    req.flash('success_msg', 'Verification code sent to your Gmail! Please enter your 6-digit code below.');
    res.redirect(`/auth/verify?email=${encodeURIComponent(cleanEmail)}`);
  } catch (err) {
    console.error('Registration Error:', err);
    req.flash('error_msg', 'A server error occurred during registration. Please try again.');
    res.redirect('/auth/register');
  }
};

/**
 * Render Email Verification View
 * GET /auth/verify
 */
exports.getVerify = async (req, res) => {
  const pending = req.session.pendingVerification || {};
  const email = req.query.email || pending.email || '';
  const previewCode = (pending.email === email && pending.code) ? pending.code : '';

  res.render('auth/verify', {
    title: 'Verify Account',
    email,
    previewCode
  });
};

/**
 * Handle Verification Submission
 * POST /auth/verify
 */
exports.postVerify = async (req, res) => {
  const { email, code } = req.body;
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanCode = code ? code.trim() : '';

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      req.flash('error_msg', 'No account found with this email address.');
      return res.redirect('/auth/register');
    }

    if (user.isVerified) {
      req.flash('success_msg', 'Account is already verified. Please log in.');
      return res.redirect('/auth/login');
    }

    // Check code match
    if (!user.verificationCode || user.verificationCode !== cleanCode) {
      req.flash('error_msg', 'Invalid verification code. Please check your email and try again.');
      return res.redirect(`/auth/verify?email=${encodeURIComponent(cleanEmail)}`);
    }

    // Check expiration
    if (user.verificationExpires && new Date() > user.verificationExpires) {
      req.flash('error_msg', 'Verification code has expired. Please request a new one.');
      return res.redirect(`/auth/verify?email=${encodeURIComponent(cleanEmail)}`);
    }

    // Activate user account
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    delete req.session.pendingVerification;

    req.flash('success_msg', 'User registered and verified successfully! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Verification Error:', err);
    req.flash('error_msg', 'Error verifying account. Please try again.');
    res.redirect('/auth/login');
  }
};

/**
 * Render Login View
 * GET /auth/login
 */
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

/**
 * Handle Login
 * POST /auth/login
 */
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !email.trim() || !password) {
      req.flash('error_msg', 'All fields are mandatory. Please enter both email and password.');
      return res.redirect('/auth/login');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    // Check if account has completed email verification
    if (user.isVerified === false) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = verificationCode;
      user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(cleanEmail, verificationCode);
      req.session.pendingVerification = { email: cleanEmail, code: verificationCode };

      req.flash('error_msg', 'Please verify your Gmail address to activate your account.');
      return res.redirect(`/auth/verify?email=${encodeURIComponent(cleanEmail)}`);
    }

    // Generate fresh session token
    const token = crypto.randomBytes(32).toString('hex');
    user.token = token;
    await user.save();

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
 * Handle Logout
 * GET /auth/logout or POST /auth/logout
 */
exports.logout = async (req, res) => {
  try {
    if (req.session && req.session.user) {
      await User.findByIdAndUpdate(req.session.user.id, { token: null });
    }
  } catch (err) {
    console.error('Error clearing token on logout:', err);
  }

  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error('Session destruction error:', err);
      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/auth/login');
    });
  } else {
    res.clearCookie('connect.sid', { path: '/' });
    res.redirect('/auth/login');
  }
};
