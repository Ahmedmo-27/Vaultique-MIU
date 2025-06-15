// Global variables
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
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

// Make functions available globally
window.loadProducts = loadProducts;
window.resetFilters = resetFilters;
window.openFilterPanel = openFilterPanel;
window.closeFilterPanel = closeFilterPanel;
window.updateSort = updateSort;
