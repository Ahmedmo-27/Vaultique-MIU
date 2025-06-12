const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/Products');
const { isAuthenticated } = require('../middleware/auth');

// Helper function to get cart from session or create new one
const getCart = (req) => {
    if (!req.session.cart) {
        req.session.cart = {
            items: [],
            shippingMethod: 'standard',
            subtotal: 0,
            shippingCost: 20,
            total: 20
        };
    }
    return req.session.cart;
};

// Helper function to calculate totals
const calculateTotals = (cart) => {
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.shippingCost = cart.shippingMethod === 'fast' ? 50 : 20;
    cart.total = cart.subtotal + cart.shippingCost;
};

// Helper function to sync cart with database
const syncCartWithDB = async (req, cart) => {
    if (req.isAuthenticated()) {
        try {
            await Cart.findOneAndUpdate(
                { userId: req.user._id },
                {
                    items: cart.items,
                    shippingMethod: cart.shippingMethod,
                    subtotal: cart.subtotal,
                    shippingCost: cart.shippingCost,
                    total: cart.total
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error syncing cart with database:', error);
        }
    }
};

// GET /cart - View cart
router.get('/', async (req, res) => {
    try {
        // Get cart from session
        const sessionCart = getCart(req);
        
        // If user is authenticated, sync with database
        if (req.isAuthenticated()) {
            const dbCart = await Cart.findOne({ userId: req.user._id })
                .populate({
                    path: 'items.product',
                    model: 'Product',
                    select: '_id name price image'
                });
            if (dbCart) {
                // Update session cart with database cart
                sessionCart.items = dbCart.items.map(item => ({
                    product: item.product._id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: item.quantity
                }));
                sessionCart.shippingMethod = dbCart.shippingMethod;
                sessionCart.subtotal = dbCart.subtotal;
                sessionCart.shippingCost = dbCart.shippingCost;
                sessionCart.total = dbCart.total;
            }
        }

        // Calculate totals
        calculateTotals(sessionCart);

        // Render cart view with data
        res.render('cart', {
            cartItems: sessionCart.items || [],
            shippingMethod: sessionCart.shippingMethod || 'standard',
            subtotal: sessionCart.subtotal || 0,
            shippingCost: sessionCart.shippingCost || 20,
            total: sessionCart.total || 20
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.render('cart', {
            cartItems: [],
            shippingMethod: 'standard',
            subtotal: 0,
            shippingCost: 20,
            total: 20,
            error: 'Error loading cart'
        });
    }
});

// POST /cart/add - Add item to cart
router.post('/add', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const cart = getCart(req);

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if item already exists in cart
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: product._id,  // Store the product reference
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        // Calculate totals
        calculateTotals(cart);

        // Sync with database if authenticated
        await syncCartWithDB(req, cart);

        res.json({ success: true, message: 'Item added to cart', cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, message: 'Error adding to cart' });
    }
});

// POST /cart/remove - Remove item from cart
router.post('/remove', async (req, res) => {
    try {
        const { productId } = req.body;
        const cart = getCart(req);

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        calculateTotals(cart);

        // Sync with database if authenticated
        await syncCartWithDB(req, cart);

        res.json({ success: true, message: 'Item removed from cart', cart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, message: 'Error removing from cart' });
    }
});

// POST /cart/update-quantity - Update item quantity
router.post('/update-quantity', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = getCart(req);

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            calculateTotals(cart);

            // Sync with database if authenticated
            await syncCartWithDB(req, cart);

            res.json({ success: true, message: 'Quantity updated', cart });
        } else {
            res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ success: false, message: 'Error updating quantity' });
    }
});

// POST /cart/update-shipping - Update shipping method
router.post('/update-shipping', async (req, res) => {
    try {
        const { shippingMethod } = req.body;
        const cart = getCart(req);

        if (!['standard', 'fast'].includes(shippingMethod)) {
            return res.status(400).json({ success: false, message: 'Invalid shipping method' });
        }

        cart.shippingMethod = shippingMethod;
        calculateTotals(cart);

        // Sync with database if authenticated
        await syncCartWithDB(req, cart);

        res.json({ success: true, message: 'Shipping method updated', cart });
    } catch (error) {
        console.error('Error updating shipping:', error);
        res.status(500).json({ success: false, message: 'Error updating shipping method' });
    }
});

// POST /cart/clear - Clear cart
router.post('/clear', async (req, res) => {
    try {
        const cart = getCart(req);
        cart.items = [];
        calculateTotals(cart);

        // Sync with database if authenticated
        await syncCartWithDB(req, cart);

        res.json({ success: true, message: 'Cart cleared', cart });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ success: false, message: 'Error clearing cart' });
    }
});

module.exports = router; 