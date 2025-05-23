require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

// Import route files
const brandsRouter = require("./routes/BrandsRoutes");
const collectionsRouter = require("./routes/CollectionsRoutes");
const usersRouter = require("./routes/UsersRoutes");
const productsRouter = require("./routes/ProductsRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Enhanced MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB at ${process.env.MONGODB_URI}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://127.0.0.1:3001",
      "http://localhost:3001",
      process.env.FRONTEND_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Pagination middleware
const paginationMiddleware = (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0"
      });
    }
    
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 50"
      });
    }

    // Add pagination info to request
    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit
    };

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid pagination parameters"
    });
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());

// Serve static files from Client directory
const clientPath = path.join(__dirname, "../Client");
app.use(express.static(clientPath, {
    setHeaders: (res, path) => {
        if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {
            res.set('Cache-Control', 'public, max-age=86400'); // Cache images for 24 hours
        }
    }
}));

// API Routes with pagination middleware
app.use("/api/brands", paginationMiddleware, brandsRouter);
app.use("/api/collections", paginationMiddleware, collectionsRouter);
app.use("/api/users", paginationMiddleware, usersRouter);
app.use("/api/products", paginationMiddleware, productsRouter);

// Main Routes
app.get('/', (req, res) => {
    res.redirect('/products');
});

app.get('/products', paginationMiddleware, productsRouter);
app.get('/brands', paginationMiddleware, brandsRouter);
app.get('/collections', paginationMiddleware, collectionsRouter);

// Set headers to allow all resources
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Serve static files
app.use('/main/public', express.static(path.join(__dirname, 'public')));
app.use('/main/public/Assets', express.static(path.join(__dirname, 'public/Assets')));
app.use('/Assets', express.static(path.join(__dirname, 'public/Assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/CSS', express.static(path.join(__dirname, 'public/CSS')));
app.use('/Javascript', express.static(path.join(__dirname, 'public/Javascript')));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    dbState: mongoose.connection.readyState,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ 
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${clientPath}`);
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