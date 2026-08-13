chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchWebsiteData") {
    fetch(message.url)
      .then(res => res.text())
      .then(html => {
        const matches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        sendResponse({ email: [...new Set(matches)][0] || "No Email Found" });
      })
      .catch(() => sendResponse({ email: "Access Blocked/Failed" }));
    return true;
  }
});
