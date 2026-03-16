chrome.runtime.onInstalled.addListener(() => {
  console.log("Service worker installed");
});

function getHostname(input) {
  try {
    const withProtocol = input.startsWith("http://") || input.startsWith("https://")
      ? input
      : `https://${input}`;

    return new URL(withProtocol).hostname;
  } catch (err) {
    console.warn("Invalid URL/pattern:", input);
    return null;
  }
}

function normalizeHost(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

async function getAllowedSites() {
  const result = await chrome.storage.local.get("allowedSites");
  return result.allowedSites || [];
}

async function shouldRunOnUrl(url) {
  const currentHostname = getHostname(url);
  if (!currentHostname) return false;

  const normalizedCurrent = normalizeHost(currentHostname);
  const sites = await getAllowedSites();

  console.log("Checking:", normalizedCurrent, "against", sites);

  return sites.some((site) => {
    const allowedHostname = getHostname(site);
    if (!allowedHostname) return false;

    return normalizeHost(allowedHostname) === normalizedCurrent;
  });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const allowed = await shouldRunOnUrl(tab.url);
  console.log(`Tab updated: ${tab.url}, allowed: ${allowed}`);

  if (!allowed) return;

  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ["styles.css"]
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
});