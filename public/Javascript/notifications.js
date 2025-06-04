// Notification utility functions
if (typeof window.showNotification === 'undefined') {
  const showNotification = (type, message, title = type === 'success' ? 'Success' : 'Error') => {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'notificationModal';

    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
        <h3>${title}</h3>
        <button class="close-modal" onclick="closeNotification()">&times;</button>
    `;

    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = `
        <div class="notification-icon ${type}">
            ${type === 'success' ? '✓' : '✕'}
        </div>
        <div class="notification-message">
            ${message}
        </div>
    `;

    // Create modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = `
        <button onclick="closeNotification()">Close</button>
    `;

    // Assemble modal
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalBody);
    modalContainer.appendChild(modalFooter);
    modal.appendChild(modalContainer);

    // Add to document
    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 50);

    // Auto close after 5 seconds
    setTimeout(() => {
      closeNotification();
    }, 5000);
  };

  // Export showNotification to window
  window.showNotification = showNotification;
}

// Close notification function - only define if it doesn't already exist
if (typeof window.closeNotification === 'undefined') {
  const closeNotification = () => {
    const modal = document.getElementById('notificationModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  };
  
  // Export closeNotification to window
  window.closeNotification = closeNotification;
}

// Confirmation dialog
if (typeof window.showConfirmation === 'undefined') {
  const showConfirmation = (message, onConfirm, onCancel = () => {}) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'confirmationModal';

    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
        <h3>Confirm Action</h3>
        <button class="close-modal" onclick="closeConfirmation()">&times;</button>
    `;

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = `
        <div class="notification-message">
            ${message}
        </div>
    `;

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = `
        <button class="cancel-btn" onclick="closeConfirmation()">Cancel</button>
        <button class="confirm-btn" onclick="confirmAction()">Confirm</button>
    `;

    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalBody);
    modalContainer.appendChild(modalFooter);
    modal.appendChild(modalContainer);

    document.body.appendChild(modal);

    setTimeout(() => {
      modal.classList.add('show');
    }, 50);

    // Close confirmation function
    window.closeConfirmation = () => {
      const modal = document.getElementById('confirmationModal');
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
          onCancel();
        }, 300);
      }
    };

    // Confirm action function
    window.confirmAction = () => {
      const modal = document.getElementById('confirmationModal');
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
          onConfirm();
        }, 300);
      }
    };
  };

  // Export to window
  window.showConfirmation = showConfirmation;
}

// Add styles
const style = document.createElement('style');
style.textContent = `
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    backdrop-filter: blur(3px);
}

.modal-overlay.show {
    opacity: 1;
    visibility: visible;
}

.modal-container {
    background-color: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transform: translateY(30px);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-overlay.show .modal-container {
    transform: translateY(0);
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f9f9f9;
    border-radius: 12px 12px 0 0;
    position: sticky;
    top: 0;
    z-index: 10;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1C2E4A;
}

.close-modal {
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    transition: color 0.2s ease;
    background: none;
    border: none;
    padding: 0;
    line-height: 1;
}

.close-modal:hover {
    color: #333;
}

.modal-body {
    padding: 25px;
    text-align: center;
}

.notification-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
}

.notification-icon.success {
    color: #4CAF50;
}

.notification-icon.error {
    color: #f44336;
}

.modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: center;
    gap: 12px;
    background-color: #f9f9f9;
    border-radius: 0 0 12px 12px;
    position: sticky;
    bottom: 0;
}

.modal-footer button {
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    min-width: 100px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.confirm-btn {
    background: #1976d2;
    color: white;
    border: none;
}

.confirm-btn:hover {
    background: #1565c0;
}

.cancel-btn {
    background: #f5f5f5;
    color: #333;
    border: none;
}

.cancel-btn:hover {
    background: #e0e0e0;
}
`;

document.head.appendChild(style);
