const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/Products');
const { isAuthenticated } = require('../middleware/auth');

// Helper function to get cart from session or create new one
const getCart = (req) => {
    if (!req.session.cart) {
        console.log('Creating new cart');
        req.session.cart = {
            items: [],
            shippingMethod: 'standard',
            subtotal: 0,
            shippingCost: 20,
            total: 20,
            lastUpdated: new Date()
        };
    }
    return req.session.cart;
};

// Helper function to validate cart state
const validateCartState = (cart) => {
    const errors = [];
    
    if (!cart) {
        errors.push('Cart is not initialized');
        return { isValid: false, errors };
    }

    if (!Array.isArray(cart.items)) {
        errors.push('Cart items is not an array');
        return { isValid: false, errors };
    }

    if (cart.items.length === 0) {
        errors.push('Cart is empty');
        return { isValid: false, errors, isEmpty: true };
    }

    // Validate each item in the cart
    cart.items.forEach((item, index) => {
        if (!item.product && !item.productId) {
            errors.push(`Item at index ${index} is missing product ID`);
        }
        if (!item.quantity || item.quantity < 1) {
            errors.push(`Item at index ${index} has invalid quantity`);
        }
        if (!item.price || item.price < 0) {
            errors.push(`Item at index ${index} has invalid price`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        isEmpty: cart.items.length === 0
    };
};

// Helper function to calculate totals
const calculateTotals = (cart) => {
    console.log('Calculating totals for cart');
    console.log('Cart items before calculation:', cart.items);

    // Ensure items is an array
    if (!Array.isArray(cart.items)) {
        console.log('Cart items is not an array, initializing empty array');
        cart.items = [];
    }

    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        console.log(`Item ${item.name}: ${item.quantity} x $${item.price} = $${itemTotal}`);
        return sum + itemTotal;
    }, 0);

    // Calculate shipping cost
    cart.shippingCost = cart.shippingMethod === 'fast' ? 40 : 20;
    
    // Calculate total
    cart.total = cart.subtotal + cart.shippingCost;
    
    // Update last modified timestamp
    cart.lastUpdated = new Date();

    console.log('Cart totals calculated:', {
        subtotal: cart.subtotal,
        shippingCost: cart.shippingCost,
        total: cart.total
    });
};

// Helper function to sync cart with database
const syncCartWithDB = async (req, cart) => {
    if (req.session.user) {
        try {
            let userCart = await Cart.findOne({ user: req.session.user._id });
            
            if (!userCart) {
                userCart = new Cart({
                    user: req.session.user._id,
                    items: cart.items,
                    shippingMethod: cart.shippingMethod,
                    subtotal: cart.subtotal,
                    shippingCost: cart.shippingCost,
                    total: cart.total,
                    lastUpdated: new Date()
                });
            } else {
                userCart.items = cart.items;
                userCart.shippingMethod = cart.shippingMethod;
                userCart.subtotal = cart.subtotal;
                userCart.shippingCost = cart.shippingCost;
                userCart.total = cart.total;
                userCart.lastUpdated = new Date();
            }
            
            await userCart.save();
        } catch (error) {
            console.error('Error syncing cart with database:', error);
            throw new Error('Failed to sync cart with database');
        }
    }
};

// GET /cart - View cart
router.get('/', async (req, res) => {
    try {
        // Always get the latest cart from session
        const cart = req.session.cart || {
            items: [],
            shippingMethod: 'standard',
            subtotal: 0,
            shippingCost: 20,
            total: 20,
            lastUpdated: new Date()
        };

        // Recalculate totals in case anything changed
        calculateTotals(cart);

        // Save back to session to ensure it's up to date
        req.session.cart = cart;

        // If user is authenticated, sync with database
        if (req.session.user) {
            try {
                await syncCartWithDB(req);
            } catch (syncError) {
                console.error('Error syncing cart with DB:', syncError);
                // Continue with session cart even if sync fails
            }
        }

        res.render('cart', {
            cart,
            isEmpty: cart.items.length === 0,
            errors: []
        });
    } catch (error) {
        console.error('Error viewing cart:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading your cart.',
            error: error.message
        });
    }
});

// POST /cart/add - Add item to cart
router.post('/add', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required',
                code: 'MISSING_PRODUCT_ID'
            });
        }

        // Get or initialize cart
        const cart = req.session.cart || {
            items: [],
            shippingMethod: 'standard',
            subtotal: 0,
            shippingCost: 20,
            total: 20,
            lastUpdated: new Date()
        };

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                error: 'Not enough stock available',
                code: 'INSUFFICIENT_STOCK',
                available: product.stock
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => 
            (item.product === productId) || (item.productId === productId)
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            // Check if new total quantity exceeds stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    error: 'Not enough stock available',
                    code: 'INSUFFICIENT_STOCK',
                    available: product.stock
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image || '/images/default-product.jpg'
            });
        }

        // Update cart totals
        calculateTotals(cart);
        
        // Update last modified timestamp
        cart.lastUpdated = new Date();

        // Save to session
        req.session.cart = cart;

        // Sync with database if user is authenticated
        if (req.session.user) {
            try {
                await syncCartWithDB(req);
            } catch (syncError) {
                console.error('Error syncing cart with DB:', syncError);
                // Continue with session cart even if sync fails
            }
        }

        res.json({
            success: true,
            message: 'Item added to cart',
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                shippingCost: cart.shippingCost,
                total: cart.total
            }
        });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add item to cart',
            code: 'SERVER_ERROR'
        });
    }
});

// POST /cart/update-quantity - Update item quantity
router.post('/update-quantity', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        if (!productId || !quantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'Both Product ID and quantity are required to update the cart.',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1.',
                code: 'INVALID_QUANTITY'
            });
        }

        const cart = getCart(req);
        const validation = validateCartState(cart);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart state',
                code: 'INVALID_CART_STATE',
                details: validation.errors,
                isEmpty: validation.isEmpty
            });
        }

        // Find item using either product or productId
        const itemIndex = cart.items.findIndex(item => 
            (item.product && item.product.toString() === productId) || 
            (item.productId && item.productId.toString() === productId)
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'The item you are trying to update is not in your cart.',
                code: 'ITEM_NOT_FOUND',
                isEmpty: validation.isEmpty
            });
        }

        // Validate quantity against product stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'The product you are trying to update is no longer available.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        if (!product.stock) {
            return res.status(400).json({ 
                success: false, 
                message: 'This product is currently out of stock.',
                code: 'OUT_OF_STOCK'
            });
        }

        if (product.stockCount < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `Only ${product.stockCount} items available in stock.`,
                code: 'INSUFFICIENT_STOCK',
                availableStock: product.stockCount
            });
        }

        cart.items[itemIndex].quantity = Math.max(1, Math.min(quantity, product.stockCount));
        calculateTotals(cart);

        // Sync with database if authenticated
        await syncCartWithDB(req, cart);

        // Save cart to session
        req.session.cart = cart;

        res.json({ 
            success: true, 
            message: 'Cart quantity updated successfully.', 
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                shippingCost: cart.shippingCost,
                total: cart.total,
                shippingMethod: cart.shippingMethod,
                lastUpdated: cart.lastUpdated
            },
            isEmpty: false
        });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An unexpected error occurred while updating your cart. Please try again.',
            code: 'SERVER_ERROR',
            details: error.message
        });
    }
});

// POST /cart/remove - Remove item from cart
router.post('/remove', async (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product ID is required to remove an item from cart.',
                code: 'MISSING_PRODUCT_ID'
            });
        }

        const cart = getCart(req);

        // Check if item exists in cart
        const itemExists = cart.items.some(item => 
            (item.product && item.product.toString() === productId) || 
            (item.productId && item.productId.toString() === productId)
        );

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: 'The item you are trying to remove is not in your cart.',
                code: 'ITEM_NOT_FOUND'
            });
        }

        // Remove item using either product or productId
        cart.items = cart.items.filter(item => 
            (item.product && item.product.toString() !== productId) && 
            (item.productId && item.productId.toString() !== productId)
        );

        calculateTotals(cart);

        // Sync with database if authenticated
        await syncCartWithDB(req, cart);

        // Save cart to session
        req.session.cart = cart;

        res.json({ 
            success: true, 
            message: 'Item removed from cart successfully.', 
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                shippingCost: cart.shippingCost,
                total: cart.total,
                shippingMethod: cart.shippingMethod,
                lastUpdated: cart.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An unexpected error occurred while removing from cart. Please try again.',
            code: 'SERVER_ERROR'
        });
    }
});

// POST /cart/update-shipping - Update shipping method
router.post('/update-shipping', async (req, res) => {
    try {
        const { shippingMethod } = req.body;
        
        if (!shippingMethod) {
            return res.status(400).json({ 
                success: false, 
                message: 'Shipping method is required to update the cart.',
                code: 'MISSING_SHIPPING_METHOD'
            });
        }

        const cart = getCart(req);

        if (!['standard', 'fast'].includes(shippingMethod)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid shipping method. Please select either standard or fast shipping.',
                code: 'INVALID_SHIPPING_METHOD'
            });
        }

        cart.shippingMethod = shippingMethod;
        calculateTotals(cart);

        // Sync with database if authenticated
        await syncCartWithDB(req, cart);

        // Save cart to session
        req.session.cart = cart;

        res.json({ 
            success: true, 
            message: 'Shipping method updated successfully.', 
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                shippingCost: cart.shippingCost,
                total: cart.total,
                shippingMethod: cart.shippingMethod,
                lastUpdated: cart.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error updating shipping:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An unexpected error occurred while updating the shipping method. Please try again.',
            code: 'SERVER_ERROR'
        });
    }
});

// POST /cart/clear - Clear cart
router.post('/clear', async (req, res) => {
    try {
        const cart = getCart(req);
        
        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is already empty.',
                code: 'CART_ALREADY_EMPTY'
            });
        }

        cart.items = [];
        calculateTotals(cart);

        // Sync with database if authenticated
        await syncCartWithDB(req, cart);

        // Save cart to session
        req.session.cart = cart;

        res.json({ 
            success: true, 
            message: 'Cart cleared successfully.', 
            cart: {
                items: cart.items,
                subtotal: cart.subtotal,
                shippingCost: cart.shippingCost,
                total: cart.total,
                shippingMethod: cart.shippingMethod,
                lastUpdated: cart.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An unexpected error occurred while clearing your cart. Please try again.',
            code: 'SERVER_ERROR'
        });
    }
});

module.exports = router; 