const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middleware/jwt');
const { sendWatchConfigurationEmail } = require('../utils/emailService');

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
// Only handle requests that explicitly want JSON
router.use('/products', (req, res, next) => {
  // Only handle requests at /api/products
  if (req.originalUrl.startsWith('/api/products')) {
    productsRouter(req, res, next);
  } else {
    next();
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Share watch configuration
router.post('/share-configuration', async (req, res) => {
    try {
        const { name, email, message, configuration } = req.body;

        // Validate required fields
        if (!name || !email || !configuration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Send configuration email
        await sendWatchConfigurationEmail({ Name: name, email }, configuration);

        res.status(200).json({ message: 'Configuration shared successfully' });
    } catch (error) {
        console.error('Error sharing configuration:', error);
        res.status(500).json({ error: 'Failed to share configuration' });
    }
});

module.exports = router;
