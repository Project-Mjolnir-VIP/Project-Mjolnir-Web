document.addEventListener("DOMContentLoaded", function () {
  const resourcesOverlay = document.getElementById("scrollResourcesOverlay");
  let isResourcesVisible = false;

  // Simple scroll-up trigger - show resources when trying to scroll above the top
  window.addEventListener(
    "wheel",
    function (e) {
      const currentScrollY = window.scrollY;
      const scrollingUp = e.deltaY < 0; // Negative deltaY means scrolling up

      console.log("Wheel event:", {
        currentScrollY,
        scrollingUp,
        deltaY: e.deltaY,
      });

      // If at the top (video page) and trying to scroll up, show resources
      if (currentScrollY <= 50 && scrollingUp && !isResourcesVisible) {
        console.log("Showing resources overlay");
        e.preventDefault();
        isResourcesVisible = true;
        if (resourcesOverlay) {
          resourcesOverlay.classList.add("active");
        }
      }
      // If resources are visible and scrolling down, hide them
      else if (isResourcesVisible && !scrollingUp) {
        console.log("Hiding resources overlay");
        isResourcesVisible = false;
        if (resourcesOverlay) {
          resourcesOverlay.classList.remove("active");
        }
      }
    },
    { passive: false }
  );

  // Close resources overlay when clicking outside content area
  if (resourcesOverlay) {
    resourcesOverlay.addEventListener("click", function (e) {
      if (e.target === resourcesOverlay) {
        isResourcesVisible = false;
        resourcesOverlay.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", function () {
    const fadeEffectThreshold = window.innerHeight; // Adjust threshold as needed
    const opacity = 1 - Math.min(window.scrollY / fadeEffectThreshold, 1);
    document.getElementById("pageUp").style.opacity = opacity;
  });

  // Nav to bottom
  var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 10, // Scroll speed in milliseconds
    speedAsDuration: true, // Treat the speed as a hard duration
  });

  // About button removed - navigation now handled by scroll snap system

  // Sketchfab API Integration
  const loadSketchfab = (sceneuid, elementId) => {
    const success = (api) => {
      api.start(() => console.log("Sketchfab scene starts loading"));
      api.addEventListener("viewerready", () =>
        console.log("Sketchfab scene is ready")
      );
    };

    const iframe = document.getElementById(elementId);
    const client = new Sketchfab("1.12.1", iframe);

    client.init(sceneuid, {
      success: success,
      error: () => console.error("Sketchfab API error"),
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
  };

  // Delay Sketchfab loading to ensure iframe is ready
  setTimeout(() => {
    const iframe = document.getElementById("api-frame");
    if (iframe) {
      console.log("Loading Sketchfab model...");
      loadSketchfab("823f7f95ba5145e18b052c5e95097dbd", "api-frame");
    } else {
      console.error("Sketchfab iframe not found!");
    }
  }, 1000);

  // Optimized scroll handling for Sketchfab iframe
  const apiContainer = document.querySelector(".api-container");
  const sketchfabIframe = document.getElementById("api-frame");

  if (apiContainer && sketchfabIframe) {
    let isMouseDown = false;
    let isDragging = false;
    let lastInteractionTime = 0;
    let isOverIframe = false;
    let containerRect = null;
    let rafId = null;

    // Cache container bounds and update on resize for better performance
    const updateContainerBounds = () => {
      containerRect = apiContainer.getBoundingClientRect();
    };
    updateContainerBounds();
    window.addEventListener("resize", updateContainerBounds);

    // Optimized mouse position tracking
    const updateMousePosition = (e) => {
      if (!containerRect) return;
      isOverIframe =
        e.clientX >= containerRect.left &&
        e.clientX <= containerRect.right &&
        e.clientY >= containerRect.top &&
        e.clientY <= containerRect.bottom;
    };

    // Track mouse interactions with optimized event handling
    apiContainer.addEventListener(
      "mousedown",
      function (e) {
        isMouseDown = true;
        isDragging = false;
        lastInteractionTime = performance.now();
      },
      { passive: true }
    );

    apiContainer.addEventListener(
      "mousemove",
      function (e) {
        if (isMouseDown && !isDragging) {
          isDragging = true;
          lastInteractionTime = performance.now();
        }
      },
      { passive: true }
    );

    apiContainer.addEventListener(
      "mouseup",
      function (e) {
        isMouseDown = false;
        lastInteractionTime = performance.now();
        // Use requestAnimationFrame for smooth state transitions
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setTimeout(() => {
            isDragging = false;
          }, 100);
        });
      },
      { passive: true }
    );

    apiContainer.addEventListener(
      "mouseleave",
      function (e) {
        isMouseDown = false;
        isDragging = false;
      },
      { passive: true }
    );

    // Track mouse position globally for better iframe detection (throttled for performance)
    let mouseMoveThrottle = null;
    document.addEventListener(
      "mousemove",
      function (e) {
        if (mouseMoveThrottle) return;
        mouseMoveThrottle = setTimeout(() => {
          updateMousePosition(e);
          mouseMoveThrottle = null;
        }, 16); // ~60fps throttling
      },
      {
        passive: true,
      }
    );

    // Let native CSS scroll snap handle page snapping for better performance

    // Simplified wheel handler for iframe area only
    const optimizedWheelHandler = function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Simple scroll handling for iframe area - let native scroll snap handle the rest
      const deltaY = e.deltaY;

      // Use requestAnimationFrame for smooth scrolling
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        window.scrollBy({
          top: deltaY,
          behavior: "instant",
        });
      });
    };

    // Container wheel event (primary handler)
    apiContainer.addEventListener("wheel", optimizedWheelHandler, {
      passive: false,
      capture: true,
    });

    // Global wheel event handler with optimized iframe detection
    document.addEventListener(
      "wheel",
      function (e) {
        // Only handle wheel events when over the iframe area
        if (isOverIframe || (e.target && apiContainer.contains(e.target))) {
          optimizedWheelHandler(e);
        }
        // Let other scroll events pass through for scroll snap to work
      },
      {
        passive: false,
        capture: true,
      }
    );

    // Optimized touch handling with better gesture detection
    let touchStartY = 0;
    let touchStartX = 0;
    let isScrolling = false;

    apiContainer.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length === 1) {
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
          isScrolling = false;
        } else {
          // Multi-touch - prevent zoom gestures
          e.preventDefault();
        }
      },
      { passive: false }
    );

    apiContainer.addEventListener(
      "touchmove",
      function (e) {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const deltaY = Math.abs(touch.clientY - touchStartY);
          const deltaX = Math.abs(touch.clientX - touchStartX);

          // Detect if this is a scroll gesture vs model rotation
          if (deltaY > deltaX && deltaY > 10 && !isDragging) {
            isScrolling = true;
            e.preventDefault();
            // Handle touch scroll manually with accumulation for snap
            const scrollDelta = (touch.clientY - touchStartY) * -2;
            scrollAccumulator += scrollDelta;

            window.scrollBy(0, scrollDelta * 0.3); // Reduced immediate scroll
            touchStartY = touch.clientY;
          }
        } else {
          // Prevent multi-touch gestures
          e.preventDefault();
          e.stopPropagation();
        }
      },
      { passive: false }
    );

    apiContainer.addEventListener(
      "touchend",
      function (e) {
        if (isScrolling) {
          // Trigger snap after touch scroll ends
          setTimeout(() => {
            snapToPage();
          }, SNAP_DELAY);
        }
        isScrolling = false;
      },
      { passive: true }
    );
  }

  const overlay = document.createElement("img");
  overlay.id = "image-overlay";
  document.body.appendChild(overlay);

  const overlayBg = document.createElement("div");
  overlayBg.id = "overlay-background";
  document.body.appendChild(overlayBg);

  function showOverlay(src) {
    overlay.src = src;
    overlay.style.display = "block";
    overlayBg.style.display = "block";
    overlayBg.style.pointerEvents = "auto";
  }

  function hideOverlay() {
    overlay.style.display = "none";
    overlayBg.style.display = "none";
    overlayBg.style.pointerEvents = "none";
  }

  // Adjust the event listeners on the images to respond to clicks
  document
    .querySelectorAll(".media-gallery img, .landing-gallery img")
    .forEach((img) => {
      img.addEventListener("click", function () {
        showOverlay(this.src);
      });
      // Remove mouseleave event listener as it's no longer necessary
    });

  // Add a click listener to the overlay to hide it when clicked
  overlay.addEventListener("click", hideOverlay);
  overlayBg.addEventListener("click", hideOverlay);

  // Mobile resources panel functionality
  const mobileResourcesPanel = document.getElementById("mobileResourcesPanel");
  if (mobileResourcesPanel) {
    let startY = 0;
    let currentY = 0;
    let isExpanded = false;

    // Touch event handlers for mobile swipe
    mobileResourcesPanel.addEventListener(
      "touchstart",
      function (e) {
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );

    mobileResourcesPanel.addEventListener(
      "touchmove",
      function (e) {
        currentY = e.touches[0].clientY;
        const deltaY = startY - currentY;

        // If swiping up and panel is not expanded, expand it
        if (deltaY > 50 && !isExpanded) {
          mobileResourcesPanel.classList.add("active");
          isExpanded = true;
        }
        // If swiping down and panel is expanded, collapse it
        else if (deltaY < -50 && isExpanded) {
          mobileResourcesPanel.classList.remove("active");
          isExpanded = false;
        }
      },
      { passive: true }
    );

    // Click on tab to toggle
    mobileResourcesPanel.addEventListener("click", function (e) {
      // Only toggle if clicking near the top (tab area)
      const rect = mobileResourcesPanel.getBoundingClientRect();
      const clickY = e.clientY - rect.top;

      if (clickY < 60) {
        // Top 60px is the tab area
        if (isExpanded) {
          mobileResourcesPanel.classList.remove("active");
          isExpanded = false;
        } else {
          mobileResourcesPanel.classList.add("active");
          isExpanded = true;
        }
      }
    });
  }
});
