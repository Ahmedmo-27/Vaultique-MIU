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
router.get('/users/:id', adminController.getUserById);
router.get('/users/:id/orders', adminController.getUserOrders);
router.post('/users/add', adminController.addUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Product management routes
router.get('/products', adminController.renderProducts);
router.get('/products/create', adminController.renderCreateProduct);
router.post('/products/create', adminController.createProduct);

// Analytics routes
router.get('/analytics', adminController.renderAnalytics);

module.exports = router;
