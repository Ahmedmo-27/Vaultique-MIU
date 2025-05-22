document.addEventListener("DOMContentLoaded", function () {
  // Existing variables
  const flipContainer = document.querySelector(".flip-container");
  const registerLink = document.getElementById("register-link");
  const loginLink = document.getElementById("login-link");
  const forgotPasswordLink = document.getElementById("forgot-password");
  const adminLoginLink = document.getElementById("admin-login-link");
  const forgotPasswordContainer = document.getElementById("forgot-password-container");
  const closeForgotPasswordButton = document.getElementById("close-forgot-password");
  const loginForm = document.getElementById("login-form-id");
  const signupForm = document.getElementById("signup-form-id");

  // New variables for multi-step form
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");
  const nextStep1 = document.getElementById("next-step1");
  const prevStep2 = document.getElementById("prev-step2");
  const nextStep2 = document.getElementById("next-step2");
  const skipStep2 = document.getElementById("skip-step2");
  const prevStep3 = document.getElementById("prev-step3");
  const passwordInput = document.getElementById("password-signup");
  const strengthMeter = document.querySelector(".strength-meter");
  const strengthText = document.querySelector(".strength-text");

  // Password toggle functionality
  document.querySelectorAll(".toggle-password").forEach(toggle => {
      toggle.addEventListener("click", function() {
          const passwordInput = this.parentElement.querySelector("input");
          const icon = this.querySelector("i");
          if (passwordInput.type === "password") {
              passwordInput.type = "text";
              icon.classList.replace("fa-eye", "fa-eye-slash");
          } else {
              passwordInput.type = "password";
              icon.classList.replace("fa-eye-slash", "fa-eye");
          }
      });
  });

  // Password strength checker
  passwordInput.addEventListener("input", function() {
      const password = this.value;
      let strength = 0;
      
      // Check length
      if (password.length >= 8) strength++;
      // Check for capital letters
      if (/[A-Z]/.test(password)) strength++;
      // Check for numbers
      if (/[0-9]/.test(password)) strength++;
      // Check for special characters
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      // Update meter
      const width = (strength / 4) * 100;
      strengthMeter.style.width = `${width}%`;
      
      // Update colors and text
      if (strength <= 1) {
          strengthMeter.style.background = "#ff0000";
          strengthText.textContent = "Weak";
      } else if (strength <= 3) {
          strengthMeter.style.background = "#ffcc00";
          strengthText.textContent = "Medium";
      } else {
          strengthMeter.style.background = "#00ff00";
          strengthText.textContent = "Strong";
      }
  });

  // Multi-step form navigation
  nextStep1.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Validate step 1 fields - only require essential fields
      const username = document.getElementById("username").value;
      const email = document.getElementById("email-signup").value;
      const password = document.getElementById("password-signup").value;
      
      if (!username || !email || !password) {
          showNotification('error', 'Username, email and password are required');
          return;
      }
      
      // Validate password strength
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
          showNotification('error', 'Password must be at least 8 characters with 1 capital letter and 1 number');
          return;
      }
      
      step1.style.display = "none";
      step2.style.display = "flex";
  });

  prevStep2.addEventListener("click", function(e) {
      e.preventDefault();
      step2.style.display = "none";
      step1.style.display = "flex";
  });

  nextStep2.addEventListener("click", function(e) {
      e.preventDefault();
      step2.style.display = "none";
      step3.style.display = "flex";
  });

  skipStep2.addEventListener("click", function(e) {
      e.preventDefault();
      step2.style.display = "none";
      step3.style.display = "flex";
  });

  prevStep3.addEventListener("click", function(e) {
      e.preventDefault();
      step3.style.display = "none";
      step2.style.display = "flex";
  });

  // Complete signup button - directly submit the form
  document.getElementById("complete-signup").addEventListener("click", function(e) {
      e.preventDefault();
      console.log('Complete signup button clicked');
      document.getElementById("signup-form-id").dispatchEvent(new Event('submit'));
  });

  // Form submission validation
  signupForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    // Get essential form data
    const username = document.getElementById("username").value;
    const email = document.getElementById("email-signup").value;
    const password = document.getElementById("password-signup").value;
    
    // Validate essential fields
    if (!username || !email || !password) {
        showNotification('error', 'Username, email and password are required');
        return;
    }
    
    // Prepare form data with essential fields
    const formData = {
        Name: username,
        username: username,
        email: email,
        password: password
    };
    
    // Add optional fields only if they have values
    const phone = document.getElementById("phone").value;
    if (phone) formData.phone_number = phone;
    
    const dob = document.getElementById("dob").value;
    if (dob) formData.DOB = dob;
    
    const language = document.getElementById("language").value;
    if (language) formData.language = language;

    console.log('Submitting signup form with data:', { 
        username, email, 
        hasPhone: !!phone, 
        hasDOB: !!dob, 
        hasLanguage: !!language 
    });

    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    console.log('CSRF token:', csrfToken ? 'present' : 'missing');
    
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken,
                'X-CSRF-Token': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        console.log('Signup response status:', response.status);
        
        // Handle different status codes
        if (response.status === 429) {
            showNotification('error', 'Too many signup attempts. Please try again later.');
            return;
        }
        
        // Try to parse the response as JSON
        let data;
        try {
            data = await response.json();
            console.log('Signup response data:', data);
        } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            // If we can't parse JSON, use the status text
            showNotification('error', `Error: ${response.statusText || 'Unknown error'}`);
            return;
        }
        
        if (response.ok) {
            showNotification('success', 'Account created successfully! Redirecting to login...');
            setTimeout(() => {
                flipContainer.classList.remove("flipped"); // Switch to login form after successful signup
            }, 1500);
        } else {
            // Handle error responses with proper JSON
            const errorMsg = data.message || "Error creating account";
            console.error('Server error:', errorMsg);
            
            // Show detailed error from server if available
            if (data.error) {
                console.error('Detailed error:', data.error);
                
                // Parse the validation error for specific field issues
                if (data.error.includes('validation failed')) {
                    // Extract the specific field that failed validation
                    const fieldMatch = data.error.match(/path `([^`]+)`/);
                    if (fieldMatch && fieldMatch[1]) {
                        const field = fieldMatch[1];
                        showNotification('error', `Invalid ${field} value. Please check your input.`);
                    } else {
                        showNotification('error', 'Form validation failed. Please check your inputs.');
                    }
                } else {
                    showNotification('error', errorMsg);
                }
            } else {
                showNotification('error', errorMsg);
            }
            
            // Show validation errors if available
            if (data.errors && Array.isArray(data.errors)) {
                const errorMessage = data.errors.map(err => err.msg).join('. ');
                showNotification('error', errorMessage);
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('error', 'Network error. Please check your connection and try again.');
    }
  });

  // Handle login form submission
  document.getElementById('login-form-id').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Login successful!');
        
        // Redirect based on user role
        if (data.data.isAdmin) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/user/home';
        }
      } else {
        showNotification('error', data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('error', 'An error occurred during login. Please try again.');
    }
  });

  // Social login buttons (placeholder functionality)
  document.querySelectorAll(".google-login, .facebook-login").forEach(btn => {
      btn.addEventListener("click", function() {
          alert(`${this.textContent.trim()} login would be implemented here`);
      });
  });

  // Keep all your existing event listeners
  registerLink.addEventListener("click", function (event) {
      event.preventDefault();
      flipContainer.classList.add("flipped");
      // Reset multi-step form to step 1
      step1.style.display = "flex";
      step2.style.display = "none";
      step3.style.display = "none";
  });

  loginLink.addEventListener("click", function (event) {
      event.preventDefault();
      flipContainer.classList.remove("flipped");
  });

  adminLoginLink.addEventListener("click", function (event) {
    event.preventDefault();
    // This is now handled by the main login form
  });

  forgotPasswordLink.addEventListener("click", function (event) {
      event.preventDefault();
      forgotPasswordContainer.style.display = "flex";
  });

  closeForgotPasswordButton.addEventListener("click", function () {
      forgotPasswordContainer.style.display = "none";
  });

  document.getElementById("send-reset-link").addEventListener("click", function () {
      let email = document.getElementById("forgot-email").value;
      if (email) {
          alert(`A reset link has been sent to ${email}`);
          forgotPasswordContainer.style.display = "none";
      } else {
          alert("Please enter your email address.");
      }
  });
});
