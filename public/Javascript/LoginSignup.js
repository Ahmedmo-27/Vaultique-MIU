document.addEventListener("DOMContentLoaded", function () {
  // Existing variables
  const flipContainer = document.querySelector(".flip-container");
  const registerLink = document.getElementById("register-link");
  const loginLink = document.getElementById("login-link");
  const forgotPasswordLink = document.getElementById("forgot-password");
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
      
      // Validate step 1 fields
      const username = document.getElementById("username").value;
      const Name = document.getElementById("Name").value;
      const email = document.getElementById("email-signup").value;
      const password = document.getElementById("password-signup").value;
      const language = document.getElementById("language-signup").value;
      
      if (!username || !Name || !email || !password || !language) {
          alert("Please fill all required fields");
          return;
      }
      
      // Validate password strength
      const passwordErrors = [];
      if (password.length < 8) passwordErrors.push("Password must be at least 8 characters long");
      if (!/[A-Z]/.test(password)) passwordErrors.push("Password must contain at least one uppercase letter");
      if (!/[a-z]/.test(password)) passwordErrors.push("Password must contain at least one lowercase letter");
      if (!/[0-9]/.test(password)) passwordErrors.push("Password must contain at least one number");
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) passwordErrors.push("Password must contain at least one special character");
      
      if (passwordErrors.length > 0) {
          alert("Password requirements:\n" + passwordErrors.join("\n"));
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

  // Form submission validation
  const completeSignupBtn = document.getElementById("complete-signup");
  if (completeSignupBtn) {
    completeSignupBtn.addEventListener("click", async function(e) {
      e.preventDefault();
      console.log("Complete signup button clicked");
      
      // Get form data
      const username = document.getElementById("username").value;
      const Name = document.getElementById("Name").value;
      const email = document.getElementById("email-signup").value;
      const password = document.getElementById("password-signup").value;
      const phone = document.getElementById("phone").value;
      const dob = document.getElementById("dob").value;
      const language = document.getElementById("language-signup").value;
      
      // Get optional address information
      const street = document.getElementById("street")?.value || '';
      const city = document.getElementById("city")?.value || '';
      const state = document.getElementById("state")?.value || '';
      const zip = document.getElementById("zip")?.value || '';
      const country = document.getElementById("country")?.value || '';
      
      // Validate required fields
      if (!username || !Name || !email || !password || !language) {
        window.showNotification('error', 'Please fill all required fields');
        return;
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        window.showNotification('error', 'Username can only contain letters, numbers and underscores');
        return;
      }

      // Validate name length
      if (Name.length < 2) {
        window.showNotification('error', 'Name must be at least 2 characters long');
        return;
      }

      // Validate username length
      if (username.length < 3) {
        window.showNotification('error', 'Username must be at least 3 characters long');
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        window.showNotification('error', 'Please enter a valid email address');
        return;
      }

      // Validate password strength
      const passwordErrors = [];
      if (password.length < 8) passwordErrors.push("Password must be at least 8 characters long");
      if (!/[A-Z]/.test(password)) passwordErrors.push("Password must contain at least one uppercase letter");
      if (!/[a-z]/.test(password)) passwordErrors.push("Password must contain at least one lowercase letter");
      if (!/[0-9]/.test(password)) passwordErrors.push("Password must contain at least one number");
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) passwordErrors.push("Password must contain at least one special character");
      
      if (passwordErrors.length > 0) {
        window.showNotification('error', "Password requirements:\n" + passwordErrors.join("\n"));
        return;
      }
      
      // Validate phone number format if provided
      if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        window.showNotification('error', 'Please enter a valid phone number (e.g., +1234567890)');
        return;
      }

      // Validate DOB format if provided
      if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        window.showNotification('error', 'Please enter a valid date of birth (YYYY-MM-DD)');
        return;
      }
      
      // Create form data object
      const formData = {
        Name: Name,
        username: username,
        email: email.toLowerCase(),
        password: password,
        phone_number: phone || null,
        DOB: dob || null,
        language: language,
        Address: street || city || state || zip || country ? {
          city: city,
          street: street,
          addressType: 'Home',
          state: state,
          country: country,
          postalCode: zip
        } : undefined,
        Payment: undefined,
        cart: localStorage.getItem('guestCart') ? JSON.parse(localStorage.getItem('guestCart')) : undefined
      };
      
      console.log('Form data:', formData);
      
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
          // Clear guest cart after successful signup
          localStorage.removeItem('guestCart');
          
          // Show success message
          showNotification('Signup successful! Please check your email to verify your account.', 'success');
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/user/LoginSignup';
          }, 2000);
        } else {
          showNotification(data.message || 'Signup failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error during signup:', error);
        showNotification('An error occurred during signup. Please try again.', 'error');
      }
    });
  } else {
    console.error("Complete signup button not found");
  }

  // Login form submission
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      console.log('Login attempt details:', { email, hasPassword: !!password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (like rate limit messages)
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = {
            success: false,
            message: text
          };
        }
      }

      if (response.ok) {
        if (data.success) {
          // Show success message
          showNotification('success', 'Login successful!');
          
          // Redirect based on user role
          if (data.user.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/user/home';
          }
        } else {
          showNotification('error', data.message || 'Login failed');
        }
      } else {
        // Handle different error status codes
        switch (response.status) {
          case 429:
            showNotification('error', 'Too many login attempts. Please try again later.');
            break;
          case 423:
            showNotification('error', 'Account is temporarily locked. Please try again later.');
            break;
          default:
            showNotification('error', data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('error', 'An error occurred during login');
    }
  });

  // Social login buttons (placeholder functionality)
  document.querySelectorAll(".btn-google, .btn-facebook").forEach(btn => {
      btn.addEventListener("click", function() {
          window.showNotification('info', `${this.textContent.trim()} login would be implemented here`);
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