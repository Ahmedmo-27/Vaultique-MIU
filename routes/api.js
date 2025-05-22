const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Import API route handlers
const brandsRouter = require('./BrandsRoutes');
const collectionsRouter = require('./CollectionsRoutes');
const usersRouter = require('./UsersRoutes');
const productsRouter = require('./ProductsRoutes');

// Read-only API Routes - Public access
router.use('/brands', brandsRouter);
router.use('/collections', collectionsRouter);
router.use('/users', usersRouter);

// Product routes - split between public and protected
// Public product routes
const publicProductsRouter = express.Router();
publicProductsRouter.get('/', productsRouter.route('/').get);
publicProductsRouter.get('/:id', productsRouter.route('/:id').get);
publicProductsRouter.get('/name/:name', productsRouter.route('/name/:name').get);

// Protected product routes (require authentication)
const protectedProductsRouter = express.Router();
protectedProductsRouter.use(isAuthenticated);
protectedProductsRouter.post('/', productsRouter.route('/').post);
protectedProductsRouter.put('/:id', productsRouter.route('/:id').put);
protectedProductsRouter.delete('/:id', productsRouter.route('/:id').delete);

// Combine product routers
router.use('/products', publicProductsRouter);
router.use('/products', protectedProductsRouter);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

module.exports = router; 