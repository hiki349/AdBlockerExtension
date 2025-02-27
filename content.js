const NEW_TEXT = "New Text";

function replaceSearchInputAndSubmit() {
  const searchInput = document.querySelector(
    "textarea[name='q'], input[name='q']"
  );

  if (searchInput && searchInput.value !== NEW_TEXT) {
    searchInput.value = NEW_TEXT;
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    setTimeout(() => {
      searchInput.form?.submit();
    }, 300);
  }
}

replaceSearchInputAndSubmit();

const searchContainer =
  document.querySelector("form[role='search']") || document.body;
const observer = new MutationObserver(() => replaceSearchInputAndSubmit());

observer.observe(searchContainer, { childList: true, subtree: true });
