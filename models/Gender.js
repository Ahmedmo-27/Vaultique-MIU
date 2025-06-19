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
  featuredItems: [
    {
      name: { type: String, required: true },
      image: { type: String, required: true },
      tagline: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  logo:{ type: String, required: true },
  coverImage:{ type: String, required: true },
  heroVideo:{ type: String, required: true },
  description:{type: String, required: true},
  header:{type: String, required: true},
}, 
{
  timestamps: true
});

// Index for faster queries
genderSchema.index({ active: 1 });

const Gender = mongoose.model('Gender', genderSchema);

module.exports = Gender;