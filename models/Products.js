const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, ref: 'Brand', required: true },
  strapMaterial: { type: String, required: true },
  movement: { type: String, required: true },
  waterResistance: { type: String, required: true },
  caseMaterial: { type: String, required: true },
  dialColor: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 0 },
  Vcollection: { type: String, required: true },
  gender: { type: String, required: true },

  // Media fields
  image: { type: String, required: true },
  galleryImages: [String],
  video: { type: String },
  model3D: { type: String },

  description: { type: String },
  specialFeatures: [
    {
      featureName: { type: String },
      featureDesc: { type: String },
    },
  ],
  specifications: [
    {
      specName: { type: String },
      specValue: { type: String },
    },
  ],

  // Metrics
  popularityScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);