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

function parseSiteInput(input) {
  try {
    const value = input.trim();
    if (!value) return null;

    const withProtocol =
      value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`;

    const url = new URL(withProtocol);

    return {
      hostname: url.hostname.replace(/^www\./, "").toLowerCase(),
      pathname: url.pathname
    };
  } catch (err) {
    console.warn("Invalid site input:", input);
    return null;
  }
}

function normalizePath(pathname) {
  if (!pathname || pathname === "") return "/";
  return pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;
}

function normalizeSiteForStorage(input) {
  const parsed = parseSiteInput(input);
  if (!parsed) return null;

  const path = normalizePath(parsed.pathname);

  if (path === "/") {
    return parsed.hostname;
  }

  return `${parsed.hostname}${path}`;
}

function renderSites(sites) {
  siteList.innerHTML = "";

  for (const site of sites) {
    const li = document.createElement("li");
    li.textContent = site + " ";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = async () => {
      const updated = sites.filter((s) => s !== site);
      await saveAllowedSites(updated);
      renderSites(updated);
    };

    li.appendChild(removeBtn);
    siteList.appendChild(li);
  }
}

async function addSite() {
  const site = normalizeSiteForStorage(siteInput.value);
  if (!site) return;

  const sites = await getAllowedSites();

  if (!sites.includes(site)) {
    sites.push(site);
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