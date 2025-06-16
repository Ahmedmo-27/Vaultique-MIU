const mongoose = require('mongoose');
const genderSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  heroVideo: {
    type: String,
    required: true
  },
  header: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  featuredProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Gender', genderSchema);