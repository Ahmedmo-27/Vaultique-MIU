document.addEventListener('DOMContentLoaded', function () {

    const searchButton = document.getElementById('search-button');
    const searchButton2 = document.getElementById('search-button2');
    const middleDiv = document.getElementById('top-move-on-scroll');
    const middleDivanchors = middleDiv.querySelectorAll('a');
    const headerMiddle = document.getElementById('header-middle');
    const headerBottom = document.getElementById('header-bottom');
    const header = document.querySelector('header');
    
    if (searchButton) {
        searchButton2.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (searchButton2) {
        searchButton2.addEventListener('input', debounce(handleSearch, 300));
    }

    window.addEventListener('scroll', function () 
    {
        const headerTop = document.getElementById('header-top');
        const sideicon = document.getElementById('side-icon');
        const logo = document.getElementById('logo');
    
        if (window.scrollY > 0&& window.innerWidth > 1100) 
        {
            header.classList.remove('header-unscrolled');
            header.classList.add('header-scrolled');

            // Ensure the logo stays on the left
            logo.style.position = 'relative';
            logo.style.left = '50px'; // Adjust this value as needed
            logo.style.top = '50%';
            logo.style.transform = 'translateY(-10%)';
            
            // Ensure the icons stay on the right
            headerMiddle.style.justifyContent = 'flex-end';
            headerMiddle.style.paddingRight = '30px'; // Adjust this value as needed
    
            const toggleTheme= document.querySelector('[data-theme-toggle]');

            // Show all icons
            middleDiv.style.display = 'flex';
            middleDivanchors.forEach(anchor => {
                anchor.style.display = 'inline-flex';
            });
    
            // Other scroll-related changes
            searchButton.style.display = 'none';
            searchButton2.classList.remove('search-button-unscrolled');
            searchButton2.classList.add('search-button-scrolled');
            headerTop.style.display = 'none';
            middleDiv.classList.remove('header-top-unscrolled');
            middleDiv.classList.add('header-top-scrolled');
            logo.classList.remove('logo-unscrolled');
            logo.classList.add('logo-scrolled');
            headerBottom.classList.remove('header-bottom-unscrolled');
            headerBottom.classList.add('header-bottom-scrolled');
        } 
        
        else if (window.scrollY > 0 && window.innerWidth <= 1100)
        {
            header.classList.remove('header-unscrolled');
            header.classList.add('header-scrolled');
            middleDiv.classList.remove('header-top-unscrolled');
            middleDiv.classList.add('header-top-scrolled');
            headerBottom.classList.remove('header-bottom-unscrolled');
            headerBottom.classList.add('header-bottom-scrolled');
            headerTop.style.display = 'none';
            logo.style.marginLeft='75px';
            logo.style.fontSize='30px';
        }

        else 
        {
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
                middleDivanchors.forEach(anchor => {
                    anchor.style.display = 'none';
                });
                headerMiddle.style.justifyContent = 'center';
            }
    
            // Other unscroll-related changes
            searchButton2.classList.remove('search-button-scrolled');
            searchButton2.classList.add('search-button-unscrolled');
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

    //responsive header
    const closebtn = document.getElementById('closebtn');
    const openIcon = document.getElementById('ham-whatever');

    function closeNav() {
        document.getElementById("mySidepanel").style.width = "0";
    }

    openIcon.addEventListener('click', () => {
        console.log('clicked');
        document.getElementById("mySidepanel").style.display = 'block';
        document.getElementById("mySidepanel").style.width = "250px";
    });
    closebtn.addEventListener('click', () => {
        document.getElementById("mySidepanel").style.width = "0";
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
                20
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

    navigationLinks.forEach(link => {
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
    const searchField = document.getElementById('searchField');
    const searchDiv = document.getElementById('search-button');
    let buttonCount = 0;

    const searchExtension = document.getElementById('search-extension');
    const searchResultsDiv = document.getElementById('search-results');
    const recommendations = document.getElementById('search-filter-link');

    // search functionality
    if (searchButtonclick && searchField) {
        searchButtonclick.addEventListener('click', expandSearch);
    }

    function expandSearch() {
        if (buttonCount === 0) {
            if (window.innerWidth < 700) {
                searchDiv.style.width = '200px';
                searchField.style.width = '200px';
            } else {
                searchDiv.style.width = '200px';
                searchField.style.width = '200px';
            }
            searchDiv.style.border = '1px solid black';
            buttonCount++;
        } else if (buttonCount === 1 && searchField.value == "") {
            searchDiv.style.border = 'none';
            searchField.style.width = '0px';
            searchDiv.style.width = '40px';
            buttonCount--;
        }
    }


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

    // Ensure required DOM elements exist
    if (!searchExtension || !headerBottom || !header || !searchResultsDiv) {
        console.error('Required DOM elements not found for search');
        return;
    }

    if (query.length > 2) {
        // Show search UI
        headerBottom.style.display = 'none';
        header.classList.remove('header-unscrolled');
        header.classList.add('header-scrolled');
        searchExtension.style.display = 'flex';

        try {
            // Fetch search results from the server
            const response = await fetch(`/api/products/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Search request failed');
            }

            const products = result.data || [];
            displaySearchResults(products);
        } catch (error) {
            console.error('Search error:', error);
            searchResultsDiv.innerHTML = '<div class="no-results">Error loading search results</div>';
        }
    } else {
        // Reset UI when query is too short
        resetSearchUI();
    }
}

// Display search results in the UI
function displaySearchResults(products) {
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.innerHTML = '';

    if (!products || products.length === 0) {
        searchResultsDiv.innerHTML = '<div class="no-results">No products found</div>';
        return;
    }

    // Limit results to a maximum of 8 items for better UX
    const displayProducts = products.slice(0, 8);

    displayProducts.forEach(product => {
        const productLink = document.createElement('a');
        productLink.href = `/product.html?id=${product._id || product.id}`;
        productLink.classList.add('search-result-item');

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('search-result-item-img-cont');

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.classList.add('search-result-item-img');
        img.onerror = () => {
            img.src = '/Watches/placeholder.png'; // Fallback image
        };

        const productName = document.createElement('span');
        productName.classList.add('search-extension-a');
        productName.textContent = product.name;

        const price = document.createElement('span');
        price.classList.add('search-result-price');
        price.textContent = `$${product.price.toLocaleString()}`;

        imgContainer.appendChild(img);
        productLink.appendChild(imgContainer);
        productLink.appendChild(productName);
        productLink.appendChild(price);

        searchResultsDiv.appendChild(productLink);
    });

    // Add a "View All Results" link if there are more results
    if (products.length > 8) {
        const viewAllLink = document.createElement('a');
        viewAllLink.href = `/products.html?query=${encodeURIComponent(document.getElementById('searchField').value)}`;
        viewAllLink.classList.add('view-all-results');
        viewAllLink.textContent = `View all ${products.length} results`;
        searchResultsDiv.appendChild(viewAllLink);
    }
}

// Reset the search UI when the query is too short
function resetSearchUI() {
    const searchExtension = document.getElementById('search-extension');
    const headerBottom = document.getElementById('header-bottom');
    const header = document.querySelector('header');

    if (searchExtension) searchExtension.style.display = 'none';
    if (headerBottom) headerBottom.style.display = 'flex';

    if (header && window.scrollY === 0) {
        header.classList.remove('header-scrolled');
        header.classList.add('header-unscrolled');
    }
}

// Attach the debounce function to the search input fields
document.addEventListener('DOMContentLoaded', function () {
    const searchField = document.getElementById('searchField');
    const searchField2 = document.getElementById('searchField2');

    if (searchField) {
        searchField.addEventListener('input', debounce(handleSearch, 300));
    }

    if (searchField2) {
        searchField2.addEventListener('input', debounce(handleSearch, 300));
    }
});

// Expand search functionality for the second search field
function expandSearch2() {
    const searchField2 = document.getElementById('searchField2');
    const searchDiv2 = document.getElementById('search-button2');
    let buttonCount2 = 0;

    if (buttonCount2 === 0) {
        if (window.innerWidth < 700) {
            searchDiv2.style.width = '100px';
            searchField2.style.width = '100px';
        } else {
            searchDiv2.style.width = '200px';
            searchField2.style.width = '200px';
        }
        searchDiv2.style.border = '1px solid black';
        buttonCount2++;
    } else if (buttonCount2 === 1 && searchField2.value === "") {
        searchDiv2.style.border = 'none';
        searchField2.style.width = '0px';
        searchDiv2.style.width = '30px';
        buttonCount2--;
    }
}
    document.getElementById('exit-search-extension-button').addEventListener('click', () => {
        searchExtension.style.display = 'none';
        searchField.value = '';
        headerBottom.style.display = 'flex'; // Show the headerBottom when search is canceled
        header.classList.remove('header-scrolled');
        header.classList.add('header-unscrolled');
    });

    //second search
    const searchButtonclick2 = document.getElementById('search2');
    const searchField2 = document.getElementById('searchField2');
    const searchDiv2 = document.getElementById('search-button2');
    let buttonCount2 = 0;

    if (searchButtonclick2) {
        searchButtonclick2.addEventListener('click', expandSearch2);
    }

    function expandSearch2() {
        if (buttonCount2 === 0) {
            if (window.innerWidth < 700) {
                console.log('Enter Here');
                searchDiv2.style.width = '100px';
                searchField2.style.width = '100px';
            } else {
                console.log('Enter Here');
                searchDiv2.style.width = '200px';
                searchField2.style.width = '200px';
            }
            searchDiv2.style.border = '1px solid black';
            buttonCount2++;
        } else if (buttonCount2 === 1 && searchField2.value == "") {
            searchDiv2.style.border = 'none';
            searchField2.style.width = '0px';
            searchDiv2.style.width = '30px';
            buttonCount2--;
        }
        else {
        }
    }
});