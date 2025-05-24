const mongoose = require('mongoose');
const Collection = require('../models/Collections');
require('dotenv').config();

const Collections = [
  {
    _id: 'CLS_1',
    name: 'Classic & Dress',
    slug: 'classic-and-dress',
    logo: 'Classic & Dress',
    coverImage: '/Assets/Images/Photos/Classic and Dress Cover Image.png',
    heroVideo: '/Assets/Videos/Patek Philippe - Golden Ellipse Ref. 5738-1R-001 Rose Gold.mp4',
    header: 'Timeless Elegance',
    description:
      'The Classic & Dress Collection embodies traditional watchmaking excellence with contemporary sophistication. Each timepiece is a testament to enduring style and meticulous craftsmanship.',
    featuredItems: [
      {
        name: 'Heritage Automatic',
        image: '/Assets/Images/Watches/Heritage Automatic.png',
        tagline: 'Traditional craftsmanship meets modern precision',
        description:
          'The Heritage Automatic combines classic design elements with modern mechanical innovation, creating a timepiece that bridges past and present.',
      },
      {
        name: 'Elegance Date',
        image: '/Ahmed/Collections/Classic/Elegance Date.png',
        tagline: 'Sophisticated simplicity',
        description:
          'With its clean lines and refined aesthetics, the Elegance Date represents the essence of classic watchmaking with a modern touch.',
      },
      {
        name: 'Master Moonphase',
        image: '/Ahmed/Collections/Classic/Master Moonphase.png',
        tagline: 'Celestial precision',
        description:
          'The Master Moonphase combines traditional moon phase indication with modern mechanical engineering, creating a timepiece of exceptional beauty and complexity.',
      },
    ],
  },
  {
    _id: 'CAS_1',
    name: 'Casual & Everyday',
    slug: 'casual-and-everyday',
    logo: 'Casual & Everyday',
    coverImage: '/Assets/Images/Photos/Casual and Everyday Cover Image.avif',
    heroVideo:
      '/Assets/Videos/Bvlgari Octo Finissimo The Ultimate Swiss Made Luxury Watch for Men - Art Of Time.mp4',
    header: 'Effortless Style',
    description:
      'The Casual & Everyday Collection offers versatile timepieces designed for daily wear. These watches combine comfort, durability, and style for the modern lifestyle.',
    featuredItems: [
      {
        name: 'Urban Chronograph',
        image: '/Ahmed/Collections/Casual/Urban Chronograph.png',
        tagline: 'Perfect for the city life',
        description:
          'The Urban Chronograph features a sleek design with practical chronograph functions, making it ideal for everyday wear.',
      },
      {
        name: 'Weekend Automatic',
        image: '/Ahmed/Collections/Casual/Weekend Automatic.png',
        tagline: 'Relaxed sophistication',
        description:
          'The Weekend Automatic combines casual elegance with mechanical precision, perfect for both work and leisure.',
      },
      {
        name: 'Modern Classic',
        image: '/Ahmed/Collections/Casual/Modern Classic.png',
        tagline: 'Contemporary comfort',
        description:
          'The Modern Classic offers a fresh take on traditional watchmaking, with a focus on comfort and versatility.',
      },
    ],
  },
  {
    _id: 'SPR_1',
    name: 'Sports & Adventure',
    slug: 'sports-and-adventure',
    logo: 'Sports & Adventure',
    coverImage: '/Assets/Images/Photos/Sports and Adventure.avif',
    heroVideo: '/Assets/Videos/Rolex Submariner - The divers’ watch.webm',
    header: 'Performance Meets Precision',
    description:
      'Our Sports & Adventure Collection represents the perfect fusion of athletic performance and horological precision. These timepieces are designed for those who demand both functionality and style in their active lifestyle.',
    featuredItems: [
      {
        name: 'Chronograph Master',
        image: '/Ahmed/Collections/Sport/Chronograph Master.png',
        tagline: 'Precision timing for every sport',
        description:
          'The Chronograph Master combines advanced timing functions with a robust design, making it the perfect companion for any sporting activity.',
      },
      {
        name: 'Diver Pro',
        image: '/Ahmed/Collections/Sport/Diver Pro.png',
        tagline: 'Professional diving excellence',
        description:
          'Built to withstand extreme underwater conditions, the Diver Pro is certified for professional diving with its impressive water resistance and luminous display.',
      },
      {
        name: 'Racing Elite',
        image: '/Ahmed/Collections/Sport/Racing Elite.png',
        tagline: 'Speed and precision in perfect harmony',
        description:
          'The Racing Elite features a tachymeter scale and high-precision chronograph functions, designed specifically for motorsport enthusiasts.',
      },
    ],
  },
  {
    _id: 'AVI_1',
    name: 'Aviation & Travel',
    slug: 'aviation-and-travel',
    logo: 'Aviation & Travel',
    coverImage: '/Assets/Images/Photos/Aviation and Travel Cover Image.webp',
    heroVideo: '/Assets/Videos/Breitling Navitimer GMT & Automatic 41.mp4',
    header: 'Navigating Time and Space',
    description:
      'The Aviation & Travel Collection celebrates the spirit of exploration and precision navigation. These timepieces combine sophisticated complications with practical features for the modern traveler.',
    featuredItems: [
      {
        name: 'GMT Master II',
        image: '/Assets/Images/Watches/Rolex GMT-Master II.webp',
        tagline: 'Global time at a glance',
        description:
          'The World Timer Elite features a sophisticated world time mechanism, allowing you to track multiple time zones simultaneously.',
      },
      {
        name: 'GMT Master',
        image: '/Ahmed/Collections/Aviation/GMT Master.png',
        tagline: 'Precision navigation',
        description:
          'The GMT Master combines a dual time zone function with aviation-inspired design elements, perfect for frequent travelers.',
      },
      {
        name: 'Pilot Chronograph',
        image: '/Ahmed/Collections/Aviation/Pilot Chronograph.png',
        tagline: 'Aviation heritage',
        description:
          'The Pilot Chronograph draws inspiration from classic aviation timepieces, featuring a chronograph function and clear, legible dial.',
      },
    ],
  },
  {
    _id: 'LUX_1',
    name: 'Luxury & Heritage',
    slug: 'luxury-and-heritage',
    logo: 'Luxury & Heritage',
    coverImage: '/Assets/Images/Photos/Luxury and Heritage Cover Image.jpg',
    heroVideo: '/Assets/Videos/Jacob&C0. Billionaire III Diamonds & Rubies.mp4',
    header: 'Unparalleled Excellence',
    description:
      'The Luxury & Heritage Collection represents the pinnacle of watchmaking artistry, featuring exceptional materials, intricate complications, and unparalleled attention to detail.',
    featuredItems: [
      {
        name: 'Grand Complication',
        image: '/Ahmed/Collections/Luxury/Grand Complication.png',
        tagline: 'The art of complexity',
        description:
          'The Grand Complication combines multiple high-end complications in a single masterpiece, showcasing the highest level of watchmaking expertise.',
      },
      {
        name: 'Royal Tourbillon',
        image: '/Ahmed/Collections/Luxury/Royal Tourbillon.png',
        tagline: 'Mechanical poetry in motion',
        description:
          'The Royal Tourbillon features a mesmerizing tourbillon mechanism, visible through the dial, demonstrating the perfect balance of technical mastery and aesthetic beauty.',
      },
      {
        name: 'Diamond Masterpiece',
        image: '/Ahmed/Collections/Luxury/Diamond Masterpiece.png',
        tagline: 'Brilliance in every detail',
        description:
          'The Diamond Masterpiece combines exceptional gem-setting techniques with mechanical excellence, creating a timepiece of extraordinary beauty and precision.',
      },
    ],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing collections
    await Collection.deleteMany({});
    console.log('Cleared existing collections');

    // Insert new collections
    await Collection.insertMany(Collections);
    console.log('Successfully seeded collections database');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
