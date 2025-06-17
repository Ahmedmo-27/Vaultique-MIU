const mongoose = require('mongoose');
// In your seed script
const Gender = require('../models/Gender'); // Adjust path as needed
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Genders=[
  {
    _id: 'Him_1',
    name: 'For Him',
    slug: 'him',
    logo: 'Him',
    coverImage: '/Assets/Images/Photos/Him Cover Image.jpg',
    heroVideo: '/Assets/Videos/For both.mp4',
    header: 'Timeless Masculinity',
    description: 'The Him Collection is a celebration of masculine elegance and robust design. Each timepiece is crafted to reflect strength, sophistication, and timeless style.'
  },
  {
    _id: 'Her_1',
    name: 'For Her',
    slug: 'her',
    logo: 'Her',
    coverImage: '/Assets/Images/Photos/Her Cover Image.jpg',
    heroVideo: '/Assets/Videos/For both.mp4',
    header: 'Elegance Redefined',
    description: 'The Her Collection embodies feminine grace and exquisite craftsmanship. These timepieces are designed to complement the modern woman\'s style, offering both beauty and functionality.'
  }
];

// RENAMED FUNCTION
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await Gender.deleteMany({});
    console.log('Cleared existing Genders');

    await Gender.insertMany(Genders);
    console.log('Inserted new Genders');

    process.exit(0);

  } catch (error) {
    console.error('Error seeding gender collections:', error);
    process.exit(1);
  }
};

// Now this matches the function name
seedDatabase();