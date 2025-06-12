// Input event listeners to update card display
document.getElementById('card-number').oninput = () => {
  let cardNumber = document.getElementById('card-number').value.replace(/\s+/g, ''); // Remove existing spaces
  if (cardNumber.length > 19) {
    cardNumber = cardNumber.slice(0, 19); // Truncate to 16 characters if longer
  }
  document.getElementById('card-number').value = formatCardNumber(cardNumber);
  document.getElementById('display-card-number').innerText = formatCardNumber(cardNumber);

  // Display length message
  const cardLengthMessage = document.querySelector('.card-length-message');
  if (cardNumber.length === 19) {
    cardLengthMessage.textContent = ''; // Clear message if 16 characters
  } else {
    cardLengthMessage.textContent = 'Must be 16 characters';
    cardLengthMessage.style.color = 'red';
  }
};

document.getElementById('name').oninput = () => {
  document.getElementById('display-card-holder').innerText = document.getElementById('name').value;
};

document.getElementById('expiry').oninput = () => {
  document.getElementById('display-expiry').innerText = document.getElementById('expiry').value;
};

document.getElementById('cvv').onmouseenter = () => {
  document.getElementById('flip-card').classList.add('flipped');
};

document.getElementById('cvv').onmouseleave = () => {
  document.getElementById('flip-card').classList.remove('flipped');
};

document.getElementById('cvv').oninput = () => {
  document.getElementById('display-cvv').innerText = document.getElementById('cvv').value;
};

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

  const isValid = validateForm();
  if (isValid) {
    console.log('Form is valid. Proceeding to the next step...');

    const formData = {
      fullName: document.getElementById('name').value,
      email: document.getElementById('Email').value,
      address: document.getElementById('Address').value,
      city: document.getElementById('City').value,
      state: document.getElementById('State').value,
      zipCode: document.getElementById('Zipcode').value,
      orderId: document.querySelector('input[name="orderId"]').value
    };

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

form.addEventListener('submit', handleFormSubmission);

// Payment form validation
function validatePaymentForm() {
  const nameInput = document.getElementById('name');
  const cardNumberInput = document.getElementById('card-number');
  const bankNameInput = document.getElementById('bank-name');
  const cvvInput = document.getElementById('cvv');
  const expiryInput = document.getElementById('expiry');

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

  return true;
}

async function handlePaymentSubmission(e) {
  e.preventDefault();
  
  if (!validatePaymentForm()) {
    return;
  }

  try {
    const formData = {
      name: document.getElementById('name')?.value || '',
      card_number: document.getElementById('card-number')?.value.replace(/\s/g, '') || '',
      bank_name: document.getElementById('bank-name')?.value || '',
      expiry: document.getElementById('expiry')?.value || '',
      cvv: document.getElementById('cvv')?.value || ''
    };

    const response = await fetch('/user/payment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
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

function showPopup(message) {
  const popup = document.createElement('div');
  popup.className = 'popup success';
  popup.innerHTML = `
    <div class="popup-content">
      <h2>${message}</h2>
    </div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

function showErrorPopup(message) {
  const popup = document.createElement('div');
  popup.className = 'popup error';
  popup.innerHTML = `
    <div class="popup-content">
      <h2>${message}</h2>
    </div>
  `;
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

document.addEventListener('DOMContentLoaded', () => {
  // Get the payment form
  const paymentForm = document.getElementById('payment-form');
  if (!paymentForm) {
    console.error('Payment form not found');
    return;
  }

  // Get all required elements
  const nameInput = document.getElementById('name');
  const bankNameInput = document.getElementById('bank-name');
  const cardNumberInput = document.getElementById('card-number');
  const cvvInput = document.getElementById('cvv');
  const expiryInput = document.getElementById('expiry');
  const completeBtn = document.getElementById('complete-purchase-btn');

  // Display elements
  const displayName = document.getElementById('display-card-holder');
  const displayBankName = document.getElementById('display-bank-name');
  const displayNumber = document.getElementById('display-card-number');
  const displayCvv = document.getElementById('display-cvv');
  const displayExpiry = document.getElementById('display-expiry');

  // Create popup container if it doesn't exist
  let popupContainer = document.getElementById('popup-container');
  if (!popupContainer) {
    popupContainer = document.createElement('div');
    popupContainer.id = 'popup-container';
    document.body.appendChild(popupContainer);
  }

  // Bind input events if elements exist
  if (nameInput && displayName) {
    nameInput.addEventListener('input', function() {
      displayName.textContent = this.value || 'FULL NAME';
    });
  }

  if (bankNameInput && displayBankName) {
    bankNameInput.addEventListener('input', function() {
      displayBankName.textContent = this.value || 'BANK NAME';
    });
  }

  if (cardNumberInput && displayNumber) {
    cardNumberInput.addEventListener('input', function() {
      const value = this.value.replace(/\s/g, '');
      let formatted = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
      }
      displayNumber.textContent = formatted || '################';
      this.value = formatted;
    });
  }

  if (cvvInput && displayCvv) {
    cvvInput.addEventListener('input', function() {
      const cvv = this.value;
      displayCvv.textContent = cvv ? `CVV: ${cvv.replace(/./g, '•')}` : 'CVV';

      // CVV validation
      const isValid = /^\d{3,4}$/.test(cvv);
      const cvvError = document.getElementById('cvvError');
      if (cvvError) {
        cvvError.style.display = cvv && !isValid ? 'block' : 'none';
      }
      this.classList.toggle('invalid', cvv && !isValid);
      this.classList.toggle('valid', cvv && isValid);
    });
  }

  if (expiryInput && displayExpiry) {
    expiryInput.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      displayExpiry.textContent = value ? `Expires: ${value}` : 'MM/YY';
      this.value = value;

      // Expiry validation
      const isValid = /^\d{2}\/\d{2}$/.test(value);
      const expiryError = document.getElementById('expiryError');
      if (expiryError) {
        expiryError.style.display = value && !isValid ? 'block' : 'none';
      }
      this.classList.toggle('invalid', value && !isValid);
      this.classList.toggle('valid', value && isValid);
    });
  }

  // Add event listener to the Complete Purchase button
  if (completeBtn) {
    completeBtn.addEventListener('click', handlePaymentSubmission);
  }

  // Add form submission handler
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      showErrorPopup('Please fill in all required fields correctly');
      return;
    }

    try {
      const formData = {
        name: nameInput?.value || '',
        card_number: cardNumberInput?.value.replace(/\s/g, '') || '',
        bank_name: bankNameInput?.value || '',
        expiry: expiryInput?.value || '',
        cvv: cvvInput?.value || ''
      };

      const response = await fetch('/user/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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
    }
  });
});
