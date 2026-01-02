require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');
const { optionalJWT, isAdmin } = require('./middleware/jwt');
const config = require('./config/env');
// Asset base URL (allow overriding via ASSET_BASE_URL env var)
const assetBaseUrl = process.env.ASSET_BASE_URL;
const { removeCookie } = require('./utils/cookieManager');
const { sessionMiddleware, sessionCleanup, sessionSecurity } = require('./config/session');
const { errorHandler } = require('./utils/securityUtils');
const rateLimit = require('express-rate-limit');
const User = require('./models/Users');
const MongoStore = require('connect-mongo');
const fs = require('fs');

// Import route files
const apiRouter = require('./routes/api');
const userController = require('./controllers/User');
const adminRoutes = require('./routes/AdminRoutes');
const adminController = require('./controllers/Admin');
const authRoutes = require('./controllers/Auth');
const productRoutes = require('./routes/ProductsRoutes');
const userRoutes = require('./routes/UsersRoutes');
const collectionsRoutes = require('./routes/CollectionsRoutes');
const brandsRoutes = require('./routes/BrandsRoutes');
const cartRoutes = require('./routes/CartRoutes');
const shippingRoutes = require('./routes/ShippingRoutes');
const paymentRoutes = require('./routes/PaymentRoutes');
const stripePaymentRoutes = require('./routes/StripePaymentRoutes');
const configuratorRoutes = require('./routes/ConfiguratorRoutes');
const configuratorController = require('./controllers/Configurator');
const refundRoutes = require('./routes/refundRoutes');
const Order = require('./models/Orders');
const app = express();
const connectDB = require('./config/db');
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    res.status(500).send('Database unavailable');
  }
});
const qr = require('qrcode');

app.set('trust proxy', true);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure MIME types
app.use((req, res, next) => {
    if (req.url.endsWith('.css')) {
        res.type('text/css');
    }
    next();
});

// Performance optimization: Add cache control middleware
const cacheControl = (req, res, next) => {
  // Cache static assets for 1 day
  if (req.url.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  } else {
    // Don't cache dynamic content
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
};



// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More lenient in development
  message: JSON.stringify({
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static files, development environment, and cart operations
    return process.env.NODE_ENV === 'development' || 
           req.path.startsWith('/CSS/') || 
           req.path.startsWith('/Javascript/') || 
           req.path.startsWith('/Assets/') ||
           req.path.startsWith('/cart/'); // Skip rate limiting for cart operations
  }
});

// Apply global rate limiter to all routes
app.use(globalLimiter);

// CORS Configuration
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Access-Token',
      'X-Requested-With',
    ],
    credentials: true,
    maxAge: 600,
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
  })
);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "'unsafe-hashes'",
          "https://accounts.google.com",
          "https://apis.google.com",
          "https://kit.fontawesome.com",
          "https://cdn.jsdelivr.net",
          "https://ajax.googleapis.com",
          "https://js.stripe.com",
          "https://api.stripe.com",
          "https://static.cloudflareinsights.com"
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://stackpath.bootstrapcdn.com",
          "https://maxcdn.bootstrapcdn.com",
          "https://db.onlinewebfonts.com",
          "https://fonts.cdnfonts.com",
          "https://unpkg.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.googleusercontent.com",
          // Allow images served from the configured asset base
          assetBaseUrl
        ],
        // Allow media (video/audio) to be loaded from the configured asset base
        mediaSrc: [
          "'self'",
          "blob:",
          "data:",
          assetBaseUrl
        ],
        connectSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://accounts.google.com",
          "https://oauth2.googleapis.com",
          "https://api.stripe.com",
          "https://ajax.googleapis.com",
          assetBaseUrl
        ],
        frameSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://js.stripe.com"
        ]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  })
);

// Add specific headers for Google Sign-In
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Static File Serving Configuration
const publicPath = path.join(__dirname, 'public');

// Asset handling: serve `.js` and `.css` locally; redirect all other
// asset requests to the configured cloud asset base. This middleware runs
// before static serving so non-JS/CSS local assets are not served from disk.
const assetRedirect = (req, res, next) => {
  const ext = path.extname(req.path || '').toLowerCase();
  // Allow local serving for JS and CSS files
  if (ext === '.js' || ext === '.css') {
    return next();
  }

  // If the request targets common asset directories, redirect to cloud
  const assetPathPattern = /^\/(Assets|assets|public)(\/|$)/i;
  if (assetPathPattern.test(req.path)) {
    if (assetBaseUrl) {
      const base = assetBaseUrl.replace(/\/$/, '');
      const suffix = req.originalUrl || req.url || req.path; // preserve encoding
      const target = base + suffix;
      return res.redirect(302, target);
    }
    // Explicitly refuse to serve local assets when no cloud asset base is set
    return res.status(503).send('Assets are served from cloud storage only. Asset base URL not configured.');
  }

  next();
};

app.use(assetRedirect);

// Primary static file serving (non-asset public files and JS/CSS)
app.use(express.static(publicPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

// Middleware
app.use(express.json({ limit: '10mb' })); // Add request size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression({
  // Performance optimization: Configure compression
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
app.use(cookieParser());
app.use(cacheControl); // Add cache control middleware

// Initialize session middleware with error handling
app.use((req, res, next) => {
  sessionMiddleware(req, res, (err) => {
    if (err) {
      console.error('Session middleware error:', err);
      return next(err);
    }
    next();
  });
});

// Add session debugging middleware
app.use((req, res, next) => {
  console.log('Session state:', {
    hasSession: !!req.session,
    sessionID: req.sessionID,
    hasCart: !!req.session?.cart,
    cartItems: req.session?.cart?.items?.length
  });
  next();
});

app.use(sessionCleanup);
app.use(sessionSecurity);

// Middleware to make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : false;
  // Asset helpers for views
  res.locals.assetBaseUrl = assetBaseUrl;
  res.locals.assetUrl = function (p) {
    if (!p) return p;
    if (typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'))) return p;
    if (typeof p === 'string' && p.startsWith('/')) {
      return assetBaseUrl.replace(/\/$/, '') + encodeURI(p);
    }
    return assetBaseUrl.replace(/\/$/, '') + '/' + encodeURI(p.replace(/^public\//, '').replace(/^\/+/, ''));
  };
  next();
});

// Apply optional JWT middleware to all routes
app.use(optionalJWT);

// Root route handler - must be before other routes
app.get('/', (req, res) => res.redirect('/user/home'));

// Public routes (no authentication required)
app.use('/user', userController);
app.use('/api', apiRouter);
app.use('/api/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/', userRoutes);
app.use('/collections', collectionsRoutes);
app.use('/brands', brandsRoutes);
app.use('/cart', cartRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stripe', stripePaymentRoutes);
app.use('/payment', paymentRoutes);
app.use('/configurator', configuratorRoutes);

// Admin routes
app.use('/admin', adminRoutes);
app.use('/api/products', productRoutes);

// Analytics API routes
app.get('/api/admin/analytics/sales', isAdmin, adminController.getSalesAnalytics);
app.get('/api/admin/analytics/users', isAdmin, adminController.getUserAnalytics);
app.get('/api/admin/analytics/products', isAdmin, adminController.getProductAnalytics);


// Refund routes
app.use('/refunds', refundRoutes);

// Global logout route for client-side usage
app.all('/logout', (req, res) => {
  try {
    // Clear user data from request
    req.user = null;
    
    // Clear session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }
    
    // Clear all auth cookies
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    // Clear any client-side storage
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        message: 'Logged out successfully',
        clearStorage: true
      });
    } else {
      // Redirect to home page
      res.redirect('/user/home');
    }
  } catch (error) {
    console.error('Logout error:', error);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      res.status(500).json({
        success: false,
        message: 'An error occurred during logout'
      });
    } else {
      res.redirect('/user/home');
    }
  }
});

// Admin Frontend Routes
app.get('/admin', (req, res) => res.redirect('/admin/dashboard'));
app.get('/admin/dashboard', isAdmin, adminController.renderDashboard);
app.get('/admin/users', isAdmin, adminController.renderUsers);
app.get('/admin/products', isAdmin, adminController.renderProducts);
app.get('/admin/products/create', isAdmin, adminController.renderCreateProduct);
app.get('/admin/products/:id', isAdmin, adminController.renderProductView);
app.get('/admin/products/:id/edit', isAdmin, adminController.renderProductEdit);
app.get('/admin/analytics', isAdmin, adminController.renderAnalytics);

// Add delete product route
app.delete('/admin/products/:id', isAdmin, adminController.deleteProduct);

// Admin logout route
app.get('/admin/logout', (req, res) => {
  try {
    // Clear user data from request
    req.user = null;
    
    // Clear session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }
    
    // Clear all auth cookies
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    // Redirect to home page
    res.redirect('/user/home');
  } catch (error) {
    console.error('Admin logout error:', error);
    res.redirect('/user/home');
  }
});

// Increase request timeout
app.use((req, res, next) => {
  // Set longer timeout for cart operations
  const timeout = req.path.startsWith('/cart/') ? 60000 : 30000; // 60 seconds for cart, 30 seconds for others
  res.setTimeout(timeout, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out.');
  });
  next();
});

// Custom 404 and admin privilege error handler
app.use((req, res, next) => {
  // Check if this is an admin privilege error
  if (req.path.startsWith('/admin') && (!req.user || req.user.role !== 'admin')) {
    return res.status(404).render('404', {
      title: 'Access Denied',
      message: 'You do not have the required privileges to access this page. Please contact an administrator if you believe this is an error.'
    });
  }
  
  // Handle 404 errors
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist or has been moved.'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Performance optimization: Add response time monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);


module.exports = app;