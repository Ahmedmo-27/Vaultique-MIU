const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    unique: true
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
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  shippingMethod: {
    type: String,
    enum: ['standard', 'fast'],
    default: 'standard'
  },
  shippingCost: {
    type: Number,
    default: 20
  },
  subtotal: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to calculate totals
CartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.total = this.subtotal + this.shippingCost;
  next();
});

// Virtual for getting populated items
CartSchema.virtual('populatedItems').get(function() {
  return this.items.map(item => ({
    ...item.toObject(),
    product: item.product
  }));
});

module.exports = mongoose.model('Cart', CartSchema);
