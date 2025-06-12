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
    });
    console.log(`Connected to MongoDB at ${config.mongodbUri}`);
    console.log('MongoDB connection state:', mongoose.connection.readyState); // Debug log
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Please make sure MongoDB is running and .env file is properly configured');
    process.exit(1);
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://ajax.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://fonts.cdnfonts.com", "https://db.onlinewebfonts.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "blob:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.cdnfonts.com", "https://db.onlinewebfonts.com", "https://cdnjs.cloudflare.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["'self'", "blob:"],
        frameAncestors: ["'self'"],
        formAction: ["'self'"],
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
    res.locals.isAuthenticated = req.isAuthenticated();
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
  res.setTimeout(30000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out.');
  });
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
if (require.main === module) {
  connectDB()
    .then(() => {
      const server = app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
        console.log(`Serving static files from: ${publicPath}`);
        console.log(`Frontend URL: ${config.frontendUrl}`);
      });

      process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
          mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
          });
        });
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

module.exports = app;
