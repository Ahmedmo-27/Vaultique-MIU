document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createCollectionForm');
    const nameInput = document.getElementById('name');
    const slugInput = document.getElementById('slug');
    const featuredItemsContainer = document.getElementById('featuredItems');
    const addItemButton = document.getElementById('addItem');
    let itemCount = 0;

    // Generate slug from name
    nameInput.addEventListener('input', function() {
        const slug = this.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        slugInput.value = slug;
    });

    // Preview uploaded files
    function setupFilePreview(input, previewContainer) {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;

            const reader = new FileReader();
            const preview = previewContainer.querySelector('img, video') || document.createElement(file.type.startsWith('image/') ? 'img' : 'video');

            reader.onload = function(e) {
                preview.src = e.target.result;
                if (!preview.parentElement) {
                    previewContainer.appendChild(preview);
                }
            };

            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                reader.readAsDataURL(file);
                preview.controls = true;
            }
        });
    }

    // Setup file previews for main form
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        const previewContainer = input.closest('.form-group').querySelector('.preview-container');
        if (previewContainer) {
            setupFilePreview(input, previewContainer);
        }
    });

    // Add featured item
    function addFeaturedItem() {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'featured-item';
        itemDiv.innerHTML = `
            <div class="featured-item-header">
                <h3>Featured Item ${itemCount + 1}</h3>
                <button type="button" class="remove-item-btn" onclick="this.closest('.featured-item').remove()">Remove</button>
            </div>
            <div class="form-group">
                <label for="featuredItems[${itemCount}][name]">Name</label>
                <input type="text" class="form-control" name="featuredItems[${itemCount}][name]" required>
            </div>
            <div class="form-group">
                <label for="featuredItems[${itemCount}][image]">Image</label>
                <div class="file-upload">
                    <label class="file-upload-label">
                        <input type="file" name="featuredItems[${itemCount}][image]" accept="image/*" required>
                        Choose Image
                    </label>
                </div>
                <div class="preview-container"></div>
            </div>
            <div class="form-group">
                <label for="featuredItems[${itemCount}][tagline]">Tagline</label>
                <input type="text" class="form-control" name="featuredItems[${itemCount}][tagline]" required>
            </div>
            <div class="form-group">
                <label for="featuredItems[${itemCount}][description]">Description</label>
                <textarea class="form-control" name="featuredItems[${itemCount}][description]" rows="3" required></textarea>
            </div>
        `;

        featuredItemsContainer.appendChild(itemDiv);
        
        // Setup file preview for the new item
        const newFileInput = itemDiv.querySelector('input[type="file"]');
        const newPreviewContainer = itemDiv.querySelector('.preview-container');
        setupFilePreview(newFileInput, newPreviewContainer);
        
        itemCount++;
    }

    // Add initial featured item
    addFeaturedItem();

    // Add item button click handler
    addItemButton.addEventListener('click', addFeaturedItem);

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);

        try {
            const response = await fetch('/admin/collections', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Collection created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/admin/collections';
                }, 1500);
            } else {
                showNotification(result.error || 'Failed to create collection', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('An error occurred while creating the collection', 'error');
        }
    });
});

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
} 