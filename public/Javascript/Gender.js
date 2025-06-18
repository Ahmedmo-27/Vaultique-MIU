document.addEventListener('DOMContentLoaded', function() {
    // Handle hero video
    const videoSource = document.getElementById('heroVideoSource');
    const fallbackContent = document.querySelector('.fallback-content');
    
    if (videoSource) {
        videoSource.addEventListener('error', function() {
            console.log('Video failed to load, showing fallback content');
            this.parentElement.style.display = 'none';
            if (fallbackContent) {
                fallbackContent.style.display = 'flex';
            }
        });

        // Try to play video
        const video = videoSource.parentElement;
        if (video) {
            video.play().catch(error => {
                console.log('Video autoplay failed:', error);
                video.parentElement.style.display = 'none';
                if (fallbackContent) {
                    fallbackContent.style.display = 'flex';
                }
            });
        }
    }

    // Handle cover image
    const coverImage = document.getElementById('pageCoverImage');
    if (coverImage) {
        coverImage.addEventListener('error', function() {
            console.log('Cover image failed to load');
            this.style.display = 'none';
        });
    }

    // Handle featured models slider
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevButton = document.getElementById('prevSlide');
        const nextButton = document.getElementById('nextSlide');
        let currentSlide = 0;
        let slideInterval;

        function updateSlides() {
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentSlide);
                slide.setAttribute('aria-hidden', index !== currentSlide);
                slide.setAttribute('tabindex', index === currentSlide ? '0' : '-1');
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
                dot.setAttribute('aria-current', index === currentSlide ? 'true' : 'false');
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlides();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlides();
        }

        // Initialize slider
        if (slides.length > 0) {
            updateSlides();
            
            // Auto-advance slides
            function startSlideInterval() {
                slideInterval = setInterval(nextSlide, 5000);
            }

            function stopSlideInterval() {
                clearInterval(slideInterval);
            }

            // Event listeners
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    stopSlideInterval();
                    prevSlide();
                    startSlideInterval();
                });
            }

            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    stopSlideInterval();
                    nextSlide();
                    startSlideInterval();
                });
            }

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    stopSlideInterval();
                    currentSlide = index;
                    updateSlides();
                    startSlideInterval();
                });
            });

            // Start auto-advance
            startSlideInterval();

            // Pause on hover
            sliderContainer.addEventListener('mouseenter', stopSlideInterval);
            sliderContainer.addEventListener('mouseleave', startSlideInterval);
        } else {
            console.log('No slides found, hiding slider');
            sliderContainer.style.display = 'none';
        }
    }

    // Handle filter panel
    const filterBtn = document.querySelector('[data-action="open-filter-panel"]');
    const filterPanel = document.getElementById('filterPanel');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.querySelector('[data-action="close-filter-panel"]');

    if (filterBtn && filterPanel && overlay && closeBtn) {
        filterBtn.addEventListener('click', () => {
            filterPanel.classList.add('open');
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        function closeFilterPanel() {
            filterPanel.classList.remove('open');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeFilterPanel);
        overlay.addEventListener('click', closeFilterPanel);

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && filterPanel.classList.contains('open')) {
                closeFilterPanel();
            }
        });
    }
}); 