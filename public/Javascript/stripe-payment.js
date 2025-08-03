// Stripe Payment Integration
let stripe;
let elements;
let paymentElement;
let paymentIntent;

// Initialize Stripe
async function initializeStripe() {
  try {
    // Load Stripe.js
    if (typeof Stripe === 'undefined') {
      await loadScript('https://js.stripe.com/v3/');
    }
    
    // Initialize Stripe with your publishable key
    stripe = Stripe(stripePublishableKey);
    
    console.log('Stripe initialized successfully');
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    showError('Failed to initialize payment system');
  }
}

// Load external script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Create payment intent
async function createPaymentIntent() {
  try {
    showLoading('Creating payment...');
    
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create payment intent');
    }
    
    paymentIntent = result.paymentIntentId;
    
    // Create payment element
    await createPaymentElement(result.clientSecret);
    
    hideLoading();
    return result;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    hideLoading();
    showError('Failed to create payment. Please try again.');
    throw error;
  }
}

// Create payment element
async function createPaymentElement(clientSecret) {
  try {
    const { elements } = await stripe.elements({
      clientSecret: clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#1a1a1a',
          colorBackground: '#ffffff',
          colorText: '#1a1a1a',
          colorDanger: '#df1b41',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px'
        }
      }
    });

    paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
    
    console.log('Payment element mounted');
  } catch (error) {
    console.error('Error creating payment element:', error);
    throw error;
  }
}

// Handle payment submission
async function handlePaymentSubmission() {
  try {
    setLoading(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        showError(error.message);
      } else {
        showError('An unexpected error occurred.');
      }
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    showError('Payment failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

// Save payment method for future use
async function savePaymentMethod(paymentMethodId) {
  try {
    const response = await fetch('/api/stripe/save-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentMethodId }),
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to save payment method');
    }
    
    showSuccess('Payment method saved successfully');
    return result;
  } catch (error) {
    console.error('Error saving payment method:', error);
    showError('Failed to save payment method');
    throw error;
  }
}

// Get saved payment methods
async function getSavedPaymentMethods() {
  try {
    const response = await fetch('/api/stripe/payment-methods', {
      method: 'GET',
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to get payment methods');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
}

// Display saved payment methods
function displaySavedPaymentMethods(paymentMethods) {
  const container = document.getElementById('saved-payment-methods');
  if (!container) return;
  
  if (paymentMethods.length === 0) {
    container.innerHTML = '<p>No saved payment methods</p>';
    return;
  }
  
  const html = paymentMethods.map(method => `
    <div class="saved-payment-method" data-payment-method-id="${method.id}">
      <div class="payment-method-info">
        <div class="card-brand">${method.card.brand}</div>
        <div class="card-last4">•••• ${method.card.last4}</div>
        <div class="card-expiry">${method.card.exp_month}/${method.card.exp_year}</div>
      </div>
      <button class="use-payment-method-btn" onclick="useSavedPaymentMethod('${method.id}')">
        Use This Card
      </button>
    </div>
  `).join('');
  
  container.innerHTML = html;
}

// Use saved payment method
async function useSavedPaymentMethod(paymentMethodId) {
  try {
    showLoading('Processing payment...');
    
    const response = await fetch('/api/stripe/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        paymentIntentId: paymentIntent,
        paymentMethodId: paymentMethodId 
      }),
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Payment failed');
    }
    
    if (result.requiresAction) {
      // Handle 3D Secure authentication
      const { error } = await stripe.confirmCardPayment(result.clientSecret);
      if (error) {
        throw new Error(error.message);
      }
    }
    
    // Payment successful
    window.location.href = result.redirect || '/payment/success';
  } catch (error) {
    console.error('Error using saved payment method:', error);
    hideLoading();
    showError(error.message || 'Payment failed');
  }
}

// Utility functions
function setLoading(isLoading) {
  const submitButton = document.querySelector('#submit-payment');
  if (submitButton) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Processing...' : 'Pay Now';
  }
}

function showLoading(message) {
  const loadingEl = document.getElementById('loading-message');
  if (loadingEl) {
    loadingEl.textContent = message;
    loadingEl.style.display = 'block';
  }
}

function hideLoading() {
  const loadingEl = document.getElementById('loading-message');
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
}

function showError(message) {
  const errorEl = document.getElementById('payment-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function showSuccess(message) {
  const successEl = document.getElementById('payment-success');
  if (successEl) {
    successEl.textContent = message;
    successEl.style.display = 'block';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  try {
    await initializeStripe();
    
    // Load saved payment methods if user is logged in
    if (document.getElementById('isAuthenticated')?.value === 'true') {
      const savedMethods = await getSavedPaymentMethods();
      displaySavedPaymentMethods(savedMethods);
    }
    
    // Set up payment form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handlePaymentSubmission();
      });
    }
    
  } catch (error) {
    console.error('Error initializing payment system:', error);
    showError('Failed to initialize payment system');
  }
});

// Export functions for global access
window.stripePayment = {
  createPaymentIntent,
  handlePaymentSubmission,
  savePaymentMethod,
  getSavedPaymentMethods,
  useSavedPaymentMethod
}; 