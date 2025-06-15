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
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// Helper function to render notification
const renderNotification = (res, type, message, title = 'Notification', status = 500) => {
  res.status(status).render('error', {
    title,
    type,
    message,
    show: true,
    user: res.locals.user || null
  });
};

// Public routes (no auth required)
router.get('/product', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.redirect('/user/products');
    res.redirect(`/user/products/${id}`);
  } catch (error) {
    console.error('Error redirecting to product:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load product. Please try again later.',
      type: 'error',
      show: true
    });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand');
    if (!product) {
      return renderNotification(res, 'error', 'The requested product does not exist.', 'Product Not Found', 404);
    }

    // Get wishlist status if user is logged in
    let inWishlist = false;
    if (req.user) {
      const user = await User.findById(req.user._id).populate('wishlist');
      inWishlist = user.wishlist.some(item => item.product && item.product._id.toString() === product._id.toString());
    }

    res.render('Product Page', {
      title: product.name,
      product: {
        ...product.toObject(),
        inWishlist
      },
      user: req.user || null
    });
  } catch (error) {
    console.error('Error loading product detail:', error);
    renderNotification(res, 'error', 'Failed to load product details. Please try again later.', 'Error');
  }
});

// Protected routes (require auth)
const protectedRoutes = express.Router();
protectedRoutes.use(authenticateJWT);

// Collections Page
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
  res.redirect('/user/LoginSignup');
});

// Helper function to initialize cart session
const initializeCartSession = (req) => {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      shippingMethod: 'standard',
      subtotal: 0,
      shippingCost: 20,
      total: 20,
      lastUpdated: new Date()
    };
  }
  return req.session.cart;
};

// Helper function to save cart session
const saveCartSession = async (req) => {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Cart routes (public)
router.get('/cart', async (req, res) => {
  try {
    // Initialize cart from session
    const cart = initializeCartSession(req);

    // If user is authenticated, sync with DB cart
    if (req.user) {
      let userCart = await Cart.findOne({ userId: req.user._id });
      if (userCart) {
        req.session.cart = {
          items: userCart.items,
          shippingMethod: userCart.shippingMethod,
          subtotal: userCart.subtotal,
          shippingCost: userCart.shippingCost,
          total: userCart.total,
          lastUpdated: userCart.lastUpdated
        };
      }
    }

    res.render('cart', {
      cart: req.session.cart,
      isEmpty: !req.session.cart.items || req.session.cart.items.length === 0,
      error: null,
      user: req.user || null
    });
  } catch (error) {
    console.error('Error viewing cart:', error);
    renderNotification(res, 'error', 'An error occurred while loading your cart.', 'Error');
  }
});

// POST /user/cart/add - Add item to cart (DB for logged in, session for guests)
router.post('/cart/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    console.log('POST /user/cart/add called with:', { productId, quantity, user: req.user?._id });
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (!product.stock || product.stockCount < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    if (req.user) {
      let cart = await Cart.findOne({ userId: req.user._id });
      if (!cart) {
        cart = new Cart({ userId: req.user._id });
      }
      console.log('Cart items before add:', cart.items);
      const existingItem = cart.items.find(item => item.product.toString() === productId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockCount) {
          return res.status(400).json({ success: false, message: 'Insufficient stock for requested quantity' });
        }
        existingItem.quantity = newQuantity;
        console.log('Updated existing item:', existingItem);
      } else {
        const newItem = { product: productId, name: product.name, image: product.image, price: product.price, quantity };
        cart.items.push(newItem);
        console.log('Added new item:', newItem);
      }
      console.log('Cart items before save:', cart.items);
      await cart.save();
      console.log('Cart items after save:', cart.items);
      await cart.populate('items.product');
      res.json({ success: true, message: 'Product added to cart', cart: { items: cart.items.map(item => ({ product: item.product._id ? item.product._id.toString() : item.product.toString(), productId: item.product._id ? item.product._id.toString() : item.product.toString(), name: item.name, price: Number(item.price), quantity: Number(item.quantity), image: item.image })), subtotal: cart.subtotal, shippingCost: cart.shippingCost, total: cart.total, shippingMethod: cart.shippingMethod } });
    } else {
      let cart = req.session.cart || { items: [], subtotal: 0, shippingCost: 20, total: 20, shippingMethod: 'standard' };
      const existingItem = cart.items.find(item => (item.product && item.product.toString() === productId) || (item.productId && item.productId.toString() === productId));
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockCount) {
          return res.status(400).json({ success: false, message: 'Insufficient stock for requested quantity' });
        }
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({ product: productId, productId: productId, name: product.name, image: product.image, price: product.price, quantity });
      }
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.shippingCost = cart.shippingMethod === 'fast' ? 40 : 20;
      cart.total = cart.subtotal + cart.shippingCost;
      req.session.cart = cart;
      await new Promise((resolve, reject) => { req.session.save((err) => { if (err) { console.error('Error saving session:', err); reject(err); } else { resolve(); } }); });
      res.json({ success: true, message: 'Product added to cart', cart: { items: cart.items, subtotal: cart.subtotal, shippingCost: cart.shippingCost, total: cart.total, shippingMethod: cart.shippingMethod } });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Failed to add product to cart' });
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

// Wishlist routes (public with auth check)
router.get('/wishlist', async (req, res) => {
    if (!req.user) {
        return res.render('wishlist', {
            title: 'My Wishlist',
            wishlistItems: [],
            user: null,
            type: 'info',
            message: 'Please login to view your wishlist',
            show: true
        });
    }

    try {
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

        const wishlistItems = user.wishlist.map(item => {
            if (!item.product) return null;
            return {
                ...item.product.toObject(),
                inWishlist: true
            };
        }).filter(Boolean);

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
protectedRoutes.post('/wishlist/toggle', async (req, res) => {
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
protectedRoutes.get('/account-details', async (req, res) => {
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
                        if (!item.productId) return null;
                        return {
                            product: {
                                _id: item.productId._id,
                                name: item.productId.name,
                                image: item.productId.image,
                                price: item.price
                            },
                            productDetails: item.productDetails,
                            quantity: item.quantity,
                            price: item.price
                        };
                    }).filter(Boolean),
                    shipping: orderData.shipping,
                    payment: orderData.payment
                };
            }).filter(Boolean);
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
        res.redirect('/user/LoginSignup');
    }
});

// Get order details by ID
router.get('/orders/:orderId', authenticateJWT, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: 'items.productId',
        select: 'name image price brand Vcollection',
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'Vcollection', select: 'name' }
        ]
      })
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

    // Format the order data for the frontend
    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.productId ? {
          _id: item.productId._id,
          name: item.productId.name,
          image: item.productId.image,
          price: item.productId.price,
          brand: item.productId.brand?.name || 'Unknown Brand',
          collection: item.productId.Vcollection?.name || 'Unknown Collection'
        } : null,
        total: item.price * item.quantity
      })),
      subtotal: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingCost: order.shippingCost || 0,
      tax: order.tax || 0,
      total: order.total || 0,
      status: order.status || 'pending',
      orderDate: order.createdAt,
      estimatedDelivery: order.estimatedDelivery || null
    };

    res.json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to sanitize payment info
const sanitizePaymentInfo = (paymentInfo) => {
  if (!paymentInfo) return null;
  
  return {
    name: paymentInfo.name,
    card_number: paymentInfo.cardNumber ? `**** **** **** ${paymentInfo.cardNumber.slice(-4)}` : null,
    bank_name: paymentInfo.bankName,
    expiry: paymentInfo.expiryDate
  };
};

// Payment route
router.get('/payment', async (req, res) => {
  try {
    console.log('Payment route - Cart state:', {
      hasCart: !!req.session.cart,
      cartItems: req.session.cart?.items,
      itemsLength: req.session.cart?.items?.length
    });

    // Check if cart exists and has items
    if (!req.session.cart) {
      console.log('No cart found in session');
      return res.redirect('/user/cart');
    }

    if (!Array.isArray(req.session.cart.items)) {
      console.log('Cart items is not an array:', req.session.cart.items);
      return res.redirect('/user/cart');
    }

    if (req.session.cart.items.length === 0) {
      console.log('Cart is empty');
      return res.redirect('/user/cart');
    }

    // Get cart data
    const cart = req.session.cart;
    console.log('Cart data:', {
      items: cart.items,
      subtotal: cart.subtotal,
      shippingCost: cart.shippingCost,
      total: cart.total
    });

    // Get user's saved payment info if authenticated
    let paymentInfo = null;
    if (req.user) {
      const user = await User.findById(req.user._id).select('Payment');
      if (user?.Payment) {
        paymentInfo = sanitizePaymentInfo(user.Payment);
      }
    }

    res.render('Payment', {
      title: 'Secure Checkout',
      cart,
      paymentInfo,
      isAuthenticated: !!req.user,
      user: req.user || null
    });
  } catch (error) {
    console.error('Error loading payment page:', error);
    renderNotification(res, 'error', 'An error occurred while loading the payment page.', 'Error');
  }
});

// Comparison Routes
router.get('/compare', async (req, res) => {
  try {
    const comparisonList = req.session.comparisonList || [];
    // Populate the brand field
    const products = await Product.find({ _id: { $in: comparisonList } }).populate('brand');

    // Get brand and collection names
    const productsWithDetails = await Promise.all(products.map(async (product) => {
      const collection = await Collection.findOne({ name: product.Vcollection });
      return {
        ...product.toObject(),
        brand: product.brand && product.brand.name ? product.brand.name : product.brand,
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

// Add shipping page route
router.get('/shipping', async (req, res) => {
    try {
        // Check if cart exists and has items
        if (!req.session.cart?.items?.length) {
            console.log('No cart found in session');
            return res.redirect('/user/cart');
        }

        // Check if payment info exists
        if (!req.session.paymentInfo) {
            console.log('No payment info found in session');
            return res.redirect('/user/payment');
        }

        // Get user's saved addresses if authenticated
        let savedAddresses = [];
        if (req.user) {
            const user = await User.findById(req.user._id).select('Address');
            if (user?.Address) {
                savedAddresses = [user.Address];
            }
        }

        res.render('Shipping', {
            title: 'Shipping Information',
            user: req.user || null,
            savedAddresses,
            isAuthenticated: !!req.user,
            cart: req.session.cart
        });
    } catch (error) {
        console.error('Error loading shipping page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while loading the shipping page.',
            type: 'error',
            show: true
        });
    }
});

// Protected order creation routes
protectedRoutes.post('/shipping/process', async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Please login to complete your order'
            });
        }

        console.log('Processing shipping request:', {
            hasUser: !!req.user,
            hasSession: !!req.session,
            hasCart: !!req.session?.cart,
            hasPaymentInfo: !!req.session?.paymentInfo,
            cartItems: req.session?.cart?.items?.length
        });

        const { fullName, email, address, city, state, zipCode, saveAddress } = req.body;

        // Validate required fields
        if (!fullName || !email || !address || !city || !state || !zipCode) {
            return res.status(400).json({
                success: false,
                message: 'All shipping fields are required'
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if cart exists and has items
        if (!req.session.cart?.items?.length) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Check if payment info exists
        if (!req.session.paymentInfo) {
            return res.status(400).json({
                success: false,
                message: 'Payment information is required'
            });
        }

        // Save address if requested and user is authenticated
        if (saveAddress && req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                Address: {
                    street: address,
                    city,
                    state,
                    postalCode: zipCode
                }
            });
        }

        // Validate cart items and prices
        const cartItems = req.session.cart.items;
        for (const item of cartItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product ${item.name} not found`);
            }
            
            // Update stock count
            product.stockCount -= item.quantity;
            // Update stock status based on count
            product.stock = product.stockCount > 0;
            
            await product.save();
        }

        // Create order number
        const orderNumber = generateOrderNumber();

        // Create new order with both shipping and payment info
        const order = new Order({
            userId: req.user ? req.user._id : null,
            orderNumber,
            items: await Promise.all(cartItems.map(async item => {
                const product = await Product.findById(item.product);
                // Fetch the full brand name
                let brandName = product.brand;
                if (product.brand) {
                    const brandDoc = await Brand.findOne({ _id: product.brand });
                    if (brandDoc && brandDoc.name) {
                        brandName = brandDoc.name;
                    }
                }
                return {
                    productId: item.product,
                    productDetails: {
                        name: product.name,
                        image: product.image,
                        brand: brandName,
                        price: product.price,
                        strapMaterial: product.strapMaterial,
                        movement: product.movement,
                        waterResistance: product.waterResistance,
                        caseMaterial: product.caseMaterial,
                        dialColor: product.dialColor,
                        gender: product.gender,
                        Vcollection: product.Vcollection
                    },
                    quantity: item.quantity,
                    price: item.price
                };
            })),
            subtotal: req.session.cart.subtotal,
            shippingCost: req.session.cart.shippingCost,
            total: req.session.cart.total,
            shipping: {
                name: fullName,
                email,
                address,
                city,
                state,
                zipCode
            },
            payment: {
                name: req.session.paymentInfo.name,
                cardNumber: req.session.paymentInfo.cardNumber,
                bankName: req.session.paymentInfo.bankName,
                expiry: req.session.paymentInfo.expiry
            },
            status: 'pending'
        });

        // Save the order
        await order.save();

        // Add order to user's orders array if authenticated
        if (req.user && req.user._id) {
            const user = await User.findById(req.user._id);
            if (user) {
                user.orders.push({
                    orderId: order._id.toString(),
                    orderDate: order.createdAt,
                    status: 'Pending',
                    total: order.total,
                    items: order.items.map(item => ({
                        product: item.productId,
                        quantity: item.quantity
                    }))
                });
                await user.save();
            }
        }

        // Store order info in session
        req.session.orderInfo = {
            orderId: order._id,
            orderNumber: order.orderNumber
        };

        // Clear cart and payment info from session
        req.session.cart = null;
        req.session.paymentInfo = null;

        // Save session
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        res.json({
            success: true,
            message: 'Order created successfully',
            redirect: '/user/review',
            orderId: order._id
        });
    } catch (error) {
        console.error('Error processing shipping:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process shipping. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

protectedRoutes.post('/order-confirmation', async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Please login to confirm your order'
            });
        }

        // Check if order info exists in session
        if (!req.session.orderInfo) {
            return res.status(400).json({
                success: false,
                message: 'No order information found'
            });
        }

        // Get order details
        const order = await Order.findById(req.session.orderInfo.orderId);
        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status to confirmed
        order.status = 'confirmed';
        await order.save();

        // Send order confirmation email
        try {
            const user = await User.findById(req.user._id);
            if (user) {
                await sendOrderConfirmationEmail(user, {
                    orderNumber: order.orderNumber,
                    date: order.createdAt.toLocaleDateString(),
                    total: order.total.toFixed(2),
                    items: order.items.map(item => ({
                        name: item.productDetails.name,
                        quantity: item.quantity
                    }))
                });
            }
        } catch (emailError) {
            console.error('Error sending order confirmation email:', emailError);
            // Continue with order confirmation even if email fails
        }

        // Keep order info in session for success page
        const orderInfo = req.session.orderInfo;
        
        // Clear other session data
        delete req.session.cart;
        delete req.session.paymentInfo;

        res.json({
            success: true,
            message: 'Order confirmed successfully',
            redirect: '/user/order-success'
        });
    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while confirming your order'
        });
    }
});

// Add the protected routes
router.use(protectedRoutes);

router.get('/order-success', async (req, res) => {
    try {
        // Check if order info exists in session
        if (!req.session.orderInfo) {
            return res.redirect('/user/cart');
        }

        // Get order details
        const order = await Order.findById(req.session.orderInfo.orderId)
            .populate('items.productId')
            .populate('shipping')
            .populate('payment');

        if (!order) {
            return res.redirect('/user/cart');
        }

        // Clear session data
        delete req.session.orderInfo;
        delete req.session.cart;
        delete req.session.paymentInfo;

        res.render('order-success', {
            order,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Error in order success page:', error);
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while loading the order success page'
        });
    }
});

// FAQ page route
router.get('/faq', async (req, res) => {
  try {
    res.render('FAQ', {
      title: 'Vaultique | FAQ',
      user: req.user || null
    });
  } catch (error) {
    console.error('Error loading FAQ page:', error);
    renderNotification(res, 'error', 'Failed to load FAQ page. Please try again later.');
  }
});

// For Him Page Route
router.get('/for-him', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter query
        const filterQuery = { gender: 'Male' };
        
        // Apply other filters if present
        if (req.query.Vcollection && req.query.Vcollection !== 'All') {
            filterQuery.Vcollection = req.query.Vcollection;
        }
        if (req.query.brand && req.query.brand !== 'All') {
            filterQuery.brand = req.query.brand;
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
        let sort = {};
        switch (req.query.sort) {
            case 'new':
                sort = { createdAt: -1 };
                break;
            case 'price-asc':
                sort = { price: 1 };
                break;
            case 'price-desc':
                sort = { price: -1 };
                break;
            case 'popularity':
                sort = { popularity: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filterQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        // Get products with pagination and sorting
        const products = await Product.find(filterQuery)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('brand', 'name');

        // Get featured models for the slider
        const featuredModels = await Product.find({ gender: 'Male', featured: true })
            .limit(5)
            .select('name tagline description image');

        // Get collections for filter
        const collections = await Collection.find().sort({ name: 1 });

        // Get brands for filter
        const brands = await Brand.find().sort({ name: 1 });

        // Check wishlist status for each product if user is logged in
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
            brand: req.query.brand || 'All',
            gender: 'Male',
            strapMaterial: req.query.strapMaterial || 'All',
            movement: req.query.movement || 'All',
            waterResistance: req.query.waterResistance || 'All',
            caseMaterial: req.query.caseMaterial || 'All',
            dialColor: req.query.dialColor || 'All',
            minPrice: req.query.minPrice || '0',
            maxPrice: req.query.maxPrice || '50000000',
            inStock: req.query.inStock || 'false'
        };

        res.render('For-Him', {
            title: 'For Him',
            products: productsWithWishlist,
            featuredModels,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                itemsPerPage: limit
            },
            filters: currentFilters,
            sort: req.query.sort || 'default',
            collections,
            brands,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading For Him page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while loading the For Him page.',
            type: 'error',
            show: true
        });
    }
});

// For Her Page Route
router.get('/for-her', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter query
        const filterQuery = { gender: 'Female' };
        
        // Apply other filters if present
        if (req.query.Vcollection && req.query.Vcollection !== 'All') {
            filterQuery.Vcollection = req.query.Vcollection;
        }
        if (req.query.brand && req.query.brand !== 'All') {
            filterQuery.brand = req.query.brand;
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
        let sort = {};
        switch (req.query.sort) {
            case 'new':
                sort = { createdAt: -1 };
                break;
            case 'price-asc':
                sort = { price: 1 };
                break;
            case 'price-desc':
                sort = { price: -1 };
                break;
            case 'popularity':
                sort = { popularity: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filterQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        // Get products with pagination and sorting
        const products = await Product.find(filterQuery)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('brand', 'name');

        // Get featured models for the slider
        const featuredModels = await Product.find({ gender: 'Female', featured: true })
            .limit(5)
            .select('name tagline description image');

        // Get collections for filter
        const collections = await Collection.find().sort({ name: 1 });

        // Get brands for filter
        const brands = await Brand.find().sort({ name: 1 });

        // Check wishlist status for each product if user is logged in
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
            brand: req.query.brand || 'All',
            gender: 'Female',
            strapMaterial: req.query.strapMaterial || 'All',
            movement: req.query.movement || 'All',
            waterResistance: req.query.waterResistance || 'All',
            caseMaterial: req.query.caseMaterial || 'All',
            dialColor: req.query.dialColor || 'All',
            minPrice: req.query.minPrice || '0',
            maxPrice: req.query.maxPrice || '50000000',
            inStock: req.query.inStock || 'false'
        };

        res.render('For-Her', {
            title: 'For Her',
            products: productsWithWishlist,
            featuredModels,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                itemsPerPage: limit
            },
            filters: currentFilters,
            sort: req.query.sort || 'default',
            collections,
            brands,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading For Her page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while loading the For Her page.',
            type: 'error',
            show: true
        });
    }
});

    // Contact Us page route
router.get('/contact-us', async (req, res) => {
  try {
    res.render('contact-us', {
      title: 'Vaultique | Contact Us',
      user: req.user || null,
      notification: {
        hasError: false,
        hasSuccess: false
      }
    });
  } catch (error) {
    console.error('Error loading contact page:', error);
  }
});

router.get('/about-us', async (req, res) => {
    try {
        res.render('about', {
            title: 'Vaultique | About Us',
            user: req.user || null,
            notification: {
                hasError: false,
                hasSuccess: false
            }
        });
    } catch (error) {
        console.error('Error loading about page:', error);
        res.render('about', {
            title: 'Vaultique | About Us',
            user: req.user || null,
            notification: {
                hasError: true,
                error: 'Failed to load about page. Please try again later.',
                hasSuccess: false
            }
        });
    }
  });       

// Helper function to build filter query
const buildFilterQuery = (query, baseFilter = {}) => {
  const filterQuery = { ...baseFilter };
  
  // Collection filter
  if (query.Vcollection && query.Vcollection !== 'All') {
    filterQuery.Vcollection = query.Vcollection;
  }

  // Brand filter
  if (query.brand && query.brand !== 'All') {
    filterQuery.brand = query.brand;
  }

  // Other filters
  const filterFields = [
    'gender',
    'strapMaterial',
    'movement',
    'waterResistance',
    'caseMaterial',
    'dialColor'
  ];

  filterFields.forEach(field => {
    if (query[field] && query[field] !== 'All') {
      filterQuery[field] = query[field];
    }
  });

  // Price range
  if (query.minPrice) {
    filterQuery.price = { ...filterQuery.price, $gte: parseFloat(query.minPrice) };
  }
  if (query.maxPrice) {
    filterQuery.price = { ...filterQuery.price, $lte: parseFloat(query.maxPrice) };
  }

  // Stock filter
  if (query.inStock === 'true') {
    filterQuery.stock = true;
  }

  return filterQuery;
};

// Helper function to get sort options
const getSortOptions = (sort) => {
  switch (sort) {
    case 'price-asc':
      return { price: 1 };
    case 'price-desc':
      return { price: -1 };
    case 'new':
      return { createdAt: -1 };
    case 'popularity':
      return { popularityScore: -1 };
    default:
      return { createdAt: -1 };
  }
};

// Helper function to get current filters
const getCurrentFilters = (query, defaultGender = null) => {
  return {
    Vcollection: query.Vcollection || 'All',
    brand: query.brand || 'All',
    gender: defaultGender || query.gender || 'All',
    strapMaterial: query.strapMaterial || 'All',
    movement: query.movement || 'All',
    waterResistance: query.waterResistance || 'All',
    caseMaterial: query.caseMaterial || 'All',
    dialColor: query.dialColor || 'All',
    minPrice: query.minPrice || '0',
    maxPrice: query.maxPrice || '50000000',
    inStock: query.inStock || 'false'
  };
};

// Review Order page route
router.get('/review', async (req, res) => {
  try {
    // Check if order info exists in session
    if (!req.session.orderInfo) {
      return res.redirect('/user/shipping');
    }

    // Get order details
    const order = await Order.findById(req.session.orderInfo.orderId)
      .populate('items.productId')
      .lean();

    if (!order) {
      return res.redirect('/user/shipping');
    }

    // Prepare order summary
    const orderSummary = {
      subtotal: order.subtotal || 0,
      shippingCost: order.shippingCost || 0,
      total: order.total || 0
    };

    // Format order data for display
    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        productId: {
          ...item.productId,
          image: item.productId.image || '/Assets/Images/default-product.jpg',
          name: item.productId.name || 'Unknown Product'
        }
      })),
      shipping: {
        name: order.shipping.name || '',
        email: order.shipping.email || '',
        address: order.shipping.address || '',
        city: order.shipping.city || '',
        state: order.shipping.state || '',
        zipCode: order.shipping.zipCode || ''
      },
      payment: {
        name: order.payment.name || '',
        cardNumber: order.payment.cardNumber ? order.payment.cardNumber.slice(-4) : '',
        bankName: order.payment.bankName || '',
        expiry: order.payment.expiry || ''
      }
    };

    res.render('review', {
      title: 'Review Order',
      order: formattedOrder,
      orderSummary,
      user: req.user || null
    });
  } catch (error) {
    console.error('Error loading review page:', error);
    renderNotification(res, 'error', 'Failed to load order review page. Please try again.', 'Error');
  }
});

// Address Management
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { city, street, addressType, state, country, postalCode } = req.body;

    // Validate required fields
    if (!city || !street || !addressType || !state || !country || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    // Update user's address
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        Address: {
          city,
          street,
          addressType,
          state,
          country,
          postalCode
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address: updatedUser.Address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address',
      error: error.message
    });
  }
};

exports.removeAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { Address: 1 } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address removed successfully'
    });
  } catch (error) {
    console.error('Error removing address:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing address',
      error: error.message
    });
  }
};

module.exports = router;