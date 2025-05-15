// Constants and Configuration
const CONFIG = {
  API_BASE_URL: "http://localhost:3001/api",
  ITEMS_PER_PAGE: 10,
  DEBOUNCE_DELAY: 300,
  LAZY_LOAD_THRESHOLD: 0.5,
}

// State Management
const state = {
  currentPage: 1,
  totalPages: 1,
  products: [],
  currentEntity: null, // Can be either collection or brand
  allItems: [],
  filteredItems: [],
  currentFilters: {},
  isLoading: false,
  error: null,
  sortOrder: "default",
  searchQuery: "",
  pageType: null, // 'collection' or 'brand'
}

// Helper functions for normalizing names
function normalizeCollectionName(name) {
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

function normalizeBrandName(name) {
  const brandNameMap = {
      "rolex": "Rolex",
      "omega": "Omega",
      "cartier": "Cartier",
      "patek-philippe": "Patek Philippe",
      "patek": "Patek Philippe",
      "audemars-piguet": "Audemars Piguet",
      "ap": "Audemars Piguet",
      "a-lange-sohne": "A.Lange & Söhne",
      "lange": "A.Lange & Söhne",
      "A.lange ": "A.Lange & Söhne",
      "vacheron-constantin": "Vacheron Constantin",
      "vc": "Vacheron Constantin",
      "jacob-co": "Jacob & Co",
      "Jacob ": "Jacob & Co",
      "richard-mille": "Richard Mille",
      "rm": "Richard Mille",
      "breitling": "Breitling"
  }
  return brandNameMap[name] || name
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

// URL extraction functions
function extractCollectionFromURL() {
  const pathParts = window.location.pathname.split("/")
  const collectionsIndex = pathParts.indexOf("collections")

  if (collectionsIndex > -1 && collectionsIndex < pathParts.length - 1) {
    return pathParts[collectionsIndex + 1]
  }

  const urlParams = new URLSearchParams(window.location.search)
  const queryCollection = urlParams.get("collection")
  if (queryCollection) return queryCollection

  const lastPart = pathParts[pathParts.length - 1].replace(".html", "")
  if (lastPart && !["Collection-Page", "collections"].includes(lastPart)) {
    return lastPart
  }

  console.log("No collection specified in URL, defaulting to Classic & Dress")
  return "classic-dress"
}

function extractBrandFromURL() {
  const pathParts = window.location.pathname.split("/")
  const brandsIndex = pathParts.indexOf("brands")

  if (brandsIndex > -1 && brandsIndex < pathParts.length - 1) {
    return pathParts[brandsIndex + 1]
  }

  const urlParams = new URLSearchParams(window.location.search)
  const queryBrand = urlParams.get("brand")
  if (queryBrand) return queryBrand

  const lastPart = pathParts[pathParts.length - 1].replace(".html", "")
  if (lastPart && !["Brand-Page", "brands"].includes(lastPart)) {
    return lastPart
  }

  console.log("No brand specified in URL, defaulting to Rolex")
  return "rolex"
}

// Entity-specific filter functions
function updateCollectionFilter(currentCollection) {
  const collectionSelect = document.getElementById("collection")
  if (!collectionSelect) return

  const optionsToKeep = currentCollection
  const optionsArray = Array.from(collectionSelect.options)

  collectionSelect.innerHTML = ""

  optionsArray.forEach((option) => {
    if (optionsToKeep.includes(option.value)) {
      collectionSelect.appendChild(option)
    }
  })

  collectionSelect.value = currentCollection
}

function updateBrandFilter(currentBrand) {
  const brandSelect = document.getElementById("brand")
  if (!brandSelect) return

  const optionsToKeep = currentBrand
  const optionsArray = Array.from(brandSelect.options)

  brandSelect.innerHTML = ""

  optionsArray.forEach((option) => {
    if (optionsToKeep.includes(option.value)) {
      brandSelect.appendChild(option)
    }
  })

  brandSelect.value = currentBrand
}

// Entity-specific page update functions
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

  state.currentEntity = collectionData.name

  // Update text overlay
  const collectionHeader = document.getElementById("collectionHeader")
  const collectionDescription = document.getElementById("collectionDescription")

  if (collectionHeader) collectionHeader.textContent = collectionData.header || "Premium Collection"
  if (collectionDescription)
    collectionDescription.textContent = collectionData.description || "Discover our exquisite collection of timepieces."

  // Update collection filter in the filter panel to match current collection
  const collectionSelect = document.getElementById("collection")
  if (collectionSelect) {
    let optionExists = false
    for (let i = 0; i < collectionSelect.options.length; i++) {
      if (collectionSelect.options[i].value === collectionData.name) {
        collectionSelect.options[i].selected = true
        optionExists = true
        break
      }
    }

    if (!optionExists) {
      const option = document.createElement("option")
      option.value = collectionData.name
      option.textContent = collectionData.name
      option.selected = true
      collectionSelect.appendChild(option)
    }
  }
}

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
  }

  // Update brand Name
  const brandLogo = document.getElementById("brandLogo")
  if (brandLogo && brandData.name) {
    brandLogo.textContent = brandData.name
  }

  state.currentEntity = brandData.name

  // Update text overlay
  const brandHeader = document.getElementById("brandHeader")
  const brandDescription = document.getElementById("brandDescription")

  if (brandHeader) brandHeader.textContent = brandData.header || "Premium Brand"
  if (brandDescription)
    brandDescription.textContent = brandData.description || "Discover our exquisite collection of timepieces."

  // Update brand filter in the filter panel to match current brand
  const brandSelect = document.getElementById("brand")
  if (brandSelect) {
    let optionExists = false
    for (let i = 0; i < brandSelect.options.length; i++) {
      if (brandSelect.options[i].value === brandData.name) {
        brandSelect.options[i].selected = true
        optionExists = true
        break
      }
    }

    if (!optionExists) {
      const option = document.createElement("option")
      option.value = brandData.name
      option.textContent = brandData.name
      option.selected = true
      brandSelect.appendChild(option)
    }
  }
}

// Shared functions
function updatePageMetadata(entityData) {
  // Update document title
  document.title = `Vaultique | ${entityData.name}`
  
  // Update meta description if needed
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.content = entityData.description || 
      (state.pageType === 'collection' 
        ? `Explore ${entityData.name} watches collection at Vaultique` 
        : `Explore ${entityData.name} watches at Vaultique`)
  }
  
  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]')
  if (canonicalLink) {
    const urlPath = state.pageType === 'collection' 
      ? `/collections/${entityData.name.toLowerCase().replace(/\s+/g, "-")}`
      : `/brands/${entityData.name.toLowerCase().replace(/\s+/g, "-")}`
    canonicalLink.href = window.location.origin + urlPath
  }
}

function initSlider(featuredItems) {
  if (!featuredItems || featuredItems.length === 0) {
    console.warn(`No featured items found for this ${state.pageType}`)
    const sliderContainer = document.querySelector(".slider-container")
    if (sliderContainer) {
      sliderContainer.style.display = "none"
    }
    return
  }

  const slidesWrapper = document.querySelector(".slides-wrapper")
  const paginationSlider = document.querySelector(".pagination-slider")

  if (!slidesWrapper || !paginationSlider) {
    console.error("Slider elements not found in the DOM")
    return
  }

  console.log("Creating slider with", featuredItems.length, "items")

  // Clear existing content
  slidesWrapper.innerHTML = ""
  paginationSlider.innerHTML = ""

  // Create slides
  featuredItems.forEach((item, index) => {
    if (!item || !item.name) {
      console.warn("Invalid item data at index", index)
      return
    }

    const slide = document.createElement("div")
    slide.className = `slide ${index === 0 ? "active" : ""}`
    slide.dataset.model = index + 1

    slide.innerHTML = `
      <div class="slide-content">
        <div class="watch-info">
          <h1 class="watch-title">${item.name || 'Untitled'}</h1>
          <h2 class="watch-tagline">${item.tagline || ''}</h2>
          <p class="watch-description">${item.description || ''}</p>
        </div>
        <div class="watch-image-container">
          <img src="${item.image || ''}" alt="${item.name || 'Watch image'}" class="watch-image" onerror="this.src='path/to/fallback-image.jpg'">
        </div>
      </div>
    `

    slidesWrapper.appendChild(slide)
  })

  // Only create pagination if we have valid slides
  if (slidesWrapper.children.length > 0) {
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
  } else {
    console.warn("No valid slides were created")
    const sliderContainer = document.querySelector(".slider-container")
    if (sliderContainer) {
      sliderContainer.style.display = "none"
    }
  }
}

async function loadProducts() {
  if (!state.currentEntity) return

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

    // Add entity-specific filter
    if (state.currentEntity._id) {
      const filterKey = state.pageType === 'collection' ? 'Vcollection' : 'brand'
      queryParams.append(filterKey, state.currentEntity._id)
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
    const noProductsText = state.pageType === 'collection' 
      ? 'No products found for this collection.' 
      : 'No products found for this brand.'
    productGrid.innerHTML = `<div class="no-products">${noProductsText}</div>`
    return
  }

  productGrid.innerHTML = ""
  products.forEach(product => {
    const card = document.createElement('div')
    card.className = 'product-card'
    card.setAttribute('data-product', JSON.stringify(product).replace(/'/g, "&apos;"))
    productGrid.appendChild(card)
  })
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
    const isEntityFilter = (state.pageType === 'collection' && select.id === "collection") || 
                          (state.pageType === 'brand' && select.id === "brand")
    
    if (isEntityFilter) {
      // Always include entity value
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
  // Store current entity
  const entitySelect = document.getElementById(state.pageType === 'collection' ? "collection" : "brand")
  const currentEntityValue = entitySelect?.value

  // Reset all select elements except entity on entity page
  document.querySelectorAll(".filters select").forEach((select) => {
    const isEntitySelect = (state.pageType === 'collection' && select.id === "collection") || 
                          (state.pageType === 'brand' && select.id === "brand")
    
    if (isEntitySelect) {
      // Keep entity value on entity page
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

  // Reset state but keep entity on entity page
  state.currentFilters = {}
  
  if (currentEntityValue) {
    state.currentFilters[state.pageType === 'collection' ? 'collection' : 'brand'] = currentEntityValue
  }
  
  state.searchQuery = ""
  state.currentPage = 1
  state.sortOrder = "default"

  // Reset sort buttons
  document.querySelectorAll(".sort-options button").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector('.sort-options button[data-sort="default"]')?.classList.add("active")

  // Restore entity select value if it was changed
  if (entitySelect && currentEntityValue) {
    entitySelect.value = currentEntityValue
  }

  // Ensure entity is preserved in the state
  if (state.currentEntity) {
    state.currentEntity = state.currentEntity
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

// Main initialization function
async function initializePage() {
  console.log("Page script starting...")
  console.log("Current URL:", window.location.href)
  console.log("Current pathname:", window.location.pathname)

  try {
    // Determine page type (collection or brand)
    const isCollectionPage = window.location.pathname.includes('/collections/')
    const isBrandPage = window.location.pathname.includes('/brands/')
    
    if (isCollectionPage) {
      state.pageType = 'collection'
    } else if (isBrandPage) {
      state.pageType = 'brand'
    } else {
      throw new Error('Unknown page type')
    }

    // Get entity name from URL
    const entityName = state.pageType === 'collection' 
      ? extractCollectionFromURL() 
      : extractBrandFromURL()

    // Normalize the entity name
    const normalizedEntityName = state.pageType === 'collection'
      ? normalizeCollectionName(entityName)
      : normalizeBrandName(entityName)

    // Initialize page number from URL if present
    const urlParams = new URLSearchParams(window.location.search)
    state.currentPage = Number.parseInt(urlParams.get("page")) || 1
    state.sortOrder = urlParams.get("sort") || "default"

    // Update entity filter
    if (state.pageType === 'collection') {
      updateCollectionFilter(normalizedEntityName)
    } else {
      updateBrandFilter(normalizedEntityName)
    }

    // Debugging information
    console.group(`${state.pageType.charAt(0).toUpperCase() + state.pageType.slice(1)} Page Loading`)
    console.log("URL:", window.location.href)
    console.log("Extracted entity:", entityName)
    console.log("Normalized entity:", normalizedEntityName)

    // Fetch entity data with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const apiUrl = `${CONFIG.API_BASE_URL}/${state.pageType}s/name/${encodeURIComponent(normalizedEntityName)}`
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

    const entityData = result.data
    console.log("Entity data:", entityData)
    console.groupEnd()

    // Store entity data in state
    state.currentEntity = entityData

    // Update page content
    if (state.pageType === 'collection') {
      updateCollectionPage(entityData)
    } else {
      updateBrandPage(entityData)
    }

    // Initialize slider if featured items exist
    const featuredItems = state.pageType === 'collection' 
      ? entityData.featuredItems 
      : entityData.featuredModels
    
    if (featuredItems?.length > 0) {
      initSlider(featuredItems)
    } else {
      console.warn(`No featured items for ${state.pageType}:`, normalizedEntityName)
      document.querySelector(".slider-container")?.classList.add("hidden")
    }

    // Update page metadata
    updatePageMetadata(entityData)

    // Load initial products
    await loadProducts()

    // Setup event listeners for filters
    setupFilterEventListeners()
  } catch (error) {
    console.error('Page error:', error)
    
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

    // Fallback to default entity if this wasn't already the default
    if (state.pageType === 'collection' && normalizedEntityName !== "Classic & Dress Collection") {
      console.log("Attempting fallback to Classic & Dress Collection...")
      window.location.href = "/collections/classic-dress"
    } else if (state.pageType === 'brand' && normalizedEntityName !== "Rolex") {
      console.log("Attempting fallback to Rolex...")
      window.location.href = "/brands/rolex"
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePage)