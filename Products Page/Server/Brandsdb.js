const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  coverImage: { type: String, required: true },
  heroVideo: { type: String },
  header: { type: String, required: true },
  description: { type: String, required: true },
  featuredModels: [
    {
      name: { type: String, required: true },
      image: { type: String, required: true },
      tagline: { type: String, required: true },
      description: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Brand', brandSchema);