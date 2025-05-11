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
const PORT = process.env.PORT || 3000;

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
      "http://127.0.0.1:5508",
      "http://localhost:5508",
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

// API Routes with pagination middleware
app.use("/api/brands", paginationMiddleware, brandsRouter);
app.use("/api/collections", paginationMiddleware, collectionsRouter);
app.use("/api/users", paginationMiddleware, usersRouter);
app.use("/api/products", paginationMiddleware, productsRouter);

// Serve static files from Client directory
const clientPath = path.join(__dirname, "../Client");
app.use(express.static(clientPath));

// Brand Page Route
app.get(["/brands/:name", "/Brand-Page.html"], (req, res) => {
  res.sendFile(path.join(clientPath, "Brand-Page.html"));
});

// Collection Page Route
app.get(["/collections/:name", "/Collection-Page.html"], (req, res) => {
  res.sendFile(path.join(clientPath, "Collection-Page.html"));
});

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
  res.status(404).sendFile(path.join(clientPath, "404.html"));
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