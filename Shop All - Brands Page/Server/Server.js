require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Database Models
const Product = require("./productdb.js");
const Brand = require("./Brandsdb.js");
const Collection = require("./Collectionsdb.js");
const User = require('./Usersdb');

// Server Configuration
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection Configuration
const MONGODB_CONFIG = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
};

// CORS Configuration
const CORS_CONFIG = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://127.0.0.1:5507",
      "http://localhost:5507",
      "http://192.168.1.8:5507",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(null, true); // During development, allow all origins
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  credentials: true,
};

// Brand Name Normalization
const BRAND_MAPPINGS = {
  "rolex": "Rolex",
  "omega": "Omega",
  "cartier": "Cartier",
  "patek-philippe": "Patek Philippe",
  "patek": "Patek Philippe",
  "audemars-piguet": "Audemars Piguet",
  "ap": "Audemars Piguet",
  "a-lange-sohne": "A.Lange & Söhne",
  "lange": "A.Lange & Söhne",
  "A.lange ": "A.Lange & Söhne",
  "vacheron-constantin": "Vacheron Constantin",
  "vc": "Vacheron Constantin",
  "jacob-co": "Jacob & Co",
  "Jacob ": "Jacob & Co",
  "richard-mille": "Richard Mille",
  "rm": "Richard Mille",
  "breitling": "Breitling"
};

// Collection Name Normalization
const COLLECTION_MAPPINGS = {
  "classic & dress": "Classic & Dress Collection",
  "casual & everyday": "Casual & Everyday Collection",
  "sports & adventure": "Sports & Adventure Collection",
  "aviation & travel": "Aviation & Travel Collection",
  "luxury & heritage": "Luxury & Heritage Collection",
  "classic": "Classic & Dress Collection",
  "casual": "Casual & Everyday Collection",
  "sports": "Sports & Adventure Collection",
  "aviation": "Aviation & Travel Collection",
  "luxury": "Luxury & Heritage Collection",
  "Classic ": "Classic & Dress Collection",
  "Casual ": "Casual & Everyday Collection",
  "Sports ": "Sports & Adventure Collection",
  "Aviation ": "Aviation & Travel Collection",
  "Luxury ": "Luxury & Heritage Collection"
};

// Database Connection
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, MONGODB_CONFIG);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

// Middleware Setup
const setupMiddleware = () => {
  app.use(cors(CORS_CONFIG));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(compression());
  app.use(express.static(path.join(__dirname, "../Client")));
};

// Utility Functions
const utils = {
  normalizeBrandName: (name) => {
    const lowerName = name.toLowerCase();
    return BRAND_MAPPINGS[lowerName] || 
           name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  },

  normalizeCollectionName: (name) => {
    const lowerName = name.toLowerCase();
    return COLLECTION_MAPPINGS[lowerName] || 
           name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  },

  sanitizeUserData: (user) => {
    const sanitized = user.toObject();
    delete sanitized.password;
    delete sanitized.phone_number;
    if (sanitized.Payment) {
      delete sanitized.Payment.cardNumber;
      delete sanitized.Payment.cvv;
    }
    return sanitized;
  }
};

// Route Handlers
const routeHandlers = {
  // Brand Routes
  async getAllBrands(req, res) {
    try {
      const brands = await Brand.find().sort({ name: 1 });
      res.json({ success: true, data: brands });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getBrandById(req, res) {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) {
        return res.status(404).json({ success: false, message: "Brand not found" });
      }
      res.json({ success: true, data: brand });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getBrandByName(req, res) {
    try {
      const rawName = decodeURIComponent(req.params.name);
      const normalizedBrandName = utils.normalizeBrandName(rawName);
      
      console.log(`Searching for brand: ${rawName} (normalized: ${normalizedBrandName})`);

      let brand = await Brand.findOne({ name: normalizedBrandName });

      if (!brand) {
        brand = await Brand.findOne({
          name: { $regex: new RegExp(`^${normalizedBrandName}$`, "i") }
        });
      }

      if (!brand) {
        const variations = [
          normalizedBrandName.replace(/&/g, "and"),
          normalizedBrandName.replace(/&/g, " and "),
          normalizedBrandName.replace(/ and /g, "&"),
          normalizedBrandName.replace(/\band\b/g, "&"),
          normalizedBrandName.replace(/\s+/g, "-"),
          normalizedBrandName.replace(/-/g, " "),
          normalizedBrandName.replace(/ö/g, "o"),
          normalizedBrandName.replace(/\./g, ""),
          normalizedBrandName.replace(/\./g, " "),
          normalizedBrandName.replace(/'/g, ""),
          normalizedBrandName.replace(/'/g, " "),
          normalizedBrandName.replace(/\s+/g, "-"),
          normalizedBrandName.replace(/ sohne/g, " & Söhne"),
          normalizedBrandName.replace(/Jacob /g, "Jacob & Co")
        ];

        for (const variation of variations) {
          brand = await Brand.findOne({
            name: { $regex: new RegExp(`^${variation}$`, "i") }
          });
          if (brand) break;
        }
      }

      if (!brand) {
        return res.status(404).json({ 
          success: false, 
          message: "Brand not found",
          attemptedName: normalizedBrandName
        });
      }

      res.json({ success: true, data: brand });
    } catch (err) {
      console.error("Error finding brand:", err);
      res.status(500).json({ 
        success: false, 
        message: "Server error",
        error: err.message 
      });
    }
  },

  // Collection Routes
  async getAllCollections(req, res) {
    try {
      const collections = await Collection.find().sort({ name: 1 });
      res.json({ success: true, data: collections });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getCollectionById(req, res) {
    try {
      const collection = await Collection.findById(req.params.id);
      if (!collection) {
        return res.status(404).json({ success: false, message: "Collection not found" });
      }
      res.json({ success: true, data: collection });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getCollectionByName(req, res) {
    try {
      const rawName = decodeURIComponent(req.params.name);
      const normalizedCollectionName = utils.normalizeCollectionName(rawName);
      
      console.log(`Searching for collection: ${rawName} (normalized: ${normalizedCollectionName})`);

      let collection = await Collection.findOne({ name: normalizedCollectionName });

      if (!collection) {
        collection = await Collection.findOne({
          name: { $regex: new RegExp(`^${normalizedCollectionName}$`, "i") }
        });
      }

      if (!collection) {
        return res.status(404).json({ 
          success: false, 
          message: "Collection not found",
          attemptedName: normalizedCollectionName
        });
      }

      res.json({ success: true, data: collection });
    } catch (err) {
      console.error("Error finding collection:", err);
      res.status(500).json({ 
        success: false, 
        message: "Server error",
        error: err.message 
      });
    }
  },

  // Product Routes
  async getProducts(req, res) {
    try {
      const {
        Vcollection,
        brand,
        strapMaterial,
        movement,
        waterResistance,
        caseMaterial,
        dialColor,
        minPrice,
        maxPrice,
        sort,
        inStock,
        gender,
      } = req.query;

      // Input validation
      if (minPrice && isNaN(minPrice)) return res.status(400).json({ error: "Invalid minPrice" });
      if (maxPrice && isNaN(maxPrice)) return res.status(400).json({ error: "Invalid maxPrice" });

      // Build query
      const query = {};
      if (gender && gender !== "All") query.gender = gender;
      if (Vcollection && Vcollection !== "All") query.Vcollection = Vcollection;
      if (brand && brand !== "All") query.brand = brand;
      if (strapMaterial && strapMaterial !== "All") query.strapMaterial = strapMaterial;
      if (movement && movement !== "All") query.movement = movement;
      if (waterResistance && waterResistance !== "All") query.waterResistance = waterResistance;
      if (caseMaterial && caseMaterial !== "All") query.caseMaterial = caseMaterial;
      if (dialColor && dialColor !== "All") query.dialColor = { $in: dialColor.split(",") };

      // Stock filter
      if (inStock === "true") {
        query.$or = [{ stock: true }, { stockCount: { $gt: 0 } }];
      }

      // Price range
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      // Sorting
      const sortOptions = {
        default: { _id: 1 },
        new: { createdAt: -1 },
        "price-asc": { price: 1 },
        "price-desc": { price: -1 },
        popularity: { popularityScore: -1, price: -1 },
      };

      const sortOption = sortOptions[sort] || sortOptions["default"];

      // Pagination
      const page = Number.parseInt(req.query.page) || 1;
      const limit = Number.parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [products, count] = await Promise.all([
        Product.find(query).sort(sortOption).skip(skip).limit(limit),
        Product.countDocuments(query),
      ]);

      res.json({
        success: true,
        count,
        page,
        pages: Math.ceil(count / limit),
        data: products,
      });
    } catch (err) {
      console.error("API Error:", err);
      res.status(500).json({
        success: false,
        error: "Server error",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  // User Routes
  async signup(req, res) {
    try {
      const { 
        Name, 
        username, 
        email, 
        password, 
        DOB, 
        phone_number, 
        language, 
        Address,
        Payment,
        role
      } = req.body;

      // Validation
      if (!Name || !username || !email || !password || !DOB || !phone_number || !language || !Address || !Payment) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Address validation
      const addressFields = ['city', 'street', 'addressType', 'state', 'country', 'postalCode'];
      for (const field of addressFields) {
        if (!Address[field]) {
          return res.status(400).json({ message: `Address field '${field}' is required` });
        }
      }

      // Payment validation
      const paymentFields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv', 'paymentType'];
      for (const field of paymentFields) {
        if (!Payment[field]) {
          return res.status(400).json({ message: `Payment field '${field}' is required` });
        }
      }

      // Additional validations
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }

      if (!validator.isMobilePhone(phone_number)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }

      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ email }, { username }, { phone_number }] });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email, username or phone number already exists' 
        });
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      const userRole = (role && role.toLowerCase() === 'admin') ? 'user' : (role || 'user');

      const newUser = new User({
        Name,
        username,
        email,
        password: hashedPassword,
        DOB: new Date(DOB),
        phone_number,
        language,
        role: userRole,
        Address: {
          city: Address.city,
          street: Address.street,
          addressType: Address.addressType,
          state: Address.state,
          country: Address.country,
          postalCode: Address.postalCode
        },
        Payment: {
          cardNumber: Payment.cardNumber,
          cardHolder: Payment.cardHolder,
          expiryDate: Payment.expiryDate,
          cvv: Payment.cvv,
          paymentType: Payment.paymentType
        }
      });

      const savedUser = await newUser.save();
      const sanitizedUser = utils.sanitizeUserData(savedUser);

      return res.status(201).json({
        message: 'User created successfully',
        user: sanitizedUser
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Signup error:', error);
      return res.status(500).json({ message: 'Server error during signup' });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await User.find({}, '-password -phone_number').lean();
      users.forEach(user => {
        if (user.Payment) {
          delete user.Payment.cardNumber;
          delete user.Payment.cvv;
        }
      });
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error while fetching users' });
    }
  }
};

// Route Setup
const setupRoutes = () => {
  // Brand routes
  const brandsRouter = express.Router();
  brandsRouter.get("/", routeHandlers.getAllBrands);
  brandsRouter.get("/:id", routeHandlers.getBrandById);
  brandsRouter.get("/name/:name", routeHandlers.getBrandByName);
  app.use("/api/brands", brandsRouter);

  // Collection routes
  const collectionsRouter = express.Router();
  collectionsRouter.get("/", routeHandlers.getAllCollections);
  collectionsRouter.get("/:id", routeHandlers.getCollectionById);
  collectionsRouter.get("/name/:name", routeHandlers.getCollectionByName);
  app.use("/api/collections", collectionsRouter);

  // Product routes
  app.get("/api/products", routeHandlers.getProducts);

  // User routes
  app.post('/api/signup', routeHandlers.signup);
  app.get('/api/users', routeHandlers.getAllUsers);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "OK",
      dbState: mongoose.connection.readyState,
      uptime: process.uptime(),
    });
  });

  // Page routes
  app.get(['/brands/:name', '/Ahmed/Shop All - Brands Page/Client/Brand-Page.html'], (req, res) => {
    const brandName = req.params.name || req.query.brand || 'Rolex';
    console.log(`Serving brand page for: ${brandName}`);
    res.sendFile(path.join(__dirname, "../Client/Ahmed/Shop All - Brands Page/Client/Brand-Page.html"));
  });
};

// Error Handling
const setupErrorHandling = () => {
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });
};

// Server Initialization
const initializeServer = async () => {
  try {
    await connectWithRetry();
    setupMiddleware();
    setupRoutes();
    setupErrorHandling();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed");
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
  }
};

// Start the server
initializeServer();