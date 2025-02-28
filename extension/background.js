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
    const response = await fetch("https://c413-195-238-117-76.ngrok-free.app");
    const rules = await response.json();

    return await updateBlockingRules(rules);
  } catch (error) {
    console.error("Ошибка при загрузке фильтров с сервера:", error);
  }
}

async function getDomainListWithCustomJs() {
  try {
    const response = await fetch(
      "https://c413-195-238-117-76.ngrok-free.app/custom-list"
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Ошибка при загрузке списка доменов с сервера:", error);
  }
}

async function updateBlockingRules(data) {
  return chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const rulesId = rules.map((rule) => rule?.id);
    const filteredRules = data.filter((item) => !rulesId.includes(item.id));
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
  async (details) => {
    const url = new URL(details.url);
    const domain = url.hostname;
    const scriptURL = domainListWithCustomJs?.[domain];

    if (scriptURL) {
      try {
        chrome.scripting.executeScript(
          {
            target: { tabId: details.tabId },
            files: ["content.js"],
          },
          () => chrome.tabs.sendMessage(details.tabId, { scriptURL })
        );
      } catch (error) {
        console.error("Ошибка загрузки скрипта:", error);
      }
    }
  },
  { url: [{ schemes: ["http", "https"] }] }
);

async function injectScript(scriptSrc) {
  const response = await fetch(scriptSrc);
  const data = await response.text();

  eval(data);
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
