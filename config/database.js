const mongoose = require('mongoose');

const MAX_RETRIES = 5;
let retryCount = 0;

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log(`Connected to MongoDB at ${process.env.MONGODB_URI}`);
    retryCount = 0;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    retryCount++;

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connect, 5000);
    } else {
      console.error('Max retries reached. Could not connect to MongoDB.');
      process.exit(1);
    }
  }
};

module.exports = {
  connect,
};
