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

// Public routes (no auth required)

// Login/Signup page
router.get('/LoginSignup', async (req, res) => {
  try {
    res.render('LoginSignup', {
      title: 'Vaultique | Login & Signup',
    });
  } catch (error) {
    console.error('Error loading auth page:', error);
    renderNotification(res, 'error', 'Failed to load login/signup page. Please try again later.');
  }
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

    // Get all necessary data in parallel
    const [products, totalProducts, brands, collections] = await Promise.all([
      Product.find().skip(skip).limit(limit).populate('brand Vcollection'),
      Product.countDocuments(),
      Brand.find(),
      Collection.find(),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.render('products', {
      title: 'Shop All',
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
      },
      filters: {
        brands,
        Vcollections: collections,
      },
      currentFilters: {
        sort: req.query.sort || 'default',
        Vcollection: req.query.Vcollection || 'All',
        brand: req.query.brand || 'All',
        strapMaterial: req.query.strapMaterial || 'All',
        movement: req.query.movement || 'All',
        waterResistance: req.query.waterResistance || 'All',
        caseMaterial: req.query.caseMaterial || 'All',
        dialColor: req.query.dialColor || 'All',
        minPrice: req.query.minPrice || null,
        maxPrice: req.query.maxPrice || null,
        inStock: req.query.inStock || 'false',
        gender: req.query.gender || 'All',
      },
      user: req.user || null,
    });
  } catch (error) {
    console.error('Error loading products:', error);
    renderNotification(res, 'error', 'Failed to load products. Please try again later.');
  }
});

// Brand-specific products page
router.get('/brands/:brandSlug', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const brand = await Brand.findOne({ slug: req.params.brandSlug });
    if (!brand) {
      return res.status(404).render('404', {
        title: 'Brand Not Found',
        message: 'The requested brand does not exist.',
      });
    }

    // Simple query matching the collection page implementation
    const [products, totalProducts, brands, collections] = await Promise.all([
      Product.find({ brand: brand._id }).skip(skip).limit(limit).populate('Vcollection'),
      Product.countDocuments({ brand: brand._id }),
      Brand.find(),
      Collection.find(),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    // Add brand data for JavaScript
    const brandData = {
      name: brand.name,
      title: brand.header,
      description: brand.description,
      featuredModels: brand.featuredModels,
      coverImage: brand.coverImage,
      heroVideo: brand.heroVideo,
    };

    // If it's an API request or format=json, return JSON
    if (
      req.query.format === 'json' ||
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes('application/json'))
    ) {
      return res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts,
          },
          filters: {
            brands,
            collections,
          },
        },
      });
    }

    res.render('Brand-Page', {
      title: `${brand.name} Watches`,
      brandName: brand.name,
      brand,
      products,
      currentPage: page,
      totalPages,
      brands,
      collections,
      brandData: JSON.stringify(brandData),
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      },
      currentFilters: {
        sort: req.query.sort || 'default',
        Vcollection: req.query.Vcollection || 'All',
        movement: req.query.movement || 'All',
        strapMaterial: req.query.strapMaterial || 'All',
        waterResistance: req.query.waterResistance || 'All',
        caseMaterial: req.query.caseMaterial || 'All',
        dialColor: req.query.dialColor || 'All',
        minPrice: req.query.minPrice || null,
        maxPrice: req.query.maxPrice || null,
        inStock: req.query.inStock || 'false',
      },
      user: req.user || null,
    });
  } catch (error) {
    console.error('Error loading brand page:', error);
    renderNotification(res, 'error', 'Failed to load brand products. Please try again later.');
  }
});

// Collection-specific products page
router.get('/collections/:collectionSlug', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const collection = await Collection.findOne({ slug: req.params.collectionSlug });
    if (!collection) {
      return res.status(404).render('404', {
        title: 'Collection Not Found',
        message: 'The requested collection does not exist.',
      });
    }

    const [products, totalProducts, brands, collections] = await Promise.all([
      Product.find({ Vcollection: collection._id }).skip(skip).limit(limit).populate('brand'),
      Product.countDocuments({ Vcollection: collection._id }),
      Brand.find(),
      Collection.find(),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.render('Collection-Page', {
      title: `${collection.name} Collection`,
      collection,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      },
      filters: {
        brands,
        Vcollections: collections,
      },
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

// Cart routes require auth
authenticatedRoutes.get('/cart', async (req, res) => {
  try {
    // cart retrieval logic here
    renderNotification(res, 'success', 'Cart retrieved successfully');
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
  try {
    // wishlist retrieval logic here
    renderNotification(res, 'success', 'Wishlist retrieved successfully');
  } catch (error) {
    renderNotification(res, 'error', 'Failed to retrieve wishlist');
  }
});

authenticatedRoutes.post('/wishlist/add', async (req, res) => {
  try {
    // wishlist addition logic here
    renderNotification(res, 'success', 'Product added to wishlist successfully');
  } catch (error) {
    renderNotification(res, 'error', 'Failed to add product to wishlist');
  }
});

authenticatedRoutes.post('/wishlist/remove', async (req, res) => {
  try {
    // wishlist removal logic here
    renderNotification(res, 'success', 'Product removed from wishlist successfully');
  } catch (error) {
    renderNotification(res, 'error', 'Failed to remove product from wishlist');
  }
});

// Account Details page requires auth
authenticatedRoutes.get('/account-details', async (req, res) => {
  try {
    // Get user data, but handle cases where it might not exist
    let userData = null;

    if (req.user && req.user._id) {
      userData = await User.findById(req.user._id)
        .select('-password -Payment.cardNumber -Payment.cvv')
        .lean();
    }

    if (!userData) {
      console.log('User data not found for account details page');
      // Still render the page but with empty data
      userData = {
        _id: req.user?._id || '',
        Name: req.user?.Name || '',
        email: req.user?.email || '',
      };
    }

    res.render('Account-Details', {
      title: 'Account Details',
      user: userData,
      // Pass empty notification data for the partial
      type: '',
      message: '',
      show: false,
    });
  } catch (error) {
    console.error('Error loading account details:', error);
    res.render('Account-Details', {
      title: 'Account Details',
      user: {
        _id: req.user?._id || '',
        Name: req.user?.Name || '',
        email: req.user?.email || '',
      },
      type: 'error',
      message: 'Failed to load account details',
      show: true,
    });
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

// Add the authenticated routes
router.use(authenticatedRoutes);

module.exports = router;
