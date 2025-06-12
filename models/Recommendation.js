const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  scoreRange: {
    type: [Number], // Array with exactly two numbers: [minScore, maxScore]
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 2 && arr[0] <= arr[1];
      },
      message: 'scoreRange must be an array of two numbers [minScore, maxScore]',
    },
  },
  recommendation: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Recommendation = mongoose.model('Recommendation', RecommendationSchema);

module.exports = Recommendation;
