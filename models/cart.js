const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for guest carts
    unique: true,
    sparse: true // Only enforce uniqueness when userId is present
  },
  sessionId: {
    type: String,
    required: false, // Optional for authenticated users
    unique: true,
    sparse: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [99, 'Quantity cannot exceed 99']
    }
  }],
  shippingMethod: {
    type: String,
    enum: ['standard', 'fast'],
    default: 'standard'
  },
  shippingCost: {
    type: Number,
    default: 20,
    min: [0, 'Shipping cost cannot be negative']
  },
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total cannot be negative']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to calculate totals and validate
CartSchema.pre('save', async function(next) {
  try {
    // Update lastUpdated timestamp
    this.lastUpdated = new Date();

    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate shipping cost based on method
    this.shippingCost = this.shippingMethod === 'fast' ? 40 : 20;
    
    // Calculate total
    this.total = this.subtotal + this.shippingCost;

    // Validate stock availability for each item
    const Product = mongoose.model('Product');
    const productIds = [...new Set(this.items.map(item => item.product.toString()))];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const item of this.items) {
      const product = productMap.get(item.product.toString());
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }
      if (!product.stock || product.stockCount < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for getting populated items
CartSchema.virtual('populatedItems').get(function() {
  return this.items.map(item => ({
    ...item.toObject(),
    product: item.product
  }));
});

// Method to add item to cart
CartSchema.methods.addItem = async function(productId, quantity = 1) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (!product.stock || product.stockCount < quantity) {
    throw new Error('Insufficient stock');
  }

  const existingItem = this.items.find(item => item.product.toString() === productId);
  
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stockCount) {
      throw new Error('Insufficient stock for requested quantity');
    }
    existingItem.quantity = newQuantity;
  } else {
    this.items.push({
      product: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity
    });
  }

  return this.save();
};

// Method to update item quantity
CartSchema.methods.updateQuantity = async function(productId, quantity) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (!product.stock || product.stockCount < quantity) {
    throw new Error('Insufficient stock');
  }

  const item = this.items.find(item => item.product.toString() === productId);
  if (!item) {
    throw new Error('Item not found in cart');
  }

  item.quantity = Math.max(1, Math.min(quantity, product.stockCount));
  return this.save();
};

// Method to remove item from cart
CartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId);
  return this.save();
};

// Method to clear cart
CartSchema.methods.clear = function() {
  this.items = [];
  this.subtotal = 0;
  this.total = this.shippingCost;
  return this.save();
};

// Method to merge guest cart with user cart
CartSchema.statics.mergeCarts = async function(userId, guestCart) {
  const userCart = await this.findOne({ userId });
  
  if (!userCart) {
    // If user has no cart, create one from guest cart
    return this.create({
      userId,
      items: guestCart.items,
      shippingMethod: guestCart.shippingMethod,
      subtotal: guestCart.subtotal,
      shippingCost: guestCart.shippingCost,
      total: guestCart.total
    });
  }

  // Merge items from guest cart into user cart
  for (const guestItem of guestCart.items) {
    await userCart.addItem(guestItem.product, guestItem.quantity);
  }

  return userCart;
};

module.exports = mongoose.model('Cart', CartSchema);
