const mongoose = require('mongoose');
const Gender = require('../models/Gender');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const forHimData = {
  _id: 'Him_1',
  name: 'For Him',
  slug: 'him',
  logo: 'Him',
  coverImage: '/Assets/Images/Photos/Him Cover Image.jpg',
  heroVideo: '/Assets/Videos/For both.mp4',
  header: 'Timeless Masculinity',
  description: 'The Him Collection is a celebration of masculine elegance and robust design. Each timepiece is crafted to reflect strength, sophistication, and timeless style.'
};

const forHerData = {
  _id: 'Her_1',
  name: 'For Her',
  slug: 'her',
  logo: 'Her',
  coverImage: '/Assets/Images/Photos/Her Cover Image.jpg',
  heroVideo: '/Assets/Videos/For both.mp4',
  header: 'Elegance Redefined',
  description: 'The Her Collection embodies feminine grace and exquisite craftsmanship. These timepieces are designed to complement the modern woman\'s style, offering both beauty and functionality.'
};

// RENAMED FUNCTION
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing genders if needed (optional)
    // await Gender.deleteMany({});
    // console.log('Cleared existing gender collections');

    // Seed For Him
    let himGender = await Gender.findOne({ _id: 'Him_1' });
    if (himGender) {
      console.log('For Him collection already exists. Updating...');
      await Gender.updateOne({ _id: 'Him_1' }, forHimData);
    } else {
      himGender = await Gender.create(forHimData);
      console.log('Created new For Him collection');
    }

    // Seed For Her
    let herGender = await Gender.findOne({ _id: 'Her_1' });
    if (herGender) {
      console.log('For Her collection already exists. Updating...');
      await Gender.updateOne({ _id: 'Her_1' }, forHerData);
    } else {
      herGender = await Gender.create(forHerData);
      console.log('Created new For Her collection');
    }

    // Find featured products for both genders
    const [maleProducts, femaleProducts] = await Promise.all([
      Product.find({ gender: 'Male', featured: true }).limit(5),
      Product.find({ gender: 'Female', featured: true }).limit(5)
    ]);

    // Update both genders with featured products
    await Promise.all([
      Gender.updateOne(
        { _id: 'Him_1' },
        { $set: { featuredProducts: maleProducts.map(p => p._id) } }
      ),
      Gender.updateOne(
        { _id: 'Her_1' },
        { $set: { featuredProducts: femaleProducts.map(p => p._id) } }
      )
    ]);

    console.log('Successfully seeded both gender collections with featured products');
  } catch (error) {
    console.error('Error seeding gender collections:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

// Now this matches the function name
seedDatabase();