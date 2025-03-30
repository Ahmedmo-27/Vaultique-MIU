document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadingScreen = document.querySelector('.loading-screen');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('.header');
    const allSections = document.querySelectorAll('section');
    const videos = document.querySelectorAll('video');
    
    // Separate main section from content sections
    const mainSection = document.querySelector('.main');
    const contentSections = Array.from(allSections).filter(section => section !== mainSection);
    
    // Scroll Control Variables
    let currentSectionIndex = -1; // -1 = main section, 0+ = content sections
    let isScrolling = false;
    let lastScrollTime = Date.now();
    let lastScrollTop = 0;
    let scrollTimeout;
    let autoScrollTimeout;
    const SCROLL_INTERVAL = 20000; // 20 seconds for content sections
    const MAIN_SECTION_INTERVAL = 5000; // 5 seconds for main section
    const FOOTER_OFFSET = 50;

    // Initialize
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflowX = 'hidden';
    window.scrollTo({ top: 0, behavior: 'instant' });
    initVideos();
    setupIntersectionObserver();

    // Main Functions --------------------------------------------------------

    function getHeaderHeight() {
        if (header) {
            const style = window.getComputedStyle(header);
            return header.offsetHeight + 
                   parseInt(style.marginTop) + 
                   parseInt(style.marginBottom);
        }
        return 100; // Fallback
    }

    function getCurrentDelay() {
        return currentSectionIndex === -1 ? MAIN_SECTION_INTERVAL : SCROLL_INTERVAL;
    }

    function smoothScrollToSection(targetIndex) {
        if (isScrolling) return;
        isScrolling = true;
        resetAutoScrollTimer();

        const headerHeight = getHeaderHeight();
        let targetElement, targetPosition;

        if (targetIndex === -1) {
            // Scroll to main section
            targetElement = mainSection;
            targetPosition = 0;
        } else {
            // Scroll to content section
            targetElement = contentSections[targetIndex];
            targetPosition = Math.max(0, targetElement.offsetTop - headerHeight);
            
            // Adjust for video preservation
            const video = targetElement.querySelector('video');
            if (video) {
                const videoBottom = targetElement.offsetTop + video.offsetHeight;
                const windowHeight = window.innerHeight;
                targetPosition = Math.min(targetPosition, videoBottom - windowHeight);
            }
        }

        const startPosition = window.pageYOffset;
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
                currentSectionIndex = targetIndex;
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

    // Event Handlers -------------------------------------------------------

    function handleKeyDown(e) {
        if (['ArrowDown', 'ArrowUp', 'Space'].includes(e.key)) {
            e.preventDefault();
        }
        resetAutoScrollTimer();
        
        const headerHeight = getHeaderHeight();
        const isAtFooter = window.scrollY + window.innerHeight >= document.body.scrollHeight - FOOTER_OFFSET;
        
        if (e.key === 'ArrowDown' || e.key === 'Space') {
            if (currentSectionIndex === -1) {
                // From main to first content section
                smoothScrollToSection(0);
            } else if (currentSectionIndex < contentSections.length - 1) {
                // To next content section
                smoothScrollToSection(currentSectionIndex + 1);
            } else if (!isAtFooter) {
                // To footer
                scrollToFooter();
            }
        } else if (e.key === 'ArrowUp') {
            if (isAtFooter) {
                // From footer to last content section
                smoothScrollToSection(contentSections.length - 1);
            } else if (currentSectionIndex === 0) {
                // From first content section to main
                smoothScrollToSection(-1);
            } else if (currentSectionIndex > 0) {
                // To previous content section
                smoothScrollToSection(currentSectionIndex - 1);
            }
        }
    }

    function handleWheel(e) {
        e.preventDefault();
        resetAutoScrollTimer();
        
        const now = Date.now();
        if (now - lastScrollTime < 1000) return;
        
        const isAtFooter = window.scrollY + window.innerHeight >= document.body.scrollHeight - FOOTER_OFFSET;
        
        if (e.deltaY > 0) { // Scrolling down
            if (currentSectionIndex === -1) {
                smoothScrollToSection(0);
            } else if (currentSectionIndex < contentSections.length - 1) {
                smoothScrollToSection(currentSectionIndex + 1);
            } else if (!isAtFooter) {
                scrollToFooter();
            }
        } else if (e.deltaY < 0) { // Scrolling up
            if (isAtFooter) {
                smoothScrollToSection(contentSections.length - 1);
            } else if (currentSectionIndex === 0) {
                smoothScrollToSection(-1);
            } else if (currentSectionIndex > 0) {
                smoothScrollToSection(currentSectionIndex - 1);
            }
        }
        
        lastScrollTime = now;
    }

    // Auto-scroll Functions ------------------------------------------------

    function resetAutoScrollTimer() {
        clearTimeout(autoScrollTimeout);
        const isAtFooter = window.scrollY + window.innerHeight >= document.body.scrollHeight - FOOTER_OFFSET;
        if (!isAtFooter) {
            autoScrollTimeout = setTimeout(autoScrollToNext, getCurrentDelay());
        }
    }

    function autoScrollToNext() {
        if (isScrolling) return;
        
        const isAtFooter = window.scrollY + window.innerHeight >= document.body.scrollHeight - FOOTER_OFFSET;
        if (isAtFooter) return;

        if (currentSectionIndex === -1) {
            smoothScrollToSection(0); // Main to first content
        } else if (currentSectionIndex < contentSections.length - 1) {
            smoothScrollToSection(currentSectionIndex + 1); // Next content
        } else {
            scrollToFooter(); // Last content to footer
        }
    }

    // Helper Functions -----------------------------------------------------

    function ease(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function updateScrollIndicator() {
        const atFooter = window.scrollY + window.innerHeight >= document.body.scrollHeight - FOOTER_OFFSET;
        scrollIndicator.classList.toggle('hidden', atFooter || currentSectionIndex === -1);
        scrollIndicator.classList.toggle('visible', !atFooter && currentSectionIndex !== -1);
    }

    function handleHeaderVisibility() {
        const currentScroll = window.scrollY;
        header.classList.toggle('header-hidden', currentScroll > lastScrollTop && currentScroll > 100);
        lastScrollTop = currentScroll;
    }

    // Initialization Functions ---------------------------------------------

    function initVideos() {
        videos.forEach(video => {
            video.muted = true;
            video.playsInline = true;
            video.play().catch(e => console.log('Video autoplay failed:', e));
        });
    }

    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target === mainSection) {
                        currentSectionIndex = -1;
                    } else {
                        currentSectionIndex = contentSections.indexOf(entry.target);
                    }
                    updateScrollIndicator();
                }
            });
        }, { threshold: 0.5 });

        if (mainSection) observer.observe(mainSection);
        contentSections.forEach(section => observer.observe(section));
    }

    function initializeScroll() {
        updateScrollIndicator();
        resetAutoScrollTimer();

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            resetAutoScrollTimer();
            handleHeaderVisibility();
            scrollTimeout = setTimeout(() => lastScrollTime = Date.now(), 150);
        });

        window.addEventListener('wheel', handleWheel, { passive: false });
        
        scrollIndicator.addEventListener('click', () => {
            if (currentSectionIndex === -1) {
                smoothScrollToSection(0);
            } else if (currentSectionIndex < contentSections.length - 1) {
                smoothScrollToSection(currentSectionIndex + 1);
            } else {
                const isAtFooter = window.scrollY + window.innerHeight >= document.body.scrollHeight - FOOTER_OFFSET;
                if (!isAtFooter) {
                    scrollToFooter();
                }
            }
        });

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.body.classList.toggle('menu-open');
            });
        }
    }

    // Start the page -------------------------------------------------------
    setTimeout(() => {
        loadingScreen.classList.add('hide');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            initializeScroll();
        }, 1200);
    }, 3000);
});