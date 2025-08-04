const express = require('express');
const Brand = require('../models/Brands');
const Product = require('../models/Products');
const Collection = require('../models/Collections');
const User = require('../models/Users');
const router = express.Router();

const normalizeBrandName = (name) => {
  const brandMappings = {
    rolex: 'Rolex',
    omega: 'Omega',
    cartier: 'Cartier',
    'patek-philippe': 'Patek Philippe',
    patek: 'Patek Philippe',
    'audemars-piguet': 'Audemars Piguet',
    ap: 'Audemars Piguet',
    'a-lange-sohne': 'A.Lange & Söhne',
    lange: 'A.Lange & Söhne',
    'A.lange ': 'A.Lange & Söhne',
    'vacheron-constantin': 'Vacheron Constantin',
    vc: 'Vacheron Constantin',
    'jacob-co': 'Jacob & Co',
    'Jacob ': 'Jacob & Co',
    'richard-mille': 'Richard Mille',
    rm: 'Richard Mille',
    breitling: 'Breitling',
  };

  const lowerName = name.toLowerCase();
  return brandMappings[lowerName] || name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get brand by name (API endpoint) - must come before /:brandSlug route
router.get('/name/:name', async (req, res) => {
  try {
    const rawName = decodeURIComponent(req.params.name);
    const normalizedBrandName = normalizeBrandName(rawName);
    console.log(`Searching for brand: ${rawName} (normalized: ${normalizedBrandName})`);

    let brand = await Brand.findOne({ name: normalizedBrandName });

    if (!brand) {
      brand = await Brand.findOne({
        name: { $regex: new RegExp(`^${normalizedBrandName}$`, 'i') },
      });
    }

    if (!brand) {
      const variations = [
        normalizedBrandName.replace(/&/g, 'and'),
        normalizedBrandName.replace(/&/g, ' and '),
        normalizedBrandName.replace(/ and /g, '&'),
        normalizedBrandName.replace(/\band\b/g, '&'),
        normalizedBrandName.replace(/\s+/g, '-'),
        normalizedBrandName.replace(/-/g, ' '),
        normalizedBrandName.replace(/ö/g, 'o'),
        normalizedBrandName.replace(/\./g, ''),
        normalizedBrandName.replace(/'/g, ''),
        normalizedBrandName.replace(/ sohne/g, ' & Söhne'),
        normalizedBrandName.replace(/Jacob /g, 'Jacob & Co'),
      ];

      for (const variation of variations) {
        brand = await Brand.findOne({
          name: { $regex: new RegExp(`^${variation}$`, 'i') },
        });
        if (brand) break;
      }
    }

    if (!brand) {
      console.log(`Brand not found: ${normalizedBrandName}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Brand not found', 
        attemptedName: normalizedBrandName 
      });
    }

    console.log(`Found brand: ${brand.name}`);
    res.json({ success: true, data: brand });
  } catch (err) {
    console.error('Error finding brand:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get brand by slug and render brand page - must come before /:id route
router.get('/:brandSlug', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const brandSlug = req.params.brandSlug;
    console.log(`Searching for brand with slug: ${brandSlug}`);

    let brand = await Brand.findOne({ slug: brandSlug });

    if (!brand) {
      console.log(`Brand not found with slug: ${brandSlug}`);
      return res.status(404).render('error', {
        title: 'Brand Not Found',
        message: 'The requested brand does not exist.',
        type: 'error',
        show: true
      });
    }

    // Build filter query
    const filterQuery = { brand: brand._id };
    
    // Apply other filters if present
    if (req.query.Vcollection && req.query.Vcollection !== 'All') {
      filterQuery.Vcollection = req.query.Vcollection;
    }
    if (req.query.gender && req.query.gender !== 'All') {
      filterQuery.gender = req.query.gender;
    }
    if (req.query.strapMaterial && req.query.strapMaterial !== 'All') {
      filterQuery.strapMaterial = req.query.strapMaterial;
    }
    if (req.query.movement && req.query.movement !== 'All') {
      filterQuery.movement = req.query.movement;
    }
    if (req.query.waterResistance && req.query.waterResistance !== 'All') {
      filterQuery.waterResistance = req.query.waterResistance;
    }
    if (req.query.caseMaterial && req.query.caseMaterial !== 'All') {
      filterQuery.caseMaterial = req.query.caseMaterial;
    }
    if (req.query.dialColor && req.query.dialColor !== 'All') {
      filterQuery.dialColor = req.query.dialColor;
    }

    // Price range
    if (req.query.minPrice) {
      filterQuery.price = { ...filterQuery.price, $gte: parseFloat(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      filterQuery.price = { ...filterQuery.price, $lte: parseFloat(req.query.maxPrice) };
    }

    // Stock filter
    if (req.query.inStock === 'true') {
      filterQuery.stock = true;
    }

    // Sort options
    let sortQuery = {};
    const sort = req.query.sort || 'default';
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

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products with pagination and sorting
    const products = await Product.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate('Vcollection')
      .lean();

    // Get all collections for filters
    const collections = await Collection.find().lean();

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

    // Prepare current filters
    const currentFilters = {
      Vcollection: req.query.Vcollection || 'All',
      gender: req.query.gender || 'All',
      strapMaterial: req.query.strapMaterial || 'All',
      movement: req.query.movement || 'All',
      waterResistance: req.query.waterResistance || 'All',
      caseMaterial: req.query.caseMaterial || 'All',
      dialColor: req.query.dialColor || 'All',
      minPrice: req.query.minPrice || '0',
      maxPrice: req.query.maxPrice || '500000',
      inStock: req.query.inStock || 'false'
    };

    // If it's an API request or format=json, return JSON
    if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        data: {
          brand,
          products: productsWithWishlist,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts,
            itemsPerPage: limit
          },
          filters: currentFilters,
          sort
        }
      });
    }

    res.render('Brand-Page', {
      title: brand.name,
      brand,
      products: productsWithWishlist,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        itemsPerPage: limit
      },
      filters: currentFilters,
      collections,
      sort
    });

  } catch (error) {
    console.error('Error in brand page route:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while loading the brand page.',
      type: 'error',
      show: true
    });
  }
});

// Get brand by ID
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
