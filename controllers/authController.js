const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_fallback_key_123456', {
    expiresIn: '30d'
  });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All registration fields are required.' });
    }

    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      return res.status(400).json({ success: false, message: 'Email address already registered.' });
    }

    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      return res.status(400).json({ success: false, message: 'Username is already in use.' });
    }

    const user = await User.create({ username, email, password });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Could not create account with these credentials.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration processing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login processing error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    // req.user has already been resolved by our auth middleware
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Profile query error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
