const express = require('express');
const Collection = require('../models/Collections');
const router = express.Router();
const Product = require('../models/Products');
const Brand = require('../models/Brands');
const mongoose = require('mongoose');
const User = require('../models/Users');

// Collection name normalization mappings
const COLLECTION_MAPPINGS = {
  'classic & dress': 'Classic & Dress',
  'casual & everyday': 'Casual & Everyday',
  'sports & adventure': 'Sports & Adventure',
  'aviation & travel': 'Aviation & Travel',
  'luxury & heritage': 'Luxury & Heritage',
  classic: 'Classic & Dress',
  casual: 'Casual & Everyday',
  sports: 'Sports & Adventure',
  aviation: 'Aviation & Travel',
  luxury: 'Luxury & Heritage',
};

const collectionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Collection name normalization function
function normalizeCollectionName(name) {
  if (!name) return null;

  // Convert to lowercase and trim
  let normalized = name.toLowerCase().trim();

  // Replace common variations
  normalized = normalized
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .replace(/[ö]/g, 'o')
    .replace(/[.'']/g, '')
    .replace(/collection$/i, '')
    .trim();

  // Check mappings
  return COLLECTION_MAPPINGS[normalized] || normalized;
}

// Generate search variations for a collection name
function generateSearchVariations(name) {
  const variations = new Set([
    name,
    name.replace(/and/g, '&'),
    name.replace(/&/g, ' and '),
    name.replace(/\s+/g, '-'),
    name.replace(/-/g, ' '),
    name.replace(/collection$/i, '').trim(),
    name + ' Collection',
  ]);

  // Add mapped variations
  Object.entries(COLLECTION_MAPPINGS).forEach(([key, value]) => {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      variations.add(value);
    }
  });

  return Array.from(variations);
}

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find();
    res.json({
      success: true,
      data: collections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get collection by slug
router.get('/:slug', async (req, res) => {
  try {
    // Get all brands first
    const brands = await Brand.find().sort('name');
    
    const collection = await Collection.findOne({ slug: req.params.slug });
    if (!collection) {
      return res.status(404).render('error', { message: 'Collection not found' });
    }

    // Build filter object from query parameters
    const filters = {
      brand: req.query.brand || 'All',
      gender: req.query.gender || 'All',
      strapMaterial: req.query.strapMaterial || 'All',
      movement: req.query.movement || 'All',
      waterResistance: req.query.waterResistance || 'All',
      caseMaterial: req.query.caseMaterial || 'All',
      dialColor: req.query.dialColor || 'All',
      inStock: req.query.inStock === 'true',
      minPrice: req.query.minPrice || '',
      maxPrice: req.query.maxPrice || '',
      sort: req.query.sort || 'default'
    };

    // Build query object
    const query = { Vcollection: collection._id };

    // Add filters to query
    if (filters.brand !== 'All') {
      const brand = await Brand.findOne({ 
        name: { $regex: new RegExp(`^${filters.brand}$`, 'i') }
      });
      if (brand) {
        query.brand = brand._id;
      }
    }
    if (filters.gender !== 'All') query.gender = filters.gender;
    if (filters.strapMaterial !== 'All') query.strapMaterial = filters.strapMaterial;
    if (filters.movement !== 'All') query.movement = filters.movement;
    if (filters.waterResistance !== 'All') query.waterResistance = filters.waterResistance;
    if (filters.caseMaterial !== 'All') query.caseMaterial = filters.caseMaterial;
    if (filters.dialColor !== 'All') {
      query.dialColor = { $in: filters.dialColor.split(',') };
    }
    if (filters.inStock) {
      query.$or = [{ stock: true }, { stockCount: { $gt: 0 } }];
    }
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseInt(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseInt(filters.maxPrice);
    }

    // Get total products count for pagination
    const totalProducts = await Product.countDocuments(query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    // Sort options
    let sort = {};
    switch (filters.sort) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'new':
        sort = { createdAt: -1 };
        break;
      case 'popularity':
        sort = { popularityScore: -1 };
        break;
      default:
        sort = { createdAt: -1 }; // newest first
    }

    // Get products with pagination and sorting
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('brand', 'name logo')
      .lean();

    // Get all collections for filter
    const collections = await Collection.find().sort('name');

    // Add wishlist status to products if user is logged in
    let productsWithWishlist = products;
    if (req.user) {
      try {
        const user = await User.findById(req.user._id).select('wishlist');
        if (user && user.wishlist) {
          const wishlistItems = user.wishlist.map(item => item.product && item.product.toString());
          productsWithWishlist = products.map(product => ({
            ...product,
            inWishlist: wishlistItems.includes(product._id.toString())
          }));
        }
      } catch (error) {
        console.error('Error checking wishlist for products:', error);
        productsWithWishlist = products.map(product => ({
          ...product,
          inWishlist: false
        }));
      }
    } else {
      productsWithWishlist = products.map(product => ({
        ...product,
        inWishlist: false
      }));
    }

    // If it's an API request or format=json, return JSON
    if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        data: {
          collection,
          products: productsWithWishlist,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts,
            itemsPerPage: limit
          },
          filters,
          sort: filters.sort
        }
      });
    }

    res.render('Collection-Page', {
      title: `${collection.name} Collection`,
      collection,
      products: productsWithWishlist,
      brands,
      collections,
      filters,
      sort: filters.sort,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        itemsPerPage: limit
      },
      user: req.user || null
    });
  } catch (error) {
    console.error('Error in collection route:', error);
    res.status(500).render('error', { message: 'Error loading collection' });
  }
});

// Get single collection by ID
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.json({ success: true, data: collection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Enhanced collection by name endpoint
router.get('/name/:name', async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Input validation
    const rawName = decodeURIComponent(req.params.name);
    if (!rawName || typeof rawName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid collection name provided',
        requestId,
      });
    }

    // Check cache first
    const cacheKey = rawName.toLowerCase();
    const cachedResult = collectionCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      console.log(`[${requestId}] Cache hit for collection: ${rawName}`);
      return res.json({
        success: true,
        data: cachedResult.data,
        source: 'cache',
        requestId,
      });
    }

    // Normalize the collection name
    const normalizedCollectionName = normalizeCollectionName(rawName);
    console.log(
      `[${requestId}] Searching for collection: ${rawName} (normalized: ${normalizedCollectionName})`
    );

    // Generate search variations
    const searchVariations = generateSearchVariations(normalizedCollectionName);

    // Try exact match first
    let collection = await Collection.findOne({ name: normalizedCollectionName });

    // If not found, try case-insensitive regex match with variations
    if (!collection) {
      const searchQueries = searchVariations.map((variation) => ({
        name: { $regex: new RegExp(`^${variation}$`, 'i') },
      }));

      collection = await Collection.findOne({
        $or: searchQueries,
      });
    }

    if (!collection) {
      console.log(`[${requestId}] Collection not found: ${normalizedCollectionName}`);
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
        attemptedName: normalizedCollectionName,
        variations: searchVariations,
        requestId,
      });
    }

    // Cache the result
    collectionCache.set(cacheKey, {
      data: collection,
      timestamp: Date.now(),
    });

    // Log success with timing
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Found collection: ${collection.name} (${duration}ms)`);

    // Return success response
    res.json({
      success: true,
      data: collection,
      source: 'database',
      requestId,
      timing: {
        duration,
        cached: false,
      },
    });
  } catch (err) {
    // Enhanced error handling
    console.error(`[${requestId}] Error finding collection:`, err);

    const errorResponse = {
      success: false,
      message: 'Server error',
      requestId,
      timing: {
        duration: Date.now() - startTime,
      },
    };

    // Add error details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: err.message,
        stack: err.stack,
      };
    }

    res.status(500).json(errorResponse);
  }
});

module.exports = router;
