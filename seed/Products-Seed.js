const mongoose = require('mongoose');
const Product = require('../models/Products');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const products = [
  {
    id: '126610LN',
    name: 'Rolex Submariner',
    brand: 'ROL_1',
    strapMaterial: 'Gold',
    movement: 'Automatic',
    waterResistance: '300m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Black',
    stock: false,
    stockCount: 0,
    Vcollection: 'Sports & Adventure',
    gender: 'Unisex',
    price: 52000,
    image: '/Assets/Images/Watches/Rolex Submariner.png',
    description:
      "The Rolex Submariner is the quintessential diver's watch, combining robustness with timeless elegance. Its black dial and stainless steel case with gold accents offer a perfect balance of luxury and functionality. The unidirectional rotatable bezel and luminescent display ensure optimal readability in any conditions.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '41.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '12.50 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '48.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless Steel & Gold',
      },
      {
        specName: 'Color',
        specValue: 'Black',
      },
    ],
    specialFeatures: [
      {
        featureName: 'UNIDIRECTIONAL BEZEL',
        featureDesc: 'Rotating bezel with 60-minute scale for precise dive time tracking',
      },
      {
        featureName: 'LUMINOUS DISPLAY',
        featureDesc: 'Chromalight luminescent material for optimal visibility in dark conditions',
      },
      {
        featureName: 'OYSTER CASE',
        featureDesc: 'Monobloc middle case with screw-down case back and winding crown',
      },
      {
        featureName: 'PERPETUAL MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '300m water resistance with Triplock triple waterproofness system',
      },
      {
        featureName: 'OYSTER BRACELET',
        featureDesc: 'Robust and comfortable bracelet with Oysterlock safety clasp',
      },
    ],
  },
  {
    id: '116613lb',
    name: 'Rolex Submariner',
    brand: 'ROL_1',
    strapMaterial: 'Gold',
    movement: 'Automatic',
    waterResistance: '300m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Blue',
    stock: true,
    stockCount: 5,
    Vcollection: 'Sports & Adventure',
    gender: 'Unisex',
    price: 20000,
    image:
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-40-yellow-gold-steel-blue-dial-116613lb.avif',
    galleryImages: [
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (1).jpg',
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/m126613lb-0002_v01.avif',
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (2).jpg',
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (3).jpg',
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (4).jpg',
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (5).jpg',
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (6).jpg',
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (7).jpg',
      '/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (8).jpg',
    ],
    video:
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex Submariner - The divers' watch.webm",
    description:
      "The Rolex SUBMARINER DATE 126613LB in royal blue seamlessly fuses professional performance with timeless aesthetics. Renowned for its Oystersteel and 18k yellow gold composition, this iconic diver's watch features a vibrant blue Cerachrom bezel and luminous Chromalight display. Powered by the advanced Calibre 3235 movement, it offers 300 meters of water resistance.",
    specialFeatures: [
      {
        featureName: 'CERACHROM BEZEL INSERT',
        featureDesc: 'Scratch-resistant blue ceramic bezel with gold-coated numerals for enduring clarity',
      },
      {
        featureName: 'TWO-TONE OYSTERSTEEL & GOLD',
        featureDesc: 'Oystersteel and 18k yellow gold case and bracelet for luxury and durability',
      },
      {
        featureName: 'WATERPROOF DEPTH',
        featureDesc: '300m water resistance with a Triplock triple waterproofness system',
      },
      {
        featureName: 'CHROMALIGHT DISPLAY',
        featureDesc: 'Long-lasting blue luminescence for optimal readability in dark conditions',
      },
      {
        featureName: 'PERPETUAL CALIBRE 3235',
        featureDesc: 'Automatic movement with a 70-hour power reserve and exceptional precision',
      },
      {
        featureName: 'OYSTER BRACELET',
        featureDesc: 'Comfortable and secure Oyster bracelet with Glidelock extension system',
      },
    ],
    specifications: [
      {
        specName: 'Diameter',
        specValue: '41.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '12.40 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '48.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Oystersteel & 18k yellow gold',
      },
      {
        specName: 'Color',
        specValue: 'Royal blue',
      },
    ],
  },
  {
    id: '116500LN',
    name: 'Rolex Cosmograph Daytona',
    brand: 'ROL_1',
    strapMaterial: 'Metal',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'Platinum',
    dialColor: 'Blue',
    stock: true,
    stockCount: 3,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 38300,
    image: '/Assets/Images/Watches/Rolex Cosmograph Daytona.png',
    description:
      'The Rolex Cosmograph Daytona is a timeless chronograph designed for speed enthusiasts. With its platinum case, blue dial, and automatic movement, it combines precision and luxury for everyday wear. The tachymetric scale on the bezel allows for quick calculations of speed, while the three sub-dials provide precise timekeeping functions.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '40.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '12.20 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '47.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Platinum',
      },
      {
        specName: 'Color',
        specValue: 'Blue',
      },
    ],
    specialFeatures: [
      {
        featureName: 'CHRONOGRAPH FUNCTION',
        featureDesc: 'Precise timing with three sub-dials for hours, minutes, and seconds',
      },
      {
        featureName: 'TACHYMETRIC SCALE',
        featureDesc: 'Bezel scale for calculating speed based on time measurement',
      },
      {
        featureName: 'OYSTER CASE',
        featureDesc: 'Monobloc middle case with screw-down case back and winding crown',
      },
      {
        featureName: 'PERPETUAL MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '100m water resistance for everyday wear',
      },
      {
        featureName: 'OYSTER BRACELET',
        featureDesc: 'Robust and comfortable bracelet with Oysterlock safety clasp',
      },
    ],
  },
  {
    id: '52508RBR',
    name: 'Rolex 1908',
    brand: 'ROL_1',
    strapMaterial: 'Leather',
    movement: 'Automatic',
    waterResistance: '50m',
    caseMaterial: 'White Gold',
    dialColor: 'White',
    stock: true,
    stockCount: 2,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 52400,
    image: '/Assets/Images/Watches/Rolex 1908.png',
    description:
      "The Rolex 1908 represents a modern interpretation of classic dress watch elegance, paying homage to the year Rolex was founded. Crafted in 18k white gold with a pristine white dial, this timepiece combines traditional watchmaking excellence with contemporary sophistication. The fluted bezel and refined leather strap create a perfect balance of texture and polish, while the slender case profile ensures comfortable wear under any dress cuff. Powered by Rolex's advanced automatic movement, the 1908 offers exceptional precision and a 72-hour power reserve, making it as reliable as it is beautiful.",
    specialFeatures: [
      {
        featureName: 'FLUTED BEZEL',
        featureDesc: 'Signature Rolex design element that catches and reflects light beautifully',
      },
      {
        featureName: 'SUPERLATIVE CHRONOMETER',
        featureDesc: 'Certified to maintain exceptional accuracy within -2/+2 seconds per day',
      },
      {
        featureName: '18K WHITE GOLD CASE',
        featureDesc: 'Prestigious material that maintains its luster indefinitely',
      },
      {
        featureName: 'LUMINOUS HANDS',
        featureDesc: 'Chromalight display ensures optimal readability in all conditions',
      },
      {
        featureName: '72-HOUR POWER RESERVE',
        featureDesc: 'Extended autonomy for convenience when not worn',
      },
      {
        featureName: 'PRESIDENTIAL-STYLE LEATHER STRAP',
        featureDesc: 'Hand-stitched alligator leather for ultimate comfort and luxury',
      },
    ],
    specifications: [
      {
        specName: 'Diameter',
        specValue: '39.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '9.80 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '46.50 mm',
      },
      {
        specName: 'Material',
        specValue: '18k White Gold',
      },
      {
        specName: 'Color',
        specValue: 'White',
      },
    ],
  },
  {
    id: '228235',
    name: 'Rolex Day-Date 40',
    brand: 'ROL_1',
    strapMaterial: 'Rose Gold',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Green',
    stock: true,
    stockCount: 4,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 52000,
    image:
      '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235.png',
    galleryImages: [
      '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (1).jpg',
      '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (2).jpg',
      '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (3).jpg',
      '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (4).jpg',
      '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (5).jpg',
      '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (6).jpg',
    ],
    video:
      '/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/Rolex Day-Date 228235 Rose Gold Olive Green Dial.mp4',
    description:
      "The Rolex Day-Date 228235 in 18k Everose gold is a luxurious timepiece with a 40mm case, fluted bezel, and olive green dial. It features rose gold Roman numerals, a day display at 12 o'clock, and a date window at 3 o'clock with a Cyclops lens. The President bracelet offers comfort, while the Caliber 3255 movement ensures precision and a 70-hour power reserve. A perfect blend of elegance and functionality.",
    specialFeatures: [
      {
        featureName: 'FLUTED BEZEL',
        featureDesc: 'Signature Rolex design element, enhancing light reflection and elegance',
      },
      {
        featureName: 'OLIVE GREEN DIAL',
        featureDesc: 'Striking color choice, offering a modern twist on the classic Day-Date',
      },
      {
        featureName: 'DAY-DATE FUNCTION',
        featureDesc: 'Displays the day of the week and date, a hallmark of the Day-Date collection',
      },
      {
        featureName: 'PRESIDENT BRACELET',
        featureDesc: 'Iconic three-piece link bracelet, known for its comfort and luxury',
      },
      {
        featureName: 'CALIBER 3255',
        featureDesc: "Rolex's in-house movement with exceptional precision and reliability",
      },
      {
        featureName: '18K EVEROSE GOLD',
        featureDesc: "Rolex's proprietary rose gold alloy, ensuring lasting color and durability",
      },
    ],
    specifications: [
      {
        specName: 'Diameter',
        specValue: '40.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '12.50 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '48.00 mm',
      },
      {
        specName: 'Material',
        specValue: '18k Everose gold',
      },
      {
        specName: 'Color',
        specValue: 'Olive green',
      },
    ],
  },
  {
    id: '228239',
    name: 'Rolex Datejust 40',
    brand: 'ROL_1',
    strapMaterial: 'White Gold',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'White Gold',
    dialColor: 'Blue',
    stock: true,
    stockCount: 6,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 40600,
    image: '/Assets/Images/Watches/Rolex Date-Just 40.png',
    description:
      'The Rolex Datejust 40 is a versatile timepiece featuring a striking blue dial and white gold construction. Its automatic movement ensures precision and reliability. The iconic fluted bezel and Jubilee bracelet provide a perfect combination of elegance and comfort, making it suitable for both formal occasions and everyday wear.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '40.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '11.70 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '47.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'White Gold',
      },
      {
        specName: 'Color',
        specValue: 'Blue',
      },
    ],
  },
  {
    id: '279171',
    name: 'Rolex Lady-Datejust',
    brand: 'ROL_1',
    strapMaterial: 'White Gold',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'White Gold',
    dialColor: 'Else',
    stock: true,
    stockCount: 8,
    Vcollection: 'Casual & Everyday',
    gender: 'Female',
    price: 13650,
    image: '/Assets/Images/Watches/Rolex Lady Datejust.png',
    description:
      'The Rolex Lady-Datejust is a refined watch designed for women, combining elegance with technical achievement. Its white gold case and automatic movement exude sophistication and functionality. The diamond-set bezel adds a touch of luxury, while the President bracelet ensures comfortable wear throughout the day.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '28.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '10.50 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '35.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'White Gold',
      },
      {
        specName: 'Color',
        specValue: 'Silver',
      },
    ],
  },
  {
    id: '31030445201001',
    name: 'Omega Speedmaster Moonwatch Professional',
    brand: 'OMG_1',
    strapMaterial: 'Leather',
    movement: 'Manual',
    waterResistance: '50m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Green',
    stock: true,
    stockCount: 3,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 8150,
    image: '/Assets/Images/Watches/Omega Speedmaster Moonwatch Professional-Green.png',
    description:
      "The Omega Speedmaster Moonwatch Professional in rose gold is a tribute to space exploration. Its green dial and manual movement make it a collector's favorite. This legendary chronograph features the same design and functionality that made it the first watch worn on the moon, now presented in a luxurious rose gold case with a distinctive green dial.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '42.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '13.80 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '48.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Rose Gold',
      },
      {
        specName: 'Color',
        specValue: 'Green',
      },
    ],
    specialFeatures: [
      {
        featureName: 'CHRONOGRAPH FUNCTION',
        featureDesc: 'Precise timing with three sub-dials for hours, minutes, and seconds',
      },
      {
        featureName: 'TACHYMETRIC SCALE',
        featureDesc: 'Bezel scale for calculating speed based on time measurement',
      },
      {
        featureName: 'MANUAL WINDING',
        featureDesc: 'Traditional hand-wound movement with exceptional precision',
      },
      {
        featureName: 'LUMINOUS HANDS',
        featureDesc: 'Super-LumiNova coating for optimal visibility in dark conditions',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '50m water resistance for everyday wear',
      },
      {
        featureName: 'LEATHER STRAP',
        featureDesc: 'Premium leather strap with deployant clasp for comfort and style',
      },
    ],
  },
  {
    id: '31030425001002',
    name: 'Omega Speedmaster Moonwatch Steel-On-Steel',
    brand: 'OMG_1',
    strapMaterial: 'Metal',
    movement: 'Manual',
    waterResistance: '50m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Black',
    stock: true,
    stockCount: 5,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 8150,
    image: '/Assets/Images/Watches/Omega Speedmaster Moonwatch Steel-On-Steel.png',
    description:
      'The Omega Speedmaster Moonwatch Steel-On-Steel is a legendary chronograph with a black dial and stainless steel case. Its manual movement ensures precision and durability. This iconic timepiece maintains the same design that accompanied astronauts to the moon, featuring the distinctive tachymeter bezel and three sub-dials for precise time measurement.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '42.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '13.50 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '48.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless Steel',
      },
      {
        specName: 'Color',
        specValue: 'Black',
      },
    ],
    specialFeatures: [
      {
        featureName: 'CHRONOGRAPH FUNCTION',
        featureDesc: 'Precise timing with three sub-dials for hours, minutes, and seconds',
      },
      {
        featureName: 'TACHYMETRIC SCALE',
        featureDesc: 'Bezel scale for calculating speed based on time measurement',
      },
      {
        featureName: 'MANUAL WINDING',
        featureDesc: 'Traditional hand-wound movement with exceptional precision',
      },
      {
        featureName: 'LUMINOUS HANDS',
        featureDesc: 'Super-LumiNova coating for optimal visibility in dark conditions',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '50m water resistance for everyday wear',
      },
      {
        featureName: 'METAL BRACELET',
        featureDesc: 'Stainless steel bracelet with deployant clasp for durability and comfort',
      },
    ],
  },
  {
    id: '43513402103001',
    name: 'Omega De Ville Tresor',
    brand: 'OMG_1',
    strapMaterial: 'Leather',
    movement: 'Automatic',
    waterResistance: '50m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Black',
    stock: true,
    stockCount: 4,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 5500,
    image: '/Assets/Images/Watches/De Ville Tresor.png',
    description:
      'The Omega De Ville Tresor is a classic dress watch with a black dial and rose gold case. Its automatic movement and leather strap add a touch of sophistication. The sleek, minimalist design features Roman numeral hour markers and a small seconds sub-dial, embodying timeless elegance suitable for formal occasions.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '40.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '11.00 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '45.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Rose Gold',
      },
      {
        specName: 'Color',
        specValue: 'Black',
      },
    ],
    specialFeatures: [
      {
        featureName: 'ROMAN NUMERALS',
        featureDesc: 'Classic Roman numeral hour markers for timeless elegance',
      },
      {
        featureName: 'SMALL SECONDS',
        featureDesc: "Sub-dial at 6 o'clock for precise seconds indication",
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '50m water resistance for everyday wear',
      },
      {
        featureName: 'LEATHER STRAP',
        featureDesc: 'Premium leather strap with deployant clasp for comfort and style',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
    ],
  },
  {
    id: '22012412103001',
    name: 'Omega Seamaster Aqua Terra',
    brand: 'OMG_1',
    strapMaterial: 'Leather',
    movement: 'Automatic',
    waterResistance: '150m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Blue',
    stock: true,
    stockCount: 7,
    Vcollection: 'Sports & Adventure',
    gender: 'Male',
    price: 7050,
    image: '/Assets/Images/Watches/Omega Seamaster Aqua Terra.png',
    description:
      'The Omega Seamaster Aqua Terra is a versatile sports watch with a blue dial and stainless steel case. Its water resistance and automatic movement make it ideal for adventure. The teak-patterned dial is inspired by luxury yacht decks, while the anti-magnetic movement ensures precision even in challenging environments.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '41.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '12.00 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '47.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless Steel',
      },
      {
        specName: 'Color',
        specValue: 'Blue',
      },
    ],
    specialFeatures: [
      {
        featureName: 'TEAK PATTERN DIAL',
        featureDesc: 'Inspired by luxury yacht decks, offering unique texture and depth',
      },
      {
        featureName: 'ANTI-MAGNETIC',
        featureDesc: 'Movement resistant to magnetic fields up to 15,000 gauss',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '150m water resistance for swimming and water sports',
      },
      {
        featureName: 'LEATHER STRAP',
        featureDesc: 'Premium leather strap with deployant clasp for comfort and style',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
    ],
  },
  {
    id: '13120392102001',
    name: 'Omega Constellation Co-Axial Master Chronometer',
    brand: 'OMG_1',
    strapMaterial: 'Metal',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'White',
    stock: true,
    stockCount: 6,
    Vcollection: 'Casual & Everyday',
    gender: 'Female',
    price: 7150,
    image: '/Assets/Images/Watches/Omega Constellation Co-Axial Master Chronometer.png',
    description:
      "The Omega Constellation Co-Axial Master Chronometer is a stylish watch for women. Its white dial and stainless steel case offer elegance and precision. Featuring the iconic 'Griffes' or claws at 3 and 9 o'clock, and a diamond-set bezel, this timepiece combines luxury with Omega's renowned technical excellence.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '29.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '10.00 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '36.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless Steel',
      },
      {
        specName: 'Color',
        specValue: 'White',
      },
    ],
    specialFeatures: [
      {
        featureName: 'GRIFFES DESIGN',
        featureDesc: "Iconic claws at 3 and 9 o'clock positions for distinctive style",
      },
      {
        featureName: 'DIAMOND BEZEL',
        featureDesc: 'Precious stone-set bezel adding luxury and sparkle',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '100m water resistance for everyday wear',
      },
      {
        featureName: 'METAL BRACELET',
        featureDesc: 'Stainless steel bracelet with deployant clasp for durability and comfort',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
    ],
  },
  {
    id: 'WSSA0018',
    name: 'Cartier Santos de Cartier',
    brand: 'CAR_1',
    strapMaterial: 'Metal',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'White',
    stock: true,
    stockCount: 4,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 8600,
    image: '/Assets/Images/Watches/Santos de Cartier.png',
    description:
      'The Cartier Santos de Cartier is an iconic square watch with a white dial and stainless steel case. Its automatic movement and distinctive screw motif bezel make it instantly recognizable. Designed in 1904 as one of the first wristwatches for men, it combines historical significance with modern watchmaking technology.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '39.80 mm',
      },
      {
        specName: 'Case Height',
        specValue: '9.08 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '47.50 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless Steel',
      },
      {
        specName: 'Color',
        specValue: 'White',
      },
    ],
    specialFeatures: [
      {
        featureName: 'SCREW MOTIF',
        featureDesc: 'Iconic exposed screws on the bezel for distinctive design',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '100m water resistance for swimming and water sports',
      },
      {
        featureName: 'METAL BRACELET',
        featureDesc: 'Stainless steel bracelet with deployant clasp for durability and comfort',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'QUICK SWITCH SYSTEM',
        featureDesc: 'Easy strap interchangeability for versatile styling',
      },
    ],
  },
  {
    id: 'WHSA0026',
    name: 'Cartier Santos de Cartier Skeleton',
    brand: 'CAR_1',
    strapMaterial: 'Metal',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Else',
    stock: true,
    stockCount: 2,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 32000,
    image: '/Assets/Images/Watches/Santos de Cartier Skeleton.png',
    description:
      "The Cartier Santos de Cartier Skeleton showcases the intricate mechanics of its automatic movement through a transparent dial. The stainless steel case retains the iconic Santos square shape and screw motif, while the skeletonized movement offers a fascinating view of the watch's inner workings, blending technical mastery with aesthetic appeal.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '39.80 mm',
      },
      {
        specName: 'Case Height',
        specValue: '9.08 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '47.50 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless Steel',
      },
      {
        specName: 'Color',
        specValue: 'Skeleton',
      },
    ],
    specialFeatures: [
      {
        featureName: 'SKELETON DIAL',
        featureDesc: 'Transparent dial showcasing the intricate movement',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '100m water resistance for swimming and water sports',
      },
      {
        featureName: 'METAL BRACELET',
        featureDesc: 'Stainless steel bracelet with deployant clasp for durability and comfort',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'QUICK SWITCH SYSTEM',
        featureDesc: 'Easy strap interchangeability for versatile styling',
      },
    ],
  },
  {
    id: 'WSTA0041',
    name: 'Cartier Tank Must',
    brand: 'CAR_1',
    strapMaterial: 'Leather',
    movement: 'Manual',
    waterResistance: '30m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Black',
    stock: true,
    stockCount: 5,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 3350,
    image: '/Assets/Images/Watches/Cartier Tank Must.png',
    description:
      'The Cartier Tank Must is a rectangular watch with a black dial and leather strap, embodying timeless elegance. Its manual movement and clean design pay homage to the original Tank design from 1917. The Roman numeral hour markers and blue sword-shaped hands are signature Cartier elements that enhance its classic appeal.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '33.70 mm',
      },
      {
        specName: 'Case Height',
        specValue: '6.60 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '44.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless Steel',
      },
      {
        specName: 'Color',
        specValue: 'Black',
      },
    ],
    specialFeatures: [
      {
        featureName: 'ROMAN NUMERALS',
        featureDesc: 'Classic Roman numeral hour markers for timeless elegance',
      },
      {
        featureName: 'MANUAL MOVEMENT',
        featureDesc: 'Traditional hand-wound movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '30m water resistance for everyday wear',
      },
      {
        featureName: 'LEATHER STRAP',
        featureDesc: 'Premium leather strap with deployant clasp for comfort and style',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'BLUE SWORD HANDS',
        featureDesc: 'Signature Cartier blue sword-shaped hands for distinctive style',
      },
    ],
  },
  {
    id: 'WSPN0007',
    name: 'Cartier Panthère de Cartier',
    brand: 'CAR_1',
    strapMaterial: 'Metal',
    movement: 'Manual',
    waterResistance: '30m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'White',
    stock: true,
    stockCount: 6,
    Vcollection: 'Classic & Dress',
    gender: 'Female',
    price: 4850,
    image: '/Assets/Images/Watches/Panthère de Cartier.png',
    description:
      "The Cartier Panthère de Cartier is a luxurious women's watch with a white dial and stainless steel case. Its manual movement and square design exude sophistication. Inspired by the grace of a panther, the watch features a sleek, flexible bracelet and Roman numeral hour markers, creating a perfect balance of elegance and strength.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '27.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '6.00 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '35.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless Steel',
      },
      {
        specName: 'Color',
        specValue: 'White',
      },
    ],
    specialFeatures: [
      {
        featureName: 'ROMAN NUMERALS',
        featureDesc: 'Classic Roman numeral hour markers for timeless elegance',
      },
      {
        featureName: 'MANUAL MOVEMENT',
        featureDesc: 'Traditional hand-wound movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '30m water resistance for everyday wear',
      },
      {
        featureName: 'METAL BRACELET',
        featureDesc: 'Flexible link bracelet for comfort and style',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'BLUE SWORD HANDS',
        featureDesc: 'Signature Cartier blue sword-shaped hands for distinctive style',
      },
    ],
  },
  {
    id: 'WGTA0010',
    name: 'Cartier Tank Louis Cartier',
    brand: 'CAR_1',
    strapMaterial: 'Leather',
    movement: 'Manual',
    waterResistance: '30m',
    caseMaterial: 'Silver',
    dialColor: 'White',
    stock: true,
    stockCount: 3,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 13550,
    image: '/Assets/Images/Watches/Tank Louis Cartier.png',
    description:
      "The Cartier Tank Louis Cartier is a refined rectangular watch with a white dial and silver case. Its manual movement and leather strap embody classic Cartier elegance. The watch's clean lines, Roman numerals, and blue sword-shaped hands maintain the purity of the original 1922 design, making it a timeless piece of horological art.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '33.70 mm',
      },
      {
        specName: 'Case Height',
        specValue: '6.60 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '44.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Silver',
      },
      {
        specName: 'Color',
        specValue: 'White',
      },
    ],
    specialFeatures: [
      {
        featureName: 'ROMAN NUMERALS',
        featureDesc: 'Classic Roman numeral hour markers for timeless elegance',
      },
      {
        featureName: 'MANUAL MOVEMENT',
        featureDesc: 'Traditional hand-wound movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '30m water resistance for everyday wear',
      },
      {
        featureName: 'LEATHER STRAP',
        featureDesc: 'Premium leather strap with deployant clasp for comfort and style',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'BLUE SWORD HANDS',
        featureDesc: 'Signature Cartier blue sword-shaped hands for distinctive style',
      },
    ],
  },
  {
    id: '15407ST.OO.1220ST.01',
    name: 'Audemars Piguet Royal Oak Openworked "Cactus Jack"',
    brand: 'APG_1',
    strapMaterial: 'Leather',
    movement: 'Automatic',
    waterResistance: '50m',
    caseMaterial: 'Ceramic',
    dialColor: 'Else',
    stock: true,
    stockCount: 1,
    Vcollection: 'Luxury & Heritage',
    gender: 'Male',
    price: 221000,
    image: '/Assets/Images/Watches/Audemars Piguet Royal Oak Openworked Cactus Jack.png',
    description:
      "The Audemars Piguet Royal Oak Openworked 'Cactus Jack' is a limited edition masterpiece featuring a ceramic case and skeletonized dial. Its automatic movement is fully visible through the openworked design, showcasing the intricate mechanics. The unique collaboration with Cactus Jack adds contemporary streetwear influence to this haute horology timepiece.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '41.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '9.90 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '50.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Ceramic',
      },
      {
        specName: 'Color',
        specValue: 'Openworked',
      },
    ],
    specialFeatures: [
      {
        featureName: 'OPENWORKED DIAL',
        featureDesc: 'Skeletonized design revealing the intricate movement',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '50m water resistance for everyday wear',
      },
      {
        featureName: 'LEATHER STRAP',
        featureDesc: 'Premium leather strap with deployant clasp for comfort and style',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'CACTUS JACK COLLABORATION',
        featureDesc: 'Limited edition design featuring unique streetwear influence',
      },
    ],
  },
  {
    id: '26530ST.OO.1220ST.01',
    name: 'Audemars Piguet Royal Oak Flying Tourbillon',
    brand: 'APG_1',
    strapMaterial: 'White Gold',
    movement: 'Automatic',
    waterResistance: '50m',
    caseMaterial: 'White Gold',
    dialColor: 'Red',
    stock: true,
    stockCount: 2,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 201000,
    image: '/Assets/Images/Watches/Audemars Piguet Royal Oak Flying Tourbillon.png',
    description:
      "The Audemars Piguet Royal Oak Flying Tourbillon features a striking red dial and white gold case. Its automatic movement includes a flying tourbillon complication, visible through the dial side. The iconic octagonal bezel with exposed screws and 'Tapisserie' patterned dial maintain the Royal Oak's distinctive aesthetic while showcasing advanced watchmaking technology.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '41.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '10.60 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '50.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'White Gold',
      },
      {
        specName: 'Color',
        specValue: 'Red',
      },
    ],
    specialFeatures: [
      {
        featureName: 'FLYING TOURBILLON',
        featureDesc: 'Complex tourbillon mechanism visible through the dial',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '50m water resistance for everyday wear',
      },
      {
        featureName: 'WHITE GOLD BRACELET',
        featureDesc: 'Prestigious white gold bracelet with deployant clasp',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'TAPISSERIE DIAL',
        featureDesc: 'Iconic textured dial pattern for distinctive Royal Oak style',
      },
    ],
  },
  {
    id: '15710ST.OO.A052CA.01',
    name: 'Audemars Piguet Royal Oak Offshore Diver',
    brand: 'APG_1',
    strapMaterial: 'Rubber',
    movement: 'Automatic',
    waterResistance: '300m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Green',
    stock: true,
    stockCount: 3,
    Vcollection: 'Sports & Adventure',
    gender: 'Male',
    price: 36200,
    image: '/Assets/Images/Watches/Audemars Piguet Royal Oak Offshore Diver.png',
    galleryImages: [
      '/Assets/Images/Watches/Model.png',
      '/Assets/Images/Watches/front_1.png',
      '/Assets/Images/Watches/front_2.png',
      '/Assets/Images/Watches/front_3.png',
      '/Assets/Images/Watches/back_view.png',
    ],
    video: '/Assets/Images/Watches/Audemars Piguet Royal Oak Offshore Diver.mp4',
    description:
      "The Audemars Piguet Royal Oak Offshore Diver is a modern interpretation of the classic Royal Oak design. Its green dial and stainless steel case combine the robustness of a diver's watch with the elegance of a Royal Oak timepiece. The unique collaboration with Cactus Jack adds a contemporary streetwear influence to this high-performance sports watch.",
    specialFeatures: [
      {
        featureName: 'MÉGA TAPISSERIE DIAL',
        featureDesc: 'Bold and textured dial design offering depth and enhanced legibility',
      },
      {
        featureName: 'KHAKI GREEN TONE',
        featureDesc: 'A unique and rugged color palette tailored for both style and sport',
      },
      {
        featureName: 'PINK GOLD ACCENTS',
        featureDesc: 'Applied gold elements provide a warm contrast and luxurious finish',
      },
      {
        featureName: 'BLACK CERAMIC BEZEL',
        featureDesc: 'Highly durable and scratch-resistant ceramic with modern appeal',
      },
      {
        featureName: 'PROFESSIONAL DIVER CAPABILITIES',
        featureDesc: 'Engineered for underwater exploration with reliable performance',
      },
      {
        featureName: 'RUBBER STRAP',
        featureDesc: 'Comfortable and versatile strap in khaki green for active wear',
      },
    ],
    specifications: [
      {
        specName: 'Diameter',
        specValue: '42.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '14.10 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '53.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Stainless steel with black ceramic bezel',
      },
      {
        specName: 'Color',
        specValue: 'Khaki green',
      },
    ],
  },
  {
    id: '26470OR.OO.A002CA.01',
    name: 'Audemars Piguet Royal Oak Offshore',
    brand: 'APG_1',
    strapMaterial: 'Rubber',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Blue',
    stock: true,
    stockCount: 4,
    Vcollection: 'Casual & Everyday',
    gender: 'Female',
    price: 50500,
    image: '/Assets/Images/Watches/Audemars Piguet Royal Oak Offshore.png',
    description:
      "The Audemars Piguet Royal Oak Offshore is a bold luxury watch with a blue dial and rose gold case. Its automatic movement and rubber strap ensure durability and style. The larger case size and distinctive 'Méga Tapisserie' dial pattern create a sporty yet elegant aesthetic that stands out in any setting.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '42.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '14.40 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '54.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Rose Gold',
      },
      {
        specName: 'Color',
        specValue: 'Blue',
      },
    ],
    specialFeatures: [
      {
        featureName: 'MÉGA TAPISSERIE DIAL',
        featureDesc: 'Bold and textured dial design offering depth and enhanced legibility',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '100m water resistance for swimming and water sports',
      },
      {
        featureName: 'RUBBER STRAP',
        featureDesc: 'Comfortable and versatile strap for active wear',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'ROSE GOLD CASE',
        featureDesc: 'Prestigious 18k rose gold case for luxury appeal',
      },
    ],
  },
  {
    id: '15500OR.OO.D002CR.01',
    name: 'Audemars Piguet Royal Oak',
    brand: 'APG_1',
    strapMaterial: 'Rose Gold',
    movement: 'Automatic',
    waterResistance: '50m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Green',
    stock: true,
    stockCount: 2,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 82800,
    image: '/Assets/Images/Watches/Audemars Piguet Royal Oak.png',
    description:
      "The Audemars Piguet Royal Oak is an iconic timepiece with a green dial and rose gold case. Its automatic movement and timeless design make it a collector's favorite. The signature octagonal bezel with exposed screws and 'Petite Tapisserie' dial pattern remain true to the original 1972 design that revolutionized luxury sports watches.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '41.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '10.10 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '50.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Rose Gold',
      },
      {
        specName: 'Color',
        specValue: 'Green',
      },
    ],
    specialFeatures: [
      {
        featureName: 'PETITE TAPISSERIE DIAL',
        featureDesc: 'Iconic textured dial pattern for distinctive Royal Oak style',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '50m water resistance for everyday wear',
      },
      {
        featureName: 'ROSE GOLD BRACELET',
        featureDesc: 'Prestigious rose gold bracelet with deployant clasp',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'OCTAGONAL BEZEL',
        featureDesc: 'Signature eight-sided bezel with exposed screws',
      },
    ],
  },
  {
    id: '3738R-001',
    name: 'Patek Philippe Golden Ellipse Rose Gold',
    brand: 'PPH_1',
    strapMaterial: 'Rose Gold',
    movement: 'Automatic',
    waterResistance: '30m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Black',
    stock: true,
    stockCount: 1,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 85000,
    image: '/Assets/Images/Watches/Patek Philippe Golden Ellipse Rose Gold.png',
    description:
      'The Patek Philippe Golden Ellipse Rose Gold is a masterpiece of elegance. Its black dial and rose gold case make it a luxurious choice for formal occasions. The unique oval case shape, based on the golden ratio, creates perfect proportions that have made this model an icon of understated sophistication since 1968.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '34.50 mm',
      },
      {
        specName: 'Case Height',
        specValue: '6.80 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '39.50 mm',
      },
      {
        specName: 'Material',
        specValue: 'Rose Gold',
      },
      {
        specName: 'Color',
        specValue: 'Black',
      },
    ],
    specialFeatures: [
      {
        featureName: 'GOLDEN RATIO',
        featureDesc: 'Case shape based on the perfect golden ratio for aesthetic harmony',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '30m water resistance for everyday wear',
      },
      {
        featureName: 'ROSE GOLD BRACELET',
        featureDesc: 'Prestigious rose gold bracelet with deployant clasp',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'MINIMALIST DIAL',
        featureDesc: 'Clean, uncluttered dial design for timeless elegance',
      },
    ],
  },
  {
    id: '5711/1P-001',
    name: 'Patek Philippe Nautilus',
    brand: 'PPH_1',
    strapMaterial: 'White Gold',
    movement: 'Automatic',
    waterResistance: '120m',
    caseMaterial: 'White Gold',
    dialColor: 'Blue',
    stock: true,
    stockCount: 2,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 35000,
    image: '/Assets/Images/Watches/Patek Philippe Nautilus White Gold.png',
    description:
      "The Patek Philippe Nautilus is a luxury sports watch with a blue dial and white gold case. Its automatic movement and water resistance make it a versatile choice. Inspired by a ship's porthole, the rounded octagonal bezel and horizontally embossed dial create a distinctive look that has defined this collection since 1976.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '40.00 mm',
      },
      {
        specName: 'Case Height',
        specValue: '8.30 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '48.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'White Gold',
      },
      {
        specName: 'Color',
        specValue: 'Blue',
      },
    ],
    specialFeatures: [
      {
        featureName: 'HORIZONTAL EMBOSSING',
        featureDesc: 'Distinctive horizontal lines on dial inspired by ship portholes',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '120m water resistance for swimming and water sports',
      },
      {
        featureName: 'WHITE GOLD BRACELET',
        featureDesc: 'Prestigious white gold bracelet with deployant clasp',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'OCTAGONAL BEZEL',
        featureDesc: 'Rounded octagonal bezel for distinctive Nautilus style',
      },
    ],
  },
  {
    id: '5167R-001',
    name: 'Patek Philippe Aquanaut Rose Gold',
    brand: 'PPH_1',
    strapMaterial: 'Rubber',
    movement: 'Automatic',
    waterResistance: '120m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Brown',
    stock: true,
    stockCount: 3,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 62000,
    image: '/Assets/Images/Watches/Patek Philippe Aquanaut Rose Gold.png',
    description:
      "The Patek Philippe Aquanaut Rose Gold is a modern luxury watch with a brown dial and rose gold case. Its rubber strap and water resistance make it perfect for active lifestyles. The embossed checkerboard pattern dial and rounded octagonal case create a contemporary aesthetic while maintaining Patek Philippe's tradition of excellence.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '40.80 mm',
      },
      {
        specName: 'Case Height',
        specValue: '8.10 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '48.50 mm',
      },
      {
        specName: 'Material',
        specValue: 'Rose Gold',
      },
      {
        specName: 'Color',
        specValue: 'Brown',
      },
    ],
    specialFeatures: [
      {
        featureName: 'CHECKERBOARD DIAL',
        featureDesc: 'Distinctive embossed pattern for modern aesthetics',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '120m water resistance for swimming and water sports',
      },
      {
        featureName: 'RUBBER STRAP',
        featureDesc: 'Comfortable and versatile strap for active wear',
      },
      {
        featureName: 'SAPPHIRE CRYSTAL',
        featureDesc: 'Scratch-resistant sapphire crystal with anti-reflective coating',
      },
      {
        featureName: 'ROSE GOLD CASE',
        featureDesc: 'Prestigious 18k rose gold case for luxury appeal',
      },
    ],
  },
  {
    id: '5208T-010',
    name: 'Patek Philippe Grand Complications',
    brand: 'PPH_1',
    strapMaterial: 'Leather',
    movement: 'Automatic',
    waterResistance: '30m',
    caseMaterial: 'Titanium',
    dialColor: 'Black',
    stock: true,
    stockCount: 1,
    Vcollection: 'Luxury & Heritage',
    gender: 'Male',
    price: 200000,
    image: '/Assets/Images/Watches/Patek Philippe Grand Complications.png',
    description:
      'The Patek Philippe Grand Complications is a pinnacle of watchmaking artistry. Its black dial, titanium case, and intricate complications make it a true masterpiece. Featuring a perpetual calendar, minute repeater, and chronograph, this timepiece represents the highest level of technical achievement in mechanical watchmaking.',
    specifications: [
      {
        specName: 'Diameter',
        specValue: '42.20 mm',
      },
      {
        specName: 'Case Height',
        specValue: '14.20 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '50.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'Titanium',
      },
      {
        specName: 'Color',
        specValue: 'Black',
      },
    ],
    specialFeatures: [
      {
        featureName: 'PERPETUAL CALENDAR',
        featureDesc: 'Complex calendar mechanism accounting for months and leap years',
      },
      {
        featureName: 'MINUTE REPEATER',
        featureDesc: 'Acoustic time indication through mechanical chimes',
      },
      {
        featureName: 'CHRONOGRAPH',
        featureDesc: 'Precise timing function with start, stop, and reset capabilities',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '30m water resistance for everyday wear',
      },
      {
        featureName: 'LEATHER STRAP',
        featureDesc: 'Premium leather strap with deployant clasp for comfort and style',
      },
      {
        featureName: 'TITANIUM CASE',
        featureDesc: 'Lightweight and durable titanium case for exceptional comfort',
      },
    ],
  },
  {
    id: '5236P-001',
    name: 'Patek Philippe In-line Perpetual Calendar',
    brand: 'PPH_1',
    strapMaterial: 'Leather',
    movement: 'Automatic',
    waterResistance: '30m',
    caseMaterial: 'White Gold',
    dialColor: 'Blue',
    stock: true,
    stockCount: 1,
    Vcollection: 'Luxury & Heritage',
    gender: 'Male',
    price: 200000,
    image: '/Assets/Images/Watches/Patek Philippe In-line Perpetual Calendar.png',
    description:
      "The Patek Philippe In-line Perpetual Calendar is a technical marvel with a blue dial and white gold case. Its perpetual calendar complication showcases exceptional craftsmanship. The unique in-line display of calendar information creates a clean, symmetrical layout that enhances readability while maintaining the collection's elegant aesthetic.",
    specifications: [
      {
        specName: 'Diameter',
        specValue: '41.30 mm',
      },
      {
        specName: 'Case Height',
        specValue: '11.07 mm',
      },
      {
        specName: 'Lug-to-Lug',
        specValue: '48.00 mm',
      },
      {
        specName: 'Material',
        specValue: 'White Gold',
      },
      {
        specName: 'Color',
        specValue: 'Blue',
      },
    ],
    specialFeatures: [
      {
        featureName: 'IN-LINE DISPLAY',
        featureDesc: 'Unique calendar information layout in a single line',
      },
      {
        featureName: 'PERPETUAL CALENDAR',
        featureDesc: 'Complex calendar mechanism accounting for months and leap years',
      },
      {
        featureName: 'AUTOMATIC MOVEMENT',
        featureDesc: 'Self-winding mechanical movement with exceptional precision',
      },
      {
        featureName: 'WATER RESISTANCE',
        featureDesc: '30m water resistance for everyday wear',
      },
      {
        featureName: 'LEATHER STRAP',
        featureDesc: 'Premium leather strap with deployant clasp for comfort and style',
      },
      {
        featureName: 'WHITE GOLD CASE',
        featureDesc: 'Prestigious white gold case for luxury appeal',
      },
    ],
  },

  {
    id: '405.034',
    name: 'A. Lange & Söhne Datograph 405.034 UpDown Lumen Platinum Black Dial',
    brand: 'ALS_1',
    strapMaterial: 'Leather',
    movement: 'Manual Winding',
    waterResistance: '50m',
    caseMaterial: 'Platinum',
    dialColor: 'Black',
    stock:'true' ,
    stockCount: '3' ,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 228000,
    image: 'a-lange-sohne-zeitwerk-striking-time-white-gold-black-dial-145-029-a-lange-sohne-40258736947444.jpg',
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },

{
    id: '405.831',
    name: 'A. Lange & Söhne Datograph Flyback 405.831 Rose Gold Baguette Bezel Black Dial Limited Edition',
    brand: 'ALS_1',
    strapMaterial: 'Leather',
    movement: 'Manual',
    waterResistance: '30m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Black',
    stock:'true' ,
    stockCount: '5' ,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 180000,
    image: 'a-lange-sohne-datograph-flyback-rose-gold-baguette-bezel-black-dial-limited-edition-405-831-a-lange-sohne-40258660499700.jpg',
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },

{
    id: '145.029',
    name: 'A. Lange & Söhne Zeitwerk 145.029 Striking Time White Gold Black Dial',
    brand: 'ALS_1',
    strapMaterial: 'Leather',
    movement: 'Manual',
    waterResistance: '30m',
    caseMaterial: 'White Gold',
    dialColor: 'Black',
    stock:'true' ,
    stockCount: '3' ,
    Vcollection: 'Classic & Dress',
    gender: 'Male',
    price: 120000,
    image: 
      '/Assets/Images/Photos/A lange/a-lange-sohne-zeitwerk-striking-time-white-gold-black-dial-145-029-a-lange-sohne-40258736947444.jpg',
     galleryImages: [
      '/Assets/Images/Photos/A lange/a-lange-sohne-zeitwerk-striking-time-white-gold-black-dial-145-029-a-lange-sohne-40258737242356.jpg',
      '/Assets/Images/Photos/A lange/a-lange-sohne-zeitwerk-striking-time-white-gold-black-dial-145-029-a-lange-sohne-40258742157556.jpg',
    ],
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },


{
    id: 'RM 035',
    name: 'Richard Mille RM 035 Americas 2 Rose Gold Toro Skeleton Limited Edition (2018)',
    brand: 'RMI_1',
    strapMaterial: 'Rubber',
    movement: 'Manual',
    waterResistance: '100m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Other',
    stock:'true' ,
    stockCount: '5' ,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 495000,
    image: 'richard-mille-americas-rose-gold-toro-skeleton-limited-edition-rm-035-richard-mille-40266311827700.png',
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },

{
    id: 'RM 011',
    name: 'Richard-Mille-RM-011-White-Ghost',
    brand: 'RMI_1',
    strapMaterial: 'Rubber',
    movement: 'Automatic',
    waterResistance: '100m',
    caseMaterial: 'Ceramic',
    dialColor: 'Other',
    stock:'true' ,
    stockCount: '3' ,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 380000,
    image: '/Assets/Images/Photos/RM 011/richard-mille-rm-011-fm-white-ghost-white-ceramic-limited-edition-richard-mille-1151957426.png',
     galleryImages: [
      '/Assets/Images/Photos/RM 011/richard-mille-rm-72-01-lifestyle-in-house-chronograph-white-ceramic-2023-richard-mille-42985899720948.jpg',
      '/Assets/Images/Photos/RM 011/richard-mille-rm-011-fm-white-ghost-white-ceramic-limited-edition-richard-mille-1151957425.jpg',
    ],

    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },

{
    id: '26284RO.OO.D002CR.01',
    name: 'Jacob Co. At150-40 AC SD A Gravitational Triple Axis Automatic Tourbillon Piece Unique',
    brand: 'JAC_1',
    strapMaterial: 'Leather',
    movement: 'Automatic',
    waterResistance: '30m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Red',
    stock:'true' ,
    stockCount: '5' ,
    Vcollection: 'Luxury & Heritage',
    gender: 'Male',
    price: 420000,
    image: 'audemars-piguet-royal-oak-offshore-rubens-barrichello-lll-26284ro-oo-d002cr-01-audemars-piguet-40259238527220.png',
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },

{
    id: '15416CE.OO.1225CE.02',
    name: 'Jacob Co. At150-40 AC SD A Gravitational Triple Axis Automatic Tourbillon Piece Unique',
    brand: 'JAC_1',
    strapMaterial: 'Ceramic',
    movement: 'Automatic',
    waterResistance: '30m',
    caseMaterial: 'Ceramic',
    dialColor: 'Other',
    stock:'true' ,
    stockCount: '5' ,
    Vcollection: 'Luxury & Heritage',
    gender: 'Male',
    price: 385000,
    image: '/Assets/Images/Photos/JAC 1/jacob-co-astronomia-at150-40-ac-sd-a-gravitational-triple-axis-automatic-tourbillon-piece-unique-2018-jacob-co-1154935480.jpg',
    galleryImages: [
      '/Assets/Images/Photos/JAC 1/jacob-co-astronomia-at150-40-ac-sd-a-gravitational-triple-axis-automatic-tourbillon-piece-unique-2018-jacob-co-1155822434.jpg',
      '/Assets/Images/Photos/JAC 1/jacob-co-astronomia-at150-40-ac-sd-a-gravitational-triple-axis-automatic-tourbillon-piece-unique-2018-jacob-co-1154935485.jpg',
    ],
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },

  {
    id: '5100T/000R-B623',
    name: 'Vacheron Constantin Traditionnelle Tourbillon Chronograph 5100T/000R-B623 Rose Gold',
    brand: 'VAC_1',
    strapMaterial: 'Leather',
    movement: 'Automatic',
    waterResistance: '50m',
    caseMaterial: 'Rose Gold',
    dialColor: 'Silver',
    stock:'true' ,
    stockCount: '5' ,
    Vcollection: 'Classic & Dress',
    gender: 'Female',
    price: 195000,
    image: 'Assets/Images/Photos/vacheron/vacheron-constantin-traditionnelle-tourbillon-chronograph-rose-gold-5100t-000r-b623-vacheron-constantin-40272885547252.jpg',
    galleryImages: [
      '/Assets/Images/Photos/vacheron/vacheron-constantin-traditionnelle-tourbillon-chronograph-rose-gold-5100t-000r-b623-vacheron-constantin-40272885973236.jpg',
      '/Assets/Images/Photos/vacheron/vacheron-constantin-traditionnelle-tourbillon-chronograph-rose-gold-5100t-000r-b623-vacheron-constantin-40272886497524.jpg',
      '/Assets/Images/Photos/vacheron/vacheron-constantin-traditionnelle-tourbillon-chronograph-rose-gold-5100t-000r-b623-vacheron-constantin-40272908419316.jpg',
    ],
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },

  {
    id: '16520',
    name: 'Vacheron Constantin Traditionnelle Tourbillon Chronograph 5100T/000R-B623 Rose Gold',
    brand: 'VAC_1',
    strapMaterial: 'Stainless Steel',
    movement: 'Automatic',
    waterResistance: '50m',
    caseMaterial: 'Stainless Steel',
    dialColor: 'Black',
    stock:'true' ,
    stockCount: '3' ,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 49000,
    image: 'rolex-daytona-116520-stainless-steel-black-dial-zenith-1997-rolex-43846969000180.jpg',
     galleryImages: [
      '/Assets/Images/Photos/vacheron-constantin-traditionnelle-tourbillon-chronograph-rose-gold-5100t-000r-b623-vacheron-constantin-40272885547252/rolex-daytona-116520-stainless-steel-black-dial-zenith-1997-rolex-43846969196788.jpg',
      '/Assets/Images/Photos/vacheron-constantin-traditionnelle-tourbillon-chronograph-rose-gold-5100t-000r-b623-vacheron-constantin-40272885547252/rolex-daytona-116520-stainless-steel-black-dial-zenith-1997-rolex-43846969360628.jpg',
      '/Assets/Images/Photos/vacheron-constantin-traditionnelle-tourbillon-chronograph-rose-gold-5100t-000r-b623-vacheron-constantin-40272885547252/rolex-daytona-116520-stainless-steel-black-dial-zenith-1997-rolex-43846969393396.jpg',
    ],
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },

  {
    id: '4200H/222J-B935',
    name: 'Vacheron Constantin Historiques 222 4200H/222J-B935 Yellow Gold Champagne Dial',
    brand: 'VAC_1',
    strapMaterial: 'Yellow Gold',
    movement: 'Automatic',
    waterResistance: '30m',
    caseMaterial: 'Yellow Gold',
    dialColor: 'Other',
    stock:'true' ,
    stockCount: '5' ,
    Vcollection: 'Casual & Everyday',
    gender: 'Male',
    price: 78900,
    image: '/Assets/Images/Photos/historique/vacheron-constantin-historiques-222-yellow-gold-champagne-dial-vacheron-constantin-42478825013492.jpg',
     galleryImages: [
      '/Assets/Images/Photos/historique/vacheron-constantin-historiques-222-yellow-gold-champagne-dial-vacheron-constantin-42478825144564.jpg',
      '/Assets/Images/Photos/historique/vacheron-constantin-historiques-222-yellow-gold-champagne-dial-vacheron-constantin-42478824882420.jpg',
      '/Assets/Images/Photos/historique/vacheron-constantin-historiques-222-yellow-gold-champagne-dial-vacheron-constantin-42478825046260.jpg',
    ],
    description:
      "",
    specifications: [
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
      {
        specName: '',
        specValue: '',
      },
    ],
    specialFeatures: [
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
      {
        featureName: '',
        featureDesc: '',
      },
    ],
  },
];

async function seedDatabase() {
  try {
    // Check if MongoDB URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    console.log('Existing products deleted');

    // Insert new products
    await Product.insertMany(products);
    console.log('Products seeded successfully');

    // Exit process
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();