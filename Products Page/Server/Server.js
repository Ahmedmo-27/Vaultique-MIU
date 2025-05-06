require("dotenv").config();
const express = require("express");
const router = express.Router();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const Product = require("./productdb.js");
const Brand = require("./Brandsdb.js");

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
        "http://127.0.0.1:5506",
        "http://localhost:5506",
        "http://192.168.1.8:5506",
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

// API Routes
const brandsRouter = express.Router();

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
        normalizedBrandName.replace(/’/g, "'"),
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
      // For A.Lange & Söhne specifically
      if (normalizedBrandName.includes('Lange')) {
        const variations = [
          'A.Lange & Söhne',
          'A.Lange and Söhne',
          'A.Lange & Sohne',
          'A Lange & Söhne'
        ];
        
        for (const variation of variations) {
          brand = await Brand.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(variation)}$`, "i") }
          });
          if (brand) {
            console.log(`Found match with variation: ${variation}`);
            break;
          }
        }
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

// Use the brands router
app.use("/api/brands", brandsRouter);

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

app.get(['/brands/:name', '/Ahmed/Products Page/Client/Brand-Page.html'], (req, res) => {
  // Get brand name from either URL parameter or query string
  const brandName = req.params.name || req.query.brand || 'Rolex';
  
  console.log(`Serving brand page for: ${brandName}`);
  
  // Send the same Brand-Page.html file for both routes
  res.sendFile(path.join(__dirname, "../Client/Ahmed/Products Page/Client/Brand-Page.html"));
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    dbState: mongoose.connection.readyState,
    uptime: process.uptime(),
  });
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