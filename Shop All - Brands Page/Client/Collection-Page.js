// Constants and Configuration
const CONFIG = {
  API_BASE_URL: "http://localhost:3000/api",
  ITEMS_PER_PAGE: 10,
  DEFAULT_IMAGE: "/Ahmed/Photos/default-collection.jpg",
  DEFAULT_PRODUCT_IMAGE: "/Ahmed/Photos/default-product.jpg",
  DEFAULT_WATCH_IMAGE: "/Ahmed/Photos/default-watch.jpg",
  DEBOUNCE_DELAY: 300,
  LAZY_LOAD_THRESHOLD: 0.5,
}

// State Management
const state = {
  currentPage: 1,
  totalPages: 1,
  products: [],
  currentCollection: null,
  allItems: [],
  filteredItems: [],
  currentFilters: {},
  isLoading: false,
  error: null,
  sortOrder: "default",
  searchQuery: "",
}

// Helper function to normalize collection names
function normalizeCollectionName(name) {
  // Convert URL-friendly names back to database names
  const collectionNameMap = {
    "classic-dress": "Classic & Dress Collection",
    "casual-everyday": "Casual & Everyday Collection",
    "sports-adventure": "Sports & Adventure Collection",
    "aviation-travel": "Aviation & Travel Collection",
    "luxury-heritage": "Luxury & Heritage Collection",
    Classic: "Classic & Dress Collection",
    Casual: "Casual & Everyday Collection",
    Sports: "Sports & Adventure Collection",
    Aviation: "Aviation & Travel Collection",
    Luxury: "Luxury & Heritage Collection",
  }

  return collectionNameMap[name] || name
}

// Utility Functions
const utils = {
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  handleImageError(img, fallbackSrc) {
    img.onerror = null // Prevent infinite loop
    img.src = fallbackSrc
  },

  formatPrice(price) {
    return price ? `$${price.toLocaleString()}` : "N/A"
  },

  createElement(tag, className, attributes = {}) {
    const element = document.createElement(tag)
    if (className) element.className = className
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
    return element
  },
}

// Update the DOMContentLoaded event handler
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Collection page script starting...")
  console.log("Current URL:", window.location.href)
  console.log("Current pathname:", window.location.pathname)

  try {
    // Get collection name from URL with multiple fallback methods
    const collectionName = extractCollectionFromURL()

    // Normalize the collection name (convert URL-friendly format to database format)
    const normalizedCollectionName = normalizeCollectionName(collectionName)

    // Initialize page number from URL if present
    const urlParams = new URLSearchParams(window.location.search)
    state.currentPage = Number.parseInt(urlParams.get("page")) || 1
    state.sortOrder = urlParams.get("sort") || "default"


    // Update collection filter
    updateCollectionFilter(normalizedCollectionName)

    // Debugging information
    console.group("Collection Page Loading")
    console.log("URL:", window.location.href)
    console.log("Extracted collection:", collectionName)
    console.log("Normalized collection:", normalizedCollectionName)

    // Fetch collection data with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const apiUrl = `${CONFIG.API_BASE_URL}/collections/name/${encodeURIComponent(normalizedCollectionName)}`
    console.log("Fetching from:", apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    clearTimeout(timeoutId)

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || `Server error: ${response.status}`
      } catch {
        errorMessage = `Server error: ${response.status}`
      }

      const errorContent = `
        <div class="error">
          <p class="error-message">
            ${errorMessage}
          </p>
        </div>
      `

      createModal(
        'Error',
        errorContent,
        [
          {
            text: 'Retry',
            class: 'confirm-btn',
            clickHandler: () => {
              closeModal(document.querySelector('.modal-overlay'))
              window.location.reload()
            }
          },
          {
            text: 'Close',
            class: 'cancel-btn',
            clickHandler: () => closeModal(document.querySelector('.modal-overlay'))
          }
        ]
      )
      return
    }

    const result = await response.json()

    if (!result.success || !result.data) {
      throw new Error('Invalid response format from server')
    }

    const collectionData = result.data
    console.log("Collection data:", collectionData)
    console.groupEnd()

    // Store collection data in state
    state.currentCollection = collectionData

    // Update page content
    updateCollectionPage(collectionData)

    // Initialize slider if models exist
    if (collectionData.featuredItems?.length > 0) {
      initSlider(collectionData.featuredItems)
    } else {
      console.warn("No featured items for collection:", normalizedCollectionName)
      document.querySelector(".slider-container")?.classList.add("hidden")
    }

    // Update page metadata
    updatePageMetadata(collectionData)

    // Load initial products
    await loadProducts()

    // Setup event listeners for filters
    setupFilterEventListeners()
  } catch (error) {
    console.error('Collection page error:', error)
    
    let errorMessage = 'An unexpected error occurred'
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection and try again.'
    } else if (error.message) {
      errorMessage = error.message
    }

    const errorContent = `
      <div class="error">
        <p class="error-message">
          ${errorMessage}
        </p>
      </div>
    `

    createModal(
      'Error',
      errorContent,
      [
        {
          text: 'Retry',
          class: 'confirm-btn',
          clickHandler: () => {
            closeModal(document.querySelector('.modal-overlay'))
            window.location.reload()
          }
        },
        {
          text: 'Close',
          class: 'cancel-btn',
          clickHandler: () => closeModal(document.querySelector('.modal-overlay'))
        }
      ]
    )

    // Fallback to default collection if this wasn't already the default
    if (normalizedCollectionName !== "Classic & Dress Collection") {
      console.log("Attempting fallback to Classic & Dress Collection...")
      window.location.href = "/collections/classic-dress"
    }
  }
})

function extractCollectionFromURL() {
  // Try pathname first (e.g., /collections/classic-dress)
  const pathParts = window.location.pathname.split("/")
  const collectionsIndex = pathParts.indexOf("collections")

  if (collectionsIndex > -1 && collectionsIndex < pathParts.length - 1) {
    return pathParts[collectionsIndex + 1]
  }

  // Try query parameter (e.g., ?collection=classic-dress)
  const urlParams = new URLSearchParams(window.location.search)
  const queryCollection = urlParams.get("collection")
  if (queryCollection) return queryCollection

  // Try last path part (legacy support)
  const lastPart = pathParts[pathParts.length - 1].replace(".html", "")
  if (lastPart && !["Collection-Page", "collections"].includes(lastPart)) {
    return lastPart
  }

  console.log("No collection specified in URL, defaulting to Classic & Dress")
  return "classic-dress"
}

async function parseErrorResponse(response) {
  try {
    const errorText = await response.text()
    return JSON.parse(errorText)
  } catch {
    return { message: await response.text() }
  }
}

function updatePageMetadata(collectionData) {
  // Update document title
  document.title = `Vaultique | ${collectionData.name}`

  // Update meta description if needed
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.content = collectionData.description || `Explore ${collectionData.name} watches collection at Vaultique`
  }

  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]')
  if (canonicalLink) {
    canonicalLink.href =
      window.location.origin + `/collections/${collectionData.name.toLowerCase().replace(/\s+/g, "-")}`
  }
}

function updateCollectionPage(collectionData) {
  console.log("Updating collection page with data:", collectionData)

  // Update hero video
  const heroVideoSource = document.getElementById("collectionVideoSource")
  if (heroVideoSource && collectionData.heroVideo) {
    heroVideoSource.src = collectionData.heroVideo
    const videoElement = heroVideoSource.parentElement
    if (videoElement) {
      videoElement.load()
      videoElement.play().catch((err) => console.warn("Auto-play prevented:", err))
    }
  }

  // Update collection image
  const collectionImage = document.getElementById("collectionCoverImage")
  if (collectionImage && collectionData.coverImage) {
    collectionImage.src = collectionData.coverImage
    collectionImage.alt = `${collectionData.name} Cover Image`
  }

  // Update collection Name
  const collectionLogo = document.getElementById("collectionLogo")
  if (collectionLogo && collectionData.name) {
    collectionLogo.textContent = collectionData.name
  }

  state.currentCollection = collectionData.name

  // Update text overlay
  const collectionHeader = document.getElementById("collectionHeader")
  const collectionDescription = document.getElementById("collectionDescription")

  if (collectionHeader) collectionHeader.textContent = collectionData.header || "Premium Collection"
  if (collectionDescription)
    collectionDescription.textContent = collectionData.description || "Discover our exquisite collection of timepieces."

  // Update page title
  document.title = `Vaultique | ${collectionData.name}`

  // Update collection filter in the filter panel to match current collection
  const collectionSelect = document.getElementById("collection")
  if (collectionSelect) {
    // First check if the option already exists
    let optionExists = false
    for (let i = 0; i < collectionSelect.options.length; i++) {
      if (collectionSelect.options[i].value === collectionData.name) {
        collectionSelect.options[i].selected = true
        optionExists = true
        break
      }
    }

    // If the option doesn't exist, create it
    if (!optionExists) {
      const option = document.createElement("option")
      option.value = collectionData.name
      option.textContent = collectionData.name
      option.selected = true
      collectionSelect.appendChild(option)
    }
  }
}

function initSlider(featuredItems) {
  if (!featuredItems || featuredItems.length === 0) {
    console.warn("No featured items found for this collection")
    return
  }

  const slidesWrapper = document.querySelector(".slides-wrapper")
  const paginationSlider = document.querySelector(".pagination-slider")

  if (!slidesWrapper || !paginationSlider) {
    console.error("Slider elements not found")
    return
  }

  console.log("Creating slider with", featuredItems.length, "items")

  // Clear existing content
  slidesWrapper.innerHTML = ""
  paginationSlider.innerHTML = ""

  // Create slides
  featuredItems.forEach((item, index) => {
    const slide = document.createElement("div")
    slide.className = `slide ${index === 0 ? "active" : ""}`
    slide.dataset.model = index + 1
    
    slide.innerHTML = `
      <div class="slide-content">
        <div class="watch-info">
          <h1 class="watch-title">${item.name}</h1>
          <h2 class="watch-tagline">${item.tagline}</h2>
          <p class="watch-description">${item.description}</p>
        </div>
        <div class="watch-image-container">
          <img src="${item.image}" alt="${item.name}" class="watch-image">
        </div>
      </div>
    `

    slidesWrapper.appendChild(slide)
  })

  // Create pagination dots
  featuredItems.forEach((_, index) => {
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

function updateCollectionFilter(currentCollection) {
  const collectionSelect = document.getElementById("collection")
  if (!collectionSelect) return

  // Keep only the current collection and "All" option
  const optionsToKeep = currentCollection
  const optionsArray = Array.from(collectionSelect.options)

  // Clear all options
  collectionSelect.innerHTML = ""

  // Re-add only the options we want to keep
  optionsArray.forEach((option) => {
    if (optionsToKeep.includes(option.value)) {
      collectionSelect.appendChild(option)
    }
  })

  // Set the selected collection
  collectionSelect.value = currentCollection
}

// Product Loading and Filtering Functions
async function loadProducts() {
  if (!state.currentCollection) return

  try {
    showLoadingState()
    hideError()
    state.isLoading = true

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: state.currentPage,
      limit: CONFIG.ITEMS_PER_PAGE,
      sort: state.sortOrder,
    })

    // Add collection filter
    if (state.currentCollection._id) {
      queryParams.append("Vcollection", state.currentCollection._id)
    }

    // Add other filters
    Object.entries(state.currentFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value)
      }
    })

    // Add search query if present
    if (state.searchQuery) {
      queryParams.append("search", state.searchQuery)
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/products?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || `Server error: ${response.status}`
      } catch {
        errorMessage = `Server error: ${response.status}`
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || "Failed to load products")
    }

    state.products = result.data
    state.totalPages = result.pages

    updateProductGrid(result.data)
    updatePagination()
  } catch (error) {
    console.error("Error loading products:", error)
    showError(error.message || "Failed to load products. Please try again later.")
  } finally {
    state.isLoading = false
    removeLoadingState()
  }
}

function updateProductGrid(products) {
  const productGrid = document.getElementById("productGrid")
  if (!productGrid) return

  if (!products.length) {
    productGrid.innerHTML = '<div class="no-products">No products found for this collection.</div>'
    return
  }

  const fragment = document.createDocumentFragment()
  products.forEach((product, index) => {
    const card = createProductCard(product, index)
    fragment.appendChild(card)
  })

  productGrid.innerHTML = ""
  productGrid.appendChild(fragment)
}

function createProductCard(product, index) {
  const card = utils.createElement("div", "product-card", {
    style: `animation-delay: ${index * 50}ms`,
    "data-product-id": product._id,
  })

  const inStock = product.stock || (product.stockCount && product.stockCount > 0)
  const stockBadge = inStock
    ? '<p class="stock in-stock">In Stock</p>'
    : '<p class="stock out-of-stock">Out of Stock</p>'

  card.innerHTML = `
    <div class="product-image-container">
      <div class="wishlist-icon" onclick="toggleWishlist(this, '${product._id}')" role="button" tabindex="0" aria-label="Add to wishlist">
        <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path class="heart" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 .81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78 -3.4 6.86 -8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <a href="${product.productPageUrl || "#"}" aria-label="View ${product.name} details">
        <img src="${product.image}" 
             alt="${product.name}" 
             loading="lazy">
      </a>
    </div>
    <div class="product-details">
      <a href="${product.productPageUrl || "#"}">
        <h4>${product.name}</h4>
      </a>
      <div class="hover-buttons">
        <button class="quick-view" 
                onclick="toggleQuickView(${JSON.stringify(product).replace(/"/g, "&quot;")})"
                aria-label="Quick view ${product.name}">
          Quick View
        </button>
        <button class="compare" 
                onclick="addToCompare('${product._id}')"
                aria-label="Compare ${product.name}">
          Compare
        </button>
      </div>
      <p class="price">${utils.formatPrice(product.price)}</p>
      ${stockBadge}
    </div>
  `

  return card
}

function updatePagination() {
  const elements = {
    pageInfo: document.getElementById("pageInfo"),
    prevPageBtn: document.getElementById("prevPage"),
    nextPageBtn: document.getElementById("nextPage"),
  }

  if (elements.pageInfo) elements.pageInfo.textContent = `Page ${state.currentPage} of ${state.totalPages}`
  if (elements.prevPageBtn) {
    elements.prevPageBtn.disabled = state.currentPage <= 1
    elements.prevPageBtn.setAttribute("aria-disabled", state.currentPage <= 1)
  }
  if (elements.nextPageBtn) {
    elements.nextPageBtn.disabled = state.currentPage >= state.totalPages
    elements.nextPageBtn.setAttribute("aria-disabled", state.currentPage >= state.totalPages)
  }
}

function showLoadingState() {
  const loadingScreen = document.querySelector(".loading-screen")
  if (loadingScreen) loadingScreen.style.display = "flex"
}

function removeLoadingState() {
  const loadingScreen = document.querySelector(".loading-screen")
  if (loadingScreen) loadingScreen.style.display = "none"
}

function showError(message) {
  const errorContainer = document.getElementById("errorContainer") || createErrorContainer()
  if (errorContainer) {
    errorContainer.textContent = message
    errorContainer.style.display = "block"
  }
}

function hideError() {
  const errorContainer = document.getElementById("errorContainer")
  if (errorContainer) {
    errorContainer.style.display = "none"
  }
}

function createErrorContainer() {
  const container = document.createElement("div")
  container.id = "errorContainer"
  container.className = "error-container"
  document.querySelector(".product-container")?.prepend(container)
  return container
}

// Setup event listeners for filters
function setupFilterEventListeners() {
  // Pagination
  document.getElementById("prevPage")?.addEventListener("click", () => handlePageChange(state.currentPage - 1))
  document.getElementById("nextPage")?.addEventListener("click", () => handlePageChange(state.currentPage + 1))

  // Select filters
  const selectFilters = document.querySelectorAll(".filters select")
  selectFilters.forEach((select) => {
    select.addEventListener("change", handleFilterChange)
  })

  // Price range inputs
  const priceInputs = document.querySelectorAll("#priceRangeFrom, #priceRangeTo")
  priceInputs.forEach((input) => {
    input.addEventListener("input", utils.debounce(handleFilterChange, CONFIG.DEBOUNCE_DELAY))
  })

  // Dial color checkboxes
  const dialColorCheckboxes = document.querySelectorAll(".dial-color")
  dialColorCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", handleFilterChange)
  })

  // Sort options
  const sortButtons = document.querySelectorAll(".sort-options button")
  sortButtons.forEach((button) => {
    button.addEventListener("click", handleSortChange)
  })

  // Search input
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", utils.debounce(handleSearchInput, CONFIG.DEBOUNCE_DELAY))
  }
}

// Event handlers
function handlePageChange(newPage) {
  if (newPage < 1 || newPage > state.totalPages || newPage === state.currentPage) return
  state.currentPage = newPage
  updateURLParams({ page: newPage })
  loadProducts()
}

function handleFilterChange(event) {
  // Reset to page 1 when filters change
  state.currentPage = 1

  // Collect all filter values
  const filters = {}

  // Select elements
  document.querySelectorAll(".filters select").forEach((select) => {
    if (select.id === "collection") {
      // Always include collection value
      filters[select.id] = select.value
    } else if (select.value && select.value !== "All") {
      filters[select.id] = select.value
    }
  })

  // Price range
  const priceFrom = document.getElementById("priceRangeFrom")?.value
  const priceTo = document.getElementById("priceRangeTo")?.value
  if (priceFrom && priceFrom !== "") filters.priceFrom = priceFrom
  if (priceTo && priceTo !== "") filters.priceTo = priceTo

  // Dial colors (checkboxes)
  const selectedColors = []
  document.querySelectorAll(".dial-color:checked").forEach((checkbox) => {
    if (checkbox.value !== "All") {
      selectedColors.push(checkbox.value)
    }
  })
  if (selectedColors.length > 0) {
    filters.dialColor = selectedColors.join(",")
  }

  // Update state
  state.currentFilters = filters

  // Load products with new filters
  loadProducts()
}

function handleSortChange(event) {
  const sortValue = event.target.getAttribute("data-sort")
  if (!sortValue) return

  // Update active button styling
  document.querySelectorAll(".sort-options button").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  // Update state
  state.sortOrder = sortValue

  // Update URL and load products
  updateURLParams({ sort: sortValue })
  loadProducts()
}

function handleSearchInput(event) {
  const searchQuery = event.target.value.trim()
  state.searchQuery = searchQuery
  state.currentPage = 1

  // Update URL
  updateURLParams({
    search: searchQuery || undefined,
    page: 1,
  })

  // Load products with search query
  loadProducts()
}

function updateURLParams(params) {
  // This function is no longer needed as we're not updating URL parameters
  return;
}

// Clear all filters
function clearFilters() {
  // Store current collection
  const collectionSelect = document.getElementById("collection")
  const currentCollectionValue = collectionSelect?.value

  // Determine if we're on a collection page
  const isCollectionPage = window.location.pathname.includes('/collections/')

  // Reset all select elements except collection on collection page
  document.querySelectorAll(".filters select").forEach((select) => {
    if (isCollectionPage && select.id === "collection") {
      // Keep collection value on collection page
      return
    }
    select.value = "All"
  })

  // Reset price range
  document.getElementById("priceRangeFrom").value = ""
  document.getElementById("priceRangeTo").value = ""

  // Uncheck all dial color checkboxes
  document.querySelectorAll(".dial-color").forEach((checkbox) => {
    checkbox.checked = false
  })

  // Reset search
  const searchInput = document.getElementById("searchInput")
  if (searchInput) searchInput.value = ""

  // Reset state but keep collection on collection page
  state.currentFilters = {}
  
  if (isCollectionPage && currentCollectionValue) {
    state.currentFilters.collection = currentCollectionValue
  }
  
  state.searchQuery = ""
  state.currentPage = 1
  state.sortOrder = "default"

  // Reset sort buttons
  document.querySelectorAll(".sort-options button").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector('.sort-options button[data-sort="default"]')?.classList.add("active")

  // Restore collection select value if it was changed
  if (isCollectionPage && collectionSelect && currentCollectionValue) {
    collectionSelect.value = currentCollectionValue
  }

  // Ensure collection is preserved in the state
  if (isCollectionPage && state.currentCollection) {
    state.currentCollection = state.currentCollection
  }

  loadProducts()
}

// Open/close filter panel
function openFilterPanel() {
  document.getElementById("filterPanel").classList.add("open")
  document.getElementById("overlay").classList.add("active")
}

function closeFilterPanel() {
  document.getElementById("filterPanel").classList.remove("open")
  document.getElementById("overlay").classList.remove("active")
}

function createModal(title, content, buttons = []) {
  // Create modal elements
  const modalOverlay = document.createElement("div")
  modalOverlay.className = "modal-overlay"

  const modalContainer = document.createElement("div")
  modalContainer.className = "modal-container"

  // Modal header
  const modalHeader = document.createElement("div")
  modalHeader.className = "modal-header"

  const titleElement = document.createElement("h3")
  titleElement.textContent = title

  const closeButton = document.createElement("span")
  closeButton.className = "close-modal"
  closeButton.innerHTML = "&times;"
  closeButton.addEventListener("click", () => closeModal(modalOverlay))

  modalHeader.appendChild(titleElement)
  modalHeader.appendChild(closeButton)

  // Modal body
  const modalBody = document.createElement("div")
  modalBody.className = "modal-body"
  modalBody.innerHTML = content

  // Modal footer
  const modalFooter = document.createElement("div")
  modalFooter.className = "modal-footer"

  // Add buttons
  buttons.forEach((button) => {
    const btn = document.createElement("button")
    btn.className = button.class || "modal-btn"
    btn.textContent = button.text
    btn.addEventListener("click", (e) => {
      if (button.clickHandler) {
        button.clickHandler(e)
      }
    })
    modalFooter.appendChild(btn)
  })

  // Assemble modal
  modalContainer.appendChild(modalHeader)
  modalContainer.appendChild(modalBody)
  modalContainer.appendChild(modalFooter)
  modalOverlay.appendChild(modalContainer)

  // Add to DOM
  document.body.appendChild(modalOverlay)

  // Show modal with animation
  setTimeout(() => {
    modalOverlay.classList.add("show")
  }, 2000)

  // Close when clicking outside
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal(modalOverlay)
    }
  })

  return modalOverlay
}

function closeModal(modal) {
  if (!modal) return

  modal.classList.remove("show")
  setTimeout(() => {
    modal.remove()
  }, 300)
}

// Handle browser back/forward
window.addEventListener("popstate", () => {
  // Reset to page 1 and load products
  state.currentPage = 1
  loadProducts()
})
