// Global variables
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
let quickViewModal = null;
let quickViewOverlay = null;
let isLoading = false;

// DOM Elements
let productGrid;
let prevPageBtn;
let nextPageBtn;
let pageInfo;

// Utility functions
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <div class="error-content">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
      <button onclick="retryLoading()" class="retry-btn">Retry</button>
    </div>
  `;
  if (productGrid) {
    productGrid.innerHTML = '';
    productGrid.appendChild(errorDiv);
  }
}

function showLoadingState() {
  if (!productGrid) return;
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-spinner';
  loadingDiv.innerHTML = `
    <div class="spinner"></div>
    <p>Loading products...</p>
  `;
  productGrid.innerHTML = '';
  productGrid.appendChild(loadingDiv);
}

function removeLoadingState() {
  const spinner = document.querySelector('.loading-spinner');
  if (spinner) {
    spinner.remove();
  }
}

function sanitizeProductData(product) {
  if (!product) return null;
  return {
    _id: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    stock: product.stock,
    stockCount: product.stockCount,
    inWishlist: product.inWishlist,
    description: product.description,
    brand: product.brand,
    Vcollection: product.Vcollection
  };
}

function retryLoading() {
  loadProducts();
}

// Debounce function for filter changes
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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
  } catch (error) {
    console.error('Error initializing filters:', error);
  }
}

function setupEventListeners() {
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
      const form = document.querySelector('.filter-form');
      if (form) {
        form.submit();
      }
    });
  }

  // Clear filters
  const clearBtn = document.querySelector('.clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      resetFilters();
      const form = document.querySelector('.filter-form');
      if (form) {
        form.submit();
      }
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

  // Add sorting event listeners
  document.querySelectorAll('.sort-options button').forEach(button => {
    button.addEventListener('click', function() {
      const sortValue = this.getAttribute('data-sort');
      updateSort(sortValue);
    });
  });
}

async function loadProducts() {
  if (isLoading) return;
  
  try {
    isLoading = true;
    showLoadingState();
    
    // Merge current filters with any new ones
    updateCurrentFilters();

    // Get the current collection name from the page
    const collectionName = document.querySelector('select[name="Vcollection"] option[selected]')?.value || 'All';
    
    const queryString = new URLSearchParams({
      ...currentFilters,
      Vcollection: collectionName,
      page: currentPage,
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
  } catch (error) {
    console.error('Error loading products:', error);
    showError(error.message || 'Failed to load products. Please try again.');
  } finally {
    isLoading = false;
    removeLoadingState();
  }
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

  document.querySelectorAll('.dial-color').forEach((checkbox) => {
    checkbox.checked = checkbox.value === 'All';
  });

  document.getElementById('inStockFilter').checked = false;
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

async function addToCartFromQuickView(productId) {
  try {
    const response = await fetch('/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        productId,
        quantity: 1 
      }),
    });

    const data = await response.json();

    if (data.success) {
      showNotification('success', 'Product added to cart successfully');
      // Update cart count if element exists
      const cartCount = document.getElementById('cart-items-count');
      if (cartCount) {
        cartCount.textContent = data.cart.items.reduce((total, item) => total + (item.quantity || 1), 0);
      }
      toggleQuickView(); // Close the modal
    } else {
      showNotification('error', data.message || 'Failed to add product to cart');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showNotification('error', 'Failed to add product to cart');
  }
}

// Function to add item to cart
async function addToCart(productId, quantity = 1) {
    try {
        console.log('Adding to cart:', { productId, quantity });
        
        if (!productId) {
            throw new Error('Product ID is required');
        }

        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        });

        console.log('Cart response status:', response.status);
        const data = await response.json();
        console.log('Cart response data:', data);

        if (!response.ok) {
            let errorMessage = data.message || 'Failed to add to cart';
            
            // Handle specific error cases
            switch (data.code) {
                case 'MISSING_PRODUCT_ID':
                    errorMessage = 'Please select a product to add to cart';
                    break;
                case 'INVALID_QUANTITY':
                    errorMessage = 'Quantity must be at least 1';
                    break;
                case 'PRODUCT_NOT_FOUND':
                    errorMessage = 'This product is no longer available';
                    break;
                case 'OUT_OF_STOCK':
                    errorMessage = 'This product is currently out of stock';
                    break;
                case 'INSUFFICIENT_STOCK':
                    errorMessage = `Only ${data.availableStock} items available in stock`;
                    break;
                case 'SERVER_ERROR':
                    console.error('Server error details:', data.details);
                    errorMessage = 'An unexpected error occurred. Please try again.';
                    break;
            }
            
            throw new Error(errorMessage);
        }

        if (data.success) {
            // Update cart count if element exists
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                const totalItems = data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
                cartCountElement.textContent = totalItems;
            }

            showMessage('Item added to cart successfully', 'success');
        } else {
            throw new Error(data.message || 'Failed to add to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showMessage(error.message, 'error');
    }
}

// Function to show messages
function showMessage(message, type = 'info') {
    const messageContainer = document.querySelector('.message-container') || createMessageContainer();
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    messageContainer.appendChild(messageElement);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.remove();
        if (messageContainer.children.length === 0) {
            messageContainer.remove();
        }
    }, 3000);
}

// Function to create message container
function createMessageContainer() {
    const container = document.createElement('div');
    container.className = 'message-container';
    document.body.appendChild(container);
    return container;
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add to cart button click handler
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = button.dataset.productId;
            if (!productId) {
                showMessage('Invalid product ID', 'error');
                return;
            }
            await addToCart(productId);
        });
    });

    // Quick view add to cart button click handler
    const quickViewAddToCartButton = document.getElementById('quickViewAddToCart');
    if (quickViewAddToCartButton) {
        quickViewAddToCartButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = quickViewAddToCartButton.dataset.productId;
            if (!productId) {
                showMessage('Invalid product ID', 'error');
                return;
            }
            await addToCart(productId);
            // Close quick view modal if it exists
            const quickViewModal = document.querySelector('.quick-view-modal');
            if (quickViewModal) {
                quickViewModal.style.display = 'none';
            }
        });
    }
});

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
      }
        }
    catch (error) {
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
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

// Add the showErrorModal function to show error notifications
function showErrorModal(error) {
  showNotification('error', error.message || 'An error occurred. Please try again later.');
}

function updateSort(sortValue) {
  // Update URL with new sort value
  const url = new URL(window.location.href);
  if (sortValue === 'default') {
    url.searchParams.delete('sort');
  } else {
    url.searchParams.set('sort', sortValue);
  }
  
  // Reset to page 1 when sorting changes
  url.searchParams.set('page', '1');
  
  // Navigate to new URL
  window.location.href = url.toString();
}
