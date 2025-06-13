// Authentication handler functions with timeout and retry logic
const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const validateLoginData = (email, password) => {
  const errors = [];
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (email && !email.includes('@')) errors.push('Invalid email format');
  if (password && password.length < 8) errors.push('Password must be at least 8 characters');
  return errors;
};

// Make handlers available globally
window.handleLogin = async (event) => {
  event.preventDefault();

  const email = document.getElementById('email')?.value?.trim();
  let password = document.getElementById('password')?.value;

  // Debug password to check if it's already a hash
  console.log('Login attempt details:', {
    email: email,
    passwordLength: password?.length
  });

  // Handle edge case: if the password is already a bcrypt hash, this indicates a bug
  // Users should never be entering hashed passwords directly
  if (password?.startsWith('$2a$') || password?.startsWith('$2b$')) {
    console.error('Invalid password format detected - clearing password field');
    document.getElementById('password').value = '';
    window.showNotification('error', 'Please enter your actual password, not a hash');
    return;
  }

  // Client-side validation
  const validationErrors = validateLoginData(email, password);
  if (validationErrors.length > 0) {
    window.showNotification('error', validationErrors.join('. '));
    return;
  }

  try {
    // Use JWT authentication for login
    console.log('Sending login request...');

    const response = await fetchWithTimeout('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Still needed to send/receive cookies
    });

    const data = await response.json();
    console.log('Login response:', {
      status: response.status,
      success: data.success,
      message: data.message,
    });

    // Store JWT token in localStorage for client-side access if needed
    if (data.success && data.data?.token) {
      localStorage.setItem('authToken', data.data.token);
    }

    // Handle successful login
    if (data.success) {
      window.showNotification('success', 'Login successful!');

      // Store the token in localStorage if needed
      if (data.data?.user) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.data.user._id,
            name: data.data.user.Name,
            role: data.data.user.role,
            email: data.data.user.email,
          })
        );
      }

      // Ensure we have the necessary data before redirecting
      if (data.data?.redirectUrl) {
        setTimeout(() => {
          window.location.href = data.data.redirectUrl;
        }, 1000);
      } else {
        // Default redirect if the URL is missing
        setTimeout(() => {
          window.location.href =
            data.data?.user?.role === 'admin' ? '/admin/dashboard' : '/user/home';
        }, 1000);
      }
    } else {
      window.showNotification('error', data.message || 'Login failed. Please try again.');

      // Clear password field for security
      const passwordField = document.getElementById('password');
      if (passwordField) passwordField.value = '';
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.name === 'AbortError') {
      window.showNotification('error', 'Request timed out. Please try again.');
    } else {
      window.showNotification('error', 'An error occurred during login. Please try again.');
    }

    // Clear password field for security
    const passwordField = document.getElementById('password');
    if (passwordField) passwordField.value = '';
  }
};

window.handleSignup = async (event) => {
  event.preventDefault();

  // Get all form data
  const formData = {
    Name: document.getElementById('username').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email-signup').value,
    password: document.getElementById('password-signup').value,
    DOB: document.getElementById('dob').value,
    phone_number: document.getElementById('phone').value,
    language: document.getElementById('language').value,
    Address: {
      city: document.getElementById('city')?.value || '',
      street: document.getElementById('street')?.value || '',
      addressType: 'Home',
      state: document.getElementById('state')?.value || '',
      country: document.getElementById('country')?.value || '',
      postalCode: document.getElementById('zip')?.value || '',
    },
    Payment: {
      cardNumber: document.getElementById('card-number')?.value || '',
      cardHolder: document.getElementById('card-name')?.value || '',
      expiryDate: document.getElementById('expiry')?.value || '',
      cvv: document.getElementById('cvv')?.value || '',
      paymentType: document.getElementById('card-type')?.value || 'Credit Card',
    },
  };

  try {
    const response = await fetchWithTimeout('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      window.showNotification('success', 'Signup successful! Redirecting to home page...');
      // Redirect to home page after successful signup
      setTimeout(() => {
        window.location.href = '/user/home';
      }, 1500);
    } else {
      window.showNotification('error', data.message || 'Signup failed. Please try again.');
    }
  } catch (error) {
    console.error('Signup error:', error);
    if (error.name === 'AbortError') {
      window.showNotification('error', 'Request timed out. Please try again.');
    } else {
      window.showNotification('error', 'An error occurred during signup. Please try again.');
    }
  }
};

// Check authentication state
const checkAuthState = () => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (token && user) {
    // Verify token is still valid
    fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      if (!data.valid) {
        // Token is invalid, try to refresh
        refreshToken();
      }
    })
    .catch(() => {
      // If verification fails, try to refresh token
      refreshToken();
    });
  }
};

// Refresh token function
const refreshToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    // No refresh token, redirect to login
    window.location.href = '/user/LoginSignup';
    return;
  }

  fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update tokens
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/user/LoginSignup';
    }
  })
  .catch(() => {
    // Refresh failed, redirect to login
    window.location.href = '/user/LoginSignup';
  });
};

// Check auth state periodically
setInterval(checkAuthState, 5 * 60 * 1000); // Check every 5 minutes

// Initial check
checkAuthState();

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form-id');
  const signupForm = document.getElementById('signup-form-id');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});
