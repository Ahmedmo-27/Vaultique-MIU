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
  productGrid = document.getElementById('productGrid');
  prevPageBtn = document.getElementById('prevPage');
  nextPageBtn = document.getElementById('nextPage');
  pageInfo = document.getElementById('pageInfo');

  // Create quick view modal elements
  quickViewModal = document.createElement('div');
  quickViewModal.id = 'quickView';
  quickViewModal.className = 'quick-view-modal';
  document.body.appendChild(quickViewModal);

  quickViewOverlay = document.createElement('div');
  quickViewOverlay.id = 'quickViewOverlay';
  quickViewOverlay.className = 'quick-view-overlay';
  document.body.appendChild(quickViewOverlay);

  if (!productGrid) {
    console.error('Product grid container not found!');
    return;
  }

  productGrid.innerHTML = '<p class="loading">Loading products...</p>';

  if (prevPageBtn && nextPageBtn && pageInfo) {
    setupEventListeners();
  } else {
    console.warn('Pagination elements missing, continuing without pagination');
  }

  loadProducts();
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
}

async function loadProducts() {
  try {
    updateCurrentFilters();
    
    const queryString = new URLSearchParams(currentFilters).toString();
    const response = await fetch(`http://127.0.0.1:3000/api/products?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }
    
    totalPages = result.pages;
    updatePaginationUI();
    renderProducts(result.data);
    
  } catch (error) {
    console.error('Error loading products:', error);
    const errorContent = `
      <div class="error">
        <p class="error-message">
          Error loading products.<br> ${error.message}
        </p>
      </div>
    `;
    
    createModal(
      'Error', 
      errorContent,
      [
        {
          text: 'Retry',
          class: 'confirm-btn',
          clickHandler: () => {
            loadProducts();
            closeModal(document.querySelector('.modal-overlay'));
          }
        },
        {
          text: 'Close',
          class: 'cancel-btn',
          clickHandler: () => closeModal(document.querySelector('.modal-overlay'))
        }
      ]
    );
}
}

function renderProducts(products) {
  productGrid.style.opacity = '0';
  productGrid.style.transition = 'opacity 0.2s ease';

  setTimeout(() => {
      productGrid.innerHTML = products.map((product, index) => {
          let stockBadge;
          if (product.stock || product.stockCount > 0) {
            stockBadge = `<p class="stock in-stock">In Stock</p>`;
          } else {
            stockBadge = '<p class="stock out-of-stock">Out of Stock</p>';
          }
                          
          return `
          <div class="product-card" style="animation-delay: ${index * 50}ms">
              <div class="product-image-container">
                  <div class="wishlist-icon" onclick="toggleWishlist(this, '${product._id}')">
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
                      <button class="quick-view" onclick="toggleQuickView(${JSON.stringify(product).replace(/"/g, '&quot;')})">Quick View</button>
                      <button class="compare">Compare</button>
                  </div>
                  <p class="price">$${product.price.toLocaleString()}</p>
                  ${stockBadge}
              </div>
          </div>
          `;
      }).join('');
      
      void productGrid.offsetWidth;
      productGrid.style.opacity = '1';
  }, 200);
}

function updatePaginationUI() {
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage <= 1;
  }
  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage >= totalPages;
  }
}

function updateCurrentFilters() {
  currentFilters = {
    collection: document.getElementById('collection')?.value || 'All',
    brand: document.getElementById('brand')?.value || 'All',
    gender: document.getElementById('gender')?.value || 'All',
    strapMaterial: document.getElementById('Strap_Material')?.value || 'All',
    movement: document.getElementById('Movement')?.value || 'All',
    waterResistance: document.getElementById('Water_Resistance')?.value || 'All',
    caseMaterial: document.getElementById('Case_Material')?.value || 'All',
    minPrice: document.getElementById('priceRangeFrom')?.value || 0,
    maxPrice: document.getElementById('priceRangeTo')?.value || 500000,
    dialColor: getSelectedDialColors(),
    inStock: document.getElementById('inStockFilter')?.checked || false,
    sort: currentSort,
    page: currentPage,
    limit: 10
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

  const all=document.getElementById('ALL');
  
  if(!all)
  {
    const collectionValue = document.getElementById('collectionPage');
    const brandValue = document.getElementById('brandPage');
  }
  else
  {
    collectionValue = 'All';
    brandValue='All';
  }

  const resetElements = [
    { id: 'collection', value: collectionValue },
    { id: 'brand', value: brandValue },
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
      <button class="close-btn" onclick="toggleQuickView()">✖</button>
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
            <button class="wishlist-btn" onclick="toggleWishlist(this, '${product._id}')">
              <i class="far fa-heart"></i>
            </button>
            <button class="add-to-cart" onclick="addToCartFromQuickView('${product.id}')">
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

    // Add thumbnail click handlers
    document.querySelectorAll('.thumbnail-container .thumbnail').forEach(thumb => {
      thumb.addEventListener('click', function() {
        const newImageSrc = this.getAttribute('data-image');
        document.getElementById('quickViewMainImage').src = newImageSrc;
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
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
  }, 10);
  
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