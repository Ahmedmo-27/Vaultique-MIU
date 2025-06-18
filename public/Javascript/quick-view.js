// Quick View Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const quickViewModal = document.getElementById('quickViewModal');
    const quickViewOverlay = document.getElementById('quickViewOverlay');
    const closeQuickViewBtn = document.getElementById('closeQuickView');

    // Show modal
    document.querySelectorAll('.quick-view').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get product data from the clicked product card
            const productCard = this.closest('.product-card');
            const productData = JSON.parse(productCard.dataset.product);
            
            // Update modal content with product data
            document.getElementById('quickViewMainImage').src = productData.image;
            document.getElementById('quickViewMainImage').alt = productData.name;
            document.getElementById('quickViewName').textContent = productData.name;
            document.getElementById('quickViewPrice').textContent = `$${productData.price.toLocaleString()}`;
            document.getElementById('quickViewDescription').textContent = productData.description || 'No description available';
                            
            // Update wishlist button
            const wishlistBtn = document.getElementById('quickViewWishlistBtn');
            wishlistBtn.dataset.productId = productData._id;
            wishlistBtn.querySelector('i').className = productData.inWishlist ? 'fas fa-heart' : 'far fa-heart';
            wishlistBtn.classList.toggle('filled', productData.inWishlist);
            
            // Update add to cart button
            const addToCartBtn = document.getElementById('quickViewAddToCart');
            addToCartBtn.dataset.productId = productData._id;
            addToCartBtn.disabled = !(productData.stock || (productData.stockCount && productData.stockCount > 0));
            
            // Update view product button
            document.getElementById('quickViewProductBtn').onclick = () => window.location.href = `/user/product?id=${productData._id}`;
            
            // Update thumbnails if gallery images exist
            const thumbnailContainer = document.getElementById('quickViewThumbnails');
            thumbnailContainer.innerHTML = '';
            if (productData.galleryImages && productData.galleryImages.length > 0) {
                productData.galleryImages.forEach((img, idx) => {
                    const thumbnail = document.createElement('div');
                    thumbnail.className = `thumbnail ${idx === 0 ? 'active' : ''}`;
                    thumbnail.dataset.image = img;
                    thumbnail.innerHTML = `<img src="${img}" alt="Thumbnail ${idx + 1}">`;
                    thumbnailContainer.appendChild(thumbnail);
                });

                // Add thumbnail click handlers
                thumbnailContainer.addEventListener('click', function(e) {
                    const thumbnail = e.target.closest('.thumbnail');
                    if (thumbnail) {
                        const newImageSrc = thumbnail.dataset.image;
                        const mainImage = document.getElementById('quickViewMainImage');
                        mainImage.src = newImageSrc;
                        mainImage.style.transform = '';
                        mainImage.parentElement.style.cursor = 'zoom-in';
                        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                        thumbnail.classList.add('active');
                    }
                });
            }
            
            quickViewModal.classList.add('open');
            quickViewOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    // Hide modal
    function hideQuickView() {
        quickViewModal.classList.remove('open');
        quickViewOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeQuickViewBtn.addEventListener('click', hideQuickView);
    quickViewOverlay.addEventListener('click', hideQuickView);

    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && quickViewModal.classList.contains('open')) {
            hideQuickView();
        }
    });

    // Add to cart functionality
    document.getElementById('quickViewAddToCart').addEventListener('click', async function() {
        const productId = this.dataset.productId;
        if (this.disabled) return; // Prevent adding out of stock items
        
        try {
            showLoading();
            const response = await fetch('/user/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, quantity: 1 })
            });

            const data = await response.json();
            if (data.success) {
                showNotification('Product added to cart successfully');
                // Update cart count if element exists
                const cartCount = document.getElementById('cart-items-count');
                if (cartCount) {
                    cartCount.textContent = data.cart.items.reduce((total, item) => total + (item.quantity || 1), 0);
                }
                // Close the quick view modal
                hideQuickView();
            } else {
                throw new Error(data.message || 'Failed to add to cart');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading();
        }
    });

    // Image zoom functionality
    const mainImage = document.getElementById('quickViewMainImage');
    const mainImageContainer = mainImage.parentElement;
    let isZoomed = false;

    mainImageContainer.addEventListener('click', function(e) {
        if (!isZoomed) {
            mainImage.style.transform = 'scale(2)';
            mainImageContainer.style.cursor = 'zoom-out';
            isZoomed = true;
        } else {
            mainImage.style.transform = '';
            mainImageContainer.style.cursor = 'zoom-in';
            isZoomed = false;
        }
    });
}); 