const HOUR = 60 * 60 * 1000;
let isEnabled = true;
let domainListWithCustomJs;

chrome.storage.local.get("isEnabled", (data) => {
  isEnabled = data?.isEnabled ?? true;
  blockAds(isEnabled);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "isEnabled" in changes) {
    isEnabled = changes.isEnabled.newValue;
    blockAds(isEnabled);
  }
});

async function loadFiltersFromServer() {
  try {
    const response = await fetch("http://localhost:3000");
    const rules = await response.json();

    return await updateBlockingRules(rules);
  } catch (error) {
    console.error("Ошибка при загрузке фильтров с сервера:", error);
  }
}

async function getDomainListWithCustomJs() {
  try {
    const response = await fetch("http://localhost:3000/custom-list");
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Ошибка при загрузкесписка доменов с сервера:", error);
  }
}

async function updateBlockingRules(data) {
  return chrome.declarativeNetRequest.getDynamicRules((rules) => {

    const rulesId = rules.map(rule => rule?.id)
    const filteredRules = data.filter(item => !rulesId.includes(item.id))
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: filteredRules,
    });
  });
}

async function removeAllRules() {
  return chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const ruleIds = rules.map((rule) => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds });
  });
}

async function blockAds(isEnabled) {
  if (isEnabled) {
    await removeAllRules();
    await loadData();
  } else {
    await removeAllRules();
    domainListWithCustomJs = {};
    domainListWithCustomJs = {};
  }
}

chrome.webNavigation.onCompleted.addListener(
  (details) => {
    const url = new URL(details.url);
    const domain = url.hostname;
    const scriptSrc = domainListWithCustomJs?.[domain];

    if (scriptSrc) {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: injectScript,
        args: [scriptSrc],
      });
    }
  },
  { scheme: ["http", "https"] }
);

function injectScript(scriptSrc) {
  const script = document.createElement("script");
  script.src = scriptSrc;
  document.body.appendChild(script);
}

async function loadData() {
  const [_, domains] = await Promise.all([
    loadFiltersFromServer(),
    getDomainListWithCustomJs(),
  ]);
  domainListWithCustomJs = domains;
}

loadData();

setInterval(async () => {
  if (!isEnabled) return;

  await loadData();
}, HOUR);
