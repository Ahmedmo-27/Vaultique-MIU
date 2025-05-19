// Handle image upload
function uploadImage() {
    const input = document.getElementById('imageUpload');
    input.click();
}

// Handle form submission
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const imageFile = document.getElementById('imageUpload').files[0];
    
    // Add form fields to FormData
    formData.append('name', document.getElementById('productName').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('watchCategory', document.getElementById('watchCategory').value);
    formData.append('brandType', document.getElementById('brandType').value);
    
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showNotification('success', 'Product created successfully!');
            // Reset form
            document.getElementById('productForm').reset();
        } else {
            showNotification('error', data.message || 'Failed to create product');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification('error', 'Failed to create product. Please try again.');
    }
});

// Form validation
function validateForm() {
    const name = document.getElementById('productName').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('watchCategory').value;
    const brand = document.getElementById('brandType').value;
    const image = document.getElementById('imageUpload').files[0];

    if (!name || !description || !price || !category || !brand) {
        showNotification('error', 'Please fill in all required fields');
        return false;
    }

    if (isNaN(price) || price <= 0) {
        showNotification('error', 'Please enter a valid price');
        return false;
    }

    if (!image) {
        showNotification('error', 'Please upload a product image');
        return false;
    }

    return true;
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

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                imagePlaceholder.style.display = 'none';
            }
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

    galleryInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            galleryPreview.innerHTML = '';
            galleryPlaceholder.style.display = 'none';
            
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    galleryPreview.appendChild(img);
                }
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

    videoInput.addEventListener('change', function(e) {
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

    modelInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            modelPlaceholder.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${file.name}</span>
            `;
        } else {
            modelPlaceholder.innerHTML = `
                <i class="fas fa-cube"></i>
                <span>Click to upload 3D model (.glb or .gltf)</span>
            `;
        }
    });

    // Form submission
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showNotification('success', 'Product created successfully!');
                e.target.reset();
                // Reset all previews
                resetPreviews();
            } else {
                showNotification('error', data.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showNotification('error', 'Failed to create product. Please try again.');
        }
    });
});

function resetPreviews() {
    // Reset main image
    document.getElementById('imagePreview').classList.add('hidden');
    document.querySelector('.image-upload-container .upload-placeholder').style.display = 'flex';

    // Reset gallery
    document.getElementById('galleryPreview').innerHTML = '';
    document.querySelector('.gallery-upload-container .upload-placeholder').style.display = 'flex';

    // Reset video
    document.getElementById('videoPreview').classList.add('hidden');
    document.querySelector('.video-upload-container .upload-placeholder').style.display = 'flex';

    // Reset 3D model
    document.querySelector('.model-upload-container .upload-placeholder').innerHTML = `
        <i class="fas fa-cube"></i>
        <span>Click to upload 3D model (.glb or .gltf)</span>
    `;
}
