(async function () {
  const overlay = document.createElement("div");
  overlay.id = "image-overlay";
  
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("image.png");
  img.draggable = false;

  overlay.appendChild(img);
  document.documentElement.appendChild(overlay);

  const result = await chrome.storage.local.get("timeLimit");
  const duration = result.timeLimit || 60 * 1000;
  const interval = 100;
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