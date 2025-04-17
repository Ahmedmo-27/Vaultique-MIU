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
  
    // Define background colors for each watch model
    const backgroundColors = {
      1: "linear-gradient(to right, #5a7d6f, #8ba89e)",
      2: "linear-gradient(to right, #00264d, #004d99)",
      '3': "linear-gradient(to right, #3a4a5a, #6b7d8e)",
      '4': "linear-gradient(to right, #4a3a2a, #7d6b5a)",
      '5': "linear-gradient(to right, #2a3a4a, #5a6b7d)",
      6: "linear-gradient(to right, #2a2a2a, #5a5a5a)",
      '7': "linear-gradient(to right, #4a2a2a, #7d5a5a)",
      '8': "linear-gradient(to right, #2a4a4a, #5a7d7d)",
      '9': "linear-gradient(to right, #3a3a5a, #6b6b8e)",
      10: "linear-gradient(to right, #4d0000, #990000)",
      '11': "linear-gradient(to right, #4d4d00, #999900)"
    };
  
    // Update slides and background
    function updateSlides(direction) {
      if (isAnimating) return;
      isAnimating = true;
      
      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
      
      // Update background based on current slide
      const currentModel = slides[currentSlide].getAttribute('data-model');
      sliderContainer.style.background = backgroundColors[currentModel] || "linear-gradient(to right, #5a7d6f, #8ba89e)";
      
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
        
        const direction = index > currentSlide ? 'next' : 'prev';
        currentSlide = index;
        updateSlides(direction);
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
  
    // Auto-advance slides every 5 seconds
    let slideInterval = setInterval(() => {
      if (!document.hidden) {
        nextButton.click();
      }
    }, 5000);
  
    // Pause auto-advance when user interacts with slider
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
        console.log('Menu button clicked');
      });
    }
    
    // Search button functionality
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
      searchButton.addEventListener('click', function() {
        console.log('Search button clicked');
      });
    }
    
    // Location button functionality
    const locationButton = document.querySelector('.location-button');
    if (locationButton) {
      locationButton.addEventListener('click', function() {
        console.log('Location button clicked');
      });
    }
    
    // Favorites button functionality
    const favoritesButton = document.querySelector('.favorites-button');
    if (favoritesButton) {
      favoritesButton.addEventListener('click', function() {
        console.log('Favorites button clicked');
      });
    }
  
    // Initialize the slider
    updateSlides();
  });