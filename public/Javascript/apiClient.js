/**
 * API client utility for making authenticated requests
 */

// Helper function to get the auth token from storage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Function to add authorization header to requests
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API request function with authentication
const apiRequest = async (url, options = {}) => {
  // Merge provided headers with auth headers
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const requestOptions = {
    ...options,
    headers,
    credentials: 'include', // Always include credentials for cookies
  };

  try {
    const response = await fetch(url, requestOptions);

    // Handle 401 Unauthorized - could mean token expired
    if (response.status === 401) {
      // Clear the invalid token
      localStorage.removeItem('authToken');
      
      // Get current path
      const currentPath = window.location.pathname;
      
      // Only redirect if we're not already on auth-related pages and we're not on a public page
      if (!currentPath.includes('/LoginSignup') && 
          !currentPath.includes('/api/auth/login') && 
          !currentPath.includes('/api/auth/signup') &&
          !currentPath.includes('/user/home') &&
          !currentPath.includes('/user/products') &&
          !currentPath.includes('/user/Collections') &&
          !currentPath.includes('/user/Brands') &&
          !currentPath.includes('/user/for-her') &&
          !currentPath.includes('/user/for-him')) {
        window.location.href = '/user/LoginSignup';
        return null;
      }
    }

    // Try to parse as JSON and return
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Expose methods globally
window.apiClient = {
  getAuthToken,
  getAuthHeaders,
  apiRequest,
};
