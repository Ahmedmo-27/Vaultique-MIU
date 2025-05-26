////////// main/models/Orders.js

/*const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  total: { type: Number, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }]
});

module.exports = mongoose.model('Order', orderSchema);*/

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shipping: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipcode: { type: String },
  },
  payment: {
    name: { type: String, required: true }, // cardholder full name
    card_number: { type: String, required: true },
    bank_name: { type: String },
    expiry: { type: String, required: true },
    cvv: { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
