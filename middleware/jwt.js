const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Secret key for JWT signing (ideally this would come from environment variables)
const JWT_SECRET = config.jwtSecret || 'jwt_secret_key_for_vaultique_application';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' } // Token expires in 24 hours
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Auth middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const token =
    req.cookies.token || req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

// Check if user is authenticated but allow request to continue even if not
const optionalJWT = (req, res, next) => {
  const token =
    req.cookies.token || req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Ignore token errors in optional auth
    }
  }
  next();
};

// Admin authorization middleware
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateJWT,
  optionalJWT,
  isAdmin,
};
