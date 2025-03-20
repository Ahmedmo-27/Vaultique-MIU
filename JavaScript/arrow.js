document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const sections = document.querySelectorAll('section');
    const footer = document.querySelector('footer');
    const videos = document.querySelectorAll('video');
    let isScrolling = false;
    let autoScrollInterval;
    let lastScrollTime = Date.now();
    let currentSection = 0;
    window.scrollTo(0,0);
  
    // Function to handle smooth scrolling
    function smoothScroll(direction = 'down') {
        if (isScrolling) return;
        isScrolling = true;
  
        const windowHeight = window.innerHeight;
        const currentScroll = window.scrollY;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        // Find current section
        let currentSectionIndex = 0;
        sections.forEach((section, index) => {
            if (currentScroll >= section.offsetTop - windowHeight/2) {
                currentSectionIndex = index;
            }
        });

        // Check if we're in the footer
        const lastSection = sections[sections.length - 1];
        const lastSectionBottom = lastSection.offsetTop + lastSection.offsetHeight;
        const isInFooter = currentScroll + windowHeight >= documentHeight - 10;

        if (direction === 'up' && isInFooter) {
            // If scrolling up from footer, go to last section
            const duration = 1000;
            const start = currentScroll;
            const distance = lastSection.offsetTop - currentScroll;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);

                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                window.scrollTo(0, start + (distance * easeProgress));

                if (progress < 1) {
                    requestAnimationFrame(animation);
                } else {
                    isScrolling = false;
                    lastScrollTime = Date.now();
                    currentSection = sections.length - 1;
                    updateScrollIndicator();
                }
            }

            requestAnimationFrame(animation);
            return;
        }

        // Normal section scrolling
        const nextSection = sections[currentSectionIndex + (direction === 'up' ? -1 : 1)];
        
        // If there's no next section and we're at the last section going down
        if (!nextSection && currentSectionIndex === sections.length - 1 && direction === 'down') {
            // If we're at the bottom of the last section, scroll to footer
            if (currentScroll + windowHeight >= lastSectionBottom) {
                const footerOffset = footer ? footer.offsetTop : documentHeight;
                const duration = 1000;
                const start = currentScroll;
                const distance = footerOffset - currentScroll;
                let startTime = null;

                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / duration, 1);

                    const easeProgress = progress < 0.5
                        ? 2 * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                    window.scrollTo(0, start + (distance * easeProgress));

                    if (progress < 1) {
                        requestAnimationFrame(animation);
                    } else {
                        isScrolling = false;
                        lastScrollTime = Date.now();
                        updateScrollIndicator();
                    }
                }

                requestAnimationFrame(animation);
            }
            return;
        }
        
        // If there's a next section, scroll to it
        if (nextSection) {
            const duration = 1000;
            const start = currentScroll;
            const distance = nextSection.offsetTop - currentScroll;
            let startTime = null;
      
            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
      
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
                window.scrollTo(0, start + (distance * easeProgress));
      
                if (progress < 1) {
                    requestAnimationFrame(animation);
                } else {
                    isScrolling = false;
                    lastScrollTime = Date.now();
                    currentSection = currentSectionIndex + (direction === 'up' ? -1 : 1);
                    updateScrollIndicator();
                }
            }
      
            requestAnimationFrame(animation);
        }
    }
  
    // Function to update scroll indicator visibility
    function updateScrollIndicator() {
        const currentScroll = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        // Only hide indicator when we're actually viewing the footer
        if (currentScroll + windowHeight >= documentHeight - 10) {
            scrollIndicator.classList.remove('animate');
            scrollIndicator.classList.add('hidden');
        } else {
            scrollIndicator.classList.remove('hidden');
            scrollIndicator.classList.add('animate');
        }
    }
  
    // Function to start auto-scrolling
    function startAutoScroll() {
        // Clear any existing interval
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
  
        // Start new interval
        autoScrollInterval = setInterval(() => {
            const currentTime = Date.now();
            const timeSinceLastScroll = currentTime - lastScrollTime;
            const currentScroll = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            const lastSection = sections[sections.length - 1];
            const lastSectionBottom = lastSection.offsetTop + lastSection.offsetHeight;
  
            // Only scroll if enough time has passed
            if (timeSinceLastScroll >= 6000) {
                // If we're at the last section and haven't reached the footer yet
                if (currentSection === sections.length - 1 && 
                    currentScroll + windowHeight >= lastSectionBottom &&
                    currentScroll + windowHeight < documentHeight - 10) {
                    // Scroll to footer
                    const duration = 1000;
                    const start = currentScroll;
                    const distance = documentHeight - windowHeight - currentScroll;
                    let startTime = null;
  
                    function animation(currentTime) {
                        if (startTime === null) startTime = currentTime;
                        const timeElapsed = currentTime - startTime;
                        const progress = Math.min(timeElapsed / duration, 1);
  
                        const easeProgress = progress < 0.5
                            ? 2 * progress * progress
                            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  
                        window.scrollTo(0, start + (distance * easeProgress));
  
                        if (progress < 1) {
                            requestAnimationFrame(animation);
                        } else {
                            isScrolling = false;
                            lastScrollTime = Date.now();
                            updateScrollIndicator();
                        }
                    }
  
                    requestAnimationFrame(animation);
                } else if (currentScroll + windowHeight < documentHeight - 10) {
                    // Normal section scrolling
                    smoothScroll('down');
                }
            }
  
            // If we're at the bottom, clear the interval
            if (currentScroll + windowHeight >= documentHeight - 10) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
  
            updateScrollIndicator();
        }, 6000); // Check every 6 seconds
    }
  
    // Function to initialize scroll functionality
    function initializeScroll() {
        // Add initial animation
        scrollIndicator.classList.add('animate');
  
        // Handle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            // Clear existing timeout
            clearTimeout(scrollTimeout);
  
            updateScrollIndicator();
  
            // Check if we're not at the bottom and restart auto-scroll if needed
            const currentScroll = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            
            if (currentScroll + windowHeight < documentHeight - 10) {
                if (!autoScrollInterval) {
                    lastScrollTime = Date.now();
                    startAutoScroll();
                }
            }
  
            // Reset scroll timeout
            scrollTimeout = setTimeout(() => {
                lastScrollTime = Date.now();
            }, 150);
        });
  
        // Handle click events
        scrollIndicator.addEventListener('click', () => {
            smoothScroll('down');
            // Reset the auto-scroll timer when manually clicked
            startAutoScroll();
        });
  
        // Start auto-scrolling
        startAutoScroll();
    }
  
    // Simulate loading delay (3 seconds)
    setTimeout(() => {
        // Add hide class to trigger slide-up animation
        loadingScreen.classList.add('hide');
  
        // Show the scroll indicator after the slide-up transition
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            scrollIndicator.classList.add('visible');
            initializeScroll();
        }, 1200); // Match the slide-up transition duration
    }, 3000);
  
    // Clean up interval when the page is unloaded
    window.addEventListener('beforeunload', () => {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
    });
}); 