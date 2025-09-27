document.addEventListener("DOMContentLoaded", function () {
  const MOBILE_BREAKPOINT = 768; // Same breakpoint as CSS media queries

  // Force refresh if screen becomes too wide for mobile
  function checkScreenSize() {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      console.log("Screen too wide for mobile, redirecting to desktop version");
      window.location.href = "index.html";
    }
  }

  // Check on resize and orientation change
  window.addEventListener("resize", checkScreenSize);
  window.addEventListener("orientationchange", function () {
    setTimeout(checkScreenSize, 100); // Delay to get accurate dimensions after rotation
  });

  // Initial check
  checkScreenSize();
  // Sketchfab API Integration for Mobile
  const loadMobileSketchfab = (sceneuid, elementId) => {
    const success = (api) => {
      api.start(() => console.log("Mobile Sketchfab scene starts loading"));
      api.addEventListener("viewerready", () =>
        console.log("Mobile Sketchfab scene is ready")
      );
    };

    const iframe = document.getElementById(elementId);
    if (iframe) {
      const client = new Sketchfab("1.12.1", iframe);

      client.init(sceneuid, {
        success: success,
        error: () => console.error("Mobile Sketchfab API error"),
        ui_stop: 0,
        preload: 1,
        camera: 0,
        scrollwheel: 0,
        ui_infos: 0,
        ui_inspector: 0,
        ui_watermark: 0,
        ui_annotations: 0,
        ui_loading: 0,
      });
    }
  };

  // Load Sketchfab model with delay to ensure iframe is ready
  setTimeout(() => {
    loadMobileSketchfab("823f7f95ba5145e18b052c5e95097dbd", "mobile-api-frame");
  }, 1000);

  // Image overlay functionality
  const mobileOverlay = document.getElementById("mobile-image-overlay");
  const mobileOverlayBg = document.getElementById("mobile-overlay-background");

  function showMobileOverlay(src) {
    mobileOverlay.src = src;
    mobileOverlay.style.display = "block";
    mobileOverlayBg.style.display = "block";
  }

  function hideMobileOverlay() {
    mobileOverlay.style.display = "none";
    mobileOverlayBg.style.display = "none";
  }

  // Add click listeners to gallery images
  document.querySelectorAll(".mobile-gallery-grid img").forEach((img) => {
    img.addEventListener("click", function () {
      showMobileOverlay(this.src);
    });
  });

  // Close overlay when clicking on it
  mobileOverlay.addEventListener("click", hideMobileOverlay);
  mobileOverlayBg.addEventListener("click", hideMobileOverlay);

  // Mobile Resources Overlay - Enhanced Scroll Up Trigger
  const mobileResourcesOverlay = document.getElementById(
    "mobileResourcesOverlay"
  );
  let isResourcesVisible = false;
  let scrollUpAccumulator = 0;
  let consecutiveScrollUps = 0;
  const SCROLL_UP_THRESHOLD = 200; // More effort required
  const CONSECUTIVE_THRESHOLD = 3; // Need 3 consecutive scroll ups

  // Show overlay on mobile devices
  if (mobileResourcesOverlay) {
    mobileResourcesOverlay.style.display = "block";
  }

  // Enhanced scroll-up trigger requiring more effort
  window.addEventListener(
    "wheel",
    function (e) {
      const currentScrollY = window.scrollY;
      const scrollingUp = e.deltaY < 0;

      // Only trigger at the very top of the page
      if (currentScrollY <= 20) {
        if (scrollingUp && !isResourcesVisible) {
          scrollUpAccumulator += Math.abs(e.deltaY);
          consecutiveScrollUps++;

          console.log("Scroll up effort:", {
            accumulator: scrollUpAccumulator,
            consecutive: consecutiveScrollUps,
            threshold: SCROLL_UP_THRESHOLD,
          });

          // Require sustained scroll up effort
          if (
            scrollUpAccumulator >= SCROLL_UP_THRESHOLD &&
            consecutiveScrollUps >= CONSECUTIVE_THRESHOLD
          ) {
            console.log("Showing mobile resources overlay - threshold met");
            e.preventDefault();
            isResourcesVisible = true;
            scrollUpAccumulator = 0;
            consecutiveScrollUps = 0;
            if (mobileResourcesOverlay) {
              mobileResourcesOverlay.classList.add("active");
            }
          }
        } else {
          // Reset accumulator if not scrolling up
          scrollUpAccumulator = Math.max(0, scrollUpAccumulator - 20);
          consecutiveScrollUps = 0;
        }
      } else {
        // Reset if not at top
        scrollUpAccumulator = 0;
        consecutiveScrollUps = 0;
      }

      // If resources are visible and scrolling down, hide them
      if (isResourcesVisible && !scrollingUp) {
        console.log("Hiding mobile resources overlay");
        isResourcesVisible = false;
        scrollUpAccumulator = 0;
        consecutiveScrollUps = 0;
        if (mobileResourcesOverlay) {
          mobileResourcesOverlay.classList.remove("active");
        }
      }
    },
    { passive: false }
  );

  // Enhanced touch-based trigger requiring more effort
  let touchStartY = 0;
  let touchMoveY = 0;
  let touchMoves = [];

  document.addEventListener(
    "touchstart",
    function (e) {
      touchStartY = e.touches[0].clientY;
      touchMoves = [];
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    function (e) {
      touchMoveY = e.touches[0].clientY;
      touchMoves.push(touchMoveY);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    function (e) {
      const currentScrollY = window.scrollY;
      const totalDelta = touchStartY - touchMoveY;
      const swipeDistance = Math.abs(totalDelta);
      const isUpwardSwipe = totalDelta < 0;

      // Require strong upward swipe (>150px) at the top
      if (
        currentScrollY <= 20 &&
        isUpwardSwipe &&
        swipeDistance > 150 &&
        !isResourcesVisible
      ) {
        console.log("Touch trigger: Strong upward swipe detected", {
          swipeDistance,
        });
        isResourcesVisible = true;
        if (mobileResourcesOverlay) {
          mobileResourcesOverlay.classList.add("active");
        }
      }
      // Hide with downward swipe
      else if (isResourcesVisible && !isUpwardSwipe && swipeDistance > 100) {
        console.log("Touch trigger: Hiding mobile resources overlay");
        isResourcesVisible = false;
        if (mobileResourcesOverlay) {
          mobileResourcesOverlay.classList.remove("active");
        }
      }
    },
    { passive: true }
  );

  // Close resources overlay when clicking outside content area
  if (mobileResourcesOverlay) {
    mobileResourcesOverlay.addEventListener("click", function (e) {
      if (e.target === mobileResourcesOverlay) {
        isResourcesVisible = false;
        mobileResourcesOverlay.classList.remove("active");
      }
    });
  }

  // Enhanced page navigation with scroll snap
  let startY = 0;
  let currentPage = 0;
  const pages = document.querySelectorAll(".mobile-page");
  const totalPages = pages.length;
  let isNavigating = false;

  // Touch navigation with snap
  document.addEventListener(
    "touchstart",
    function (e) {
      // Only handle navigation if resources overlay is not active
      if (!isResourcesVisible) {
        startY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    function (e) {
      // Only handle navigation if resources overlay is not active
      if (!isResourcesVisible && !isNavigating) {
        const endY = e.changedTouches[0].clientY;
        const deltaY = startY - endY;
        const threshold = 80; // Increased threshold for more deliberate swipes

        if (Math.abs(deltaY) > threshold) {
          isNavigating = true;

          if (deltaY > 0 && currentPage < totalPages - 1) {
            // Swipe up - next page
            currentPage++;
            console.log("Navigating to page:", currentPage);
          } else if (deltaY < 0 && currentPage > 0) {
            // Swipe down - previous page
            currentPage--;
            console.log("Navigating to page:", currentPage);
          }

          // Smooth scroll to target page
          const targetPage = pages[currentPage];
          if (targetPage) {
            targetPage.scrollIntoView({ behavior: "smooth" });
          }

          // Reset navigation flag after animation
          setTimeout(() => {
            isNavigating = false;
          }, 800);
        }
      }
    },
    { passive: true }
  );

  // Update current page based on scroll position
  window.addEventListener(
    "scroll",
    function () {
      if (!isNavigating) {
        const scrollPosition = window.scrollY;
        const pageHeight = window.innerHeight;
        const newCurrentPage = Math.round(scrollPosition / pageHeight);

        if (newCurrentPage >= 0 && newCurrentPage < totalPages) {
          currentPage = newCurrentPage;
        }
      }
    },
    { passive: true }
  );
});
