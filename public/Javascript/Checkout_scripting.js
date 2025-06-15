// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Input event listeners to update card display
    const cardNumberInput = document.getElementById('card-number');
    const nameInput = document.getElementById('name');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');

    if (cardNumberInput) {
        cardNumberInput.oninput = () => {
            let cardNumber = cardNumberInput.value.replace(/\s+/g, ''); // Remove existing spaces
            if (cardNumber.length > 19) {
                cardNumber = cardNumber.slice(0, 19); // Truncate to 16 characters if longer
            }
            cardNumberInput.value = formatCardNumber(cardNumber);
            const displayCardNumber = document.getElementById('display-card-number');
            if (displayCardNumber) {
                displayCardNumber.innerText = formatCardNumber(cardNumber);
            }

            // Display length message
            const cardLengthMessage = document.querySelector('.card-length-message');
            if (cardLengthMessage) {
                if (cardNumber.length === 19) {
                    cardLengthMessage.textContent = ''; // Clear message if 16 characters
                } else {
                    cardLengthMessage.textContent = 'Must be 16 characters';
                    cardLengthMessage.style.color = 'red';
                }
            }
        };
    }

    if (nameInput) {
        nameInput.oninput = () => {
            const displayCardHolder = document.getElementById('display-card-holder');
            if (displayCardHolder) {
                displayCardHolder.innerText = nameInput.value;
            }
        };
    }

    if (expiryInput) {
        expiryInput.oninput = () => {
            const displayExpiry = document.getElementById('display-expiry');
            if (displayExpiry) {
                displayExpiry.innerText = expiryInput.value;
            }
        };
    }

    if (cvvInput) {
        cvvInput.onmouseenter = () => {
            const flipCard = document.getElementById('flip-card');
            if (flipCard) {
                flipCard.classList.add('flipped');
            }
        };

        cvvInput.onmouseleave = () => {
            const flipCard = document.getElementById('flip-card');
            if (flipCard) {
                flipCard.classList.remove('flipped');
            }
        };

        cvvInput.oninput = () => {
            const displayCvv = document.getElementById('display-cvv');
            if (displayCvv) {
                displayCvv.innerText = cvvInput.value;
            }
        };
    }

    // Rest of your existing code...
    const form = document.querySelector('.checkout-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
});

// Function to format card number with spaces every 4 digits
function formatCardNumber(cardNumber) {
    return cardNumber
        .replace(/\s+/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
}

// Billing form validation
function validateForm() {
  let isValid = true;
  const inputs = document.querySelectorAll('.checkout-form input[required]');

  inputs.forEach((input) => {
    if (input.value.trim() === '') {
      isValid = false;
      addErrorStyles(input, 'This field is required');
    } else {
      removeErrorStyles(input);
      
      // Email validation
      if (input.getAttribute('type') === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value)) {
          isValid = false;
          addErrorStyles(input, 'Please enter a valid email address');
        }
      }
      
      // Zip code validation
      if (input.getAttribute('name') === 'zipCode') {
        const zipPattern = /^\d{5}(-\d{4})?$/;
        if (!zipPattern.test(input.value.replace(/\s/g, ''))) {
          isValid = false;
          addErrorStyles(input, 'Please enter a valid zip code');
        }
      }
    }
  });

  return isValid;
}

const form = document.querySelector('.checkout-form');
const containerDiv = document.querySelector('.container');
const formContainer = document.querySelector('.form-container');
const paymentForm = document.querySelector('.payment-form');

function handleFormSubmission(event) {
  event.preventDefault();

  // Check if this is a payment form
  const isPaymentForm = event.target.classList.contains('payment-form');
  
  if (isPaymentForm) {
    handlePaymentSubmission(event);
    return;
  }

  const isValid = validateForm();
  if (isValid) {
    console.log('Form is valid. Proceeding to the next step...');

    const formData = {
      fullName: document.getElementById('name')?.value,
      email: document.getElementById('Email')?.value,
      address: document.getElementById('Address')?.value,
      city: document.getElementById('City')?.value,
      state: document.getElementById('State')?.value,
      zipCode: document.getElementById('Zipcode')?.value,
      orderId: document.querySelector('input[name="orderId"]')?.value
    };

    // Validate that all required fields are present
    if (!formData.fullName || !formData.email || !formData.address || 
        !formData.city || !formData.state || !formData.zipCode || !formData.orderId) {
      showErrorPopup('Please fill in all required fields');
      return;
    }

    fetch('/api/shipping/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Shipping information saved successfully');
        showPopup('Shipping information saved successfully!');
        // Redirect to review page after 2 seconds
        setTimeout(() => {
          window.location.href = '/review';
        }, 2000);
      } else {
        console.error('Failed to save shipping information:', data.message);
        showErrorPopup(data.message || 'Failed to save shipping information');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showErrorPopup('An error occurred. Please try again.');
    });
  } else {
    console.log('Form is invalid');
    showErrorPopup('Please fill in all required fields correctly');
  }
}

// Form validation
function validatePaymentForm() {
  const nameInput = document.getElementById('name');
  const cardNumberInput = document.getElementById('card-number');
  const bankNameInput = document.getElementById('bank-name');
  const cvvInput = document.getElementById('cvv');
  const expiryInput = document.getElementById('expiry');

  if(isAuthenticated) return true;


  if (!nameInput || !cardNumberInput || !bankNameInput || !cvvInput || !expiryInput) {
    console.error('Required form elements not found');
    return false;
  }

  const name = nameInput.value.trim();
  const cardNumber = cardNumberInput.value.replace(/\s/g, '');
  const bankName = bankNameInput.value.trim();
  const cvv = cvvInput.value.trim();
  const expiry = expiryInput.value.trim();

  if (!name || !cardNumber || !bankName || !cvv || !expiry) {
    showErrorPopup('Please fill in all required fields');
    return false;
  }

  if (!/^\d{16}$/.test(cardNumber)) {
    showErrorPopup('Please enter a valid 16-digit card number');
    return false;
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    showErrorPopup('Please enter a valid CVV (3-4 digits)');
    return false;
  }

  if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) {
    showErrorPopup('Please enter a valid expiry date (MM/YY)');
    return false;
  }

  // Check if card is expired
  const [month, year] = expiry.split('/').map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    showErrorPopup('Card has expired');
    return false;
  }

  return true;
}

// Form submission handler
async function handlePaymentSubmission(e) {
  e.preventDefault();
  
  if (!validatePaymentForm()) {
    return;
  }

  const nameInput = document.getElementById('name');
  let cardNumber = '';
  // For authenticated users, get the hidden input by name
  if (isAuthenticated) {
    const hiddenCardInput = document.querySelector('input[name="card-number"]');
    cardNumber = hiddenCardInput ? hiddenCardInput.value : '';
  } else {
    const cardNumberInput = document.getElementById('card-number');
    cardNumber = cardNumberInput ? cardNumberInput.value.replace(/\s/g, '') : '';
  }
  const bankNameInput = document.getElementById('bank-name');
  const cvvInput = document.getElementById('cvv');
  const expiryInput = document.getElementById('expiry');
  const submitButton = document.querySelector('button[type="submit"]');

  try {
    // Show loading state
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';
    }

    const response = await fetch('/api/payment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        card_number: cardNumber,
        bank_name: bankNameInput.value.trim(),
        expiry: expiryInput.value.trim(),
        cvv: cvvInput.value.trim()
      })
    });

    const data = await response.json();

    if (data.success) {
      showPopup('Payment information saved successfully!');
      setTimeout(() => {
        window.location.href = data.redirect || '/user/shipping';
      }, 2000);
    } else {
      showErrorPopup(data.message || 'Payment failed. Please try again.');
    }
  } catch (error) {
    console.error('Payment error:', error);
    showErrorPopup('An error occurred. Please try again.');
  } finally {
    // Reset button state
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Complete Purchase';
    }
  }
}

function updateProgress(stepIndex) {
  const progress = document.querySelector('.progress');
  const steps = document.querySelectorAll('.step');

  // Update progress bar width
  progress.style.width = `${(stepIndex / (steps.length - 1)) * 100}%`;

  steps.forEach((step, index) => {
    if (index < stepIndex) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (index === stepIndex) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
}

// Initialize progress bar to show we're on the shipping step
document.addEventListener('DOMContentLoaded', () => {
  updateProgress(1); // Set to shipping step (index 1)
});

// Helper functions for popups
function showPopup(message) {
  const popup = document.createElement('div');
  popup.className = 'popup success';
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

function showErrorPopup(message) {
  const popup = document.createElement('div');
  popup.className = 'popup error';
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

// Function to add error styles
function addErrorStyles(input, message) {
  input.classList.add('invalid');
  const errorElement = input.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error')) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// Function to remove error styles
function removeErrorStyles(input) {
  input.classList.remove('invalid');
  const errorElement = input.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error')) {
    errorElement.style.display = 'none';
  }
}

// Helper function to check if card number is valid (16 digits)
function isValidCardNumber(cardNumber) {
  return /^\d{16}$/.test(cardNumber.replace(/\s+/g, ''));
}

// Helper function to check if CVV is valid (3 digits)
function isValidCVV(cvv) {
  return /^\d{3}$/.test(cvv);
}

// Helper function to check if card holder name is valid (only alphabets)
function isValidCardHolderName(name) {
  return /^[A-Za-z\s]+$/.test(name);
}

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', handlePaymentSubmission);
  }

  // Input formatting
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      value = value.replace(/(\d{4})/g, '$1 ').trim();
      this.value = value;
    });
  }

  const expiryInput = document.getElementById('expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      this.value = value;
    });
  }

  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').slice(0, 4);
    });
  }
});
