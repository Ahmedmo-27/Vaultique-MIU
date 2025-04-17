function toggleWishlist(element) 
{
    element.classList.toggle('filled');
}

function openFilterPanel() 
{
    document.getElementById('filterPanel').classList.add('open');
    document.getElementById('overlay').classList.add('show');
}

function closeFilterPanel() 
{
    document.getElementById('filterPanel').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', function () 
{
    const allProducts = Array.from(document.querySelectorAll('.product-card'));
    let filteredProducts = [...allProducts];
    const productGrid = document.querySelector('.product-grid');
    const filters = 
    {
        brands: document.getElementById('brand'),
        strap: document.getElementById('Strap_Material'),
        movement: document.getElementById('Movement'),
        waterResistance: document.getElementById('Water_Resistance'),
        caseMaterial: document.getElementById('Case_Material'),
        priceFrom: document.getElementById('priceRangeFrom'),
        priceTo: document.getElementById('priceRangeTo'),
        dialColors: document.querySelectorAll('.dial-color')
    };
    let currentSort = 'default';

    const sortMethods = 
    {
        'default': (products) => products.slice().sort((a, b) => 
            allProducts.indexOf(a) - allProducts.indexOf(b)),
        'new': (products) => products.slice().sort((a, b) => 
            new Date(b.dataset.date) - new Date(a.dataset.date)),
        'price-asc': (products) => products.slice().sort((a, b) => 
            parseFloat(a.dataset.price) - parseFloat(b.dataset.price)),
        'price-desc': (products) => products.slice().sort((a, b) => 
            parseFloat(b.dataset.price) - parseFloat(a.dataset.price)),
        'popularity': (products) => products.slice().sort((a, b) => 
            parseInt(b.dataset.views) - parseInt(a.dataset.views))
    };

    // Event Listeners
    document.querySelectorAll('[data-sort]').forEach(button => 
    {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            currentSort = this.dataset.sort;
            applyFilters();
            closeFilterPanel();
        });
    });

    document.querySelector('.submit').addEventListener('click', function(e) 
    {
        e.preventDefault();
        applyFilters();
        closeFilterPanel();
    });

    document.querySelector('.clear').addEventListener('click', function(e) 
    {
        e.preventDefault();
        resetFilters();
        applyFilters();
    });

    // Core Functions
    function resetFilters() 
    {
        filters.brands.value = 'All';
        filters.strap.value = 'All';
        filters.movement.value = 'All';
        filters.waterResistance.value = 'All';
        filters.caseMaterial.value = 'All';
        filters.priceFrom.value = '0';
        filters.priceTo.value = '500000';
        filters.dialColors.forEach(filter => filter.checked = false);
    }

    function applyFilters() 
    {
        filteredProducts = allProducts.filter(product => {
            const price = parseFloat(product.dataset.price);
            const dialColor = product.dataset.dialColor;
            
            return checkBrand(product) &&
                   checkStrapMaterial(product) &&
                   checkMovement(product) &&
                   checkWaterResistance(product) &&
                   checkCaseMaterial(product) &&
                   checkPriceRange(price) &&
                   checkDialColor(dialColor);
        });

        updateProductDisplay();
    }

    function checkBrand(product) 
    {
        return filters.brands.value === 'All' || 
               product.dataset.brand === filters.brands.value;
    }

    function checkStrapMaterial(product) 
    {
        return filters.strap.value === 'All' || 
               product.dataset.strapMaterial === filters.strap.value;
    }

    function checkMovement(product) 
    {
        return filters.movement.value === 'All' || 
               product.dataset.movement === filters.movement.value;
    }

    function checkWaterResistance(product) 
    {
        return filters.waterResistance.value === 'All' || 
               product.dataset.waterResistance === filters.waterResistance.value;
    }

    function checkCaseMaterial(product) 
    {
        return filters.caseMaterial.value === 'All' || 
               product.dataset.caseMaterial === filters.caseMaterial.value;
    }

    function checkPriceRange(price) 
    {
        const from = parseFloat(filters.priceFrom.value) || 0;
        const to = parseFloat(filters.priceTo.value) || 500000;
        return price >= from && price <= to;
    }

    function checkDialColor(color) 
    {
        const selectedColors = Array.from(filters.dialColors)
            .filter(c => c.checked)
            .map(c => c.value);
        return selectedColors.length === 0 || 
               selectedColors.includes('All') || 
               selectedColors.includes(color);
    }

    function updateProductDisplay() 
    {
        productGrid.innerHTML = '';
        
        const sortedProducts = sortMethods[currentSort](filteredProducts);
        const fragment = document.createDocumentFragment();
        
        sortedProducts.forEach(product => {
            const clone = product.cloneNode(true);
            fragment.appendChild(clone);
        });

        productGrid.appendChild(fragment);

        setTimeout(() => {
            const productCards = productGrid.querySelectorAll('.product-card');
            productCards.forEach(card => {
                card.style.animation = 'none';
                requestAnimationFrame(() => {
                    card.style.animation = 'product-grid-animation 0.8s ease-out';
                });
            });
        }, 50);
    }

    applyFilters();
});