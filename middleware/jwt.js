const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/Users');

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Fallback for development

// Token expiration times
const TOKEN_EXPIRATION = {
  ACCESS: '24h',
  REFRESH: '7d'
};

// Generate JWT token
const generateToken = (user, type = 'ACCESS') => {
  const expiresIn = type === 'ACCESS' ? TOKEN_EXPIRATION.ACCESS : TOKEN_EXPIRATION.REFRESH;
  
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      type
    },
    JWT_SECRET,
    { expiresIn }
  );
};

// Generate both access and refresh tokens
const generateTokens = (user) => {
  const accessToken = generateToken(user, 'ACCESS');
  const refreshToken = generateToken(user, 'REFRESH');
  
  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return {
      valid: false,
      error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    };
  }
};

// Auth middleware to protect routes
const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.cookies.token || 
                 req.headers.authorization?.split(' ')[1] || 
                 req.headers['x-access-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const { valid, decoded, error } = verifyToken(token);
    
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: error
      });
    }

    // Verify token type
    if (decoded.type !== 'ACCESS') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Fetch fresh user data
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

// Check if user is authenticated but allow request to continue even if not
const optionalJWT = async (req, res, next) => {
  try {
    const token = req.cookies.token || 
                 req.headers.authorization?.split(' ')[1] || 
                 req.headers['x-access-token'];

    if (token) {
      const { valid, decoded } = verifyToken(token);
      
      if (valid && decoded.type === 'ACCESS') {
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.status === 'active') {
          req.user = user;
          req.session.user = {
            id: user._id,
            email: user.email,
            role: user.role
          };
          req.session.isAuthenticated = true;
        } else {
          clearAuthData(req, res);
        }
      } else {
        clearAuthData(req, res);
      }
    } else {
      clearAuthData(req, res);
    }
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    clearAuthData(req, res);
    next();
  }
};

// Helper function to clear authentication data
const clearAuthData = (req, res) => {
  req.user = null;
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.clearCookie('token');
};

// Admin authorization middleware
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

module.exports = {
  generateToken,
  generateTokens,
  verifyToken,
  authenticateJWT,
  optionalJWT,
  isAdmin
};
