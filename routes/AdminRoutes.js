const express = require('express');
const router = express.Router();
const adminController = require('../controllers/Admin');
const { authenticateJWT, isAdmin } = require('../middleware/jwt');
const { upload, handleMulterError } = require('../middleware/upload');

// Apply authentication and admin middleware to all admin routes
router.use(authenticateJWT);
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
router.post('/products/create', 
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'galleryImages', maxCount: 10 },
        { name: 'video', maxCount: 1 },
        { name: 'model3D', maxCount: 1 }
    ]),
    handleMulterError,
    adminController.createProduct
);
router.get('/products/:id', adminController.getProductById);
router.put('/products/:id', 
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'galleryImages', maxCount: 10 },
        { name: 'video', maxCount: 1 },
        { name: 'model3D', maxCount: 1 }
    ]),
    handleMulterError,
    adminController.updateProduct
);
router.delete('/products/:id', adminController.deleteProduct);

// Analytics routes
router.get('/analytics', adminController.renderAnalytics);

// Admin logout route
router.get('/logout', (req, res) => {
  // Clear JWT token cookie
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
  
  // Redirect to login page or home
  res.redirect('/LoginSignup');
});

module.exports = router;
