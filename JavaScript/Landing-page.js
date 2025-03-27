document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const videos = document.querySelectorAll('video');
    let currentSection = 0;
    let isScrolling = false;
    let lastScrollTime = Date.now();
    let lastScrollTop = 0;
    let ticking = false;
    let scrollTimeout;
     // Add event listener for arrow keys
     window.addEventListener('keydown', handleKeyDown);
     document.body.style.overflowX = 'hidden';
    
    // Force scroll to top on page load
    window.scrollTo({
        top: 0,
        behavior: 'instant'
    });

    // Function to handle smooth scrolling
    function smoothScroll(targetSection) {
        if (isScrolling) return;
        isScrolling = true;

        const target = sections[targetSection];
        const startPosition = window.pageYOffset;
        const targetPosition = target.offsetTop;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        /*function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                isScrolling = false;
                currentSection = targetSection;
                updateScrollIndicator();
            }
        }

        requestAnimationFrame(animation);
    }*/

        

    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            isScrolling = false;
            currentSection = targetSection;
            
            // Automatically scroll to footer if it's the last section
            if (currentSection === sections.length - 1) {
                setTimeout(() => {
                    smoothScrollTo(document.body.scrollHeight);
                }, 500);
            } else {
                updateScrollIndicator();
            }
        }
    }

    requestAnimationFrame(animation);
}


    // Easing function for smooth scrolling
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

     // Handle arrow key events
     function handleKeyDown(e) {
        const windowHeight = window.innerHeight;
        const currentScroll = window.scrollY;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        const lastSection = sections[sections.length - 1];
        const lastSectionBottom = lastSection.offsetTop + lastSection.offsetHeight;
        const isInFooter = currentScroll + windowHeight >= documentHeight - 10;
        
        if (e.key === 'ArrowDown') {
            // Only scroll to footer if we're at the bottom of the last section
            if (currentSection === sections.length - 1 && currentScroll + windowHeight >= lastSectionBottom) {
                smoothScrollTo(documentHeight);
            } else if (currentSection < sections.length - 1) {
                smoothScroll(currentSection + 1);
            }
        } else if (e.key === 'ArrowUp') {
            if (isInFooter) {
                // If in footer, scroll to last section
                smoothScrollTo(lastSection.offsetTop);
                currentSection = sections.length - 1;
            } else if (currentSection > 0) {
                smoothScroll(currentSection - 1);
            }
        }
    }

    // Function to smoothly scroll to a specific position
    function smoothScrollTo(targetPosition) {
        if (isScrolling) return;
        isScrolling = true;

        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                isScrolling = false;
                updateScrollIndicator();
            }
        }

        requestAnimationFrame(animation);
    }

    // Handle wheel events for smooth scrolling
    function handleWheel(e) {
        e.preventDefault();
        
        const now = Date.now();
        if (now - lastScrollTime < 1000) return; // Prevent rapid scrolling
        
        const windowHeight = window.innerHeight;
        const currentScroll = window.scrollY;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        const lastSection = sections[sections.length - 1];
        const lastSectionBottom = lastSection.offsetTop + lastSection.offsetHeight;
        const isInFooter = currentScroll + windowHeight >= documentHeight - 10;
        
        if (e.deltaY > 0) {
            // Only scroll to footer if we're at the bottom of the last section
            if (currentSection === sections.length - 1 && currentScroll + windowHeight >= lastSectionBottom) {
                smoothScrollTo(documentHeight);
            } else if (currentSection < sections.length - 1) {
                smoothScroll(currentSection + 1);
            }
        } else if (e.deltaY < 0) {
            if (isInFooter) {
                // If in footer, scroll to last section
                smoothScrollTo(lastSection.offsetTop);
                currentSection = sections.length - 1;
            } else if (currentSection > 0) {
                smoothScroll(currentSection - 1);
            }
        }
        
        lastScrollTime = now;
    }

    // Header visibility on scroll
    function handleHeaderVisibility() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollTop && currentScrollY > 100) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = currentScrollY;
    }

    // Initialize scroll functionality
    function initializeScroll() {
        scrollIndicator.classList.add('animate');

        // Handle scroll events
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);

            if (window.scrollY > 100) {
                scrollIndicator.classList.remove('animate');
                scrollIndicator.classList.add('add');
            } else {
                scrollIndicator.classList.remove('add');
                scrollIndicator.classList.add('animate');
            }

            handleHeaderVisibility();

            scrollTimeout = setTimeout(() => {
                lastScrollTime = Date.now();
            }, 150);
        });

        // Handle wheel events
        window.addEventListener('wheel', handleWheel, { passive: false });

        // Handle click events
        scrollIndicator.addEventListener('click', () => {
            if (currentSection < sections.length - 1) {
                smoothScroll(currentSection + 1);
            }
        });

        // Handle menu toggle
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
        });


    }

    // Simulate loading delay
    setTimeout(() => {
        loadingScreen.classList.add('hide');

        setTimeout(() => {
            loadingScreen.style.display = 'none';
            scrollIndicator.classList.add('visible');
            initializeScroll();
        }, 1200);
    }, 3000);

    // Video handling
    function initVideos() {
        videos.forEach(video => {
            video.muted = true;
            video.playsInline = true;
            
            video.addEventListener('loadeddata', () => {
                video.play().catch(error => {
                    console.log('Video autoplay failed:', error);
                });
            });
            
            video.addEventListener('error', () => {
                console.log('Video loading error');
            });
        });
    }

    // Intersection Observer for section visibility
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                currentSection = Array.from(sections).indexOf(entry.target);
                updateScrollIndicator();
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Scroll indicator
    function updateScrollIndicator() {
        const windowHeight = window.innerHeight;
        const currentScroll = window.scrollY;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        // Only hide indicator when we're actually at the bottom of the page
        if (currentScroll + windowHeight >= documentHeight - 10) {
            scrollIndicator.classList.add('hidden');
            scrollIndicator.classList.remove('visible');
        } else {
            scrollIndicator.classList.remove('hidden');
            scrollIndicator.classList.add('visible');
        }
    }

    

    // Initialize videos
    initVideos();

    
}); 