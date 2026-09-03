/**
 * ============================================================================
 * Cineplex Client Application (public/js/main.js)
 * ============================================================================
 * Handles flash toasts auto-dismissal, 3D coverflow carousel interaction,
 * and high-performance debounced live movie search with partial regex matching.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // --------------------------------------------------------------------------
  // 1. Flash Toast Messages Auto-Dismissal
  // --------------------------------------------------------------------------
  const flashMessages = document.querySelectorAll('.flash-container .alert');
  if (flashMessages.length > 0) {
    setTimeout(() => {
      flashMessages.forEach(msg => {
        msg.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(-20px)';
        setTimeout(() => msg.remove(), 500);
      });
    }, 4500);
  }

  // --------------------------------------------------------------------------
  // 2. Cover Flow Carousel Logic
  // --------------------------------------------------------------------------
  function initCoverflow() {
    const coverflowContainer = document.getElementById('popularCoverflow');
    if (!coverflowContainer) return;

    const cards = Array.from(coverflowContainer.querySelectorAll('.coverflow-card'));
    const globalBg = document.getElementById('globalBg');
    let currentIndex = Math.floor(cards.length / 2); // Start at middle card

    // Add smooth transition properties to all coverflow cards
    cards.forEach(card => {
      card.style.transition = 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.85s ease, filter 0.85s ease';
    });

    let autoPlayInterval = null;

    function updateCoverflow() {
      cards.forEach((card, index) => {
        const offset = index - currentIndex;
        
        // 3D perspective transforms
        const translateX = offset * 180;
        const translateZ = Math.abs(offset) * -200;
        const rotateY = offset * -20;
        const opacity = 1 - Math.abs(offset) * 0.15;
        const zIndex = 100 - Math.abs(offset);

        card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
        card.style.zIndex = zIndex;
        card.style.opacity = Math.max(opacity, 0);

        if (offset === 0) {
          card.style.filter = 'brightness(1)';
        } else {
          card.style.filter = 'brightness(0.55)';
        }
      });

      // Update global background to match active card
      if (globalBg && cards[currentIndex]) {
        const bgUrl = cards[currentIndex].dataset.bg;
        if (bgUrl) {
          globalBg.style.backgroundImage = `url('${bgUrl}')`;
        }
      }
    }

    // Continuous auto-changing animation (rotates every 3.2 seconds)
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCoverflow();
      }, 3200);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    // Pause on mouse hover, resume on mouse leave
    coverflowContainer.addEventListener('mouseenter', stopAutoPlay);
    coverflowContainer.addEventListener('mouseleave', startAutoPlay);

    // Handle card clicks
    cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        if (index !== currentIndex) {
          e.preventDefault();
          currentIndex = index;
          updateCoverflow();
          stopAutoPlay();
          startAutoPlay();
        }
      });
    });

    // Keyboard arrow navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        updateCoverflow();
        stopAutoPlay();
        startAutoPlay();
      } else if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
        currentIndex++;
        updateCoverflow();
        stopAutoPlay();
        startAutoPlay();
      }
    });

    // Initial render & start auto-rotation animation
    updateCoverflow();
    startAutoPlay();
  }

  // Initialize coverflow on page load
  initCoverflow();

  // --------------------------------------------------------------------------
  // 3. Debounced Live Movie Search
  // --------------------------------------------------------------------------
  const searchInput = document.getElementById('movieSearchInput');
  const genreSelect = document.getElementById('movieGenreSelect');
  const searchForm = document.getElementById('movieSearchForm');
  const displayArea = document.getElementById('moviesMainDisplay');

  if (searchInput && displayArea) {
    let activeController = null;

    /**
     * Reusable Debounce Utility
     * Delays execution until 'delay' milliseconds have passed without any new events
     */
    function debounce(callback, delay = 350) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => callback.apply(this, args), delay);
      };
    }

    /**
     * Executes the live fetch request with AbortController to prevent race conditions
     */
    async function executeLiveSearch() {
      const searchVal = searchInput.value.trim();
      const genreVal = genreSelect ? genreSelect.value : '';

      const params = new URLSearchParams();
      if (searchVal) params.set('search', searchVal);
      if (genreVal) params.set('genre', genreVal);

      const targetUrl = `/movies?${params.toString()}`;

      // Abort previous in-flight request if user kept typing
      if (activeController) {
        activeController.abort();
      }
      activeController = new AbortController();

      // Subtle loading transition
      displayArea.style.opacity = '0.4';
      displayArea.style.transition = 'opacity 0.2s ease';

      try {
        const response = await fetch(targetUrl, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          signal: activeController.signal
        });

        if (response.ok) {
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const newContent = doc.getElementById('moviesMainDisplay');

          if (newContent) {
            displayArea.innerHTML = newContent.innerHTML;
            // Update browser URL without full page reload
            window.history.replaceState({}, '', targetUrl);
            // Re-bind 3D coverflow carousel
            initCoverflow();
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search request error:', err);
        }
      } finally {
        displayArea.style.opacity = '1';
      }
    }

    // Debounce typing searches by 350 milliseconds
    const debouncedSearch = debounce(executeLiveSearch, 350);
    searchInput.addEventListener('input', debouncedSearch);

    // Immediate update when genre filter changes
    if (genreSelect) {
      genreSelect.addEventListener('change', executeLiveSearch);
    }

    // Prevent full page reload on Enter
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        executeLiveSearch();
      });
    }
  }

  // --------------------------------------------------------------------------
  // 4. Hero Background Sync for Detail Pages
  // --------------------------------------------------------------------------
  const heroBg = document.querySelector('.hero-bg');
  const globalBg = document.getElementById('globalBg');
  if (heroBg && globalBg) {
    const match = heroBg.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
    if (match && match[1]) {
      globalBg.style.backgroundImage = `url('${match[1]}')`;
    }
  }

});
