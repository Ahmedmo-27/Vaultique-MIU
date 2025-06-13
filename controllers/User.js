const express = require('express');
const router = express.Router();
const Product = require('../models/Products');
const Brand = require('../models/Brands');
const Collection = require('../models/Collections');
const User = require('../models/Users');
const Order = require('../models/Orders');
const { authenticateJWT } = require('../middleware/jwt');
const Cart = require('../models/cart');
const { generateOrderNumber } = require('../utils/orderUtils');

// Helper function to render notification
const renderNotification = (res, type, message, title = 'Notification') => {
  res.render('error', {
    title,
    type,
    message,
    show: true,
  });
};

//Collections Page
router.get('/Collections', async (req, res) => {
    try {
        // Get all collections
        const allCollections = await Collection.find();
        
        // Define the desired order
        const desiredOrder = [
            "Classic & Dress",
            "Casual & Everyday",
            "Sports & Adventure",
            "Aviation & Travel",
            "Luxury & Heritage"
        ];
        
        // Sort collections according to the desired order
        const collections = allCollections.sort((a, b) => {
            return desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name);
        });
        
        res.render('Collections-Page', { collections });
    } catch(error) {
        res.render('Error Loading Collections Page', error);
        renderNotification(res, 'error', 'Failed to load Collections Page. Please try again later.');
    }
})



// Brands Page Route with Custom Order
router.get('/Brands', async (req, res) => {
    try {
        // Define the exact brand order you want
        const brandOrder = [
            "Rolex", 
            "Omega",
            "Cartier",
            "Patek Philippe",
            "Audemars Piguet",
            "A.Lange & Söhne",
            "Vacheron Constantin",
            "Jacob & Co",
            "Richard Mille",
            "Breitling"
        ];
        
        // Fetch all brands from database
        const brands = await Brand.find();
        
        // Sort brands according to the custom order
        const sortedBrands = brandOrder
            .map(name => brands.find(brand => brand.name === name))
            .filter(brand => brand !== undefined); // Remove any undefined if brand not found
        
        // Render the Brands-Page template with the sorted brands
        res.render('Brands-Page', { 
            brands: sortedBrands
        });
    } catch (error) {
        console.error('Error loading Brands Page:', error);
        res.status(500).render('error', {
            message: 'Failed to load Brands Page. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Brand Detail Page Route
router.get('/brands/:brandSlug', async (req, res) => {
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

        // Get sort option
        const sort = req.query.sort || 'default';
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

        // Get products with pagination
        const products = await Product.find(filterQuery)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filterQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        // Get all collections for filter
        const collections = await Collection.find().sort('name');

        // Get wishlist status for each product if user is logged in
        let productsWithWishlist = products;
        if (req.user) {
            const user = await User.findById(req.user._id).populate('wishlist');
            productsWithWishlist = products.map(product => ({
                ...product.toObject(),
                inWishlist: user.wishlist.some(item => item._id.toString() === product._id.toString())
            }));
        }

        // Current filters for maintaining state
        const currentFilters = {
            Vcollection: req.query.Vcollection || 'All',
            gender: req.query.gender || 'All',
            strapMaterial: req.query.strapMaterial || 'All',
            movement: req.query.movement || 'All',
            waterResistance: req.query.waterResistance || 'All',
            caseMaterial: req.query.caseMaterial || 'All',
            dialColor: req.query.dialColor || 'All',
            minPrice: req.query.minPrice || '0',
            maxPrice: req.query.maxPrice || '50000000',
            inStock: req.query.inStock || 'false'
        };

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
            sort,
            collections,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading brand page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while loading the brand page.',
            type: 'error',
            show: true
        });
    }
});


async function handleUserQuestion(userQuestion) {
  // 1. First check if it's a product-related question
  if (!isProductQuestion(userQuestion)) {
    return "I specialize in our product information. Please ask about our products, features, or pricing!";
  }

  // 2. Only process if it's product-related
  try {
    const products = await searchProductsInDatabase(userQuestion);
    
    if (products.length > 0) {
      return formatProductResponse(products);
    } else {
      return "I couldn't find matching products. Could you ask differently? For example: 'Show me wireless headphones under $100'";
    }
  } catch (error) {
    console.error("Database error:", error);
    return "Our product catalog is currently unavailable. Please try again later.";
  }
}

// Helper Functions
function isProductQuestion(question) {
  const productKeywords = [
    'product', 'products', 'item', 'items', 'buy', 'purchase',
    'price', 'cost', 'feature', 'features', 'spec', 'specs',
    'model', 'stock', 'availability', 'watch', 'watches','brand',
    'brands','collections','collection','strap','straps','movement','water',
    'resistance','case','material','dial','color','rolex','cartier','omega',
    'patek phileppe','audemars piguet','vacheron constantin','jacob & co',
    'richard mille','breitling','classic & dress','casual & everyday','sports & adventure',
    'aviation & travel','luxury & heritage','strap material','movement type','water resistance',
    'case material','dial color'
  ];

  const questionLower = question.toLowerCase();
  return productKeywords.some(keyword => questionLower.includes(keyword));
}

async function searchProductsInDatabase(searchQuery) {
  // Your NoSQL database query implementation
  // Example for MongoDB:
  const client = await MongoClient.connect(process.env.MONGO_URI);
  const collection = client.db("store").collection("products");
  
  const results = await collection.find({
    $text: { $search: extractSearchTerms(searchQuery) }
  }).limit(5).toArray();
  
  await client.close();
  return results;
}

function formatProductResponse(products) {
  if (products.length === 1) {
    const p = products[0];
    return `We have this product:\n\n` +
           `**${p.name}** ($${p.price})\n` +
           `${p.description}\n` +
           `Features: ${p.features.join(', ')}`;
  } else {
    let response = "I found these products:\n\n";
    products.forEach(p => {
      response += `• **${p.name}** - $${p.price}\n` +
                 `  ${p.features.slice(0, 3).join(', ')}\n\n`;
    });
    return response;
  }
}

function extractSearchTerms(query) {
  // Remove common question words
  const stopWords = new Set(['what','where','how','when','why','do','you','have','any']);
  return query.toLowerCase().split(' ')
    .filter(term => term.length > 2 && !stopWords.has(term))
    .join(' ');
}

// Configurator Page
router.get('/Configurator', async (req, res) => {
  try {
    const configuratorController = require('./Configurator');
    await configuratorController.renderConfigurator(req, res);
  } catch (error) {
    console.error('Error loading configurator page:', error);
    renderNotification(res, 'error', 'Failed to load Configurator Page. Please try again later.');
  }
});

router.get('/Recommendation-System', async (req, res) => {
  try {
    res.render('Recommendation', {
      title: 'Vaultique | Recommendation System',
    });
  } catch (error) {
    console.error('Error loading recommendation system page:', error);
    renderNotification(res, 'error', 'Failed to load recommendation system page. Please try again later.');
  }
});

// Public routes (no auth required)

// Login/Signup page
router.get('/LoginSignup', (req, res) => {
  // If user is already logged in, redirect to account details
  if (req.user) {
    return res.redirect('/user/account-details');
  }
  res.render('LoginSignup', {
    title: 'Login/Signup',
    user: req.user
  });
});

// Home page
router.get('/home', async (req, res) => {
  try {
    // If user is logged in, we'll have req.user from the optional auth middleware
    res.render('Home-Page', {
      title: 'Vaultique | Home',
      user: req.user || null,
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    renderNotification(res, 'error', 'Failed to load home page. Please try again later.');
  }
});

// Products page
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery = {};
    
    // Collection filter
    if (req.query.Vcollection && req.query.Vcollection !== 'All') {
      filterQuery.Vcollection = req.query.Vcollection;
    }

    // Brand filter
    if (req.query.brand && req.query.brand !== 'All') {
      const brand = await Brand.findOne({ name: req.query.brand });
      if (brand) {
        filterQuery.brand = brand._id;
      }
    }

    // Other filters
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

    // Get products with pagination
    const [products, totalProducts, brands, collections] = await Promise.all([
      Product.find(filterQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate('brand')
        .populate('Vcollection'),
      Product.countDocuments(filterQuery),
      Brand.find(),
      Collection.find()
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Add wishlist status to products
    let productsWithWishlist = products;
    if (req.user) {
      try {
        const user = await User.findById(req.user._id).select('wishlist');
        if (user && user.wishlist) {
          const wishlistItems = user.wishlist.map(item => item.product && item.product.toString());
          productsWithWishlist = products.map(product => ({
            ...product.toObject(),
            inWishlist: wishlistItems.includes(product._id.toString())
          }));
        }
      } catch (error) {
        console.error('Error checking wishlist for products:', error);
        productsWithWishlist = products.map(product => ({
          ...product.toObject(),
          inWishlist: false
        }));
      }
    } else {
      productsWithWishlist = products.map(product => ({
        ...product.toObject(),
        inWishlist: false
      }));
    }

    // Prepare current filters
    const currentFilters = {
      Vcollection: req.query.Vcollection || 'All',
      brand: req.query.brand || 'All',
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

    res.render('products', {
      title: 'Shop All',
      products: productsWithWishlist,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
      },
      filters: currentFilters,
      sort: sort,
      user: req.user || null,
      collections: collections,
      brands: brands
    });
  } catch (error) {
    console.error('Error loading products:', error);
    renderNotification(res, 'error', 'Failed to load products. Please try again later.');
  }
});

// Collection-specific products page
router.get('/collections/:collectionSlug', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all brands first
    const brands = await Brand.find().sort('name');

    const collection = await Collection.findOne({ slug: req.params.collectionSlug });
    if (!collection) {
      return res.status(404).render('404', {
        title: 'Collection Not Found',
        message: 'The requested collection does not exist.',
      });
    }

    // Build filter query
    const filterQuery = { Vcollection: collection.name };
    
    // Apply brand filter if present
    if (req.query.brand && req.query.brand !== 'All') {
      const brand = await Brand.findOne({ 
        name: { $regex: new RegExp(`^${req.query.brand}$`, 'i') }
      });
      if (brand) {
        filterQuery.brand = brand.name;
      }
    }

    // Apply other filters if present
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
      // Handle multiple dial colors
      const colors = Array.isArray(req.query.dialColor) ? req.query.dialColor : [req.query.dialColor];
      filterQuery.dialColor = { $in: colors };
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
      filterQuery.$or = [{ stock: true }, { stockCount: { $gt: 0 } }];
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
      case 'name-asc':
        sortQuery = { name: 1 };
        break;
      case 'name-desc':
        sortQuery = { name: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 }; // newest first
    }

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products with pagination and sorting
    const products = await Product.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    // Get all collections for filter
    const collections = await Collection.find().sort('name');

    // Build current filters object
    const currentFilters = {
      brand: req.query.brand || 'All',
      gender: req.query.gender || 'All',
      strapMaterial: req.query.strapMaterial || 'All',
      movement: req.query.movement || 'All',
      waterResistance: req.query.waterResistance || 'All',
      caseMaterial: req.query.caseMaterial || 'All',
      dialColor: req.query.dialColor || 'All',
      inStock: req.query.inStock === 'true',
      minPrice: req.query.minPrice || '',
      maxPrice: req.query.maxPrice || ''
    };

    // Add wishlist status to products if user is logged in
    let productsWithWishlist = products;
    if (req.user) {
      try {
        const user = await User.findById(req.user._id).select('wishlist');
        if (user && user.wishlist) {
          const wishlistItems = user.wishlist.map(item => item.product && item.product.toString());
          productsWithWishlist = products.map(product => ({
            ...product.toObject(),
            inWishlist: wishlistItems.includes(product._id.toString())
          }));
        }
      } catch (error) {
        console.error('Error checking wishlist for products:', error);
        productsWithWishlist = products.map(product => ({
          ...product.toObject(),
          inWishlist: false
        }));
      }
    } else {
      productsWithWishlist = products.map(product => ({
        ...product.toObject(),
        inWishlist: false
      }));
    }

    res.render('Collection-Page', {
      title: `${collection.name} Collection`,
      collection,
      products: productsWithWishlist,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      },
      filters: currentFilters,
      sort: sort,
      brands,
      collections,
      user: req.user || null,
    });
  } catch (error) {
    console.error('Error loading collection page:', error);
    renderNotification(res, 'error', 'Failed to load collection products. Please try again later.');
  }
});

// User logout route
router.get('/logout', (req, res) => {
  // Clear JWT token cookie
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
  
  // Redirect to login page
  res.redirect('/LoginSignup');
});

// Features that require authentication
// Add a middleware for authenticated routes
const authenticatedRoutes = express.Router();
authenticatedRoutes.use(authenticateJWT);

// GET /cart - View cart
router.get('/cart', async (req, res) => {
  try {
    let cart;
    
    if (req.user) {
      // Get cart from database for authenticated users
      cart = await Cart.findOne({ userId: req.user._id })
        .populate({
          path: 'items.product',
          model: 'Product',
          select: '_id name price image stock stockCount'
        });

      // If no cart exists, create a new one
      if (!cart) {
        cart = new Cart({ userId: req.user._id });
        await cart.save();
      }
    } else {
      // Get cart from session for guest users
      cart = req.session.cart || {
        items: [],
        subtotal: 0,
        shippingCost: 20,
        total: 20,
        shippingMethod: 'standard'
      };
    }

    // Ensure cart has all required fields and correct structure
    const normalizedCart = {
      items: (cart.items || []).map(item => ({
        product: item.product?._id || item.product || item.productId,
        productId: item.productId || (item.product ? item.product._id : null),
        name: item.name,
        image: item.image,
        price: item.price || 0,
        quantity: item.quantity || 1
      })),
      subtotal: cart.subtotal || 0,
      shippingCost: cart.shippingCost || 20,
      total: cart.total || 20,
      shippingMethod: cart.shippingMethod || 'standard'
    };

    // Calculate totals if they're not set
    if (normalizedCart.subtotal === 0) {
      normalizedCart.subtotal = normalizedCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      normalizedCart.total = normalizedCart.subtotal + normalizedCart.shippingCost;
    }

    // Save the normalized cart back to session for guest users
    if (!req.user) {
      req.session.cart = normalizedCart;
    }

    res.render('cart', {
      title: 'Shopping Cart',
      cart: normalizedCart,
      user: req.user || null
    });
  } catch (error) {
    console.error('Error loading cart:', error);
    renderNotification(res, 'error', 'Failed to load cart. Please try again later.');
  }
});

// POST /cart/add - Add item to cart
router.post('/cart/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Validate product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.stock || product.stockCount < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    if (req.user) {
      // Handle authenticated user
      let cart = await Cart.findOne({ userId: req.user._id });
      
      if (!cart) {
        cart = new Cart({ userId: req.user._id });
      }

      await cart.addItem(productId, quantity);
      
      res.json({
        success: true,
        message: 'Product added to cart',
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          total: cart.total,
          shippingMethod: cart.shippingMethod
        }
      });
    } else {
      // Handle guest user
      let cart = req.session.cart || {
        items: [],
        subtotal: 0,
        shippingCost: 20,
        total: 20,
        shippingMethod: 'standard'
      };

      const existingItem = cart.items.find(item => 
        (item.product && item.product.toString() === productId) || 
        (item.productId && item.productId.toString() === productId)
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockCount) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock for requested quantity'
          });
        }
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          product: productId,
          productId: productId,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity
        });
      }

      // Recalculate totals
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.total = cart.subtotal + cart.shippingCost;

      req.session.cart = cart;
      
      res.json({
        success: true,
        message: 'Product added to cart',
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          total: cart.total,
          shippingMethod: cart.shippingMethod
        }
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart'
    });
  }
});

// POST /cart/update-quantity - Update item quantity
router.post('/cart/update-quantity', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    // Validate product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.stock || product.stockCount < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    if (req.user) {
      // Handle authenticated user
      const cart = await Cart.findOne({ userId: req.user._id });
      
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      await cart.updateQuantity(productId, quantity);
      
      res.json({
        success: true,
        message: 'Cart updated',
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          total: cart.total,
          shippingMethod: cart.shippingMethod
        }
      });
    } else {
      // Handle guest user
      const cart = req.session.cart;
      
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      const item = cart.items.find(item => 
        (item.product && item.product.toString() === productId) || 
        (item.productId && item.productId.toString() === productId)
      );
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in cart'
        });
      }

      item.quantity = quantity;
      
      // Recalculate totals
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.total = cart.subtotal + cart.shippingCost;

      req.session.cart = cart;
      
      res.json({
        success: true,
        message: 'Cart updated',
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          total: cart.total,
          shippingMethod: cart.shippingMethod
        }
      });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// POST /cart/remove - Remove item from cart
router.post('/cart/remove', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (req.user) {
      // Handle authenticated user
      const cart = await Cart.findOne({ userId: req.user._id });
      
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      await cart.removeItem(productId);
      
      res.json({
        success: true,
        message: 'Item removed from cart',
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          total: cart.total,
          shippingMethod: cart.shippingMethod
        }
      });
    } else {
      // Handle guest user
      const cart = req.session.cart;
      
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      cart.items = cart.items.filter(item => 
        (item.product && item.product.toString() !== productId) && 
        (item.productId && item.productId.toString() !== productId)
      );
      
      // Recalculate totals
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.total = cart.subtotal + cart.shippingCost;

      req.session.cart = cart;
      
      res.json({
        success: true,
        message: 'Item removed from cart',
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          total: cart.total,
          shippingMethod: cart.shippingMethod
        }
      });
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// POST /cart/clear - Clear cart
router.post('/cart/clear', async (req, res) => {
  try {
    if (req.user) {
      // Handle authenticated user
      const cart = await Cart.findOne({ userId: req.user._id });
      
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      await cart.clear();
      
      res.json({
        success: true,
        message: 'Cart cleared',
        cart: {
          items: [],
          subtotal: 0,
          shippingCost: cart.shippingCost,
          total: cart.shippingCost,
          shippingMethod: cart.shippingMethod
        }
      });
    } else {
      // Handle guest user
      req.session.cart = {
        items: [],
        subtotal: 0,
        shippingCost: 20,
        total: 20,
        shippingMethod: 'standard'
      };
      
      res.json({
        success: true,
        message: 'Cart cleared',
        cart: req.session.cart
      });
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// POST /cart/update-shipping - Update shipping method
router.post('/cart/update-shipping', async (req, res) => {
  try {
    const { shippingMethod } = req.body;
    
    if (!shippingMethod || !['standard', 'fast'].includes(shippingMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid shipping method is required'
      });
    }

    if (req.user) {
      // Handle authenticated user
      const cart = await Cart.findOne({ userId: req.user._id });
      
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      cart.shippingMethod = shippingMethod;
      cart.shippingCost = shippingMethod === 'fast' ? 40 : 20;
      cart.total = cart.subtotal + cart.shippingCost;
      
      await cart.save();
      
      res.json({
        success: true,
        message: 'Shipping method updated',
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          total: cart.total,
          shippingMethod: cart.shippingMethod
        }
      });
    } else {
      // Handle guest user
      const cart = req.session.cart;
      
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      cart.shippingMethod = shippingMethod;
      cart.shippingCost = shippingMethod === 'fast' ? 40 : 20;
      cart.total = cart.subtotal + cart.shippingCost;

      req.session.cart = cart;
      
      res.json({
        success: true,
        message: 'Shipping method updated',
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          shippingCost: cart.shippingCost,
          total: cart.total,
          shippingMethod: cart.shippingMethod
        }
      });
    }
  } catch (error) {
    console.error('Error updating shipping method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipping method'
    });
  }
});

// Wishlist routes require auth
authenticatedRoutes.get('/wishlist', async (req, res) => {
  if (!req.user) {
    return res.redirect('/user/LoginSignup');
  }

  try {
    // Fetch user with populated wishlist items
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist.product',
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'Vcollection', select: 'name' }
        ]
      });

    if (!user) {
      return res.redirect('/user/LoginSignup');
    }

    // Transform wishlist items to include all necessary product data
    const wishlistItems = user.wishlist.map(item => {
      if (!item.product) return null;
      return {
        ...item.product.toObject(),
        inWishlist: true
      };
    }).filter(Boolean); // Remove any null items

    // If it's an API request or format=json, return JSON
    if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        data: {
          wishlistItems
        }
      });
    }

    res.render('wishlist', {
      title: 'My Wishlist',
      wishlistItems,
      user: req.user,
      type: 'info',
      message: '',
      show: false
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    renderNotification(res, 'error', 'Failed to retrieve wishlist. Please try again later.', 'Error');
  }
});

// Add wishlist toggle endpoint
authenticatedRoutes.post('/wishlist/toggle', async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if product exists in wishlist
    const existingIndex = user.wishlist.findIndex(
      item => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      // Remove from wishlist
      user.wishlist.splice(existingIndex, 1);
      await user.save();
      return res.json({ success: true, message: 'Product removed from wishlist' });
    } else {
      // Add to wishlist
      user.wishlist.push({ product: productId });
      await user.save();
      return res.json({ success: true, message: 'Product added to wishlist' });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ success: false, message: 'Failed to update wishlist' });
  }
});

// Account details page (protected route)
router.get('/account-details', authenticateJWT, async (req, res) => {
  try {
    // If no user is found in the request, redirect to login
    if (!req.user) {
      return res.redirect('/user/LoginSignup');
    }

    // Fetch fresh user data with populated wishlist items and orders
    const user = await User.findById(req.user._id)
      .select('-password +phone_number')
      .populate({
        path: 'wishlist.product',
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'Vcollection', select: 'name' }
        ]
      })
      .populate({
        path: 'orders.orderId',
        model: 'Order',
        populate: {
          path: 'items.productId',
          model: 'Product'
        }
      })
      .lean();

    if (!user) {
      return res.redirect('/user/LoginSignup');
    }

    // Remove sensitive payment info
    if (user.Payment) {
      delete user.Payment.cardNumber;
      delete user.Payment.cvv;
    }

    // Transform orders to include all necessary data
    if (user.orders) {
      user.orders = user.orders.map(order => {
        if (!order.orderId) return null;
        const orderData = order.orderId;
        return {
          orderId: orderData._id.toString(),
          orderNumber: orderData.orderNumber,
          status: orderData.status,
          orderDate: orderData.createdAt,
          total: orderData.total,
          shippingCost: orderData.shippingCost,
          tax: orderData.tax,
          items: orderData.items.map(item => {
            // Skip items with null productId
            if (!item.productId) return null;
            return {
              product: {
                _id: item.productId._id,
                name: item.productId.name,
                image: item.productId.image,
                price: item.price
              },
              quantity: item.quantity
            };
          }).filter(Boolean), // Remove any null items
          shipping: orderData.shipping,
          payment: orderData.payment
        };
      }).filter(Boolean); // Remove any null orders
    }

    // If it's an API request or format=json, return JSON
    if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        data: user
      });
    }

    res.render('Account-Details', {
      title: 'Account Details',
      user: user,
      type: req.query.type || 'info',
      message: req.query.message || '',
      show: req.query.show === 'true'
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching account details'
      });
    }
    res.redirect('/user/LoginSignup');
  }
});

// Change from POST to GET
router.get("/submit-payment", (req, res) => {
  // Render the Payment.ejs page
  res.render("Payment"); // Assuming your Payment form is in views/Payment.ejs
});

router.post("/submit-payment", async (req, res) => {
  const { name, card_number, bank_name, expiry, cvv } = req.body;

  try {
    const newOrder = new Order({
      payment: {
        name,
        card_number,
        bank_name,
        expiry,
        cvv,
      },
    });

    await newOrder.save();

    // Redirect to shipping form with order ID
    res.redirect(`/shipping?orderId=${newOrder._id}`);
  } catch (error) {
    console.error("Payment submission error:", error);
    res.status(500).send("Payment could not be processed.");
  }
});

router.get("/submit-shipping", async (req, res) => {
  const { orderId } = req.query;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send("Order not found");

    res.render("Shipping", { orderId });
  } catch (error) {
    console.error("Error loading shipping page:", error);
    res.status(500).send("Error loading shipping form.");
  }
});

router.post("/shipping/submit", async (req, res) => {
    try {
        const { fullName, email, address, city, state, zipCode, saveAddress } = req.body;

        // Get the latest order for the user
        const order = await Order.findOne({ userId: req.user?._id })
            .sort({ createdAt: -1 });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No order found'
            });
        }

        // Update order with shipping information
        order.shipping = {
            name: fullName,
            email,
            address,
            city,
            state,
            zipCode
        };

        await order.save();

        // Save address to user profile if requested and user is authenticated
        if (saveAddress && req.user?._id) {
            await User.findByIdAndUpdate(req.user._id, {
                Address: {
                    street: address,
                    city,
                    state,
                    country: 'Egypt', // Default country
                    postalCode: zipCode
                }
            });
        }

        // Redirect to review page
        res.redirect('/user/review');
    } catch (error) {
        console.error('Error submitting shipping:', error);
        res.status(500).render('error', {
            title: 'Shipping Error',
            message: 'Error submitting shipping information',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Product page
router.get('/product', async (req, res) => {
    try {
        const productId = req.query.id;
        
        if (!productId) {
            return res.status(400).render('error', {
                title: 'Invalid Request',
                message: 'Product ID is required.',
                type: 'error',
                show: true
            });
        }

        const product = await Product.findById(productId)
            .populate('brand')
            .populate('Vcollection');

        if (!product) {
            return res.status(404).render('error', {
                title: 'Product Not Found',
                message: 'The requested product could not be found.',
                type: 'error',
                show: true
            });
        }

        // Check if product is in user's wishlist
        let inWishlist = false;
        if (req.user) {
            try {
                const user = await User.findById(req.user._id).select('wishlist');
                if (user && user.wishlist) {
                    inWishlist = user.wishlist.some(item => item.product && item.product.toString() === productId);
                }
            } catch (error) {
                console.error('Error checking wishlist:', error);
                inWishlist = false;
            }
        }

        // Get related products (same brand or collection)
        const relatedProducts = await Product.find({
            $or: [
                { brand: product.brand?._id },
                { Vcollection: product.Vcollection?._id }
            ],
            _id: { $ne: product._id } // Exclude current product
        })
        .limit(4)
        .populate('brand')
        .populate('Vcollection');

        // Add wishlist status to related products
        let relatedProductsWithWishlist = relatedProducts;
        if (req.user) {
            try {
                const user = await User.findById(req.user._id).select('wishlist');
                if (user && user.wishlist) {
                    const wishlistItems = user.wishlist.map(item => item.product && item.product.toString());
                    relatedProductsWithWishlist = relatedProducts.map(product => ({
                        ...product.toObject(),
                        inWishlist: wishlistItems.includes(product._id.toString())
                    }));
                }
            } catch (error) {
                console.error('Error checking wishlist for related products:', error);
                relatedProductsWithWishlist = relatedProducts.map(product => ({
                    ...product.toObject(),
                    inWishlist: false
                }));
            }
        }

        // Convert product to plain object and add wishlist status
        const productData = {
            ...product.toObject(),
            inWishlist: inWishlist
        };

        // If it's an API request or format=json, return JSON
        if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                data: {
                    product: productData,
                    relatedProducts: relatedProductsWithWishlist
                }
            });
        }

        res.render('Product Page', {
            title: product.name,
            product: productData,
            relatedProducts: relatedProductsWithWishlist,
            user: req.user || null,
            type: 'info',
            message: '',
            show: false
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while fetching the product details.',
            type: 'error',
            show: true
        });
    }
});


// Comparison Routes
router.get('/compare', async (req, res) => {
  try {
    const comparisonList = req.session.comparisonList || [];
    const products = await Product.find({ _id: { $in: comparisonList } });
    
    // Get brand and collection names
    const productsWithDetails = await Promise.all(products.map(async (product) => {
      const brand = await Brand.findOne({ name: product.brand });
      const collection = await Collection.findOne({ name: product.Vcollection });
      
      return {
        ...product.toObject(),
        brand: brand ? brand.name : product.brand,
        Vcollection: collection ? collection.name : product.Vcollection
      };
    }));
    
    res.render('compare', {
      products: productsWithDetails,
      title: 'Product Comparison'
    });
  } catch (error) {
    console.error('Error loading comparison page:', error);
    renderNotification(res, 'error', 'Failed to load comparison page. Please try again later.');
  }
});

router.post('/compare/add', async (req, res) => {
  try {
    console.log('Received compare/add request:', req.body);
    const { productId } = req.body;
    if (!productId) {
      console.log('No productId provided');
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Initialize comparison list if it doesn't exist
    if (!req.session.comparisonList) {
      console.log('Initializing comparison list');
      req.session.comparisonList = [];
    }

    console.log('Current comparison list:', req.session.comparisonList);

    // Check if product is already in comparison list
    if (req.session.comparisonList.includes(productId)) {
      console.log('Product already in comparison list');
      return res.status(400).json({ success: false, message: 'Product is already in comparison list' });
    }

    // Add product to comparison list
    req.session.comparisonList.push(productId);
    console.log('Updated comparison list:', req.session.comparisonList);

    // Limit comparison list to 3 products
    if (req.session.comparisonList.length > 3) {
      req.session.comparisonList.shift(); // Remove oldest product
      console.log('Trimmed comparison list:', req.session.comparisonList);
    }

    res.json({ success: true, message: 'Product added to comparison list' });
  } catch (error) {
    console.error('Error adding product to comparison:', error);
    res.status(500).json({ success: false, message: 'Failed to add product to comparison list' });
  }
});

router.delete('/compare/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!req.session.comparisonList) {
      return res.status(400).json({ success: false, message: 'Comparison list is empty' });
    }

    // Remove product from comparison list
    req.session.comparisonList = req.session.comparisonList.filter(id => id !== productId);

    res.json({ success: true, message: 'Product removed from comparison list' });
  } catch (error) {
    console.error('Error removing product from comparison:', error);
    res.status(500).json({ success: false, message: 'Failed to remove product from comparison list' });
  }
});

router.get('/compare/list', (req, res) => {
  try {
    const comparisonList = req.session.comparisonList || [];
    res.json({ success: true, comparisonList });
  } catch (error) {
    console.error('Error getting comparison list:', error);
    res.status(500).json({ success: false, message: 'Failed to get comparison list' });
  }
});

// Payment routes - accessible to both authenticated and non-authenticated users
router.get('/payment', async (req, res) => {
    try {
        // Get cart data from session
        const cart = req.session.cart || {
            items: [],
            subtotal: 0,
            shippingCost: 20,
            total: 20
        };

        // If no items in cart, redirect to cart page
        if (!cart.items || cart.items.length === 0) {
            return res.redirect('/user/cart');
        }

        // If user is authenticated, get their payment info
        let paymentInfo = null;
        if (req.user) {
            const user = await User.findById(req.user._id);
            if (user && user.Payment) {
                paymentInfo = {
                    name: user.Payment.cardHolder,
                    bank_name: user.Payment.bankName || '',
                    card_number: user.Payment.cardNumber ? '**** **** **** ' + user.Payment.cardNumber.slice(-4) : '',
                    expiry: user.Payment.expiryDate,
                    cvv: '' // Never send CVV back to client
                };
            }
        } else {
            // For non-authenticated users, check session for saved payment info
            if (req.session.paymentInfo) {
                paymentInfo = {
                    name: req.session.paymentInfo.name,
                    bank_name: req.session.paymentInfo.bank_name,
                    card_number: req.session.paymentInfo.card_number ? '**** **** **** ' + req.session.paymentInfo.card_number.slice(-4) : '',
                    expiry: req.session.paymentInfo.expiry,
                    cvv: '' // Never send CVV back to client
                };
            }
        }

        res.render('Payment', {
            title: 'Secure Checkout || Vaultique',
            cart,
            paymentInfo,
            user: req.user || null,
            isAuthenticated: !!req.user
        });
    } catch (error) {
        console.error('Error loading payment page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load payment page',
            type: 'error',
            show: true
        });
    }
});

// Process payment - accessible to both authenticated and non-authenticated users
router.post('/payment/process', async (req, res) => {
    try {
        const { name, card_number, bank_name, expiry, cvv } = req.body;

        // Enhanced validation
        if (!name || !card_number || !bank_name || !expiry || !cvv) {
            return res.status(400).json({
                success: false,
                message: 'All payment fields are required'
            });
        }

        // Validate card number (Luhn algorithm)
        const cardNumber = card_number.replace(/\s/g, '');
        if (!isValidCardNumber(cardNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid card number'
            });
        }

        // Validate expiry date (MM/YY format and not expired)
        if (!isValidExpiryDate(expiry)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired card'
            });
        }

        // Validate CVV (3 or 4 digits)
        if (!/^\d{3,4}$/.test(cvv)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid CVV'
            });
        }

        // Check if cart exists and has items
        if (!req.session.cart?.items?.length) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // If user is authenticated, save payment info to their account
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                Payment: {
                    cardHolder: name,
                    cardNumber: cardNumber.slice(-4), // Only store last 4 digits
                    bankName: bank_name,
                    expiryDate: expiry,
                    paymentType: 'credit',
                    lastUsed: new Date()
                }
            });
        }

        // Store payment info in session for both authenticated and non-authenticated users
        req.session.paymentInfo = {
            name,
            card_number: cardNumber.slice(-4), // Only store last 4 digits
            bank_name,
            expiry,
            paymentType: 'credit'
        };

        // Create order in database
        const order = new Order({
            userId: req.user?._id,
            orderNumber: generateOrderNumber(),
            items: req.session.cart.items.map(item => {
                // Handle both product and productId fields
                const productId = item.product?._id || item.product || item.productId;
                if (!productId) {
                    throw new Error('Product ID is missing from cart item');
                }
                return {
                    productId,
                    quantity: item.quantity,
                    price: item.price
                };
            }),
            total: req.session.cart.total,
            shippingCost: req.session.cart.shippingCost || 20,
            tax: req.session.cart.tax || 0,
            status: 'pending',
            payment: {
                name,
                cardNumber: cardNumber.slice(-4),
                bankName: bank_name,
                expiry
            },
            // Add shipping information from session if available
            shipping: req.session.shippingInfo || {
                name: req.user?.name || 'Guest',
                email: req.user?.email || 'guest@example.com',
                address: 'To be provided',
                city: 'To be provided',
                state: 'To be provided',
                zipCode: 'To be provided'
            }
        });

        // Log the order data for debugging
        console.log('Creating order with data:', {
            items: order.items,
            total: order.total,
            shipping: order.shipping
        });

        // Update product stock and popularity before saving the order
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }

            // Decrement stock count
            if (product.stockCount > 0) {
                product.stockCount -= item.quantity;
                // Update stock status if stock count reaches 0
                if (product.stockCount === 0) {
                    product.stock = false;
                }
            } else {
                throw new Error(`Product ${product.name} is out of stock`);
            }

            // Increment popularity score
            product.popularityScore += 1;

            await product.save();
        }

        await order.save();

        // If user is authenticated, add order to their orders array
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    orders: {
                        orderId: order._id.toString(),
                        orderDate: new Date(),
                        status: 'Pending',
                        total: order.total,
                        items: order.items.map(item => ({
                            product: item.productId,
                            quantity: item.quantity
                        }))
                    }
                }
            });
        }

        // Clear cart after successful payment
        if (req.user) {
            await Cart.findOneAndDelete({ userId: req.user._id });
        }
        req.session.cart = null;

        // Store order info in session for shipping
        req.session.orderInfo = {
            orderId: order._id,
            paymentProcessed: true,
            timestamp: new Date(),
            total: order.total
        };

        res.json({
            success: true,
            message: 'Payment processed successfully',
            redirect: '/user/shipping',
            orderId: order._id
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment. Please try again.'
        });
    }
});

// Helper functions for payment validation
function isValidCardNumber(cardNumber) {
    // Luhn algorithm implementation
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return (sum % 10) === 0;
}

function isValidExpiryDate(expiry) {
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
}

// Check payment status - accessible to both authenticated and non-authenticated users
router.get('/payment/check', (req, res) => {
    console.log('Payment check - Cart state:', {
        hasCart: !!req.session.cart,
        cartItems: req.session.cart?.items,
        itemsLength: req.session.cart?.items?.length
    });

    // If user has already processed payment, redirect to shipping
    if (req.session.orderInfo?.paymentProcessed) {
        console.log('Redirecting to shipping - payment already processed');
        return res.redirect('/user/shipping');
    }
    
    // If no cart items, redirect to cart
    if (!req.session.cart?.items?.length) {
        console.log('Redirecting to cart - no items in cart');
        return res.redirect('/user/cart');
    }

    // Otherwise, proceed to payment
    console.log('Proceeding to payment page');
    res.redirect('/user/payment');
});

// Add shipping route handler
router.get("/shipping", async (req, res) => {
    try {
        // Get the latest order for the user
        const order = await Order.findOne({ userId: req.user?._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.productId',
                model: 'Product'
            });

        if (!order) {
            return res.redirect('/user/cart');
        }

        // Get user's saved addresses
        const user = await User.findById(req.user?._id).select('Address');
        const savedAddresses = user?.Address ? [user.Address] : [];

        res.render('shipping', {
            order,
            user: req.user,
            isAuthenticated: req.isAuthenticated(),
            savedAddresses,
            error: null
        });
    } catch (error) {
        console.error('Error in shipping route:', error);
        res.status(500).render('error', {
            title: 'Shipping Error',
            message: 'Error loading shipping page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Add review route handler
router.get("/review", async (req, res) => {
    try {
        // Get the latest order for the user
        const order = await Order.findOne({ userId: req.user?._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.productId',
                model: 'Product'
            });

        if (!order) {
            return res.redirect('/user/cart');
        }

        // Calculate order summary
        const orderSummary = {
            subtotal: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shippingCost: order.shippingCost || 20,
            total: order.total
        };

        res.render('review', {
            order,
            orderSummary,
            user: req.user,
            isAuthenticated: req.isAuthenticated(),
            error: null
        });
    } catch (error) {
        console.error('Error in review route:', error);
        res.status(500).render('error', {
            title: 'Review Error',
            message: 'Error loading review page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Add order confirmation route handler
router.post('/order-confirmation', async (req, res) => {
  try {
    // Get order ID from session
    const orderId = req.session.orderInfo?.orderId;
    if (!orderId) {
      return res.redirect('/user/cart');
    }

    // Get the order
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return res.redirect('/user/cart');
    }

    // Get user information
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate required shipping information
    if (!user.Address?.street || !user.Address?.city || !user.Address?.state) {
      throw new Error('Missing required shipping information');
    }

    // Update order with user information
    order.shipping = {
      name: user.Name,
      email: user.email,
      address: user.Address.street,
      city: user.Address.city,
      state: user.Address.state,
      zipCode: user.Address.postalCode || '00000' // Provide a default if missing
    };

    // Update order status to processing (since it's confirmed)
    order.status = 'processing';
    await order.save();

    // Update user's order history with the correct order ID
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'orders.$[elem].status': 'Processing'
      }
    }, {
      arrayFilters: [{ 'elem.orderId': orderId.toString() }]
    });

    // Clear the cart and session order info
    req.session.cart = null;
    req.session.orderInfo = null;

    res.redirect('/user/order-success');
  } catch (error) {
    console.error('Error confirming order:', error);
    res.render('error', { 
      message: 'Error confirming order',
      error: error,
      title: 'Order Error'
    });
  }
});

// Add order success route handler
router.get("/order-success", async (req, res) => {
    try {
        // Get the latest order for the user
        const order = await Order.findOne({ userId: req.user?._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.productId',
                model: 'Product'
            });

        if (!order) {
            return res.redirect('/user/cart');
        }

        res.render('order-success', {
            order,
            user: req.user,
            isAuthenticated: req.isAuthenticated()
        });
    } catch (error) {
        console.error('Error in order success route:', error);
        res.status(500).render('error', {
            title: 'Order Error',
            message: 'Error loading order confirmation',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Get order details by ID
router.get('/orders/:orderId', authenticateJWT, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.productId')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the order belongs to the user or if the user is an admin
    if (order.userId && order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message
    });
  }
});

// Add the authenticated routes
router.use(authenticatedRoutes);

module.exports = router;
