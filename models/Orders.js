const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest checkout
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productDetails: {
      name: { type: String, required: true },
      image: { type: String, required: true },
      brand: { type: String, required: true },
      price: { type: Number, required: true },
      strapMaterial: { type: String },
      movement: { type: String },
      waterResistance: { type: String },
      caseMaterial: { type: String },
      dialColor: { type: String },
      gender: { type: String },
      Vcollection: { type: String }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shipping: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  payment: {
    // Legacy payment fields (for backward compatibility)
    name: { type: String }, // cardholder full name
    cardNumber: { type: String }, // last 4 digits only
    bankName: { type: String },
    expiry: { type: String },
    
    // Stripe payment fields
    stripePaymentIntentId: { type: String },
    stripeCustomerId: { type: String },
    stripeChargeId: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'usd' },
    status: { type: String },
    
    // Refund information
    refundId: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    
    // Payment method information
    paymentMethodId: { type: String },
    paymentMethodType: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  total: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
