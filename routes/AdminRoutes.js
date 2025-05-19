const express = require('express');
const router = express.Router();
const adminController = require('../controllers/Admin');
const { isAdmin } = require('../middleware/auth');

// Apply admin middleware to all routes
router.use(isAdmin);

// Admin dashboard
router.get('/dashboard', adminController.renderDashboard);

// User management routes
router.get('/users', adminController.renderUsers);
router.get('/users/:id', adminController.renderUsers);
router.get('/users/:id/orders', adminController.renderUsers);

// Product management routes
router.get('/products', adminController.renderProducts);
router.get('/products/create', adminController.renderCreateProduct);
router.post('/products/create', adminController.createProduct);
// Analytics routes
router.get('/analytics', adminController.renderAnalytics);

module.exports = router;
