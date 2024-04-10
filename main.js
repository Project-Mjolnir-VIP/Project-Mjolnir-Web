document.addEventListener("DOMContentLoaded", function () {
  let pageIndex = 0; // Start with the first page visible
  const pageContainer = document.getElementById("pageContainer");
  const totalPages = document.querySelectorAll(".page").length;

  // Function to update the page position based on pageIndex
  function updatePagePosition() {
    const offset = pageIndex * 100; // Move 100vw for each page
    pageContainer.style.transform = `translateX(-${offset}vw)`;
  }

  // Adjusting #pageUp opacity based on scroll
  window.addEventListener("scroll", function () {
    const fadeEffectThreshold = window.innerHeight; // Adjust threshold as needed
    const opacity = 1 - Math.min(window.scrollY / fadeEffectThreshold, 1);
    document.getElementById("pageUp").style.opacity = opacity;
  });

  document.addEventListener("click", function (e) {
    const edgeThreshold = 100; // Pixels from the edge to detect
    const clickX = e.clientX;
    const viewportWidth = window.innerWidth;

    if (clickX < edgeThreshold && pageIndex > 0 < 2) {
      pageIndex--;
    } else if (
      clickX > viewportWidth - edgeThreshold &&
      pageIndex < totalPages - 1
    ) {
      pageIndex++;
    }
    updatePagePosition();
    adjustVisibilityBasedOnPage(pageIndex);
  });

  function adjustVisibilityBasedOnPage(currentPageIndex) {
    const pageLeft = document.getElementById("pageLeft");
    const pageRight = document.getElementById("pageRight");
    // Select absolutely positioned elements specifically, if they can be identified by a class
    const absElementsInPageLeft = pageLeft.querySelectorAll(".abs-element");

    if (currentPageIndex === 1) {
      // Assuming pageIndex 1 corresponds to #pageRight
      pageLeft.style.display = "none";
      absElementsInPageLeft.forEach((el) => (el.style.visibility = "hidden")); // Hide absolutely positioned elements
      pageRight.style.display = "block";
      document.body.classList.add("no-scroll");
    } else {
      pageLeft.style.display = "block";
      absElementsInPageLeft.forEach((el) => (el.style.visibility = "visible")); // Show absolutely positioned elements
      document.body.classList.remove("no-scroll");
    }

    // Optionally adjust visibility for other pages
    otherPages.forEach((page) => {
      if (currentPageIndex !== Array.from(otherPages).indexOf(page)) {
        page.style.display = "none";
      } else {
        page.style.display = "block";
      }
    });
  }
    
    
    
    
    

  // Nav to bottom
  var navButton = document.getElementById("aboutButton");
  navButton.addEventListener("click", function () {
    window.scrollTo({
      top: document.body.scrollHeight, // The maximum height of the document
      behavior: "smooth", // Optional: Adds a smooth scrolling effect
    });
  });

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
    });
  };

  loadSketchfab("823f7f95ba5145e18b052c5e95097dbd", "api-frame");

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
  document.querySelectorAll(".media-gallery img").forEach((img) => {
    img.addEventListener("click", function () {
      showOverlay(this.src);
    });
    // Remove mouseleave event listener as it's no longer necessary
  });

  // Add a click listener to the overlay to hide it when clicked
  overlay.addEventListener("click", hideOverlay);
  overlayBg.addEventListener("click", hideOverlay);
});
