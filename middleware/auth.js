const jwt = require("jsonwebtoken");
const User = require('../models/Users');

// JWT Authentication middleware
const jwtAuth = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
        requestId,
        timing: {
          duration: Date.now() - startTime
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`[${requestId}] Auth error:`, err);
    
    const errorResponse = {
      success: false,
      message: "Token is not valid",
      requestId,
      timing: {
        duration: Date.now() - startTime
      }
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack
      };
    }

    res.status(401).json(errorResponse);
  }
};

// Session-based Authentication middleware
const isAuthenticated = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error in authentication',
            error: error.message
        });
    }
};

// Admin Authentication middleware
const isAdmin = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error in admin authentication',
            error: error.message
        });
    }
};

module.exports = {
    jwtAuth,
    isAuthenticated,
    isAdmin
}; 