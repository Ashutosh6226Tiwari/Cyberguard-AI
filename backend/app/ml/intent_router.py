"""
CyberGuard AI - Copilot Intent Router
Classifies user requests into 14 distinct cybersecurity intent categories and extracts
structured parameters for validated server-side tool routing.
"""

import re
import ipaddress
from typing import Tuple, Dict, Any, Optional, List

# Official 14 Intent Categories
INTENT_GENERAL_SECURITY_QUESTION = "general_security_question"
INTENT_CODE_EXPLANATION = "code_explanation"
INTENT_SECURE_CODE_GENERATION = "secure_code_generation"
INTENT_VULNERABILITY_ANALYSIS = "vulnerability_analysis"
INTENT_DOMAIN_AUDIT = "domain_audit"
INTENT_IP_REPUTATION_LOOKUP = "ip_reputation_lookup"
INTENT_EMAIL_PHISHING_ANALYSIS = "email_phishing_analysis"
INTENT_PASSWORD_SECURITY_GUIDANCE = "password_security_guidance"
INTENT_HISTORICAL_SCAN_QUERY = "historical_scan_query"
INTENT_REMEDIATION_REQUEST = "remediation_request"
INTENT_SANDBOX_REQUEST = "sandbox_request"
INTENT_THREAT_INTELLIGENCE_QUERY = "threat_intelligence_query"
INTENT_INCIDENT_RESPONSE_GUIDANCE = "incident_response_guidance"
INTENT_UNSUPPORTED_OR_AMBIGUOUS_REQUEST = "unsupported_or_ambiguous_request"

ALL_INTENTS = [
    INTENT_GENERAL_SECURITY_QUESTION,
    INTENT_CODE_EXPLANATION,
    INTENT_SECURE_CODE_GENERATION,
    INTENT_VULNERABILITY_ANALYSIS,
    INTENT_DOMAIN_AUDIT,
    INTENT_IP_REPUTATION_LOOKUP,
    INTENT_EMAIL_PHISHING_ANALYSIS,
    INTENT_PASSWORD_SECURITY_GUIDANCE,
    INTENT_HISTORICAL_SCAN_QUERY,
    INTENT_REMEDIATION_REQUEST,
    INTENT_SANDBOX_REQUEST,
    INTENT_THREAT_INTELLIGENCE_QUERY,
    INTENT_INCIDENT_RESPONSE_GUIDANCE,
    INTENT_UNSUPPORTED_OR_AMBIGUOUS_REQUEST,
]

# Regex helpers
DOMAIN_REGEX = re.compile(
    r'(?:https?://)?(?:www\.)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:[a-zA-Z]{2,}|in|co|org|net|com|gov|edu|io|ai|xyz|top|shop|dev|app|cloud|site|tech|online|store|live)(?:\.[a-zA-Z]{2,})?)',
    re.IGNORECASE
)

IPV4_REGEX = re.compile(
    r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b'
)

# Explicit command prefixes for domain audits
AUDIT_COMMAND_PATTERNS = [
    r'^(?:audit|scan|check|inspect|analyze|test|examine|probe|evaluate)(?:\s+(?:website|domain|url|target|host))?[:\s]+([^\s]+)',
    r'(?:run\s+(?:a\s+)?(?:scan|audit|analysis)\s+(?:on|for))\s+([^\s]+)',
    r'(?:check\s+(?:the\s+)?(?:security|posture|risk|domain)\s+(?:of|for))\s+([^\s]+)',
    r'(?:analyze\s+(?:domain|website|target|url))\s+([^\s]+)',
    r'(?:is\s+([^\s]+)\s+(?:safe|malicious|phishing|legit|legitimate|clean|suspicious|dangerous)\??)',
    r'^(?:https?://[^\s]+)$',  # Plain URL pasted by itself
]

def extract_ip(text: str) -> Optional[str]:
    """Finds first valid IPv4 address in text."""
    matches = IPV4_REGEX.findall(text)
    for m in matches:
        try:
            ipaddress.ip_address(m)
            return m
        except ValueError:
            continue
    return None

def extract_domain(text: str) -> Optional[str]:
    """Extracts first valid candidate domain, filtering out common file extensions and tech terms."""
    ignored_endings = ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.js', '.css', '.html', '.ts', '.py', '.json', '.md', '.tar', '.gz', '.zip')
    match = DOMAIN_REGEX.search(text)
    if match:
        cand = match.group(1).lower().strip('.')
        if not cand.endswith(ignored_endings) and '.' in cand:
            return cand
    return None

def classify_intent(
    message: str,
    history: Optional[List[Dict[str, Any]]] = None,
    active_domain: Optional[str] = None
) -> Tuple[str, Dict[str, Any]]:
    """
    Classifies a user query into one of 14 intent categories.
    Returns (intent_name, extracted_entities).
    """
    clean_msg = message.strip()
    msg_lower = clean_msg.lower()
    entities: Dict[str, Any] = {}

    # Conversational greetings & pleasantries (hi, hello, hey, how are you, who are you, etc.)
    greeting_words = {"hi", "hello", "hey", "hola", "sup", "yo", "namaste", "greetings", "howdy"}
    pleasantry_phrases = [
        "how are you", "how r u", "how is it going", "hows it going", "how are you doing",
        "what's up", "whats up", "wassup", "who are you", "what can you do", "help me",
        "thank you", "thanks", "thx", "good morning", "good evening", "good afternoon"
    ]
    clean_greeting = clean_msg.lower().rstrip("!.,? ")
    if (
        clean_greeting in greeting_words
        or any(clean_greeting == p for p in pleasantry_phrases)
        or any(clean_greeting.startswith(p + " ") for p in pleasantry_phrases)
        or any(clean_greeting.startswith(w + " ") for w in greeting_words)
    ):
        return INTENT_GENERAL_SECURITY_QUESTION, {"is_greeting": True}

    # Handle short ambiguous queries first
    tokens = [t for t in re.split(r'\s+', clean_msg) if t]
    if len(tokens) == 1:
        single = tokens[0].lower().rstrip('?!.')
        if single in ["scan", "audit", "check", "inspect", "analyze", "test", "fix", "help"]:
            return INTENT_UNSUPPORTED_OR_AMBIGUOUS_REQUEST, {
                "ambiguity_type": "missing_target",
                "clarification": "Please specify a domain, URL, IP address, or security topic (e.g., 'Audit example.com' or 'Explain SQL injection')."
            }
        # If single token is a URL or domain, treat as explicit domain audit
        cand_domain = extract_domain(clean_msg)
        if cand_domain and cand_domain in clean_msg.lower():
            entities["target_domain"] = cand_domain
            return INTENT_DOMAIN_AUDIT, entities
        # If single token is an IP, treat as IP lookup
        cand_ip = extract_ip(clean_msg)
        if cand_ip:
            entities["target_ip"] = cand_ip
            return INTENT_IP_REPUTATION_LOOKUP, entities

    # Non-security / off-topic queries
    off_topic_patterns = [
        r'\b(?:what(?:\'s| is) the weather|weather in|forecast|bake|recipe|cook|baking|joke|tell me a joke|write a poem|who won the match|sports score|stock price)\b',
    ]
    for otp in off_topic_patterns:
        if re.search(otp, msg_lower):
            return INTENT_UNSUPPORTED_OR_AMBIGUOUS_REQUEST, {
                "ambiguity_type": "out_of_scope",
                "clarification": "I am CyberGuard AI Copilot, specialized in defensive cybersecurity, vulnerability analysis, and security engineering. How can I assist with your application or network security?"
            }

    # 1. Sandbox Request (MUST require explicit intent to open/launch sandbox, NOT just asking about sandboxing)
    explicit_sandbox_patterns = [
        r'\b(?:open|launch|show|view|start|run)\s+(?:the\s+)?(?:browser\s+|chromium\s+|live\s+)?sandbox\b',
        r'\b(?:open|launch)\s+(?:a\s+)?(?:sandbox\s+viewport|interactive\s+sandbox)\b',
        r'\bopen\s+sandbox\b',
        r'\blaunch\s+sandbox\b'
    ]
    if any(re.search(p, msg_lower) for p in explicit_sandbox_patterns):
        # Extract target domain or URL if provided, else use active_domain
        cand_domain = extract_domain(clean_msg)
        target = cand_domain or active_domain or "campuskart.shop"
        entities["target_host"] = target
        entities["target_url"] = f"https://{target}"
        return INTENT_SANDBOX_REQUEST, entities

    # 2. Historical Scan Query
    history_patterns = [
        r'\b(?:which|what)\s+(?:domains?|websites?|sites?|urls?)\s+(?:(?:i\s+have|have\s+i|i\s+did|did\s+i|i)?\s*(?:scanned|scan|scans))\b',
        r'\b(?:my\s+)?scan\s+history\b',
        r'\b(?:past|previous|prior)\s+scans?\b',
        r'\b(?:scanned\s+(?:till|until)\s+now|scanned\s+so\s+far|all\s+my\s+scans)\b',
        r'\bshow\s+(?:the\s+)?previous\s+scan\s+of\b',
        r'\bshow\s+(?:my\s+)?(?:scan\s+)?history\b',
        r'\bcompare\s+(?:it\s+)?with\s+(?:my\s+)?previous\s+scan\b',
        r'\blist\s+(?:all\s+)?(?:scanned\s+)?(?:domains?|websites?)\b'
    ]
    if any(re.search(p, msg_lower) for p in history_patterns):
        cand_domain = extract_domain(clean_msg)
        if cand_domain:
            entities["target_domain"] = cand_domain
        return INTENT_HISTORICAL_SCAN_QUERY, entities

    # 3. IP Reputation Lookup (Only if not explicitly asking to audit/scan the host)
    is_audit_prefix = any(re.search(p, msg_lower) for p in AUDIT_COMMAND_PATTERNS)
    ip_lookup_patterns = [
        r'\b(?:check|lookup|investigate|audit|scan|reputation\s+of|ip\s+reputation)\s+(?:the\s+)?(?:ip|address)\b',
        r'\b(?:is\s+ip\s+|reputation\s+of\s+ip)\b',
        r'\bwhois\s+ip\b',
        r'\blookup\s+ip\b'
    ]
    cand_ip = extract_ip(clean_msg)
    if cand_ip and not (is_audit_prefix and not any(re.search(p, msg_lower) for p in ip_lookup_patterns)):
        if any(re.search(p, msg_lower) for p in ip_lookup_patterns) or len(tokens) <= 3:
            entities["target_ip"] = cand_ip
            return INTENT_IP_REPUTATION_LOOKUP, entities

    # 4. Email Phishing Analysis
    email_phishing_patterns = [
        r'\b(?:analyze|check|scan|is\s+this)\s+(?:this\s+)?(?:suspicious\s+|phishing\s+|scam\s+)?(?:email|mail|message)\b',
        r'\b(?:phishing\s+email|email\s+scam|fake\s+email|scam\s+email)\b',
        r'\b(?:dear\s+customer|dear\s+user|dear\s+account\s+holder|account\s+suspended|verify\s+your\s+bank|urgent\s+action\s+required)\b'
    ]
    if any(re.search(p, msg_lower) for p in email_phishing_patterns) and ("email" in msg_lower or "subject:" in msg_lower or "from:" in msg_lower or "dear " in msg_lower):
        entities["email_text"] = clean_msg
        return INTENT_EMAIL_PHISHING_ANALYSIS, entities

    # 5. Password Security Guidance & Breach Check
    password_patterns = [
        r'\b(?:is\s+my\s+password|is\s+password|check\s+(?:if\s+)?password|password\s+breach|password\s+strength|password\s+entropy|pwned\s+password|breached\s+password)\b',
        r'\b(?:how\s+strong\s+should\s+my\s+password\s+be|best\s+practices?\s+for\s+passwords?|password\s+security\s+guidance)\b'
    ]
    if any(re.search(p, msg_lower) for p in password_patterns):
        # Extract potential password if quoted or clearly identified
        pwd_match = re.search(r'["\']([^"\']{4,64})["\']', clean_msg)
        if pwd_match:
            entities["password_candidate"] = pwd_match.group(1)
        elif "password" in msg_lower:
            parts = re.split(r'\bpassword\s*[:=\s]+', clean_msg, flags=re.IGNORECASE)
            if len(parts) > 1 and parts[1].strip():
                first_tok = parts[1].strip().split()[0].strip('"\';,.')
                if 4 <= len(first_tok) <= 64:
                    entities["password_candidate"] = first_tok
        return INTENT_PASSWORD_SECURITY_GUIDANCE, entities

    # 6. Incident Response Guidance
    incident_patterns = [
        r'\b(?:we\s+are\s+under\s+(?:attack|ransomware|ddos|breach)|compromised\s+server|incident\s+response|data\s+breach\s+response|ransomware\s+containment|contain\s+(?:the\s+)?breach|compromised\s+(?:aws|azure|gcp|credentials|keys?))\b',
        r'\b(?:how\s+to\s+handle\s+(?:a\s+)?(?:breach|security\s+incident|ransomware)|post-incident|incident\s+checklist)\b'
    ]
    if any(re.search(p, msg_lower) for p in incident_patterns):
        return INTENT_INCIDENT_RESPONSE_GUIDANCE, entities

    # 7. Threat Intelligence Query
    threat_intel_patterns = [
        r'\b(?:latest|recent|current)\s+(?:phishing\s+trends|threat\s+intelligence|cyber\s+threats|top\s+phishing)\b',
        r'\b(?:top\s+(?:impersonated\s+)?brands|risky\s+tlds|threat\s+stats|threat\s+dashboard|live\s+threats)\b',
        r'\bshow\s+(?:the\s+)?threat\s+stats\b'
    ]
    if any(re.search(p, msg_lower) for p in threat_intel_patterns):
        return INTENT_THREAT_INTELLIGENCE_QUERY, entities

    # 8. Explicit Domain Audit (Must be an explicit command or audit intent, NOT a general question that mentions a domain)
    # Check if this is a general question containing a domain (e.g. "Why does google.com use HSTS?" or "How does attack.com spoofing work?")
    is_conceptual_question_with_domain = bool(re.search(
        r'\b(?:why\s+does|how\s+does|what\s+is\s+the\s+difference\s+between|can\s+you\s+explain\s+how|explain\s+how|tell\s+me\s+about\s+how)\b',
        msg_lower
    ))

    cand_domain = extract_domain(clean_msg)
    cand_ip = extract_ip(clean_msg)
    target_candidate = cand_domain or (cand_ip if any(re.search(p, msg_lower) for p in AUDIT_COMMAND_PATTERNS) else None)
    if not target_candidate and "localhost" in msg_lower and any(re.search(p, msg_lower) for p in AUDIT_COMMAND_PATTERNS):
        target_candidate = "localhost"

    if target_candidate and not is_conceptual_question_with_domain:
        is_explicit_audit = False
        for p in AUDIT_COMMAND_PATTERNS:
            if re.search(p, msg_lower):
                is_explicit_audit = True
                break
        
        # Also treat very short messages containing a domain as an audit: e.g. "audit example.com", "example.com"
        if len(tokens) <= 3 and target_candidate in msg_lower:
            is_explicit_audit = True

        if is_explicit_audit:
            entities["target_domain"] = target_candidate
            return INTENT_DOMAIN_AUDIT, entities
            return INTENT_DOMAIN_AUDIT, entities

    # 9. Remediation Request (Server configs, fixing headers, patches)
    remediation_patterns = [
        r'\b(?:fix|harden|remediate|patch|repair)\s+(?:these\s+)?(?:security\s+)?(?:headers?|issues?|vulnerabilities|findings?|flaws?|grade)\b',
        r'\b(?:give|show|generate|provide|create)\s+(?:me\s+)?(?:the\s+)?(?:nginx|apache|caddy|cloudflare|iis|traefik)\s+(?:config|configuration|hardening|rules?)\b',
        r'\b(?:how\s+(?:can|do)\s+i\s+fix|how\s+to\s+fix|steps\s+to\s+fix|steps\s+to\s+harden|remediation\s+steps)\b',
        r'\b(?:hardening\s+headers\s+for|server\s+hardening)\b',
        r'\b(?:fix\s+security\s+headers|add\s+hsts|enable\s+csp|set\s+x-frame-options)\b'
    ]
    if any(re.search(p, msg_lower) for p in remediation_patterns):
        # Extract server type if mentioned
        for srv in ["nginx", "apache", "caddy", "cloudflare", "iis", "traefik", "express"]:
            if srv in msg_lower:
                entities["server_type"] = srv
                break
        if cand_domain:
            entities["target_domain"] = cand_domain
        elif active_domain:
            entities["target_domain"] = active_domain
        return INTENT_REMEDIATION_REQUEST, entities

    # 10. Secure Code Generation
    code_generation_patterns = [
        r'\b(?:write|generate|create|build|implement|code)\s+(?:a\s+)?(?:secure|safe|hardened)?\s*(?:fastapi|express|flask|django|jwt|auth|authentication|middleware|rate\s*limit|query|validator|hasher|file\s+upload|csrf|cors)\b',
        r'\b(?:write|generate|implement)\s+(?:secure\s+)?(?:code|middleware|function|class|decorator|snippet)\b',
        r'\b(?:write|create)\s+(?:secure\s+)?fastapi\s+auth\b'
    ]
    if any(re.search(p, msg_lower) for p in code_generation_patterns):
        return INTENT_SECURE_CODE_GENERATION, entities

    # 11. Code Explanation
    code_explanation_patterns = [
        r'\b(?:explain|what\s+does|walk\s+me\s+through|break\s+down)\s+(?:this\s+)?(?:[a-zA-Z0-9_-]+\s+)*(?:code|snippet|function|regex|regular\s+expression|csp\s+header|header|script|payload|rule|directive|config)\b',
        r'\b(?:explain\s+this\s+csp\s+header|explain\s+csp\s+policy)\b',
        r'```[a-zA-Z]*\n[\s\S]+?\n```',  # Message contains code block with ask to explain
    ]
    if any(re.search(p, msg_lower) for p in code_explanation_patterns) and not bool(re.search(r'\bvulnerable|flaw|exploit\b', msg_lower)):
        return INTENT_CODE_EXPLANATION, entities

    # 12. Vulnerability Analysis
    vuln_analysis_patterns = [
        r'\b(?:analyze|is\s+this\s+vulnerable|check\s+for\s+vulnerabilities|vulnerability\s+analysis|evaluate\s+this\s+cve|review\s+this\s+code\s+for\s+(?:vulnerabilities|bugs|flaws)|security\s+review\s+of\s+this\s+code)\b',
        r'\bcve-\d{4}-\d{4,7}\b',
        r'\b(?:is\s+it\s+easily\s+hackable|what\s+vulnerabilities\s+does\s+it\s+expose|explain\s+(?:the\s+)?risk\s+score|explain\s+(?:that\s+|this\s+)?finding)\b',
        r'\b(?:is\s+this\s+pattern\s+susceptible\s+to|vulnerability\s+prioritization)\b'
    ]
    if any(re.search(p, msg_lower) for p in vuln_analysis_patterns):
        cve_match = re.search(r'\b(cve-\d{4}-\d{4,7})\b', clean_msg, re.IGNORECASE)
        if cve_match:
            entities["cve_id"] = cve_match.group(1).upper()
        if cand_domain:
            entities["target_domain"] = cand_domain
        elif active_domain:
            entities["target_domain"] = active_domain
        return INTENT_VULNERABILITY_ANALYSIS, entities

    # 13. General Security Question (The default conversational category for concepts)
    general_security_keywords = [
        "what is", "how does", "how do", "explain", "why is", "why does", "difference between",
        "sql injection", "sqli", "xss", "cross-site scripting", "csrf", "ssrf", "dns rebinding",
        "dns spoofing", "zero trust", "jwt", "oauth", "rate limit", "tls", "hsts", "csp",
        "cors", "mitre", "owasp", "buffer overflow", "rop chain", "kerberoasting", "active directory",
        "firewall", "ids", "ips", "siem", "yara", "sandbox", "malware", "ransomware", "cryptography",
        "aes", "rsa", "ecc", "sha", "argon2", "bcrypt", "phishing", "homoglyph", "rdap", "whois",
        "penetration testing", "ethical hacking", "red team", "blue team", "api security"
    ]
    if any(k in msg_lower for k in general_security_keywords):
        return INTENT_GENERAL_SECURITY_QUESTION, entities

    # If it's a question (ends with '?' or starts with question word) and not matched yet:
    question_starters = ("what", "how", "why", "when", "where", "can", "could", "should", "is", "are", "do", "does", "will")
    if clean_msg.endswith('?') or any(msg_lower.startswith(w + " ") for w in question_starters):
        return INTENT_GENERAL_SECURITY_QUESTION, entities

    # 14. Fallback / Ambiguous
    if len(clean_msg) < 8 or not any(c.isalnum() for c in clean_msg):
        return INTENT_UNSUPPORTED_OR_AMBIGUOUS_REQUEST, {
            "ambiguity_type": "too_short",
            "clarification": "Could you provide more context or specify a cybersecurity question or target to inspect?"
        }

    # Default to general_security_question so user gets a helpful conversational answer rather than a block
    return INTENT_GENERAL_SECURITY_QUESTION, entities
