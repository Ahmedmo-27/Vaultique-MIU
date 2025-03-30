// arrow.js - Version that stops at footer
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const sections = document.querySelectorAll('section');
    const footer = document.querySelector('footer');
    let isScrolling = false;
    let autoScrollTimeout;
    let currentSection = 0;
    const SCROLL_INTERVAL = 10000; // 10 seconds auto-scroll interval
    const FOOTER_OFFSET = 50; // Space to ensure footer is fully visible

    // Initialize scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    function getHeaderHeight() {
        const header = document.querySelector('header');
        return header ? header.offsetHeight : 100;
    }

    function scrollToSection(index) {
        if (isScrolling || index < 0 || index >= sections.length) return;
        
        isScrolling = true;
        resetAutoScrollTimer();
        currentSection = index;

        const target = sections[index];
        const targetPosition = target.offsetTop - getHeaderHeight();
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = ease(progress);
            
            window.scrollTo(0, startPosition + distance * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isScrolling = false;
                updateScrollIndicator();
            }
        }
        requestAnimationFrame(animate);
    }

    function scrollToFooter() {
        if (isScrolling) return;
        
        isScrolling = true;
        resetAutoScrollTimer();

        const targetPosition = document.body.scrollHeight - window.innerHeight;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = ease(progress);
            
            window.scrollTo(0, startPosition + distance * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isScrolling = false;
                updateScrollIndicator();
                // Stop auto-scroll when reaching footer
                clearTimeout(autoScrollTimeout);
            }
        }
        requestAnimationFrame(animate);
    }

    function ease(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function resetAutoScrollTimer() {
        clearTimeout(autoScrollTimeout);
        const isAtFooter = window.scrollY + window.innerHeight >= document.body.scrollHeight - FOOTER_OFFSET;
        if (!isAtFooter) {
            autoScrollTimeout = setTimeout(autoScrollToNext, SCROLL_INTERVAL);
        }
    }

    function updateScrollIndicator() {
        const atFooter = window.scrollY + window.innerHeight >= document.body.scrollHeight - FOOTER_OFFSET;
        scrollIndicator.classList.toggle('hidden', atFooter);
        scrollIndicator.classList.toggle('animate', !atFooter);
    }

    function handleScroll() {
        if (isScrolling) return;
        
        resetAutoScrollTimer();
        
        // Determine current section based on scroll position
        const scrollPosition = window.scrollY + (window.innerHeight / 2);
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            if (scrollPosition >= section.offsetTop && 
                scrollPosition < section.offsetTop + section.offsetHeight) {
                currentSection = i;
                break;
            }
        }
        
        updateScrollIndicator();
    }

    function autoScrollToNext() {
        if (isScrolling) return;

        const windowHeight = window.innerHeight;
        const currentScroll = window.scrollY;
        const documentHeight = document.body.scrollHeight;
        const isAtFooter = currentScroll + windowHeight >= documentHeight - FOOTER_OFFSET;

        if (isAtFooter) {
            // Do nothing - we're already at footer
            return;
        } else if (currentSection < sections.length - 1) {
            scrollToSection(currentSection + 1);
        } else {
            scrollToFooter();
        }
    }

    function initializeScroll() {
        scrollIndicator.classList.add('animate');
        resetAutoScrollTimer();

        window.addEventListener('scroll', handleScroll);

        scrollIndicator.addEventListener('click', () => {
            if (currentSection < sections.length - 1) {
                scrollToSection(currentSection + 1);
            } else {
                scrollToFooter();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
                resetAutoScrollTimer();
                
                if (e.key === 'ArrowDown') {
                    if (currentSection < sections.length - 1) {
                        scrollToSection(currentSection + 1);
                    } else {
                        scrollToFooter();
                    }
                } else {
                    if (currentSection > 0) {
                        scrollToSection(currentSection - 1);
                    }
                }
            }
        });
    }

    setTimeout(() => {
        loadingScreen.classList.add('hide');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            initializeScroll();
        }, 1200);
    }, 3000);

    window.addEventListener('beforeunload', () => {
        clearTimeout(autoScrollTimeout);
    });
});