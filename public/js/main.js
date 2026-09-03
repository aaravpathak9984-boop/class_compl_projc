document.addEventListener('DOMContentLoaded', () => {
  
  // Auto-hide flash messages after 5 seconds
  const flashMessages = document.querySelectorAll('.flash-container .alert');
  if (flashMessages.length > 0) {
    setTimeout(() => {
      flashMessages.forEach(msg => {
        msg.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(-20px)';
        setTimeout(() => msg.remove(), 500);
      });
    }, 5000);
  }

  // Cover Flow Carousel Logic
  const coverflowContainer = document.getElementById('popularCoverflow');
  if (coverflowContainer) {
    const cards = Array.from(coverflowContainer.querySelectorAll('.coverflow-card'));
    const globalBg = document.getElementById('globalBg');
    let currentIndex = Math.floor(cards.length / 2); // Start at the middle

    function updateCoverflow() {
      cards.forEach((card, index) => {
        const offset = index - currentIndex;
        
        // Calculate 3D transforms
        const translateX = offset * 180; // Distance between cards
        const translateZ = Math.abs(offset) * -200; // Push back side cards
        const rotateY = offset * -20; // Rotate side cards towards center
        const opacity = 1 - Math.abs(offset) * 0.15;
        const zIndex = 100 - Math.abs(offset);

        card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
        card.style.zIndex = zIndex;
        card.style.opacity = Math.max(opacity, 0);

        // Dim side cards slightly via filter
        if (offset === 0) {
          card.style.filter = 'brightness(1)';
        } else {
          card.style.filter = 'brightness(0.6)';
        }
      });

      // Update global background
      if (globalBg && cards[currentIndex]) {
        const bgUrl = cards[currentIndex].dataset.bg;
        globalBg.style.backgroundImage = `url('${bgUrl}')`;
      }
    }

    // Handle clicks
    cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        if (index !== currentIndex) {
          // If clicking a side card, bring it to center instead of navigating
          e.preventDefault();
          currentIndex = index;
          updateCoverflow();
        }
        // If clicking the center card, let the <a> tag navigate normally
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        updateCoverflow();
      } else if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
        currentIndex++;
        updateCoverflow();
      }
    });

    // Initial render
    updateCoverflow();
  } else {
    // If we're not on the list page but have a global background (e.g., detail page)
    const heroBg = document.querySelector('.hero-bg');
    const globalBg = document.getElementById('globalBg');
    if (heroBg && globalBg) {
      // The detail page handles its own background, but we can sync the global bg just in case
      const match = heroBg.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        globalBg.style.backgroundImage = `url('${match[1]}')`;
      }
    }
  }

});
