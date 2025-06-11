// Constants and Configuration
const CONFIG = {
  LAZY_LOAD_THRESHOLD: 0.5,
};

// State Management
const state = {
  pageType: null, // 'collection' or 'brand'
  currentEntity: null,
};

// Global error handler for message port errors
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('message port closed')) {
    console.warn('Message port closed - this is expected behavior and can be safely ignored');
    event.preventDefault();
    return true;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    event.reason.message &&
    event.reason.message.includes('message port closed')
  ) {
    console.warn('Message port closed - this is expected behavior and can be safely ignored');
    event.preventDefault();
    return true;
  }
});

// Helper functions for normalizing names
function normalizeCollectionName(name) {
  const collectionNameMap = {
    'classic-dress': 'Classic & Dress Collection',
    'casual-everyday': 'Casual & Everyday Collection',
    'sports-adventure': 'Sports & Adventure Collection',
    'aviation-travel': 'Aviation & Travel Collection',
    'luxury-heritage': 'Luxury & Heritage Collection',
    Classic: 'Classic & Dress Collection',
    Casual: 'Casual & Everyday Collection',
    Sports: 'Sports & Adventure Collection',
    Aviation: 'Aviation & Travel Collection',
    Luxury: 'Luxury & Heritage Collection',
  };
  return collectionNameMap[name] || name;
}

function normalizeBrandName(name) {
  const brandNameMap = {
    rolex: 'Rolex',
    omega: 'Omega',
    cartier: 'Cartier',
    'patek-philippe': 'Patek Philippe',
    patek: 'Patek Philippe',
    'audemars-piguet': 'Audemars Piguet',
    ap: 'Audemars Piguet',
    'a-lange-sohne': 'A.Lange & Söhne',
    lange: 'A.Lange & Söhne',
    'A.lange ': 'A.Lange & Söhne',
    'vacheron-constantin': 'Vacheron Constantin',
    vc: 'Vacheron Constantin',
    'jacob-co': 'Jacob & Co',
    'Jacob ': 'Jacob & Co',
    'richard-mille': 'Richard Mille',
    rm: 'Richard Mille',
    breitling: 'Breitling',
  };
  return brandNameMap[name.toLowerCase()] || name;
}

// Slider initialization function
function initSlider(featuredItems) {
  if (!featuredItems || featuredItems.length === 0) {
    console.warn(`No featured items found for this ${state.pageType}`);
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
      sliderContainer.style.display = 'none';
    }
    return;
  }

  const slidesWrapper = document.querySelector('.slides-wrapper');
  const paginationSlider = document.querySelector('.pagination-slider');

  if (!slidesWrapper || !paginationSlider) {
    console.error('Slider elements not found in the DOM');
    return;
  }

  console.log('Creating slider with', featuredItems.length, 'items');

  // Clear existing content
  slidesWrapper.innerHTML = '';
  paginationSlider.innerHTML = '';

  // Create slides
  featuredItems.forEach((item, index) => {
    if (!item || !item.name) {
      console.warn('Invalid item data at index', index);
      return;
    }

    const slide = document.createElement('div');
    slide.className = `slide ${index === 0 ? 'active' : ''}`;
    slide.dataset.model = index + 1;

    slide.innerHTML = `
      <div class="slide-content">
        <div class="watch-info">
          <h1 class="watch-title">${item.name || 'Untitled'}</h1>
          <h2 class="watch-tagline">${item.tagline || ''}</h2>
          <p class="watch-description">${item.description || ''}</p>
        </div>
        <div class="watch-image-container">
          <img src="${item.image || ''}" alt="${item.name || 'Watch image'}" class="watch-image" onerror="this.style.display='none'">
        </div>
      </div>
    `;

    slidesWrapper.appendChild(slide);
  });

  // Only create pagination if we have valid slides
  if (slidesWrapper.children.length > 0) {
    // Create pagination dots
    featuredItems.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      paginationSlider.appendChild(dot);
    });

    console.log(
      'Slider created with',
      slidesWrapper.children.length,
      'slides and',
      paginationSlider.children.length,
      'dots'
    );
  } else {
    console.warn('No valid slides were created');
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
      sliderContainer.style.display = 'none';
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Determine page type
  const isCollectionPage = window.location.pathname.includes('/collections/');
  const isBrandPage = window.location.pathname.includes('/brands/');
  
  if (isCollectionPage) {
    state.pageType = 'collection';
  } else if (isBrandPage) {
    state.pageType = 'brand';
  }
});