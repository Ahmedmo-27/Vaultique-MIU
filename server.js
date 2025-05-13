require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");

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
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
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

// Serve static files from public directory
app.use('/main/public', express.static(path.join(__dirname, 'public')));
app.use('/main/public/Assets', express.static(path.join(__dirname, 'public/Assets')));
app.use('/Assets', express.static(path.join(__dirname, 'public/Assets')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/CSS', express.static(path.join(__dirname, 'public/CSS')));
app.use('/Javascript', express.static(path.join(__dirname, 'public/Javascript')));
app.use('/Images', express.static(path.join(__dirname, 'public/Images')));

// Serve product images
app.use('/Assets/Watches', express.static(path.join(__dirname, 'public/Assets/Watches')));

// CSS and JavaScript static files
app.use('/CSS', express.static(path.join(publicPath, 'CSS'), (req, res, next) => {
  res.type('text/css');
  next();
}));

app.use('/Javascript', express.static(path.join(publicPath, 'Javascript')), (req, res, next) => {
  res.type('application/javascript');
  next();
});

// API Routes
app.use("/api/brands", brandsRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);

// Main Routes
app.get('/', (req, res) => res.redirect('/products'));
app.get('/products', productsRouter);
app.get('/brands', brandsRouter);
app.get('/collections', collectionsRouter);

// Health Check
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
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
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