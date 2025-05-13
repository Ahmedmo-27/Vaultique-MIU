const mongoose = require('mongoose');
const Product = require('../models/Products');
require('dotenv').config({ path: '../.env' });

const products = [
  {
    id: "126610LN",
    name: "Rolex Submariner",
    brand: "Rolex",
    strapMaterial: "Gold",
    movement: "Automatic",
    waterResistance: "300m",
    caseMaterial: "Stainless Steel",
    dialColor: "Black",
    stock: false,
    Vcollection: "Sports & Adventure",
    gender: "Unisex",
    price: 52000,
    image: "/Assets/Images/Watches/submariner.png",
    description: "The Rolex Submariner is the quintessential diver's watch, combining robustness with timeless elegance. Its black dial and stainless steel case with gold accents offer a perfect balance of luxury and functionality. The unidirectional rotatable bezel and luminescent display ensure optimal readability in any conditions.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "41.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "12.50 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel & Gold"
      },
      {
        specName: "Color",
        specValue: "Black"
      }
    ],
    productPageUrl:"/Product.html?id=126610LN"
  },
  {
    id:"116613lb",
    name: "Rolex Submariner",
    brand: "Rolex",
    strapMaterial: "Gold",
    movement: "Automatic",
    waterResistance: "300m",
    caseMaterial: "Stainless Steel",
    dialColor: "Blue",
    stock: true,
    Vcollection: "Sports & Adventure",
    gender:"Unisex",
    price: 20000,
    image: "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-40-yellow-gold-steel-blue-dial-116613lb.avif",
    galleryImages: [
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (1).jpg",
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/m126613lb-0002_v01.avif",
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (2).jpg",
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (3).jpg",
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (4).jpg",
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (5).jpg",
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (6).jpg",
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (7).jpg",
      "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex-Submariner-date-126613lb (8).jpg"
    ],
    video: "/Assets/Images/Watches/Rolex Submariner Date 126613LB/Rolex Submariner - The divers' watch.webm",
    description:"The Rolex SUBMARINER DATE 126613LB in royal blue seamlessly fuses professional performance with timeless aesthetics. Renowned for its Oystersteel and 18k yellow gold composition, this iconic diver's watch features a vibrant blue Cerachrom bezel and luminous Chromalight display. Powered by the advanced Calibre 3235 movement, it offers 300 meters of water resistance.",
    specialFeatures: [
      {
        featureName: "CERACHROM BEZEL INSERT",
        featureDesc: "Scratch-resistant blue ceramic bezel with gold-coated numerals for enduring clarity"
      },
      {
        featureName: "TWO-TONE OYSTERSTEEL & GOLD",
        featureDesc: "Oystersteel and 18k yellow gold case and bracelet for luxury and durability"
      },
      {
        featureName: "WATERPROOF DEPTH",
        featureDesc: "300m water resistance with a Triplock triple waterproofness system"
      },
      {
        featureName: "CHROMALIGHT DISPLAY",
        featureDesc: "Long-lasting blue luminescence for optimal readability in dark conditions"
      },
      {
        featureName: "PERPETUAL CALIBRE 3235",
        featureDesc: "Automatic movement with a 70-hour power reserve and exceptional precision"
      },
      {
        featureName: "OYSTER BRACELET",
        featureDesc: "Comfortable and secure Oyster bracelet with Glidelock extension system"
      }
    ],
    specifications: [
      {
        specName: "Diameter",
        specValue: "41.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "12.40 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.00 mm"
      },
      {
        specName: "Material",
        specValue: "Oystersteel & 18k yellow gold"
      },
      {
        specName: "Color",
        specValue: "Royal blue"
      }
    ]
  },
  {
    id: "116500LN",
    name: "Rolex Cosmograph Daytona",
    brand: "Rolex",
    strapMaterial: "Metal",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "Platinum",
    dialColor: "Blue",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 38300,
    image: "/Assets/Images/Watches/Rolex Cosmograph Daytona.png",
    description: "The Rolex Cosmograph Daytona is a timeless chronograph designed for speed enthusiasts. With its platinum case, blue dial, and automatic movement, it combines precision and luxury for everyday wear. The tachymetric scale on the bezel allows for quick calculations of speed, while the three sub-dials provide precise timekeeping functions.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "12.20 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "47.00 mm"
      },
      {
        specName: "Material",
        specValue: "Platinum"
      },
      {
        specName: "Color",
        specValue: "Blue"
      }
    ]
  },
  {
    id: "52508RBR",
    name: "Rolex 1908",
    brand: "Rolex",
    strapMaterial: "Leather",
    movement: "Automatic",
    waterResistance: "50m",
    caseMaterial: "White Gold",
    dialColor: "White",
    stock: true,
    Vcollection: "Classic & Dress",
    gender: "Male",
    price: 52400,
    image: "/Assets/Images/Watches/Rolex 1908.png",
    description: "The Rolex 1908 represents a modern interpretation of classic dress watch elegance, paying homage to the year Rolex was founded. Crafted in 18k white gold with a pristine white dial, this timepiece combines traditional watchmaking excellence with contemporary sophistication. The fluted bezel and refined leather strap create a perfect balance of texture and polish, while the slender case profile ensures comfortable wear under any dress cuff. Powered by Rolex's advanced automatic movement, the 1908 offers exceptional precision and a 72-hour power reserve, making it as reliable as it is beautiful.",
    specialFeatures: [
      {
        featureName: "FLUTED BEZEL",
        featureDesc: "Signature Rolex design element that catches and reflects light beautifully"
      },
      {
        featureName: "SUPERLATIVE CHRONOMETER",
        featureDesc: "Certified to maintain exceptional accuracy within -2/+2 seconds per day"
      },
      {
        featureName: "18K WHITE GOLD CASE",
        featureDesc: "Prestigious material that maintains its luster indefinitely"
      },
      {
        featureName: "LUMINOUS HANDS",
        featureDesc: "Chromalight display ensures optimal readability in all conditions"
      },
      {
        featureName: "72-HOUR POWER RESERVE",
        featureDesc: "Extended autonomy for convenience when not worn"
      },
      {
        featureName: "PRESIDENTIAL-STYLE LEATHER STRAP",
        featureDesc: "Hand-stitched alligator leather for ultimate comfort and luxury"
      }
    ],
    specifications: [
      {
        specName: "Diameter",
        specValue: "39.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "9.80 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "46.50 mm"
      },
      {
        specName: "Material",
        specValue: "18k White Gold"
      },
      {
        specName: "Color",
        specValue: "White"
      }
    ]
  },
  {
    id: "228235",
    name: "Rolex Day-Date 40",
    brand: "Rolex",
    strapMaterial: "Rose Gold",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "Rose Gold",
    dialColor: "Green",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 52000,
    image: "/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235.png",
    galleryImages: [
      "/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (1).jpg",
      "/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (2).jpg",
      "/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (3).jpg",
      "/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (4).jpg",
      "/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (5).jpg",
      "/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/rolex-day-date-40-rose-gold-olive-green-dial-228235 (6).jpg"
    ],
    video: "/Assets/Images/Watches/Rolex Day-Date 228235 Rose Gold Olive Green Dial/Rolex Day-Date 228235 Rose Gold Olive Green Dial.mp4",
    description: "The Rolex Day-Date 228235 in 18k Everose gold is a luxurious timepiece with a 40mm case, fluted bezel, and olive green dial. It features rose gold Roman numerals, a day display at 12 o'clock, and a date window at 3 o'clock with a Cyclops lens. The President bracelet offers comfort, while the Caliber 3255 movement ensures precision and a 70-hour power reserve. A perfect blend of elegance and functionality.",
    specialFeatures: [
      {
        featureName: "FLUTED BEZEL",
        featureDesc: "Signature Rolex design element, enhancing light reflection and elegance"
      },
      {
        featureName: "OLIVE GREEN DIAL",
        featureDesc: "Striking color choice, offering a modern twist on the classic Day-Date"
      },
      {
        featureName: "DAY-DATE FUNCTION",
        featureDesc: "Displays the day of the week and date, a hallmark of the Day-Date collection"
      },
      {
        featureName: "PRESIDENT BRACELET",
        featureDesc: "Iconic three-piece link bracelet, known for its comfort and luxury"
      },
      {
        featureName: "CALIBER 3255",
        featureDesc: "Rolex's in-house movement with exceptional precision and reliability"
      },
      {
        featureName: "18K EVEROSE GOLD",
        featureDesc: "Rolex's proprietary rose gold alloy, ensuring lasting color and durability"
      }
    ],
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "12.50 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.00 mm"
      },
      {
        specName: "Material",
        specValue: "18k Everose gold"
      },
      {
        specName: "Color",
        specValue: "Olive green"
      }
    ]
  },
  {
    id: "228239",
    name: "Rolex Datejust 40",
    brand: "Rolex",
    strapMaterial: "White Gold",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "White Gold",
    dialColor: "Blue",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 40600,
    image: "/Assets/Images/Watches/Rolex Day-Date 40.png",
    description: "The Rolex Datejust 40 is a versatile timepiece featuring a striking blue dial and white gold construction. Its automatic movement ensures precision and reliability. The iconic fluted bezel and Jubilee bracelet provide a perfect combination of elegance and comfort, making it suitable for both formal occasions and everyday wear.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "11.70 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "47.00 mm"
      },
      {
        specName: "Material",
        specValue: "White Gold"
      },
      {
        specName: "Color",
        specValue: "Blue"
      }
    ]
  },
  {
    id: "279171",
    name: "Rolex Lady-Datejust",
    brand: "Rolex",
    strapMaterial: "White Gold",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "White Gold",
    dialColor: "Else",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Female",
    price: 13650,
    image: "/Assets/Images/Watches/Rolex Lady Datejust.png",
    description: "The Rolex Lady-Datejust is a refined watch designed for women, combining elegance with technical achievement. Its white gold case and automatic movement exude sophistication and functionality. The diamond-set bezel adds a touch of luxury, while the President bracelet ensures comfortable wear throughout the day.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "28.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "10.50 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "35.00 mm"
      },
      {
        specName: "Material",
        specValue: "White Gold"
      },
      {
        specName: "Color",
        specValue: "Silver"
      }
    ]
  },
  {
    id: "31030445201001",
    name: "Omega Speedmaster Moonwatch Professional",
    brand: "Omega",
    strapMaterial: "Leather",
    movement: "Manual",
    waterResistance: "50m",
    caseMaterial: "Rose Gold",
    dialColor: "Green",
    stock: true,
    Vcollection: "Classic & Dress",
    gender:"Male",
    price: 8150,
    image: "/Assets/Images/Watches/Omega Speedmaster Moonwatch Professional-Green.png",
    description: "The Omega Speedmaster Moonwatch Professional in rose gold is a tribute to space exploration. Its green dial and manual movement make it a collector's favorite. This legendary chronograph features the same design and functionality that made it the first watch worn on the moon, now presented in a luxurious rose gold case with a distinctive green dial.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "42.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "13.80 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.00 mm"
      },
      {
        specName: "Material",
        specValue: "Rose Gold"
      },
      {
        specName: "Color",
        specValue: "Green"
      }
    ]
  },
  {
    id: "31030425001002",
    name: "Omega Speedmaster Moonwatch Steel-On-Steel",
    brand: "Omega",
    strapMaterial: "Metal",
    movement: "Manual",
    waterResistance: "50m",
    caseMaterial: "Stainless Steel",
    dialColor: "Black",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender:"Male",
    price: 8150,
    image: "/Assets/Images/Watches/Omega Speedmaster Moonwatch Steel-On-Steel.png",
    description: "The Omega Speedmaster Moonwatch Steel-On-Steel is a legendary chronograph with a black dial and stainless steel case. Its manual movement ensures precision and durability. This iconic timepiece maintains the same design that accompanied astronauts to the moon, featuring the distinctive tachymeter bezel and three sub-dials for precise time measurement.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "42.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "13.50 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "Black"
      }
    ]
  },
  {
    id: "43513402103001",
    name: "Omega De Ville Tresor",
    brand: "Omega",
    strapMaterial: "Leather",
    movement: "Automatic",
    waterResistance: "50m",
    caseMaterial: "Rose Gold",
    dialColor: "Black",
    stock: true,
    Vcollection: "Classic & Dress",
    gender: "Male",
    price: 5500,
    image: "/Assets/Images/Watches/De Ville Tresor.png",
    description: "The Omega De Ville Tresor is a classic dress watch with a black dial and rose gold case. Its automatic movement and leather strap add a touch of sophistication. The sleek, minimalist design features Roman numeral hour markers and a small seconds sub-dial, embodying timeless elegance suitable for formal occasions.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "11.00 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "45.00 mm"
      },
      {
        specName: "Material",
        specValue: "Rose Gold"
      },
      {
        specName: "Color",
        specValue: "Black"
      }
    ]
  },
  {
    id: "22012412103001",
    name: "Omega Seamaster Aqua Terra",
    brand: "Omega",
    strapMaterial: "Leather",
    movement: "Automatic",
    waterResistance: "150m",
    caseMaterial: "Stainless Steel",
    dialColor: "Blue",
    stock: true,
    Vcollection: "Sports & Adventure",
    gender: "Male",
    price: 7050,
    image: "/Assets/Images/Watches/Omega Seamaster Aqua Terra.png",
    description: "The Omega Seamaster Aqua Terra is a versatile sports watch with a blue dial and stainless steel case. Its water resistance and automatic movement make it ideal for adventure. The teak-patterned dial is inspired by luxury yacht decks, while the anti-magnetic movement ensures precision even in challenging environments.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "41.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "12.00 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "47.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "Blue"
      }
    ]
  },
  {
    id: "13120392102001",
    name: "Omega Constellation Co-Axial Master Chronometer",
    brand: "Omega",
    strapMaterial: "Metal",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "Stainless Steel",
    dialColor: "White",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Female",
    price: 7150,
    image: "/Assets/Images/Watches/Omega Constellation Co-Axial Master Chronometer.png",
    description: "The Omega Constellation Co-Axial Master Chronometer is a stylish watch for women. Its white dial and stainless steel case offer elegance and precision. Featuring the iconic 'Griffes' or claws at 3 and 9 o'clock, and a diamond-set bezel, this timepiece combines luxury with Omega's renowned technical excellence.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "29.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "10.00 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "36.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "White"
      }
    ]
  },
  {
    id: "T1166171604700",
    name: "Tissot Chrono XL Classic",
    brand: "Tissot",
    strapMaterial: "Metal",
    movement: "Quartz",
    waterResistance: "100m",
    caseMaterial: "Stainless Steel",
    dialColor: "Silver",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 415,
    image: "/Assets/Images/Watches/Tissot Chrono XL Classic.png",
    description: "The Tissot Chrono XL Classic is a reliable quartz chronograph with a silver dial and stainless steel case. Its large size and sporty design make it a standout choice. The three sub-dials provide stopwatch functionality, while the tachymeter scale on the bezel allows for speed calculations, making it both stylish and functional.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "45.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "12.50 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "52.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "Silver"
      }
    ]
  },
  {
    id: "T1014101603100",
    name: "Tissot PR 100",
    brand: "Tissot",
    strapMaterial: "Leather",
    movement: "Quartz",
    waterResistance: "100m",
    caseMaterial: "Stainless Steel",
    dialColor: "Grey",
    stock: true,
    Vcollection: "Classic & Dress",
    gender: "Male",
    price: 415,
    image: "/Assets/Images/Watches/Tissot PR 100.png",
    description: "The Tissot PR 100 is a classic quartz watch with a grey dial and leather strap. Its timeless design and durability make it perfect for everyday wear. The slim case profile and clean dial design with applied hour markers create a sophisticated look suitable for both business and casual occasions.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "9.50 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "46.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "Grey"
      }
    ]
  },
  {
    id: "T1374271104100",
    name: "Tissot PRX Automatic Chronograph 42mm",
    brand: "Tissot",
    strapMaterial: "Metal",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "Stainless Steel",
    dialColor: "White",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 2150,
    image: "/Assets/Images/Watches/Tissot PRX Automatic Chronograph 42mm.png",
    description: "The Tissot PRX Automatic Chronograph 42mm is a modern timepiece with a white dial and stainless steel case. Its automatic movement ensures precision and style. Inspired by 1970s design, the integrated bracelet and angular case create a distinctive look, while the chronograph function adds practical utility.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "42.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "14.50 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "White"
      }
    ]
  },
  {
    id: "T1374071104100",
    name: "Tissot PRX Powermatic 80",
    brand: "Tissot",
    strapMaterial: "Metal",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "Stainless Steel",
    dialColor: "Blue",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 1100,
    image: "/Assets/Images/Watches/Tissot PRX Powermatic 80.png",
    description: "The Tissot PRX Powermatic 80 is a sleek automatic watch with a blue dial and stainless steel case. Its 80-hour power reserve makes it a practical choice. The integrated bracelet design and waffle-patterned dial pay homage to 1970s watch aesthetics while offering modern reliability and comfort.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "10.90 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "46.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "Blue"
      }
    ]
  },
  {
    id: "T1096101107700",
    name: "Tissot Everytime 40mm",
    brand: "Tissot",
    strapMaterial: "Metal",
    movement: "Quartz",
    waterResistance: "30m",
    caseMaterial: "Stainless Steel",
    dialColor: "Green",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 255,
    image: "/Assets/Images/Watches/Tissot Everytime 40mm.png",
    description: "The Tissot Everytime 40mm is a minimalist quartz watch with a green dial and stainless steel case. Its clean design makes it a versatile accessory. The simple baton hour markers and slim profile create an understated elegance that works equally well with business attire or casual wear.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "8.50 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "45.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "Green"
      }
    ]
  },
  {
    id: "WSSA0018",
    name: "Cartier Santos de Cartier",
    brand: "Cartier",
    strapMaterial: "Metal",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "Stainless Steel",
    dialColor: "White",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 8600,
    image: "/Assets/Images/Watches/Santos de Cartier.png",
    description: "The Cartier Santos de Cartier is an iconic square watch with a white dial and stainless steel case. Its automatic movement and distinctive screw motif bezel make it instantly recognizable. Designed in 1904 as one of the first wristwatches for men, it combines historical significance with modern watchmaking technology.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "39.80 mm"
      },
      {
        specName: "Case Height",
        specValue: "9.08 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "47.50 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "White"
      }
    ]
  },
  {
    id: "WHSA0026",
    name: "Cartier Santos de Cartier Skeleton",
    brand: "Cartier",
    strapMaterial: "Metal",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "Stainless Steel",
    dialColor: "Else",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 32000,
    image: "/Assets/Images/Watches/Santos de Cartier Skeleton.png",
    description: "The Cartier Santos de Cartier Skeleton showcases the intricate mechanics of its automatic movement through a transparent dial. The stainless steel case retains the iconic Santos square shape and screw motif, while the skeletonized movement offers a fascinating view of the watch's inner workings, blending technical mastery with aesthetic appeal.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "39.80 mm"
      },
      {
        specName: "Case Height",
        specValue: "9.08 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "47.50 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "Skeleton"
      }
    ]
  },
  {
    id: "WSTA0041",
    name: "Cartier Tank Must",
    brand: "Cartier",
    strapMaterial: "Leather",
    movement: "Manual",
    waterResistance: "30m",
    caseMaterial: "Stainless Steel",
    dialColor: "Black",
    stock: true,
    Vcollection: "Classic & Dress",
    gender: "Male",
    price: 3350,
    image: "/Assets/Images/Watches/Cartier Tank Must.png",
    description: "The Cartier Tank Must is a rectangular watch with a black dial and leather strap, embodying timeless elegance. Its manual movement and clean design pay homage to the original Tank design from 1917. The Roman numeral hour markers and blue sword-shaped hands are signature Cartier elements that enhance its classic appeal.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "33.70 mm"
      },
      {
        specName: "Case Height",
        specValue: "6.60 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "44.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "Black"
      }
    ]
  },
  {
    id: "WSPN0007",
    name: "Cartier Panthère de Cartier",
    brand: "Cartier",
    strapMaterial: "Metal",
    movement: "Manual",
    waterResistance: "30m",
    caseMaterial: "Stainless Steel",
    dialColor: "White",
    stock: true,
    Vcollection: "Classic & Dress",
    gender: "Female",
    price: 4850,
    image: "/Assets/Images/Watches/Panthère de Cartier.png",
    description: "The Cartier Panthère de Cartier is a luxurious women's watch with a white dial and stainless steel case. Its manual movement and square design exude sophistication. Inspired by the grace of a panther, the watch features a sleek, flexible bracelet and Roman numeral hour markers, creating a perfect balance of elegance and strength.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "27.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "6.00 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "35.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless Steel"
      },
      {
        specName: "Color",
        specValue: "White"
      }
    ]
  },
  {
    id: "WGTA0010",
    name: "Cartier Tank Louis Cartier",
    brand: "Cartier",
    strapMaterial: "Leather",
    movement: "Manual",
    waterResistance: "30m",
    caseMaterial: "Silver",
    dialColor: "White",
    stock: true,
    Vcollection: "Classic & Dress",
    gender: "Male",
    price: 13550,
    image: "/Assets/Images/Watches/Tank Louis Cartier.png",
    description: "The Cartier Tank Louis Cartier is a refined rectangular watch with a white dial and silver case. Its manual movement and leather strap embody classic Cartier elegance. The watch's clean lines, Roman numerals, and blue sword-shaped hands maintain the purity of the original 1922 design, making it a timeless piece of horological art.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "33.70 mm"
      },
      {
        specName: "Case Height",
        specValue: "6.60 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "44.00 mm"
      },
      {
        specName: "Material",
        specValue: "Silver"
      },
      {
        specName: "Color",
        specValue: "White"
      }
    ]
  },
  {
    id: "15407ST.OO.1220ST.01",
    name: "Audemars Piguet Royal Oak Openworked \"Cactus Jack\"",
    brand: "Audemars Piguet",
    strapMaterial: "Leather",
    movement: "Automatic",
    waterResistance: "50m",
    caseMaterial: "Ceramic",
    dialColor: "Else",
    stock: true,
    Vcollection: "Luxury & Heritage",
    gender: "Male",
    price: 221000,
    image: "/Assets/Images/Watches/Audemars Piguet Royal Oak Openworked Cactus Jack.png",
    description: "The Audemars Piguet Royal Oak Openworked 'Cactus Jack' is a limited edition masterpiece featuring a ceramic case and skeletonized dial. Its automatic movement is fully visible through the openworked design, showcasing the intricate mechanics. The unique collaboration with Cactus Jack adds contemporary streetwear influence to this haute horology timepiece.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "41.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "9.90 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "50.00 mm"
      },
      {
        specName: "Material",
        specValue: "Ceramic"
      },
      {
        specName: "Color",
        specValue: "Openworked"
      }
    ]
  },
  {
    id: "26530ST.OO.1220ST.01",
    name: "Audemars Piguet Royal Oak Flying Tourbillon",
    brand: "Audemars Piguet",
    strapMaterial: "White Gold",
    movement: "Automatic",
    waterResistance: "50m",
    caseMaterial: "White Gold",
    dialColor: "Red",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 201000,
    image: "/Assets/Images/Watches/Audemars Piguet Royal Oak Flying Tourbillon.png",
    description: "The Audemars Piguet Royal Oak Flying Tourbillon features a striking red dial and white gold case. Its automatic movement includes a flying tourbillon complication, visible through the dial side. The iconic octagonal bezel with exposed screws and 'Tapisserie' patterned dial maintain the Royal Oak's distinctive aesthetic while showcasing advanced watchmaking technology.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "41.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "10.60 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "50.00 mm"
      },
      {
        specName: "Material",
        specValue: "White Gold"
      },
      {
        specName: "Color",
        specValue: "Red"
      }
    ]
  },
  {
    id: "15710ST.OO.A052CA.01",
    name: "Audemars Piguet Royal Oak Offshore Diver",
    brand: "Audemars Piguet",
    strapMaterial: "Rubber",
    movement: "Automatic",
    waterResistance: "300m",
    caseMaterial: "Stainless Steel",
    dialColor: "Green",
    stock: true,
    Vcollection: "Sports & Adventure",
    gender: "Male",
    price: 36200,
    image: "/Assets/Images/Watches/Audemars Piguet Royal Oak Offshore Diver.png",
    galleryImages: [
      "/Assets/Images/Watches/Model.png",
      "/Assets/Images/Watches/front_1.png",
      "/Assets/Images/Watches/front_2.png",
      "/Assets/Images/Watches/front_3.png",
      "/Assets/Images/Watches/back_view.png"
    ],
    video: "/Assets/Images/Watches/Audemars Piguet Royal Oak Offshore Diver.mp4",
    specialFeatures: [
      {
        featureName: "MÉGA TAPISSERIE DIAL",
        featureDesc: "Bold and textured dial design offering depth and enhanced legibility"
      },
      {
        featureName: "KHAKI GREEN TONE",
        featureDesc: "A unique and rugged color palette tailored for both style and sport"
      },
      {
        featureName: "PINK GOLD ACCENTS",
        featureDesc: "Applied gold elements provide a warm contrast and luxurious finish"
      },
      {
        featureName: "BLACK CERAMIC BEZEL",
        featureDesc: "Highly durable and scratch-resistant ceramic with modern appeal"
      },
      {
        featureName: "PROFESSIONAL DIVER CAPABILITIES",
        featureDesc: "Engineered for underwater exploration with reliable performance"
      },
      {
        featureName: "RUBBER STRAP",
        featureDesc: "Comfortable and versatile strap in khaki green for active wear"
      }
    ],
    specifications: [
      {
        specName: "Diameter",
        specValue: "42.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "14.10 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "53.00 mm"
      },
      {
        specName: "Material",
        specValue: "Stainless steel with black ceramic bezel"
      },
      {
        specName: "Color",
        specValue: "Khaki green"
      }
    ]
  },
  {
    id: "26470OR.OO.A002CA.01",
    name: "Audemars Piguet Royal Oak Offshore",
    brand: "Audemars Piguet",
    strapMaterial: "Rubber",
    movement: "Automatic",
    waterResistance: "100m",
    caseMaterial: "Rose Gold",
    dialColor: "Blue",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Female",
    price: 50500,
    image: "/Assets/Images/Watches/Audemars Piguet Royal Oak Offshore.png",
    description: "The Audemars Piguet Royal Oak Offshore is a bold luxury watch with a blue dial and rose gold case. Its automatic movement and rubber strap ensure durability and style. The larger case size and distinctive 'Méga Tapisserie' dial pattern create a sporty yet elegant aesthetic that stands out in any setting.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "42.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "14.40 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "54.00 mm"
      },
      {
        specName: "Material",
        specValue: "Rose Gold"
      },
      {
        specName: "Color",
        specValue: "Blue"
      }
    ]
  },
  {
    id: "15500OR.OO.D002CR.01",
    name: "Audemars Piguet Royal Oak",
    brand: "Audemars Piguet",
    strapMaterial: "Rose Gold",
    movement: "Automatic",
    waterResistance: "50m",
    caseMaterial: "Rose Gold",
    dialColor: "Green",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 82800,
    image: "/Assets/Images/Watches/Audemars Piguet Royal Oak.png",
    description: "The Audemars Piguet Royal Oak is an iconic timepiece with a green dial and rose gold case. Its automatic movement and timeless design make it a collector's favorite. The signature octagonal bezel with exposed screws and 'Petite Tapisserie' dial pattern remain true to the original 1972 design that revolutionized luxury sports watches.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "41.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "10.10 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "50.00 mm"
      },
      {
        specName: "Material",
        specValue: "Rose Gold"
      },
      {
        specName: "Color",
        specValue: "Green"
      }
    ]
  },
  {
    id: "3738R-001",
    name: "Patek Philippe Golden Ellipse Rose Gold",
    brand: "Patek Philippe",
    strapMaterial: "Rose Gold",
    movement: "Automatic",
    waterResistance: "30m",
    caseMaterial: "Rose Gold",
    dialColor: "Black",
    stock: true,
    Vcollection: "Classic & Dress",
    gender: "Male",
    price: 85000,
    image: "/Assets/Images/Watches/Patek Philippe Golden Ellipse Rose Gold.png",
    description: "The Patek Philippe Golden Ellipse Rose Gold is a masterpiece of elegance. Its black dial and rose gold case make it a luxurious choice for formal occasions. The unique oval case shape, based on the golden ratio, creates perfect proportions that have made this model an icon of understated sophistication since 1968.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "34.50 mm"
      },
      {
        specName: "Case Height",
        specValue: "6.80 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "39.50 mm"
      },
      {
        specName: "Material",
        specValue: "Rose Gold"
      },
      {
        specName: "Color",
        specValue: "Black"
      }
    ]
  },
  {
    id: "5711/1P-001",
    name: "Patek Philippe Nautilus",
    brand: "Patek Philippe",
    strapMaterial: "White Gold",
    movement: "Automatic",
    waterResistance: "120m",
    caseMaterial: "White Gold",
    dialColor: "Blue",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 35000,
    image: "/Assets/Images/Watches/Patek Philippe Nautilus White Gold.png",
    description: "The Patek Philippe Nautilus is a luxury sports watch with a blue dial and white gold case. Its automatic movement and water resistance make it a versatile choice. Inspired by a ship's porthole, the rounded octagonal bezel and horizontally embossed dial create a distinctive look that has defined this collection since 1976.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.00 mm"
      },
      {
        specName: "Case Height",
        specValue: "8.30 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.00 mm"
      },
      {
        specName: "Material",
        specValue: "White Gold"
      },
      {
        specName: "Color",
        specValue: "Blue"
      }
    ]
  },
  {
    id: "5167R-001",
    name: "Patek Philippe Aquanaut Rose Gold",
    brand: "Patek Philippe",
    strapMaterial: "Rubber",
    movement: "Automatic",
    waterResistance: "120m",
    caseMaterial: "Rose Gold",
    dialColor: "Brown",
    stock: true,
    Vcollection: "Casual & Everyday",
    gender: "Male",
    price: 62000,
    image: "/Assets/Images/Watches/Patek Philippe Aquanaut Rose Gold.png",
    description: "The Patek Philippe Aquanaut Rose Gold is a modern luxury watch with a brown dial and rose gold case. Its rubber strap and water resistance make it perfect for active lifestyles. The embossed checkerboard pattern dial and rounded octagonal case create a contemporary aesthetic while maintaining Patek Philippe's tradition of excellence.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "40.80 mm"
      },
      {
        specName: "Case Height",
        specValue: "8.10 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.50 mm"
      },
      {
        specName: "Material",
        specValue: "Rose Gold"
      },
      {
        specName: "Color",
        specValue: "Brown"
      }
    ]
  },
  {
    id: "5208T-010",
    name: "Patek Philippe Grand Complications",
    brand: "Patek Philippe",
    strapMaterial: "Leather",
    movement: "Automatic",
    waterResistance: "30m",
    caseMaterial: "Titanium",
    dialColor: "Black",
    stock: true,
    Vcollection: "Luxury & Heritage",
    gender: "Male",
    price: 200000,
    image: "/Assets/Images/Watches/Patek Philippe Grand Complications.png",
    description: "The Patek Philippe Grand Complications is a pinnacle of watchmaking artistry. Its black dial, titanium case, and intricate complications make it a true masterpiece. Featuring a perpetual calendar, minute repeater, and chronograph, this timepiece represents the highest level of technical achievement in mechanical watchmaking.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "42.20 mm"
      },
      {
        specName: "Case Height",
        specValue: "14.20 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "50.00 mm"
      },
      {
        specName: "Material",
        specValue: "Titanium"
      },
      {
        specName: "Color",
        specValue: "Black"
      }
    ]
  },
  {
    id: "5236P-001",
    name: "Patek Philippe In-line Perpetual Calendar",
    brand: "Patek Philippe",
    strapMaterial: "Leather",
    movement: "Automatic",
    waterResistance: "30m",
    caseMaterial: "White Gold",
    dialColor: "Blue",
    stock: true,
    Vcollection: "Luxury & Heritage",
    gender: "Male",
    price: 200000,
    image: "/Assets/Images/Watches/Patek Philippe In-line Perpetual Calendar.png",
    description: "The Patek Philippe In-line Perpetual Calendar is a technical marvel with a blue dial and white gold case. Its perpetual calendar complication showcases exceptional craftsmanship. The unique in-line display of calendar information creates a clean, symmetrical layout that enhances readability while maintaining the collection's elegant aesthetic.",
    specifications: [
      {
        specName: "Diameter",
        specValue: "41.30 mm"
      },
      {
        specName: "Case Height",
        specValue: "11.07 mm"
      },
      {
        specName: "Lug-to-Lug",
        specValue: "48.00 mm"
      },
      {
        specName: "Material",
        specValue: "White Gold"
      },
      {
        specName: "Color",
        specValue: "Blue"
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(' Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    console.log(' Existing products deleted');

    // Insert new products
    await Product.insertMany(products);
    console.log(' Products seeded successfully');

    // Exit process
    process.exit(0);
  } catch (err) {
    console.error(' Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();