const express = require("express")
const Product = require("../models/Products")
const path = require("path");
const router = express.Router();
const Brand = require('../models/Brands');
const Collection = require('../models/Collections');
const mongoose = require('mongoose');

// Product name normalization mappings
const PRODUCT_MAPPINGS = {
  "automatic": "Automatic",
  "manual": "Manual",
  "quartz": "Quartz",
  "mechanical": "Mechanical",
  "chronograph": "Chronograph",
  "diver": "Diver",
  "pilot": "Pilot",
  "dress": "Dress",
  "sports": "Sports",
  "luxury": "Luxury"
};

// Product name normalization function
function normalizeProductName(name) {
  if (!name) return null;
  
  // Convert to lowercase and trim
  let normalized = name.toLowerCase().trim();
  
  // Replace common variations
  normalized = normalized
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .replace(/[ö]/g, "o")
    .replace(/[.'']/g, "")
    .replace(/watch$/i, "")
    .trim();

  // Check mappings
  return PRODUCT_MAPPINGS[normalized] || normalized;
}

// Generate search variations for a product name
function generateSearchVariations(name) {
  const variations = new Set([
    name,
    name.replace(/and/g, "&"),
    name.replace(/&/g, " and "),
    name.replace(/\s+/g, "-"),
    name.replace(/-/g, " "),
    name.replace(/watch$/i, "").trim(),
    name + " Watch"
  ]);

  // Add mapped variations
  Object.entries(PRODUCT_MAPPINGS).forEach(([key, value]) => {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      variations.add(value);
    }
  });

  return Array.from(variations);
}

// Helper function for pagination
function validatePaginationParams(page, limit) {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit) || 12));
  return { page: parsedPage, limit: parsedLimit };
}

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Get products by name - MUST BE BEFORE /:id ROUTE
router.get("/name/:name", async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const rawName = decodeURIComponent(req.params.name);
    if (!rawName || typeof rawName !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Invalid product name provided",
        requestId
      });
    }

    // Normalize the product name
    const normalizedProductName = normalizeProductName(rawName);
    console.log(`[${requestId}] Searching for product: ${rawName} (normalized: ${normalizedProductName})`);

    // Generate search variations
    const searchVariations = generateSearchVariations(normalizedProductName);
    
    // Try exact match first
    let product = await Product.findOne({ name: normalizedProductName });

    // If not found, try case-insensitive regex match with variations
    if (!product) {
      const searchQueries = searchVariations.map(variation => ({
        name: { $regex: new RegExp(`^${variation}$`, "i") }
      }));

      product = await Product.findOne({
        $or: searchQueries
      });
    }

    if (!product) {
      console.log(`[${requestId}] Product not found: ${normalizedProductName}`);
      return res.status(404).json({
        success: false,
        message: "Product not found",
        attemptedName: normalizedProductName,
        variations: searchVariations,
        requestId
      });
    }

    // Log success with timing
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Found product: ${product.name} (${duration}ms)`);

    // Return success response
    res.json({
      success: true,
      data: product,
      source: 'database',
      requestId,
      timing: {
        duration,
        cached: false
      }
    });

  } catch (err) {
    console.error(`[${requestId}] Error finding product:`, err);
    
    const errorResponse = {
      success: false,
      message: "Server error",
      requestId,
      timing: {
        duration: Date.now() - startTime
      }
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack
      };
    }

    res.status(500).json(errorResponse);
  }
});

// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const {
      page: rawPage,
      limit: rawLimit,
      sort = "default",
      search,
      Vcollection,
      brand,
      strapMaterial,
      movement,
      waterResistance,
      caseMaterial,
      dialColor,
      minPrice,
      maxPrice,
      inStock,
      gender
    } = req.query;

    // Validate and parse pagination parameters
    const { page, limit } = validatePaginationParams(rawPage, rawLimit);

    // Build query
    const query = {};

    // Collection filter
    if (Vcollection && Vcollection !== "All") {
      query.Vcollection = Vcollection;
    }

    // Other filters
    if (brand && brand !== "All") query.brand = brand;
    if (strapMaterial && strapMaterial !== "All") query.strapMaterial = strapMaterial;
    if (movement && movement !== "All") query.movement = movement;
    if (waterResistance && waterResistance !== "All") query.waterResistance = waterResistance;
    if (caseMaterial && caseMaterial !== "All") query.caseMaterial = caseMaterial;
    if (dialColor && dialColor !== "All") query.dialColor = { $in: dialColor.split(",") };
    if (gender && gender !== "All") query.gender = gender;

    // Stock filter
    if (inStock === "true") {
      query.$or = [
        { stock: true },
        { stockCount: { $gt: 0 } }
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search functionality
    if (search) {
      const searchVariations = generateSearchVariations(normalizeProductName(search));
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { brand: { $regex: new RegExp(search, "i") } }
      ];
    }

    // Sorting options
    const sortOptions = {
      default: { _id: 1 },
      new: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      popularity: { popularityScore: -1, price: -1 }
    };

    const sortOption = sortOptions[sort] || sortOptions.default;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get all brands and collections for filters and navigation
    const allBrands = await Brand.find();
    const allCollections = await Collection.find();

    res.render('Products', {
      products,
      currentPage: page,
      totalPages,
      brands: allBrands,
      collections: allCollections,
      filters: {
        minPrice,
        maxPrice,
        selectedBrands: brand ? [brand] : [],
        selectedCollections: Vcollection ? [Vcollection] : []
      }
    });

  } catch (err) {
    console.error(`[${requestId}] Error fetching products:`, err);
    
    const errorResponse = {
      success: false,
      message: "Server error",
      requestId,
      timing: {
        duration: Date.now() - startTime
      }
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack
      };
    }

    res.status(500).json(errorResponse);
  }
});

// Get single product by ID - MUST BE AFTER /name/:name ROUTE
router.get("/:id", async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Check if the id is a valid MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      // If not a valid ObjectId, treat it as a route name and render the products page
      const [products, total] = await Promise.all([
        Product.find().limit(12),
        Product.countDocuments()
      ]);

      const totalPages = Math.ceil(total / 12);
      const allBrands = await Brand.find();
      const allCollections = await Collection.find();

      return res.render('Products', {
        products,
        currentPage: 1,
        totalPages,
        brands: allBrands,
        collections: allCollections,
        filters: {
          minPrice: null,
          maxPrice: null,
          selectedBrands: [],
          selectedCollections: []
        }
      });
    }

    const product = await Product.findById(req.params.id)
      .populate('brand')
      .populate('collection');
    
    if (!product) {
      return res.status(404).render('404');
    }

    res.json({
      success: true,
      data: product,
      requestId,
      timing: {
        duration: Date.now() - startTime
      }
    });

  } catch (err) {
    console.error(`[${requestId}] Error fetching product:`, err);
    
    const errorResponse = {
      success: false,
      message: "Server error",
      requestId,
      timing: {
        duration: Date.now() - startTime
      }
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack
      };
    }

    res.status(500).json(errorResponse);
  }
});

// Products API endpoint
router.get("/api/products", async (req, res) => {
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
      page: rawPage,
      limit: rawLimit
    } = req.query

    // Input validation
    if (minPrice && isNaN(minPrice)) return res.status(400).json({ error: "Invalid minPrice" })
    if (maxPrice && isNaN(maxPrice)) return res.status(400).json({ error: "Invalid maxPrice" })

    // Validate and parse pagination parameters
    const { page, limit } = validatePaginationParams(rawPage, rawLimit);

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

    // Calculate pagination
    const skip = (page - 1) * limit

    const [products, count] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(query),
    ])

    const totalPages = Math.ceil(count / limit)

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
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

// // Serve static files from the correct directory
// router.use(express.static(path.join(__dirname, "../Client")));

module.exports = router