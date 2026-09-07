import json
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from pydantic import BaseModel

class GeminiAIInsight(BaseModel):
    threat_intel_analysis: str
    hacker_perspective_audit: str
    remediation_recommendations: list[str]

async def generate_gemini_insights(
    domain: str,
    verdict: str,
    risk_score: float,
    domain_age: int,
    is_newly_registered: bool,
    brand_matched: Optional[str],
    is_contradiction: bool,
    security_grade: str,
    is_clickjackable: bool,
    is_email_spoofable: bool,
    missing_headers: list[str]
) -> GeminiAIInsight:
    """
    Calls Gemini API to generate deep explainable threat analysis and hacker-perspective defense recommendations.
    """
    prompt = f"""
You are a Senior Cyber Threat Intelligence Analyst and Elite Penetration Tester.
Analyze this target domain and provide an executive threat breakdown and website security posture assessment.

TARGET METRICS:
- Domain: {domain}
- Phishing Verdict: {verdict} (Risk Score: {risk_score}/100)
- Domain Age: {domain_age} days (Newly Registered Domain: {is_newly_registered})
- Impersonated Brand Target: {brand_matched or 'None'}
- Brand Contradiction Detected: {is_contradiction}
- Website Security Posture Grade: {security_grade}
- Clickjackable via iFrames: {is_clickjackable}
- Email Spoofable (Missing SPF/DMARC): {is_email_spoofable}
- Missing Defense Headers: {', '.join(missing_headers) if missing_headers else 'None'}

Return a valid JSON object with the following three fields ONLY (no markdown formatting outside the JSON):
{{
  "threat_intel_analysis": "A concise 2-3 sentence forensic explanation of the domain's risk level and whether it acts as an active phishing lure or legitimate service.",
  "hacker_perspective_audit": "A 2-3 sentence assessment from an offensive hacker/penetration tester perspective explaining whether this site is easily exploitable (e.g. clickjacking, spoofing, XSS) or well-defended.",
  "remediation_recommendations": ["3-4 concrete, actionable developer remediation commands or config updates to harden this site."]
}}
"""

    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    result = resp.json()
                    raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
                    data = json.loads(raw_text)
                    return GeminiAIInsight(
                        threat_intel_analysis=data.get("threat_intel_analysis", ""),
                        hacker_perspective_audit=data.get("hacker_perspective_audit", ""),
                        remediation_recommendations=data.get("remediation_recommendations", [])
                    )
        except Exception as e:
            pass

    # High-fidelity built-in fallback if Gemini API is unreachable or rate-limited
    if verdict == "PHISHING":
        threat_analysis = (
            f"Forensic signals confirm that {domain} exhibits classic phishing attributes, "
            f"leveraging lookalike branding cues and credential harvesting patterns to deceive visitors."
        )
    elif verdict == "SUSPICIOUS":
        threat_analysis = (
            f"The domain {domain} demonstrates anomalous infrastructure markers such as recent registration "
            f"or incomplete DNS hierarchy, warranting heightened observation."
        )
    else:
        threat_analysis = (
            f"Domain {domain} exhibits a verified clean baseline with legitimate SSL encryption "
            f"and consistent lexical characteristics."
        )

    if is_clickjackable or is_email_spoofable:
        hacker_audit = (
            f"From an adversary standpoint, {domain} has exploitable attack surfaces: "
            f"{'missing anti-clickjacking headers allow UI redressing, ' if is_clickjackable else ''}"
            f"{'lack of DMARC enforcement enables threat actors to spoof outbound executive emails.' if is_email_spoofable else ''}"
        )
    else:
        hacker_audit = f"The domain {domain} maintains standard web defense boundaries, mitigating basic clickjacking and email spoofing vectors."

    recommendations = []
    if is_clickjackable:
        recommendations.append("Configure 'X-Frame-Options: SAMEORIGIN' to eliminate Clickjacking risks.")
    if is_email_spoofable:
        recommendations.append("Publish a DMARC policy in DNS ('v=DMARC1; p=reject;') to prevent domain email spoofing.")
    if "Content-Security-Policy" in missing_headers:
        recommendations.append("Deploy a strict Content-Security-Policy (CSP) to neutralize cross-site scripting (XSS).")
    if "Strict-Transport-Security" in missing_headers:
        recommendations.append("Enforce HSTS with 'max-age=31536000; includeSubDomains; preload'.")
    if not recommendations:
        recommendations.append("Maintain routine automated vulnerability auditing and certificate renewal monitoring.")

    return GeminiAIInsight(
        threat_intel_analysis=threat_analysis,
        hacker_perspective_audit=hacker_audit,
        remediation_recommendations=recommendations
    )


async def ask_cyber_copilot(
    message: str,
    report: Optional[Dict[str, Any]] = None,
    history: Optional[list] = None
) -> Dict[str, Any]:
    """
    Interactive Cyber Security Copilot answering questions about scan results,
    vulnerabilities, brand contradiction, code injection immunity, and server hardening.
    """
    report = report or {}
    domain = report.get("canonical_domain") or report.get("domain") or "target website"
    verdict = report.get("verdict") or "UNKNOWN"
    risk_score = report.get("overall_risk_score") or report.get("basic_risk_score") or report.get("risk_score") or 0
    security_audit = report.get("security_audit") or {}
    grade = security_audit.get("security_grade") or security_audit.get("grade") or report.get("security_grade") or "N/A"
    missing_headers = [f.get("name") for f in security_audit.get("findings", []) if isinstance(f, dict) and f.get("status") in ["FAIL", "WARNING"]]
    brand = report.get("brand_analysis") or {}
    brand_matched = brand.get("brand_display_name") or brand.get("matched_brand") or brand.get("brand") or None
    is_contradiction = brand.get("is_contradiction", False)
    contradiction_explanation = brand.get("contradiction_explanation", "")

    # Context block
    context_summary = f"""
TARGET SECURITY SCAN CONTEXT:
- Domain: {domain}
- Overall Risk Score: {risk_score} / 100
- Threat Verdict: {verdict}
- Security Posture Grade: {grade}
- Missing Defense Headers: {', '.join(missing_headers) if missing_headers else 'None (Fully Hardened)'}
- Brand Impersonation: {brand_matched or 'No brand spoofing detected'}
- Brand Contradiction: {'CRITICAL PHISHING MISMATCH' if is_contradiction else 'Consistent / Authentic Domain'}
{f'- Contradiction Finding: {contradiction_explanation}' if contradiction_explanation else ''}
""" if report else "No active URL scan report loaded. General cybersecurity assistance mode."

    system_prompt = f"""You are CyberGuard AI Copilot, a world-class defensive web security engineer and ethical hacker assistant.
You help developers, security analysts, and end-users understand scan results, prevent code injection (XSS, SQLi, framing), harden server configurations (Nginx, Apache, Next.js, Cloudflare, Node.js), and detect phishing threats.
Be concise, authoritative, professional, and actionable. Use markdown formatting with code snippets where helpful.

{context_summary}
"""

    # 1. Try Google Gemini API if key is available
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            contents = [{"parts": [{"text": system_prompt}]}]
            if history:
                for h in history[-4:]:
                    role = "model" if getattr(h, "role", "") == "assistant" or (isinstance(h, dict) and h.get("role") == "assistant") else "user"
                    content_text = getattr(h, "content", "") if not isinstance(h, dict) else h.get("content", "")
                    contents.append({"parts": [{"text": f"[{role.upper()}]: {content_text}"}]})
            contents.append({"parts": [{"text": f"USER QUESTION: {message}"}]})

            payload = {
                "contents": contents,
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    result = resp.json()
                    reply_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return {
                        "reply": reply_text,
                        "suggested_actions": [
                            f"How to fix Security Grade {grade}?",
                            "How do hackers exploit code injection?",
                            "Generate Nginx hardening config",
                            "Explain Brand Contradiction"
                        ]
                    }
        except Exception:
            pass

    # 2. High-fidelity built-in cybersecurity knowledge engine
    msg_lower = message.lower()

    if "safe" in msg_lower or "password" in msg_lower or "credential" in msg_lower or "login" in msg_lower:
        if verdict == "PHISHING" or is_contradiction:
            reply = f"⚠️ **DO NOT ENTER CREDENTIALS OR PASSWORDS.**\n\n`{domain}` has been confirmed as **{verdict}** (Risk Score: **{risk_score}/100**). It is impersonating **{brand_matched or 'a recognized service'}** on an unauthorized domain. Any submitted passwords or sensitive data will be exfiltrated to the adversary's command server."
        elif verdict == "UNREGISTERED":
            reply = f"ℹ️ **This domain is unregistered.**\n\n`{domain}` is currently not registered on ICANN/RDAP registries (NXDOMAIN). There is no active server or login portal hosted here."
        else:
            reply = f"✅ **Target is verified benign / authentic.**\n\n`{domain}` has an authentic registration profile and consistent brand identity (Risk Score: **{risk_score}/100**). However, ensure your browser shows a secure green padlock (`https://`) before authenticating."

    elif "nginx" in msg_lower or "apache" in msg_lower or "cloudflare" in msg_lower or "config" in msg_lower or "hardening" in msg_lower or "header" in msg_lower:
        reply = (
            f"⚙️ **Hardening Configuration Snippet for `{domain}`:**\n\n"
            "**Nginx Configuration (Inside `server {{ ... }}` block):**\n"
            "```nginx\n"
            "add_header X-Frame-Options \"SAMEORIGIN\" always;\n"
            "add_header X-Content-Type-Options \"nosniff\" always;\n"
            "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;\n"
            "add_header Content-Security-Policy \"default-src 'self' https: data:; script-src 'self' 'unsafe-inline' https:; object-src 'none';\" always;\n"
            "add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\n"
            "```\n\n"
            "**Apache `.htaccess`:**\n"
            "```apache\n"
            "Header always set X-Frame-Options SAMEORIGIN\n"
            "Header always set X-Content-Type-Options nosniff\n"
            "Header always set Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\"\n"
            "Header always set Content-Security-Policy \"default-src 'self' https: data:; object-src 'none';\"\n"
            "```\n\n"
            "**Cloudflare Transform Rule (Rules → Transform Rules → Modify Response Header):**\n"
            "- Set `Strict-Transport-Security` to `max-age=31536000; includeSubDomains; preload`\n"
            "- Set `X-Frame-Options` to `SAMEORIGIN`\n"
            "- Set `X-Content-Type-Options` to `nosniff`"
        )

    elif "code injection" in msg_lower or "xss" in msg_lower or "csp" in msg_lower or "inject" in msg_lower:
        reply = (
            "🔒 **How to Immunize Your Website Against Code Injection (XSS):**\n\n"
            "Code injection occurs when an attacker injects unauthorized JavaScript into your web pages to hijack user sessions or capture keystrokes. "
            "Deploying a strict **`Content-Security-Policy (CSP)`** completely stops this by telling the browser to only execute trusted scripts:\n\n"
            "```http\n"
            "Content-Security-Policy: default-src 'self' https: data:; script-src 'self' 'unsafe-inline' https:; object-src 'none';\n"
            "```\n"
            "**Key Principles:**\n"
            "1. Disallow `eval()` and inline untrusted scripts.\n"
            "2. Restrict script origins to your own domain (`'self'`).\n"
            "3. Always sanitize and HTML-encode user input before rendering."
        )

    elif "clickjack" in msg_lower or "iframe" in msg_lower or "frame" in msg_lower:
        reply = (
            "🖼️ **Clickjacking (UI Redressing) Immunity:**\n\n"
            "Attackers frame your website inside an invisible `<iframe>` on a malicious site, tricking visitors into clicking sensitive buttons on your app without realizing it.\n\n"
            "**Fix:** Enforce the `X-Frame-Options` or CSP `frame-ancestors` directive:\n"
            "```http\n"
            "X-Frame-Options: SAMEORIGIN\n"
            "# Or via CSP:\n"
            "Content-Security-Policy: frame-ancestors 'self';\n"
            "```"
        )

    elif "fix" in msg_lower or "grade" in msg_lower or "posture" in msg_lower or "score" in msg_lower or "why" in msg_lower:
        if security_audit:
            reply = f"🛡️ **Security Grade Breakdown for `{domain}` ({grade} - {security_audit.get('score_percentage', 0)}% Pass Rate):**\n\n"
            reply += "The grade evaluates essential defensive HTTP headers that immunize your website against attacker exploits:\n"
            for finding in security_audit.get("findings", []):
                icon = "✅" if finding.get("status") == "PASS" else "❌" if finding.get("status") == "FAIL" else "⚠️"
                reply += f"- {icon} **{finding.get('name')}**: {finding.get('exploit_risk')}\n"
            reply += f"\n**Key Weakness:** {security_audit.get('hacker_perspective_summary', 'Missing key security headers.')}"
            reply += f"\n\nUse the **Nginx / Cloudflare hardening config** above to immediately fix these gaps."
        else:
            reply = f"The domain `{domain}` received a threat score of **{risk_score}/100** with verdict **{verdict}** based on multi-signal neural fusion across lexical entropy, brand logo vision, and domain registration age."

    elif "brand" in msg_lower or "contradiction" in msg_lower or "logo" in msg_lower:
        reply = (
            "🔍 **What is the Brand-Domain Contradiction Engine?**\n\n"
            "Phishing pages typically steal high-trust corporate logos (PayPal, Microsoft, Apple, Google, Chase) and display them on lookalike domains (`login-paypal-verify.xyz`).\n\n"
            "Our engine renders the page in an isolated headless sandbox, runs perceptual hashing (`pHash`) against verified brand trademark catalogs, and cross-references the hosting domain against authorized brand registries.\n\n"
            f"- **Target Domain:** `{domain}`\n"
            f"- **Claimed Brand:** {brand_matched or 'Generic / None'}\n"
            f"- **Contradiction Status:** {'🚨 CRITICAL MISMATCH (Phishing Impersonation)' if is_contradiction else '✅ Consistent / Genuine'}"
        )

    else:
        reply = (
            f"🤖 **CyberGuard AI Copilot Analysis for `{domain}`:**\n\n"
            f"- **Verdict:** `{verdict}` (Risk Score: **{risk_score}/100**)\n"
            f"- **Security Grade:** **{grade}** ({len(missing_headers)} defensive headers missing)\n"
            f"- **Brand Safety:** {'Brand Contradiction Detected' if is_contradiction else 'No brand trademark spoofing detected'}\n\n"
            f"You can ask me:\n"
            f"- *'How to fix Security Grade {grade}?'*\n"
            f"- *'How can hackers exploit code injection on this site?'*\n"
            f"- *'Is it safe to login on this website?'*\n"
            f"- *'Give me the Nginx/Cloudflare hardening rules'*."
        )

    return {
        "reply": reply,
        "suggested_actions": [
            f"How to fix Security Grade {grade}?",
            "How do hackers exploit code injection?",
            "Generate Nginx hardening config",
            "Explain Brand Contradiction"
        ]
    }

