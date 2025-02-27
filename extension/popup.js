function updateButtonState(isEnabled) {
  const button = document.getElementById("toggleButton");
  if (isEnabled) {
    button.textContent = "Disable Adblocker";
    button.classList.remove("disabled");
    button.classList.add("enabled");
  } else {
    button.textContent = "Enable Adblocker";
    button.classList.remove("enabled");
    button.classList.add("disabled");
  }
}

chrome.storage.local.get("isEnabled", (data) => {
  const isEnabled = data?.isEnabled ?? true;
  updateButtonState(isEnabled);
});

document.getElementById("toggleButton").addEventListener("click", () => {
  chrome.storage.local.get("isEnabled", (data) => {
    const newState = !(data?.isEnabled ?? true);
    chrome.storage.local.set({ isEnabled: newState }, () => {
      updateButtonState(newState);
    });
  });
});
