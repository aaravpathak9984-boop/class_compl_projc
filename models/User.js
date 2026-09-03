/**
 * ============================================================================
 * User Model (models/User.js)
 * ============================================================================
 * Defines the MongoDB schema for registered cinephiles and administrators,
 * with automatic Bcrypt password hashing via pre-save middleware.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // User's display name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  // Normalized unique login email
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  // Bcrypt hashed password
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  // Access role: 'user' for regular ticket buyers, 'admin' for management
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Selected favorite genres for personalized recommendations
  favoriteGenres: [{
    type: String
  }],
  // Cryptographic session token generated on login and registration
  token: {
    type: String,
    default: null
  },
  // Email verification status and security code
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  }
}, {
  // Automatically manage createdAt and updatedAt timestamps
  timestamps: true
});

/**
 * Mongoose Pre-Save Hook:
 * Intercepts saving the document and hashes plaintext passwords using
 * Bcrypt with 10 salt rounds if the password field was modified or created.
 */
userSchema.pre('save', async function () {
  // If the password hasn't changed, skip re-hashing
  if (!this.isModified('password')) {
    return;
  }
  try {
    // Generate salt with cost factor 10
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

/**
 * Helper method to compare entered plaintext password with the stored hash
 * @param {string} enteredPassword - The plaintext password to verify
 * @returns {Promise<boolean>} True if match, false otherwise
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
