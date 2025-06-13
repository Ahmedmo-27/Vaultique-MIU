document.addEventListener('DOMContentLoaded', function () {
  // Sidebar navigation
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const tabContents = document.querySelectorAll('.tab-content');

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
    
    // Format the number with spaces
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return cleaned;
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

  // Function to show modal
  function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
  }

  // Function to hide modal
  function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
  }

  // Function to show notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
  }

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
                    <h4>Order #${order.orderNumber || order._id}</h4>
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
                    ${order.items && order.items.length > 0 ? order.items.map(item => `
                        <div class="order-product-detail">
                            <img src="${item.productId && item.productId.image ? (item.productId.image.startsWith('/') ? item.productId.image : `/Assets/Images/Watches/${item.productId.image}`) : '/Assets/Images/product-placeholder.jpg'}" alt="${item.productId && item.productId.name ? item.productId.name : 'Product'}">
                            <div>
                                <h5>${item.productId && item.productId.name ? item.productId.name : 'Unknown Product'}</h5>
                                <p>Qty: ${item.quantity || 1}</p>
                                <p>Price: $${item.price?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    `).join('') : '<p>No products found</p>'}
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

  // Close modal when clicking the close button or overlay
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
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        if (modal.style.display === 'block') {
          hideModal(modal.id);
        }
      });
    }
  });

  // Password Change Functionality
  const changePasswordLink = document.getElementById('changePasswordLink');
  changePasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    showModal('passwordChangeModal');
  });

  // Password validation
  const newPassword = document.getElementById('newPassword');
  const requirements = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>]/
  };

  function validatePassword() {
    const password = newPassword.value;
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(req);
        if (requirements[req].test(password)) {
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
        }
    });
  }

  newPassword.addEventListener('input', validatePassword);

  // Toggle password visibility
  document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', function() {
        const input = document.getElementById(this.dataset.target);
        const icon = this.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
  });

  // Handle password change form submission
  const passwordChangeForm = document.getElementById('passwordChangeForm');
  passwordChangeForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    const isValid = Object.values(requirements).every(regex => regex.test(newPassword));
    if (!isValid) {
        showNotification('Password does not meet requirements', 'error');
        return;
    }

    try {
        const response = await fetch('/user/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Password updated successfully');
            hideModal('passwordChangeModal');
        } else {
            showNotification(data.message || 'Failed to update password', 'error');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        showNotification('Error updating password', 'error');
    }
  });

  // Payment Method Modal
  document.querySelector('.add-payment-method').addEventListener('click', function() {
    showModal('paymentMethodModal');
  });

  // Handle payment method form submission
  const paymentMethodForm = document.getElementById('paymentMethodForm');
  paymentMethodForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const paymentData = Object.fromEntries(formData.entries());

    if (!validatePaymentData(paymentData)) {
        return;
    }

    try {
        const response = await fetch('/api/payment-methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Payment method added successfully');
            hideModal('paymentMethodModal');
            window.location.reload();
        } else {
            showNotification(data.message || 'Failed to add payment method', 'error');
        }
    } catch (error) {
        console.error('Error adding payment method:', error);
        showNotification('Error adding payment method', 'error');
    }
  });

  // Address Modal
  document.querySelector('.add-address-btn').addEventListener('click', function() {
    showModal('addressModal');
  });

  // Handle address form submission
  const addressForm = document.getElementById('addressForm');
  if (addressForm) {
    addressForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const addressData = Object.fromEntries(formData.entries());

      try {
          const response = await fetch('/api/addresses', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(addressData)
          });

          const data = await response.json();
          if (data.success) {
              showNotification('Address added successfully');
              hideModal('addressModal');
              window.location.reload();
          } else {
              showNotification(data.message || 'Failed to add address', 'error');
          }
      } catch (error) {
          showNotification('Error adding address', 'error');
      }
    });
  }

  // Tracking Modal
  const trackOrderButtons = document.querySelectorAll('.track-order');
  if (trackOrderButtons.length > 0) {
    trackOrderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const orderId = this.closest('.order-card').dataset.orderId;
            const modal = document.getElementById('trackingModal');
            if (!modal) return;
            
            const content = modal.querySelector(`.tracking-content[data-order-id="${orderId}"]`);
            if (!content) return;
            
            // Hide all content first
            modal.querySelectorAll('.tracking-content').forEach(el => el.style.display = 'none');
            
            // Show the selected content
            content.style.display = 'block';
            showModal('trackingModal');
        });
    });
  }

  // Refund Details Modal
  const viewDetailsButtons = document.querySelectorAll('.view-details');
  if (viewDetailsButtons.length > 0) {
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const refundId = this.closest('.refund-card').dataset.refundId;
            const modal = document.getElementById('refundDetailsModal');
            if (!modal) return;
            
            const content = modal.querySelector(`.refund-details-content[data-refund-id="${refundId}"]`);
            if (!content) return;
            
            // Hide all content first
            modal.querySelectorAll('.refund-details-content').forEach(el => el.style.display = 'none');
            
            // Show the selected content
            content.style.display = 'block';
            showModal('refundDetailsModal');
        });
    });
  }

  // Review Modal
  const reviewButtons = document.querySelectorAll('.edit-review');
  if (reviewButtons.length > 0) {
    reviewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const reviewId = this.closest('.review-card').dataset.reviewId;
            const modal = document.getElementById('reviewModal');
            if (!modal) return;
            
            // Hide all content first
            modal.querySelectorAll('.review-content').forEach(el => el.style.display = 'none');
            
            // Show the selected content
            const content = modal.querySelector(`.review-content[data-review-id="${reviewId}"]`);
            if (content) {
                content.style.display = 'block';
                showModal('reviewModal');
            }
        });
    });
  }

  // Confirmation Modal
  function showConfirmation(message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    const messageElement = document.getElementById('confirmationMessage');
    const confirmButton = modal.querySelector('.confirm-btn');
    
    messageElement.textContent = message;
    
    // Remove any existing click handlers
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    
    // Add new click handler
    newConfirmButton.addEventListener('click', () => {
        onConfirm();
        hideModal('confirmationModal');
    });
    
    showModal('confirmationModal');
  }

  // Sidebar navigation
  sidebarItems.forEach((item) => {
    item.addEventListener('click', function () {
      // Remove active class from all sidebar items and tabs
      sidebarItems.forEach((i) => i.classList.remove('active'));
      tabContents.forEach((tab) => tab.classList.remove('active'));

      // Add active class to clicked item
      this.classList.add('active');

      // Show corresponding tab
      const tabId = this.getAttribute('data-tab');
      const tabContent = document.getElementById(tabId);
      if (tabContent) {
        tabContent.classList.add('active');
      }

      // Handle logout separately
      if (tabId === 'logout') {
        if (confirm('Are you sure you want to logout?')) {
          // Clear any stored data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.clear();
          
          // Perform logout
          fetch('/logout', {
            method: 'POST',
            credentials: 'include'
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              window.location.href = '/user/LoginSignup';
            } else {
              console.error('Logout failed:', data.message);
              window.location.href = '/user/LoginSignup';
            }
          })
          .catch(error => {
            console.error('Logout error:', error);
            window.location.href = '/user/LoginSignup';
          });
        } else {
          // Revert to previous tab
          document.querySelector('.sidebar-item.active').click();
        }
      }
    });
  });

  // Generic Modal Creation Function
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
    }, 10);

    // Close modal handlers
    modal.querySelector('.close-modal').addEventListener('click', () => {
      closeModal(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });

    return modal;
  }

  function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  // Form Validation Functions
  function validateCardNumber(number) {
    return /^\d{13,19}$/.test(number.replace(/\s/g, ''));
  }

  function validateExpiryDate(date) {
    return /^(0[1-9]|1[0-2])\/(\d{2})$/.test(date);
  }

  function validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }

  function validatePaymentData(data, isEdit = false) {
    // Validate card number (only for new cards)
    if (!isEdit && !validateCardNumber(data.cardNumber)) {
      alert('Please enter a valid card number (13-19 digits)');
      return false;
    }

    // Validate expiry date
    if (!validateExpiryDate(data.expiryDate)) {
      alert('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    // Validate CVV (only for new cards)
    if (!isEdit && !validateCVV(data.cvv)) {
      alert('Please enter a valid CVV (3-4 digits)');
      return false;
    }

    // Validate cardholder name
    if (!data.cardHolder.trim()) {
      alert('Please enter the cardholder name');
      return false;
    }

    return true;
  }

  function setupPaymentInputValidation() {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput && !cardNumberInput.readOnly) {
      cardNumberInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
      });
    }

    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
      expiryDateInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
          value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
      });
    }

    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
      cvvInput.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
      });
    }
  }

  // Remove Payment Method Handler
  const removeMethodBtns = document.querySelectorAll('.remove-method');
  removeMethodBtns.forEach((button) => {
    button.addEventListener('click', async function (e) {
      e.preventDefault();

      const modalContent = `
                <p>Are you sure you want to remove this payment method? This action cannot be undone.</p>
            `;

      const modal = createModal('Remove Payment Method', modalContent, [
        {
          text: 'Cancel',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
        {
          text: 'Remove',
          class: 'cancel-request-btn',
          clickHandler: async () => {
            try {
              const response = await fetch('/api/payment-methods', {
                method: 'DELETE',
              });

              const data = await response.json();
              if (data.success) {
                alert('Payment method removed successfully.');
                window.location.reload(); // Refresh to update UI
              } else {
                alert(data.message || 'Failed to remove payment method');
              }
            } catch (error) {
              alert('An error occurred while removing payment method');
            }
            closeModal(modal);
          },
        },
      ]);
    });
  });

  // Address Modals
  // Edit Address
  document.querySelectorAll('.edit-address').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const isDefault = this.closest('.address-card').classList.contains('default');

      const modalContent = `
                <form id="addressForm">
                    <div class="form-group">
                        <label>Address Type</label>
                        <select id="addressType" class="form-control">
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Street Address</label>
                        <input type="text" id="streetAddress" class="form-control" value="123 Main Street" required>
                    </div>
                    <div class="form-group">
                        <label>City</label>
                        <input type="text" id="city" class="form-control" value="Cairo" required>
                    </div>
                    <div class="form-group">
                        <label>State/Region</label>
                        <input type="text" id="region" class="form-control" value="Nasr City" required>
                    </div>
                    <div class="form-group">
                        <label>Country</label>
                        <select id="country" class="form-control">
                            <option value="eg" selected>Egypt</option>
                            <option value="sa">Saudi Arabia</option>
                            <option value="ae">United Arab Emirates</option>
                            <option value="us">United States</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Postal Code</label>
                        <input type="text" id="postalCode" class="form-control" value="11511" required>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="defaultAddress" ${isDefault ? 'checked' : ''}>
                            Set as default address
                        </label>
                    </div>
                </form>
            `;

      const modal = createModal('Edit Address', modalContent, [
        {
          text: 'Cancel',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
        {
          text: 'Save Changes',
          clickHandler: () => {
            alert('Address updated successfully!');
            closeModal(modal);
          },
        },
      ]);
    });
  });

  // Add New Address
  document.querySelector('.add-address-btn').addEventListener('click', function (e) {
    e.preventDefault();

    const modalContent = `
            <form id="newAddressForm">
                <div class="form-group">
                    <label>Address Type</label>
                    <select id="addressType" class="form-control">
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Street Address</label>
                    <input type="text" id="streetAddress" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="city" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>State/Region</label>
                    <input type="text" id="region" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Country</label>
                    <select id="country" class="form-control">
                        <option value="eg" selected>Egypt</option>
                        <option value="sa">Saudi Arabia</option>
                        <option value="ae">United Arab Emirates</option>
                        <option value="us">United States</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Postal Code</label>
                    <input type="text" id="postalCode" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="defaultAddress">
                        Set as default address
                    </label>
                </div>
            </form>
        `;

    const modal = createModal('Add New Address', modalContent, [
      {
        text: 'Cancel',
        class: 'cancel-btn',
        clickHandler: () => closeModal(modal),
      },
      {
        text: 'Add Address',
        clickHandler: () => {
          alert('New address added successfully!');
          closeModal(modal);
        },
      },
    ]);
  });

  // Tracking Modal
  function showTrackingModal() {
    const modalContent = `
            <div class="tracking-container">
                <h4>Order #12345 - Tracking Information</h4>
                
                <div class="tracking-progress">
                    <div class="tracking-step completed">
                        <div class="step-icon"><i class="fas fa-check"></i></div>
                        <div class="step-label">Order Placed</div>
                        <div class="step-date">Mar 15</div>
                    </div>
                    <div class="tracking-step completed">
                        <div class="step-icon"><i class="fas fa-check"></i></div>
                        <div class="step-label">Processing</div>
                        <div class="step-date">Mar 16</div>
                    </div>
                    <div class="tracking-step active">
                        <div class="step-icon"><i class="fas fa-truck"></i></div>
                        <div class="step-label">Shipped</div>
                        <div class="step-date">Mar 17</div>
                    </div>
                    <div class="tracking-step">
                        <div class="step-icon"><i class="fas fa-home"></i></div>
                        <div class="step-label">Delivered</div>
                        <div class="step-date">Est. Mar 20</div>
                    </div>
                </div>
                
                <div class="tracking-details">
                    <h4>Shipping Details</h4>
                    <div><strong>Carrier:</strong></div>
                    <div>DHL Express</div>
                    <div><strong>Tracking Number:</strong></div>
                    <div>XYZ123456789</div>
                    <div><strong>Shipped From:</strong></div>
                    <div>Dubai, UAE</div>
                    <div><strong>Destination:</strong></div>
                    <div>Cairo, Egypt</div>
                    <div><strong>Last Update:</strong></div>
                    <div>Mar 18, 2023 - 10:30 AM</div>
                    <div><strong>Status:</strong></div>
                    <div>In transit - Arrived at destination country</div>
                </div>
            </div>
        `;

    const modal = createModal('Order Tracking', modalContent, [
      {
        text: 'Close',
        class: 'cancel-btn',
        clickHandler: () => closeModal(modal),
      },
    ]);
  }

  // Track Order button
  document.querySelectorAll('.track-order').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      showTrackingModal();
    });
  });

  // Refund Details Modal
  document.querySelectorAll('.view-details').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const isCompleted = this.closest('.refund-card').classList.contains('completed');

      const modalContent = `
                <div class="refund-details-container">
                    <h4>Refund #R12345</h4>
                    <p><strong>Status:</strong> <span class="${isCompleted ? 'status-completed' : 'status-pending'}">${isCompleted ? 'Completed' : 'Pending'}</span></p>
                    <p><strong>Order:</strong> #12344 - Women's Elegant Watch</p>
                    <p><strong>Request Date:</strong> March 18, 2023</p>
                    ${isCompleted ? '<p><strong>Processed Date:</strong> March 20, 2023</p>' : ''}
                    
                    <h5 style="margin-top: 20px;">Refund Summary</h5>
                    <div class="refund-summary">
                        <div><strong>Product Amount:</strong></div>
                        <div>$149.99</div>
                        <div><strong>Shipping Fee:</strong></div>
                        <div>$0.00</div>
                        <div><strong>Tax:</strong></div>
                        <div>$0.00</div>
                        <div><strong>Total Refund:</strong></div>
                        <div>$149.99</div>
                    </div>
                    
                    <h5 style="margin-top: 20px;">Reason</h5>
                    <p>Wrong item received</p>
                    
                    <h5 style="margin-top: 20px;">Additional Notes</h5>
                    <div class="refund-note">
                        <i class="fas fa-info-circle"></i>
                        <p>${
                          isCompleted
                            ? 'Your refund has been processed and the amount has been credited back to your original payment method. Please allow 3-5 business days for the amount to reflect in your account.'
                            : 'Your refund request is being processed. We will notify you once it has been completed.'
                        }
                        </p>
                    </div>
                    
                    ${
                      !isCompleted
                        ? `
                    <h5 style="margin-top: 20px;">Next Steps</h5>
                    <p>Please ship the item back to us using the provided return label. Once we receive the item, we will process your refund.</p>
                    `
                        : ''
                    }
                </div>
            `;

      const buttons = [
        {
          text: 'Close',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
      ];

      if (!isCompleted) {
        buttons.push({
          text: 'Cancel Request',
          class: 'cancel-request-btn',
          clickHandler: () => {
            if (confirm('Are you sure you want to cancel this refund request?')) {
              alert('Refund request cancelled successfully.');
              closeModal(modal);
            }
          },
        });
      }

      const modal = createModal('Refund Details', modalContent, buttons);
    });
  });

  // Review Modals
  // Edit Review
  document.querySelectorAll('.edit-review').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const reviewId = this.closest('.review-card').dataset.reviewId;
      loadReviewDetails(reviewId);
    });
  });

  // Delete Review Confirmation
  document.querySelectorAll('.delete-review').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const modalContent = `
                <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            `;

      const modal = createModal('Delete Review', modalContent, [
        {
          text: 'Cancel',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
        {
          text: 'Delete',
          class: 'cancel-request-btn',
          clickHandler: () => {
            alert('Review deleted successfully.');
            closeModal(modal);
          },
        },
      ]);
    });
  });

  // Remove Address Confirmation
  document.querySelectorAll('.remove-address').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const modalContent = `
                <p>Are you sure you want to remove this address? This action cannot be undone.</p>
            `;

      const modal = createModal('Remove Address', modalContent, [
        {
          text: 'Cancel',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
        {
          text: 'Remove',
          class: 'cancel-request-btn',
          clickHandler: () => {
            alert('Address removed successfully.');
            closeModal(modal);
          },
        },
      ]);
    });
  });

  // Cancel Refund Request Confirmation
  const cancelRequestButtons = document.querySelectorAll('.cancel-request-btn');
  if (cancelRequestButtons.length > 0) {
    cancelRequestButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const refundContent = this.closest('.refund-details-content');
            if (!refundContent) return;
            
            const refundId = refundContent.dataset.refundId;
            if (!refundId) return;

            try {
                const response = await fetch('/user/refund/cancel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refundId })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('Refund request cancelled successfully');
                    hideModal('refundDetailsModal');
                    // Refresh the page to update the refund list
                    window.location.reload();
                } else {
                    throw new Error(data.message || 'Failed to cancel refund request');
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    });
  }

  // Function to load order details
  async function loadOrderDetails(orderId) {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        console.log('Loading order details for ID:', orderId);

        const response = await fetch(`/user/orders/${orderId}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load order details');
        }

        const order = data.data;
        if (!order) {
            throw new Error('Order not found');
        }

        // Get the modal
        const modal = document.getElementById('orderDetailsModal');
        if (!modal) {
            throw new Error('Order details modal not found');
        }

        // Create the order details content
        const content = document.createElement('div');
        content.className = 'order-details-content';
        content.setAttribute('data-order-id', orderId);
        
        // Create the content structure
        content.innerHTML = `
            <div class="order-info">
                <h4>Order #${order._id}</h4>
                <p><strong>Status:</strong> <span class="status-${order.status.toLowerCase()}">${order.status}</span></p>
                <p><strong>Order Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || 'Not available'}</p>
            </div>
            
            <div class="order-summary">
                <h5>Order Summary</h5>
                <div class="summary-grid">
                    <div><strong>Subtotal:</strong></div>
                    <div>$${order.total?.toFixed(2) || '0.00'}</div>
                    <div><strong>Shipping:</strong></div>
                    <div>$${order.shippingCost?.toFixed(2) || '0.00'}</div>
                    <div><strong>Tax:</strong></div>
                    <div>$${order.tax?.toFixed(2) || '0.00'}</div>
                    <div><strong>Total:</strong></div>
                    <div>$${order.total?.toFixed(2) || '0.00'}</div>
                </div>
            </div>
            
            <div class="order-products">
                <h5>Products</h5>
                ${order.items?.map(item => `
                    <div class="order-product-detail">
                        <img src="${item.productId && item.productId.image ? (item.productId.image.startsWith('/') ? item.productId.image : `/Assets/Images/Watches/${item.productId.image}`) : '/Assets/Images/product-placeholder.jpg'}" alt="${item.productId && item.productId.name ? item.productId.name : 'Product'}">
                        <div>
                            <h5>${item.productId && item.productId.name ? item.productId.name : 'Unknown Product'}</h5>
                            <p>Qty: ${item.quantity || 1}</p>
                            <p>Price: $${item.price?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                `).join('') || 'No products found'}
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
        
        // Clear existing content and add new content
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = '';
            modalBody.appendChild(content);
        }

        // Show/hide track order button based on order status
        const trackOrderBtn = modal.querySelector('.track-order-btn');
        if (trackOrderBtn) {
            trackOrderBtn.style.display = order.status === 'Shipped' ? 'block' : 'none';
        }

        // Show the modal
        showModal('orderDetailsModal');

    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification(error.message || 'Failed to load order details', 'error');
    }
  }

  // Function to load tracking information
  async function loadTrackingInfo(orderId) {
    try {
      const response = await fetch(`/shipping/order/${orderId}?format=json`);
      const data = await response.json();
      
      if (data.success) {
        const shipping = data.data;
        
        const modalContent = `
          <div class="tracking-container">
            <h4>Order #${orderId} - Tracking Information</h4>
            
            <div class="tracking-progress">
              <div class="tracking-step ${shipping.status === 'pending' ? 'active' : ''}">
                <div class="step-icon"><i class="fas fa-box"></i></div>
                <div class="step-label">Order Placed</div>
                <div class="step-date">${new Date(shipping.createdAt).toLocaleDateString()}</div>
              </div>
              <div class="tracking-step ${shipping.status === 'processing' ? 'active' : ''}">
                <div class="step-icon"><i class="fas fa-cog"></i></div>
                <div class="step-label">Processing</div>
                <div class="step-date">${shipping.status === 'processing' ? new Date().toLocaleDateString() : ''}</div>
              </div>
              <div class="tracking-step ${shipping.status === 'shipped' ? 'active' : ''}">
                <div class="step-icon"><i class="fas fa-shipping-fast"></i></div>
                <div class="step-label">Shipped</div>
                <div class="step-date">${shipping.status === 'shipped' ? new Date().toLocaleDateString() : ''}</div>
              </div>
              <div class="tracking-step ${shipping.status === 'delivered' ? 'active' : ''}">
                <div class="step-icon"><i class="fas fa-check-circle"></i></div>
                <div class="step-label">Delivered</div>
                <div class="step-date">${shipping.status === 'delivered' ? new Date().toLocaleDateString() : ''}</div>
              </div>
            </div>
            
            <div class="tracking-details">
              <h4>Shipping Details</h4>
              <div><strong>Carrier:</strong></div>
              <div>${shipping.carrier || 'Standard Shipping'}</div>
              <div><strong>Tracking Number:</strong></div>
              <div>${shipping.trackingNumber || 'Not available'}</div>
              <div><strong>Shipped From:</strong></div>
              <div>${shipping.origin || 'Our Warehouse'}</div>
              <div><strong>Destination:</strong></div>
              <div>${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}</div>
              <div><strong>Last Update:</strong></div>
              <div>${new Date(shipping.updatedAt).toLocaleDateString()}</div>
              <div><strong>Status:</strong></div>
              <div>${shipping.status}</div>
            </div>
          </div>
        `;

        const modal = createModal('Order Tracking', modalContent, [
          {
            text: 'Close',
            class: 'cancel-btn',
            clickHandler: () => closeModal(modal)
          }
        ]);
      } else {
        showNotification(data.message || 'Failed to load tracking information', 'error');
      }
    } catch (error) {
      console.error('Error loading tracking information:', error);
      showNotification('Error loading tracking information', 'error');
    }
  }

  // Track Order button
  document.querySelectorAll('.track-order').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      showTrackingModal();
    });
  });

  // Refund Details Modal
  document.querySelectorAll('.view-details').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const isCompleted = this.closest('.refund-card').classList.contains('completed');

      const modalContent = `
                <div class="refund-details-container">
                    <h4>Refund #R12345</h4>
                    <p><strong>Status:</strong> <span class="${isCompleted ? 'status-completed' : 'status-pending'}">${isCompleted ? 'Completed' : 'Pending'}</span></p>
                    <p><strong>Order:</strong> #12344 - Women's Elegant Watch</p>
                    <p><strong>Request Date:</strong> March 18, 2023</p>
                    ${isCompleted ? '<p><strong>Processed Date:</strong> March 20, 2023</p>' : ''}
                    
                    <h5 style="margin-top: 20px;">Refund Summary</h5>
                    <div class="refund-summary">
                        <div><strong>Product Amount:</strong></div>
                        <div>$149.99</div>
                        <div><strong>Shipping Fee:</strong></div>
                        <div>$0.00</div>
                        <div><strong>Tax:</strong></div>
                        <div>$0.00</div>
                        <div><strong>Total Refund:</strong></div>
                        <div>$149.99</div>
                    </div>
                    
                    <h5 style="margin-top: 20px;">Reason</h5>
                    <p>Wrong item received</p>
                    
                    <h5 style="margin-top: 20px;">Additional Notes</h5>
                    <div class="refund-note">
                        <i class="fas fa-info-circle"></i>
                        <p>${
                          isCompleted
                            ? 'Your refund has been processed and the amount has been credited back to your original payment method. Please allow 3-5 business days for the amount to reflect in your account.'
                            : 'Your refund request is being processed. We will notify you once it has been completed.'
                        }
                        </p>
                    </div>
                    
                    ${
                      !isCompleted
                        ? `
                    <h5 style="margin-top: 20px;">Next Steps</h5>
                    <p>Please ship the item back to us using the provided return label. Once we receive the item, we will process your refund.</p>
                    `
                        : ''
                    }
                </div>
            `;

      const buttons = [
        {
          text: 'Close',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
      ];

      if (!isCompleted) {
        buttons.push({
          text: 'Cancel Request',
          class: 'cancel-request-btn',
          clickHandler: () => {
            if (confirm('Are you sure you want to cancel this refund request?')) {
              alert('Refund request cancelled successfully.');
              closeModal(modal);
            }
          },
        });
      }

      const modal = createModal('Refund Details', modalContent, buttons);
    });
  });

  // Review Modals
  // Edit Review
  document.querySelectorAll('.edit-review').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const reviewId = this.closest('.review-card').dataset.reviewId;
      loadReviewDetails(reviewId);
    });
  });

  // Delete Review Confirmation
  document.querySelectorAll('.delete-review').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const modalContent = `
                <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            `;

      const modal = createModal('Delete Review', modalContent, [
        {
          text: 'Cancel',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
        {
          text: 'Delete',
          class: 'cancel-request-btn',
          clickHandler: () => {
            alert('Review deleted successfully.');
            closeModal(modal);
          },
        },
      ]);
    });
  });

  // Remove Address Confirmation
  document.querySelectorAll('.remove-address').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const modalContent = `
                <p>Are you sure you want to remove this address? This action cannot be undone.</p>
            `;

      const modal = createModal('Remove Address', modalContent, [
        {
          text: 'Cancel',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
        {
          text: 'Remove',
          class: 'cancel-request-btn',
          clickHandler: () => {
            alert('Address removed successfully.');
            closeModal(modal);
          },
        },
      ]);
    });
  });

  // Cancel Refund Request Confirmation
  document.querySelectorAll('.cancel-request').forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const modalContent = `
                <p>Are you sure you want to cancel this refund request? This action cannot be undone.</p>
            `;

      const modal = createModal('Cancel Refund Request', modalContent, [
        {
          text: 'Cancel',
          class: 'cancel-btn',
          clickHandler: () => closeModal(modal),
        },
        {
          text: 'Confirm Cancellation',
          class: 'cancel-request-btn',
          clickHandler: () => {
            alert('Refund request cancelled successfully.');
            closeModal(modal);
          },
        },
      ]);
    });
  });

  // Function to load review details
  async function loadReviewDetails(reviewId) {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`);
      const data = await response.json();
      
      if (data.success) {
        const review = data.data;
        const modal = document.getElementById('reviewModal');
        
        // Update modal content
        document.getElementById('reviewTitle').value = review.title;
        document.getElementById('reviewText').value = review.content;
        
        // Update star rating
        const stars = modal.querySelectorAll('.star-rating i');
        stars.forEach((star, index) => {
          if (index < review.rating) {
            star.classList.add('active');
          } else {
            star.classList.remove('active');
          }
        });
        
        // Update form submission handler
        const form = modal.querySelector('form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          
          const formData = new FormData(form);
          const rating = modal.querySelectorAll('.star-rating i.active').length;
          
          try {
            const updateResponse = await fetch(`/api/reviews/${reviewId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                rating,
                title: formData.get('reviewTitle'),
                content: formData.get('reviewText')
              })
            });
            
            const updateData = await updateResponse.json();
            
            if (updateData.success) {
              showNotification('Review updated successfully');
              modal.style.display = 'none';
              window.location.reload(); // Refresh to update UI
            } else {
              showNotification(updateData.message || 'Failed to update review', 'error');
            }
          } catch (error) {
            console.error('Error updating review:', error);
            showNotification('Error updating review', 'error');
          }
        };
        
        // Update delete handler
        const deleteButton = modal.querySelector('.delete-review');
        if (deleteButton) {
          deleteButton.onclick = async () => {
            if (confirm('Are you sure you want to delete this review?')) {
              try {
                const deleteResponse = await fetch(`/api/reviews/${reviewId}`, {
                  method: 'DELETE'
                });
                
                const deleteData = await deleteResponse.json();
                
                if (deleteData.success) {
                  showNotification('Review deleted successfully');
                  modal.style.display = 'none';
                  window.location.reload(); // Refresh to update UI
                } else {
                  showNotification(deleteData.message || 'Failed to delete review', 'error');
                }
              } catch (error) {
                console.error('Error deleting review:', error);
                showNotification('Error deleting review', 'error');
              }
            }
          };
        }
        
        // Show modal
        modal.style.display = 'block';
      } else {
        showNotification(data.message || 'Failed to load review details', 'error');
      }
    } catch (error) {
      console.error('Error loading review details:', error);
      showNotification('Error loading review details', 'error');
    }
  }

  // Form submission handlers
  document.getElementById('passwordChangeForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword')
    };
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification('Password updated successfully');
        document.getElementById('passwordChangeModal').style.display = 'none';
      } else {
        showNotification(result.message || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('Error updating password', 'error');
    }
  });

  document.getElementById('paymentMethodForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {
      cardType: formData.get('cardType'),
      cardNumber: formData.get('cardNumber'),
      cardHolder: formData.get('cardHolder'),
      expiryDate: formData.get('expiryDate'),
      cvv: formData.get('cvv')
    };
    
    try {
      const response = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification('Payment method added successfully');
        document.getElementById('paymentMethodModal').style.display = 'none';
        window.location.reload(); // Refresh to show new payment method
      } else {
        showNotification(result.message || 'Failed to add payment method', 'error');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      showNotification('Error adding payment method', 'error');
    }
  });

  document.getElementById('reviewForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {
      rating: document.querySelectorAll('.star-rating i.active').length,
      title: formData.get('reviewTitle'),
      content: formData.get('reviewText')
    };
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification('Review updated successfully');
        document.getElementById('reviewModal').style.display = 'none';
        window.location.reload(); // Refresh to show updated review
      } else {
        showNotification(result.message || 'Failed to update review', 'error');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showNotification('Error updating review', 'error');
    }
  });

  // Delete confirmation handlers
  document.querySelectorAll('.delete-review, .remove-method, .cancel-request').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const modal = document.getElementById('deleteConfirmationModal');
      const type = this.classList.contains('delete-review') ? 'review' :
                  this.classList.contains('remove-method') ? 'payment method' :
                  'refund request';
      
      document.getElementById('deleteConfirmationTitle').textContent = `Delete ${type}`;
      document.getElementById('deleteConfirmationMessage').textContent = 
        `Are you sure you want to delete this ${type}? This action cannot be undone.`;
      
      const confirmButton = document.getElementById('deleteConfirmationButton');
      confirmButton.onclick = async () => {
        try {
          const endpoint = this.classList.contains('delete-review') ? '/api/reviews' :
                          this.classList.contains('remove-method') ? '/api/user/payment-methods' :
                          '/api/refunds';
          
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: this.dataset.id
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            showNotification(`${type} deleted successfully`);
            modal.style.display = 'none';
            window.location.reload(); // Refresh to update UI
          } else {
            showNotification(result.message || `Failed to delete ${type}`, 'error');
          }
        } catch (error) {
          console.error(`Error deleting ${type}:`, error);
          showNotification(`Error deleting ${type}`, 'error');
        }
      };
      
      modal.style.display = 'block';
    });
  });

  // Refund request handling
  document.querySelectorAll('.request-refund').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const orderId = this.dataset.orderId;
      if (!orderId) {
        showNotification('Order ID is missing', 'error');
        return;
      }

      // Set the order ID in the hidden input
      document.getElementById('refundOrderId').value = orderId;
      
      // Show the refund request modal
      showModal('refundRequestModal');
    });
  });

  // Handle refund reason selection
  document.getElementById('refundReason').addEventListener('change', function() {
    const otherReasonGroup = document.getElementById('otherReasonGroup');
    if (this.value === 'Other') {
      otherReasonGroup.style.display = 'block';
    } else {
      otherReasonGroup.style.display = 'none';
    }
  });

  // Handle refund request submission
  document.querySelector('.submit-refund-btn').addEventListener('click', async function() {
    const form = document.getElementById('refundRequestForm');
    const orderId = document.getElementById('refundOrderId').value;
    const reason = document.getElementById('refundReason').value;
    const otherReason = document.getElementById('otherReason').value;
    const details = document.getElementById('refundDetails').value;

    if (!reason) {
      showNotification('Please select a reason for the refund', 'error');
      return;
    }

    if (reason === 'Other' && !otherReason) {
      showNotification('Please specify the reason for refund', 'error');
      return;
    }

    try {
      const response = await fetch('/api/refunds/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          reason: reason === 'Other' ? otherReason : reason,
          details
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification('Refund request submitted successfully');
        hideModal('refundRequestModal');
        // Refresh the page to show the updated refund status
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to submit refund request');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  });

  // Close refund request modal
  document.querySelector('#refundRequestModal .close-modal').addEventListener('click', function() {
    hideModal('refundRequestModal');
  });

  document.querySelector('#refundRequestModal .cancel-btn').addEventListener('click', function() {
    hideModal('refundRequestModal');
  });
});
