// CyberGuard AI Extension Service Worker
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    try {
      const hosts = ['http://localhost:8000', 'http://127.0.0.1:8000'];
      let data = null;

      for (const host of hosts) {
        try {
          const response = await fetch(`${host}/api/scan/free`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: tab.url })
          });
          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch (e) {}
      }

      if (data) {
        if (data.verdict === 'PHISHING') {
          chrome.action.setBadgeText({ text: 'ALERT', tabId });
          chrome.action.setBadgeBackgroundColor({ color: '#EF4444', tabId });
        } else if (data.verdict === 'SUSPICIOUS' || data.verdict === 'UNREGISTERED') {
          chrome.action.setBadgeText({ text: 'WARN', tabId });
          chrome.action.setBadgeBackgroundColor({ color: '#F97316', tabId });
        } else {
          chrome.action.setBadgeText({ text: 'SAFE', tabId });
          chrome.action.setBadgeBackgroundColor({ color: '#10B981', tabId });
        }
      }
    } catch (e) {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});
