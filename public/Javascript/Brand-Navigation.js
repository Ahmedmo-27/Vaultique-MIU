// Function to setup brand navigation
function setupBrandNavigation() {
  const brandLinks = document.querySelectorAll('[data-brand]');

  brandLinks.forEach((link) => {
    // Use new URL format if available, fall back to old format
    const newHref =
      link.getAttribute('data-new-href') ||
      `/Ahmed/Shop All - Brands Page/Client/Brand-Page.html?brand=${link.getAttribute('data-brand')}`;

    link.href = newHref;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = newHref;
    });
  });
}

// Function to setup collection navigation
function setupCollectionNavigation() {
  const collectionLinks = document.querySelectorAll('[data-collection]');

  collectionLinks.forEach((link) => {
    // Use new URL format if available, fall back to old format
    const newHref =
      link.getAttribute('data-new-href') ||
      `/Ahmed/Shop All - Brands Page/Client/Collection-Page.html?collection=${link.getAttribute('data-collection')}`;

    link.href = newHref;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = newHref;
    });
  });
}

// Run the setup when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  setupBrandNavigation();
  setupCollectionNavigation();
});

// Also run it now in case the DOM is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  setupBrandNavigation();
  setupCollectionNavigation();
}
