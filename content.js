(function () {
  const overlay = document.createElement("div");
  overlay.id = "image-overlay";

  
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("image.png");
  img.draggable = false;

  overlay.appendChild(img);
  document.documentElement.appendChild(overlay);
})();