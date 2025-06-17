// models/Gender.js
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
  logo: String,
  coverImage: String,
  heroVideo: String,
  header: String,
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Gender', genderSchema);