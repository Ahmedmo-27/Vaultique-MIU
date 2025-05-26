const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middleware/jwt');

// Import API route handlers
const brandsRouter = require('./BrandsRoutes');
const collectionsRouter = require('./CollectionsRoutes');
const usersRouter = require('./UsersRoutes');
const productsRouter = require('./ProductsRoutes');

// Read-only API Routes - Public access
router.use('/brands', brandsRouter);
router.use('/collections', collectionsRouter);
router.use('/users', usersRouter);

// Use the entire products router - it has the routes defined internally
router.use('/products', productsRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
