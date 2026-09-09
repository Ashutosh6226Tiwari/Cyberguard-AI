document.addEventListener('DOMContentLoaded', async () => {
  const domainEl = document.getElementById('domainName');
  const badgeEl = document.getElementById('badge');
  const riskScoreEl = document.getElementById('riskScore');
  const secGradeEl = document.getElementById('secGrade');
  const alertBoxEl = document.getElementById('alertBox');
  const alertTitleEl = document.getElementById('alertTitle');
  const alertDescEl = document.getElementById('alertDesc');
  const aiSummaryEl = document.getElementById('aiSummary');
  const deepScanBtn = document.getElementById('deepScanBtn');

  // Query active tab
  let tab;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    tab = tabs && tabs[0];
  } catch (e) {
    console.error('Failed to query tab:', e);
  }

  if (!tab || !tab.url || !tab.url.startsWith('http')) {
    domainEl.innerText = tab && tab.url ? tab.url.slice(0, 30) : 'No active web page';
    badgeEl.className = 'badge badge-warning';
    badgeEl.innerText = 'INACTIVE';
    aiSummaryEl.innerText = 'Navigate to any HTTP or HTTPS website to perform real-time security analysis.';
    return;
  }

  const currentUrl = tab.url;
  try {
    const urlObj = new URL(currentUrl);
    domainEl.innerText = urlObj.hostname;

    // Helper to fetch from backend with fallback ports/hosts
    async function callBackend(endpoint, payload) {
      const hosts = ['http://localhost:8000', 'http://127.0.0.1:8000'];
      for (const host of hosts) {
        try {
          const res = await fetch(`${host}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            return await res.json();
          }
        } catch (netErr) {
          // try next host
        }
      }
      return null;
    }

    // Try fast scan first for instant (<200ms) responsiveness
    let data = await callBackend('/api/scan/free', { url: currentUrl });
    
    // If free scan failed, try analyze endpoint
    if (!data) {
      data = await callBackend('/api/analyze', { url: currentUrl, deep_analysis: false, force_refresh: false });
    }

    if (data) {
      // Handle both full report and free scan payloads
      const rawScore = data.overall_risk_score !== undefined 
        ? data.overall_risk_score 
        : (data.basic_risk_score !== undefined ? data.basic_risk_score : 0);
      const score = Math.round(rawScore);
      riskScoreEl.innerText = `${score}/100`;

      // Security grade calculation
      let grade = 'B';
      if (data.security_audit && data.security_audit.security_grade) {
        grade = data.security_audit.security_grade;
      } else if (data.verdict === 'UNREGISTERED') {
        grade = 'N/A';
      } else if (data.tls_valid && score <= 10) {
        grade = 'A+';
      } else if (data.tls_valid && score <= 25) {
        grade = 'A';
      } else if (score <= 50) {
        grade = 'B';
      } else if (score <= 75) {
        grade = 'C';
      } else {
        grade = 'F';
      }
      secGradeEl.innerText = grade;

      // Verdict & alert badge handling
      if (data.verdict === 'PHISHING') {
        badgeEl.className = 'badge badge-danger';
        badgeEl.innerText = 'PHISHING THREAT';
        alertBoxEl.style.display = 'block';
        alertTitleEl.innerText = 'CRITICAL PHISHING RISK DETECTED';
        alertDescEl.innerText = data.brand_analysis && data.brand_analysis.is_contradiction
          ? data.brand_analysis.contradiction_explanation
          : (data.triage_reason || 'This site exhibits deceptive phishing patterns targeting credentials.');
      } else if (data.verdict === 'SUSPICIOUS') {
        badgeEl.className = 'badge badge-warning';
        badgeEl.innerText = 'SUSPICIOUS';
      } else if (data.verdict === 'UNREGISTERED') {
        badgeEl.className = 'badge badge-warning';
        badgeEl.innerText = 'UNREGISTERED';
      } else {
        badgeEl.className = 'badge badge-safe';
        badgeEl.innerText = 'VERIFIED BENIGN';
      }

      // AI telemetry brief
      if (data.ai_insights && data.ai_insights.threat_intel_analysis) {
        aiSummaryEl.innerText = data.ai_insights.threat_intel_analysis;
      } else if (data.triage_reason) {
        const ageStr = data.domain_age_days ? `${data.domain_age_days}d domain age` : 'Active domain';
        const regStr = data.registrar ? ` (${data.registrar})` : '';
        const tlsStr = data.tls_valid ? '• TLS Secure' : '• Insecure TLS';
        aiSummaryEl.innerText = `${data.triage_reason} [${ageStr}${regStr} ${tlsStr}]`;
      } else {
        aiSummaryEl.innerText = `Domain evaluated with verified forensic telemetry. Action: ${data.recommended_action || 'Safe to proceed.'}`;
      }
    } else {
      riskScoreEl.innerText = '--';
      secGradeEl.innerText = '--';
      badgeEl.className = 'badge badge-danger';
      badgeEl.innerText = 'OFFLINE';
      aiSummaryEl.innerText = 'CyberGuard Core offline. Ensure backend server is running at http://localhost:8000.';
    }
  } catch (err) {
    riskScoreEl.innerText = '--';
    secGradeEl.innerText = '--';
    badgeEl.className = 'badge badge-danger';
    badgeEl.innerText = 'OFFLINE';
    aiSummaryEl.innerText = 'Local scanner engine unreachable. Ensure CyberGuard server is running at http://localhost:8000.';
  }

  deepScanBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `http://localhost:5173/?scan=${encodeURIComponent(currentUrl)}` });
  });
});
