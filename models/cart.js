const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    unique: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      image: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
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
});

module.exports = mongoose.model('Cart', CartSchema);
