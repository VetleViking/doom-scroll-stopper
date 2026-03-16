(function () {
  const overlay = document.createElement("div");
  overlay.id = "image-overlay";
  
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("image.png");
  img.draggable = false;

  overlay.appendChild(img);
  document.documentElement.appendChild(overlay);

  // 1 minute
  const duration = 60 * 1000;
  const interval = 20;
  const startTime = Date.now();

  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    overlay.style.opacity = progress;

    if (progress > 1) {
      clearInterval(progressInterval);
    }
  }, interval);

})();