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
  
  loadSketchfab("5c3e7d8351814b0b82036c10a22335da", "api-frame");
  