// Global variables
let currentPage = 1;
let totalPages = 1;
let currentSort = 'default';
let currentFilters = {};
let quickViewModal = null;
let quickViewOverlay = null;

// DOM Elements
let productGrid;
let prevPageBtn;
let nextPageBtn;
let pageInfo;

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  // Initialize DOM elements
  productGrid = document.getElementById('productGrid');
  prevPageBtn = document.getElementById('prevPage');
  nextPageBtn = document.getElementById('nextPage');
  pageInfo = document.getElementById('pageInfo');

  if (!productGrid) {
    console.error('Product grid container not found!');
    return;
  }

  // Create quick view modal elements
  quickViewModal = document.createElement('div');
  quickViewModal.id = 'quickView';
  quickViewModal.className = 'quick-view-modal';
  document.body.appendChild(quickViewModal);

  quickViewOverlay = document.createElement('div');
  quickViewOverlay.id = 'quickViewOverlay';
  quickViewOverlay.className = 'quick-view-overlay';
  document.body.appendChild(quickViewOverlay);

  // Initialize from server-side data if available
  if (window.initialState) {
    const { products, pagination, filters } = window.initialState;

    if (pagination) {
      currentPage = pagination.currentPage || 1;
      totalPages = pagination.totalPages || 1;
    }

    if (filters && filters.current) {
      currentFilters = filters.current;
    }

    // Only render if we have products
    if (products && products.length > 0) {
      renderProducts(products);
      updatePaginationUI();
    } else {
      loadProducts();
    }
  } else {
    loadProducts();
  }

  initializeFilters();
  setupEventListeners();
}

function initializeFilters() {
  try {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Set dropdown values from current filters
    const filterElements = {
      collection: 'Vcollection',
      brand: 'brand',
      gender: 'gender',
      Strap_Material: 'strapMaterial',
      Movement: 'movement',
      Water_Resistance: 'waterResistance',
      Case_Material: 'caseMaterial',
    };

    // Set dropdown values
    Object.entries(filterElements).forEach(([elementId, paramName]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.value = urlParams.get(paramName) || 'All';
      }
    });

    // Set price range
    const priceRangeFrom = document.getElementById('priceRangeFrom');
    const priceRangeTo = document.getElementById('priceRangeTo');
    if (priceRangeFrom) {
      priceRangeFrom.value = urlParams.get('minPrice') || '0';
    }
    if (priceRangeTo) {
      priceRangeTo.value = urlParams.get('maxPrice') || '50000000';
    }

    // Set dial colors
    const dialColors = urlParams.get('dialColor');
    if (dialColors && dialColors !== 'All') {
      const colorArray = dialColors.split(',');
      const dialColorCheckboxes = document.querySelectorAll('.dial-color');
      if (dialColorCheckboxes.length > 0) {
        dialColorCheckboxes.forEach((checkbox) => {
          if (checkbox) {
            checkbox.checked = colorArray.includes(checkbox.value);
          }
        });
      }
    } else {
      // If no dial colors specified or 'All' selected, check the 'All' checkbox
      const allDialColorCheckbox = document.querySelector('.dial-color[value="All"]');
      if (allDialColorCheckbox) {
        allDialColorCheckbox.checked = true;
      }
    }

    // Set in stock filter
    const inStockFilter = document.getElementById('inStockFilter');
    if (inStockFilter) {
      inStockFilter.checked = urlParams.get('inStock') === 'true';
    }

    // Set sort option
    const sortButtons = document.querySelectorAll('[data-sort]');
    if (sortButtons.length > 0) {
      const currentSort = urlParams.get('sort') || 'default';
      sortButtons.forEach((button) => {
        if (button) {
          button.classList.toggle('active', button.dataset.sort === currentSort);
        }
      });
    }
  } catch (error) {
    console.error('Error initializing filters:', error);
  }
}

function setupEventListeners() {
  // Sort buttons
  document.querySelectorAll('[data-sort]').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      currentSort = this.dataset.sort;
      currentPage = 1;
      loadProducts();
    });
  });

  // Pagination
  if (prevPageBtn && nextPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadProducts();
      }
    });

    nextPageBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadProducts();
      }
    });
  }

  // Filter panel
  document
    .querySelector('[data-action="open-filter-panel"]')
    ?.addEventListener('click', openFilterPanel);
  document
    .querySelector('[data-action="close-filter-panel"]')
    ?.addEventListener('click', closeFilterPanel);
  document.getElementById('overlay')?.addEventListener('click', closeFilterPanel);

  // Filter submit
  const submitBtn = document.querySelector('.submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      currentPage = 1;
      updateCurrentFilters();
      loadProducts();
    });
  }

  // Clear filters
  const clearBtn = document.querySelector('.clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      resetFilters();
      currentPage = 1;
      loadProducts();
    });
  }

  // Keyboard events
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFilterPanel();
    }
  });

  // Wishlist icon click handler
  document.addEventListener('click', async function(e) {
    const wishlistIcon = e.target.closest('.wishlist-icon');
    if (wishlistIcon) {
      const productId = wishlistIcon.getAttribute('data-product-id');
      try {
        const response = await fetch('/user/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });
        const data = await response.json();
        if (data.success) {
          const heart = wishlistIcon.querySelector('.heart');
          if (data.inWishlist) {
            heart.classList.add('filled');
            wishlistIcon.classList.add('filled');
            heart.style.fill = 'red';
          } else {
            heart.classList.remove('filled');
            wishlistIcon.classList.remove('filled');
            heart.style.fill = 'transparent';
          }
          // Show notification
          showNotification(data.message, 'success');
        } else {
          showNotification(data.message || 'Failed to update wishlist', 'error');
        }
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        showNotification('Failed to update wishlist. Please try again.', 'error');
      }
    }
  });

  // Add event listeners for quick view buttons
  document.querySelectorAll('.quick-view').forEach((button) => {
    button.addEventListener('click', function () {
      const productCard = this.closest('.product-card');
      const productData = JSON.parse(productCard.dataset.product);
      toggleQuickView(productData);
    });
  });

  // Add wishlist button event listener
  document.querySelectorAll('.wishlist-btn').forEach((button) => {
    button.addEventListener('click', async function() {
      const productId = this.dataset.productId;
      try {
        const response = await fetch('/user/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });
        const data = await response.json();
        if (data.success) {
          const icon = this.querySelector('i');
          if (data.inWishlist) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.classList.add('filled');
          } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.classList.remove('filled');
          }
          // Show notification
          showNotification(data.message, 'Item added to wishlist');
        } else {
          showNotification(data.message || 'Failed to update wishlist', 'error');
        }
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        showNotification('Failed to update wishlist. Please try again.', 'error');
      }
    });
  });
}

async function loadProducts() {
  try {
    // Merge current filters with any new ones
    updateCurrentFilters();

    const queryString = new URLSearchParams({
      ...currentFilters,
      page: currentPage,
      sort: currentSort,
      format: 'json',
    }).toString();

    console.log('Fetching products with query:', queryString);
    const response = await fetch(`/api/products?${queryString}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    // Update pagination info from the response
    if (result.data && result.data.pagination) {
      totalPages = result.data.pagination.totalPages;
      currentPage = result.data.pagination.currentPage;
    }

    updatePaginationUI();
    renderProducts(result.data.products || []);
  } catch (error) {
    console.error('Error loading products:', error);
    
    // Show a more descriptive error message based on the error
    let errorMessage = 'Failed to load products. Please try again later.';
    if (error.message.includes('status: 500')) {
      errorMessage = 'Server error occurred. The development team has been notified.';
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    showNotification('error', errorMessage);
    
    // Display a message in the product grid
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="error-message">
          <p>${errorMessage}</p>
          <button onclick="loadProducts()">Try Again</button>
        </div>
      `;
    }
  }
}

function renderProducts(products) {
  if (!productGrid) return;

  productGrid.innerHTML = products.map(product => `
    <div class="product-card" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
      <div class="product-image-container">
        <div class="wishlist-icon ${product.inWishlist ? 'filled' : ''}" data-product-id="${product._id}">
          <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path class="heart ${product.inWishlist ? 'filled' : ''}" 
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 .81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78 -3.4 6.86 -8.55 11.54L12 21.35z"
                  style="fill: ${product.inWishlist ? 'red' : 'transparent'}"/>
          </svg>
        </div>
        <a href="/user/product?id=${product._id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </a>
        <div class="hover-buttons">
          <button class="quick-view" data-product-id="${product._id}">Quick View</button>
          <button class="compare" data-product-id="${product._id}" >Compare</button>
        </div>
      </div>
      <div class="product-details">
        <a href="/user/product?id=${product._id}">
          <h4>${product.name}</h4>
        </a>
        <p class="price">$${product.price.toLocaleString()}</p>
        ${product.stock || (product.stockCount && product.stockCount > 0) 
          ? '<p class="stock in-stock">In Stock</p>' 
          : '<p class="stock out-of-stock">Out of Stock</p>'}
      </div>
    </div>
  `).join('');

  addProductCardEventListeners();
}

function addProductCardEventListeners() {
  // Add event listeners for quick view buttons
  document.querySelectorAll('.quick-view').forEach((button) => {
    button.addEventListener('click', function () {
      const productCard = this.closest('.product-card');
      const productData = JSON.parse(productCard.dataset.product);
      toggleQuickView(productData);
    });
  });

  // Add event listeners for compare buttons
  document.querySelectorAll('.compare').forEach((button) => {
    button.addEventListener('click', async function() {
      const productId = this.dataset.productId;
      try {
        const response = await fetch('/user/compare/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });
        const data = await response.json();
        if (data.success) {
          showNotification('success', 'Product added to comparison list!');
        } else {
          showNotification('error', data.message || 'Failed to add product to comparison list');
        }
      } catch (error) {
        console.error('Error adding to comparison:', error);
        showNotification('error', 'An error occurred while adding to comparison list');
      }
    });
  });
}

function updatePaginationUI() {
  if (!prevPageBtn || !nextPageBtn || !pageInfo) return;

  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function updateCurrentFilters() {
  // Store current brand/collection values
  const currentBrand = document.getElementById('brand')?.value || 'All';
  const currentCollection = document.getElementById('collection')?.value || 'All';

  currentFilters = {
    Vcollection: currentCollection,
    brand: currentBrand,
    gender: document.getElementById('gender')?.value || 'All',
    strapMaterial: document.getElementById('Strap_Material')?.value || 'All',
    movement: document.getElementById('Movement')?.value || 'All',
    waterResistance: document.getElementById('Water_Resistance')?.value || 'All',
    caseMaterial: document.getElementById('Case_Material')?.value || 'All',
    minPrice: document.getElementById('priceRangeFrom')?.value || '',
    maxPrice: document.getElementById('priceRangeTo')?.value || '',
    dialColor: getSelectedDialColors(),
    inStock: document.getElementById('inStockFilter')?.checked ? 'true' : 'false',
    sort: currentSort,
  };
}

function openFilterPanel() {
  document.getElementById('filterPanel').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}

function closeFilterPanel() {
  document.getElementById('filterPanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

function getSelectedDialColors() {
  const checkboxes = document.querySelectorAll('.dial-color:checked');
  const selected = Array.from(checkboxes).map((cb) => cb.value);
  return selected.includes('All') ? 'All' : selected.join(',');
}

function resetFilters() {
  // Store current brand/collection values
  const currentBrand = document.getElementById('brand')?.value || 'All';
  const currentCollection = document.getElementById('collection')?.value || 'All';

  const resetElements = [
    { id: 'gender', value: 'All' },
    { id: 'Strap_Material', value: 'All' },
    { id: 'Movement', value: 'All' },
    { id: 'Water_Resistance', value: 'All' },
    { id: 'Case_Material', value: 'All' },
    { id: 'priceRangeFrom', value: 0 },
    { id: 'priceRangeTo', value: 500000 },
  ];

  resetElements.forEach((el) => {
    const element = document.getElementById(el.id);
    if (element) element.value = el.value;
  });

  // Restore brand/collection values
  const brandSelect = document.getElementById('brand');
  const collectionSelect = document.getElementById('collection');
  if (brandSelect) brandSelect.value = currentBrand;
  if (collectionSelect) collectionSelect.value = currentCollection;

  document.querySelectorAll('.dial-color').forEach((checkbox) => {
    checkbox.checked = checkbox.value === 'All';
  });

  document.getElementById('inStockFilter').checked = false;
  currentSort = 'default';
}

function toggleQuickView(product = null) {
  if (!quickViewModal || !quickViewOverlay) return;

  const isOpening = !quickViewModal.classList.contains('open');

  if (isOpening && product) {
    // Create thumbnail items - use galleryImages if available, otherwise just the main image
    const thumbnails =
      product.galleryImages && product.galleryImages.length > 0
        ? product.galleryImages
            .map(
              (img, idx) => `
          <div class="thumbnail ${idx === 0 ? 'active' : ''}" data-image="${img.startsWith('/') ? img : `/public/Assets/Images/Watches/${img}`}">
            <img src="${img.startsWith('/') ? img : `/public/Assets/Images/Watches/${img}`}" alt="Thumbnail ${idx + 1}">
          </div>
        `
            )
            .join('')
        : `
          <div class="thumbnail active" data-image="${product.image.startsWith('/') ? product.image : `/public/Assets/Images/Watches/${product.image}`}">
            <img src="${product.image.startsWith('/') ? product.image : `/public/Assets/Images/Watches/${product.image}`}" alt="Product Thumbnail">
          </div>
        `;

    quickViewModal.innerHTML = `
      <button class="close-btn" id="closeQuickView">✖</button>
      <div class="quick-view-content">
        <section class="product-gallery">
          <div class="all_image">
            <div class="main-image">
              <img src="${product.image.startsWith('/') ? product.image : `/public/Assets/Images/Watches/${product.image}`}" alt="${product.name}" id="quickViewMainImage">
            </div>
            <div class="thumbnail-container">
              ${thumbnails}
            </div>
          </div>
        </section>
        
        <div class="product-info">
          <div class="product-header">
            <h1>${product.name}</h1>
            <div class="product-meta">
              <div class="price-qv">$${product.price.toLocaleString()}</div>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="wishlist-btn" data-product-id="${product._id}">
              <i class="far fa-heart"></i>
            </button>
            <button class="add-to-cart" data-product-id="${product._id}">
              <i class="fas fa-shopping-bag"></i> Add to Cart
            </button>
            <button class="find-store">
              <i class="fas fa-map-marker-alt"></i> View 3D Model
            </button>
          </div>
          
          <div class="product-description">
            <p>${product.description || 'No description available'}</p>
          </div>
        </div>
      </div>
    `;

    // Add event listeners after rendering
    document.getElementById('closeQuickView').addEventListener('click', toggleQuickView);

    // Add thumbnail click handlers
    document.querySelectorAll('.thumbnail-container .thumbnail').forEach((thumb) => {
      thumb.addEventListener('click', function () {
        const newImageSrc = this.getAttribute('data-image');
        const mainImage = document.getElementById('quickViewMainImage');
        mainImage.src = newImageSrc;
        document.querySelectorAll('.thumbnail').forEach((t) => t.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Add zoom functionality to quick view image
    const quickViewImage = document.getElementById('quickViewMainImage');
    let isZoomed = false;
    let originalTransform = '';

    quickViewImage.parentElement.addEventListener('click', function(e) {
      if (!isZoomed) {
        // Zoom in
        originalTransform = quickViewImage.style.transform;
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate zoom center point
        const centerX = (x / rect.width) * 100;
        const centerY = (y / rect.height) * 100;
        
        quickViewImage.style.transform = `scale(2)`;
        quickViewImage.style.transformOrigin = `${centerX}% ${centerY}%`;
        this.style.cursor = 'zoom-out';
        isZoomed = true;
      } else {
        // Zoom out
        quickViewImage.style.transform = originalTransform;
        this.style.cursor = 'zoom-in';
        isZoomed = false;
      }
    });

    // Add add-to-cart button event listener
    document.querySelector('.add-to-cart').addEventListener('click', function () {
      const productId = this.dataset.productId;
      addToCartFromQuickView(productId);
    });
  }

  // Toggle visibility
  quickViewModal.classList.toggle('open');
  quickViewOverlay.classList.toggle('show');

  // Close when clicking overlay
  quickViewOverlay.onclick = () => {
    quickViewModal.classList.remove('open');
    quickViewOverlay.classList.remove('show');
  };
}

function createModal(title, content, buttons = []) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';

  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.innerHTML = `
      <h3>${title}</h3>
      <span class="close-modal">&times;</span>
  `;

  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.innerHTML = content;

  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';

  buttons.forEach((button) => {
    const btn = document.createElement('button');
    btn.className = button.class || 'confirm-btn';
    btn.textContent = button.text;
    if (button.clickHandler) {
      btn.addEventListener('click', button.clickHandler);
    }
    modalFooter.appendChild(btn);
  });

  modalContainer.appendChild(modalHeader);
  modalContainer.appendChild(modalBody);
  modalContainer.appendChild(modalFooter);
  modal.appendChild(modalContainer);

  document.body.appendChild(modal);

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 50); // Reduced from 2000ms to 50ms for better UX

  // Close modal handlers
  modal.querySelector('.close-modal').addEventListener('click', () => {
    closeModal(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  return modal;
}

function closeModal(modal) {
  modal.classList.remove('show');
  setTimeout(() => {
    modal.remove();
  }, 300);
}

function addToCartFromQuickView(productId) {
  console.log(`Adding product ${productId} to cart`);
  // cart addition logic here
  toggleQuickView(); // Close the modal
}

// Add to cart function
async function addToCart(productId) {
  try {
    const response = await fetch('/user/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (data.success) {
      showNotification('success', 'Product added to cart successfully');
    } else {
      showNotification('error', data.message || 'Failed to add product to cart');
    }
  } catch (error) {
    showNotification('error', 'Failed to add product to cart');
  }
}

// Remove from cart function
async function removeFromCart(productId) {
  showConfirmation('Are you sure you want to remove this item from your cart?', async () => {
    try {
      const response = await fetch('/user/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Product removed from cart successfully');
        // Refresh cart or update UI
        location.reload();
      } else {
        showNotification('error', data.message || 'Failed to remove product from cart');
      }
    } catch (error) {
      showNotification('error', 'Failed to remove product from cart');
    }
  });
}

// Add to wishlist function
async function addToWishlist(productId) {
  try {
    const response = await fetch('/user/wishlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (data.success) {
      showNotification('success', 'Product added to wishlist successfully');
    } else {
      showNotification('error', data.message || 'Failed to add product to wishlist');
    }
  } catch (error) {
    showNotification('error', 'Failed to add product to wishlist');
  }
}

// Remove from wishlist function
async function removeFromWishlist(productId) {
  showConfirmation('Are you sure you want to remove this item from your wishlist?', async () => {
    try {
      const response = await fetch('/user/wishlist/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Product removed from wishlist successfully');
        // Refresh wishlist or update UI
        location.reload();
      } else {
        showNotification('error', data.message || 'Failed to remove product from wishlist');
      }
    } catch (error) {
      showNotification('error', 'Failed to remove product from wishlist');
    }
  });
}

// Make functions available globally
window.toggleQuickView = toggleQuickView;
window.loadProducts = loadProducts;
window.resetFilters = resetFilters;
window.openFilterPanel = openFilterPanel;
window.closeFilterPanel = closeFilterPanel;

// Add the showErrorModal function to show error notifications
function showErrorModal(error) {
  showNotification('error', error.message || 'An error occurred. Please try again later.');
}
