// CyberGuard AI Extension Service Worker (Supports Local & Autonomous Edge Modes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    try {
      // 1. Try configured/local backend
      let backendUrl = 'http://localhost:8000';
      try {
        const stored = await chrome.storage.local.get(['cyberguard_backend_url']);
        if (stored && stored.cyberguard_backend_url) {
          backendUrl = stored.cyberguard_backend_url;
        }
      } catch (e) {}

      const hosts = [backendUrl, 'http://localhost:8000', 'http://127.0.0.1:8000'];
      let data = null;

      for (const host of [...new Set(hosts)]) {
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

      // 2. Autonomous Edge Mode (if no backend running)
      if (!data) {
        try {
          const host = new URL(tab.url).hostname;
          const doh = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`).then(r => r.json());
          if (doh && doh.Status === 3) {
            data = { verdict: 'UNREGISTERED' };
          } else {
            // Check brand keywords in subdomains
            const parts = host.split('.');
            const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : host;
            const subdomains = parts.length > 2 ? parts.slice(0, -2).join('.') : '';
            const brandKeywords = ['paypal', 'microsoft', 'google', 'apple', 'amazon', 'netflix', 'chase', 'login', 'verify'];
            const isContradiction = brandKeywords.some(b => subdomains.includes(b) && !rootDomain.includes(b));
            data = { verdict: isContradiction ? 'PHISHING' : 'BENIGN' };
          }
        } catch (e) {
          data = { verdict: 'BENIGN' };
        }
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
