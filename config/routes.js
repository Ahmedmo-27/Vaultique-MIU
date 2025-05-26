const routes = {
  // Main pages
  home: '/',
  welcome: '/welcome',

  // User pages
  user: {
    account: '/user/account',
    contactUs: '/user/contact-us',
    wishlist: '/user/wishlist',
    shoppingCart: '/user/shopping-cart',
    collections: '/user/collections',
    products: '/user/products',
    recommendation: '/user/recommendation',
    brands: '/user/brands',
    brandDetail: '/user/brands/:brandSlug',
    collectionDetail: '/user/collections/:collectionSlug',
  },

  // Collections
  collections: {
    classicAndDress: '/user/collections/classic-and-dress',
    casualAndEveryday: '/user/collections/casual-and-everyday',
    sportsAndAdventure: '/user/collections/sports-and-adventure',
    aviationAndTravel: '/user/collections/aviation-and-travel',
    luxuryAndHeritage: '/user/collections/luxury-and-heritage',
  },

  // Brands
  brands: {
    rolex: '/user/brands/rolex',
    omega: '/user/brands/omega',
    cartier: '/user/brands/cartier',
    patekPhilippe: '/user/brands/patek-philippe',
    audemarsPiguet: '/user/brands/audemars-piguet',
    langeSohne: '/user/brands/lange-sohne',
    vacheronConstantin: '/user/brands/vacheron-constantin',
    jacobCo: '/user/brands/jacob-co',
    richardMille: '/user/brands/richard-mille',
    breitling: '/user/brands/breitling',
  },

  // API routes
  api: {
    products: '/api/products',
    brands: '/api/brands',
    collections: '/api/collections',
    users: '/api/users',
  },
};

module.exports = routes;
