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

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        // First check if user is authenticated
        await isAuthenticated(req, res, () => {
            // Check if user is admin
            if (req.user && req.user.role === 'admin') {
                next();
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin only.'
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking admin status'
        });
    }
};

// Middleware to check if user is a regular user (not admin)
const isUser = async (req, res, next) => {
    try {
        // First check if user is authenticated
        await isAuthenticated(req, res, () => {
            // Check if user is a regular user
            if (req.user && req.user.role === 'user') {
                next();
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Users only.'
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking user status'
        });
    }
};

// Middleware for optional authentication - sets req.user if token is valid, but doesn't block access
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            // No token, continue without user info
            return next();
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token
            const user = await User.findById(decoded.id).select('-password');
            
            if (user && user.status === 'active') {
                // Add user to request object
                req.user = user;
            }
        } catch (error) {
            // Invalid token, but we still continue without blocking
            console.log('Optional auth error:', error.message);
        }
        
        // Continue regardless of auth success/failure
        next();
    } catch (error) {
        // Continue with request even if there was an error
        console.error('Optional auth error:', error);
        next();
    }
};

module.exports = {
    jwtAuth,
    isAuthenticated,
    isAdmin,
    isUser,
    optionalAuth
}; 