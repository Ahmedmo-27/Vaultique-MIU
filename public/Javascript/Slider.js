document.addEventListener('DOMContentLoaded', () => {
  console.log('Slider.js loaded');

  // Initialize slider immediately and retry if needed
  initializeSlider();
  
  // Retry initialization after a short delay if needed
  setTimeout(() => {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) {
      console.log('Retrying slider initialization...');
      initializeSlider();
    }
  }, 500);

  function initializeSlider() {
    // Initialize variables
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.getElementById('prevSlide');
    const nextButton = document.getElementById('nextSlide');
    const totalSlides = slides.length;
    let isAnimating = false;
    const sliderContainer = document.querySelector('.slider-container');
    let slideInterval = null;

    console.log(`Slider initialized with ${totalSlides} slides`);

    if (totalSlides === 0) {
      console.warn('No slides found, slider initialization aborted');
      if (sliderContainer) {
        sliderContainer.style.display = 'none';
      }
      return;
    }

    // Show the slider container if we have slides
    if (sliderContainer) {
      sliderContainer.style.display = 'block';
    }

    // Define background colors for each watch model
    const backgroundColors = {
      1: 'linear-gradient(to right, #5a7d6f, #8ba89e)',
      2: 'linear-gradient(to right, #00264d, #004d99)',
      3: 'linear-gradient(to right, #3a4a5a, #6b7d8e)',
      4: 'linear-gradient(to right, #4a3a2a, #7d6b5a)',
      5: 'linear-gradient(to right, #2a3a4a, #5a6b7d)',
      6: 'linear-gradient(to right, #2a2a2a, #5a5a5a)',
      7: 'linear-gradient(to right, #4a2a2a, #7d5a5a)',
      8: 'linear-gradient(to right, #2a4a4a, #5a7d7d)',
      9: 'linear-gradient(to right, #3a3a5a, #6b6b8e)',
      10: 'linear-gradient(to right, #4d0000, #990000)',
      11: 'linear-gradient(to right, #4d4d00, #999900)',
    };

    // Set initial slide as active
    if (slides.length > 0) {
      slides[0].classList.add('active');
      slides[0].setAttribute('aria-hidden', 'false');
      slides[0].setAttribute('tabindex', '0');
      
      if (dots.length > 0) {
        dots[0].classList.add('active');
        dots[0].setAttribute('aria-current', 'true');
      }

      // Set initial background
      if (sliderContainer && slides[0].getAttribute('data-model')) {
        const initialModel = slides[0].getAttribute('data-model');
        sliderContainer.style.background =
          backgroundColors[initialModel] || 'linear-gradient(to right, #5a7d6f, #8ba89e)';
      }
    }

    // Update slides and background
    function updateSlides(direction) {
      if (isAnimating) return;
      isAnimating = true;

      // Update dots
      dots.forEach((dot, index) => {
        if (dot) {
          dot.classList.toggle('active', index === currentSlide);
          dot.setAttribute('aria-current', index === currentSlide ? 'true' : 'false');
        }
      });

      // Update background based on current slide
      if (slides[currentSlide] && sliderContainer) {
        const currentModel = slides[currentSlide].getAttribute('data-model');
        if (currentModel) {
          sliderContainer.style.background =
            backgroundColors[currentModel] || 'linear-gradient(to right, #5a7d6f, #8ba89e)';
        }
      }

      // Update slides with animation
      slides.forEach((slide, index) => {
        if (!slide) return;

        // Update ARIA attributes for accessibility
        slide.setAttribute('aria-hidden', index !== currentSlide ? 'true' : 'false');
        slide.setAttribute('tabindex', index === currentSlide ? '0' : '-1');

        // Remove active class from all slides
        slide.classList.remove('active');

        // Add transition classes based on direction
        if (direction === 'next' && index === currentSlide) {
          slide.style.transform = 'translateX(100%)';
          setTimeout(() => {
            slide.style.transition = 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
            slide.style.transform = 'translateX(0)';
            slide.classList.add('active');
          }, 50);
        } else if (direction === 'prev' && index === currentSlide) {
          slide.style.transform = 'translateX(-100%)';
          setTimeout(() => {
            slide.style.transition = 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
            slide.style.transform = 'translateX(0)';
            slide.classList.add('active');
          }, 50);
        } else if (!direction && index === currentSlide) {
          slide.classList.add('active');
        }
      });

      // Reset animation flag after transition completes
      setTimeout(() => {
        isAnimating = false;
        slides.forEach((slide) => {
          if (!slide) return;
          slide.style.transition = '';
          if (!slide.classList.contains('active')) {
            slide.style.transform = '';
          }
        });
      }, 800);
    }

    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    if (tabs && tabs.length > 0) {
      tabs.forEach((tab) => {
        tab.addEventListener('click', function () {
          tabs.forEach((t) => t.classList.remove('active'));
          this.classList.add('active');
        });
      });
    }

    // Pagination dots functionality
    if (dots && dots.length > 0) {
      dots.forEach((dot, index) => {
        if (dot) {
          dot.addEventListener('click', () => {
            if (isAnimating || currentSlide === index) return;

            const direction = index > currentSlide ? 'next' : 'prev';
            currentSlide = index;
            updateSlides(direction);
          });
        }
      });
    }

    // Previous slide button
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (isAnimating) return;
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlides('prev');
      });
    }

    // Next slide button
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (isAnimating) return;
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlides('next');
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && prevButton) {
        prevButton.click();
      } else if (e.key === 'ArrowRight' && nextButton) {
        nextButton.click();
      }
    });

    // Auto-advance slides every 5 seconds
    function startAutoAdvance() {
      slideInterval = setInterval(() => {
        if (!document.hidden && nextButton) {
          nextButton.click();
        }
      }, 5000);
    }

    // Start auto-advance
    startAutoAdvance();

    // Pause auto-advance when user interacts with slider
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
      });

      sliderContainer.addEventListener('mouseleave', () => {
        startAutoAdvance();
      });
    }

    // Clean up when the page is unloaded
    window.addEventListener('beforeunload', () => {
      clearInterval(slideInterval);
    });
  }
});
