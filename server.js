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
const { removeCookie } = require('./utils/cookieManager');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { sessionMiddleware, sessionCleanup, sessionSecurity } = require('./config/session');
const { errorHandler } = require('./utils/securityUtils');
const rateLimit = require('express-rate-limit');
const User = require('./models/Users');
const MongoStore = require('connect-mongo');

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
const configuratorRoutes = require('./routes/ConfiguratorRoutes');
const configuratorController = require('./controllers/Configurator');
const app = express();
const qr = require('qrcode');

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

// Enhanced MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...'); // Debug log
    const conn = await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName: 'test' // Explicitly set database name
    });
    console.log(`Connected to MongoDB at ${config.mongodbUri}`);
    console.log('MongoDB connection state:', mongoose.connection.readyState); // Debug log

    // Test session store connection
    const sessionStore = MongoStore.create({
      mongoUrl: config.mongodbUri,
      dbName: 'test',
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60, // 7 days
      autoRemove: 'native',
      touchAfter: 24 * 3600 // 24 hours
    });

    // Test session store
    sessionStore.on('connected', () => {
      console.log('Session store connected successfully');
    });

    sessionStore.on('error', (error) => {
      console.error('Session store error:', error);
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Please make sure MongoDB is running and .env file is properly configured');
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

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

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password +failedLoginAttempts +lastFailedLogin +accountLockedUntil +status +role +isEmailVerified')
        .exec();

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        return done(null, false, { message: 'Account is temporarily locked due to too many failed attempts. Please try again later.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await user.incrementFailedLoginAttempts();
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

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
          "'unsafe-inline'", // Required for some third-party integrations
          "'unsafe-eval'", // Required for some JavaScript frameworks
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
          "https://ajax.googleapis.com",
          "https://kit.fontawesome.com",
          "https://cdnjs.cloudflare.com"
        ],
        scriptSrcAttr: ["'unsafe-inline'"], // Required for some UI components
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for dynamic styles
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
          "https://fonts.cdnfonts.com",
          "https://db.onlinewebfonts.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
          "https://kit.fontawesome.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.cloudinary.com",
          "https://*.amazonaws.com",
          "https://*.railway.app",
          "https://*.stripe.com"
        ],
        connectSrc: [
          "'self'",
          "blob:",
          "https://api.stripe.com",
          "https://kit.fontawesome.com",
          "https://*.railway.app",
          "wss://*.railway.app"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://fonts.cdnfonts.com",
          "https://db.onlinewebfonts.com",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
          "https://kit.fontawesome.com"
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:", "data:"],
        frameSrc: [
          "'self'",
          "https://*.stripe.com" // Required for Stripe payment iframe
        ],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["'self'", "blob:"],
        frameAncestors: ["'self'"],
        formAction: ["'self'", "https://*.stripe.com"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: []
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  })
);

// Static File Serving Configuration
const publicPath = path.join(__dirname, 'public');

// Primary static file serving
app.use(express.static(publicPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

// CSS files with explicit MIME type and case-insensitive handling
app.get('/CSS/*', (req, res, next) => {
  const cssPath = path.join(publicPath, req.path);
  res.set('Content-Type', 'text/css');
  
  // Try multiple case variations
  const tryPaths = [
    cssPath, // Original path
    path.join(path.dirname(cssPath), path.basename(cssPath).toLowerCase()), // Lowercase
    path.join(path.dirname(cssPath), path.basename(cssPath).toUpperCase()) // Uppercase
  ];

  const tryNextPath = (index) => {
    if (index >= tryPaths.length) {
      console.error(`All attempts failed for CSS: ${req.path}`);
      next();
      return;
    }

    res.sendFile(tryPaths[index], err => {
      if (err) {
        console.error(`Attempt ${index + 1} failed for ${tryPaths[index]}:`, err.message);
        tryNextPath(index + 1);
      }
    });
  };

  tryNextPath(0);
});

// JavaScript files with explicit MIME type and case-insensitive handling
app.get('/Javascript/*', (req, res, next) => {
  const jsPath = path.join(publicPath, req.path);
  res.set('Content-Type', 'application/javascript');
  
  // Try multiple case variations
  const tryPaths = [
    jsPath, // Original path
    path.join(path.dirname(jsPath), path.basename(jsPath).toLowerCase()), // Lowercase
    path.join(path.dirname(jsPath), path.basename(jsPath).toUpperCase()) // Uppercase
  ];

  const tryNextPath = (index) => {
    if (index >= tryPaths.length) {
      console.error(`All attempts failed for JS: ${req.path}`);
      next();
      return;
    }

    res.sendFile(tryPaths[index], err => {
      if (err) {
        console.error(`Attempt ${index + 1} failed for ${tryPaths[index]}:`, err.message);
        tryNextPath(index + 1);
      }
    });
  };

  tryNextPath(0);
});

// Image files with explicit MIME types and case-insensitive handling
app.get('/Assets/Images/*', (req, res, next) => {
  const imagePath = path.join(publicPath, req.path);
  const ext = path.extname(imagePath).toLowerCase();
  
  // Set appropriate MIME type based on file extension
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
    '.webp': 'image/webp'
  };
  
  res.set('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  
  // Try multiple paths for the image
  const tryPaths = [
    imagePath, // Original path
    path.join(publicPath, 'Assets/Images/Watches', path.basename(req.path)), // Watches directory
    path.join(publicPath, 'Assets/Images/Brands Logos', path.basename(req.path)), // Brands Logos directory
    path.join(publicPath, 'Assets/Images/Photos', path.basename(req.path)), // Photos directory
    path.join(path.dirname(imagePath), path.basename(imagePath).toLowerCase()) // Lowercase version
  ];

  const tryNextPath = (index) => {
    if (index >= tryPaths.length) {
      console.error(`All attempts failed for image: ${req.path}`);
      next();
      return;
    }

    res.sendFile(tryPaths[index], err => {
      if (err) {
        console.error(`Attempt ${index + 1} failed for ${tryPaths[index]}:`, err.message);
        tryNextPath(index + 1);
      }
    });
  };

  tryNextPath(0);
});

// 3D Model files with explicit MIME type and case-insensitive handling
app.get('/Assets/3D Models/*', (req, res, next) => {
  const modelPath = path.join(__dirname, '..', 'Ahmed', '3D Models', decodeURIComponent(path.basename(req.path)));
  res.set('Content-Type', 'model/gltf-binary');
  
  // Try multiple case variations
  const tryPaths = [
    modelPath, // Original path
    path.join(path.dirname(modelPath), path.basename(modelPath).toLowerCase()), // Lowercase
    path.join(path.dirname(modelPath), path.basename(modelPath).toUpperCase()) // Uppercase
  ];

  const tryNextPath = (index) => {
    if (index >= tryPaths.length) {
      console.error(`All attempts failed for 3D model: ${req.path}`);
      next();
      return;
    }

    res.sendFile(tryPaths[index], err => {
      if (err) {
        console.error(`Attempt ${index + 1} failed for ${tryPaths[index]}:`, err.message);
        tryNextPath(index + 1);
      }
    });
  };

  tryNextPath(0);
});

// Fallback static file handlers (case-insensitive)
app.use('/css', express.static(path.join(publicPath, 'CSS')));
app.use('/javascript', express.static(path.join(publicPath, 'Javascript')));
app.use('/assets', express.static(path.join(publicPath, 'Assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public/assets', express.static(path.join(__dirname, 'public/Assets')));

// Middleware to make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : false;
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

// Protected routes (authentication required)
app.use('/admin', adminRoutes);
app.use('/api/products', productRoutes);

// Configurator routes
app.get('/configurator', configuratorController.renderConfigurator);
app.use('/api/configurator', configuratorRoutes);

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
      res.redirect('/users/home');
    }
  } catch (error) {
    console.error('Logout error:', error);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      res.status(500).json({
        success: false,
        message: 'An error occurred during logout'
      });
    } else {
      res.redirect('/users/home');
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
    res.redirect('/users/home');
  } catch (error) {
    console.error('Admin logout error:', error);
    res.redirect('/users/home');
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);


module.exports = app;
