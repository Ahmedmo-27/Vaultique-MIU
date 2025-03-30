document.addEventListener('DOMContentLoaded', function() {
  // Initialize variables
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevButton = document.getElementById('prevSlide');
  const nextButton = document.getElementById('nextSlide');
  const tabs = document.querySelectorAll('.tab');
  const totalSlides = slides.length;
  let isAnimating = false;

  // Tab functionality
  tabs.forEach(tab => {
      tab.addEventListener('click', function() {
          tabs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
      });
  });

  // Pagination dots functionality
  dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
          if (isAnimating || currentSlide === index) return;
          
          currentSlide = index;
          updateSlides();
      });
  });

  // Previous slide button
  prevButton.addEventListener('click', function() {
      if (isAnimating) return;
      
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateSlides('prev');
  });

  // Next slide button
  nextButton.addEventListener('click', function() {
      if (isAnimating) return;
      
      currentSlide = (currentSlide + 1) % totalSlides;
      updateSlides('next');
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
          prevButton.click();
      } else if (e.key === 'ArrowRight') {
          nextButton.click();
      }
  });

  // Update slides and dots
  function updateSlides(direction) {
      isAnimating = true;
      
      // Update dots
      dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentSlide);
      });
      
      // Update slides with animation
      slides.forEach((slide, index) => {
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
          slides.forEach(slide => {
              slide.style.transition = '';
              if (!slide.classList.contains('active')) {
                  slide.style.transform = '';
              }
          });
      }, 800);
  }

  // Auto-advance slides every 5 seconds
  let slideInterval = setInterval(() => {
      if (!document.hidden) {
          nextButton.click();
      }
  }, 5000);

  // Pause auto-advance when user interacts with slider
  const sliderContainer = document.querySelector('.slider-container');
  sliderContainer.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
  });

  sliderContainer.addEventListener('mouseleave', () => {
      slideInterval = setInterval(() => {
          if (!document.hidden) {
              nextButton.click();
          }
      }, 5000);
  });

  // Menu button functionality
  const menuButton = document.querySelector('.menu-button');
  if (menuButton) {
      menuButton.addEventListener('click', function() {
          // This would typically toggle a mobile menu
          console.log('Menu button clicked');
      });
  }
  
  // Search button functionality
  const searchButton = document.querySelector('.search-button');
  if (searchButton) {
      searchButton.addEventListener('click', function() {
          // This would typically open a search overlay
          console.log('Search button clicked');
      });
  }
  
  // Location button functionality
  const locationButton = document.querySelector('.location-button');
  if (locationButton) {
      locationButton.addEventListener('click', function() {
          // This would typically open a store locator
          console.log('Location button clicked');
      });
  }
  
  // Favorites button functionality
  const favoritesButton = document.querySelector('.favorites-button');
  if (favoritesButton) {
      favoritesButton.addEventListener('click', function() {
          // This would typically open a favorites panel
          console.log('Favorites button clicked');
      });
  }
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.getElementById('prevSlide');
    const nextButton = document.getElementById('nextSlide');
    const tabs = document.querySelectorAll('.tab');
    const totalSlides = slides.length;
    let isAnimating = false;
    const sliderContainer = document.querySelector('.slider-container');
  
    // Tab functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
  
    // Define background colors for each slide
    const backgroundColors = {
      datejust: "linear-gradient(to right, #5a7d6f, #8ba89e)",
      submariner: "linear-gradient(to right, #00264d, #004d99)",
      daytona: "linear-gradient(to right, #4d0000, #990000)",
      "day-date": "linear-gradient(to right, #4d4d00, #999900)"
    };
  
    // Update slides and background
    function updateSlides(direction) {
        isAnimating = true;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        // Update background based on current slide
        const currentModel = slides[currentSlide].getAttribute('data-model');
        sliderContainer.style.background = backgroundColors[currentModel];
        
        // Update slides with animation
        slides.forEach((slide, index) => {
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
            slides.forEach(slide => {
                slide.style.transition = '';
                if (!slide.classList.contains('active')) {
                    slide.style.transform = '';
                }
            });
        }, 800);
    }
  
    // Pagination dots functionality
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            if (isAnimating || currentSlide === index) return;
            
            currentSlide = index;
            updateSlides();
        });
    });
  
    // Previous slide button
    prevButton.addEventListener('click', function() {
        if (isAnimating) return;
        
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlides('prev');
    });
  
    // Next slide button
    nextButton.addEventListener('click', function() {
        if (isAnimating) return;
        
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlides('next');
    });
  
    // Initialize the first slide
    updateSlides();
    
    // Rest of your existing code (keyboard navigation, auto-advance, etc.)
    // ...
  });
  
  