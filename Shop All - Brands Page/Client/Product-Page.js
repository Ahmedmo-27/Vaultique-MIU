document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
      alert('Product not found');
      window.location.href = '/Products.html';
      return;
    }
          // Thumbnail click functionality
          document.addEventListener('DOMContentLoaded', function() {
            const thumbnails = document.querySelectorAll('.thumbnail');
            const mainImage = document.getElementById('mainImage');
            
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', function() {
                    // Remove active class from all thumbnails
                    thumbnails.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked thumbnail
                    this.classList.add('active');
                    
                    // Update main image
                    const newImageSrc = this.getAttribute('data-image');
                    if (newImageSrc) {
                        mainImage.src = newImageSrc;
                    }
                });
            });
        });

        function showTab(event, tabId) {
            // Hide all tab panes
            let tabPanes = document.querySelectorAll(".tab-pane");
            tabPanes.forEach(tab => tab.classList.remove("active"));

            // Remove active class from all tabs
            let tabs = document.querySelectorAll(".tab");
            tabs.forEach(tab => tab.classList.remove("active"));

            // Show the selected tab content
            document.getElementById(tabId).classList.add("active");

            // Highlight the clicked tab
            event.currentTarget.classList.add("active");
        }

    // Fetch product details
    fetch(`/api/products/${productId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Product not found');
        }
        return response.json();
      })
      .then(product => {
        // Update page title
        document.title = `${product.name} | Vaultique`;
        
        // Update breadcrumb
        document.getElementById('productNameBreadcrumb').textContent = product.name;
        
        // Update main product image
        const mainImage = document.getElementById('mainImage');
        mainImage.src = product.image;
        mainImage.alt = product.name;
        
        // Update thumbnails
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        const images = product.galleryImages && product.galleryImages.length > 0 ? 
          [product.image, ...product.galleryImages] : [product.image];
        
        thumbnailContainer.innerHTML = images.map((img, index) => `
          <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${img}">
            <img src="${img}" alt="Thumbnail ${index + 1}">
          </div>
        `).join('');
        
        // Add thumbnail click handlers
        document.querySelectorAll('.thumbnail').forEach(thumb => {
          thumb.addEventListener('click', function() {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            mainImage.src = this.dataset.image;
          });
        });
        
        // Update product info
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productPrice').textContent = `€ ${product.price.toLocaleString()}`;
        document.getElementById('productDescription').innerHTML = product.description || 'No description available';
        
        // Update rating (default to 4.5 if not specified)
        updateRating(product.rating || 4.5);
        
        // Update features
        const featureList = document.getElementById('featureList');
        if (product.specialFeatures && product.specialFeatures.length > 0) {
          featureList.innerHTML = product.specialFeatures.map(feature => `
            <li class="feature-item">
              <span class="feature-name">${feature.featureName}</span>
              <span class="feature-desc">${feature.featureDesc}</span>
            </li>
          `).join('');
        } else {
          featureList.innerHTML = '<li>No special features listed</li>';
        }
        
        // Update specifications
        const specsList = document.getElementById('specsList');
        if (product.specifications && product.specifications.length > 0) {
          specsList.innerHTML = product.specifications.map(spec => `
            <li class="spec-item">
              <span class="spec-name">${spec.specName}</span>
              <span class="spec-value">${spec.specValue}</span>
            </li>
          `).join('');
        } else {
          specsList.innerHTML = '<li>No specifications listed</li>';
        }
        
        // Update watch image
        if (product.galleryImages && product.galleryImages.length > 0) {
          document.getElementById('watchImage').src = product.galleryImages[0];
        } else {
          document.getElementById('watchImage').src = product.image;
        }
        
        // Update video
        const videoContainer = document.getElementById('videoContainer');
        if (product.video) {
          videoContainer.innerHTML = `
            <video src="${product.video}" autoplay loop muted playsinline></video>
          `;
        } else {
          videoContainer.style.display = 'none';
        }
        
        // Add to cart button
        document.getElementById('addToCartBtn').addEventListener('click', function() {
          addToCart(product._id);
        });
        
        // Wishlist button
        document.getElementById('wishlistBtn').addEventListener('click', function() {
          toggleWishlist(this, product._id);
        });
        
        // 3D model button
        if (product.model3D) {
          document.getElementById('view3dBtn').addEventListener('click', function() {
            view3DModel(product.model3D);
          });
        } else {
          document.getElementById('view3dBtn').style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error loading product:', error);
        alert(error.message);
        window.location.href = '/Products.html';
      });
  
    // Tab functionality
    function showTab(event, tabId) {
      // Hide all tab panes
      let tabPanes = document.querySelectorAll(".tab-pane");
      tabPanes.forEach(tab => tab.classList.remove("active"));
      
      // Remove active class from all tabs
      let tabs = document.querySelectorAll(".tab");
      tabs.forEach(tab => tab.classList.remove("active"));
      
      // Show the selected tab content
      document.getElementById(tabId).classList.add("active");
      
      // Highlight the clicked tab
      event.currentTarget.classList.add("active");
    }
  
    function updateRating(rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const stars = document.querySelectorAll('#productRating i');
      
      stars.forEach((star, index) => {
        if (index < fullStars) {
          star.className = 'fas fa-star';
        } else if (index === fullStars && hasHalfStar) {
          star.className = 'fas fa-star-half-alt';
        } else {
          star.className = 'far fa-star';
        }
      });
      
      document.querySelector('#productRating span').textContent = `(${rating.toFixed(1)}/5)`;
    }
  
    function addToCart(productId) {
      console.log(`Adding product ${productId} to cart`);
      // Implement your cart addition logic here
      alert('Product added to cart');
    }
  
    function toggleWishlist(element, productId) {
      element.classList.toggle('filled');
      const icon = element.querySelector('i');
      if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
      }
      console.log(`Toggled wishlist for product ${productId}`);
    }
  
    function view3DModel(modelUrl) {
      console.log(`Viewing 3D model: ${modelUrl}`);
      // Implement your 3D model viewer logic here
      alert('Opening 3D model viewer');
    }
  });