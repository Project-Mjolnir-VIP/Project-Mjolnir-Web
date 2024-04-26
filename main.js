document.addEventListener("DOMContentLoaded", function () {








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

  // Example of programmatically using smooth-scroll with options
  var navButton = document.getElementById("aboutButton");
  navButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default anchor behavior
    var target = document.body.scrollHeight; // Or any other target
    scroll.animateScroll(target, null, { speed: 500, speedAsDuration: true }); // Custom speed for this particular scroll
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
