require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// Import route files
const apiRouter = require("./routes/api");
const userController = require("./controllers/User");
const adminRoutes = require("./routes/AdminRoutes");
const adminController = require("./controllers/Admin");

const app = express();
const PORT = process.env.PORT || 3001;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Enhanced MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log(`Connected to MongoDB at ${process.env.MONGODB_URI}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.error("Please make sure MongoDB is running and .env file is properly configured");
    process.exit(1);
  }
};
// Login/Signup page
app.get('/LoginSignup', async (req, res) => {
    try {
        res.render('LoginSignup', {
            title: 'Vaultique | Login & Signup'
        });
    } catch (error) {
        console.error('Error loading auth page:', error);
        renderNotification(res, 'error', 'Failed to load login/signup page. Please try again later.');
    }
});
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS Configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Configure headers to allow cross-origin resources
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  next();
});

// Static File Serving Configuration
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public/Assets', express.static(path.join(__dirname, 'public/Assets')));

// CSS and JavaScript static files
app.use('/CSS', express.static(path.join(publicPath, 'CSS'), (req, res, next) => {
  res.type('text/css');
  next();
}));

app.use('/Javascript', express.static(path.join(publicPath, 'Javascript')), (req, res, next) => {
  res.type('application/javascript');
  next();
});

// API Routes (Backend)
app.use("/api", apiRouter);
app.use("/api/admin", adminRoutes);

// Frontend Routes
app.get('/', (req, res) => res.redirect('/user/home'));
app.use('/user', userController);

// Admin Frontend Routes
app.get('/admin', (req, res) => res.redirect('/admin/dashboard'));
app.get('/admin/dashboard', adminController.renderDashboard);
app.get('/admin/users', adminController.renderUsers);
app.get('/admin/products', adminController.renderProducts);
app.get('/admin/products/create', adminController.renderCreateProduct);
app.get('/admin/analytics', adminController.renderAnalytics);

// 404 handler for API routes - MUST BE AFTER API ROUTES
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// 404 handler for frontend routes - MUST BE AFTER ALL ROUTES
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle API errors
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }

  // Handle frontend errors
  if (err.status === 404) {
    return res.status(404).render('404', {
      title: '404 - Page Not Found',
      message: err.message || 'The page you are looking for does not exist.'
    });
  }

  res.status(err.status || 500).render('error', {
    title: 'Error',
    type: 'error',
    message: err.message || 'Something went wrong!',
    show: true,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Only start the server if this file is run directly
if (require.main === module) {
  // Connect to MongoDB before starting the server
  connectDB().then(() => {
    // Start Server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Serving static files from: ${publicPath}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    });

    // Graceful Shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed");
          process.exit(0);
        });
      });
    });
  }).catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

// Export the app for testing
module.exports = app;