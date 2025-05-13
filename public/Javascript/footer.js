// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Toggle mobile menu for "Most viewed pages" if needed
const mostViewedPages = document.querySelector('a[href="#"]');
if (mostViewedPages) {
    mostViewedPages.addEventListener('click', function(e) {
        e.preventDefault();
        // Add your mobile menu toggle logic here
    });
} 


