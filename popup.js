document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.innerText = "Scanning Maps...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url.includes("google.com/maps")) {
    status.innerText = "Error: Open Google Maps first!";
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const data = [];
      document.querySelectorAll('div[role="article"]').forEach(art => {
        const titleEl = art.querySelector('div.fontHeadlineSmall');
        const webEl = art.querySelector('a[data-value="Website"]') || art.querySelector('a[href*="http"]:not([href*="google"])');
        if (titleEl) {
          data.push({ name: titleEl.innerText.trim(), website: webEl ? webEl.href : "No Website" });
        }
      });
      return data;
    }
  }, async (results) => {
    const items = results[0]?.result || [];
    if (!items.length) {
      status.innerText = "No data found. Scroll the page!";
      return;
    }

    const finalData = [];
    for (let i = 0; i < items.length; i++) {
      status.innerText = `Fetching ${i + 1}/${items.length}...`;
      let email = "No Website";
      if (items[i].website.startsWith("http")) {
        email = await new Promise(res => {
          chrome.runtime.sendMessage({ action: "fetchWebsiteData", url: items[i].website }, r => res(r?.email || "Error"));
        });
      }
      finalData.push({ Name: items[i].name, Website: items[i].website, Email: email });
    }

    let csv = "data:text/csv;charset=utf-8,Name,Website,Email\n";
    finalData.forEach(r => csv += `"${r.Name.replace(/"/g, '""')}","${r.Website}","${r.Email}"\n`);
    
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = "maps_data.csv";
    a.click();
    status.innerText = "Downloaded successfully!";
  });
});
