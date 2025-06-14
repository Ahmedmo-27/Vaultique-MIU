const express = require('express');
const router = express.Router();
const adminController = require('../controllers/Admin');
const { authenticateJWT, isAdmin } = require('../middleware/jwt');
const { upload, handleMulterError } = require('../middleware/upload');
const multer = require('multer');
const path = require('path');

// Apply authentication and admin middleware to all admin routes
router.use(authenticateJWT);
router.use(isAdmin);

// Admin dashboard
router.get('/dashboard', adminController.renderDashboard);
router.get('/api/dashboard', adminController.getDashboard);

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

// Manage Store dashboard
router.get('/managestore', adminController.renderManageStore);

// Configure multer for file uploads
const collectionsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/Assets');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const collectionsUpload = multer({ 
  storage: collectionsStorage,
  fileFilter: function (req, file, cb) {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'), false);
    }
  }
});

// Collection routes
router.get('/collections', adminController.renderCollections);
router.get('/collections/create', adminController.renderCreateCollection);
router.post('/collections', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'heroVideo', maxCount: 1 },
    { name: 'featuredItems[0][image]', maxCount: 1 },
    { name: 'featuredItems[1][image]', maxCount: 1 },
    { name: 'featuredItems[2][image]', maxCount: 1 }
]), adminController.createCollection);
router.get('/collections/:id', adminController.getCollection);
router.get('/collections/:id/edit', adminController.renderEditCollection);
router.post('/collections/:id', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'heroVideo', maxCount: 1 },
    { name: 'featuredItems[0][image]', maxCount: 1 },
    { name: 'featuredItems[1][image]', maxCount: 1 },
    { name: 'featuredItems[2][image]', maxCount: 1 }
]), adminController.updateCollection);
router.delete('/collections/:id', adminController.deleteCollection);

// Todo routes
router.post('/api/todos', adminController.addTodo);
router.delete('/api/todos/:id', adminController.removeTodo);
router.patch('/api/todos/:id/toggle', adminController.toggleTodo);

// Brand routes
router.get('/brands', isAdmin, adminController.renderBrands);
router.get('/brands/create', isAdmin, adminController.renderCreateBrand);
router.post('/brands', isAdmin, upload.fields([
    { name: 'logo', maxCount: 1 }
]), adminController.createBrand);
router.get('/brands/:id', isAdmin, adminController.getBrand);
router.get('/brands/:id/edit', isAdmin, adminController.renderEditBrand);
router.post('/brands/:id', isAdmin, upload.fields([
    { name: 'logo', maxCount: 1 }
]), adminController.updateBrand);
router.delete('/brands/:id', isAdmin, adminController.deleteBrand);

// Order routes
router.get('/orders', isAdmin, adminController.renderOrders);
router.get('/orders/:id', isAdmin, adminController.getOrder);
router.patch('/orders/:id/status', isAdmin, adminController.updateOrderStatus);
router.delete('/orders/:id', isAdmin, adminController.deleteOrder);

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
  res.redirect('/user/home');
});

module.exports = router;
