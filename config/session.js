const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./env');

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: true, // Changed to true to ensure session is saved
  saveUninitialized: true, // Changed to true to save new sessions
  store: MongoStore.create({
    mongoUrl: config.mongodbUri,
    dbName: 'vaultique',
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days
    autoRemove: 'native',
    touchAfter: 24 * 3600, // 24 hours
    stringify: false, // Don't stringify the session data
    // Remove crypto configuration to prevent decryption errors
    // crypto: {
    //   secret: process.env.SESSION_SECRET
    // }
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
    path: '/', // Ensure cookie is available for all paths
    domain: process.env.COOKIE_DOMAIN || undefined, // Use domain from env if set
    rolling: true // Refresh cookie on activity
  },
  name: 'sessionId', // Change default connect.sid
  rolling: true, // Refresh session on activity
  proxy: true, // Trust the reverse proxy
  genid: function(req) {
    // Generate a consistent session ID based on user agent and IP
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;
    return require('crypto')
      .createHash('sha256')
      .update(userAgent + ip + process.env.SESSION_SECRET)
      .digest('hex');
  }
};

// Session middleware
const sessionMiddleware = session(sessionConfig);

// Session cleanup middleware
const sessionCleanup = (req, res, next) => {
  if (req.session) {
    // Update last activity timestamp
    req.session.lastActivity = Date.now();
    
    // Check for session timeout (24 hours)
    const timeout = 24 * 60 * 60 * 1000; // 24 hours
    if (req.session.lastActivity && (Date.now() - req.session.lastActivity > timeout)) {
      // Instead of regenerating, just update the lastActivity
      req.session.lastActivity = Date.now();
    }
  }
  next();
};

// Session security middleware
const sessionSecurity = (req, res, next) => {
  // Only regenerate session if it's a new session
  if (req.session.isNew) {
    req.session.lastActivity = Date.now();
  }
  next();
};

module.exports = {
  sessionMiddleware,
  sessionCleanup,
  sessionSecurity
}; 