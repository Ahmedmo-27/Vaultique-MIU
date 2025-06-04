// Handle image upload
function uploadImage() {
    const input = document.getElementById('image');
    input.click();
}

// Form validation
function validateForm() {
    const requiredFields = {
        'id': 'Product ID',
        'name': 'Product Name',
        'brand': 'Brand',
        'strapMaterial': 'Strap Material',
        'movement': 'Movement',
        'waterResistance': 'Water Resistance',
        'caseMaterial': 'Case Material',
        'dialColor': 'Dial Color',
        'price': 'Price',
        'Vcollection': 'Collection',
        'gender': 'Gender',
        'description': 'Description'
    };

    let isValid = true;
    let firstError = null;

    // Check all required fields
    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId === 'Vcollection' ? 'collection' : fieldId}Error`);
        
        if (!field.value.trim()) {
            errorElement.textContent = `${fieldName} is required`;
            isValid = false;
            if (!firstError) firstError = field;
        } else {
            errorElement.textContent = '';
        }
    }

    // Validate price
    const price = document.getElementById('price').value;
    if (isNaN(price) || Number(price) <= 0) {
        document.getElementById('priceError').textContent = 'Please enter a valid price';
        isValid = false;
        if (!firstError) firstError = document.getElementById('price');
    }

    // Check for product image
    const image = document.getElementById('image').files[0];
    if (!image) {
        document.getElementById('imageError').textContent = 'Product image is required';
        isValid = false;
        if (!firstError) firstError = document.getElementById('image');
    }

    // Scroll to first error if any
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

// Show notification
function showNotification(type, message) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
  // Main Image Preview
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('imagePreview');
  const imagePlaceholder = imageInput.parentElement.querySelector('.upload-placeholder');

  imageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
        imagePlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.classList.add('hidden');
      imagePlaceholder.style.display = 'flex';
    }
  });

  // Gallery Images Preview
  const galleryInput = document.getElementById('galleryImages');
  const galleryPreview = document.getElementById('galleryPreview');
  const galleryPlaceholder = galleryInput.parentElement.querySelector('.upload-placeholder');

  galleryInput.addEventListener('change', function (e) {
    const files = e.target.files;
    if (files.length > 0) {
      galleryPreview.innerHTML = '';
      galleryPlaceholder.style.display = 'none';

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          galleryPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    } else {
      galleryPreview.innerHTML = '';
      galleryPlaceholder.style.display = 'flex';
    }
  });

  // Video Preview
  const videoInput = document.getElementById('video');
  const videoPreview = document.getElementById('videoPreview');
  const videoPlaceholder = videoInput.parentElement.querySelector('.upload-placeholder');

  videoInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      videoPreview.src = URL.createObjectURL(file);
      videoPreview.classList.remove('hidden');
      videoPlaceholder.style.display = 'none';
    } else {
      videoPreview.classList.add('hidden');
      videoPlaceholder.style.display = 'flex';
    }
  });

  // 3D Model Upload
  const modelInput = document.getElementById('model3D');
  const modelPlaceholder = modelInput.parentElement.querySelector('.upload-placeholder');

  modelInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      modelPlaceholder.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${file.name}</span>
            `;
    } else {
      modelPlaceholder.innerHTML = `
                <i class="fas fa-cube"></i>
                <span>Click to upload 3D model (.glb)</span>
            `;
    }
  });

    // Form submission
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        const formData = new FormData(e.target);
        
        // Log form data for debugging
        console.log('Form data being sent:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        
        try {
            const response = await fetch('/api/admin/products/create', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            console.log('Server response:', data);

            if (data.success) {
                showNotification('success', 'Product created successfully!');
                e.target.reset();
                // Reset all previews
                resetPreviews();
            } else {
                // Handle validation errors
                if (data.errors && Array.isArray(data.errors)) {
                    // Clear all previous error messages
                    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
                    
                    // Display each validation error
                    data.errors.forEach(error => {
                        const errorElement = document.getElementById(`${error.field}Error`);
                        if (errorElement) {
                            errorElement.textContent = error.message;
                            // Scroll to the first error
                            if (error === data.errors[0]) {
                                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    });
                    showNotification('error', 'Please fix the validation errors');
                } else {
                    showNotification('error', data.message || 'Failed to create product');
                }
                console.error('Server error:', data.error);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showNotification('error', error.message || 'Failed to create product. Please try again.');
        }
    });
});

// Reset all previews
function resetPreviews() {
    // Reset main image preview
    const imagePreview = document.getElementById('imagePreview');
    const imagePlaceholder = document.querySelector('.image-upload-container .upload-placeholder');
    imagePreview.classList.add('hidden');
    imagePlaceholder.style.display = 'flex';

    // Reset gallery preview
    const galleryPreview = document.getElementById('galleryPreview');
    const galleryPlaceholder = document.querySelector('.gallery-upload-container .upload-placeholder');
    galleryPreview.innerHTML = '';
    galleryPlaceholder.style.display = 'flex';

    // Reset video preview
    const videoPreview = document.getElementById('videoPreview');
    const videoPlaceholder = document.querySelector('.video-upload-container .upload-placeholder');
    videoPreview.classList.add('hidden');
    videoPlaceholder.style.display = 'flex';

    // Reset 3D model preview
    const modelPlaceholder = document.querySelector('.model-upload-container .upload-placeholder');
    modelPlaceholder.innerHTML = `
        <i class="fas fa-cube"></i>
        <span>Click to upload 3D model (.glb)</span>
    `;
}
