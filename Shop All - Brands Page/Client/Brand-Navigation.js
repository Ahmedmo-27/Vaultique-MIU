// Function to handle brand navigation
function setupBrandNavigation() {
  const brandLinks = document.querySelectorAll('[data-brand]');
  
  brandLinks.forEach(link => {
    // Use new URL format if available, fall back to old format
    const newHref = link.getAttribute('data-new-href') || 
                   `/Ahmed/Products Page/Client/Brand-Page.html?brand=${link.getAttribute('data-brand')}`;
    
    link.href = newHref;
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = newHref;
    });
  });
}
// Run the setup when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', setupBrandNavigation);

// Also run it now in case the DOM is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  setupBrandNavigation();
}