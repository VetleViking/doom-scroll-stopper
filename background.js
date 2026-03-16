const ext = globalThis.browser ?? globalThis.chrome;

ext.runtime.onInstalled.addListener(() => {
  console.log("Service worker installed");
});

function parseSiteInput(input) {
  try {
    const withProtocol =
      input.startsWith("http://") || input.startsWith("https://")
        ? input
        : `https://${input}`;

    const url = new URL(withProtocol);

    return {
      hostname: url.hostname.replace(/^www\./, "").toLowerCase(),
      pathname: url.pathname
    };
  } catch (err) {
    console.warn("Invalid URL/pattern:", input);
    return null;
  }
}

function normalizePath(pathname) {
  if (!pathname || pathname === "") return "/";
  return pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;
}

async function getAllowedSites() {
  const result = await ext.storage.local.get("allowedSites");
  return result.allowedSites || [];
}

async function shouldRunOnUrl(url) {
  const current = parseSiteInput(url);
  if (!current) return false;

  const currentPath = normalizePath(current.pathname);
  const sites = await getAllowedSites();

  console.log("Checking:", current, "against", sites);

  return sites.some((site) => {
    const allowed = parseSiteInput(site);
    if (!allowed) return false;

    const allowedPath = normalizePath(allowed.pathname);

    if (allowed.hostname !== current.hostname) {
      return false;
    }

    if (allowedPath === "/") {
      return currentPath === "/";
    }

    console.log(`Comparing paths: current="${currentPath}" vs allowed="${allowedPath}"`);

    return (
      currentPath === allowedPath ||
      currentPath.startsWith(allowedPath + "/")
    );
  });
}

ext.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const allowed = await shouldRunOnUrl(tab.url);
  console.log(`Tab updated: ${tab.url}, allowed: ${allowed}`);

  if (!allowed) return;

  await ext.scripting.insertCSS({
    target: { tabId },
    files: ["styles.css"]
  });

  await ext.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
});