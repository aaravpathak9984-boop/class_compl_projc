module.exports = {
  requireAuth: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/auth/login');
  },

  requireAdmin: (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'Access denied. Admins only.');
    res.redirect('/movies');
  },

  redirectIfAuth: (req, res, next) => {
    if (req.session && req.session.user) {
      return res.redirect('/movies');
    }
    next();
  },

  setCurrentUser: (req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
  }
};
