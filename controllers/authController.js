const User = require('../models/User');

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword, favoriteGenres } = req.body;
  
  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match.');
    return res.redirect('/auth/register');
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      req.flash('error_msg', 'Email already exists.');
      return res.redirect('/auth/register');
    }

    // favoriteGenres comes as an array or single string from checkboxes
    const genresArray = favoriteGenres ? (Array.isArray(favoriteGenres) ? favoriteGenres : [favoriteGenres]) : [];

    user = new User({
      name,
      email,
      password,
      favoriteGenres: genresArray
    });

    await user.save();
    req.flash('success_msg', 'You are now registered and can log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error during registration.');
    res.redirect('/auth/register');
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid credentials.');
      return res.redirect('/auth/login');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials.');
      return res.redirect('/auth/login');
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      favoriteGenres: user.favoriteGenres
    };

    req.flash('success_msg', `Welcome back, ${user.name}!`);
    res.redirect('/movies');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error during login.');
    res.redirect('/auth/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/auth/login');
  });
};
