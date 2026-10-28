import pytest
from app.ml.intent_router import (
    classify_intent,
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
)
from app.ml.tool_registry import ToolRegistry, is_ssrf_safe_host
from app.ml.ai_explainer import ask_cyber_copilot

# -------------------------------------------------------------
# 1. Regression Tests for All 14 Intent Routing Categories
# -------------------------------------------------------------

def test_intent_general_security_question():
    queries = [
        "What is SQL injection?",
        "Explain XSS",
        "How does DNS spoofing work?",
        "What is zero trust?",
        "How can I secure my API?",
        "Difference between symmetric and asymmetric cryptography"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_GENERAL_SECURITY_QUESTION, f"Query '{q}' classified as {intent}"

def test_intent_code_explanation():
    queries = [
        "Explain this CSP header: default-src 'self'",
        "Explain this regex: ^[a-zA-Z0-9]+$",
        "What does this nginx rule do?"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_CODE_EXPLANATION, f"Query '{q}' classified as {intent}"

def test_intent_secure_code_generation():
    queries = [
        "Write secure FastAPI authentication middleware",
        "Generate a secure JWT validator in typescript",
        "Write secure code for SQL queries in python"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_SECURE_CODE_GENERATION, f"Query '{q}' classified as {intent}"

def test_intent_vulnerability_analysis():
    queries = [
        "Analyze this vulnerability: CVE-2021-44228",
        "Is this pattern susceptible to SSRF?",
        "Is it easily hackable?",
        "Review this code for vulnerabilities"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_VULNERABILITY_ANALYSIS, f"Query '{q}' classified as {intent}"

def test_intent_domain_audit():
    queries = [
        "Audit example.com",
        "Scan https://paypal-security-update.xyz",
        "Check domain security for foo.com",
        "Analyze website github.com"
    ]
    for q in queries:
        intent, entities = classify_intent(q)
        assert intent == INTENT_DOMAIN_AUDIT, f"Query '{q}' classified as {intent}"
        assert "target_domain" in entities

def test_intent_ip_reputation_lookup():
    queries = [
        "Lookup IP 8.8.8.8",
        "Check reputation of IP 1.2.3.4",
        "Investigate IP 185.220.101.5"
    ]
    for q in queries:
        intent, entities = classify_intent(q)
        assert intent == INTENT_IP_REPUTATION_LOOKUP, f"Query '{q}' classified as {intent}"
        assert "target_ip" in entities

def test_intent_email_phishing_analysis():
    queries = [
        "Analyze this phishing email: Dear customer, your account is suspended. Verify immediately at http://fake.com",
        "Is this email a scam? Dear user, wire transfer required",
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_EMAIL_PHISHING_ANALYSIS, f"Query '{q}' classified as {intent}"

def test_intent_password_security_guidance():
    queries = [
        "How strong should my password be?",
        "Is password 'P@ssw0rd123!' breached?",
        "Check password strength for 'correct-horse-battery-staple'"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_PASSWORD_SECURITY_GUIDANCE, f"Query '{q}' classified as {intent}"

def test_intent_historical_scan_query():
    queries = [
        "Which domains have I scanned?",
        "Show my scan history",
        "What domains did I scan till now?",
        "Show the previous scan of example.com"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_HISTORICAL_SCAN_QUERY, f"Query '{q}' classified as {intent}"

def test_intent_remediation_request():
    queries = [
        "Fix these security headers",
        "Give me the Nginx configuration to fix CSP",
        "How to fix Security Grade C?",
        "Generate apache hardening config"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_REMEDIATION_REQUEST, f"Query '{q}' classified as {intent}"

def test_intent_sandbox_request():
    queries = [
        "Open the browser sandbox for this authorized test",
        "Launch sandbox for campuskart.shop",
        "Open sandbox"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_SANDBOX_REQUEST, f"Query '{q}' classified as {intent}"

def test_intent_threat_intelligence_query():
    queries = [
        "What are the latest phishing trends?",
        "Show threat stats",
        "Top impersonated brands"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_THREAT_INTELLIGENCE_QUERY, f"Query '{q}' classified as {intent}"

def test_intent_incident_response_guidance():
    queries = [
        "We are under ransomware attack, what do we do?",
        "Incident response plan for data breach",
        "How to contain compromised server"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_INCIDENT_RESPONSE_GUIDANCE, f"Query '{q}' classified as {intent}"

def test_intent_unsupported_or_ambiguous_request():
    queries = [
        "scan",
        "check",
        "What's the weather in New York?",
        "Bake a chocolate cake"
    ]
    for q in queries:
        intent, _ = classify_intent(q)
        assert intent == INTENT_UNSUPPORTED_OR_AMBIGUOUS_REQUEST, f"Query '{q}' classified as {intent}"


# -------------------------------------------------------------
# 2. Critical Boundary Conditions & False Trigger Protections
# -------------------------------------------------------------

def test_domain_in_general_question_does_not_trigger_audit():
    """A general question that merely mentions a domain must NOT trigger a domain audit."""
    general_queries_with_domain = [
        "Why does google.com use HSTS?",
        "How does attack.example.com spoofing work?",
        "What is the difference between example.com and example.org?"
    ]
    for q in general_queries_with_domain:
        intent, _ = classify_intent(q)
        assert intent != INTENT_DOMAIN_AUDIT, f"Query '{q}' wrongly triggered domain audit!"

def test_sandbox_question_does_not_trigger_sandbox_open():
    """Asking what a sandbox is must NOT trigger sandbox viewport opening."""
    sandbox_questions = [
        "What is a browser sandbox?",
        "How do malware analysis sandboxes work?",
        "Explain sandbox evasion techniques"
    ]
    for q in sandbox_questions:
        intent, _ = classify_intent(q)
        assert intent != INTENT_SANDBOX_REQUEST, f"Query '{q}' wrongly triggered sandbox request!"


# -------------------------------------------------------------
# 3. SSRF Protections
# -------------------------------------------------------------

def test_ssrf_protection_blocks_internal_targets():
    """Internal and cloud metadata endpoints must be blocked."""
    prohibited_hosts = [
        "127.0.0.1",
        "localhost",
        "169.254.169.254",
        "10.0.0.1",
        "192.168.1.1",
        "172.16.0.5"
    ]
    for host in prohibited_hosts:
        safe, reason = is_ssrf_safe_host(host)
        assert safe is False, f"Host {host} should be blocked by SSRF policy!"


# -------------------------------------------------------------
# 4. End-to-End ask_cyber_copilot Tests
# -------------------------------------------------------------

import asyncio

def test_ask_cyber_copilot_general_question():
    res = asyncio.run(ask_cyber_copilot("What is SQL injection?"))
    assert res["intent"] == INTENT_GENERAL_SECURITY_QUESTION
    assert res["status"] == "completed"
    assert "SQL" in res["reply"]
    # Ensure no tools were erroneously executed
    assert len(res["tool_calls"]) == 0

def test_ask_cyber_copilot_code_generation():
    res = asyncio.run(ask_cyber_copilot("Write secure FastAPI authentication middleware", mode="developer-assistant"))
    assert res["intent"] == INTENT_SECURE_CODE_GENERATION
    assert "FastAPI" in res["reply"]
    assert "```python" in res["reply"] or "def " in res["reply"]

def test_ask_cyber_copilot_ssrf_blocked():
    res = asyncio.run(ask_cyber_copilot("Audit 127.0.0.1"))
    assert res["intent"] == INTENT_DOMAIN_AUDIT
    assert any("SSRF" in str(tc) or tc.get("status") == "blocked" for tc in res["tool_calls"])
    assert "SSRF" in res["reply"] or "Blocked" in res["reply"] or "Boundary" in res["reply"]
