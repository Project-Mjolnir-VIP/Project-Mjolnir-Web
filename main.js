let pageIndex = 1; // Start with Page Center

const pageContainer = document.getElementById('pageContainer');
const pages = document.querySelectorAll('.page');

document.addEventListener('click', onClick);

function onClick(e) {
    const edgeThreshold = window.innerWidth / 15; // Smaller clickable area at the edges

    console.log('Click detected at:', e.clientX, 'Window width:', window.innerWidth);

    if (e.clientX <= edgeThreshold && pageIndex > 1) {
        pageIndex--;
        console.log('Moving to left page, new pageIndex:', pageIndex);
    } else if (e.clientX >= window.innerWidth - edgeThreshold && pageIndex < pages.length) {
        pageIndex++;
        console.log('Moving to right page, new pageIndex:', pageIndex);
    }

    updatePages();
}

function updatePages() {
    const transformValue = `translateX(-${(pageIndex - 1) * 33.33}%)`;
    console.log('Updating pages with transform:', transformValue);

    pageContainer.style.transform = transformValue;
}



const success = (api) => {
    // api.start will start loading the 3D model
    api.start(() => console.log("Sketchfab scene starts loading"));
    api.addEventListener("viewerready", () => console.log("Sketchfab scene is ready"))
  };
  const loadSketchfab = (sceneuid, elementId) => {
    // To get started with Sketchfab, we need to create a client
    // object for a certain iframe in the DOM
    const iframe = document.getElementById(elementId);
    const client = new Sketchfab("1.12.1", iframe);
  
    // Then we can initialize the client with a specific model
    // and some player parameters
    client.init(sceneuid, {
      success: success,
      error: () => console.error("Sketchfab API error"),
      ui_stop: 0,
      preload: 1,
      camera: 0
    });
  };
  document.addEventListener('DOMContentLoaded', function() {
    loadSketchfab("7c4122660e514aa1b590f4691c33d9ac", "api-frame");
  });

  document.addEventListener('DOMContentLoaded', function() {
    // Create the overlay element and append it to the body
    const overlay = document.createElement('img');
    overlay.id = 'image-overlay';
    document.body.appendChild(overlay);
  
    // Function to show the overlay
    function showOverlay(src) {
      overlay.src = src;
      overlay.style.display = 'block'; // Show the overlay
    }
  
    // Function to hide the overlay
    function hideOverlay() {
      overlay.style.display = 'none'; // Hide the overlay
    }
  
    // Add hover event listeners to all images within the media gallery
    document.querySelectorAll('.media-gallery img').forEach(img => {
      img.addEventListener('mouseenter', function() {
        showOverlay(this.src);
      });
      img.addEventListener('mouseleave', hideOverlay);
    });
  
    // Optionally, hide the overlay when it's clicked, allowing users to return to the content
    overlay.addEventListener('click', hideOverlay);
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.createElement('img');
    overlay.id = 'image-overlay';
    overlay.style.pointerEvents = 'none'; // Ignore mouse events
    document.body.appendChild(overlay);
  
    const overlayBg = document.createElement('div');
    overlayBg.id = 'overlay-background';
    overlayBg.style.pointerEvents = 'none'; // Allow clicks to pass through
    document.body.appendChild(overlayBg);
  
    // No need for debounce here, directly show/hide overlay
    function showOverlay(src) {
      overlay.src = src;
      overlay.style.display = 'block';
      overlayBg.style.display = 'block';
    }
  
    function hideOverlay() {
      overlay.style.display = 'none';
      overlayBg.style.display = 'none';
    }
  
    document.querySelectorAll('.media-gallery img').forEach(img => {
      img.addEventListener('mouseenter', function() {
        showOverlay(this.src);
      });
      img.addEventListener('mouseleave', hideOverlay);
    });
  
    // Since pointer events are ignored, no need to attach click events to hide
  });
  