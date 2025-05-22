const express = require('express');
const router = express.Router();
const Product = require('../models/Products');
const Brand = require('../models/Brands');
const Collection = require('../models/Collections');
const User = require('../models/Users');

// Helper function to render notification
const renderNotification = (res, type, message, title = 'Notification') => {
    res.render('error', {
        title,
        type,
        message,
        show: true
    });
};

// Home page
router.get('/home', async (req, res) => {
    try {
        res.render('Home-Page', {
            title: 'Vaultique | Home',
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        renderNotification(res, 'error', 'Failed to load home page. Please try again later.');
    }
});
    router.get('/LoginSignup', async (req, res) => {
    try {
        res.render('LoginSignup', {
            title: 'Vaultique | Login & Signup'
        });
    } catch (error) {
        console.error('Error loading auth page:', error);
        renderNotification(res, 'error', 'Failed to load login/signup page. Please try again later.');
    }});
// Products page
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get all necessary data in parallel
        const [products, totalProducts, brands, collections] = await Promise.all([
            Product.find()
                .skip(skip)
                .limit(limit)
                .populate('brand Vcollection'),
            Product.countDocuments(),
            Brand.find(),
            Collection.find()
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        res.render('products', {
            title: 'Shop All',
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalProducts,
                itemsPerPage: limit
            },
            filters: {
                brands,
                Vcollections: collections
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
                gender: req.query.gender || 'All'
            }
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
                message: 'The requested brand does not exist.'
            });
        }

        // Build query object with filters
        const query = { brand: brand._id };

        // Apply filters if they exist
        if (req.query.Vcollection && req.query.Vcollection !== 'All') {
            query.Vcollection = req.query.Vcollection;
        }
        if (req.query.movement && req.query.movement !== 'All') {
            query.movement = req.query.movement;
        }
        if (req.query.strapMaterial && req.query.strapMaterial !== 'All') {
            query.strapMaterial = req.query.strapMaterial;
        }
        if (req.query.waterResistance && req.query.waterResistance !== 'All') {
            query.waterResistance = req.query.waterResistance;
        }
        if (req.query.caseMaterial && req.query.caseMaterial !== 'All') {
            query.caseMaterial = req.query.caseMaterial;
        }
        if (req.query.dialColor && req.query.dialColor !== 'All') {
            query.dialColor = { $in: req.query.dialColor.split(',') };
        }
        if (req.query.inStock === 'true') {
            query.$or = [
                { stock: true },
                { stockCount: { $gt: 0 } }
            ];
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        // Sorting
        let sortOption = { _id: 1 }; // default sort
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'new':
                    sortOption = { createdAt: -1 };
                    break;
                case 'price-asc':
                    sortOption = { price: 1 };
                    break;
                case 'price-desc':
                    sortOption = { price: -1 };
                    break;
                case 'popularity':
                    sortOption = { popularityScore: -1, price: -1 };
                    break;
            }
        }

        const [products, totalProducts, brands, collections] = await Promise.all([
            Product.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate('Vcollection'),
            Product.countDocuments(query),
            Brand.find(),
            Collection.find()
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        // Add brand data for JavaScript
        const brandData = {
            name: brand.name,
            title: brand.header,
            description: brand.description,
            featuredModels: brand.featuredModels,
            coverImage: brand.coverImage,
            heroVideo: brand.heroVideo
        };

        // If it's an API request or format=json, return JSON
        if (req.query.format === 'json' || req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalProducts
                    },
                    filters: {
                        brands,
                        collections
                    }
                }
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
                totalProducts
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
                inStock: req.query.inStock || 'false'
            }
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
                message: 'The requested collection does not exist.'
            });
        }

        const [products, totalProducts, brands, collections] = await Promise.all([
            Product.find({ Vcollection: collection._id })
                .skip(skip)
                .limit(limit)
                .populate('brand'),
            Product.countDocuments({ Vcollection: collection._id }),
            Brand.find(),
            Collection.find()
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        res.render('Collection-Page', {
            title: `${collection.name} Collection`,
            collection,
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts
            },
            filters: {
                brands,
                Vcollections: collections
            }
        });
    } catch (error) {
        console.error('Error loading collection page:', error);
        renderNotification(res, 'error', 'Failed to load collection products. Please try again later.');
    }
});

router.get('/cart', async (req, res) => {
    try {
        // cart retrieval logic here
        renderNotification(res, 'success', 'Cart retrieved successfully');
    } catch (error) {
        renderNotification(res, 'error', 'Failed to retrieve cart');
    }
});

// Add to cart success notification
router.post('/cart/add', async (req, res) => {
    try {
        // cart addition logic here
        renderNotification(res, 'success', 'Product added to cart successfully');
    } catch (error) {
        renderNotification(res, 'error', 'Failed to add product to cart');
    }
});

router.post('/cart/remove', async (req, res) => {
    try {
        // cart removal logic here
        renderNotification(res, 'success', 'Product removed from cart successfully');
    } catch (error) {
        renderNotification(res, 'error', 'Failed to remove product from cart');
    }
});

router.get('/wishlist', async (req, res) => {
    try {
        // wishlist retrieval logic here
        renderNotification(res, 'success', 'Wishlist retrieved successfully');
    } catch (error) {
        renderNotification(res, 'error', 'Failed to retrieve wishlist');
    }
});


router.post('/wishlist/add', async (req, res) => {
    try {
        // wishlist addition logic here
        renderNotification(res, 'success', 'Product added to wishlist successfully');
    } catch (error) {
        renderNotification(res, 'error', 'Failed to add product to wishlist');
    }
});

router.post('/wishlist/remove', async (req, res) => {
    try {
        // wishlist removal logic here
        renderNotification(res, 'success', 'Product removed from wishlist successfully');
    } catch (error) {
        renderNotification(res, 'error', 'Failed to remove product from wishlist');
    }
});

// Account Details page
router.get('/account-details', async (req, res) => {
    try {
        // For testing, get the first user from the database
        const user = await User.findOne()
            .select('+phone_number +Payment +Payment.cardNumber +Payment.cardHolder +Payment.expiryDate +Payment.paymentType')
            .populate({
                path: 'orders.items.product',
                select: 'name image price'
            })
            .populate({
                path: 'wishlist.product',
                select: 'name image price'
            })
            .populate({
                path: 'refunds.order',
                select: 'orderId items',
                populate: {
                    path: 'items.product',
                    select: 'name'
                }
            })
            .populate({
                path: 'reviews.product',
                select: 'name image'
            });
        
        if (!user) {
            return renderNotification(res, 'error', 'No user found in database');
        }

        // Format user data for the template
        const userData = {
            name: user.Name,
            email: user.email,
            dob: user.DOB.toLocaleDateString('en-GB'), // Format as DD.MM.YYYY
            phone: user.phone_number,
            language: user.language,
            address: user.Address || {},
            payment: user.Payment ? {
                cardNumber: user.Payment.cardNumber ? `**** **** **** ${user.Payment.cardNumber.slice(-4)}` : null,
                cardHolder: user.Payment.cardHolder || '',
                expiryDate: user.Payment.expiryDate || '',
                paymentType: user.Payment.paymentType || 'Credit Card'
            } : {},
            orders: user.orders || [],
            wishlist: user.wishlist || [],
            refunds: user.refunds || [],
            reviews: user.reviews || []
        };

        res.render('Account-Details', {
            title: 'Account Details',
            user: userData
        });
    } catch (error) {
        console.error('Error loading account details:', error);
        renderNotification(res, 'error', 'Failed to load account details');
    }
});

module.exports = router; 