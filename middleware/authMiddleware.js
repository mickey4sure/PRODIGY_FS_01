const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      
      const secret = process.env.JWT_SECRET || 'secret_fallback_key_123456';
      const decoded = jwt.verify(token, secret);

      // Fetch user profile and exclude password field from output
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User record not found.' });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No auth token provided.' });
  }
};

module.exports = { protect };
