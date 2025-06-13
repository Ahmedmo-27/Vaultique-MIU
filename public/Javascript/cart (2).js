const cartItems = document.querySelectorAll('.cart-item');
const emptyCartMessage = document.querySelector('.empty-cart');
const itemsInCartDisplay = document.querySelector('#cart-items-count');
const shippingDropdown = document.querySelector('#shipping');
const subtotalElement = document.querySelector('.subtotal');
const totalPriceElement = document.querySelector('.total-price');
const shippingCostElement = document.querySelector('#shipping-cost');
const cartItemsContainer = document.querySelector('.cart-items');
const cartItemsCount = document.getElementById('cart-items-count');

// Loading state management
function setLoading(isLoading, element) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Helper function to show loading state
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

// Helper function to hide loading state
function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

// Helper function to show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;
    document.querySelector('.cart-section').insertBefore(errorDiv, cartItemsContainer);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Helper function to show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>${message}</p>
    `;
    document.querySelector('.cart-section').insertBefore(successDiv, cartItemsContainer);
    setTimeout(() => successDiv.remove(), 3000);
}

// Function to update item quantity
async function updateQuantity(productId, newQuantity) {
    try {
        if (!productId || !newQuantity) {
            throw new Error('Product ID and quantity are required');
        }

        if (newQuantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        const response = await fetch('/user/cart/update-quantity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: newQuantity })
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMessage = data.message || 'Failed to update quantity';
            
            // Handle specific error cases
            switch (data.code) {
                case 'INVALID_CART_STATE':
                    errorMessage = `Cart error: ${data.details.join(', ')}`;
                    if (data.isEmpty) {
                        showMessage('Your cart is empty. Please add items to your cart first.', 'error');
                        return;
                    }
                    break;
                case 'ITEM_NOT_FOUND':
                    errorMessage = data.message;
                    if (data.isEmpty) {
                        showMessage('Your cart is empty. Please add items to your cart first.', 'error');
                        return;
                    }
                    break;
                case 'INSUFFICIENT_STOCK':
                    errorMessage = `Only ${data.availableStock} items available in stock`;
                    break;
                case 'OUT_OF_STOCK':
                    errorMessage = 'This product is currently out of stock';
                    break;
                case 'PRODUCT_NOT_FOUND':
                    errorMessage = 'This product is no longer available';
                    break;
                case 'SERVER_ERROR':
                    console.error('Server error details:', data.details);
                    errorMessage = 'An unexpected error occurred. Please try again.';
                    break;
            }
            
            throw new Error(errorMessage);
        }

        if (data.success) {
            // Update cart UI with new data
            updateCartUI(data.cart);
            showSuccess('Cart updated successfully');
        } else {
            throw new Error(data.message || 'Failed to update cart');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError(error.message);
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

// Function to remove item
async function removeItem(productId) {
    try {
        const response = await fetch('/user/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });

        const data = await response.json();
        
        if (!response.ok) {
            let errorMessage = data.message || 'An error occurred while removing item';
            
            // Handle specific error cases
            switch (data.code) {
                case 'MISSING_PRODUCT_ID':
                    errorMessage = 'Please provide a product ID to remove.';
                    break;
                case 'ITEM_NOT_FOUND':
                    errorMessage = 'The item you are trying to remove is not in your cart.';
                    break;
                case 'SERVER_ERROR':
                    errorMessage = 'An unexpected error occurred. Please try again later.';
                    break;
            }
            
            throw new Error(errorMessage);
        }

        updateCartUI(data.cart);
        showSuccess(data.message);
    } catch (error) {
        console.error('Error removing item:', error);
        showError('Failed to remove item. Please try again.');
    }
}

// Function to update shipping method
async function updateShipping(method) {
    try {
        const response = await fetch('/user/cart/update-shipping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shippingMethod: method })
        });

        const data = await response.json();
        
        if (!response.ok) {
            let errorMessage = data.message || 'An error occurred while updating shipping';
            
            // Handle specific error cases
            switch (data.code) {
                case 'MISSING_SHIPPING_METHOD':
                    errorMessage = 'Please select a shipping method.';
                    break;
                case 'INVALID_SHIPPING_METHOD':
                    errorMessage = 'Please select either standard or fast shipping.';
                    break;
                case 'SERVER_ERROR':
                    errorMessage = 'An unexpected error occurred. Please try again later.';
                    break;
            }
            
            throw new Error(errorMessage);
        }

        updateCartUI(data.cart);
        showSuccess(data.message);
    } catch (error) {
        console.error('Error updating shipping:', error);
        showError('Failed to update shipping method. Please try again.');
    }
}

// Function to clear cart
async function clearCart() {
    try {
        const response = await fetch('/user/cart/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            let errorMessage = data.message || 'An error occurred while clearing cart';
            
            // Handle specific error cases
            switch (data.code) {
                case 'CART_ALREADY_EMPTY':
                    errorMessage = 'Your cart is already empty.';
                    break;
                case 'SERVER_ERROR':
                    errorMessage = 'An unexpected error occurred. Please try again later.';
                    break;
            }
            
            throw new Error(errorMessage);
        }

        updateCartUI(data.cart);
        showSuccess(data.message);
    } catch (error) {
        console.error('Error clearing cart:', error);
        showError('Failed to clear cart. Please try again.');
    }
}

// Function to update cart UI
function updateCartUI(cart) {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    const checkoutButton = document.querySelector('.checkout-btn');
    
    if (!cartItemsContainer || !cartSummary) return;

    // Update cart items
    if (cart.items && cart.items.length > 0) {
        cartItemsContainer.innerHTML = cart.items.map(item => `
            <div class="cart-item" data-product-id="${item.product || item.productId}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn minus" onclick="updateQuantity('${item.product || item.productId}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateQuantity('${item.product || item.productId}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="remove-item" onclick="removeItem('${item.product || item.productId}')">×</button>
            </div>
        `).join('');

        // Enable checkout button if it exists
        if (checkoutButton) {
            checkoutButton.removeAttribute('disabled');
            checkoutButton.classList.remove('disabled');
        }
    } else {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        
        // Disable checkout button if it exists
        if (checkoutButton) {
            checkoutButton.setAttribute('disabled', 'disabled');
            checkoutButton.classList.add('disabled');
        }
    }

    // Update cart summary
    cartSummary.innerHTML = `
        <div class="summary-section">
            <h3>Cart Summary</h3>
            <div class="summary-item">
                <span>Items (${cart.items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>$${cart.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Shipping</span>
                <span>$${cart.shippingCost.toFixed(2)}</span>
            </div>
            <div class="summary-item total">
                <span>Total</span>
                <span>$${cart.total.toFixed(2)}</span>
            </div>
        </div>
    `;

    // Update shipping dropdown
    if (shippingDropdown) {
        shippingDropdown.value = cart.shippingMethod || 'standard';
        shippingDropdown.dataset.previousValue = shippingDropdown.value;
    }
}

// Function to handle checkout
function handleCheckout() {
    const cart = document.querySelector('.cart-items');
    if (!cart || cart.querySelector('.empty-cart')) {
        showMessage('Your cart is empty. Please add items before proceeding to checkout.', 'error');
        return;
    }
    window.location.href = '/user/payment';
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Shipping method change
    const shippingDropdown = document.getElementById('shipping');
    if (shippingDropdown) {
        shippingDropdown.dataset.previousValue = shippingDropdown.value;
        shippingDropdown.addEventListener('change', (e) => {
            updateShipping(e.target.value);
        });
    }

    // Add event listeners for quantity controls
    document.querySelectorAll('.cart-item').forEach(item => {
        const increaseBtn = item.querySelector('.increase');
        const decreaseBtn = item.querySelector('.decrease');
        const productId = item.dataset.productId;

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                const currentQuantity = parseInt(item.querySelector('.quantity-display').textContent);
                updateQuantity(productId, currentQuantity + 1);
            });
        }

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                const currentQuantity = parseInt(item.querySelector('.quantity-display').textContent);
                if (currentQuantity > 1) {
                    updateQuantity(productId, currentQuantity - 1);
                }
            });
        }
    });

    // Add loading state styles
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            opacity: 0.7;
            cursor: not-allowed;
            position: relative;
        }
        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error-message, .success-message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .error-message {
            background-color: #fee;
            color: #c00;
        }
        .success-message {
            background-color: #efe;
            color: #0c0;
        }
    `;
    document.head.appendChild(style);

    // Add event listener for checkout button
    const checkoutButton = document.querySelector('.checkout-btn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckout();
        });
    }
});