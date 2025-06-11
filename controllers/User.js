const express = require('express');
const router = express.Router();
const Product = require('../models/Products');
const Brand = require('../models/Brands');
const Collection = require('../models/Collections');
const User = require('../models/Users');
const { authenticateJWT } = require('../middleware/jwt');

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
  
  try 
  {

    //Fetch from Database
    //const configurator = await Configurator.find();

    res.render('Configure-Page');
  }

  catch (error)
  {
    res.render('Error Loading Configurator Page', error);
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

router.get('/cart',async (req,res)=>
{
  try
  {
    res.render('cart');
  }
  catch(error)
  {
    console.log('error loading cart')
  }
}
)

// Cart routes require auth
authenticatedRoutes.get('/cart', async (req, res) => {
  try {
    // cart retrieval logic here
    renderNotification(res, 'success', 'Cart retrieved successfully');
    res.render('cart')
  } catch (error) {
    renderNotification(res, 'error', 'Failed to retrieve cart');
  }
});

authenticatedRoutes.post('/cart/add', async (req, res) => {
  try {
    // cart addition logic here
    renderNotification(res, 'success', 'Product added to cart successfully');
  } catch (error) {
    renderNotification(res, 'error', 'Failed to add product to cart');
  }
});

authenticatedRoutes.post('/cart/remove', async (req, res) => {
  try {
    // cart removal logic here
    renderNotification(res, 'success', 'Product removed from cart successfully');
  } catch (error) {
    renderNotification(res, 'error', 'Failed to remove product from cart');
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

    // Fetch fresh user data with populated wishlist items
    const user = await User.findById(req.user._id)
      .select('-password +phone_number')
      .populate({
        path: 'wishlist.product',
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'Vcollection', select: 'name' }
        ]
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

router.post("/submit-shipping", async (req, res) => {
  const { orderId, name, email, address, city, state, zipcode } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send("Order not found");

    order.shipping = {
      name,
      email,
      address,
      city,
      state,
      zipcode,
    };

    await order.save();

    res.render("confirmation", { order }); // Or redirect to a success page
  } catch (error) {
    console.error("Shipping submission error:", error);
    res.status(500).send("Shipping info could not be saved.");
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

// Add the authenticated routes
router.use(authenticatedRoutes);

module.exports = router;
