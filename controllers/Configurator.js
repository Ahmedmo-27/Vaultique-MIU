const Brand = require('../models/Brands');
const Product = require('../models/Products');

// Render the configurator page
exports.renderConfigurator = async (req, res) => {
    try {
        // Get all brands with their 3D models
        const brands = await Brand.find({}, 'name Model3d');
        
        // Validate and process brands
        const brandsList = brands.map(brand => ({
            ...brand.toObject(),
            Model3d: brand.Model3d || '/Assets/3D Models/Omega Sea Master.glb' // Provide default model if none exists
        }));

        // Get default watch specs
        const defaultWatch = {
            name: 'Submariner',
            specs: {
                movement: '3235 Calibre',
                waterResistance: '300m Water Resistant',
                powerReserve: '70h Power Reserve'
            },
            basePrice: 10000,
            warranty: '5-year warranty'
        };

        res.render('Configure-Page', {
            brands: brandsList,
            watch: defaultWatch,
            title: 'Vaultique | Configurator',
            locals: {
                watch: defaultWatch
            }
        });
    } catch (error) {
        console.error('Error rendering configurator:', error);
        res.status(500).render('error', {
            message: 'Failed to load configurator page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

// Get watch model details
exports.getWatchModel = async (req, res) => {
    try {
        const { brandName } = req.params;
        
        const brand = await Brand.findOne({ 
            name: { $regex: new RegExp(brandName, 'i') }
        });
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                error: 'Brand not found'
            });
        }

        const products = await Product.find({ brand: brand._id })
            .select('name price specs image movement waterResistance caseMaterial dialColor');

        res.json({
            success: true,
            brand: {
                name: brand.name,
                model3d: brand.Model3d || '/Assets/3D Models/Omega Sea Master.glb'
            },
            products
        });
    } catch (error) {
        console.error('Error fetching watch model:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch watch model'
        });
    }
}; 