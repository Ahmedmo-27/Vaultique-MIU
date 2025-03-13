
document.addEventListener('DOMContentLoaded', function() {

    // 7agat el carousel
    const track = document.getElementById("carousel__track");
    const slides = Array.from(track.children);
    const nextButton = document.getElementById('carousel__button--right');
    const prevButton = document.getElementById('carousel__button--left');
    
    //da in case el user 8ayar el size of the window
    const slideSize = slides[0].getBoundingClientRect();
    const slideWidth = 275;
    
    
    // arrange the slides next to each other
    // set el slide position for each slide in my carousel
    slides.forEach((slide, index) =>
    {
        slide.style.left = slideWidth * index + 'px';
        // if(index)
        // console.log("slide" + index + " width: " + slide.style.left)
    });
    
    //functions
    
    function moveToSlide(track, currentSlide, targetSlide) {
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    }
    
    function hideShowArrows (slides, prevButton, nextButton, targetIndex) {
        if(targetIndex === 0)
        {
            prevButton.classList.add('is-hidden');
            nextButton.classList.remove('is-hidden');
        } else if (targetIndex === slides.length - 5) {
            nextButton.classList.add('is-hidden');
            prevButton.classList.remove('is-hidden');
        } else {
            nextButton.classList.remove('is-hidden');
            prevButton.classList.remove('is-hidden');
        }
    }
    
    //move left, slide to the left
    prevButton.addEventListener('click', e => {
        const currentSlide = track.querySelector('.current-slide');
        const prevSlide = currentSlide.previousElementSibling;
        const prevIndex = slides.findIndex(slide => slide === prevSlide);
    
        moveToSlide(track, currentSlide, prevSlide);
        hideShowArrows(slides, prevButton, nextButton, prevIndex);
    });
    
    //move right, slide to the right
    nextButton.addEventListener('click', e => {
        const currentSlide = track.querySelector('.current-slide');
        const nextSlide = currentSlide.nextElementSibling;
        const nextIndex = slides.findIndex(slide => slide === nextSlide);
    
        moveToSlide(track, currentSlide, nextSlide);
        hideShowArrows(slides, prevButton, nextButton, nextIndex);
    });
    
    
    //categories hovering
    document.querySelectorAll('.item').forEach(item => {
        const primaryimg = item.querySelector('.primary-img');
        const secondaryimg = item.querySelector('.secondary-img');
        const anchor = item.querySelector('a');
    
        //hover lel entire div
        if(primaryimg && secondaryimg)
        {
            anchor.addEventListener('mouseenter', function() {
                // img.src = `../images/Landing/exp/${category}2.jpg`;
                primaryimg.style.opacity = '0';
                secondaryimg.style.opacity = '1';
            });
    
            anchor.addEventListener('mouseout', function() {
                primaryimg.style.opacity = '1';
                secondaryimg.style.opacity = '0';
            });
        }
    });
    
    
    
    });
    