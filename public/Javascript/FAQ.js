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
            
            // Filter items based on category
            faqItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('faq-search');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('h3').textContent.toLowerCase();
            if (question.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});