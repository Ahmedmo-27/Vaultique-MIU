// Function to add a product to the comparison list
async function addToCompare(productId) {
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
            // Show success notification
            showNotification('Product added to comparison list!', 'success');
        } else {
            // Show error notification
            showNotification(data.message || 'Failed to add product to comparison list', 'error');
        }
    } catch (error) {
        console.error('Error adding to comparison:', error);
        showNotification('An error occurred while adding to comparison list', 'error');
    }
}

// Function to show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add event listeners to all compare buttons when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add click event listeners to all compare buttons
    document.querySelectorAll('.compare').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-product-id');
            if (productId) {
                addToCompare(productId);
            }
        });
    });
}); 