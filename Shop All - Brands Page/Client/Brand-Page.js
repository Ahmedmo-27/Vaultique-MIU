// Helper function to normalize brand names
function normalizeBrandName(name) {
  // Convert URL-friendly names back to database names
  const brandNameMap = {
    Rolex: "Rolex",
    Omega: "Omega",
    Cartier: "Cartier",
    "Patek-Philippe": "Patek Philippe",
    "Audemars-Piguet": "Audemars Piguet",
    'A.lange ': "A.Lange & Söhne",
    'Jacob ': "Jacob & Co",
    "A-Lange-Sohne": "A.Lange & Söhne",
    "Vacheron-Constantin": "Vacheron Constantin",
    "Jacob-Co": "Jacob & Co",
    "Richard-Mille": "Richard Mille",
    Breitling: "Breitling",
  }

  return brandNameMap[name] || name
}

// Update the DOMContentLoaded event handler
document.addEventListener("DOMContentLoaded", async () => {
  // Add more robust error handling and debugging
  console.log("Brand page script starting...")
  console.log("Current URL:", window.location.href)
  console.log("Current pathname:", window.location.pathname)

  const normalizedBrandName ='Rolex';

  try {
    
    // Get brand name from URL with multiple fallback methods
    let brandName = extractBrandFromURL();
    
    // Normalize the brand name (convert URL-friendly format to database format)
    const normalizedBrandName = normalizeBrandName(brandName);
    updateBrandFilter(normalizedBrandName);

    // Debugging information
    console.group('Brand Page Loading');
    console.log('URL:', window.location.href);
    console.log('Extracted brand:', brandName);
    console.log('Normalized brand:', normalizedBrandName);
    
    // Fetch brand data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const apiUrl = `http://127.0.0.1:3000/api/brands/name/${encodeURIComponent(normalizedBrandName)}`;
    console.log('Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) 
    {
      const errortext = await parseErrorResponse(response);
      const errorContent = `
      <div class="error">
        <p class="error-message">
          Brand data request failed with status.<br> ${response.status}
        </p>
      </div>
      `;
    
      createModal(
        errortext, 
        errorContent,
        [
          {
            text: 'Retry',
            class: 'confirm-btn',
            clickHandler: () => {
              closeModal(document.querySelector('.modal-overlay'));
            }
          },
          {
            text: 'Close',
            class: 'cancel-btn',
            clickHandler: () => closeModal(document.querySelector('.modal-overlay'))
          }
        ]
      );
    }
    
    const { data: brandData } = await response.json();
    
    if (!brandData) {
      throw new Error('Received empty brand data from server');
    }
    
    console.log('Brand data:', brandData);
    console.groupEnd();
    
    // Update page content
    updateBrandPage(brandData);
    
    // Initialize slider if models exist
    if (brandData.featuredModels?.length > 0) {
      initSlider(brandData.featuredModels);
    } else {
      console.warn('No featured models for brand:', normalizedBrandName);
      document.querySelector('.slider-container')?.classList.add('hidden');
    }
    
    // Update page metadata
    updatePageMetadata(brandData);
    
  } catch (error) {
    const errorContent = `
      <div class="error">
        <p class="error-message">
          Brand Page Loading Failed .<br> ${error.message}
        </p>
      </div>
    `;
    
    createModal(
      'Error', 
      errorContent,
      [
        {
          text: 'Retry',
          class: 'confirm-btn',
          clickHandler: () => {
            closeModal(document.querySelector('.modal-overlay'));
          }
        },
        {
          text: 'Close',
          class: 'cancel-btn',
          clickHandler: () => closeModal(document.querySelector('.modal-overlay'))
        }
      ]
    );
    
    // Special handling for timeout errors
    if (error.name === 'AbortError') {
        const errorContent = `
          <div class="error">
            <p class="error-message">
              Request timed out. Please check your connection and try again .<br>
            </p>
          </div>
        `;
        
        createModal(
          'Error', 
          errorContent,
          [
            {
              text: 'Retry',
              clickHandler: () => {
                closeModal(document.querySelector('.modal-overlay'));
              }
            },
            {
              text: 'Close',
              class: 'cancel-btn',
              clickHandler: () => closeModal(document.querySelector('.modal-overlay'))
            }
          ]
        );

    } else {
      const errorContent = `
        <div class="error">
          <p class="error-message">
            Failed to load brand.<br> ${error.message}
          </p>
        </div>
      `;
      
      createModal(
        'Error', 
        errorContent,
        [
          {
            text: 'Retry',
            class: 'confirm-btn',
            clickHandler: () => {
              closeModal(document.querySelector('.modal-overlay'));
            }
          },
          {
            text: 'Close',
            class: 'cancel-btn',
            clickHandler: () => closeModal(document.querySelector('.modal-overlay'))
          }
        ]
      );    
    }
    
    // Fallback to default brand if this wasn't already the default
    if (normalizedBrandName !== 'Rolex') {
      console.log('Attempting fallback to Rolex...');
      window.location.href = '/brands/rolex';
      return;
    }
  }
})

function extractBrandFromURL() {
  // Try pathname first (e.g., /brands/rolex)
  const pathParts = window.location.pathname.split('/');
  const brandsIndex = pathParts.indexOf('brands');
  
  if (brandsIndex > -1 && brandsIndex < pathParts.length - 1) {
    return pathParts[brandsIndex + 1];
  }
  
  // Try query parameter (e.g., ?brand=rolex)
  const urlParams = new URLSearchParams(window.location.search);
  const queryBrand = urlParams.get('brand');
  if (queryBrand) return queryBrand;
  
  // Try last path part (legacy support)
  const lastPart = pathParts[pathParts.length - 1].replace('.html', '');
  if (lastPart && !['Brand-Page', 'brands'].includes(lastPart)) {
    return lastPart;
  }
  
  console.log('No brand specified in URL, defaulting to Rolex');
  return 'Rolex';
}

async function parseErrorResponse(response) {
  try {
    const errorText = await response.text();
    return JSON.parse(errorText);
  } catch {
    return { message: await response.text() };
  }
}

function updatePageMetadata(brandData) {
  // Update document title
  document.title = `Vaultique | ${brandData.name}`;
  
  // Update meta description if needed
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = brandData.description || 
                       `Explore ${brandData.name} watches collection at Vaultique`;
  }
  
  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.href = window.location.origin + `/brands/${brandData.name.toLowerCase().replace(/\s+/g, '-')}`;
  }
}

// Update the updateBrandPage function to handle all elements
function updateBrandPage(brandData) {
  console.log("Updating brand page with data:", brandData)

  // Update hero video
  const heroVideoSource = document.getElementById("brandVideoSource")
  if (heroVideoSource && brandData.heroVideo) {
    heroVideoSource.src = brandData.heroVideo
    const videoElement = heroVideoSource.parentElement
    if (videoElement) {
      videoElement.load()
      videoElement.play().catch((err) => console.warn("Auto-play prevented:", err))
    }
  }

  // Update brand image
  const brandImage = document.getElementById("brandCoverImage")
  if (brandImage && brandData.coverImage) {
    brandImage.src = brandData.coverImage
    brandImage.alt = `${brandData.name} Cover Image`
    brandImage.onerror = () => {
      brandImage.src = "/default-brand-image.jpg"
    }
  }

  // Update brand Name
  const brandLogo = document.getElementById("brandLogo");
  if (brandLogo && brandData.name) {
      brandLogo.textContent = brandData.name;
  }

  // Update text overlay
  const brandHeader = document.getElementById("brandHeader")
  const brandDescription = document.getElementById("brandDescription")

  if (brandHeader) brandHeader.textContent = brandData.header || "Premium Watches"
  if (brandDescription)
    brandDescription.textContent = brandData.description || "Discover our exquisite collection of timepieces."

  // Update page title
  document.title = `Vaultique | ${brandData.name}`

  // Update brand filter in the filter panel to match current brand
  const brandSelect = document.getElementById("brand")
  if (brandSelect) {
    // First check if the option already exists
    let optionExists = false
    for (let i = 0; i < brandSelect.options.length; i++) {
      if (brandSelect.options[i].value === brandData.name) {
        brandSelect.options[i].selected = true
        optionExists = true
        break
      }
    }

    // If the option doesn't exist, create it
    if (!optionExists) {
      const option = document.createElement("option")
      option.value = brandData.name
      option.textContent = brandData.name
      option.selected = true
      brandSelect.appendChild(option)
    }
  }
}

function initSlider(featuredModels) {
  if (!featuredModels || featuredModels.length === 0) {
    console.warn("No featured models found for this brand")
    return
  }

  const slidesWrapper = document.querySelector(".slides-wrapper")
  const paginationSlider = document.querySelector(".pagination-slider")

  if (!slidesWrapper || !paginationSlider) {
    console.error("Slider elements not found")
    return
  }

  console.log("Creating slider with", featuredModels.length, "models")

  // Clear existing content
  slidesWrapper.innerHTML = ""
  paginationSlider.innerHTML = ""

  // Create slides
  featuredModels.forEach((model, index) => {
    const slide = document.createElement("div")
    slide.className = `slide ${index === 0 ? "active" : ""}`
    slide.dataset.model = index + 1

    slide.innerHTML = `
          <div class="slide-content">
              <div class="watch-info">
                  <h1 class="watch-title">${model.name}</h1>
                  <h2 class="watch-tagline">${model.tagline}</h2>
                  <p class="watch-description">${model.description}</p>
              </div>
              <div class="watch-image-container">
                  <img src="${model.image}" alt="${model.name}" class="watch-image" 
                       onerror="this.src='/default-watch-image.jpg'">
              </div>
          </div>
      `

    slidesWrapper.appendChild(slide)
  })

  // Create pagination dots
  featuredModels.forEach((_, index) => {
    const dot = document.createElement("button")
    dot.className = `dot ${index === 0 ? "active" : ""}`
    dot.dataset.index = index
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`)
    paginationSlider.appendChild(dot)
  })

  console.log(
    "Slider created with",
    slidesWrapper.children.length,
    "slides and",
    paginationSlider.children.length,
    "dots",
  )
}

function updateBrandFilter(currentBrand) {
  const brandSelect = document.getElementById('brand');
  if (!brandSelect) return;
  
  // Keep only the current brand and "All" option
  const optionsToKeep = currentBrand;
  const optionsArray = Array.from(brandSelect.options);
  
  // Clear all options
  brandSelect.innerHTML = '';
  
  // Re-add only the options we want to keep
  optionsArray.forEach(option => {
    if (optionsToKeep.includes(option.value)) {
      brandSelect.appendChild(option);
    }
  });
  
  // Set the selected brand
  brandSelect.value = currentBrand;
  
  // Add event listener for brand changes
  brandSelect.addEventListener('change', function() {
    const selectedBrand = this.value;
     const urlFriendlyBrand = selectedBrand.toLowerCase().replace(/[&\s]+/g, '-');
      window.location.href = `/brands/${urlFriendlyBrand}`;
  });
}

function initializeSliderControls() {
  // This will use the Slider.js functionality
  // Make sure Slider.js is loaded after this file
}


function createModal(title, content, buttons = []) {
  // Create modal elements
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  
  // Modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  
  const closeButton = document.createElement('span');
  closeButton.className = 'close-modal';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => closeModal(modalOverlay));
  
  modalHeader.appendChild(titleElement);
  modalHeader.appendChild(closeButton);
  
  // Modal body
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.innerHTML = content;
  
  // Modal footer
  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';
  
  // Add buttons
  buttons.forEach(button => {
    const btn = document.createElement('button');
    btn.className = button.class || 'modal-btn';
    btn.textContent = button.text;
    btn.addEventListener('click', (e) => {
      if (button.clickHandler) {
        button.clickHandler(e);
      }
    });
    modalFooter.appendChild(btn);
  });
  
  // Assemble modal
  modalContainer.appendChild(modalHeader);
  modalContainer.appendChild(modalBody);
  modalContainer.appendChild(modalFooter);
  modalOverlay.appendChild(modalContainer);
  
  // Add to DOM
  document.body.appendChild(modalOverlay);
  
  // Show modal with animation
  setTimeout(() => {
    modalOverlay.classList.add('show');
  }, 2000);
  
  // Close when clicking outside
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal(modalOverlay);
    }
  });
  
  return modalOverlay;
}

function closeModal(modal) {
  if (!modal) return;
  
  modal.classList.remove('show');
  setTimeout(() => {
    modal.remove();
  }, 300);
}