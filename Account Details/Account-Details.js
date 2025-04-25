document.addEventListener('DOMContentLoaded', function() {
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
        { code: 'nz', name: 'New Zealand', emoji: '🇳🇿', dialCode: '+64' }
    ];

    // Populate country dropdown
    const countrySelect = document.getElementById('countrySelect');
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.setAttribute('data-dial-code', country.dialCode);
        option.innerHTML = `${country.emoji} ${country.name} (${country.dialCode})`;
        countrySelect.appendChild(option);
    });

    // Set default country to Egypt
    countrySelect.value = 'eg';

    // Phone number validation
    const phoneNumberInput = document.getElementById('phoneNumber');
    phoneNumberInput.addEventListener('blur', function() {
        if (this.value.trim() && !/^\d+$/.test(this.value)) {
            alert('Please enter a valid phone number (digits only)');
        }
    });

    // Language selection
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', function() {
        console.log(`Language changed to: ${this.value}`);
    });

    // Tab switching functionality
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all sidebar items and tabs
            sidebarItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
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
                    // Perform logout action
                    window.location.href = '/logout';
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

    // Password modal
    const changePasswordLink = document.getElementById('changePasswordLink');
    changePasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        const modalContent = `
            <form id="passwordForm">
                <div class="form-group">
                    <label>Current Password</label>
                    <div style="position:relative">
                        <input type="password" id="currentPassword" required>
                        <span class="password-toggle" id="toggleCurrentPassword">
                            <i class="far fa-eye"></i>
                        </span>
                    </div>
                </div>
                <div class="form-group">
                    <label>New Password</label>
                    <div style="position:relative">
                        <input type="password" id="newPassword" required>
                        <span class="password-toggle" id="toggleNewPassword">
                            <i class="far fa-eye"></i>
                        </span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Confirm New Password</label>
                    <div style="position:relative">
                        <input type="password" id="confirmPassword" required>
                        <span class="password-toggle" id="toggleConfirmPassword">
                            <i class="far fa-eye"></i>
                        </span>
                    </div>
                </div>
            </form>
        `;
        
        const modal = createModal('Change Password', modalContent, [
            {
                text: 'Cancel',
                class: 'cancel-btn',
                clickHandler: () => closeModal(modal)
            },
            {
                text: 'Update Password',
                clickHandler: (e) => {
                    e.preventDefault();
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    
                    if (newPassword !== confirmPassword) {
                        alert('New passwords do not match!');
                        return;
                    }
                    
                    alert('Password changed successfully!');
                    closeModal(modal);
                }
            }
        ]);
        
        // Password toggle functionality
        function setupPasswordToggle(toggleId, inputId) {
            const toggle = document.getElementById(toggleId);
            const input = document.getElementById(inputId);
            const icon = toggle.querySelector('i');
            
            toggle.addEventListener('click', function() {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        }
        
        setupPasswordToggle('toggleCurrentPassword', 'currentPassword');
        setupPasswordToggle('toggleNewPassword', 'newPassword');
        setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');
        
        modal.querySelector('#passwordForm').addEventListener('submit', function(e) {
            e.preventDefault();
            modal.querySelector('.confirm-btn').click();
        });
    });

    // Address Modals
    // Edit Address
    document.querySelectorAll('.edit-address').forEach(button => {
        button.addEventListener('click', function(e) {
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
                    clickHandler: () => closeModal(modal)
                },
                {
                    text: 'Save Changes',
                    clickHandler: () => {
                        alert('Address updated successfully!');
                        closeModal(modal);
                    }
                }
            ]);
        });
    });

    // Add New Address
    document.querySelector('.add-address-btn').addEventListener('click', function(e) {
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
                clickHandler: () => closeModal(modal)
            },
            {
                text: 'Add Address',
                clickHandler: () => {
                    alert('New address added successfully!');
                    closeModal(modal);
                }
            }
        ]);
    });

    // Payment Method Modals
    // Add Payment Method
    document.querySelector('.add-payment-method').addEventListener('click', function(e) {
        e.preventDefault();
        
        const modalContent = `
            <form id="paymentMethodForm">
                <div class="form-group">
                    <label>Card Type</label>
                    <select id="cardType" class="form-control">
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">American Express</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" id="cardNumber" class="form-control" placeholder="1234 5678 9012 3456" required>
                </div>
                <div class="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" id="cardName" class="form-control" placeholder="John Doe" required>
                </div>
                <div class="form-group" style="display: flex; gap: 15px;">
                    <div style="flex: 1;">
                        <label>Expiry Date</label>
                        <input type="text" id="expiryDate" class="form-control" placeholder="MM/YY" required>
                    </div>
                    <div style="flex: 1;">
                        <label>CVV</label>
                        <input type="text" id="cvv" class="form-control" placeholder="123" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="defaultPayment">
                        Set as default payment method
                    </label>
                </div>
            </form>
        `;
        
        const modal = createModal('Add Payment Method', modalContent, [
            {
                text: 'Cancel',
                class: 'cancel-btn',
                clickHandler: () => closeModal(modal)
            },
            {
                text: 'Add Card',
                clickHandler: () => {
                    alert('Payment method added successfully!');
                    closeModal(modal);
                }
            }
        ]);
    });

    // Order Details Modal
    document.querySelectorAll('.order-details').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const modalContent = `
                <div class="order-details-container">
                    <h4>Order #12345</h4>
                    <p><strong>Status:</strong> <span class="status-shipped">Shipped</span></p>
                    <p><strong>Order Date:</strong> March 15, 2023</p>
                    <p><strong>Estimated Delivery:</strong> March 20, 2023</p>
                    
                    <h5 style="margin-top: 20px;">Order Summary</h5>
                    <div class="order-summary">
                        <div><strong>Subtotal:</strong></div>
                        <div>$229.99</div>
                        <div><strong>Shipping:</strong></div>
                        <div>$19.99</div>
                        <div><strong>Tax:</strong></div>
                        <div>$0.00</div>
                        <div><strong>Total:</strong></div>
                        <div>$249.99</div>
                    </div>
                    
                    <h5 style="margin-top: 20px;">Products</h5>
                    <div class="order-product-detail">
                        <img src="/Ahmed/watches/Audemars Piguet Royal Oak Offshore Diver.png" alt="watch" id="order-product-image">
                        <div>
                            <h5>Audemars Piguet Royal Oak Offshore</h5>
                            <p>Qty: 1</p>
                            <p>Price: $30000</p>
                        </div>
                    </div>
                    
                    <h5 style="margin-top: 20px;">Shipping Details</h5>
                    <div class="shipping-details">
                        <p><strong>Name:</strong> Ahmed Mostafa</p>
                        <p><strong>Address:</strong> 123 Main Street, Cairo, Egypt</p>
                        <p><strong>Shipping Method:</strong> Standard Shipping</p>
                        <p><strong>Tracking Number:</strong> XYZ123456789</p>
                    </div>
                    
                    <h5 style="margin-top: 20px;">Payment Details</h5>
                    <div class="payment-details">
                        <p><strong>Payment Method:</strong> <span class="payment-method"><i class="fab fa-cc-visa"></i> Visa ending in 4242</span></p>
                        <p><strong>Payment Status:</strong> Paid</p>
                    </div>
                </div>
            `;
            
            const modal = createModal('Order Details', modalContent, [
                {
                    text: 'Close',
                    class: 'cancel-btn',
                    clickHandler: () => closeModal(modal)
                },
                {
                    text: 'Track Order',
                    class: 'track-order',
                    clickHandler: () => {
                        // Open tracking modal
                        closeModal(modal);
                        showTrackingModal();
                    }
                }
            ]);
        });
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
                clickHandler: () => closeModal(modal)
            }
        ]);
    }

    // Track Order button
    document.querySelectorAll('.track-order').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showTrackingModal();
        });
    });

    // Refund Details Modal
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function(e) {
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
                        <p>${isCompleted ? 
                            'Your refund has been processed and the amount has been credited back to your original payment method. Please allow 3-5 business days for the amount to reflect in your account.' : 
                            'Your refund request is being processed. We will notify you once it has been completed.'}
                        </p>
                    </div>
                    
                    ${!isCompleted ? `
                    <h5 style="margin-top: 20px;">Next Steps</h5>
                    <p>Please ship the item back to us using the provided return label. Once we receive the item, we will process your refund.</p>
                    ` : ''}
                </div>
            `;
            
            const buttons = [
                {
                    text: 'Close',
                    class: 'cancel-btn',
                    clickHandler: () => closeModal(modal)
                }
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
                    }
                });
            }
            
            const modal = createModal('Refund Details', modalContent, buttons);
        });
    });

    // Review Modals
    // Edit Review
    document.querySelectorAll('.edit-review').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const reviewCard = this.closest('.review-card');
            const currentRating = reviewCard.querySelectorAll('.stars i.fa-star').length;
            const currentTitle = reviewCard.querySelector('.review-content h6').textContent;
            const currentReview = reviewCard.querySelector('.review-content p').textContent;
            
            const modalContent = `
                <form id="reviewForm">
                    <div class="form-group">
                        <label>Your Rating</label>
                        <div class="star-rating">
                            <i class="fas fa-star ${currentRating >= 1 ? 'active' : ''}" data-rating="1"></i>
                            <i class="fas fa-star ${currentRating >= 2 ? 'active' : ''}" data-rating="2"></i>
                            <i class="fas fa-star ${currentRating >= 3 ? 'active' : ''}" data-rating="3"></i>
                            <i class="fas fa-star ${currentRating >= 4 ? 'active' : ''}" data-rating="4"></i>
                            <i class="fas fa-star ${currentRating >= 5 ? 'active' : ''}" data-rating="5"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Review Title</label>
                        <input type="text" id="reviewTitle" class="form-control" value="${currentTitle}" required>
                    </div>
                    <div class="form-group">
                        <label>Your Review</label>
                        <textarea id="reviewText" rows="5" class="form-control" required>${currentReview}</textarea>
                    </div>
                </form>
            `;
            
            const modal = createModal('Edit Review', modalContent, [
                {
                    text: 'Cancel',
                    class: 'cancel-btn',
                    clickHandler: () => closeModal(modal)
                },
                {
                    text: 'Update Review',
                    clickHandler: () => {
                        alert('Review updated successfully!');
                        closeModal(modal);
                    }
                }
            ]);
            
            // Star rating functionality
            modal.querySelectorAll('.star-rating i').forEach(star => {
                star.addEventListener('click', function() {
                    const rating = parseInt(this.getAttribute('data-rating'));
                    const stars = modal.querySelectorAll('.star-rating i');
                    
                    stars.forEach((s, index) => {
                        if (index < rating) {
                            s.classList.add('active');
                        } else {
                            s.classList.remove('active');
                        }
                    });
                });
            });
        });
    });

    // Delete Review Confirmation
    document.querySelectorAll('.delete-review').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const modalContent = `
                <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            `;
            
            const modal = createModal('Delete Review', modalContent, [
                {
                    text: 'Cancel',
                    class: 'cancel-btn',
                    clickHandler: () => closeModal(modal)
                },
                {
                    text: 'Delete',
                    class: 'cancel-request-btn',
                    clickHandler: () => {
                        alert('Review deleted successfully.');
                        closeModal(modal);
                    }
                }
            ]);
        });
    });

    // Remove Address Confirmation
    document.querySelectorAll('.remove-address').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const modalContent = `
                <p>Are you sure you want to remove this address? This action cannot be undone.</p>
            `;
            
            const modal = createModal('Remove Address', modalContent, [
                {
                    text: 'Cancel',
                    class: 'cancel-btn',
                    clickHandler: () => closeModal(modal)
                },
                {
                    text: 'Remove',
                    class: 'cancel-request-btn',
                    clickHandler: () => {
                        alert('Address removed successfully.');
                        closeModal(modal);
                    }
                }
            ]);
        });
    });

    // Remove Payment Method Confirmation
    document.querySelectorAll('.remove-method').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const modalContent = `
                <p>Are you sure you want to remove this payment method? This action cannot be undone.</p>
            `;
            
            const modal = createModal('Remove Payment Method', modalContent, [
                {
                    text: 'Cancel',
                    class: 'cancel-btn',
                    clickHandler: () => closeModal(modal)
                },
                {
                    text: 'Remove',
                    class: 'cancel-request-btn',
                    clickHandler: () => {
                        alert('Payment method removed successfully.');
                        closeModal(modal);
                    }
                }
            ]);
        });
    });

    // Cancel Refund Request Confirmation
    document.querySelectorAll('.cancel-request').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const modalContent = `
                <p>Are you sure you want to cancel this refund request? This action cannot be undone.</p>
            `;
            
            const modal = createModal('Cancel Refund Request', modalContent, [
                {
                    text: 'Cancel',
                    class: 'cancel-btn',
                    clickHandler: () => closeModal(modal)
                },
                {
                    text: 'Confirm Cancellation',
                    class: 'cancel-request-btn',
                    clickHandler: () => {
                        alert('Refund request cancelled successfully.');
                        closeModal(modal);
                    }
                }
            ]);
        });
    });
});