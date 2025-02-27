const HOUR = 60 * 60 * 1000;
const CUSTOM_SCRIPTS = {
  "www.comss.ru": () => {
    console.log(18953897);
    document.body.style.backgroundColor = "red";
  },
};

async function loadFiltersFromServer() {
  try {
    const response = await fetch("http://localhost:3000");
    const rules = await response.json();
    await removeAllRules();

    return await updateBlockingRules(rules);
  } catch (error) {
    console.error("Ошибка при загрузке фильтров с сервера:", error);
  }
}

async function updateBlockingRules(rules) {
  return chrome.declarativeNetRequest.updateDynamicRules({ addRules: rules });
}

async function removeAllRules() {
  return chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const ruleIds = rules.map((rule) => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds });
  });
}

chrome.webNavigation.onCompleted.addListener(
  (details) => {
    const url = new URL(details.url);
    const domain = url.hostname;
    const script = CUSTOM_SCRIPTS[domain];

    if (script) {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: script,
      });
    }
  },
  { scheme: ["http", "https"] }
);

setInterval(() => {
  loadFiltersFromServer();
}, HOUR);
