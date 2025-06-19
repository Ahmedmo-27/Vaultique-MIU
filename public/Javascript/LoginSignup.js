document.addEventListener("DOMContentLoaded", function () {
  console.log('DOM Content Loaded - LoginSignup.js');
  
  // Existing variables
  const flipContainer = document.querySelector(".flip-container");
  const registerLink = document.getElementById("register-link");
  const loginLink = document.getElementById("login-link");
  const forgotPasswordLink = document.getElementById("forgot-password");
  const forgotPasswordContainer = document.getElementById("forgot-password-container");
  const closeForgotPasswordButton = document.getElementById("close-forgot-password");
  const loginForm = document.getElementById("login-form-id");
  const signupForm = document.getElementById("signup-form-id");

  // Debug element finding
  console.log('Elements found:');
  console.log('- flipContainer:', flipContainer);
  console.log('- registerLink:', registerLink);
  console.log('- loginLink:', loginLink);
  console.log('- forgotPasswordLink:', forgotPasswordLink);
  console.log('- forgotPasswordContainer:', forgotPasswordContainer);
  console.log('- closeForgotPasswordButton:', closeForgotPasswordButton);
  console.log('- loginForm:', loginForm);
  console.log('- signupForm:', signupForm);

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
      
      // Add loading state to button
      completeSignupBtn.classList.add('loading');
      completeSignupBtn.disabled = true;
      
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
        window.showNotification('error', 'Please fill in all required fields to create your account.');
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
        return;
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        window.showNotification('error', 'Username can only contain letters, numbers, and underscores. Please choose a different username.');
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
        return;
      }

      // Validate name length
      if (Name.length < 2) {
        window.showNotification('error', 'Your name must be at least 2 characters long. Please enter your full name.');
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
        return;
      }

      // Validate username length
      if (username.length < 3) {
        window.showNotification('error', 'Username must be at least 3 characters long. Please choose a longer username.');
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        window.showNotification('error', 'Please enter a valid email address. This will be used for account verification and important updates.');
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
        return;
      }

      // Validate password strength
      const passwordErrors = [];
      if (password.length < 8) passwordErrors.push("• Password must be at least 8 characters long");
      if (!/[A-Z]/.test(password)) passwordErrors.push("• Password must contain at least one uppercase letter");
      if (!/[a-z]/.test(password)) passwordErrors.push("• Password must contain at least one lowercase letter");
      if (!/[0-9]/.test(password)) passwordErrors.push("• Password must contain at least one number");
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) passwordErrors.push("• Password must contain at least one special character");
      
      if (passwordErrors.length > 0) {
        window.showNotification('warning', "Please strengthen your password:\n" + passwordErrors.join("\n"));
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
        return;
      }
      
      // Validate phone number format if provided
      if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        window.showNotification('warning', 'Please enter a valid phone number (e.g., +1234567890). This will help us contact you if needed.');
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
        return;
      }

      // Validate DOB format if provided
      if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        window.showNotification('warning', 'Please enter a valid date of birth in the format YYYY-MM-DD.');
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
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
          
          // Show personalized success message
          window.showNotification('success', 
            `Welcome to our community, ${Name}! 🎉\n\n` +
            'Your account has been created successfully. To get started:\n' +
            '1. Please check your email for a verification link\n' +
            '2. Click the link to verify your account\n' +
            '3. Once verified, you can log in and start exploring\n\n' +
            'We\'re excited to have you on board!'
          );
          
          // Redirect to login page after a longer delay to ensure user reads the message
          setTimeout(() => {
            window.location.href = '/user/LoginSignup';
          }, 7000);
        } else {
          // Handle specific error cases
          let errorMessage = data.message || 'Signup failed. Please try again.';
          if (data.message.includes('email')) {
            errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
          } else if (data.message.includes('username')) {
            errorMessage = 'This username is already taken. Please choose a different username.';
          }
          window.showNotification('error', errorMessage);
          // Remove loading state
          completeSignupBtn.classList.remove('loading');
          completeSignupBtn.disabled = false;
        }
      } catch (error) {
        console.error('Error during signup:', error);
        window.showNotification('error', 
          'We encountered an issue while creating your account.\n\n' +
          'Please try again in a few moments. If the problem persists, contact our support team.'
        );
        // Remove loading state
        completeSignupBtn.classList.remove('loading');
        completeSignupBtn.disabled = false;
      }
    });
  } else {
    console.error("Complete signup button not found");
  }

  // Prevent default form submissions and handle them properly
  if (loginForm) {
    // Remove any existing listeners
    loginForm.removeEventListener('submit', handleLogin);
    const oldSubmitHandler = loginForm.onsubmit;
    if (oldSubmitHandler) {
      loginForm.removeEventListener('submit', oldSubmitHandler);
    }
    
    // Add single submit handler
    loginForm.addEventListener('submit', async function(e) {
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
          credentials: 'include'
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = { success: false, message: text };
          }
        }

        if (response.ok && data.success) {
          window.showNotification('success', 'Login successful!');
          
          // Store user data
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          
          // Redirect based on user role
          setTimeout(() => {
            window.location.href = data.user?.role === 'admin' ? '/admin/dashboard' : '/user/home';
          }, 1000);
        } else {
          // Enhanced error message handling
          if (data.message === 'Please verify your email before logging in.') {
            window.showNotification('error', 'Please verify your email before logging in. Check your inbox for the verification link.');
            // Optionally, add a resend verification email button
            const resendButton = document.createElement('button');
            resendButton.textContent = 'Resend Verification Email';
            resendButton.className = 'resend-verification-btn';
            resendButton.onclick = async () => {
              try {
                const resendResponse = await fetch('/api/auth/resend-verification', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email: document.getElementById("email").value }),
                  credentials: 'include'
                });
                const resendData = await resendResponse.json();
                if (resendResponse.ok) {
                  window.showNotification('success', 'Verification email resent! Please check your inbox.');
                } else {
                  window.showNotification('error', resendData.message || 'Failed to resend verification email.');
                }
              } catch (error) {
                window.showNotification('error', 'Failed to resend verification email. Please try again later.');
              }
            };
            // Add the button to the login form
            const loginForm = document.getElementById("login-form-id");
            if (loginForm && !document.querySelector('.resend-verification-btn')) {
              loginForm.appendChild(resendButton);
            }
          } else {
            window.showNotification('error', data.message || 'Login failed');
          }
          // Clear password field for security
          document.getElementById('password').value = '';
        }
      } catch (error) {
        console.error('Login error:', error);
        window.showNotification('error', 'An error occurred during login');
        // Clear password field for security
        document.getElementById('password').value = '';
      }
    });
  }

  if (signupForm) {
    // Remove any existing listeners
    signupForm.removeEventListener('submit', handleSignup);
    
    // Add single submit handler
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      // Your existing signup logic here
    });
  }

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

  // Add multiple event listener approaches for forgot password
  if (forgotPasswordLink) {
    console.log('Adding event listener to forgot password link');
    
    // Method 1: Direct addEventListener
    forgotPasswordLink.addEventListener("click", function (e) {
      console.log('Forgot password link clicked! (Method 1)');
      e.preventDefault();
      console.log('Forgot password container:', forgotPasswordContainer);
      if (forgotPasswordContainer) {
        forgotPasswordContainer.style.display = "flex";
        console.log('Container display set to flex');
      } else {
        console.error('Forgot password container not found!');
      }
    });

    // Method 2: onclick attribute (fallback)
    forgotPasswordLink.onclick = function(e) {
      console.log('Forgot password link clicked! (Method 2)');
      e.preventDefault();
      if (forgotPasswordContainer) {
        forgotPasswordContainer.style.display = "flex";
        console.log('Container display set to flex (Method 2)');
      }
    };

    // Method 3: Event delegation
    document.addEventListener('click', function(e) {
      if (e.target && e.target.id === 'forgot-password') {
        console.log('Forgot password link clicked! (Method 3 - Event delegation)');
        e.preventDefault();
        if (forgotPasswordContainer) {
          forgotPasswordContainer.style.display = "flex";
          console.log('Container display set to flex (Method 3)');
        }
      }
    });

  } else {
    console.error('Forgot password link not found!');
  }

  closeForgotPasswordButton.addEventListener("click", function () {
    forgotPasswordContainer.style.display = "none";
  });

  document.getElementById("send-reset-link").addEventListener("click", async function () {
    const email = document.getElementById("forgot-email").value;
    
    if (!email) {
      window.showNotification('error', 'Please enter your email address.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      window.showNotification('error', 'Please enter a valid email address.');
      return;
    }

    // Add loading state
    const button = this;
    const originalText = button.textContent;
    button.textContent = 'Sending...';
    button.disabled = true;

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.showNotification('success', 'If an account exists with this email, you will receive a password reset link shortly.');
        forgotPasswordContainer.style.display = "none";
        document.getElementById("forgot-email").value = '';
      } else {
        window.showNotification('error', data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      window.showNotification('error', 'An error occurred while sending the reset email. Please try again later.');
    } finally {
      // Restore button state
      button.textContent = originalText;
      button.disabled = false;
    }
  });

  // Add email verification handler
  const handleEmailVerification = async (token) => {
    try {
      console.log('Attempting to verify email with token:', token);
      
      const response = await fetch(`/api/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (response.ok && data.success) {
        window.showNotification('success', 'Email verified successfully! You can now log in.');
        // Store verification status
        localStorage.setItem('emailVerified', 'true');
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/user/LoginSignup';
        }, 2000);
      } else {
        let errorMessage = data.message || 'Email verification failed';
        
        // Handle specific error cases
        if (data.message.includes('expired')) {
          errorMessage = 'Your verification link has expired. Please request a new verification email.';
          // Add resend button
          const resendButton = document.createElement('button');
          resendButton.textContent = 'Resend Verification Email';
          resendButton.className = 'resend-verification-btn';
          resendButton.onclick = () => handleResendVerification();
          document.body.appendChild(resendButton);
        }
        
        window.showNotification('error', errorMessage);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      window.showNotification('error', 'An error occurred during email verification. Please try again later.');
    }
  };

  // Add resend verification handler
  const handleResendVerification = async () => {
    try {
      const email = document.getElementById('email')?.value;
      if (!email) {
        window.showNotification('error', 'Please enter your email address');
        return;
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        window.showNotification('success', 'Verification email sent! Please check your inbox.');
      } else {
        window.showNotification('error', data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      window.showNotification('error', 'Failed to resend verification email. Please try again later.');
    }
  };

  // Check for verification token in URL when page loads
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get('token');
    
    if (verificationToken) {
      handleEmailVerification(verificationToken);
    }
  });

  // Global function for inline onclick handler
  window.showForgotPassword = function() {
    console.log('showForgotPassword function called!');
    const container = document.getElementById("forgot-password-container");
    if (container) {
      container.style.display = "flex";
      console.log('Forgot password container shown via global function');
    } else {
      console.error('Forgot password container not found in global function!');
    }
    return false; // Prevent default link behavior
  };

  // Global function for closing forgot password modal
  window.closeForgotPassword = function() {
    const container = document.getElementById("forgot-password-container");
    if (container) {
      container.style.display = "none";
      // Clear the email input
      const emailInput = document.getElementById("forgot-email");
      if (emailInput) {
        emailInput.value = '';
      }
    }
  };
});