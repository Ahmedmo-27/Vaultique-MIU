const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
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