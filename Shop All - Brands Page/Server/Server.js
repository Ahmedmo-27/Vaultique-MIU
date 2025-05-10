require("dotenv").config();
const express = require("express");
const router = express.Router();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const Product = require("./productdb.js");
const Brand = require("./Brandsdb.js");
const Collection = require("./Collectionsdb.js");
const User = require('./Usersdb');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced MongoDB Connection with retry logic
const connectWithRetry = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, options)
    console.log("Connected to MongoDB")
  } catch (err) {
    console.error("MongoDB connection error:", err)
    console.log("Retrying connection in 5 seconds...")
    setTimeout(connectWithRetry, 5000)
  }
}

connectWithRetry()

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      // List of allowed origins
      const allowedOrigins = [
        "http://127.0.0.1:5507",
        "http://localhost:5507",
        "http://192.168.1.8:5507",
        process.env.FRONTEND_URL,
      ].filter(Boolean) // Remove any undefined values

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true)
      } else {
        console.log("CORS blocked origin:", origin)
        callback(null, true) // During development, allow all origins
        // In production, you might want to be more restrictive:
        // callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helmet());
app.use(compression());

// API Routes
const brandsRouter = express.Router();
const collectionsRouter = express.Router();

// Brand name normalization function
const normalizeBrandName = (name) => {
  const brandMappings = {
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

  // Convert to lowercase for case-insensitive comparison
  const lowerName = name.toLowerCase();
  
  // Return mapped name or original (with first letter capitalized)
  return brandMappings[lowerName] || 
         name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Get all brands
brandsRouter.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single brand by ID
brandsRouter.get("/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }
    res.json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Enhanced brand by name endpoint
brandsRouter.get("/name/:name", async (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.name);
    const normalizedBrandName = normalizeBrandName(rawName);
    
    console.log(`Searching for brand: ${rawName} (normalized: ${normalizedBrandName})`);

    // Try exact match first
    let brand = await Brand.findOne({ name: normalizedBrandName });

    // If not found, try case-insensitive regex match
    if (!brand) {
      brand = await Brand.findOne({
        name: { $regex: new RegExp(`^${normalizedBrandName}$`, "i") }
      });
    }

    // If still not found, try with common variations
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
      console.log(`Brand not found: ${normalizedBrandName}`);
      return res.status(404).json({ 
        success: false, 
        message: "Brand not found",
        attemptedName: normalizedBrandName
      });
    }

    console.log(`Found brand: ${brand.name}`);
    res.json({ success: true, data: brand });
  } catch (err) {
    console.error("Error finding brand:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: err.message 
    });
  }
});

// Collection name normalization function
const normalizeCollectionName = (name) => {
  const collectionMappings = {
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

  // Convert to lowercase for case-insensitive comparison
  const lowerName = name.toLowerCase();
  
  // Return mapped name or original (with first letter capitalized)
  return collectionMappings[lowerName] || 
         name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Get all collections
collectionsRouter.get("/", async (req, res) => {
  try {
    const collections = await Collection.find().sort({ name: 1 });
    res.json({ success: true, data: collections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single collection by ID
collectionsRouter.get("/:id", async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }
    res.json({ success: true, data: collection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Enhanced collection by name endpoint
collectionsRouter.get("/name/:name", async (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.name);
    const normalizedCollectionName = normalizeCollectionName(rawName);
    
    console.log(`Searching for collection: ${rawName} (normalized: ${normalizedCollectionName})`);

    // Try exact match first
    let collection = await Collection.findOne({ name: normalizedCollectionName });

    // If not found, try case-insensitive regex match
    if (!collection) {
      collection = await Collection.findOne({
        name: { $regex: new RegExp(`^${normalizedCollectionName}$`, "i") }
      });
    }

    if (!collection) {
      console.log(`Collection not found: ${normalizedCollectionName}`);
      return res.status(404).json({ 
        success: false, 
        message: "Collection not found",
        attemptedName: normalizedCollectionName
      });
    }

    console.log(`Found collection: ${collection.name}`);
    res.json({ success: true, data: collection });
  } catch (err) {
    console.error("Error finding collection:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: err.message 
    });
  }
});

// Use the routers
app.use("/api/brands", brandsRouter);
app.use("/api/collections", collectionsRouter);

// Products API endpoint
app.get("/api/products", async (req, res) => {
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
    } = req.query

    // Input validation
    if (minPrice && isNaN(minPrice)) return res.status(400).json({ error: "Invalid minPrice" })
    if (maxPrice && isNaN(maxPrice)) return res.status(400).json({ error: "Invalid maxPrice" })

    // Build query
    const query = {}
    if (gender && gender !== "All") query.gender = gender
    if (Vcollection && Vcollection !== "All") query.Vcollection = Vcollection
    if (brand && brand !== "All") query.brand = brand
    if (strapMaterial && strapMaterial !== "All") query.strapMaterial = strapMaterial
    if (movement && movement !== "All") query.movement = movement
    if (waterResistance && waterResistance !== "All") query.waterResistance = waterResistance
    if (caseMaterial && caseMaterial !== "All") query.caseMaterial = caseMaterial
    if (dialColor && dialColor !== "All") query.dialColor = { $in: dialColor.split(",") }

    // Stock filter
    if (inStock === "true") {
      query.$or = [{ stock: true }, { stockCount: { $gt: 0 } }]
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Sorting
    const sortOptions = {
      default: { _id: 1 },
      new: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      popularity: { popularityScore: -1, price: -1 },
    }

    const sortOption = sortOptions[sort] || sortOptions["default"]

    // Pagination
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [products, count] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(query),
    ])

    res.json({
      success: true,
      count,
      page,
      pages: Math.ceil(count / limit),
      data: products,
    })
  } catch (err) {
    console.error("API Error:", err)
    res.status(500).json({
      success: false,
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }
})

// Serve static files from the correct directory
app.use(express.static(path.join(__dirname, "../Client")));

app.get(['/brands/:name', '/Ahmed/Shop All - Brands Page/Client/Brand-Page.html'], (req, res) => {
  // Get brand name from either URL parameter or query string
  const brandName = req.params.name || req.query.brand || 'Rolex';
  
  console.log(`Serving brand page for: ${brandName}`);
  
  // Send the same Brand-Page.html file for both routes
  res.sendFile(path.join(__dirname, "../Client/Ahmed/Shop All - Brands Page/Client/Brand-Page.html"));
});

// Enhanced brand page handler
app.get("/brands/:name", (req, res) => {
  const brandName = decodeURIComponent(req.params.name);
  console.log(`Serving brand page for: ${brandName}`);
  res.sendFile(path.join(__dirname, "../Client/Brand-Page.html"));
});

// Alternative brand page URL pattern (with query parameter)
app.get("/Brand-Page.html", (req, res) => {
  const brandName = req.query.brand;
  if (brandName) {
    console.log(`Serving brand page for query parameter: ${brandName}`);
  }
  res.sendFile(path.join(__dirname, "../Client/Brand-Page.html"));
});

// Sign-up route
app.post('/api/signup', async (req, res) => {
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
          role // Optional, but only allow 'user' for security
      } = req.body;

      // Basic validation for top-level fields
      if (!Name || !username || !email || !password || !DOB || !phone_number || !language || !Address || !Payment) {
          return res.status(400).json({ message: 'All fields are required' });
      }

      // Validate Address fields
      const addressFields = ['city', 'street', 'addressType', 'state', 'country', 'postalCode'];
      for (const field of addressFields) {
          if (!Address[field]) {
              return res.status(400).json({ message: `Address field '${field}' is required` });
          }
      }

      // Validate Payment fields
      const paymentFields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv', 'paymentType'];
      for (const field of paymentFields) {
          if (!Payment[field]) {
              return res.status(400).json({ message: `Payment field '${field}' is required` });
          }
      }

      if (!validator.isEmail(email)) {
          return res.status(400).json({ message: 'Invalid email format' });
      }

      if (password.length < 8) {
          return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }

      if (!validator.isMobilePhone(phone_number)) {
          return res.status(400).json({ message: 'Invalid phone number format' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }, { phone_number }] });
      if (existingUser) {
          return res.status(400).json({ 
              message: 'User with this email, username or phone number already exists' 
          });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Only allow 'user' role to be set via signup
      const userRole = (role && role.toLowerCase() === 'admin') ? 'user' : (role || 'user');

      // Create new user with all fields
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

      // Save user to database (will trigger schema validation)
      const savedUser = await newUser.save();

      // Return response (without sensitive data)
      const userToReturn = savedUser.toObject();
      delete userToReturn.password;
      delete userToReturn.phone_number;
      if (userToReturn.Payment) {
          delete userToReturn.Payment.cardNumber;
          delete userToReturn.Payment.cvv;
      }

      return res.status(201).json({
          message: 'User created successfully',
          user: userToReturn
      });

  } catch (error) {
      // Mongoose validation errors
      if (error.name === 'ValidationError') {
          return res.status(400).json({ message: error.message });
      }
      console.error('Signup error:', error);
      return res.status(500).json({ message: 'Server error during signup' });
  }
});

// Get all users (excluding sensitive fields)
app.get('/api/users', async (req, res) => {
  try {
      // Exclude password and phone_number at the query level
      const users = await User.find({}, '-password -phone_number').lean();

      // Remove sensitive payment info from each user
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
});


// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find();
    res.json({ data: collections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get collection by ID
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json({ data: collection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get collection by name
router.get('/name/:name', async (req, res) => {
  try {
    const collection = await Collection.findOne({ name: req.params.name });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json({ data: collection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new collection
router.post('/', async (req, res) => {
  const collection = new Collection(req.body);
  try {
    const newCollection = await collection.save();
    res.status(201).json({ data: newCollection });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update collection
router.patch('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    Object.assign(collection, req.body);
    const updatedCollection = await collection.save();
    res.json({ data: updatedCollection });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete collection
router.delete('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    await collection.remove();
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    dbState: mongoose.connection.readyState,
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
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

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB at 127.0.0.1:27017");
});