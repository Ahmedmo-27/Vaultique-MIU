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
  currentBrand: null,
  allItems: [],
  filteredItems: [],
  currentFilters: {},
  isLoading: false,
  error: null,
  sortOrder: "default",
  searchQuery: "",
}

// Helper function to normalize brand names
function normalizeBrandName(name) {
  // Convert URL-friendly names back to database names
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

// Update the DOMContentLoaded event handler
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Brand page script starting...")
  console.log("Current URL:", window.location.href)
  console.log("Current pathname:", window.location.pathname)

  try {
    // Get brand name from URL with multiple fallback methods
    const brandName = extractBrandFromURL()

    // Normalize the brand name (convert URL-friendly format to database format)
    const normalizedBrandName = normalizeBrandName(brandName)

    // Initialize page number from URL if present
    const urlParams = new URLSearchParams(window.location.search)
    state.currentPage = Number.parseInt(urlParams.get("page")) || 1
    state.sortOrder = urlParams.get("sort") || "default"

    // Update brand filter
    updateBrandFilter(normalizedBrandName)

    // Debugging information
    console.group("Brand Page Loading")
    console.log("URL:", window.location.href)
    console.log("Extracted brand:", brandName)
    console.log("Normalized brand:", normalizedBrandName)

    // Fetch brand data with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const apiUrl = `${CONFIG.API_BASE_URL}/brands/name/${encodeURIComponent(normalizedBrandName)}`
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

    const brandData = result.data
    console.log("Brand data:", brandData)
    console.groupEnd()

    // Store brand data in state
    state.currentBrand = brandData

    // Update page content
    updateBrandPage(brandData)

    // Initialize slider if models exist
    if (brandData.featuredModels?.length > 0) {
      initSlider(brandData.featuredModels)
    } else {
      console.warn("No featured models for brand:", normalizedBrandName)
      document.querySelector(".slider-container")?.classList.add("hidden")
    }

    // Update page metadata
    updatePageMetadata(brandData)

    // Load initial products
    await loadProducts()

    // Setup event listeners for filters
    setupFilterEventListeners()
  } catch (error) {
    console.error('Brand page error:', error)
    
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

    // Fallback to default brand if this wasn't already the default
    if (normalizedBrandName !== "Rolex") {
      console.log("Attempting fallback to Rolex...")
      window.location.href = "/brands/rolex"
    }
  }
})

function extractBrandFromURL() {
  // Try pathname first (e.g., /brands/rolex)
  const pathParts = window.location.pathname.split("/")
  const brandsIndex = pathParts.indexOf("brands")

  if (brandsIndex > -1 && brandsIndex < pathParts.length - 1) {
    return pathParts[brandsIndex + 1]
  }

  // Try query parameter (e.g., ?brand=rolex)
  const urlParams = new URLSearchParams(window.location.search)
  const queryBrand = urlParams.get("brand")
  if (queryBrand) return queryBrand

  // Try last path part (legacy support)
  const lastPart = pathParts[pathParts.length - 1].replace(".html", "")
  if (lastPart && !["Brand-Page", "brands"].includes(lastPart)) {
    return lastPart
  }

  console.log("No brand specified in URL, defaulting to Rolex")
  return "rolex"
}

async function parseErrorResponse(response) {
  try {
    const errorText = await response.text()
    return JSON.parse(errorText)
  } catch {
    return { message: await response.text() }
  }
}

function updatePageMetadata(brandData) {
  // Update document title
  document.title = `Vaultique | ${brandData.name}`

  // Update meta description if needed
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.content = brandData.description || `Explore ${brandData.name} watches at Vaultique`
  }

  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]')
  if (canonicalLink) {
    canonicalLink.href =
      window.location.origin + `/brands/${brandData.name.toLowerCase().replace(/\s+/g, "-")}`
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

  state.currentBrand = brandData.name

  // Update text overlay
  const brandHeader = document.getElementById("brandHeader")
  const brandDescription = document.getElementById("brandDescription")

  if (brandHeader) brandHeader.textContent = brandData.header || "Premium Brand"
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

function initSlider(featuredItems) {
  if (!featuredItems || featuredItems.length === 0) {
    console.warn("No featured items found for this brand")
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

function updateBrandFilter(currentBrand) {
  const brandSelect = document.getElementById("brand")
  if (!brandSelect) return

  // Keep only the current brand and "All" option
  const optionsToKeep = currentBrand
  const optionsArray = Array.from(brandSelect.options)

  // Clear all options
  brandSelect.innerHTML = ""

  // Re-add only the options we want to keep
  optionsArray.forEach((option) => {
    if (optionsToKeep.includes(option.value)) {
      brandSelect.appendChild(option)
    }
  })

  // Set the selected brand
  brandSelect.value = currentBrand
}

// Product Loading and Filtering Functions
async function loadProducts() {
  if (!state.currentBrand) return

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

    // Add brand filter - handle both object and string values
    if (typeof state.currentBrand === 'object' && state.currentBrand._id) {
      // If it's an object with _id property
      queryParams.append("brand", state.currentBrand._id)
    } else if (typeof state.currentBrand === 'string') {
      // If it's a string (the brand name)
      queryParams.append("brand", state.currentBrand)
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
    productGrid.innerHTML = '<div class="no-products">No products found for this brand.</div>'
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
    if (select.id === "brand") {
      // Always include brand value
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
  // Store current brand
  const brandSelect = document.getElementById("brand")
  const currentBrandValue = brandSelect?.value

  // Determine if we're on a brand page
  const isBrandPage = window.location.pathname.includes('/brands/')

  // Reset all select elements except brand on brand page
  document.querySelectorAll(".filters select").forEach((select) => {
    if (isBrandPage && select.id === "brand") {
      // Keep brand value on brand page
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

  // Reset state but keep brand on brand page
  state.currentFilters = {}
  
  if (isBrandPage && currentBrandValue) {
    state.currentFilters.brand = currentBrandValue
  }
  
  state.searchQuery = ""
  state.currentPage = 1
  state.sortOrder = "default"

  // Reset sort buttons
  document.querySelectorAll(".sort-options button").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector('.sort-options button[data-sort="default"]')?.classList.add("active")

  // Restore brand select value if it was changed
  if (isBrandPage && brandSelect && currentBrandValue) {
    brandSelect.value = currentBrandValue
  }

  // Ensure brand is preserved in the state
  if (isBrandPage && state.currentBrand) {
    state.currentBrand = state.currentBrand
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
