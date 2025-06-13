const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./env');

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongodbUri,
    dbName: 'vaultique',
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days
    autoRemove: 'native',
    touchAfter: 24 * 3600 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'strict'
  },
  name: 'sessionId' // Change default connect.sid
};

// Session middleware
const sessionMiddleware = session(sessionConfig);

// Session cleanup middleware
const sessionCleanup = (req, res, next) => {
  if (req.session && req.session.user) {
    // Update last activity timestamp
    req.session.lastActivity = Date.now();
    
    // Check for session timeout (24 hours)
    const timeout = 24 * 60 * 60 * 1000; // 24 hours
    if (req.session.lastActivity && (Date.now() - req.session.lastActivity > timeout)) {
      // Instead of destroying the session, refresh it
      req.session.regenerate((err) => {
        if (err) {
          console.error('Error regenerating session:', err);
          req.session.destroy();
          return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
          });
        }
        next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
};

// Session security middleware
const sessionSecurity = (req, res, next) => {
  // Prevent session fixation
  if (!req.session.isNew && req.session.user) {
    req.session.regenerate((err) => {
      if (err) {
        console.error('Error regenerating session:', err);
        return next(err);
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = {
  sessionMiddleware,
  sessionCleanup,
  sessionSecurity
}; 