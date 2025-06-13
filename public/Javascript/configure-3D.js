// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Navbar
  const sideIcon = document.getElementById('side-icon');
  const closebtn = document.getElementById('closebtn');
  const mySidepanel = document.getElementById('mySidepanel');
  const searchButton = document.getElementById('search-button');
  const searchButton2 = document.getElementById('search-button2');
  const searchField = document.getElementById('searchField');
  const searchField2 = document.getElementById('searchField2');
  const search = document.getElementById('search');
  const search2 = document.getElementById('search2');
  const searchExtension = document.getElementById('search-extension');
  const exitSearchExtensionButton = document.getElementById('exit-search-extension-button');
  const collectionsAnchorWithExtension = document.getElementById(
    'collections-anchor-with-extension'
  );
  const headerBottomAnchorExtension = document.getElementById('header-bottom-anchor-extension');

  // DOM Elements - Watch Configurator
  const themeToggle = document.getElementById('theme-toggle');
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon = document.getElementById('sun-icon');
  const favoriteToggle = document.getElementById('favorite-toggle');
  const favoriteIcon = favoriteToggle ? favoriteToggle.querySelector('svg') : null;
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const tabContents = document.querySelectorAll('.tab-content');
  const dialInputs = document.querySelectorAll('input[name="dial"]');
  const braceletInputs = document.querySelectorAll('input[name="bracelet"]');
  const materialInputs = document.querySelectorAll('input[name="material"]');
  const bezelInputs = document.querySelectorAll('input[name="bezel"]');
  const summaryDial = document.getElementById('summary-dial');
  const summaryBracelet = document.getElementById('summary-bracelet');
  const summaryMaterial = document.getElementById('summary-material');
  const summaryBezel = document.getElementById('summary-bezel');
  const summaryPrice = document.getElementById('summary-price');
  const currentYear = document.getElementById('current-year');

  // Set current year in footer
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Navbar functionality
  if (sideIcon) {
    sideIcon.addEventListener('click', () => {
      mySidepanel.style.width = '250px';
    });
  }

  if (closebtn) {
    closebtn.addEventListener('click', () => {
      mySidepanel.style.width = '0';
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      searchExtension.style.display = 'flex';
    });
  }

  if (searchButton2) {
    searchButton2.addEventListener('click', () => {
      searchExtension.style.display = 'flex';
    });
  }

  if (exitSearchExtensionButton) {
    exitSearchExtensionButton.addEventListener('click', () => {
      searchExtension.style.display = 'none';
    });
  }

  if (collectionsAnchorWithExtension) {
    collectionsAnchorWithExtension.addEventListener('click', (e) => {
      e.preventDefault();
      if (headerBottomAnchorExtension.style.display === 'none') {
        headerBottomAnchorExtension.style.display = 'block';
      } else {
        headerBottomAnchorExtension.style.display = 'none';
      }
    });
  }

  // Configuration state
  const config = {
    dial: 'black',
    strap: 'black',
    case: 'steel',
    bezel: 'black-ceramic',
    basePrice: 5000,
    additionalCosts: {
      strap: {
        black: 0,
        brown: 200,
        silver: 300,
        gold: 500,
        navy: 250,
        green: 250
      },
      case: {
        steel: 0,
        'yellow-gold': 2000,
        'white-gold': 2000,
        'rose-gold': 2000,
        black: 1500,
        titanium: 1000
      },
      dial: {
        black: 0,
        navy: 300,
        green: 300,
        silver: 300,
        brown: 300,
        gold: 500
      },
      bezel: {
        'black-ceramic': 0,
        'blue-ceramic': 500,
        'green-ceramic': 500,
        steel: 300,
        gold: 1000,
        'rose-gold': 1000
      }
    }
  };

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');

      if (isDark) {
        if (moonIcon) moonIcon.classList.add('hidden');
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (watchScene) {
          watchScene.background = new THREE.Color(0x1f1f1f);
        }
      } else {
        if (moonIcon) moonIcon.classList.remove('hidden');
        if (sunIcon) sunIcon.classList.add('hidden');
        if (watchScene) {
          watchScene.background = new THREE.Color(0xf5f5f5);
        }
      }
    });
  }

  // Favorite toggle
  if (favoriteToggle && favoriteIcon) {
    favoriteToggle.addEventListener('click', () => {
      favoriteIcon.classList.toggle('favorite-active');
    });
  }

  // Tab switching
  tabTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      // Remove active class from all triggers and contents
      tabTriggers.forEach((t) => {
        t.classList.remove('active');
      });
      tabContents.forEach((c) => {
        c.classList.remove('active');
      });

      // Add active class to clicked trigger and corresponding content
      trigger.classList.add('active');
      const tabId = trigger.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });

  // Update configuration and price when options change
  function updateConfiguration() {
    // Update summary text
    if (summaryDial) {
      const selectedDial = document.querySelector('#dial .color-option.active');
      if (selectedDial) {
        const dialValue = selectedDial.getAttribute('data-value');
        summaryDial.textContent = dialValue.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }

    if (summaryBracelet) {
      const selectedStrap = document.querySelector('#strap .color-option.active');
      if (selectedStrap) {
        const strapValue = selectedStrap.getAttribute('data-value');
        summaryBracelet.textContent = strapValue.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }

    if (summaryMaterial) {
      const selectedCase = document.querySelector('#case .color-option.active');
      if (selectedCase) {
        const caseValue = selectedCase.getAttribute('data-value');
        let materialText = '';
        switch (caseValue) {
          case 'steel':
            materialText = 'Oystersteel';
            break;
          case 'yellow-gold':
            materialText = 'Yellow Gold';
            break;
          case 'white-gold':
            materialText = 'White Gold';
            break;
          case 'rose-gold':
            materialText = 'Rose Gold';
            break;
          case 'titanium':
            materialText = 'Titanium';
            break;
          default:
            materialText = caseValue.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        summaryMaterial.textContent = materialText;
      }
    }

    if (summaryBezel) {
      const selectedBezel = document.querySelector('#bezel .color-option.active');
      if (selectedBezel) {
        const bezelValue = selectedBezel.getAttribute('data-value');
        let bezelText = '';
        switch (bezelValue) {
          case 'black-ceramic':
            bezelText = 'Black Ceramic';
            break;
          case 'blue-ceramic':
            bezelText = 'Blue Ceramic';
            break;
          case 'green-ceramic':
            bezelText = 'Green Ceramic';
            break;
          default:
            bezelText = bezelValue.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        summaryBezel.textContent = bezelText;
      }
    }

    // Calculate total price
    if (summaryPrice) {
      const selectedStrap = document.querySelector('#strap .color-option.active');
      const selectedCase = document.querySelector('#case .color-option.active');
      const selectedDial = document.querySelector('#dial .color-option.active');
      const selectedBezel = document.querySelector('#bezel .color-option.active');

      if (selectedStrap && selectedCase && selectedDial && selectedBezel) {
        const strapValue = selectedStrap.getAttribute('data-value');
        const caseValue = selectedCase.getAttribute('data-value');
        const dialValue = selectedDial.getAttribute('data-value');
        const bezelValue = selectedBezel.getAttribute('data-value');

        const totalPrice =
          config.basePrice +
          config.additionalCosts.strap[strapValue] +
          config.additionalCosts.case[caseValue] +
          config.additionalCosts.dial[dialValue] +
          config.additionalCosts.bezel[bezelValue];

        // Update price display
        summaryPrice.textContent = `$${totalPrice.toLocaleString()}`;
      }
    }

    // Update 3D model
    updateWatchMaterials();
  }

  // Add event listeners to color options
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
      const tab = this.closest('.tab-content');
      const category = tab.id;
      const value = this.getAttribute('data-value');

      // Update config
      config[category] = value;

      // Update active state
      tab.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');

      // Update configuration
      updateConfiguration();
    });
  });

  // 3D Watch Viewer with Three.js
  let watchScene, watchCamera, watchRenderer, watchControls, watchModel;
  const canvasContainer = document.getElementById('watch-canvas-container');

  // Initialize 3D scene
  function initWatchViewer() {
    if (!canvasContainer || !THREE) return;

    // Create scene
    watchScene = new THREE.Scene();
    watchScene.background = document.documentElement.classList.contains('dark')
      ? new THREE.Color(0x1f1f1f)
      : new THREE.Color(0xf5f5f5);

    // Create camera
    const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    watchCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    watchCamera.position.set(0, 0, 5);

    // Create renderer
    watchRenderer = new THREE.WebGLRenderer({ antialias: true });
    watchRenderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    watchRenderer.setPixelRatio(window.devicePixelRatio);
    watchRenderer.shadowMap.enabled = true;
    canvasContainer.appendChild(watchRenderer.domElement);

    // Add orbit controls
    watchControls = new THREE.OrbitControls(watchCamera, watchRenderer.domElement);
    watchControls.enableDamping = true;
    watchControls.dampingFactor = 0.05;
    watchControls.minDistance = 3;
    watchControls.maxDistance = 10;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    watchScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    watchScene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    watchScene.add(directionalLight2);

    // Create placeholder watch model
    createPlaceholderWatch();

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      watchControls.update();
      watchRenderer.render(watchScene, watchCamera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      if (watchCamera && watchRenderer && canvasContainer) {
        watchCamera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        watchCamera.updateProjectionMatrix();
        watchRenderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
      }
    });
  }

  // Create a placeholder watch model
  function createPlaceholderWatch() {
    if (!watchScene || !THREE) return;

    watchModel = new THREE.Group();

    // Watch case
    const caseGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    const caseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const watchCase = new THREE.Mesh(caseGeometry, caseMaterial);
    watchModel.add(watchCase);

    // Watch face/dial
    const dialGeometry = new THREE.CircleGeometry(0.9, 32);
    const dialMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const watchDial = new THREE.Mesh(dialGeometry, dialMaterial);
    watchDial.position.set(0, 0.11, 0);
    watchDial.rotation.x = -Math.PI / 2;
    watchModel.add(watchDial);

    // Watch hands
    const hourHandGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.02);
    const hourHandMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const hourHand = new THREE.Mesh(hourHandGeometry, hourHandMaterial);
    hourHand.position.set(0, 0.12, 0);
    hourHand.rotation.x = -Math.PI / 2;
    watchModel.add(hourHand);

    const minuteHandGeometry = new THREE.BoxGeometry(0.03, 0.6, 0.02);
    const minuteHandMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const minuteHand = new THREE.Mesh(minuteHandGeometry, minuteHandMaterial);
    minuteHand.position.set(0, 0.13, 0);
    minuteHand.rotation.x = -Math.PI / 2;
    minuteHand.rotation.z = Math.PI / 4;
    watchModel.add(minuteHand);

    // Watch bracelet
    const braceletGeometry = new THREE.BoxGeometry(0.4, 0.1, 2);
    const braceletMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const braceletTop = new THREE.Mesh(braceletGeometry, braceletMaterial);
    braceletTop.position.set(0, 0, -1.1);
    watchModel.add(braceletTop);

    const braceletBottom = new THREE.Mesh(braceletGeometry, braceletMaterial);
    braceletBottom.position.set(0, 0, 1.1);
    watchModel.add(braceletBottom);

    // Watch bezel
    const bezelGeometry = new THREE.TorusGeometry(1, 0.1, 16, 32);
    const bezelMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.y = 0.1;
    watchModel.add(bezel);

    watchScene.add(watchModel);

    // Apply initial materials
    updateWatchMaterials();
  }

  // Update watch materials based on configuration
  function updateWatchMaterials() {
    if (!watchModel || !THREE) return;

    // Get all meshes in the watch model
    const meshes = [];
    watchModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
      }
    });

    // Update case and bracelet material based on selection
    let caseMaterialColor = 0x888888; // Default steel color
    if (config.material === 'yellow-gold') caseMaterialColor = 0xffd700;
    if (config.material === 'white-gold') caseMaterialColor = 0xe0e0e0;
    if (config.material === 'everose') caseMaterialColor = 0xe0a684;

    // Update dial color based on selection
    let dialColor = 0x000000; // Default black
    if (config.dial === 'blue') dialColor = 0x0047ab;
    if (config.dial === 'green') dialColor = 0x006400;
    if (config.dial === 'silver') dialColor = 0xc0c0c0;

    // Update bezel color based on selection
    let bezelColor = 0x000000; // Default black
    if (config.bezel === 'blue') bezelColor = 0x0047ab;
    if (config.bezel === 'green') bezelColor = 0x006400;
    if (config.bezel === 'fluted')
      bezelColor = config.material === 'yellow-gold' ? 0xffd700 : 0xc0c0c0;

    // Apply materials to the appropriate parts
    meshes.forEach((mesh) => {
      if (mesh.geometry instanceof THREE.CylinderGeometry) {
        // This is the watch case
        mesh.material.color.set(caseMaterialColor);
      } else if (mesh.geometry instanceof THREE.CircleGeometry) {
        // This is the watch dial
        mesh.material.color.set(dialColor);
      } else if (
        mesh.geometry instanceof THREE.BoxGeometry &&
        (mesh.geometry.parameters.width === 0.4 || mesh.geometry.parameters.depth === 2)
      ) {
        // This is the bracelet
        let braceletColor = caseMaterialColor;
        if (config.bracelet === 'leather') braceletColor = 0x5c4033;
        if (config.bracelet === 'oysterflex') braceletColor = 0x000000;
        mesh.material.color.set(braceletColor);
      } else if (mesh.geometry instanceof THREE.TorusGeometry) {
        // This is the bezel
        mesh.material.color.set(bezelColor);
      }
    });
  }

  // Initialize everything when the DOM is loaded
  if (typeof THREE === 'undefined') {
    console.error('THREE.js is not loaded!');
    return;
  }

  if (canvasContainer) {
    initWatchViewer();
  }

  updateConfiguration();

  // Scroll event for navbar
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
      if (window.scrollY > 50) {
        header.classList.remove('header-unscrolled');
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
        header.classList.add('header-unscrolled');
      }
    }
  });
});


