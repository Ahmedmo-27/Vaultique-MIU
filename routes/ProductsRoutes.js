const express = require('express');
const Product = require('../models/Products');
const path = require('path');
const router = express.Router();
const Brand = require('../models/Brands');
const Collection = require('../models/Collections');
const mongoose = require('mongoose');

// Product name normalization mappings
const PRODUCT_MAPPINGS = {
  automatic: 'Automatic',
  manual: 'Manual',
  quartz: 'Quartz',
  mechanical: 'Mechanical',
  chronograph: 'Chronograph',
  diver: 'Diver',
  pilot: 'Pilot',
  dress: 'Dress',
  sports: 'Sports',
  luxury: 'Luxury',
};

// Product name normalization function
function normalizeProductName(name) {
  if (!name) return null;

  // Convert to lowercase and trim
  let normalized = name.toLowerCase().trim();

  // Replace common variations
  normalized = normalized
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .replace(/[ö]/g, 'o')
    .replace(/[.'']/g, '')
    .replace(/watch$/i, '')
    .trim();

  // Check mappings
  return PRODUCT_MAPPINGS[normalized] || normalized;
}

// Generate search variations for a product name
function generateSearchVariations(name) {
  const variations = new Set([
    name,
    name.replace(/and/g, '&'),
    name.replace(/&/g, ' and '),
    name.replace(/\s+/g, '-'),
    name.replace(/-/g, ' '),
    name.replace(/watch$/i, '').trim(),
    name + ' Watch',
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
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit) || 10));
  return { page: parsedPage, limit: parsedLimit };
}

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Function to find brand by ID or name
const findBrandByIdOrName = async (brandIdentifier) => {
  try {
    // Try to find the brand by ID field first
    const brandDoc = await Brand.findOne({ _id: brandIdentifier });
    if (brandDoc) {
      return brandDoc._id;
    }

    // Try to find by name (case-insensitive)
    const brandByName = await Brand.findOne({
      name: { $regex: new RegExp(`^${brandIdentifier}$`, 'i') },
    });

    if (brandByName) {
      return brandByName._id;
    }

    console.log(`Brand not found: ${brandIdentifier}`);
    return null;
  } catch (err) {
    console.error(`Error finding brand:`, err);
    return null;
  }
};

// Get products by name - MUST BE BEFORE /:id ROUTE
router.get('/name/:name', async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const rawName = decodeURIComponent(req.params.name);
    if (!rawName || typeof rawName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product name provided',
        requestId,
      });
    }

    // Normalize the product name
    const normalizedProductName = normalizeProductName(rawName);
    console.log(
      `[${requestId}] Searching for product: ${rawName} (normalized: ${normalizedProductName})`
    );

    // Generate search variations
    const searchVariations = generateSearchVariations(normalizedProductName);

    // Try exact match first
    let product = await Product.findOne({ name: normalizedProductName });

    // If not found, try case-insensitive regex match with variations
    if (!product) {
      const searchQueries = searchVariations.map((variation) => ({
        name: { $regex: new RegExp(`^${variation}$`, 'i') },
      }));

      product = await Product.findOne({
        $or: searchQueries,
      });
    }

    if (!product) {
      console.log(`[${requestId}] Product not found: ${normalizedProductName}`);
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        attemptedName: normalizedProductName,
        variations: searchVariations,
        requestId,
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
        cached: false,
      },
    });
  } catch (err) {
    console.error(`[${requestId}] Error finding product:`, err);

    const errorResponse = {
      success: false,
      message: 'Server error',
      requestId,
      timing: {
        duration: Date.now() - startTime,
      },
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack,
      };
    }

    res.status(500).json(errorResponse);
  }
});

router.get('/', async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    console.log(`[${requestId}] API request received: ${JSON.stringify(req.query)}`);
    
    // Default values for all parameters
    const {
      page: rawPage = 1,
      limit: rawLimit = 10,
      sort = 'default',
      search,
      Vcollection = 'All',
      brand = 'All',
      strapMaterial = 'All',
      movement = 'All',
      waterResistance = 'All',
      caseMaterial = 'All',
      dialColor = 'All',
      minPrice,
      maxPrice,
      inStock = 'false',
      gender = 'All',
      format = 'html',
    } = req.query;

    // Validate pagination
    const { page, limit } = validatePaginationParams(rawPage, rawLimit);
    const skip = (page - 1) * limit;

    console.log(`[${requestId}] Building query with pagination: page=${page}, limit=${limit}, skip=${skip}`);

    // Build query object
    const query = {};

    // Collection filter
    if (Vcollection && Vcollection !== 'All') {
      query.Vcollection = Vcollection;
    }

    // Other filters
    if (brand && brand !== 'All') {
      const brandId = await findBrandByIdOrName(brand);
      if (brandId) {
        query.brand = brandId;
      } else {
        // If brand doesn't exist, use an impossible condition
        query.brand = new mongoose.Types.ObjectId(); // Will not match any products
      }
    }

    if (strapMaterial && strapMaterial !== 'All') query.strapMaterial = strapMaterial;
    if (movement && movement !== 'All') query.movement = movement;
    if (waterResistance && waterResistance !== 'All') query.waterResistance = waterResistance;
    if (caseMaterial && caseMaterial !== 'All') query.caseMaterial = caseMaterial;
    if (dialColor && dialColor !== 'All') query.dialColor = { $in: dialColor.split(',') };
    if (gender && gender !== 'All') query.gender = gender;

    // Stock filter
    if (inStock === 'true') {
      query.$or = [{ stock: true }, { stockCount: { $gt: 0 } }];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    console.log(`[${requestId}] Final query: ${JSON.stringify(query)}`);

    // Search functionality
    if (search) {
      const searchVariations = generateSearchVariations(normalizeProductName(search));
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { brand: { $regex: new RegExp(search, 'i') } },
      ];
    }

    // Sorting options
    const sortOptions = {
      default: { _id: 1 },
      new: { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      popularity: { popularityScore: -1, price: -1 },
    };
    const sortOption = sortOptions[sort] || sortOptions.default;

    console.log(`[${requestId}] Executing database queries`);
    
    // Get data with proper population
    try {
      const [products, total, allBrands, allCollections] = await Promise.all([
        Product.find(query).sort(sortOption).skip(skip).limit(limit).populate('brand', 'name logo'),
        Product.countDocuments(query),
        Brand.find().select('name logo'),
        Collection.find().select('name'),
      ]);

      console.log(
        `[${requestId}] Queries completed. Found ${products.length} products, total: ${total}`
      );

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      // Prepare response data
      const responseData = {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
        },
        filters: {
          available: {
            brands: allBrands,
            collections: allCollections,
          },
          current: {
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
            gender,
            sort,
          },
        },
      };

      // Always return JSON for /api/products
      res.setHeader('Content-Type', 'application/json');

      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Request completed successfully in ${duration}ms`);

      res.json({
        success: true,
        data: responseData,
        requestId,
        timing: {
          duration,
        },
      });
    } catch (dbError) {
      console.error(`[${requestId}] Database query error:`, dbError);
      throw dbError; // Re-throw to be caught by the main error handler
    }
  } catch (err) {
    console.error(`[${requestId}] Error fetching products:`, err);
    console.error(`[${requestId}] Error stack:`, err.stack);

    const errorResponse = {
      success: false,
      message: 'Server error',
      requestId,
      timing: {
        duration: Date.now() - startTime,
      },
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack,
      };
    }

    // Always return JSON for errors too
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json(errorResponse);
  }
});

// Get single product by ID - MUST BE AFTER /name/:name ROUTE
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Check if the id is a valid MongoDB ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        requestId,
      });
    }

    const product = await Product.findById(req.params.id).populate('brand');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        requestId,
      });
    }

    res.json({
      success: true,
      data: product,
      requestId,
      timing: {
        duration: Date.now() - startTime,
      },
    });
  } catch (err) {
    console.error(`[${requestId}] Error fetching product:`, err);

    const errorResponse = {
      success: false,
      message: 'Server error',
      requestId,
      timing: {
        duration: Date.now() - startTime,
      },
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack,
      };
    }

    res.status(500).json(errorResponse);
  }
});

// Create new product (API)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update product (API)
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Delete product (API)
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
