document.addEventListener('DOMContentLoaded', function () {
  // Tab Browsing Functionality
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const tabContents = document.querySelectorAll('.tab-content');

  // Function to switch tabs
  function switchTab(tabId) {
    // Remove active class from all sidebar items and tab contents
    sidebarItems.forEach(item => item.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to selected sidebar item and corresponding tab content
    const selectedSidebarItem = document.querySelector(`.sidebar-item[data-tab="${tabId}"]`);
    const selectedTabContent = document.getElementById(tabId);

    if (selectedSidebarItem && selectedTabContent) {
      selectedSidebarItem.classList.add('active');
      selectedTabContent.classList.add('active');
    }
  }

  // Add click event listeners to sidebar items
  sidebarItems.forEach(item => {
    item.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Handle logout tab separately
      if (tabId === 'logout') {
        if (confirm('Are you sure you want to logout?')) {
          // Clear client-side storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          
          // Call logout endpoint
          fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              window.location.href = '/user/LoginSignup';
            } else {
              alert('Error during logout. Please try again.');
            }
          })
          .catch(error => {
            console.error('Logout error:', error);
            alert('Error during logout. Please try again.');
          });
        }
        return;
      }
      
      switchTab(tabId);
    });
  });

  // Initialize with the first tab
  const firstTab = sidebarItems[0].getAttribute('data-tab');
  switchTab(firstTab);

  const countries = [
    { code: 'eg', name: 'Egypt', emoji: '🇪🇬', dialCode: '+20' },
    { code: 'sa', name: 'Saudi Arabia', emoji: '🇸🇦', dialCode: '+966' },
    { code: 'ae', name: 'UAE', emoji: '🇦🇪', dialCode: '+971' },
    { code: 'us', name: 'USA', emoji: '🇺🇸', dialCode: '+1' },
    { code: 'gb', name: 'UK', emoji: '🇬🇧', dialCode: '+44' },
    { code: 'ca', name: 'Canada', emoji: '🇨🇦', dialCode: '+1' },
    { code: 'au', name: 'Australia', emoji: '🇦🇺', dialCode: '+61' },
    { code: 'fr', name: 'France', emoji: '🇫🇷', dialCode: '+33' },
    { code: 'de', name: 'Germany', emoji: '🇩🇪', dialCode: '+49' },
    { code: 'it', name: 'Italy', emoji: '🇮🇹', dialCode: '+39' },
    { code: 'es', name: 'Spain', emoji: '🇪🇸', dialCode: '+34' },
    { code: 'nl', name: 'Netherlands', emoji: '🇳🇱', dialCode: '+31' },
    { code: 'be', name: 'Belgium', emoji: '🇧🇪', dialCode: '+32' },
    { code: 'ch', name: 'Switzerland', emoji: '🇨🇭', dialCode: '+41' },
    { code: 'se', name: 'Sweden', emoji: '🇸🇪', dialCode: '+46' },
    { code: 'no', name: 'Norway', emoji: '🇳🇴', dialCode: '+47' },
    { code: 'dk', name: 'Denmark', emoji: '🇩🇰', dialCode: '+45' },
    { code: 'fi', name: 'Finland', emoji: '🇫🇮', dialCode: '+358' },
    { code: 'pt', name: 'Portugal', emoji: '🇵🇹', dialCode: '+351' },
    { code: 'gr', name: 'Greece', emoji: '🇬🇷', dialCode: '+30' },
    { code: 'tr', name: 'Turkey', emoji: '🇹🇷', dialCode: '+90' },
    { code: 'ru', name: 'Russia', emoji: '🇷🇺', dialCode: '+7' },
    { code: 'cn', name: 'China', emoji: '🇨🇳', dialCode: '+86' },
    { code: 'jp', name: 'Japan', emoji: '🇯🇵', dialCode: '+81' },
    { code: 'kr', name: 'South Korea', emoji: '🇰🇷', dialCode: '+82' },
    { code: 'in', name: 'India', emoji: '🇮🇳', dialCode: '+91' },
    { code: 'sg', name: 'Singapore', emoji: '🇸🇬', dialCode: '+65' },
    { code: 'my', name: 'Malaysia', emoji: '🇲🇾', dialCode: '+60' },
    { code: 'th', name: 'Thailand', emoji: '🇹🇭', dialCode: '+66' },
    { code: 'vn', name: 'Vietnam', emoji: '🇻🇳', dialCode: '+84' },
    { code: 'id', name: 'Indonesia', emoji: '🇮🇩', dialCode: '+62' },
    { code: 'ph', name: 'Philippines', emoji: '🇵🇭', dialCode: '+63' },
    { code: 'br', name: 'Brazil', emoji: '🇧🇷', dialCode: '+55' },
    { code: 'mx', name: 'Mexico', emoji: '🇲🇽', dialCode: '+52' },
    { code: 'ar', name: 'Argentina', emoji: '🇦🇷', dialCode: '+54' },
    { code: 'za', name: 'South Africa', emoji: '🇿🇦', dialCode: '+27' },
    { code: 'ng', name: 'Nigeria', emoji: '🇳🇬', dialCode: '+234' },
    { code: 'ke', name: 'Kenya', emoji: '🇰🇪', dialCode: '+254' },
    { code: 'nz', name: 'New Zealand', emoji: '🇳🇿', dialCode: '+64' },
  ];

  // Phone number handling
  const phoneInput = document.getElementById('phoneNumber');
  const countrySelect = document.getElementById('countrySelect');
  const userData = JSON.parse(document.getElementById('userData').textContent);

  console.log('User data from JSON:', userData);
  console.log('Phone input element:', phoneInput);
  console.log('Phone input value:', phoneInput?.value);
  console.log('Phone input placeholder:', phoneInput?.placeholder);

  // Populate country select dropdown
  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country.dialCode;
    option.textContent = `${country.emoji} ${country.name} (${country.dialCode})`;
    countrySelect.appendChild(option);
  });

  // Function to detect country code from phone number
  function detectCountryCode(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (cleanNumber.startsWith('+')) {
      const matchingCountry = countries.find(country => 
        cleanNumber.startsWith(country.dialCode)
      );
      if (matchingCountry) {
        return matchingCountry.dialCode;
      }
    }
    return '+20'; // Default to Egypt
  }

  // Function to format phone number
  function formatPhoneNumber(number) {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) {
        return cleaned;
    } else if (cleaned.length <= 6) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  }

  // Initialize phone number and country code
  if (phoneInput && countrySelect) {
    // Get the phone number from user data or input value
    const phoneNumber = userData?.phone_number || phoneInput.value;
    console.log('Phone number to use:', phoneNumber);
    
    // Set default country code if no phone number exists
    if (!phoneNumber) {
        countrySelect.value = '+20'; // Default to Egypt
        phoneInput.placeholder = 'Enter your phone number';
    } else {
        // Detect country code from the phone number
        const countryCode = detectCountryCode(phoneNumber);
        console.log('Detected country code:', countryCode);
        
        if (countryCode) {
            countrySelect.value = countryCode;
            // Display the number without country code in the input
            const numberWithoutCode = phoneNumber.replace(countryCode, '').trim();
            console.log('Number without code:', numberWithoutCode);
            phoneInput.value = numberWithoutCode;
        }
    }

    // Initially lock the phone input
    phoneInput.readOnly = true;
    countrySelect.disabled = true;

    // Create and add the change phone number button
    const phoneInputContainer = phoneInput.parentElement;
    const changePhoneBtn = document.createElement('button');
    changePhoneBtn.className = 'change-phone-btn';
    changePhoneBtn.innerHTML = '<i class="fas fa-edit"></i> Change Phone Number';
    phoneInputContainer.appendChild(changePhoneBtn);

    // Handle change phone number button click
    changePhoneBtn.addEventListener('click', function() {
        if (phoneInput.readOnly) {
            // Unlock the input
            phoneInput.readOnly = false;
            countrySelect.disabled = false;
            changePhoneBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            phoneInput.focus();
        } else {
            // Lock the input and save changes
            const value = phoneInput.value.replace(/\s/g, '');
            const fullNumber = countrySelect.value + value;
            
            // Save the changes
            fetch('/api/update-phone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: fullNumber })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Phone number updated successfully');
                    phoneInput.readOnly = true;
                    countrySelect.disabled = true;
                    changePhoneBtn.innerHTML = '<i class="fas fa-edit"></i> Change Phone Number';
                } else {
                    throw new Error(data.message || 'Failed to update phone number');
                }
            })
            .catch(error => {
                showNotification(error.message, 'error');
                // Revert to the original phone number on error
                if (phoneNumber) {
                    const countryCode = detectCountryCode(phoneNumber);
                    const numberWithoutCode = phoneNumber.replace(countryCode, '').trim();
                    phoneInput.value = numberWithoutCode;
                    countrySelect.value = countryCode;
                }
            });
        }
    });

    // Handle phone number input formatting
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            // Add spaces every 3 digits
            value = value.match(/.{1,3}/g).join(' ');
        }
        e.target.value = value;
    });
  }

  // Initialize modal elements
  const quickViewModal = document.getElementById('quickViewModal');
  const quickViewOverlay = document.getElementById('quickViewOverlay');
  const closeQuickViewBtn = document.getElementById('closeQuickView');
  const wishlistGrid = document.getElementById('wishlistGrid');
  const loadingSpinner = document.querySelector('.wishlist-loading');
  const wishlistData = JSON.parse(document.getElementById('wishlistData').textContent);

  // Make modal functions globally accessible
  window.showModal = function(modalId) {
    console.log('Showing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    } else {
      console.error('Modal not found:', modalId);
    }
  };

  window.hideModal = function(modalId) {
    console.log('Hiding modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  };

  window.showNotification = function(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Initialize modals container
  const modalsContainer = document.getElementById('modalsContainer');
  if (modalsContainer) {
    modalsContainer.style.display = 'block';
  }

  // Close modal when clicking the close button
  document.querySelectorAll('.close-modal, .cancel-btn').forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal-overlay');
      if (modal) {
        hideModal(modal.id);
      }
    });
  });

  // Close modal when clicking outside
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        hideModal(this.id);
      }
    });
  });

  // Close modal when pressing Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.show').forEach(modal => {
        hideModal(modal.id);
      });
    }
  });

  // Order Details button click handler
  document.querySelectorAll('.order-details').forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      const orderCard = this.closest('.order-card');
      if (!orderCard) {
        console.error('Order card not found');
        return;
      }
      
      const orderId = orderCard.dataset.orderId;
      if (!orderId) {
        console.error('Order ID not found in data attributes');
        showNotification('Order ID is missing', 'error');
        return;
      }
      
      console.log('Order details button clicked for order:', orderId);
      
      try {
        const response = await fetch(`/user/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to load order details');
        }

        const order = data.data;
        if (!order) {
          throw new Error('Order not found');
        }

        // Create order details content
        const content = `
          <div class="order-info">
            <h4>Order #${order._id}</h4>
            <p><strong>Status:</strong> <span class="status-${order.status.toLowerCase()}">${order.status}</span></p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || 'Not available'}</p>
          </div>
          
          <div class="order-summary">
            <h5>Order Summary</h5>
            <div class="summary-grid">
              <div><strong>Subtotal:</strong></div>
              <div>$${order.total.toFixed(2)}</div>
              <div><strong>Shipping:</strong></div>
              <div>$${order.shippingCost?.toFixed(2) || '0.00'}</div>
              <div><strong>Tax:</strong></div>
              <div>$${order.tax?.toFixed(2) || '0.00'}</div>
              <div><strong>Total:</strong></div>
              <div>$${order.total.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="order-products">
            <h5>Products</h5>
            ${order.items.map(item => `
              <div class="order-product-detail">
                <img src="${item.product && item.product.image ? (item.product.image.startsWith('/') ? item.product.image : `/Assets/Images/Watches/${item.product.image}`) : '/Assets/Images/product-placeholder.jpg'}" alt="${item.product && item.product.name ? item.product.name : 'Product'}">
                <div>
                  <h5>${item.product && item.product.name ? item.product.name : 'Product'}</h5>
                  <p>Brand: ${item.product && item.product.brand ? item.product.brand : 'N/A'}</p>
                  <p>Qty: ${item.quantity}</p>
                  <p>Price: $${item.price ? item.price.toFixed(2) : '0.00'}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="shipping-details">
            <h5>Shipping Details</h5>
            <p><strong>Name:</strong> ${order.shipping?.name || 'N/A'}</p>
            <p><strong>Address:</strong> ${order.shipping?.address || 'N/A'}</p>
            <p><strong>City:</strong> ${order.shipping?.city || 'N/A'}</p>
            <p><strong>State:</strong> ${order.shipping?.state || 'N/A'}</p>
            <p><strong>ZIP Code:</strong> ${order.shipping?.zipCode || 'N/A'}</p>
          </div>
          
          <div class="payment-details">
            <h5>Payment Details</h5>
            <p><strong>Payment Method:</strong> <span class="payment-method">
              <i class="fab fa-cc-${order.payment?.bankName?.toLowerCase() || 'credit-card'}"></i> 
              ${order.payment?.bankName || 'Credit Card'} ending in ${order.payment?.cardNumber || '****'}
            </span></p>
            <p><strong>Cardholder:</strong> ${order.payment?.name || 'N/A'}</p>
            <p><strong>Expiry:</strong> ${order.payment?.expiry || 'N/A'}</p>
          </div>
        `;

        // Update modal content and show it
        const modalBody = document.querySelector('#orderDetailsModal .modal-body');
        if (modalBody) {
          modalBody.innerHTML = content;
          showModal('orderDetailsModal');
        } else {
          console.error('Modal body not found');
        }
      } catch (error) {
        console.error('Error loading order details:', error);
        showNotification(error.message || 'Failed to load order details', 'error');
      }
    });
  });

  // Track Order button click handler
  document.querySelectorAll('.track-order').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const orderId = this.closest('.order-card').dataset.orderId;
      console.log('Track order button clicked for order:', orderId);
      
      // Find the order in the user's orders
      const order = userData.orders.find(o => o._id === orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        return;
      }

      // Create tracking content
      const content = `
        <h4>Order #${order._id} - Tracking Information</h4>
        
        <div class="tracking-progress">
          <div class="tracking-step ${order.status === 'Placed' ? 'completed' : ''}">
            <div class="step-icon"><i class="fas fa-check"></i></div>
            <div class="step-label">Order Placed</div>
            <div class="step-date">${new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="tracking-step ${order.status === 'Processing' ? 'completed' : ''}">
            <div class="step-icon"><i class="fas fa-check"></i></div>
            <div class="step-label">Processing</div>
            <div class="step-date">${order.processingDate ? new Date(order.processingDate).toLocaleDateString() : ''}</div>
          </div>
          <div class="tracking-step ${order.status === 'Shipped' ? 'active' : ''}">
            <div class="step-icon"><i class="fas fa-truck"></i></div>
            <div class="step-label">Shipped</div>
            <div class="step-date">${order.shippingDate ? new Date(order.shippingDate).toLocaleDateString() : ''}</div>
          </div>
          <div class="tracking-step ${order.status === 'Delivered' ? 'completed' : ''}">
            <div class="step-icon"><i class="fas fa-home"></i></div>
            <div class="step-label">Delivered</div>
            <div class="step-date">${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : ''}</div>
          </div>
        </div>
        
        <div class="tracking-details">
          <h4>Shipping Details</h4>
          <div><strong>Carrier:</strong></div>
          <div>${order.shipping?.carrier || 'Standard Shipping'}</div>
          <div><strong>Tracking Number:</strong></div>
          <div>${order.shipping?.trackingNumber || 'Not available'}</div>
          <div><strong>Shipped From:</strong></div>
          <div>${order.shipping?.origin || 'Our Warehouse'}</div>
          <div><strong>Destination:</strong></div>
          <div>${order.shipping?.address}, ${order.shipping?.city}, ${order.shipping?.state} ${order.shipping?.zipCode}</div>
          <div><strong>Last Update:</strong></div>
          <div>${order.shipping?.lastUpdate ? new Date(order.shipping.lastUpdate).toLocaleDateString() : 'N/A'}</div>
          <div><strong>Status:</strong></div>
          <div>${order.shipping?.status || order.status}</div>
        </div>
      `;

      // Update modal content and show it
      const modalBody = document.querySelector('#trackingModal .modal-body');
      if (modalBody) {
        modalBody.innerHTML = content;
        showModal('trackingModal');
      } else {
        console.error('Modal body not found');
      }
    });
  });

  // Refund Details button click handler
  document.querySelectorAll('.view-details').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const refundId = this.closest('.refund-card').dataset.refundId;
      console.log('Refund details button clicked for refund:', refundId);
      
      // Find the refund in the user's refunds
      const refund = userData.refunds.find(r => r._id === refundId);
      if (!refund) {
        console.error('Refund not found:', refundId);
        return;
      }

      // Create refund details content
      const content = `
        <h4>Refund #${refund.refundId}</h4>
        <p><strong>Status:</strong> <span class="status-${refund.status.toLowerCase()}">${refund.status}</span></p>
        <p><strong>Order:</strong> #${refund.order?.orderId} - ${refund.order?.items?.[0]?.product?.name || 'Product'}</p>
        <p><strong>Request Date:</strong> ${new Date(refund.requestDate).toLocaleDateString()}</p>
        ${refund.status === 'Completed' ? `
          <p><strong>Processed Date:</strong> ${new Date(refund.processedDate).toLocaleDateString()}</p>
        ` : ''}
        
        <h5 style="margin-top: 20px;">Refund Summary</h5>
        <div class="refund-summary">
          <div><strong>Product Amount:</strong></div>
          <div>$${refund.amount?.toFixed(2) || '0.00'}</div>
          <div><strong>Shipping Fee:</strong></div>
          <div>$${refund.shippingFee?.toFixed(2) || '0.00'}</div>
          <div><strong>Tax:</strong></div>
          <div>$${refund.tax?.toFixed(2) || '0.00'}</div>
          <div><strong>Total Refund:</strong></div>
          <div>$${refund.total?.toFixed(2) || '0.00'}</div>
        </div>
        
        <h5 style="margin-top: 20px;">Reason</h5>
        <p>${refund.reason || 'No reason provided'}</p>
        
        <h5 style="margin-top: 20px;">Additional Notes</h5>
        <div class="refund-note">
          <i class="fas fa-info-circle"></i>
          <p>
            ${refund.status === 'Completed' 
              ? 'Your refund has been processed and the amount has been credited back to your original payment method. Please allow 3-5 business days for the amount to reflect in your account.'
              : 'Your refund request is being processed. We will notify you once it has been completed.'}
          </p>
        </div>
        
        ${refund.status !== 'Completed' ? `
          <h5 style="margin-top: 20px;">Next Steps</h5>
          <p>Please ship the item back to us using the provided return label. Once we receive the item, we will process your refund.</p>
        ` : ''}
      `;

      // Update modal content and show it
      const modalBody = document.querySelector('#refundDetailsModal .modal-body');
      if (modalBody) {
        modalBody.innerHTML = content;
        showModal('refundDetailsModal');
      } else {
        console.error('Modal body not found');
      }
    });
  });

  // Function to show loading state
  function showLoading() {
    loadingSpinner.style.display = 'flex';
  }

  // Function to hide loading state
  function hideLoading() {
    loadingSpinner.style.display = 'none';
  }

  // Handle remove from wishlist
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      const productId = this.dataset.productId;
      const productCard = this.closest('.product-card');

      if (!productId) {
        showNotification('Invalid product ID', 'error');
        return;
      }

      try {
        showLoading();
        const response = await fetch('/user/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Add fade out animation
          productCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          productCard.style.opacity = '0';
          productCard.style.transform = 'translateY(10px)';

          // Remove the card after animation
          setTimeout(() => {
            productCard.remove();
            showNotification('Product removed from wishlist', 'success');
            
            // If no items left, show empty state
            if (document.querySelectorAll('.product-card').length === 0) {
              wishlistGrid.innerHTML = `
                <div class="empty-wishlist">
                  <i class="far fa-heart"></i>
                  <h2>Your wishlist is empty</h2>
                  <p>Start adding products to your wishlist by clicking the heart icon on any product.</p>
                  <a href="/user/products" class="browse-products-btn">Browse Products</a>
                </div>
              `;
            }
          }, 300);
        } else {
          throw new Error(data.message || 'Failed to remove from wishlist');
        }
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        showNotification(error.message || 'Failed to remove from wishlist', 'error');
      } finally {
        hideLoading();
      }
    });
  });

  // Quick View functionality
  document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for quick view buttons
    document.querySelectorAll('.quick-view').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.dataset.productId;
            showQuickView(productId);
        });
    });

    // Close quick view modal
    document.getElementById('closeQuickView').addEventListener('click', () => {
        hideQuickView();
    });

    // Close on overlay click
    document.getElementById('quickViewOverlay').addEventListener('click', () => {
        hideQuickView();
    });

    // Add to cart functionality
    document.querySelectorAll('.quick-view-modal .add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            addToCart(productId);
        });
    });

    // Remove from wishlist functionality
    document.querySelectorAll('.quick-view-modal .wishlist-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            removeFromWishlist(productId);
        });
    });
  });

  function showQuickView(productId) {
    const modal = document.getElementById('quickViewModal');
    const overlay = document.getElementById('quickViewOverlay');
    const quickViewContent = document.getElementById(`quickView-${productId}`);

    if (quickViewContent) {
        // Hide all quick view contents first
        document.querySelectorAll('.product-quick-view').forEach(content => {
            content.style.display = 'none';
        });

        // Show the selected product's quick view
        quickViewContent.style.display = 'block';
        modal.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
  }

  function hideQuickView() {
    const modal = document.getElementById('quickViewModal');
    const overlay = document.getElementById('quickViewOverlay');
    
    modal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  async function addToCart(productId) {
    try {
        showLoading();
        const response = await fetch('/user/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (!response.ok) {
            throw new Error('Failed to add to cart');
        }

        const data = await response.json();
        if (data.success) {
            showNotification('Product added to cart', 'success');
        } else {
            throw new Error(data.message || 'Failed to add to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add to cart', 'error');
    } finally {
        hideLoading();
    }
  }

  async function removeFromWishlist(productId) {
    try {
        showLoading();
        const response = await fetch('/user/wishlist/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });

        if (!response.ok) {
            throw new Error('Failed to remove from wishlist');
        }

        const data = await response.json();
        if (data.success) {
            // Remove the product card from the wishlist grid
            const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
            if (productCard) {
                productCard.remove();
            }

            // Hide the quick view modal
            hideQuickView();

            showNotification('Product removed from wishlist', 'success');
        } else {
            throw new Error(data.message || 'Failed to remove from wishlist');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showNotification('Failed to remove from wishlist', 'error');
    } finally {
        hideLoading();
    }
  }

  function initializePhoneInput() {
    const phoneInput = document.getElementById('phoneNumber');
    const countrySelect = document.getElementById('countrySelect');
    
    if (!phoneInput || !countrySelect) return;

    // Get the initial phone number
    const initialPhone = phoneInput.value || '';
    console.log('Initial phone number:', initialPhone);

    // Extract country code and number
    const countryCodeMatch = initialPhone.match(/^\+(\d+)/);
    const countryCode = countryCodeMatch ? countryCodeMatch[1] : '20'; // Default to Egypt
    const numberWithoutCode = initialPhone.replace(/^\+\d+/, '');

    // Set the country select value
    countrySelect.value = countryCode;
    
    // Format the phone number
    const formattedNumber = formatPhoneNumber(numberWithoutCode);
    phoneInput.value = formattedNumber;

    // Add event listeners
    countrySelect.addEventListener('change', (e) => {
        const newCountryCode = e.target.value;
        const currentNumber = phoneInput.value.replace(/^\+\d+/, '');
        phoneInput.value = `+${newCountryCode}${currentNumber}`;
    });

    phoneInput.addEventListener('input', (e) => {
        const value = e.target.value.replace(/\D/g, '');
        const formatted = formatPhoneNumber(value);
        e.target.value = formatted;
    });
  }

  async function fetchProductDetails(productId) {
    try {
        showLoading();
        
        // Get the current protocol and host
        const protocol = window.location.protocol;
        const host = window.location.host;
        
        // Construct the URL using the current protocol and host
        const url = `${protocol}//${host}/user/product?id=${productId}&format=json`;
        
        console.log('Fetching product from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                showNotification('Please log in to view product details', 'error');
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.success) {
            throw new Error(data?.message || 'Failed to load product details');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching product details:', error);
        showNotification('Error loading product details. Please try again later.', 'error');
        return null;
    } finally {
        hideLoading();
    }
  }

  // Update the quick view handler
  async function handleQuickView(productId) {
    try {
        const productData = await fetchProductDetails(productId);
        if (productData && productData.data && productData.data.product) {
            showQuickView(productData.data.product._id);
        }
    } catch (error) {
        console.error('Error in quick view:', error);
        showNotification('Unable to load product details', 'error');
    }
  }

  // Add event listeners for quick view buttons
  document.addEventListener('DOMContentLoaded', function() {
    const quickViewButtons = document.querySelectorAll('.quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.dataset.productId;
            if (productId) {
                handleQuickView(productId);
            }
        });
    });
  });

  // Order handling functionality
  document.addEventListener('DOMContentLoaded', function() {
    // Order details modal handling
    const orderDetailButtons = document.querySelectorAll('.order-details');
    orderDetailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.dataset.orderId;
            const orderContent = document.getElementById(`orderDetails-${orderId}`);
            if (orderContent) {
                // Hide all order details first
                document.querySelectorAll('.order-details-content').forEach(content => {
                    content.style.display = 'none';
                });
                // Show the selected order details
                orderContent.style.display = 'block';
                showModal('orderDetailsModal');

                // Show/hide track order button based on order status
                const trackBtn = document.querySelector('.track-order-btn');
                if (trackBtn) {
                    const orderStatus = orderContent.querySelector('.status').textContent;
                    trackBtn.style.display = orderStatus === 'Shipped' ? 'block' : 'none';
                }
            }
        });
    });

    // Track order button handling
    const trackOrderButtons = document.querySelectorAll('.track-order');
    trackOrderButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderCard = button.closest('.order-card');
            const orderId = orderCard.dataset.orderId;
            const orderStatus = orderCard.querySelector('.order-status').textContent;
            
            const modalBody = document.querySelector('#trackingModal .modal-body');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="tracking-info">
                        <h4>Order #${orderId}</h4>
                        <p>Status: ${orderStatus}</p>
                        <div class="tracking-timeline">
                            <div class="timeline-item ${orderStatus === 'Shipped' ? 'active' : ''}">
                                <div class="timeline-point"></div>
                                <div class="timeline-content">
                                    <h5>Order Shipped</h5>
                                    <p>Your order has been shipped and is on its way.</p>
                                </div>
                            </div>
                            <div class="timeline-item ${orderStatus === 'Delivered' ? 'active' : ''}">
                                <div class="timeline-point"></div>
                                <div class="timeline-content">
                                    <h5>Order Delivered</h5>
                                    <p>Your order has been delivered.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            showModal('trackingModal');
        });
    });

    // Buy again button handling
    const buyAgainButtons = document.querySelectorAll('.buy-again');
    buyAgainButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const orderId = e.target.closest('.order-card').dataset.orderId;
            await handleBuyAgain(orderId);
        });
    });
  });

  async function handleBuyAgain(orderId) {
    try {
        showLoading();
        const response = await fetch(`/user/orders/${orderId}/buy-again`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to add items to cart');
        }

        showNotification('Items added to cart successfully', 'success');
        // Optionally redirect to cart page
        // window.location.href = '/cart';
    } catch (error) {
        console.error('Error adding items to cart:', error);
        showNotification('Failed to add items to cart', 'error');
    } finally {
        hideLoading();
    }
  }

  // Modal handling functions
  function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
  }

  function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
  }

  // Initialize modals when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Show modals container
    const modalsContainer = document.getElementById('modalsContainer');
    if (modalsContainer) {
        modalsContainer.style.display = 'block';
    }

    // Order Details Modal
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    if (orderDetailsModal) {
        const closeBtn = orderDetailsModal.querySelector('.close-modal');
        const cancelBtn = orderDetailsModal.querySelector('.cancel-btn');
        const trackBtn = orderDetailsModal.querySelector('.track-order-btn');

        if (closeBtn) closeBtn.addEventListener('click', () => hideModal('orderDetailsModal'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => hideModal('orderDetailsModal'));
        if (trackBtn) {
            trackBtn.addEventListener('click', () => {
                hideModal('orderDetailsModal');
                showModal('trackingModal');
            });
        }
    }

    // Tracking Modal
    const trackingModal = document.getElementById('trackingModal');
    if (trackingModal) {
        const closeBtn = trackingModal.querySelector('.close-modal');
        const cancelBtn = trackingModal.querySelector('.cancel-btn');

        if (closeBtn) closeBtn.addEventListener('click', () => hideModal('trackingModal'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => hideModal('trackingModal'));
    }

    // Refund Details Modal
    const refundDetailsModal = document.getElementById('refundDetailsModal');
    if (refundDetailsModal) {
        const closeBtn = refundDetailsModal.querySelector('.close-modal');
        const cancelBtn = refundDetailsModal.querySelector('.cancel-btn');
        const cancelRequestBtn = refundDetailsModal.querySelector('.cancel-request-btn');

        if (closeBtn) closeBtn.addEventListener('click', () => hideModal('refundDetailsModal'));
        if (cancelBtn) cancelBtn.addEventListener('click', () => hideModal('refundDetailsModal'));
        if (cancelRequestBtn) {
            cancelRequestBtn.addEventListener('click', () => {
                handleCancelRefund();
                hideModal('refundDetailsModal');
            });
        }
    }

    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });

    // Close modals when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
  });

  // Handle cancel refund request
  async function handleCancelRefund() {
    const refundId = document.querySelector('#refundDetailsModal .refund-info h4').textContent.split('#')[1];
    try {
        showLoading();
        const response = await fetch(`/user/refunds/${refundId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to cancel refund request');
        }

        const data = await response.json();
        if (data.success) {
            showNotification('Refund request cancelled successfully', 'success');
            hideModal('refundDetailsModal');
            window.location.reload();
        } else {
            throw new Error(data.message || 'Failed to cancel refund request');
        }
    } catch (error) {
        console.error('Error cancelling refund:', error);
        showNotification('Failed to cancel refund request', 'error');
    } finally {
        hideLoading();
    }
  }

  // Address Management Functions
  async function updateAddress(addressData) {
    try {
      const response = await fetch('/user/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update address');
      }

      showNotification('success', 'Address updated successfully');
      return data.address;
    } catch (error) {
      console.error('Error updating address:', error);
      showNotification('error', error.message);
      throw error;
    }
  }

  async function removeAddress() {
    try {
      const response = await fetch('/user/address', {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove address');
      }

      showNotification('success', 'Address removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing address:', error);
      showNotification('error', error.message);
      throw error;
    }
  }

  // Event Listeners for Address Management
  document.addEventListener('DOMContentLoaded', () => {
    const editAddressBtn = document.querySelector('.edit-address');
    const removeAddressBtn = document.querySelector('.remove-address');
    const addAddressBtn = document.querySelector('.add-address-btn');

    if (editAddressBtn) {
      editAddressBtn.addEventListener('click', () => {
        // Show edit address form
        const addressForm = document.getElementById('addressForm');
        if (addressForm) {
          addressForm.style.display = 'block';
        }
      });
    }

    if (removeAddressBtn) {
      removeAddressBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to remove this address?')) {
          try {
            await removeAddress();
            // Refresh the page or update UI
            window.location.reload();
          } catch (error) {
            console.error('Error removing address:', error);
          }
        }
      });
    }

    if (addAddressBtn) {
      addAddressBtn.addEventListener('click', () => {
        // Show add address form
        const addressForm = document.getElementById('addressForm');
        if (addressForm) {
          addressForm.style.display = 'block';
        }
      });
    }

    // Handle address form submission
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
      addressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addressForm);
        const addressData = {
          city: formData.get('city'),
          street: formData.get('street'),
          addressType: formData.get('addressType'),
          state: formData.get('state'),
          country: formData.get('country'),
          postalCode: formData.get('postalCode')
        };

        try {
          await updateAddress(addressData);
          // Refresh the page or update UI
          window.location.reload();
        } catch (error) {
          console.error('Error updating address:', error);
        }
      });
    }
  });
});
