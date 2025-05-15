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
            'collection': 'Vcollection',
            'brand': 'brand',
            'gender': 'gender',
            'Strap_Material': 'strapMaterial',
            'Movement': 'movement',
            'Water_Resistance': 'waterResistance',
            'Case_Material': 'caseMaterial'
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
                dialColorCheckboxes.forEach(checkbox => {
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
            sortButtons.forEach(button => {
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
    document.querySelectorAll('[data-sort]').forEach(button => {
        button.addEventListener('click', function(e) {
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
    document.querySelector('[data-action="open-filter-panel"]')?.addEventListener('click', openFilterPanel);
    document.querySelector('[data-action="close-filter-panel"]')?.addEventListener('click', closeFilterPanel);
    document.getElementById('overlay')?.addEventListener('click', closeFilterPanel);

    // Filter submit
    const submitBtn = document.querySelector('.submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = 1;
            updateCurrentFilters();
            loadProducts();
        });
    }

    // Clear filters
    const clearBtn = document.querySelector('.clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
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
}

async function loadProducts() {
    try {
        // Merge current filters with any new ones
        updateCurrentFilters();
        
        const queryString = new URLSearchParams({
            ...currentFilters,
            page: currentPage,
            sort: currentSort,
            format: 'json'
        }).toString();
        
        const response = await fetch(`/api/products?${queryString}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
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
        showErrorModal(error);
    }
}

function renderProducts(products) {
  if (!productGrid) {
    console.error('Product grid container not found');
    return;
  }

  // Check if products is an array
  if (!Array.isArray(products)) {
    console.error('Invalid products data:', products);
    productGrid.innerHTML = '<div class="error-message">Error: Invalid product data received</div>';
    return;
  }

  // If products array is empty
  if (products.length === 0) {
    productGrid.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
    return;
  }

  productGrid.style.opacity = '0';
  productGrid.style.transition = 'opacity 0.2s ease';

  setTimeout(() => {
    try {
      productGrid.innerHTML = products.map((product, index) => {
        if (!product || typeof product !== 'object') {
          console.warn('Invalid product data at index:', index);
          return '';
        }

        let stockBadge;
        if (product.stock || (product.stockCount && product.stockCount > 0)) {
          stockBadge = `<p class="stock in-stock">In Stock</p>`;
        } else {
          stockBadge = '<p class="stock out-of-stock">Out of Stock</p>';
        }
        
        // Store product data as a data attribute instead of inline onclick
        return `
        <div class="product-card" style="animation-delay: ${index * 50}ms" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
            <div class="product-image-container">
                <div class="wishlist-icon" data-product-id="${product._id}">
                    <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path class="heart" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 .81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78 -3.4 6.86 -8.55 11.54L12 21.35z"/>
                    </svg>
                </div>
                <a href="${product.productPageUrl || '#'}">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </a>
            </div>
            <div class="product-details">
                <a href="${product.productPageUrl || '#'}">
                    <h4>${product.name}</h4>
                </a>
                <div class="hover-buttons">
                    <button class="quick-view" data-product-id="${product._id}">Quick View</button>
                    <button class="compare">Compare</button>
                </div>
                <p class="price">$${product.price.toLocaleString()}</p>
                ${stockBadge}
            </div>
        </div>
        `;
      }).join('');
      
      // Add event listeners after rendering
      addProductCardEventListeners();
      
      void productGrid.offsetWidth;
      productGrid.style.opacity = '1';
    } catch (error) {
      console.error('Error rendering products:', error);
      productGrid.innerHTML = '<div class="error-message">Error displaying products. Please try again.</div>';
    }
  }, 200);
}

function addProductCardEventListeners() {
  // Add event listeners for wishlist icons
  document.querySelectorAll('.wishlist-icon').forEach(icon => {
    icon.addEventListener('click', function() {
      const productId = this.dataset.productId;
      toggleWishlist(this, productId);
    });
  });
  
  // Add event listeners for quick view buttons
  document.querySelectorAll('.quick-view').forEach(button => {
    button.addEventListener('click', function() {
      const productCard = this.closest('.product-card');
      const productData = JSON.parse(productCard.dataset.product);
      toggleQuickView(productData);
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
        sort: currentSort
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
  const selected = Array.from(checkboxes).map(cb => cb.value);
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
    { id: 'priceRangeTo', value: 500000 }
  ];

  resetElements.forEach(el => {
    const element = document.getElementById(el.id);
    if (element) element.value = el.value;
  });

  // Restore brand/collection values
  const brandSelect = document.getElementById('brand');
  const collectionSelect = document.getElementById('collection');
  if (brandSelect) brandSelect.value = currentBrand;
  if (collectionSelect) collectionSelect.value = currentCollection;

  document.querySelectorAll('.dial-color').forEach(checkbox => {
    checkbox.checked = checkbox.value === 'All';
  });

  document.getElementById('inStockFilter').checked = false;
  currentSort = 'default';
}

function toggleWishlist(element, productId) {
  element.classList.toggle('filled');
  // wishlist API call here
  console.log(`Toggled wishlist for product ${productId}`);
}

function toggleQuickView(product = null) {
  if (!quickViewModal || !quickViewOverlay) return;

  const isOpening = !quickViewModal.classList.contains('open');
  
  if (isOpening && product) {
    // Create thumbnail items - use galleryImages if available, otherwise just the main image
    const thumbnails = (product.galleryImages && product.galleryImages.length > 0) 
      ? product.galleryImages.map((img, idx) => `
          <div class="thumbnail ${idx === 0 ? 'active' : ''}" data-image="${img}">
            <img src="${img}" alt="Thumbnail ${idx + 1}">
          </div>
        `).join('')
      : `
          <div class="thumbnail active" data-image="${product.image}">
            <img src="${product.image}" alt="Product Thumbnail">
          </div>
        `;

    quickViewModal.innerHTML = `
      <button class="close-btn" id="closeQuickView">✖</button>
      <div class="quick-view-content">
        <section class="product-gallery">
          <div class="all_image">
            <div class="main-image">
              <img src="${product.image}" alt="${product.name}" id="quickViewMainImage">
              <div class="zoom-lens"></div>
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
              <div class="rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
                <span>(4.5/5)</span>
              </div>
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
    document.querySelectorAll('.thumbnail-container .thumbnail').forEach(thumb => {
      thumb.addEventListener('click', function() {
        const newImageSrc = this.getAttribute('data-image');
        document.getElementById('quickViewMainImage').src = newImageSrc;
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    // Add wishlist button event listener
    document.querySelector('.wishlist-btn').addEventListener('click', function() {
      const productId = this.dataset.productId;
      toggleWishlist(this, productId);
    });
    
    // Add add-to-cart button event listener
    document.querySelector('.add-to-cart').addEventListener('click', function() {
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
  
  buttons.forEach(button => {
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

// Make functions available globally
window.toggleWishlist = toggleWishlist;
window.toggleQuickView = toggleQuickView;
window.loadProducts = loadProducts;
window.resetFilters = resetFilters;
window.openFilterPanel = openFilterPanel;
window.closeFilterPanel = closeFilterPanel;