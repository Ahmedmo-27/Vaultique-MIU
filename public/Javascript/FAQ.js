document.addEventListener('DOMContentLoaded', function() {
    // Toggle FAQ answers with smooth dropdown animation
    const questions = document.querySelectorAll('.faq-question');
    
    questions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const icon = this.querySelector('i');
            
            // Close all other open FAQs before opening this one
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = '0';
                    item.querySelector('.faq-question i').style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current FAQ
            const isOpening = !faqItem.classList.contains('active');
            faqItem.classList.toggle('active');
            
            // Animate dropdown
            if (isOpening) {
                // Open the dropdown
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            } else {
                // Close the dropdown
                answer.style.maxHeight = '0';
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Category filtering functionality
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            const faqItems = document.querySelectorAll('.faq-item');
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            
            // Filter items based on category and search term
            faqItems.forEach(item => {
                const question = item.querySelector('h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
                const itemCategory = item.dataset.category;
                
                const matchesCategory = category === 'all' || itemCategory === category;
                const matchesSearch = searchTerm === '' || question.includes(searchTerm) || answer.includes(searchTerm);
                
                if (matchesCategory && matchesSearch) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Update no results message
            const visibleItems = Array.from(faqItems).filter(item => item.style.display !== 'none');
            showNoResults(visibleItems.length === 0 && (searchTerm.length > 0 || category !== 'all'));
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('faq-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const faqItems = document.querySelectorAll('.faq-item');
            const activeCategory = document.querySelector('.category-btn.active').dataset.category;
            let visibleCount = 0;
            
            faqItems.forEach(item => {
                const question = item.querySelector('h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
                const itemCategory = item.dataset.category;
                
                const matchesSearch = searchTerm === '' || question.includes(searchTerm) || answer.includes(searchTerm);
                const matchesCategory = activeCategory === 'all' || itemCategory === activeCategory;
                
                if (matchesSearch && matchesCategory) {
                    item.style.display = 'block';
                    item.classList.add('highlighted');
                    visibleCount++;
                    
                    // Remove highlight after animation
                    setTimeout(() => {
                        item.classList.remove('highlighted');
                    }, 500);
                } else {
                    item.style.display = 'none';
                    item.classList.remove('highlighted');
                }
            });
            
            // Show no results message if no items match
            showNoResults(visibleCount === 0 && (searchTerm.length > 0 || activeCategory !== 'all'));
        });
    }
    
    // Function to show/hide no results message
    function showNoResults(show) {
        let noResultsDiv = document.querySelector('.no-results');
        
        if (show && !noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try searching with different keywords or browse our categories above.</p>
            `;
            document.querySelector('.faq-list').appendChild(noResultsDiv);
        } else if (!show && noResultsDiv) {
            noResultsDiv.remove();
        }
    }
});