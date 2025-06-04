require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { optionalJWT, isAdmin } = require('./middleware/jwt');
const config = require('./config/env');

// Import route files
const apiRouter = require('./routes/api');
const userController = require('./controllers/User');
const adminRoutes = require('./routes/AdminRoutes');
const adminController = require('./controllers/Admin');
const streamChatRoutes = require('./routes/StreamChat');
const authRoutes = require('./controllers/Auth');
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

// Static File Serving Configuration - IMPROVED VERSION FOR RAILWAY
const publicPath = path.join(__dirname, 'public');
console.log('Public path configured as:', publicPath);

// Explicit MIME type handlers
const serveStaticWithType = (directory, contentType) => {
  return (req, res, next) => {
    const filePath = path.join(directory, req.path);
    const fs = require('fs');
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      console.log(`Serving static file: ${filePath} as ${contentType}`);
      res.set('Content-Type', contentType);
      res.sendFile(filePath);
    } else {
      console.log(`File not found: ${filePath}`);
      next();
    }
  };
};

// Primary static file serving
app.use(express.static(publicPath));

// CSS files with explicit MIME type
app.get('/CSS/*', (req, res, next) => {
  const cssPath = path.join(publicPath, req.path);
  res.set('Content-Type', 'text/css');
  res.sendFile(cssPath, err => {
    if (err) {
      console.error(`CSS file error for ${cssPath}:`, err.message);
      next();
    }
  });
});

// JavaScript files with explicit MIME type
app.get('/Javascript/*', (req, res, next) => {
  const jsPath = path.join(publicPath, req.path);
  res.set('Content-Type', 'application/javascript');
  res.sendFile(jsPath, err => {
    if (err) {
      console.error(`JS file error for ${jsPath}:`, err.message);
      next();
    }
  });
});

// Fallback static file handlers (case-insensitive)
app.use('/css', express.static(path.join(publicPath, 'CSS')));
app.use('/javascript', express.static(path.join(publicPath, 'Javascript')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public/assets', express.static(path.join(__dirname, 'public/Assets')));

// Debug route for troubleshooting static files
app.get('/debug-static-files', (req, res) => {
  const fs = require('fs');
  const cssPath = path.join(publicPath, 'CSS/account-details.css');
  const jsPath = path.join(publicPath, 'Javascript/account-details.js');
  
  res.json({
    nodeEnv: process.env.NODE_ENV,
    publicPath,
    cssExists: fs.existsSync(cssPath),
    jsExists: fs.existsSync(jsPath),
    cssPath,
    jsPath,
    cssDir: fs.existsSync(path.join(publicPath, 'CSS')) 
      ? fs.readdirSync(path.join(publicPath, 'CSS')) 
      : 'Directory not found',
    jsDir: fs.existsSync(path.join(publicPath, 'Javascript')) 
      ? fs.readdirSync(path.join(publicPath, 'Javascript')) 
      : 'Directory not found'
  });
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Apply optional authentication to all routes
// This will set req.user if a valid token is present but won't block access
app.use(optionalJWT);

// Protected API routes
app.use('/api', apiRouter);
app.use('/api/admin', adminRoutes); // Already has isAdmin middleware
app.use('/api/stream-chat', isAdmin, streamChatRoutes);

// Global logout route for client-side usage
app.get('/logout', (req, res) => {
  // Clear JWT token cookie
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
  
  // Redirect to login page
  res.redirect('/user/LoginSignup');
});

// Frontend Routes
app.get('/', (req, res) => res.redirect('/user/home'));
app.use('/user', userController); // No authentication required for user pages

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
  // Clear JWT token cookie
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
  
  // Redirect to login page
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
