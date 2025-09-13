document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.getElementById('search-button');
  const searchButton2 = document.getElementById('search-button2');
  const middleDiv = document.getElementById('top-move-on-scroll');
  const headerMiddle = document.getElementById('header-middle');
  const headerBottom = document.getElementById('header-bottom');
  const header = document.querySelector('header');
  const exitSearchButton = document.getElementById('exit-search-extension-button');

  // Only add event listeners if elements exist
  if (searchButton) {
    searchButton.addEventListener('input', debounce(handleSearch, 300));
  }

  if (searchButton2) {
    searchButton2.addEventListener('input', debounce(handleSearch, 300));
  }

  if (exitSearchButton) {
    exitSearchButton.addEventListener('click', () => {
      const searchExtension = document.getElementById('search-extension');
      const searchField = document.getElementById('searchField');
      if (searchExtension) searchExtension.style.display = 'none';
      if (searchField) searchField.value = '';
      if (headerBottom) headerBottom.style.display = 'flex';
      if (header) {
        header.classList.remove('header-scrolled');
        header.classList.add('header-unscrolled');
      }
    });
  }

  if (middleDiv) {
    const middleDivanchors = middleDiv.querySelectorAll('a');

    window.addEventListener('scroll', function () {
      const headerTop = document.getElementById('header-top');
      const sideicon = document.getElementById('side-icon');
      const logo = document.getElementById('logo');

      if (!headerTop || !logo || !headerMiddle || !headerBottom) return;

      if (window.scrollY > 0 && window.innerWidth > 1100) {
        header.classList.remove('header-unscrolled');
        header.classList.add('header-scrolled');

        // Ensure the logo stays on the left
        logo.style.position = 'relative';
        logo.style.left = '50px';
        logo.style.top = '50%';
        logo.style.transform = 'translateY(-10%)';

        // Ensure the icons stay on the right
        headerMiddle.style.justifyContent = 'flex-end';
        headerMiddle.style.paddingRight = '30px';

        // Show all icons
        middleDiv.style.display = 'flex';
        middleDivanchors.forEach((anchor) => {
          anchor.style.display = 'inline-flex';
        });

        // Other scroll-related changes
        if (searchButton) searchButton.style.display = 'none';
        if (searchButton2) {
          searchButton2.classList.remove('search-button-unscrolled');
          searchButton2.classList.add('search-button-scrolled');
        }
        headerTop.style.display = 'none';
        middleDiv.classList.remove('header-top-unscrolled');
        middleDiv.classList.add('header-top-scrolled');
        logo.classList.remove('logo-unscrolled');
        logo.classList.add('logo-scrolled');
        headerBottom.classList.remove('header-bottom-unscrolled');
        headerBottom.classList.add('header-bottom-scrolled');
      } else if (window.scrollY > 0 && window.innerWidth <= 1100) {
        header.classList.remove('header-unscrolled');
        header.classList.add('header-scrolled');
        middleDiv.classList.remove('header-top-unscrolled');
        middleDiv.classList.add('header-top-scrolled');
        headerBottom.classList.remove('header-bottom-unscrolled');
        headerBottom.classList.add('header-bottom-scrolled');
        headerTop.style.display = 'none';
        logo.style.marginLeft = '75px';
        logo.style.fontSize = '30px';
      } else {
        header.classList.remove('header-scrolled');
        header.classList.add('header-unscrolled');

        // Reset the logo position
        logo.style.position = 'static';
        logo.style.left = 'auto';
        logo.style.top = 'auto';
        logo.style.transform = 'none';

        // Reset the icons position
        headerMiddle.style.justifyContent = 'center';
        headerMiddle.style.paddingRight = '0';

        if (window.innerWidth > 1100) {
          searchButton.style.display = 'flex';
          middleDiv.style.display = 'none';
        } else {
          middleDivanchors.forEach((anchor) => {
            anchor.style.display = 'none';
          });
          headerMiddle.style.justifyContent = 'center';
        }

        // Other unscroll-related changes
        if (searchButton2) {
          searchButton2.classList.remove('search-button-scrolled');
          searchButton2.classList.add('search-button-unscrolled');
        }
        headerTop.style.display = 'flex';
        middleDiv.classList.remove('header-top-unscrolled');
        middleDiv.classList.remove('header-top-scrolled');
        headerMiddle.style.justifyContent = 'center';
        logo.classList.remove('logo-scrolled');
        logo.classList.add('logo-unscrolled');
        headerBottom.classList.add('header-bottom-unscrolled');
        headerBottom.classList.remove('header-bottom-scrolled');
      }
    });
  }

  //responsive header
  const closebtn = document.getElementById('closebtn');
  const openIcon = document.getElementById('ham-whatever');

  function closeNav() {
    document.getElementById('mySidepanel').style.width = '0';
  }

  openIcon.addEventListener('click', () => {
    console.log('clicked');
    document.getElementById('mySidepanel').style.display = 'block';
    document.getElementById('mySidepanel').style.width = '250px';
  });
  closebtn.addEventListener('click', () => {
    document.getElementById('mySidepanel').style.width = '0';
  });

  //nav bar extension on hover
  const navigationLinks = document.querySelectorAll('#header-bottom .navigation .extension');
  const headerExtension = document.getElementById('header-bottom-anchor-extension');
  const exitButton = document.getElementById('exit-extension-button');
  let mouseOverLink = false; // To prevent flickering

  const braceletsLink = document.querySelector('a[data-category="Bracelets"]');
  const braceletsExtension = document.getElementById('header-bottom-bracelets-extension');
  const exitBraceletsButton = document.getElementById('exit-bracelets-extension-button');
  let mouseOverBraceletsLink = false;
  let mouseOverBraceletsExtension = false;

  if (braceletsLink && braceletsExtension) {
    braceletsLink.addEventListener('mouseenter', () => {
      mouseOverBraceletsLink = true;
      braceletsExtension.style.display = 'block';
    });

    braceletsLink.addEventListener('mouseleave', () => {
      mouseOverBraceletsLink = false;
      setTimeout(() => {
        if (!mouseOverBraceletsExtension) {
          braceletsExtension.style.display = 'none';
        }
      }, 20);
    });

    braceletsExtension.addEventListener('mouseenter', () => {
      mouseOverBraceletsExtension = true;
    });

    braceletsExtension.addEventListener('mouseleave', () => {
      mouseOverBraceletsExtension = false;
      setTimeout(() => {
        if (!mouseOverBraceletsLink) {
          braceletsExtension.style.display = 'none';
        }
      }, 20);
    });
    if (exitBraceletsButton) {
      exitBraceletsButton.addEventListener('click', () => {
        braceletsExtension.style.display = 'none';
        20;
      });
    }
  }

  if (exitButton) {
    exitButton.addEventListener('click', () => {
      mouseOverLink = false;
      console.log('exit button clicked');
      headerExtension.style.display = 'none';
    });
  }

  navigationLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      mouseOverLink = true;
      headerExtension.style.display = 'block';
    });

    link.addEventListener('mouseleave', () => {
      mouseOverLink = false;
      setTimeout(() => {
        if (!mouseOverLink) {
          headerExtension.style.display = 'none';
        }
      }, 20);
    });
  });

  headerExtension.addEventListener('mouseenter', () => {
    mouseOverLink = true;
  });

  headerExtension.addEventListener('mouseleave', () => {
    mouseOverLink = false;
    setTimeout(() => {
      if (!mouseOverLink) {
        headerExtension.style.display = 'none';
      }
    }, 20);
  });

  // 7agat el search
  const searchButtonclick = document.getElementById('search');
  const searchButtonclick2 = document.getElementById('search2');
  const searchField = document.getElementById('searchField');
  const searchField2 = document.getElementById('searchField2');
  const searchDiv = document.getElementById('search-button');
  const searchDiv2 = document.getElementById('search-button2');
  let buttonCount = 0;
  let buttonCount2 = 0;

  const searchExtension = document.getElementById('search-extension');
  const searchResultsDiv = document.getElementById('search-results');
  const recommendations = document.getElementById('search-filter-link');

  // search functionality
  if (searchButtonclick && searchField) {
    searchButtonclick.addEventListener('click', expandSearch);
  }

  if (searchButtonclick2 && searchField2) {
    searchButtonclick2.addEventListener('click', expandSearch2);
  }

  function expandSearch() {
    if (buttonCount === 0) {
      // Calculate responsive width based on screen size
      let searchWidth;
      if (window.innerWidth < 480) {
        // Very small screens - minimal width
        searchWidth = '120px';
      } else if (window.innerWidth < 768) {
        // Small screens - compact width
        searchWidth = '150px';
      } else if (window.innerWidth < 1024) {
        // Medium screens - moderate width
        searchWidth = '180px';
      } else {
        // Large screens - standard width
        searchWidth = '200px';
      }
      
      searchDiv.style.width = searchWidth;
      searchField.style.width = searchWidth;
      searchDiv.style.border = '1px solid black';
      buttonCount++;
      searchField.focus();
    } else if (buttonCount === 1 && searchField.value === '') {
      searchDiv.style.border = 'none';
      searchField.style.width = '0px';
      searchDiv.style.width = '40px';
      buttonCount--;
      resetSearchUI();
    }
  }

  function expandSearch2() {
    if (buttonCount2 === 0) {
      // Calculate responsive width based on screen size
      let searchWidth;
      if (window.innerWidth < 480) {
        // Very small screens - minimal width
        searchWidth = '120px';
      } else if (window.innerWidth < 768) {
        // Small screens - compact width
        searchWidth = '150px';
      } else if (window.innerWidth < 1024) {
        // Medium screens - moderate width
        searchWidth = '180px';
      } else {
        // Large screens - standard width
        searchWidth = '200px';
      }
      
      searchDiv2.style.width = searchWidth;
      searchField2.style.width = searchWidth;
      searchDiv2.style.border = '1px solid black';
      buttonCount2++;
      searchField2.focus();
    } else if (buttonCount2 === 1 && searchField2.value === '') {
      searchDiv2.style.border = 'none';
      searchField2.style.width = '0px';
      searchDiv2.style.width = '40px';
      buttonCount2--;
      resetSearchUI();
    }
  }

  // Handle window resize to adjust search field width dynamically
  window.addEventListener('resize', function() {
    // Only adjust if search field is currently expanded
    if (buttonCount === 1) {
      let searchWidth;
      if (window.innerWidth < 480) {
        searchWidth = '120px';
      } else if (window.innerWidth < 768) {
        searchWidth = '150px';
      } else if (window.innerWidth < 1024) {
        searchWidth = '180px';
      } else {
        searchWidth = '200px';
      }
      searchDiv.style.width = searchWidth;
      searchField.style.width = searchWidth;
    }
    
    if (buttonCount2 === 1) {
      let searchWidth;
      if (window.innerWidth < 480) {
        searchWidth = '120px';
      } else if (window.innerWidth < 768) {
        searchWidth = '150px';
      } else if (window.innerWidth < 1024) {
        searchWidth = '180px';
      } else {
        searchWidth = '200px';
      }
      searchDiv2.style.width = searchWidth;
      searchField2.style.width = searchWidth;
    }
  });

  // Helper function to debounce user input
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Handle search functionality
  async function handleSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    const searchExtension = document.getElementById('search-extension');
    const headerBottom = document.getElementById('header-bottom');
    const header = document.querySelector('header');
    const searchResultsDiv = document.getElementById('search-results');
    const searchField = event.target;

    // Debug logs
    console.log('[handleSearch] Called from:', searchField.id, 'Query:', query);
    console.log(
      '[handleSearch] searchExtension:',
      searchExtension,
      'headerBottom:',
      headerBottom,
      'header:',
      header,
      'searchResultsDiv:',
      searchResultsDiv
    );

    if (!searchExtension || !headerBottom || !header || !searchResultsDiv) {
      console.error('Required DOM elements not found for search');
      return;
    }

    if (query.length >= 2) {
      headerBottom.style.display = 'none';
      header.classList.remove('header-unscrolled');
      header.classList.add('header-scrolled');
      searchExtension.style.display = 'flex';
      searchResultsDiv.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <p>Searching...</p>
            </div>`;
      console.log('[handleSearch] Showing searchExtension and searchResultsDiv');
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=8&format=json`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('[handleSearch] API result:', result);

        let products = [];
        if (result.data && Array.isArray(result.data.products)) {
          products = result.data.products;
        } else if (Array.isArray(result.data)) {
          products = result.data;
        }

        displaySearchResults(products, query);
      } catch (error) {
        console.error('Search error:', error);
        searchResultsDiv.innerHTML = `
                <div class="search-error">
                    <p>Error loading search results</p>
                    <p class="error-details">${error.message}</p>
                    <button class="retry-button">Retry</button>
                </div>`;
        // Attach event listener to retry button
        const retryBtn = searchResultsDiv.querySelector('.retry-button');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            // Re-trigger the search with the current value
            const searchField = document.getElementById('searchField');
            if (searchField) {
              searchField.dispatchEvent(new Event('input'));
            }
          });
        }
      }
    } else if (query.length === 1) {
      searchExtension.style.display = 'flex';
      searchResultsDiv.innerHTML = `
            <div class="search-suggestions">
                <p>Type at least 2 characters to search</p>
                <p class="suggestion-list">
                    Try searching for brand names, watch types, or features
                </p>
            </div>`;
      console.log('[handleSearch] Query too short, showing suggestions');
    } else {
      resetSearchUI();
      console.log('[handleSearch] Query empty, resetting UI');
    }
  }

  // Display search results in the UI
  function displaySearchResults(products, query) {
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.innerHTML = '';
    console.log('[displaySearchResults] Called for:', query, 'Products:', products);
    if (!products || products.length === 0) {
      searchResultsDiv.innerHTML = `
            <div class="no-results">
                <p>No products found for "${query}"</p>
                <p class="search-suggestions">Try searching for:</p>
                <ul class="suggestion-list">
                    <li>Brand names (e.g., Rolex, Omega)</li>
                    <li>Watch types (e.g., Automatic, Chronograph)</li>
                    <li>Features (e.g., Diver, Pilot)</li>
                </ul>
                <div class="search-tips">
                    <p>Tips:</p>
                    <ul>
                        <li>Check your spelling</li>
                        <li>Try more general terms</li>
                        <li>Use brand names</li>
                    </ul>
                </div>
            </div>`;
      console.log('[displaySearchResults] No products found');
      return;
    }

    // Create a container for keyboard navigation
    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('search-results-container');
    resultsContainer.setAttribute('role', 'listbox');
    resultsContainer.setAttribute('aria-label', 'Search results');

    // Group products by brand for better organization
    const productsByBrand = products.reduce((acc, product) => {
      if (!acc[product.brand]) {
        acc[product.brand] = [];
      }
      acc[product.brand].push(product);
      return acc;
    }, {});

    // Display products grouped by brand
    Object.entries(productsByBrand).forEach(([brand, brandProducts]) => {
      const brandSection = document.createElement('div');
      brandSection.classList.add('brand-section');

      const brandHeader = document.createElement('div');
      brandHeader.classList.add('brand-header');
      brandHeader.textContent = brand;
      brandSection.appendChild(brandHeader);

      brandProducts.forEach((product, index) => {
        const productLink = document.createElement('a');
        productLink.href = `/user/product?id=${product._id || product.id}`;
        productLink.classList.add('search-result-item');
        productLink.setAttribute('role', 'option');
        productLink.setAttribute('tabindex', '0');
        productLink.setAttribute('aria-selected', 'false');
        productLink.setAttribute('data-index', index);

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('search-result-item-img-cont');

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.classList.add('search-result-item-img');
        img.onerror = () => {
          img.src = '/Watches/placeholder.png';
        };

        const productInfo = document.createElement('div');
        productInfo.classList.add('search-result-info');

        const productName = document.createElement('span');
        productName.classList.add('search-extension-a');
        productName.textContent = product.name;

        const price = document.createElement('span');
        price.classList.add('search-result-price');
        price.textContent = `$${product.price.toLocaleString()}`;
        imgContainer.appendChild(img);
        productInfo.appendChild(productName);
        productInfo.appendChild(price);
        productLink.appendChild(imgContainer);
        productLink.appendChild(productInfo);

        // Add keyboard navigation
        productLink.addEventListener('keydown', (e) => {
          const items = resultsContainer.querySelectorAll('.search-result-item');
          const currentIndex = Array.from(items).indexOf(productLink);

          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              if (currentIndex < items.length - 1) {
                items[currentIndex + 1].focus();
              }
              break;
            case 'ArrowUp':
              e.preventDefault();
              if (currentIndex > 0) {
                items[currentIndex - 1].focus();
              }
              break;
            case 'Enter':
              e.preventDefault();
              productLink.click();
              break;
            case 'Escape':
              e.preventDefault();
              resetSearchUI();
              break;
          }
        });

        // Add hover effects
        productLink.addEventListener('mouseenter', () => {
          productLink.setAttribute('aria-selected', 'true');
        });

        productLink.addEventListener('mouseleave', () => {
          productLink.setAttribute('aria-selected', 'false');
        });

        brandSection.appendChild(productLink);
      });

      resultsContainer.appendChild(brandSection);
    });

    searchResultsDiv.appendChild(resultsContainer);

    // Add a "View All Results" link
    const viewAllLink = document.createElement('a');
    viewAllLink.href = `/user/products?search=${encodeURIComponent(query)}`;
    viewAllLink.classList.add('view-all-results');
    viewAllLink.textContent = `View all results for "${query}"`;
    searchResultsDiv.appendChild(viewAllLink);

    // Focus the first result
    const firstResult = resultsContainer.querySelector('.search-result-item');
    if (firstResult) {
      firstResult.focus();
    }
    console.log('[displaySearchResults] Results rendered, searchResultsDiv:', searchResultsDiv);
  }

  // Reset the search UI when the query is empty
  function resetSearchUI() {
    const searchExtension = document.getElementById('search-extension');
    const headerBottom = document.getElementById('header-bottom');
    const header = document.querySelector('header');
    const searchField = document.getElementById('searchField');
    const searchField2 = document.getElementById('searchField2');
    const searchResultsDiv = document.getElementById('search-results');

    if (searchExtension) searchExtension.style.display = 'none';
    if (headerBottom) headerBottom.style.display = 'flex';
    if (searchField) searchField.value = '';
    if (searchField2) searchField2.value = '';
    if (searchResultsDiv) searchResultsDiv.innerHTML = '';

    if (header && window.scrollY === 0) {
      header.classList.remove('header-scrolled');
      header.classList.add('header-unscrolled');
    }
  }
});