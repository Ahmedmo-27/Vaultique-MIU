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

// Import route files
const apiRouter = require('./routes/api');
const userController = require('./controllers/User');
const adminRoutes = require('./routes/AdminRoutes');
const adminController = require('./controllers/Admin');
const authRoutes = require('./controllers/Auth');
const productRoutes = require('./routes/ProductsRoutes');
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
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// CORS Configuration
app.use(
  cors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Access-Token',
      'X-Requested-With',
    ],
    credentials: true,
    maxAge: 600, // Cache preflight requests for 10 minutes
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
          'https:',
          'http:',
        ],
        scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
        scriptSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:', 'http:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:', 'blob:'],
        connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:'],
        fontSrc: ["'self'", 'https:', 'http:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https:', 'http:', 'blob:'],
        frameSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
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

// Fallback static file handlers (case-insensitive)
app.use('/css', express.static(path.join(publicPath, 'CSS')));
app.use('/javascript', express.static(path.join(publicPath, 'Javascript')));
app.use('/assets', express.static(path.join(publicPath, 'Assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public/assets', express.static(path.join(__dirname, 'public/Assets')));

// Public routes (no authentication required)
app.use('/user', userController);
app.use('/api', apiRouter);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Apply optional authentication to all routes
// This will set req.user if a valid token is present but won't block access
app.use(optionalJWT);

// Protected API routes
app.use('/api/admin', isAdmin, adminRoutes);

// Global logout route for client-side usage
app.get('/logout', (req, res) => {
  removeCookie(res, 'token');
  res.redirect('/user/LoginSignup');
});

// Frontend Routes
app.get('/', (req, res) => res.redirect('/user/home'));

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
  removeCookie(res, 'token');
  res.redirect('/user/LoginSignup');
});

// Increase request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out.');
  });
  next();
});

// Error Handlers
app.use((err, req, res, next) => {
  console.error(err.stack);

  // API errors
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      error: config.nodeEnv === 'development' ? err : undefined,
    });
  }

  // Frontend errors
  if (err.status === 404) {
    return res.status(404).render('404', {
      title: '404 - Page Not Found',
      message: err.message || 'The page you are looking for does not exist.',
    });
  }

  res.status(err.status || 500).render('error', {
    title: 'Error',
    type: 'error',
    message: err.message || 'Something went wrong!',
    show: true,
    error: config.nodeEnv === 'development' ? err : {},
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
