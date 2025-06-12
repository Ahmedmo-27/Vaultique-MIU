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

// Update quantity with server sync
async function updateQuantity(productId, change) {
    const item = document.querySelector(`.cart-item[data-id="${productId}"]`);
    const quantityDisplay = item.querySelector('.quantity-display');
    const currentQuantity = parseInt(quantityDisplay.textContent);
    
    // Prevent negative quantities
    if (currentQuantity + change < 1) return;
    
    setLoading(true, item);
    
    try {
        const response = await fetch('/cart/update-quantity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                productId,
                quantity: currentQuantity + change
            })
        });
        
        const data = await response.json();
        if (data.success) {
            updateCartUI(data.cart);
            showSuccess('Quantity updated successfully');
        } else {
            showError(data.message || 'Failed to update quantity');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError('Failed to update quantity. Please try again.');
        // Revert quantity display
        quantityDisplay.textContent = currentQuantity;
    } finally {
        setLoading(false, item);
    }
}

// Remove item with server sync
async function removeItem(productId) {
    if (!confirm('Are you sure you want to remove this item?')) return;
    
    const item = document.querySelector(`.cart-item[data-id="${productId}"]`);
    setLoading(true, item);
    
    try {
        const response = await fetch('/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });
        
        const data = await response.json();
        if (data.success) {
            updateCartUI(data.cart);
            showSuccess('Item removed successfully');
        } else {
            showError(data.message || 'Failed to remove item');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        showError('Failed to remove item. Please try again.');
    } finally {
        setLoading(false, item);
    }
}

// Update shipping method with server sync
async function updateShipping(method) {
    setLoading(true, shippingDropdown);
    
    try {
        const response = await fetch('/cart/update-shipping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shippingMethod: method })
        });
        
        const data = await response.json();
        if (data.success) {
            updateCartUI(data.cart);
            showSuccess('Shipping method updated successfully');
        } else {
            showError(data.message || 'Failed to update shipping method');
        }
    } catch (error) {
        console.error('Error updating shipping:', error);
        showError('Failed to update shipping method. Please try again.');
        // Revert shipping dropdown
        shippingDropdown.value = shippingDropdown.dataset.previousValue;
    } finally {
        setLoading(false, shippingDropdown);
    }
}

// Clear cart with server sync
async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    const clearButton = document.querySelector('.clear-cart');
    setLoading(true, clearButton);
    
    try {
        const response = await fetch('/cart/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (data.success) {
            updateCartUI({ items: [], subtotal: 0, shippingCost: 20, total: 20 });
            showSuccess('Cart cleared successfully');
        } else {
            showError(data.message || 'Failed to clear cart');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        showError('Failed to clear cart. Please try again.');
    } finally {
        setLoading(false, clearButton);
    }
}

// Update cart UI with server data
function updateCartUI(cartData) {
    // Update cart items
    if (!cartData.items || cartData.items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty. Add items to your cart to see them here.</p>
                <a href="/products" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
        document.querySelector('.cart-actions').innerHTML = `
            <a href="/products" class="btn continue-shopping-btn">
                <i class="fas fa-arrow-left"></i> Continue Shopping
            </a>
        `;
    } else {
        cartItemsContainer.innerHTML = cartData.items.map(item => `
            <div class="cart-item" data-id="${item.productId}">
                <img src="${item.image}" alt="${item.name}">
                <p class="product-name">${item.name}</p>
                <p class="item-price">$${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="decrease" onclick="updateQuantity('${item.productId}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <p class="quantity-display">${item.quantity}</p>
                    <button class="increase" onclick="updateQuantity('${item.productId}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item" onclick="removeItem('${item.productId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        document.querySelector('.cart-actions').innerHTML = `
            <button class="btn clear-cart" onclick="clearCart()">
                <i class="fas fa-trash"></i> Clear Cart
            </button>
            <a href="/checkout" class="btn checkout-btn">
                <i class="fas fa-lock"></i> Proceed to Checkout
            </a>
            <a href="/products" class="btn continue-shopping-btn">
                <i class="fas fa-arrow-left"></i> Continue Shopping
            </a>
        `;
    }

    // Update totals
    const totalItems = cartData.items.reduce((total, item) => total + item.quantity, 0);
    itemsInCartDisplay.textContent = totalItems;
    subtotalElement.textContent = `Subtotal: $${cartData.subtotal.toFixed(2)}`;
    shippingCostElement.textContent = `$${cartData.shippingCost.toFixed(2)}`;
    totalPriceElement.textContent = `Total: $${cartData.total.toFixed(2)}`;

    // Update shipping dropdown
    if (shippingDropdown) {
        shippingDropdown.value = cartData.shippingMethod || 'standard';
        shippingDropdown.dataset.previousValue = shippingDropdown.value;
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Shipping method change
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
        const productId = item.dataset.id;

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                updateQuantity(productId, 1);
            });
        }

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                updateQuantity(productId, -1);
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
});