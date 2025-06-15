// Google Sign-In callback function
function handleGoogleSignIn(response) {
    // Send the credential to your server
    fetch('/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            credential: response.credential
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store user data if needed
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            // Redirect based on user role
            window.location.href = data.user?.role === 'admin' ? '/admin/dashboard' : '/user/home';
        } else {
            // Show error message
            showNotification('Google sign-in failed: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred during Google sign-in', 'error');
    });
}

// Initialize Google Sign-In button
document.addEventListener('DOMContentLoaded', function() {
    const googleSignInBtn = document.getElementById('googleSignIn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', function() {
            // Trigger the Google Sign-In popup
            google.accounts.id.prompt((notification) => {
                if (notification.isDisplayed()) {
                    console.log('Google Sign-In prompt is displayed');
                } else if (notification.isNotDisplayed()) {
                    showNotification('Google Sign-In is not available. Please try again later.', 'error');
                }
            });
        });
    }
}); 