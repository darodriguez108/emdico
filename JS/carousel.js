(function() {
    const carousel = document.querySelector('.carousel');
    const track = carousel.querySelector('.carousel__track');
    let slides = Array.from(track.children);
    
    // Clone first & last for seamless loop
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.setAttribute('data-clone', 'true');
    lastClone.setAttribute('data-clone', 'true');
    track.insertBefore(lastClone, slides[0]);
    track.appendChild(firstClone);
    slides = Array.from(track.children); // now includes clones
    
    let currentIndex = 1; // start at first real slide
    // Each slide should shift by the full viewport width (100% of the screen)
    // so we base the translation distance on window.innerWidth instead of the
    // measured slide element width.
    let slideWidth = () => window.innerWidth;
    let isAnimating = false;
    
    function setPosition(noTransition=false) {
        if (noTransition) track.style.transition = 'none';
        track.style.transform = `translateX(${-slideWidth() * currentIndex}px)`;
        if (noTransition) {
            // Force reflow to ensure the transition: none takes effect
            track.offsetHeight;
            requestAnimationFrame(() => track.style.transition = '');
        }
        updateDots();
    }
    
    // Build dots
    const dotsContainer = carousel.querySelector('.carousel__dots');
    const realSlideCount = slides.length - 2;
    const dots = [];
    
    for (let i=0; i<realSlideCount; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to slide ' + (i+1));
        b.addEventListener('click', () => goTo(i+1));
        dotsContainer.appendChild(b);
        dots.push(b);
    }
    
    function updateDots() {
        const realIndex = getRealIndex();
        dots.forEach((d,i) => d.setAttribute('aria-current', (i+1 === realIndex) ? 'true' : 'false'));
    }
    
    function getRealIndex() {
        if (currentIndex === 0) return realSlideCount;
        if (currentIndex === slides.length - 1) return 1;
        return currentIndex;
    }
    
    function goTo(idx) {
        if (isAnimating) return;
        currentIndex = idx;
        animate();
    }
    
    function next() {
        if (isAnimating) return;
        currentIndex++;
        animate();
    }
    
    function prev() {
        if (isAnimating) return;
        currentIndex--;
        animate();
    }
    
    function animate() {
        isAnimating = true;
        track.style.transition = 'transform .4s ease';
        setPosition();
    }
    
    track.addEventListener('transitionend', () => {
        // If we're at a clone, jump directly to the corresponding real slide
        if (slides[currentIndex].getAttribute('data-clone') === 'true') {
            if (currentIndex === 0) {
                // We're at the last clone, jump to the real last slide
                currentIndex = slides.length - 2;
            } else if (currentIndex === slides.length - 1) {
                // We're at the first clone, jump to the real first slide
                currentIndex = 1;
            }
            setPosition(true);
        }
        isAnimating = false;
    });
    
    // Swipe / pointer handling
    let startX = 0;
    let currentX = 0;
    let dragging = false;
    let dragStartTransform = 0;
    const threshold = 40; // px to trigger slide change
    
    function pointerDown(e) {
        if (isAnimating) return;
        dragging = true;
        track.style.transition = 'none';
        startX = e.clientX || e.touches?.[0].clientX;
        dragStartTransform = -slideWidth() * currentIndex;
    }
    
    function pointerMove(e) {
        if (!dragging) return;
        const x = e.clientX || e.touches?.[0].clientX;
        currentX = x;
        const diff = currentX - startX;
        track.style.transform = `translateX(${dragStartTransform + diff}px)`;
    }
    
    function pointerUp() {
        if (!dragging) return;
        dragging = false;
        const diff = currentX - startX;
        
        if (Math.abs(diff) > threshold) {
            if (diff < 0) next();
            else prev();
        } else {
            // snap back
            track.style.transition = 'transform .3s ease';
            setPosition();
        }
    }
    
    // Support both pointer & touch
    track.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove, { passive: true });
    window.addEventListener('pointerup', pointerUp);
    
    // Fallback for older touch-only browsers:
    track.addEventListener('touchstart', pointerDown, { passive: true });
    window.addEventListener('touchmove', pointerMove, { passive: true });
    window.addEventListener('touchend', pointerUp);
    
    // Buttons
    carousel.querySelector('.carousel__btn.next').addEventListener('click', next);
    carousel.querySelector('.carousel__btn.prev').addEventListener('click', prev);
    
    // Keyboard (when carousel focused)
    carousel.tabIndex = 0;
    carousel.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            next();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prev();
        }
    });
    
    // Resize handling
    window.addEventListener('resize', () => {
        // Disable transition for instant reposition after resize
        setPosition(true);
    });
    
    // Initialize
    setPosition(true);
})();



















































































































































































































































































































































































































































































































































































































