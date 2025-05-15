const express = require('express');
const router = express.Router();

// Import API route handlers
const brandsRouter = require('./BrandsRoutes');
const collectionsRouter = require('./CollectionsRoutes');
const usersRouter = require('./UsersRoutes');
const productsRouter = require('./ProductsRoutes');

// API Routes - Backend only
router.use('/brands', brandsRouter);
router.use('/collections', collectionsRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

module.exports = router; 