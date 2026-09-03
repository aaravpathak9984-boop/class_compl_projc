/**
 * ============================================================================
 * Authentication Middleware (auth.js)
 * ============================================================================
 * Provides route-guard middlewares for access control and template locals.
 */

module.exports = {
  /**
   * Ensure user is authenticated before allowing access to a protected route.
   * Redirects to /auth/login with a notification message if not logged in.
   */
  requireAuth: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Please log in to access this page.');
    res.redirect('/auth/login');
  },

  /**
   * Ensure the logged in user has the 'admin' role.
   * Rejects regular users with an access denied message and redirects to /movies.
   */
  requireAdmin: (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'Access denied. Administrator privileges required.');
    res.redirect('/movies');
  },

  /**
   * Redirect authenticated users away from guest pages (like login and register)
   * to the main movie catalog at /movies.
   */
  redirectIfAuth: (req, res, next) => {
    if (req.session && req.session.user) {
      return res.redirect('/movies');
    }
    next();
  },

  /**
   * Global template context middleware:
   * Binds currentUser and flash messages to res.locals for EJS view rendering.
   */
  setCurrentUser: (req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
  }
};
