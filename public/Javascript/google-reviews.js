document.addEventListener('DOMContentLoaded', function () {
  const track = document.getElementById('reviewsTrack');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const dotsContainer = document.getElementById('reviewsDots');
  const cards = track.querySelectorAll('.review-card');
  const cardCount = cards.length;

  let cardsToShow = 3;
  let slideCount = 0;
  let currentIndex = 0;
  let autoplayInterval;

  function updateCardsToShow() {
    if (window.innerWidth <= 768) {
      cardsToShow = 1;
    } else if (window.innerWidth <= 1200) {
      cardsToShow = 2;
    } else {
      cardsToShow = 3;
    }

    cards.forEach((card) => {
      card.style.flex = `0 0 calc(${100 / cardsToShow}% - 30px)`;
      card.style.minWidth = `calc(${100 / cardsToShow}% - 30px)`;
    });

    slideCount = Math.ceil(cardCount / cardsToShow);
    currentIndex = 0;

    updateSlidePosition();
    createDots();
  }

  function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlidePosition();
        startAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
    updateButtonStates();
  }

  function updateSlidePosition() {
    if (currentIndex >= slideCount) {
      currentIndex = 0;
    }

    const slideWidth = cards[0].offsetWidth + 30;
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    updateButtonStates();
  }

  function updateButtonStates() {
    prevButton.disabled = false;
    nextButton.disabled = false;
  }

  prevButton.addEventListener('click', () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : slideCount - 1;
    updateSlidePosition();
    startAutoplay();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlidePosition();
    startAutoplay();
  });

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      currentIndex++;
      updateSlidePosition();
    }, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    },
    { passive: true }
  );

  track.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoplay();
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      currentIndex = (currentIndex + 1) % slideCount;
    } else if (touchEndX > touchStartX + swipeThreshold) {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : slideCount - 1;
    }
    updateSlidePosition();
  }

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      cards.forEach((c) => {
        if (c !== card) {
          c.style.opacity = '0.7';
          c.style.transform = 'scale(0.98)';
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      cards.forEach((c) => {
        c.style.opacity = '1';
        c.style.transform = c === card ? 'translateY(-10px)' : 'scale(1)';
      });
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : slideCount - 1;
    } else if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % slideCount;
    } else {
      return;
    }
    updateSlidePosition();
    startAutoplay();
  });

  document.addEventListener('mousemove', (e) => {
    const accents = document.querySelectorAll('.luxury-accent');
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;
    accents.forEach((accent) => {
      const depth = 20;
      accent.style.transform = `translate(${mouseX * depth}px, ${mouseY * depth}px)`;
    });
  });

  window.addEventListener('resize', updateCardsToShow);

  updateCardsToShow();
  startAutoplay();
});
