const mongoose = require('mongoose');
const Brand = require('../models/Brands');
require('dotenv').config();

const Brands = [
  {
    _id: 'ROL_1',
    name: 'Rolex',
    slug: 'rolex',
    logo: 'Rolex',
    coverImage: '/Assets/Images/photos/Rolex Cover Image2.jpg',
    coverImage2: '/Assets/Images/photos/Rolex Cover Image.avif',
    heroVideo: '/Assets/Videos/The Rolex Watch Collection - Rolex®.mp4',
    header: 'Swiss Watchmaking Excellence',
    description:
      'Rolex epitomizes the pinnacle of Swiss watchmaking, offering timeless creations such as the iconic Day-Date, the legendary Submariner, and the distinguished Datejust. Each timepiece is a testament to excellence, meticulously crafted for those who demand nothing but the finest.',
    featuredModels: [
      {
        name: 'Datejust',
        image: '/Assets/Images/Watches/Rolex Date-Just 40.png',
        tagline: 'Make a date of a day',
        description:
          'The epitome of the classic watch by Rolex, the Datejust has spanned eras while retaining the enduring aesthetic characteristics that make it so easily recognizable. With a wide range of dials, it offers the most varied combinations in the collection.',
      },
      {
        name: 'Submariner',
        image: '/Assets/Images/Watches/Rolex Submariner.png',
        tagline: "The reference among divers' watches",
        description:
          "The Submariner's design has been entirely in keeping with its function. Its 41 mm case, waterproof to a depth of 300 metres (1,000 feet), provides the perfect housing for a movement of the highest precision and is crowned with a unidirectional rotatable bezel with a Cerachrom insert that helps divers monitor their underwater time.",
      },
      {
        name: '1908',
        image: '/Assets/Images/Watches/Rolex 1908.png',
        tagline: 'A tribute to heritage',
        description:
          "The 1908 collection pays homage to Rolex's rich heritage with its classically elegant design. Featuring refined aesthetics with meticulous attention to detail, this sophisticated timepiece combines traditional watchmaking codes with Rolex's contemporary standards of precision and reliability.",
      },
      {
        name: 'GMT-Master II',
        image: '/Assets/Images/Watches/Rolex GMT-Master II.webp',
        tagline: 'For travelers across time zones',
        description:
          'The GMT-Master, introduced in 1955, was developed to meet the needs of airline pilots. It became the official watch of Pan American World Airways. With a 24-hour hand and bidirectional rotatable bezel, it allows those who travel the world to read two different time zones simultaneously.',
      },
      {
        name: 'Sky-Dweller',
        image: '/Assets/Images/Watches/Rolex Sky-Dweller.avif',
        tagline: 'The watch for world travelers',
        description:
          'The Sky-Dweller, introduced in 2012, is one of the most complex Rolex watches with its innovative annual calendar and dual time zone display. Its revolutionary system allows travelers to adjust all functions using just the rotatable Ring Command bezel.',
      },
      {
        name: 'Cosmograph Daytona',
        image: '/Assets/Images/Watches/Rolex Cosmograph Daytona.png',
        tagline: 'Born to race',
        description:
          'The Cosmograph Daytona is designed for those with a passion for driving and speed. Introduced in 1963, this iconic chronograph allows drivers to measure elapsed time and read average speeds on its signature tachymetric bezel.',
      },
      {
        name: 'Day-Date',
        image:
          '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235.png',
        tagline: 'The ultimate watch of prestige',
        description:
          'The Day-Date was the first wristwatch to display the date and day of the week spelled out in full in a window on the dial. With the President bracelet, originally created specially for it, the Day-Date continues to be the watch par excellence of influential people.',
      },
    ],
  },
  {
    _id: 'OMG_1',
    name: 'Omega',
    slug: 'omega',
    logo: 'Omega',
    coverImage: '/Assets/Images/photos/Omega Cover Image.jpg',
    coverImage2: '/Assets/Images/photos/Omega Cover Image2.avif',
    heroVideo: '/Assets/Videos/De Ville Trésor _ OMEGA.mp4',
    header: 'Swiss Excellence Since 1848',
    description:
      "Renowned for its groundbreaking watch movements and iconic designs, OMEGA stands at the forefront of horological innovation. As a prestigious member of the Swatch Group—the world's largest watch manufacturer—OMEGA continues to set new standards in precision, craftsmanship, and technical excellence, shaping the future of watchmaking.",
    featuredModels: [
      {
        name: 'Omega Seamaster',
        image: '/Assets/Images/Watches/Omega Seamaster.png',
        tagline: 'Master of the seas',
        description:
          "The Seamaster has been OMEGA's iconic diver's watch since 1948. Today, it still remains one of the most recognized and respected watches in the world.",
      },
      {
        name: 'Omega Speedmaster',
        image: '/Assets/Images/Watches/Omega Speedmaster.png',
        tagline: 'The first watch on the moon',
        description:
          "The OMEGA Speedmaster is one of the world's most iconic timepieces, having been a part of all six lunar missions. The legendary chronograph was the first watch worn on the moon.",
      },
      {
        name: 'Omega Constellation',
        image: '/Assets/Images/Watches/Omega Constellation.png',
        tagline: 'Iconic design since 1952',
        description:
          "The Constellation has been OMEGA's symbol of precision and excellence since 1952. With its iconic claws and half-moons, the collection has evolved to become a true watchmaking icon.",
      },
      {
        name: 'Omega De Ville',
        image: '/Assets/Images/Watches/Omega De Ville.png',
        tagline: 'Classic elegance',
        description:
          "The De Ville collection was created in the 1960s with an elegant and classic design. Today, it continues to represent OMEGA's commitment to luxurious precision.",
      },
    ],
  },
  {
    _id: 'CAR_1',
    name: 'Cartier',
    slug: 'cartier',
    logo: 'Cartier',
    coverImage: '/Assets/Images/photos/Cartier Cover Image.avif',
    coverImage2: '/Assets/Images/photos/Cartier Cover Image.avif',
    heroVideo: '/Assets/Videos/Cartier watchmaking.mp4',
    header: 'The Art of Watchmaking Since 1847',
    description:
      'Cartier crafts extraordinary timepieces that blend bold, innovative design with masterful watchmaking expertise. Celebrated for legendary models such as the Tank and Santos, Cartier watches are timeless icons—instantly recognized as emblems of luxury, elegance, and sophistication.',
    featuredModels: [
      {
        name: 'Cartier Tank',
        image: '/Assets/Images/Watches/Tank Louis Cartier.png',
        tagline: 'An icon of modern design',
        description:
          "Created in 1917, the Tank watch is one of Cartier's most distinctive designs. Its pure lines and perfect proportions make it a true icon of modern watchmaking.",
      },
      {
        name: 'Cartier Santos',
        image: '/Assets/Images/Watches/Santos de Cartier.png',
        tagline: 'The first modern wristwatch',
        description:
          'Created in 1904 for the aviator Alberto Santos-Dumont, the Santos was one of the first modern wristwatches. Its distinctive square case and exposed screws have made it a design icon.',
      },
      {
        name: 'Cartier Ballon Bleu',
        image: '/Assets/Images/Watches/Ballon Bleu De Cartier.png',
        tagline: 'Distinctive and elegant',
        description:
          'The Ballon Bleu de Cartier watch features a distinctive rounded case and a crown set with a sapphire cabochon. Its elegant design has made it a contemporary classic.',
      },
    ],
  },
  {
    _id: 'PPH_1',
    name: 'Patek Philippe',
    slug: 'patek-philippe',
    logo: 'Patek Philippe',
    coverImage: '/Assets/Images/photos/Patek Philippe Cover Image2.jpg',
    coverImage2: '/Assets/Images/photos/Patek Philippe Cover Image.jpg',
    heroVideo: '/Assets/Videos/Patek Philippe Background Video.mp4',
    header: 'Begin Your Own Tradition',
    description:
      'Patek Philippe enjoys outstanding renown and rare prestige, due to the constancy with which the Manufacture has applied its philosophy of excellence ever since it was founded. A family-owned company, it cultivates a tradition of independence that fosters creativity and innovation.',
    featuredModels: [
      {
        name: 'Golden Ellipse',
        image: '/Assets/Images/Watches/Patek Philippe Golden Ellipse Rose Gold.png',
        tagline: 'Harmony of form and elegance',
        description:
          "The Golden Ellipse stands apart with its unique elliptical case, inspired by the golden ratio. A bold departure from traditional shapes, it exemplifies understated luxury and mathematical perfection, making it one of Patek Philippe's most iconic designs.",
      },
      {
        name: 'Nautilus',
        image: '/Assets/Images/Watches/Patek Philippe Nautilus White Gold.png',
        tagline: 'The sports elegance watch',
        description:
          "Created in 1976, the Nautilus is Patek Philippe's iconic sports watch. Its porthole-inspired design and horizontally embossed dial make it instantly recognizable. The Nautilus combines robustness with elegance in a unique way.",
      },
      {
        name: 'Aquanaut',
        image: '/Assets/Images/Watches/Patek Philippe Aquanaut Rose Gold.png',
        tagline: 'The contemporary sports watch',
        description:
          "Introduced in 1997, the Aquanaut is Patek Philippe's modern sports watch. With its rounded octagonal case and tropical composite strap, it offers a contemporary interpretation of the brand's sports watch aesthetic.",
      },
      {
        name: 'Grand Complications',
        image: '/Assets/Images/Watches/Patek Philippe Grand Complications.png',
        tagline: 'The pinnacle of watchmaking',
        description:
          "Patek Philippe's Grand Complications represent the highest expression of traditional watchmaking art. These timepieces combine multiple complications with flawless execution, demonstrating the manufacturer's technical mastery.",
      },
      {
        name: 'In-line Perpetual Calendar',
        image: '/Assets/Images/Watches/Patek Philippe In-line Perpetual Calendar.png',
        tagline: 'Innovation meets legibility',
        description:
          "The In-line Perpetual Calendar revolutionizes calendar display with a sleek, linear format that shows day, date, and month in a single panoramic aperture. A masterstroke of mechanical ingenuity, it reflects Patek Philippe's commitment to clarity, complexity, and elegance.",
      },
    ],
  },
  {
    _id: 'APG_1',
    name: 'Audemars Piguet',
    slug: 'audemars-piguet',
    logo: 'Audemars Piguet',
    coverImage: '/Assets/Images/photos/Audemars Piguet Cover Image2.avif',
    coverImage2: '/Assets/Images/photos/Audemars Piguet Cover Image.avif',
    heroVideo: '/Assets/Videos/Audemars Piguet - Royal Oak.mp4',
    header: 'To Break the Rules, You Must First Master Them',
    description:
      'Audemars Piguet is the oldest fine watchmaking manufacturer still in the hands of its founding families. Since 1875, the company has been writing some of the finest chapters in the history of Haute Horlogerie, including the legendary Royal Oak created in 1972.',
    featuredModels: [
      {
        name: 'Royal Oak',
        image: '/Assets/Images/Watches/Audemars Piguet Royal Oak.png',
        tagline: 'The original luxury sports watch',
        description:
          "Designed by Gérald Genta in 1972, the Royal Oak revolutionized watchmaking with its stainless steel case, octagonal bezel, and integrated bracelet. It was the first luxury sports watch and remains Audemars Piguet's most iconic model.",
      },
      {
        name: 'Royal Oak Offshore',
        image: '/Assets/Images/Watches/Audemars Piguet Royal Oak Offshore.png',
        tagline: 'The bold evolution',
        description:
          'Introduced in 1993, the Royal Oak Offshore took the Royal Oak concept to new extremes with its larger case size and more robust design. It became the archetype of the contemporary luxury sports watch.',
      },
      {
        name: 'Code 11.59',
        image: '/Assets/Images/Watches/Audemars Piguet Code 11.59.png',
        tagline: 'A new chapter begins',
        description:
          'Launched in 2019, Code 11.59 by Audemars Piguet represents a bold new direction for the brand. With its complex case architecture and avant-garde design, it combines traditional craftsmanship with contemporary aesthetics.',
      },
      {
        name: 'Millenary',
        image: '/Assets/Images/Watches/Audemars Piguet Millenary.png',
        tagline: 'The art of asymmetry',
        description:
          "The Millenary collection features distinctive oval cases with off-centered dials, showcasing Audemars Piguet's mastery of unconventional designs. These timepieces reveal their intricate movements through open-worked dials.",
      },
    ],
  },
  {
    _id: 'ALS_1',
    name: 'A.Lange & Söhne',
    slug: 'a-lange-sohne',
    logo: 'A.Lange & Söhne',
    coverImage: '/Assets/Images/photos/A.Lange & Söhne Cover Image.jpeg',
    coverImage2: '/Assets/Images/photos/A.Lange & Söhne Cover Image.jpeg',
    heroVideo: '/Assets/Videos/A.Lange & Söhne 1815 RATTRAPANTE PERPETUAL CALENDAR.mp4',
    header: 'The Art of Precision Since 1845',
    description:
      "A. Lange & Söhne stands for the world's finest watchmaking artistry. The Saxon manufactory creates timepieces that represent the pinnacle of precision, tradition, and innovation. Each watch is a masterpiece of German engineering and craftsmanship.",
    featuredModels: [
      {
        name: 'Lange 1',
        image: '/Assets/Images/Watches/A.Lange & Söhne Lange 1.png',
        tagline: 'The icon of German watchmaking',
        description:
          'The Lange 1, introduced in 1994, is the flagship model of A. Lange & Söhne. Its asymmetric dial layout and outsize date display have become hallmarks of the brand. The watch embodies the perfect synthesis of traditional craftsmanship and innovative design.',
      },
      {
        name: 'Zeitwerk',
        image: '/Assets/Images/Watches/A.Lange & Söhne Zeitwerk.png',
        tagline: 'The mechanical digital watch',
        description:
          'The Zeitwerk, launched in 2009, is a groundbreaking timepiece that displays time digitally with jumping numerals while being entirely mechanical. Its innovative movement represents one of the most significant horological developments in recent decades.',
      },
      {
        name: 'Saxonia',
        image: '/Assets/Images/Watches/A.Lange & Söhne Saxonia.png',
        tagline: 'Pure elegance',
        description:
          "The Saxonia collection embodies the essence of A. Lange & Söhne's watchmaking philosophy: understated elegance combined with technical perfection. These watches feature clean dials and exquisitely finished movements.",
      },
      {
        name: 'Datograph',
        image: '/Assets/Images/Watches/A.Lange & Söhne Datograph.png',
        tagline: "The chronograph connoisseur's choice",
        description:
          'The Datograph is widely regarded as one of the finest chronographs ever made. Its flawless design and exceptional movement finishing set new standards in chronograph construction and have earned it a cult following among watch enthusiasts.',
      },
    ],
  },
  {
    _id: 'VAC_1',
    name: 'Vacheron Constantin',
    slug: 'vacheron-constantin',
    logo: 'Vacheron Constantin',
    coverImage: '/Assets/Images/photos/Vacheron Constantin Cover Image2.avif',
    coverImage2: '/Assets/Images/photos/Vacheron Constantin Cover Image.avif',
    heroVideo: '/Assets/Videos/Vacheron Constantin Overseas Moon Phase Retrograde Date.mp4',
    header: 'One of Not Many Since 1755',
    description:
      "Vacheron Constantin, the world's oldest watch manufacturer in continuous operation since 1755, represents the pinnacle of Swiss Haute Horlogerie. Each timepiece is a masterpiece of technical sophistication and aesthetic refinement, bearing the Hallmark of Geneva.",
    featuredModels: [
      {
        name: 'Overseas',
        image: '/Assets/Images/Watches/Vacheron Constantin Overseas.png',
        tagline: 'The spirit of travel',
        description:
          "The Overseas collection embodies Vacheron Constantin's interpretation of the luxury sports watch. With its distinctive Maltese cross-inspired bezel and interchangeable strap system, it combines elegance with functionality for the global traveler.",
      },
      {
        name: 'Patrimony',
        image: '/Assets/Images/Watches/Vacheron Constantin Patrimony.png',
        tagline: 'The essence of classicism',
        description:
          "The Patrimony collection represents the purest expression of Vacheron Constantin's watchmaking art. With its clean lines and understated elegance, it exemplifies the brand's mastery of classical watchmaking.",
      },
      {
        name: 'Traditionnelle',
        image: '/Assets/Images/Watches/Vacheron Constantin Traditionnelle.png',
        tagline: 'A tribute to heritage',
        description:
          "The Traditionnelle collection pays homage to Vacheron Constantin's rich heritage while incorporating contemporary watchmaking techniques. These timepieces feature traditional design codes such as stepped cases and fluted casebacks.",
      },
      {
        name: 'Historiques',
        image: '/Assets/Images/Watches/Vacheron Constantin Historiques.png',
        tagline: 'Reinterpreting icons',
        description:
          "The Historiques collection revisits iconic models from Vacheron Constantin's extensive archives, reinterpreting them with modern watchmaking technology while preserving their original spirit and design essence.",
      },
    ],
  },
  {
    _id: 'JAC_1',
    name: 'Jacob & Co',
    slug: 'jacob-co',
    logo: 'Jacob & Co',
    coverImage: '/Assets/Images/photos/Jacob & Co Cover Image2.jpeg',
    coverImage2: '/Assets/Images/photos/Jacob & Co Cover Image.jpg',
    heroVideo: '/Assets/Videos/Jacob&C0. Billionaire III Diamonds & Rubies.mp4',
    header: 'Daring, Bold, Unconventional',
    description:
      'Jacob & Co. timepieces are known for their bold designs and extraordinary complications. The brand pushes the boundaries of traditional watchmaking with its avant-garde creations that combine high jewelry craftsmanship with mechanical innovation.',
    featuredModels: [
      {
        name: 'Astronomia',
        image:
          'https://jacobandco.com/media/catalog/product/cache/4b5d8b0c0f6b4cd3a3c6d4e2e8d7a3d5/a/s/astronomia-tourbillon-baguette-1.png',
        tagline: 'A celestial ballet',
        description:
          "The Astronomia collection represents Jacob & Co.'s most iconic and complex timepieces. Featuring a four-arm rotating carriage that completes one revolution every 10 minutes, these watches display time in the most spectacular way imaginable.",
      },
      {
        name: 'Epic X',
        image:
          'https://jacobandco.com/media/catalog/product/cache/4b5d8b0c0f6b4cd3a3c6d4e2e8d7a3d5/e/p/epic-x-chronograph-1.png',
        tagline: 'Bold and powerful',
        description:
          "The Epic X collection features bold, angular cases and skeletonized movements that showcase Jacob & Co.'s mechanical expertise. These timepieces combine sporty elegance with cutting-edge design.",
      },
      {
        name: 'Bugatti',
        image:
          'https://jacobandco.com/media/catalog/product/cache/4b5d8b0c0f6b4cd3a3c6d4e2e8d7a3d5/b/u/bugatti-chiron-tourbillon-1.png',
        tagline: 'The fusion of automotive and horological excellence',
        description:
          "The Jacob & Co. x Bugatti collaboration represents the ultimate fusion of automotive engineering and watchmaking. These timepieces feature miniature W16 engines that replicate the movement of the actual Bugatti Chiron's engine.",
      },
      {
        name: 'Opera',
        image:
          'https://jacobandco.com/media/catalog/product/cache/4b5d8b0c0f6b4cd3a3c6d4e2e8d7a3d5/o/p/opera-godfather-50th-anniversary-1.png',
        tagline: 'A symphony of complications',
        description:
          'The Opera collection combines high complications with musical automata, creating watches that are both technically impressive and entertaining. These timepieces feature minute repeaters and moving scenes that bring the dial to life.',
      },
    ],
  },
  {
    _id: 'RMI_1',
    name: 'Richard Mille',
    slug: 'richard-mille',
    logo: 'Richard Mille',
    coverImage: '/Assets/Images/photos/Richard Mille Cover Image2.jpg',
    coverImage2: '/Assets/Images/photos/Richard Mille Cover Image.jpg',
    heroVideo: '/Assets/Videos/RM 65-01 Collection — RICHARD MILLE.mp4',
    header: 'A Racing Machine on the Wrist',
    description:
      'Richard Mille watches are recognized for their distinctive tonneau-shaped cases and use of innovative materials. Inspired by high-tech industries such as aerospace and Formula 1, these timepieces represent the cutting edge of contemporary watchmaking.',
    featuredModels: [
      {
        name: 'RM 011',
        image:
          'https://www.richardmille.com/sites/default/files/watch_asset/image/RM%20011%20Felipe%20Massa%20Flyback%20Chronograph%20AZ_0.png',
        tagline: 'The iconic flyback chronograph',
        description:
          "The RM 011, originally developed for Formula 1 driver Felipe Massa, is Richard Mille's iconic flyback chronograph. Its skeletonized movement and use of high-tech materials make it a favorite among collectors and racing enthusiasts.",
      },
      {
        name: 'RM 035',
        image:
          'https://www.richardmille.com/sites/default/files/watch_asset/image/RM%20035%20Rafael%20Nadal_0.png',
        tagline: 'The ultimate sports watch',
        description:
          'The RM 035, created in collaboration with tennis champion Rafael Nadal, is one of the lightest mechanical watches ever made. Its ultra-resistant case and movement can withstand the extreme forces generated during a tennis match.',
      },
      {
        name: 'RM 027',
        image:
          'https://www.richardmille.com/sites/default/files/watch_asset/image/RM%20027%20Rafael%20Nadal_0.png',
        tagline: 'Pushing the limits of lightness',
        description:
          "The RM 027 holds the record as one of the lightest tourbillon watches ever created. Weighing less than 20 grams including the strap, it represents Richard Mille's relentless pursuit of innovation in materials and watchmaking.",
      },
      {
        name: 'RM 056',
        image:
          'https://www.richardmille.com/sites/default/files/watch_asset/image/RM%20056%20Felipe%20Massa%20Sapphire%20Tourbillon%20Chronograph_0.png',
        tagline: 'The sapphire masterpiece',
        description:
          "The RM 056 features a case entirely crafted from sapphire crystal, offering a completely transparent view of its complex movement. This technological marvel demonstrates Richard Mille's expertise in working with challenging materials.",
      },
    ],
  },
  {
    _id: 'BRE_1',
    name: 'Breitling',
    slug: 'breitling',
    logo: 'Breitling',
    coverImage: '/Assets/Images/photos/Breitling Cover Image.avif',
    coverImage2: '/Assets/Images/photos/Breitling Cover Image.avif',
    heroVideo: '/Assets/Videos/Breitling Navitimer GMT & Automatic 41.mp4',
    header: 'Aviation Inspired Since 1884',
    description:
      'Breitling has established itself as a benchmark for precision and reliability in professional aviation watches. The brand is known for its robust chronographs and its commitment to supporting aviation professionals and adventurers worldwide.',
    featuredModels: [
      {
        name: 'Navitimer',
        image: 'https://www.breitling.com/media/image/2/variant/thumbnail/ab0139211b1p1_1.png',
        tagline: "The iconic pilot's chronograph",
        description:
          "Introduced in 1952, the Navitimer is Breitling's most iconic model, featuring a circular slide rule that allows pilots to perform all necessary flight calculations. Its distinctive design has made it a favorite among aviation professionals.",
      },
      {
        name: 'Chronomat',
        image: 'https://www.breitling.com/media/image/2/variant/thumbnail/ub0137211c1a1_1.png',
        tagline: 'The sports chronograph',
        description:
          "The Chronomat, originally developed for the Frecce Tricolori aerobatic team, is Breitling's flagship sports chronograph. With its rider tabs and robust construction, it embodies the brand's technical expertise and sporty elegance.",
      },
      {
        name: 'Superocean',
        image: 'https://www.breitling.com/media/image/2/variant/thumbnail/a17369241b1s1_1.png',
        tagline: "Professional diver's watch",
        description:
          "The Superocean is Breitling's professional diver's watch, offering exceptional water resistance and legibility. Designed for underwater exploration, it combines technical performance with distinctive Breitling style.",
      },
      {
        name: 'Premier',
        image: 'https://www.breitling.com/media/image/2/variant/thumbnail/ab0118a61l1a1_1.png',
        tagline: 'Elegance meets performance',
        description:
          "The Premier collection represents Breitling's interpretation of the elegant chronograph. With its refined design and high-performance movements, it bridges the gap between dress watches and professional instruments.",
      },
    ],
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(' Connected to MongoDB');

    // Clear existing data
    await Brand.deleteMany({});
    console.log(' Existing Brands deleted');

    // Insert new Brands
    await Brand.insertMany(Brands);
    console.log(' Brands seeded successfully');

    // Exit process
    process.exit(0);
  } catch (err) {
    console.error(' Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
