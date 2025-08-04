const express = require('express');
const router = express.Router();
const Brand = require('../models/Brands');
const Product = require('../models/Products');
const configuratorController = require('../controllers/Configurator');

// Render configurator page
router.get('/', configuratorController.renderConfigurator);

// Get all available watch models with their 3D models
router.get('/models', async (req, res) => {
    try {
        const brands = await Brand.find({}, 'name Model3d');
        const models = brands.map(brand => ({
            brand: brand.name,
            model3d: brand.Model3d
        }));
        
        res.json({
            success: true,
            models
        });
    } catch (error) {
        console.error('Error fetching watch models:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch watch models'
        });
    }
});

// Get specific watch model details
router.get('/models/:brandName', async (req, res) => {
    try {
        const brand = await Brand.findOne({ 
            name: { $regex: new RegExp(req.params.brandName, 'i') }
        });
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                error: 'Brand not found'
            });
        }

        const products = await Product.find({ brand: brand._id })
            .select('name price specs image');

        res.json({
            success: true,
            brand: {
                name: brand.name,
                model3d: brand.Model3d
            },
            products
        });
    } catch (error) {
        console.error('Error fetching watch model details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch watch model details'
        });
    }
});

module.exports = router; 