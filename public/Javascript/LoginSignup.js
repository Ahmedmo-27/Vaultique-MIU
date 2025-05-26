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
      
      // Validate step 1 fields
      const username = document.getElementById("username").value;
      const email = document.getElementById("email-signup").value;
      const password = document.getElementById("password-signup").value;
      const phone = document.getElementById("phone").value;
      const dob = document.getElementById("dob").value;
      const language = document.getElementById("language").value;
      
      if (!username || !email || !password || !phone || !dob || !language) {
          alert("Please fill all required fields");
          return;
      }
      
      // Validate password strength
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
          alert("Password must be at least 8 characters with 1 capital letter and 1 number");
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
  signupForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Get form data
    const username = document.getElementById("username").value;
    const email = document.getElementById("email-signup").value;
    const password = document.getElementById("password-signup").value;
    const phone = document.getElementById("phone").value;
    const dob = document.getElementById("dob").value;
    const language = document.getElementById("language").value;
    const creditCard = document.getElementById("credit-card").value;
    
    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          phone,
          dob,
          language,
          creditCard,
          role: 'User',
          access: 'Standard',
          dateAdded: new Date().toLocaleDateString(),
          lastLogin: 'Never'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        flipContainer.classList.remove("flipped"); // Switch to login form after successful signup
      } else {
        alert(data.message || "Error creating account");
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert("Error creating account. Please make sure the server is running at http://localhost:3000");
    }
  });

  // Login form submission
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Login successful!");
        // Redirect based on whether it's an admin login
        if (data.isAdmin) {
          window.location.href = "Admin Dashboard/AdminHubHomePage.html";
        } else {
          // Redirect regular users to their dashboard
          window.location.href = "User/dashboard.html";
        }
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error('Login error:', error);
      alert("Error logging in. Please try again.");
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