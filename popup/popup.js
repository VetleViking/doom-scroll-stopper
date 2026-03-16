const siteInput = document.getElementById("siteInput");
const addBtn = document.getElementById("addBtn");
const siteList = document.getElementById("siteList");

async function getAllowedSites() {
  const result = await chrome.storage.local.get("allowedSites");
  return result.allowedSites || [];
}

async function saveAllowedSites(sites) {
  await chrome.storage.local.set({ allowedSites: sites });
}

function renderSites(sites) {
  siteList.innerHTML = "";

  for (const pattern of sites) {
    const li = document.createElement("li");
    li.textContent = pattern + " ";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = async () => {
      const updated = sites.filter(s => s !== pattern);
      await saveAllowedSites(updated);
      renderSites(updated);
    };

    li.appendChild(removeBtn);
    siteList.appendChild(li);
  }
}

function normalizePattern(input) {
  let value = input.trim();

  if (!value) return null;

  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    value = `https://${value}`;
  }

  if (!value.includes("*")) {
    if (value.endsWith("/")) {
      value += "*";
    } else {
      value += "/*";
    }
  }

  return value;
}

async function addSite() {
  const pattern = normalizePattern(siteInput.value);
  if (!pattern) return;

  const sites = await getAllowedSites();
  if (!sites.includes(pattern)) {
    sites.push(pattern);
    await saveAllowedSites(sites);
  }

  renderSites(sites);
  siteInput.value = "";
}

addBtn.addEventListener("click", addSite);

(async () => {
  const sites = await getAllowedSites();
  renderSites(sites);
})();