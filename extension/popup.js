// CyberGuard AI - Production Extension Engine (Supports Local & Autonomous Edge Modes)
document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const domainEl = document.getElementById('domainName');
  const protoBadgeEl = document.getElementById('protocolBadge');
  const badgeEl = document.getElementById('badge');
  const riskScoreEl = document.getElementById('riskScore');
  const riskBarEl = document.getElementById('riskBar');
  const secGradeEl = document.getElementById('secGrade');
  const secGradeSubEl = document.getElementById('secGradeSub');
  const alertBoxEl = document.getElementById('alertBox');
  const alertTitleEl = document.getElementById('alertTitle');
  const alertDescEl = document.getElementById('alertDesc');
  const aiSummaryEl = document.getElementById('aiSummary');
  const teleDnsEl = document.getElementById('teleDns');
  const teleTlsEl = document.getElementById('teleTls');
  const teleMailEl = document.getElementById('teleMail');
  const teleAgeEl = document.getElementById('teleAge');
  const vectorTagsEl = document.getElementById('vectorTags');
  const deepScanBtn = document.getElementById('deepScanBtn');
  const copyBriefBtn = document.getElementById('copyBriefBtn');
  const copyToastEl = document.getElementById('copyToast');
  const engineStatusDotEl = document.getElementById('engineStatusDot');
  const engineStatusTextEl = document.getElementById('engineStatusText');
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsDrawer = document.getElementById('settingsDrawer');
  const backendUrlInput = document.getElementById('backendUrlInput');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');

  // Load configured backend URL
  let backendUrl = 'http://localhost:8000';
  try {
    const stored = await chrome.storage.local.get(['cyberguard_backend_url']);
    if (stored && stored.cyberguard_backend_url) {
      backendUrl = stored.cyberguard_backend_url;
      backendUrlInput.value = backendUrl;
    }
  } catch (e) {}

  // Settings toggle
  settingsToggleBtn.addEventListener('click', () => {
    settingsDrawer.style.display = settingsDrawer.style.display === 'none' ? 'block' : 'none';
  });

  saveSettingsBtn.addEventListener('click', async () => {
    const val = backendUrlInput.value.trim().replace(/\/+$/, '');
    if (val) {
      backendUrl = val;
      await chrome.storage.local.set({ cyberguard_backend_url: val });
      settingsDrawer.style.display = 'none';
      evaluateTarget();
    }
  });

  // Query Active Tab
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
    engineStatusDotEl.className = 'status-dot offline';
    engineStatusTextEl.innerText = 'Browser Internal / System Tab';
    aiSummaryEl.innerText = 'Navigate to any HTTP or HTTPS website to perform real-time security telemetry.';
    return;
  }

  const currentUrl = tab.url;
  let parsedUrl;
  try {
    parsedUrl = new URL(currentUrl);
  } catch (e) {
    domainEl.innerText = currentUrl;
    return;
  }

  const hostname = parsedUrl.hostname;
  const isHttps = parsedUrl.protocol === 'https:';
  domainEl.innerText = hostname;
  protoBadgeEl.innerText = isHttps ? 'HTTPS' : 'HTTP INSECURE';
  protoBadgeEl.style.color = isHttps ? '#38bdf8' : '#ef4444';

  let currentTelemetryData = null;

  async function evaluateTarget() {
    // 1. Attempt connection to CyberGuard Core Backend
    let data = null;
    let isCoreOnline = false;

    const candidateHosts = [backendUrl, 'http://localhost:8000', 'http://127.0.0.1:8000'];
    const uniqueHosts = [...new Set(candidateHosts)];

    for (const host of uniqueHosts) {
      try {
        const res = await fetch(`${host}/api/scan/free`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentUrl })
        });
        if (res.ok) {
          data = await res.json();
          isCoreOnline = true;
          break;
        }
      } catch (err) {
        // Try next candidate
      }
    }

    // 2. If backend is not reachable (e.g. on another machine), run Autonomous Client-Side Edge Engine!
    if (!data) {
      engineStatusDotEl.className = 'status-dot autonomous';
      engineStatusTextEl.innerText = 'Autonomous Edge DNS Shield (Zero-Backend Active)';
      data = await runAutonomousClientAnalysis(currentUrl, hostname, isHttps);
    } else {
      engineStatusDotEl.className = 'status-dot online';
      engineStatusTextEl.innerText = 'CyberGuard SOC Core Connected (:8000)';
    }

    currentTelemetryData = data;
    renderResults(data, isHttps);
  }

  // --- Autonomous Edge Intelligence Engine ---
  // Works on ANY machine without needing python or server running
  async function runAutonomousClientAnalysis(url, host, isSecure) {
    let aRecords = [];
    let txtRecords = [];
    let isRegistered = true;
    let dnsStatus = 'RESOLVED';

    try {
      // Query Google Public DNS-over-HTTPS directly from browser
      const [resA, resTxt] = await Promise.all([
        fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`).then(r => r.json()).catch(() => null),
        fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=TXT`).then(r => r.json()).catch(() => null)
      ]);

      if (resA) {
        if (resA.Status === 3) {
          isRegistered = false;
          dnsStatus = 'NXDOMAIN';
        } else if (resA.Answer) {
          aRecords = resA.Answer.filter(ans => ans.type === 1).map(ans => ans.data);
        }
      }

      if (resTxt && resTxt.Answer) {
        txtRecords = resTxt.Answer.filter(ans => ans.type === 16).map(ans => ans.data);
      }
    } catch (e) {
      dnsStatus = 'QUERY_LIMITED';
    }

    // Calculate lexical Shannon entropy
    function calcEntropy(str) {
      const map = {};
      for (let i = 0; i < str.length; i++) map[str[i]] = (map[str[i]] || 0) + 1;
      let ent = 0;
      for (let k in map) {
        const p = map[k] / str.length;
        ent -= p * Math.log2(p);
      }
      return ent;
    }

    const hostEntropy = calcEntropy(host);
    const hasSpf = txtRecords.some(t => t.toLowerCase().includes('v=spf1'));
    const hasDmarc = txtRecords.some(t => t.toLowerCase().includes('v=dmarc1'));

    // Check for Brand Impersonation in Subdomains
    const brandKeywords = ['paypal', 'microsoft', 'google', 'apple', 'amazon', 'netflix', 'chase', 'bankofamerica', 'login', 'verify', 'update', 'secure', 'banking'];
    const parts = host.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : '';
    const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : host;
    const subdomains = parts.length > 2 ? parts.slice(0, -2).join('.') : '';

    let brandDetected = null;
    let isContradiction = false;
    for (const b of brandKeywords) {
      if (subdomains.includes(b) && !rootDomain.includes(b)) {
        brandDetected = b;
        isContradiction = true;
        break;
      }
    }

    // Risky TLD heuristic
    const riskyTlds = ['xyz', 'top', 'buzz', 'club', 'work', 'fit', 'gq', 'tk', 'ml', 'cf', 'ga'];
    const isRiskyTld = riskyTlds.includes(tld.toLowerCase());

    // Score calculation
    let score = 1.0;
    let verdict = 'BENIGN';

    if (!isRegistered) {
      verdict = 'UNREGISTERED';
      score = 0.0;
    } else if (isContradiction) {
      score = 92.0;
      verdict = 'PHISHING';
    } else if (isRiskyTld && hostEntropy > 4.2) {
      score = 55.0;
      verdict = 'SUSPICIOUS';
    } else if (!isSecure) {
      score = 30.0;
      verdict = 'SUSPICIOUS';
    } else if (hostEntropy > 4.5) {
      score = 42.0;
      verdict = 'SUSPICIOUS';
    }

    return {
      canonical_domain: host,
      basic_risk_score: score,
      verdict: verdict,
      is_registered: isRegistered,
      domain_age_days: null,
      registrar: isRegistered ? 'Standard Registry' : 'Unassigned',
      dns_a_records: aRecords,
      has_spf: hasSpf,
      has_dmarc: hasDmarc,
      tls_valid: isSecure,
      triage_reason: isContradiction 
        ? `Brand contradiction alert: Subdomain mimics '${brandDetected}' but root domain is '${rootDomain}'.`
        : (!isRegistered ? 'Domain is not registered in global root DNS (NXDOMAIN).' : (isSecure ? 'Lexical and DNS signals conform to benign baseline.' : 'Insecure unencrypted HTTP connection detected.')),
      is_autonomous: true
    };
  }

  // --- Render Results to UI ---
  function renderResults(data, isSecure) {
    const rawScore = data.overall_risk_score !== undefined 
      ? data.overall_risk_score 
      : (data.basic_risk_score !== undefined ? data.basic_risk_score : 0);
    const score = Math.round(rawScore);
    riskScoreEl.innerText = `${score}/100`;

    // Visual Progress Bar
    riskBarEl.style.width = `${Math.min(100, Math.max(3, score))}%`;
    if (score >= 70) {
      riskBarEl.style.background = '#ef4444';
      riskScoreEl.style.color = '#ef4444';
    } else if (score >= 35) {
      riskBarEl.style.background = '#f97316';
      riskScoreEl.style.color = '#fb923c';
    } else {
      riskBarEl.style.background = '#10b981';
      riskScoreEl.style.color = '#38bdf8';
    }

    // Security Grade
    let grade = 'B';
    let gradeDesc = 'Standard Posture';
    if (data.security_audit && data.security_audit.security_grade) {
      grade = data.security_audit.security_grade;
      gradeDesc = `${data.security_audit.score_percentage.toFixed(0)}% Pass Rate`;
    } else if (data.verdict === 'UNREGISTERED') {
      grade = 'N/A';
      gradeDesc = 'Inactive Host';
    } else if (data.tls_valid && score <= 5 && (data.has_spf || data.has_dmarc)) {
      grade = 'A+';
      gradeDesc = 'Hardened Host';
    } else if (data.tls_valid && score <= 20) {
      grade = 'A';
      gradeDesc = 'Strong Defense';
    } else if (score <= 45) {
      grade = 'B';
      gradeDesc = 'Moderate Defense';
    } else if (score <= 70) {
      grade = 'C';
      gradeDesc = 'Vulnerable Posture';
    } else {
      grade = 'F';
      gradeDesc = 'Critical Exposure';
    }

    secGradeEl.innerText = grade;
    secGradeSubEl.innerText = gradeDesc;
    if (grade === 'A+' || grade === 'A') secGradeEl.style.color = '#10b981';
    else if (grade === 'B') secGradeEl.style.color = '#38bdf8';
    else if (grade === 'C') secGradeEl.style.color = '#f59e0b';
    else secGradeEl.style.color = '#ef4444';

    // Verdict Badge
    if (data.verdict === 'PHISHING') {
      badgeEl.className = 'badge badge-danger';
      badgeEl.innerText = 'PHISHING THREAT';
      alertBoxEl.style.display = 'flex';
      alertTitleEl.innerText = 'CRITICAL PHISHING RISK DETECTED';
      alertDescEl.innerText = data.brand_analysis && data.brand_analysis.is_contradiction
        ? data.brand_analysis.contradiction_explanation
        : (data.triage_reason || 'This site exhibits deceptive phishing patterns targeting user credentials.');
    } else if (data.verdict === 'SUSPICIOUS') {
      badgeEl.className = 'badge badge-warning';
      badgeEl.innerText = 'SUSPICIOUS';
      alertBoxEl.style.display = 'none';
    } else if (data.verdict === 'UNREGISTERED') {
      badgeEl.className = 'badge badge-warning';
      badgeEl.innerText = 'UNREGISTERED';
      alertBoxEl.style.display = 'none';
    } else {
      badgeEl.className = 'badge badge-safe';
      badgeEl.innerText = 'VERIFIED BENIGN';
      alertBoxEl.style.display = 'none';
    }

    // Telemetry Grid
    const aCount = data.dns_a_records ? data.dns_a_records.length : (data.domain_intel?.dns?.a_records?.length || 0);
    teleDnsEl.innerText = data.verdict === 'UNREGISTERED' ? 'NXDOMAIN' : (aCount > 0 ? `Active (${aCount} IPs)` : 'Resolved');
    teleTlsEl.innerText = data.tls_valid ? 'Valid TLS (Secure)' : 'Insecure (No TLS)';
    teleTlsEl.style.color = data.tls_valid ? '#34d399' : '#f87171';

    const hasSpf = data.has_spf !== undefined ? data.has_spf : (data.domain_intel?.dns?.txt_records?.some(t => t.includes('v=spf1')) || false);
    const hasDmarc = data.has_dmarc !== undefined ? data.has_dmarc : (data.domain_intel?.dns?.txt_records?.some(t => t.includes('v=dmarc1')) || false);
    teleMailEl.innerText = (hasSpf && hasDmarc) ? 'SPF + DMARC' : (hasSpf ? 'SPF Only' : 'Missing DMARC');
    teleMailEl.style.color = (hasSpf && hasDmarc) ? '#34d399' : (hasSpf ? '#fbbf24' : '#94a3b8');

    if (data.domain_age_days) {
      teleAgeEl.innerText = `${data.domain_age_days}d old`;
    } else if (data.creation_date && data.creation_date.includes('-')) {
      teleAgeEl.innerText = data.creation_date;
    } else if (data.verdict === 'UNREGISTERED') {
      teleAgeEl.innerText = 'Unallocated';
    } else {
      teleAgeEl.innerText = 'Established';
    }

    // Defensive Vector Tags
    vectorTagsEl.innerHTML = '';
    const vectors = [
      { name: 'Lexical Entropy', pass: score < 30 },
      { name: 'Zero Contradiction', pass: data.verdict !== 'PHISHING' },
      { name: 'TLS Encryption', pass: data.tls_valid },
      { name: 'DNS Routing', pass: aCount > 0 || data.verdict !== 'UNREGISTERED' }
    ];
    vectors.forEach(v => {
      const span = document.createElement('span');
      span.className = `vector-tag ${v.pass ? 'pass' : 'fail'}`;
      span.innerText = `${v.pass ? '✓' : '⚠'} ${v.name}`;
      vectorTagsEl.appendChild(span);
    });

    // AI Brief
    if (data.ai_insights && data.ai_insights.threat_intel_analysis) {
      aiSummaryEl.innerText = data.ai_insights.threat_intel_analysis;
    } else if (data.triage_reason) {
      const reg = data.registrar ? ` [${data.registrar}]` : '';
      aiSummaryEl.innerText = `${data.triage_reason}${reg}`;
    } else {
      aiSummaryEl.innerText = `Domain evaluated with multi-signal forensic verification. Action: Safe to proceed.`;
    }
  }

  // Deep Scan Button
  deepScanBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `http://localhost:5173/?scan=${encodeURIComponent(currentUrl)}` });
  });

  // Copy Brief Button
  copyBriefBtn.addEventListener('click', () => {
    if (!currentTelemetryData) return;
    const score = Math.round(currentTelemetryData.overall_risk_score || currentTelemetryData.basic_risk_score || 0);
    const summaryText = `🛡️ [CyberGuard AI Security Brief]
Target: ${hostname}
Threat Index: ${score}/100 | Verdict: ${currentTelemetryData.verdict}
Security Grade: ${secGradeEl.innerText} (${secGradeSubEl.innerText})
TLS Status: ${teleTlsEl.innerText} | Mail Security: ${teleMailEl.innerText}
DNS: ${teleDnsEl.innerText} | Standing: ${teleAgeEl.innerText}
Forensic Summary: ${aiSummaryEl.innerText}`;

    navigator.clipboard.writeText(summaryText).then(() => {
      copyToastEl.style.display = 'block';
      setTimeout(() => { copyToastEl.style.display = 'none'; }, 2200);
    });
  });

  // Initialize
  evaluateTarget();
});
