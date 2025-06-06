document.addEventListener('DOMContentLoaded', function() {
    const mainImage = document.querySelector('.main-image');
    const img = mainImage.querySelector('img');
    let isZoomed = false;
    let originalTransform = '';

    mainImage.addEventListener('click', function(e) {
        if (!isZoomed) {
            // Zoom in
            originalTransform = img.style.transform;
            const rect = mainImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate zoom center point
            const centerX = (x / rect.width) * 100;
            const centerY = (y / rect.height) * 100;
            
            img.style.transform = `scale(2)`;
            img.style.transformOrigin = `${centerX}% ${centerY}%`;
            mainImage.style.cursor = 'zoom-out';
            isZoomed = true;
        } else {
            // Zoom out
            img.style.transform = originalTransform;
            mainImage.style.cursor = 'zoom-in';
            isZoomed = false;
        }
    });

    // Reset zoom when clicking outside the image
    document.addEventListener('click', function(e) {
        if (isZoomed && !mainImage.contains(e.target)) {
            img.style.transform = originalTransform;
            mainImage.style.cursor = 'zoom-in';
            isZoomed = false;
        }
    });
}); 