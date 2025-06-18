const mongoose = require('mongoose');
const Gender = require('../models/Gender');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Genders=[
  {
    _id: 'Him_1',
    name: 'For Him',
    slug: 'for-him',
    logo: 'Him',
    coverImage: '/Assets/Models/George-Clooney-Omega-Speedmaster-57-6.jpg',
    featuredItems: [
      {
          name: 'Datejust',
          image: '/Assets/Images/Watches/Rolex Date-Just 40.png',
          tagline: 'Make a date of a day',
          description:
            'The epitome of the classic watch by Rolex, the Datejust has spanned eras while retaining the enduring aesthetic characteristics that make it so easily recognizable. With a wide range of dials, it offers the most varied combinations in the collection.',
      },
      {
        name: 'Omega Speedmaster',
        image: '/Assets/Images/Watches/Omega Speedmaster Moonwatch Steel-On-Steel.png',
        tagline: 'The first watch on the moon',
        description:
          "The OMEGA Speedmaster is one of the world's most iconic timepieces, having been a part of all six lunar missions. The legendary chronograph was the first watch worn on the moon.",
      },
      {
        name: 'Cartier Tank',
        image: '/Assets/Images/Watches/Tank Louis Cartier.png',
        tagline: 'An icon of modern design',
        description:
          "Created in 1917, the Tank watch is one of Cartier's most distinctive designs. Its pure lines and perfect proportions make it a true icon of modern watchmaking.",
      },
      {
        name: 'Nautilus',
        image: '/Assets/Images/Watches/Patek Philippe Nautilus White Gold.png',
        tagline: 'The sports elegance watch',
        description:
          "Created in 1976, the Nautilus is Patek Philippe's iconic sports watch. Its porthole-inspired design and horizontally embossed dial make it instantly recognizable. The Nautilus combines robustness with elegance in a unique way.",
      },
      {
        name: 'Datograph',
        image: '/Assets/Images/Watches/A. Lange & Söhne Datograph Flyback Limited Edition.png',
        tagline: "The chronograph connoisseur's choice",
        description:
          'The Datograph is widely regarded as one of the finest chronographs ever made. Its flawless design and exceptional movement finishing set new standards in chronograph construction and have earned it a cult following among watch enthusiasts.',
      },
      {
        name: 'Overseas',
        image: '/Assets/Images/Watches/Overseas Vacheron.png',
        tagline: 'The spirit of travel',
        description:
          "The Overseas collection embodies Vacheron Constantin's interpretation of the luxury sports watch. With its distinctive Maltese cross-inspired bezel and interchangeable strap system, it combines elegance with functionality for the global traveler.",
      }
    ],
    heroVideo: '/Assets/Videos/Overseas  - A unique perspective on the world - Vacheron Constantin.mp4',
    header: 'Timeless Masculinity',
    description: 'The Him Collection is a celebration of masculine elegance and robust design. Each timepiece is crafted to reflect strength, sophistication, and timeless style.'
  },
  {
    _id: 'Her_1',
    name: 'For Her',
    slug: 'for-her',
    logo: 'Her',
    featuredItems: [
      {
        name: 'Panthère de Cartier',
        image: '/Assets/Images/Watches/Panthère de Cartier.png',
        tagline: 'The panther in motion',
        description:
          "The Panthère de Cartier is a luxurious women's watch with a white dial and stainless steel case. Its manual movement and square design exude sophistication. Inspired by the grace of a panther, the watch features a sleek, flexible bracelet and Roman numeral hour markers, creating a perfect balance of elegance and strength.",
      },
      {
        name: 'Vacheron Constantin Patrimony',
        image: '/Assets/Images/Watches/Patrimony.png',
        tagline: 'A timeless classic',
        description:
          "The Patrimony collection embodies the essence of elegance and sophistication. With its classic design and refined details, it has become a symbol of timeless beauty and quality.",
      },
      {
        name: 'Omega Constellation',
        image: '/Assets/Images/Watches/Omega Constellation Co-Axial Master Chronometer.png',
        tagline: 'Iconic design since 1952',
        description:
          "The Constellation has been OMEGA's symbol of precision and excellence since 1952. With its iconic claws and half-moons, the collection has evolved to become a true watchmaking icon.",
      },
      {
        name: 'Rolex Lady-Datejust',
        image: '/Assets/Images/Watches/Rolex Lady Datejust.png',
        tagline: 'A classic for the modern woman',
        description:
          'The Rolex Lady-Datejust is a refined watch designed for women, combining elegance with technical achievement. Its white gold case and automatic movement exude sophistication and functionality. The diamond-set bezel adds a touch of luxury, while the President bracelet ensures comfortable wear throughout the day.',
      },
      {
        name: 'Audemars Piguet Offshore',
        image: '/Assets/Images/Watches/Audemars Piguet Royal Oak Offshore.png',
        tagline: 'The original luxury sports watch',
        description:
          "The Audemars Piguet Royal Oak Offshore is a bold luxury watch with a blue dial and rose gold case. Its automatic movement and rubber strap ensure durability and style. The larger case size and distinctive 'Méga Tapisserie' dial pattern create a sporty yet elegant aesthetic that stands out in any setting.",
      }
    ],
    coverImage: '/Assets/Models/classic-watches-datejust-witness-to-a-special-day-lara-gut-behrami-lgut21tl-009.avif',
    heroVideo: '/Assets/Videos/Rolex Lady-Datejust – Smaller case, same ambition.mp4',
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