// Refund functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize refund-related elements
    const refundRequestModal = document.getElementById('refundRequestModal');
    const refundDetailsModal = document.getElementById('refundDetailsModal');
    const refundReasonSelect = document.getElementById('refundReason');
    const otherReasonGroup = document.getElementById('otherReasonGroup');
    const otherReasonInput = document.getElementById('otherReason');
    const refundDetailsTextarea = document.getElementById('refundDetails');
    const submitRefundBtn = document.querySelector('.submit-refund-btn');
    const cancelRequestBtn = document.querySelector('.cancel-request-btn');

    // Show/hide other reason input based on selection
    if (refundReasonSelect) {
        refundReasonSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherReasonGroup.style.display = 'block';
                otherReasonInput.setAttribute('required', 'required');
            } else {
                otherReasonGroup.style.display = 'none';
                otherReasonInput.removeAttribute('required');
            }
        });
    }

    // Handle refund request submission
    if (submitRefundBtn) {
        submitRefundBtn.addEventListener('click', async function() {
            const orderId = document.getElementById('refundOrderId').value;
            const reason = refundReasonSelect.value === 'Other' 
                ? otherReasonInput.value 
                : refundReasonSelect.value;
            const details = refundDetailsTextarea.value;

            // Log the values when the submit request button is clicked
            console.log('Submit Request Clicked:', { orderId, reason, details });

            if (!reason) {
                showNotification('Please select a reason for the refund', 'error');
                return;
            }

            try {
                const response = await fetch('/refunds/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId,
                        reason,
                        details
                    })
                });

                // Handle HTTP errors
                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 404) {
                        throw new Error('The requested resource was not found. Please contact support if this issue persists.');
                    } else if (response.status === 401) {
                        throw new Error('You must be logged in to request a refund.');
                    } else if (response.status === 403) {
                        throw new Error('You do not have permission to request a refund for this order.');
                    } else if (response.status === 400) {
                        throw new Error(errorData.message || 'Invalid request. Please check your input and try again.');
                    } else {
                        throw new Error(`Server error: ${response.status} ${response.statusText}`);
                    }
                }

                const data = await response.json();
                if (data.success) {
                    showNotification('Refund request submitted successfully');
                    hideModal('refundRequestModal');
                    // Optionally refresh the page or update the UI
                    location.reload();
                } else {
                    throw new Error(data.message || 'Failed to submit refund request');
                }
            } catch (error) {
                console.error('Refund Request Error:', error);
                showNotification(error.message, 'error');
            }
        });
    }

    // Handle cancel refund request
    if (cancelRequestBtn) {
        cancelRequestBtn.addEventListener('click', async function() {
            const refundId = this.dataset.refundId;
            
            try {
                const response = await fetch(`/user/refunds/${refundId}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Handle HTTP errors
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('The refund request was not found.');
                    } else if (response.status === 401) {
                        throw new Error('You must be logged in to cancel a refund.');
                    } else if (response.status === 403) {
                        throw new Error('You do not have permission to cancel this refund.');
                    } else {
                        throw new Error(`Server error: ${response.status} ${response.statusText}`);
                    }
                }

                // Handle JSON parsing
                let data;
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.error('JSON Parse Error:', parseError);
                    throw new Error('Invalid response from server. Please try again later.');
                }

                if (data.success) {
                    showNotification('Refund request cancelled successfully');
                    hideModal('refundDetailsModal');
                    // Optionally refresh the page or update the UI
                    location.reload();
                } else {
                    throw new Error(data.message || 'Failed to cancel refund request');
                }
            } catch (error) {
                console.error('Cancel Refund Error:', error);
                showNotification(error.message, 'error');
            }
        });
    }

    // Handle refund request button clicks
    document.querySelectorAll('.request-refund').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if button is disabled
            if (this.classList.contains('disabled')) {
                return;
            }
            
            // Debug log
            console.log('Request refund button clicked');
            console.log('Button element:', this);
            console.log('Data attributes:', this.dataset);
            
            const orderId = this.dataset.orderId;
            
            if (!orderId) {
                console.error('Order ID is missing from the button');
                showNotification('Error: Order ID is missing. Please try again.', 'error');
                return;
            }
            
            console.log('Order ID:', orderId);
            
            // Set the order ID in the form
            const orderIdInput = document.getElementById('refundOrderId');
            if (!orderIdInput) {
                console.error('Refund order ID input element not found');
                showNotification('Error: Form element not found. Please try again.', 'error');
                return;
            }
            
            orderIdInput.value = orderId;
            console.log('Order ID set in form:', orderIdInput.value);
            
            // Reset form
            if (refundReasonSelect) refundReasonSelect.value = '';
            if (otherReasonGroup) otherReasonGroup.style.display = 'none';
            if (otherReasonInput) otherReasonInput.value = '';
            if (refundDetailsTextarea) refundDetailsTextarea.value = '';
            
            // Show modal
            showModal('refundRequestModal');
        });
    });

    // Handle view refund details button clicks
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const refundId = this.closest('.refund-card').dataset.refundId;
            
            // Set the refund ID for the cancel button
            if (cancelRequestBtn) {
                cancelRequestBtn.dataset.refundId = refundId;
            }
            
            // Show modal
            showModal('refundDetailsModal');
        });
    });

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

    // Function to show modal
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
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
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
});