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
    const products = document.querySelectorAll('.product-card');
    const brands_filter = document.getElementById('brand');
    const strap_filter = document.getElementById('Strap_Material');
    const movement_filter = document.getElementById('Movement');
    const water_resistance_filter = document.getElementById('Water_Resistance');
    const case_material_filter = document.getElementById('Case_Material');
    const price_range_from = document.getElementById('priceRangeFrom');
    const price_range_to = document.getElementById('priceRangeTo');
    const dial_color_filter = document.querySelectorAll('.dial-color');
    const sortButtons = document.querySelectorAll('[data-sort]');
    const productGrid = document.querySelector('.product-grid');
    let currentSort = 'default';
    
    sortButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sortType = this.dataset.sort;
            sortProducts(sortType);
            closeFilterPanel();
        });
    });

    const originalOrder = [...products];

    const sortMethods = 
    {
        'default': () => originalOrder,
        'new': () => [...products].sort((a, b) => 
            new Date(b.dataset.date) - new Date(a.dataset.date)),
        'price-asc': () => [...products].sort((a, b) => 
            parseFloat(a.dataset.price) - parseFloat(b.dataset.price)),
        'price-desc': () => [...products].sort((a, b) => 
            parseFloat(b.dataset.price) - parseFloat(a.dataset.price)),
        'popularity': () => [...products].sort((a, b) => 
            parseInt(b.dataset.views) - parseInt(a.dataset.views))
    };

    // Sort button handler
    document.querySelectorAll('.sort-options button').forEach(button => {
        button.addEventListener('click', (e) => {
            const sortType = e.target.dataset.sort || 'default';
            currentSort = sortType;
            updateProductDisplay();
        });
    });

    // Update display function
    function updateProductDisplay() 
    {
        // Clear existing products
        productGrid.innerHTML = '';
        
        // Get sorted products
        const sortedProducts = sortMethods[currentSort]();
        
        // Re-insert products
        sortedProducts.forEach(product => {
            productGrid.appendChild(product);
        });
    }

    updateProductDisplay();

    function filterProducts() 
    {
        const chosen_brands = brands_filter.value;
        const chosen_strap = strap_filter.value;
        const chosen_movement = movement_filter.value;
        const chosen_water_resistance = water_resistance_filter.value;
        const chosen_case_material = case_material_filter.value;
        const chosen_price_from = parseFloat(price_range_from.value) || 0;
        const chosen_price_to = parseFloat(price_range_to.value) || 500000;
        const chosen_dial_color = Array.from(dial_color_filter)
            .filter(filter => filter.checked)
            .map(filter => filter.value);

        products.forEach(product => 
        {
            const productBrand = product.getAttribute('data-brand');
            const productStrap = product.getAttribute('data-strap-material');
            const productMovement = product.getAttribute('data-movement');
            const productWaterResistance = product.getAttribute('data-water-resistance');
            const productCaseMaterial = product.getAttribute('data-case-material');
            const productPrice = parseFloat(product.getAttribute('data-price'));
            const productDialColor = product.getAttribute('data-dial-color');

            const brandMatch = chosen_brands === 'All' || chosen_brands === productBrand;
            const strapMatch = chosen_strap === 'All' || chosen_strap === productStrap;
            const movementMatch = chosen_movement === 'All' || chosen_movement === productMovement;
            const waterResistanceMatch = chosen_water_resistance === 'All' || chosen_water_resistance === productWaterResistance;
            const caseMaterialMatch = chosen_case_material === 'All' || chosen_case_material === productCaseMaterial;
            const priceMatch = productPrice >= chosen_price_from && productPrice <= chosen_price_to;
            const dialColorMatch = chosen_dial_color.length === 0 || chosen_dial_color.includes('All') || chosen_dial_color.includes(productDialColor);

            if (brandMatch && strapMatch && movementMatch && waterResistanceMatch && caseMaterialMatch && priceMatch && dialColorMatch) 
            {
                product.style.display = 'block';
            } 
            else 
            {
                product.style.display = 'none';
            }
        });
    }

    document.querySelector('.submit').addEventListener('click', function (event) 
    {
        event.preventDefault();
        filterProducts();
        closeFilterPanel();
    });

    document.querySelector('.clear').addEventListener('click', function (event) 
    {
        event.preventDefault();
        brands_filter.value = 'All';
        strap_filter.value = 'All';
        movement_filter.value = 'All';
        water_resistance_filter.value = 'All';
        case_material_filter.value = 'All';
        price_range_from.value = '0';
        price_range_to.value = '500000';
        dial_color_filter.forEach(filter => filter.checked = false);
        filterProducts();
    });

    filterProducts();
});