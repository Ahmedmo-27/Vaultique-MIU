document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show success message
                    window.showNotification('success', 'Message sent successfully! We will get back to you soon.');
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    // Show error message
                    window.showNotification('error', data.message || 'Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                window.showNotification('error', 'An error occurred. Please try again later.');
            }
        });
    }
    
    // Phone number validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove any non-digit characters except +
            let value = e.target.value.replace(/[^\d+]/g, '');
            
            // Ensure only one + at the start
            if (value.indexOf('+') > 0) {
                value = value.replace(/\+/g, '');
                value = '+' + value;
            }
            
            e.target.value = value;
        });
    }
});