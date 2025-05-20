document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('login-form-id');
    const signupForm = document.getElementById('signup-form-id');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const flipContainer = document.querySelector('.flip-container');
    const forgotPasswordLink = document.getElementById('forgot-password');
    const forgotPasswordContainer = document.getElementById('forgot-password-container');
    const closeForgotPassword = document.getElementById('close-forgot-password');
    const sendResetLink = document.getElementById('send-reset-link');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const passwordStrengthMeter = document.querySelector('.strength-meter');
    const passwordStrengthText = document.querySelector('.strength-text');
    const nextStep1Btn = document.getElementById('next-step1');
    const nextStep2Btn = document.getElementById('next-step2');
    const prevStep2Btn = document.getElementById('prev-step2');
    const prevStep3Btn = document.getElementById('prev-step3');
    const skipStep2Btn = document.getElementById('skip-step2');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const completeSignupBtn = document.getElementById('complete-signup');

    // Toggle between login and signup forms
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        flipContainer.classList.add('flipped');
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        flipContainer.classList.remove('flipped');
    });

    // Toggle password visibility
    togglePasswordBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const type = passwordInputs[index].getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputs[index].setAttribute('type', type);
            btn.querySelector('i').classList.toggle('fa-eye');
            btn.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Password strength checker
    const passwordInput = document.getElementById('password-signup');
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let strength = 0;
        let feedback = '';

        // Length check
        if (password.length >= 8) strength += 1;
        // Uppercase check
        if (/[A-Z]/.test(password)) strength += 1;
        // Lowercase check
        if (/[a-z]/.test(password)) strength += 1;
        // Number check
        if (/[0-9]/.test(password)) strength += 1;
        // Special character check
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        // Update strength meter
        const strengthPercent = (strength / 5) * 100;
        passwordStrengthMeter.style.width = `${strengthPercent}%`;

        // Set color based on strength
        if (strength <= 2) {
            passwordStrengthMeter.style.backgroundColor = '#dc3545';
            feedback = 'Weak';
        } else if (strength <= 4) {
            passwordStrengthMeter.style.backgroundColor = '#ffc107';
            feedback = 'Medium';
        } else {
            passwordStrengthMeter.style.backgroundColor = '#28a745';
            feedback = 'Strong';
        }

        passwordStrengthText.textContent = feedback;
    });

    // Multi-step form navigation
    nextStep1Btn.addEventListener('click', () => {
        if (validateStep1()) {
            step1.style.display = 'none';
            step2.style.display = 'block';
        }
    });

    nextStep2Btn.addEventListener('click', () => {
        if (validateStep2()) {
            step2.style.display = 'none';
            step3.style.display = 'block';
        }
    });

    prevStep2Btn.addEventListener('click', () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    prevStep3Btn.addEventListener('click', () => {
        step3.style.display = 'none';
        step2.style.display = 'block';
    });

    skipStep2Btn.addEventListener('click', () => {
        step2.style.display = 'none';
        step3.style.display = 'block';
    });

    // Complete Signup Button Click Handler
    completeSignupBtn.onclick = async function(e) {
        e.preventDefault();
        console.log('Complete signup clicked');

        // Validate all steps
        if (!validateStep1() || !validateStep2() || !validateStep3()) {
            alert('Please fill in all required fields');
            return;
        }

        // Show loading notification
        showNotification('Processing signup...', 'info');

        // Collect form data
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email-signup').value,
            password: document.getElementById('password-signup').value,
            phone: document.getElementById('phone').value,
            dob: document.getElementById('dob').value,
            language: document.getElementById('language').value,
            creditCard: document.getElementById('credit-card').value,
            address: {
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value
            },
            payment: {
                cardType: document.getElementById('card-type').value,
                cardNumber: document.getElementById('card-number').value,
                expiry: document.getElementById('expiry').value,
                cvv: document.getElementById('cvv').value,
                cardName: document.getElementById('card-name').value
            }
        };

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Signup successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    flipContainer.classList.remove('flipped');
                }, 2000);
            } else {
                showNotification(data.message || 'Signup failed', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('An error occurred during signup', 'error');
        }
    };

    // Form validation functions
    function validateStep1() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email-signup').value;
        const password = document.getElementById('password-signup').value;
        const phone = document.getElementById('phone').value;
        const dob = document.getElementById('dob').value;
        const language = document.getElementById('language').value;
        const creditCard = document.getElementById('credit-card').value;

        if (!username || !email || !password || !phone || !dob || !language || !creditCard) {
            alert('Please fill in all required fields');
            return false;
        }

        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return false;
        }

        if (!isValidPhone(phone)) {
            alert('Please enter a valid phone number');
            return false;
        }

        if (!isValidCreditCard(creditCard)) {
            alert('Please enter a valid 16-digit credit card number');
            return false;
        }

        return true;
    }

    function validateStep2() {
        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value;
        const country = document.getElementById('country').value;

        if (!street || !city || !state || !zip || !country) {
            alert('Please fill in all address fields');
            return false;
        }

        return true;
    }

    function validateStep3() {
        const cardType = document.getElementById('card-type').value;
        const cardNumber = document.getElementById('card-number').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('card-name').value;

        if (!cardType || !cardNumber || !expiry || !cvv || !cardName) {
            alert('Please fill in all payment information');
            return false;
        }

        return true;
    }

    // Utility functions
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    }

    function isValidCreditCard(card) {
        return /^\d{16}$/.test(card);
    }

    // Forgot password functionality
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordContainer.style.display = 'flex';
    });

    closeForgotPassword.addEventListener('click', () => {
        forgotPasswordContainer.style.display = 'none';
    });

    sendResetLink.addEventListener('click', () => {
        const email = document.getElementById('forgot-email').value;
        if (!email || !isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Here you would typically make an API call to send the reset link
        alert('Password reset link has been sent to your email');
        forgotPasswordContainer.style.display = 'none';
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isAdmin) {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    });

    // Notification function
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'info') icon = 'fa-info-circle';

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        notification.offsetHeight; // Force reflow
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}); 