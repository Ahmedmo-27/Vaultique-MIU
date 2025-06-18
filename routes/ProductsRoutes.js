const express = require('express');
const Product = require('../models/Products');
const path = require('path');
const router = express.Router();
const Brand = require('../models/Brands');
const Collection = require('../models/Collections');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { body, query, param, validationResult } = require('express-validator');
const User = require('../models/Users');
const { buildFilterQuery, getSortOptions, getCurrentFilters } = require('../controllers/User');

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
      requestId: req.requestId
    });
  }
  next();
};

// Request ID middleware
const addRequestId = (req, res, next) => {
  req.requestId = Math.random().toString(36).substring(7);
  next();
};

// Timing middleware
const addTiming = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

// Apply common middleware
router.use(addRequestId);
router.use(addTiming);

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

// Input validation schemas
const productValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('Vcollection').notEmpty().withMessage('Collection is required'),
    validateRequest
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    validateRequest
  ],
  query: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('sort').optional().isIn(['default', 'new', 'price-asc', 'price-desc', 'popularity']).withMessage('Invalid sort option'),
    validateRequest
  ]
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
      return brandDoc.name;
    }

    // Try to find by name (case-insensitive)
    const brandByName = await Brand.findOne({
      name: { $regex: new RegExp(`^${brandIdentifier}$`, 'i') },
    });

    if (brandByName) {
      return brandByName.name;
    }

    console.log(`Brand not found: ${brandIdentifier}`);
    return null;
  } catch (err) {
    console.error(`Error finding brand:`, err);
    return null;
  }
};

// Function to find collection by slug or name
const findCollectionBySlugOrName = async (collectionIdentifier) => {
  try {
    // Try to find the collection by slug first
    const collectionBySlug = await Collection.findOne({ slug: collectionIdentifier });
    if (collectionBySlug) {
      return collectionBySlug.name;
    }

    // Try to find by name (case-insensitive)
    const collectionByName = await Collection.findOne({
      name: { $regex: new RegExp(`^${collectionIdentifier}$`, 'i') },
    });

    if (collectionByName) {
      return collectionByName.name;
    }

    console.log(`Collection not found: ${collectionIdentifier}`);
    return null;
  } catch (err) {
    console.error(`Error finding collection:`, err);
    return null;
  }
};

// Get products by name - MUST BE BEFORE /:id ROUTE
router.get('/name/:name', async (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.name);
    if (!rawName || typeof rawName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product name provided',
        requestId: req.requestId,
        timing: {
          duration: Date.now() - req.startTime
        }
      });
    }

    // Normalize the product name
    const normalizedProductName = normalizeProductName(rawName);
    console.log(
      `[${req.requestId}] Searching for product: ${rawName} (normalized: ${normalizedProductName})`
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
      console.log(`[${req.requestId}] Product not found: ${normalizedProductName}`);
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        attemptedName: normalizedProductName,
        variations: searchVariations,
        requestId: req.requestId,
        timing: {
          duration: Date.now() - req.startTime
        }
      });
    }

    // Log success with timing
    const duration = Date.now() - req.startTime;
    console.log(`[${req.requestId}] Found product: ${product.name} (${duration}ms)`);

    // Return success response
    res.json({
      success: true,
      data: product,
      source: 'database',
      requestId: req.requestId,
      timing: {
        duration,
        cached: false,
      },
    });
  } catch (err) {
    console.error(`[${req.requestId}] Error finding product:`, err);

    const errorResponse = {
      success: false,
      message: 'Server error',
      requestId: req.requestId,
      timing: {
        duration: Date.now() - req.startTime,
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

// Get all products with filters
router.get(['/', '/api/products'], productValidation.query, async (req, res) => {
  try {
    console.log(`[${req.requestId}] API request received: ${JSON.stringify(req.query)}`);
    
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

    // Build query object
    const query = {};

    // Enhanced search: if search matches a collection name or slug, filter by that collection only
    const collectionsList = await Collection.find().lean();
    let matchedCollection = null;
    if (search) {
      matchedCollection = collectionsList.find(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (matchedCollection) {
      // If search matches a collection, filter by that collection only
      query.Vcollection = matchedCollection.name;
    } else if (search) {
      // Otherwise, do the normal search
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Collection filter
    if (Vcollection && Vcollection !== 'All') {
      const collectionName = await findCollectionBySlugOrName(Vcollection);
      if (collectionName) {
        query.Vcollection = collectionName;
      }
    }

    // Brand filter
    if (brand && brand !== 'All') {
      const brandName = await findBrandByIdOrName(brand);
      if (brandName) {
        query.brand = brandName;
      }
    }

    // Other filters
    if (strapMaterial && strapMaterial !== 'All') query.strapMaterial = strapMaterial;
    if (movement && movement !== 'All') query.movement = movement;
    if (waterResistance && waterResistance !== 'All') query.waterResistance = waterResistance;
    if (caseMaterial && caseMaterial !== 'All') query.caseMaterial = caseMaterial;
    if (dialColor && dialColor !== 'All') query.dialColor = { $in: dialColor.split(',') };
    if (gender && gender !== 'All') query.gender = gender;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.$or = [{ stock: true }, { stockCount: { $gt: 0 } }];
    }

    // Sort options
    let sortQuery = {};
    switch (sort) {
      case 'price-asc':
        sortQuery = { price: 1 };
        break;
      case 'price-desc':
        sortQuery = { price: -1 };
        break;
      case 'new':
        sortQuery = { createdAt: -1 };
        break;
      case 'popularity':
        sortQuery = { popularityScore: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    // Get products with pagination and sorting
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get all brands and collections for filters
    const [brands, collections] = await Promise.all([
      Brand.find().lean(),
      Collection.find().lean()
    ]);

    // Replace brand ID with brand name in each product (after brands are fetched)
    const brandMap = brands.reduce((acc, b) => {
      acc[b._id] = b.name;
      acc[b.name] = b.name;
      return acc;
    }, {});
    products.forEach(product => {
      if (product.brand && brandMap[product.brand]) {
        product.brand = brandMap[product.brand];
      }
    });

    // Prepare response data
    const responseData = {
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalProducts,
          itemsPerPage: limit,
        },
        filters: {
          Vcollection,
          brand,
          gender,
          strapMaterial,
          movement,
          waterResistance,
          caseMaterial,
          dialColor,
          minPrice,
          maxPrice,
          inStock,
        },
        sort,
      },
    };

    // Send response based on format and route
    if (req.path === '/api/products' || format === 'json') {
      res.json(responseData);
    } else {
      res.render('products', {
        title: 'Shop All',
        products,
        pagination: responseData.data.pagination,
        filters: responseData.data.filters,
        sort,
        collections,
        brands,
        user: req.user || null
      });
    }
  } catch (error) {
    console.error('Error in products route:', error);
    if (req.path === '/api/products' || format === 'json') {
      res.status(500).json({
        success: false,
        message: 'Error loading products',
        error: error.message
      });
    } else {
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading products. Please try again later.'
      });
    }
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
router.post('/', productValidation.create, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product,
      requestId: req.requestId,
      timing: {
        duration: Date.now() - req.startTime
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      requestId: req.requestId,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timing: {
        duration: Date.now() - req.startTime
      }
    });
  }
});

// Update product (API)
router.put('/:id', productValidation.update, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        requestId: req.requestId,
        timing: {
          duration: Date.now() - req.startTime
        }
      });
    }

    res.json({
      success: true,
      data: product,
      requestId: req.requestId,
      timing: {
        duration: Date.now() - req.startTime
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      requestId: req.requestId,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timing: {
        duration: Date.now() - req.startTime
      }
    });
  }
});

// Delete product (API)
router.delete('/:id', param('id').isMongoId().withMessage('Invalid product ID'), validateRequest, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        requestId: req.requestId,
        timing: {
          duration: Date.now() - req.startTime
        }
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      requestId: req.requestId,
      timing: {
        duration: Date.now() - req.startTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      requestId: req.requestId,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timing: {
        duration: Date.now() - req.startTime
      }
    });
  }
});

module.exports = router;
