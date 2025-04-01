// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements - Navbar
    const sideIcon = document.getElementById("side-icon")
    const closebtn = document.getElementById("closebtn")
    const mySidepanel = document.getElementById("mySidepanel")
    const searchButton = document.getElementById("search-button")
    const searchButton2 = document.getElementById("search-button2")
    const searchField = document.getElementById("searchField")
    const searchField2 = document.getElementById("searchField2")
    const search = document.getElementById("search")
    const search2 = document.getElementById("search2")
    const searchExtension = document.getElementById("search-extension")
    const exitSearchExtensionButton = document.getElementById("exit-search-extension-button")
    const collectionsAnchorWithExtension = document.getElementById("collections-anchor-with-extension")
    const headerBottomAnchorExtension = document.getElementById("header-bottom-anchor-extension")
  
    // DOM Elements - Watch Configurator
    const themeToggle = document.getElementById("theme-toggle")
    const moonIcon = document.getElementById("moon-icon")
    const sunIcon = document.getElementById("sun-icon")
    const favoriteToggle = document.getElementById("favorite-toggle")
    const favoriteIcon = favoriteToggle ? favoriteToggle.querySelector("svg") : null
    const tabTriggers = document.querySelectorAll(".tab-trigger")
    const tabContents = document.querySelectorAll(".tab-content")
    const dialInputs = document.querySelectorAll('input[name="dial"]')
    const braceletInputs = document.querySelectorAll('input[name="bracelet"]')
    const materialInputs = document.querySelectorAll('input[name="material"]')
    const bezelInputs = document.querySelectorAll('input[name="bezel"]')
    const summaryDial = document.getElementById("summary-dial")
    const summaryBracelet = document.getElementById("summary-bracelet")
    const summaryMaterial = document.getElementById("summary-material")
    const summaryBezel = document.getElementById("summary-bezel")
    const summaryPrice = document.getElementById("summary-price")
    const currentYear = document.getElementById("current-year")
  
    // Set current year in footer
    if (currentYear) {
      currentYear.textContent = new Date().getFullYear()
    }
  
    // Navbar functionality
    if (sideIcon) {
      sideIcon.addEventListener("click", () => {
        mySidepanel.style.width = "250px"
      })
    }
  
    if (closebtn) {
      closebtn.addEventListener("click", () => {
        mySidepanel.style.width = "0"
      })
    }
  
    if (searchButton) {
      searchButton.addEventListener("click", () => {
        searchExtension.style.display = "flex"
      })
    }
  
    if (searchButton2) {
      searchButton2.addEventListener("click", () => {
        searchExtension.style.display = "flex"
      })
    }
  
    if (exitSearchExtensionButton) {
      exitSearchExtensionButton.addEventListener("click", () => {
        searchExtension.style.display = "none"
      })
    }
  
    if (collectionsAnchorWithExtension) {
      collectionsAnchorWithExtension.addEventListener("click", (e) => {
        e.preventDefault()
        if (headerBottomAnchorExtension.style.display === "none") {
          headerBottomAnchorExtension.style.display = "block"
        } else {
          headerBottomAnchorExtension.style.display = "none"
        }
      })
    }
  
    // Configuration state
    const config = {
      dial: "black",
      bracelet: "oyster",
      material: "steel",
      bezel: "black",
      basePrice: 10000,
      additionalCosts: {
        bracelet: {
          oyster: 0,
          jubilee: 500,
          leather: 800,
          oysterflex: 1200,
        },
        material: {
          steel: 0,
          "yellow-gold": 12000,
          "white-gold": 14000,
          everose: 16000,
        },
        bezel: {
          black: 0,
          blue: 500,
          green: 800,
          fluted: 2000,
        },
      },
    }
  
    // Theme toggle
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark")
  
        if (isDark) {
          if (moonIcon) moonIcon.classList.add("hidden")
          if (sunIcon) sunIcon.classList.remove("hidden")
          if (watchScene) {
            watchScene.background = new THREE.Color(0x1f1f1f)
          }
        } else {
          if (moonIcon) moonIcon.classList.remove("hidden")
          if (sunIcon) sunIcon.classList.add("hidden")
          if (watchScene) {
            watchScene.background = new THREE.Color(0xf5f5f5)
          }
        }
      })
    }
  
    // Favorite toggle
    if (favoriteToggle && favoriteIcon) {
      favoriteToggle.addEventListener("click", () => {
        favoriteIcon.classList.toggle("favorite-active")
      })
    }
  
    // Tab switching
    tabTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        // Remove active class from all triggers and contents
        tabTriggers.forEach((t) => {
          t.classList.remove("active")
        })
        tabContents.forEach((c) => {
          c.classList.remove("active")
        })
  
        // Add active class to clicked trigger and corresponding content
        trigger.classList.add("active")
        const tabId = trigger.getAttribute("data-tab")
        document.getElementById(`${tabId}-tab`).classList.add("active")
      })
    })
  
    // Update configuration and price when options change
    function updateConfiguration() {
      // Update summary text
      if (summaryDial) {
        const selectedDial = document.querySelector('input[name="dial"]:checked')
        if (selectedDial) {
          summaryDial.textContent = selectedDial.value.charAt(0).toUpperCase() + selectedDial.value.slice(1)
        }
      }
  
      if (summaryBracelet) {
        const selectedBracelet = document.querySelector('input[name="bracelet"]:checked')
        if (selectedBracelet) {
          summaryBracelet.textContent = selectedBracelet.value.charAt(0).toUpperCase() + selectedBracelet.value.slice(1)
        }
      }
  
      if (summaryMaterial) {
        const selectedMaterial = document.querySelector('input[name="material"]:checked')
        if (selectedMaterial) {
          let materialText = ""
          switch (selectedMaterial.value) {
            case "steel":
              materialText = "Oystersteel"
              break
            case "yellow-gold":
              materialText = "Yellow Gold"
              break
            case "white-gold":
              materialText = "White Gold"
              break
            case "everose":
              materialText = "Everose Gold"
              break
            default:
              materialText = selectedMaterial.value
          }
          summaryMaterial.textContent = materialText
        }
      }
  
      if (summaryBezel) {
        const selectedBezel = document.querySelector('input[name="bezel"]:checked')
        if (selectedBezel) {
          let bezelText = ""
          switch (selectedBezel.value) {
            case "black":
              bezelText = "Black Ceramic"
              break
            case "blue":
              bezelText = "Blue Ceramic"
              break
            case "green":
              bezelText = "Green Ceramic"
              break
            case "fluted":
              bezelText = "Fluted"
              break
            default:
              bezelText = selectedBezel.value
          }
          summaryBezel.textContent = bezelText
        }
      }
  
      // Calculate total price
      if (summaryPrice) {
        const selectedBracelet = document.querySelector('input[name="bracelet"]:checked')
        const selectedMaterial = document.querySelector('input[name="material"]:checked')
        const selectedBezel = document.querySelector('input[name="bezel"]:checked')
  
        if (selectedBracelet && selectedMaterial && selectedBezel) {
          const totalPrice =
            config.basePrice +
            config.additionalCosts.bracelet[selectedBracelet.value] +
            config.additionalCosts.material[selectedMaterial.value] +
            config.additionalCosts.bezel[selectedBezel.value]
  
          // Update price display
          summaryPrice.textContent = `$${totalPrice.toLocaleString()}`
        }
      }
  
      // Update 3D model
      updateWatchMaterials()
    }
  
    // Add event listeners to all option inputs
    dialInputs.forEach((input) => {
      input.addEventListener("change", () => {
        config.dial = input.value
        updateConfiguration()
      })
    })
  
    braceletInputs.forEach((input) => {
      input.addEventListener("change", () => {
        config.bracelet = input.value
        updateConfiguration()
      })
    })
  
    materialInputs.forEach((input) => {
      input.addEventListener("change", () => {
        config.material = input.value
        updateConfiguration()
      })
    })
  
    bezelInputs.forEach((input) => {
      input.addEventListener("change", () => {
        config.bezel = input.value
        updateConfiguration()
      })
    })
  
    // 3D Watch Viewer with Three.js
    let watchScene, watchCamera, watchRenderer, watchControls, watchModel
    const canvasContainer = document.getElementById("watch-canvas-container")
  
    // Initialize 3D scene
    function initWatchViewer() {
      if (!canvasContainer || !THREE) return
  
      // Create scene
      watchScene = new THREE.Scene()
      watchScene.background = document.documentElement.classList.contains("dark")
        ? new THREE.Color(0x1f1f1f)
        : new THREE.Color(0xf5f5f5)
  
      // Create camera
      const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight
      watchCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
      watchCamera.position.set(0, 0, 5)
  
      // Create renderer
      watchRenderer = new THREE.WebGLRenderer({ antialias: true })
      watchRenderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight)
      watchRenderer.setPixelRatio(window.devicePixelRatio)
      watchRenderer.shadowMap.enabled = true
      canvasContainer.appendChild(watchRenderer.domElement)
  
      // Add orbit controls
      watchControls = new THREE.OrbitControls(watchCamera, watchRenderer.domElement)
      watchControls.enableDamping = true
      watchControls.dampingFactor = 0.05
      watchControls.minDistance = 3
      watchControls.maxDistance = 10
  
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      watchScene.add(ambientLight)
  
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 5, 5)
      directionalLight.castShadow = true
      watchScene.add(directionalLight)
  
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
      directionalLight2.position.set(-5, -5, -5)
      watchScene.add(directionalLight2)
  
      // Create placeholder watch model
      createPlaceholderWatch()
  
      // Animation loop
      function animate() {
        requestAnimationFrame(animate)
        watchControls.update()
        watchRenderer.render(watchScene, watchCamera)
      }
      animate()
  
      // Handle window resize
      window.addEventListener("resize", () => {
        if (watchCamera && watchRenderer && canvasContainer) {
          watchCamera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight
          watchCamera.updateProjectionMatrix()
          watchRenderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight)
        }
      })
    }
  
    // Create a placeholder watch model
    function createPlaceholderWatch() {
      if (!watchScene || !THREE) return
  
      watchModel = new THREE.Group()
  
      // Watch case
      const caseGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32)
      const caseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 })
      const watchCase = new THREE.Mesh(caseGeometry, caseMaterial)
      watchModel.add(watchCase)
  
      // Watch face/dial
      const dialGeometry = new THREE.CircleGeometry(0.9, 32)
      const dialMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
      const watchDial = new THREE.Mesh(dialGeometry, dialMaterial)
      watchDial.position.set(0, 0.11, 0)
      watchDial.rotation.x = -Math.PI / 2
      watchModel.add(watchDial)
  
      // Watch hands
      const hourHandGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.02)
      const hourHandMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
      const hourHand = new THREE.Mesh(hourHandGeometry, hourHandMaterial)
      hourHand.position.set(0, 0.12, 0)
      hourHand.rotation.x = -Math.PI / 2
      watchModel.add(hourHand)
  
      const minuteHandGeometry = new THREE.BoxGeometry(0.03, 0.6, 0.02)
      const minuteHandMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
      const minuteHand = new THREE.Mesh(minuteHandGeometry, minuteHandMaterial)
      minuteHand.position.set(0, 0.13, 0)
      minuteHand.rotation.x = -Math.PI / 2
      minuteHand.rotation.z = Math.PI / 4
      watchModel.add(minuteHand)
  
      // Watch bracelet
      const braceletGeometry = new THREE.BoxGeometry(0.4, 0.1, 2)
      const braceletMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 })
      const braceletTop = new THREE.Mesh(braceletGeometry, braceletMaterial)
      braceletTop.position.set(0, 0, -1.1)
      watchModel.add(braceletTop)
  
      const braceletBottom = new THREE.Mesh(braceletGeometry, braceletMaterial)
      braceletBottom.position.set(0, 0, 1.1)
      watchModel.add(braceletBottom)
  
      // Watch bezel
      const bezelGeometry = new THREE.TorusGeometry(1, 0.1, 16, 32)
      const bezelMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
      const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial)
      bezel.rotation.x = Math.PI / 2
      bezel.position.y = 0.1
      watchModel.add(bezel)
  
      watchScene.add(watchModel)
  
      // Apply initial materials
      updateWatchMaterials()
    }
  
    // Update watch materials based on configuration
    function updateWatchMaterials() {
      if (!watchModel || !THREE) return
  
      // Get all meshes in the watch model
      const meshes = []
      watchModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshes.push(child)
        }
      })
  
      // Update case and bracelet material based on selection
      let caseMaterialColor = 0x888888 // Default steel color
      if (config.material === "yellow-gold") caseMaterialColor = 0xffd700
      if (config.material === "white-gold") caseMaterialColor = 0xe0e0e0
      if (config.material === "everose") caseMaterialColor = 0xe0a684
  
      // Update dial color based on selection
      let dialColor = 0x000000 // Default black
      if (config.dial === "blue") dialColor = 0x0047ab
      if (config.dial === "green") dialColor = 0x006400
      if (config.dial === "silver") dialColor = 0xc0c0c0
  
      // Update bezel color based on selection
      let bezelColor = 0x000000 // Default black
      if (config.bezel === "blue") bezelColor = 0x0047ab
      if (config.bezel === "green") bezelColor = 0x006400
      if (config.bezel === "fluted") bezelColor = config.material === "yellow-gold" ? 0xffd700 : 0xc0c0c0
  
      // Apply materials to the appropriate parts
      meshes.forEach((mesh) => {
        if (mesh.geometry instanceof THREE.CylinderGeometry) {
          // This is the watch case
          mesh.material.color.set(caseMaterialColor)
        } else if (mesh.geometry instanceof THREE.CircleGeometry) {
          // This is the watch dial
          mesh.material.color.set(dialColor)
        } else if (
          mesh.geometry instanceof THREE.BoxGeometry &&
          (mesh.geometry.parameters.width === 0.4 || mesh.geometry.parameters.depth === 2)
        ) {
          // This is the bracelet
          let braceletColor = caseMaterialColor
          if (config.bracelet === "leather") braceletColor = 0x5c4033
          if (config.bracelet === "oysterflex") braceletColor = 0x000000
          mesh.material.color.set(braceletColor)
        } else if (mesh.geometry instanceof THREE.TorusGeometry) {
          // This is the bezel
          mesh.material.color.set(bezelColor)
        }
      })
    }
  
    // Initialize everything when the DOM is loaded
    if (typeof THREE === "undefined") {
      console.error("THREE.js is not loaded!")
      return
    }
  
    if (canvasContainer) {
      initWatchViewer()
    }
  
    updateConfiguration()
  
    // Scroll event for navbar
    window.addEventListener("scroll", () => {
      const header = document.querySelector("header")
      if (header) {
        if (window.scrollY > 50) {
          header.classList.remove("header-unscrolled")
          header.classList.add("header-scrolled")
        } else {
          header.classList.remove("header-scrolled")
          header.classList.add("header-unscrolled")
        }
      }
    })
  })
  
  