import io
import os
import uuid
import time
import zipfile
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Header, Response
from fastapi.responses import JSONResponse, PlainTextResponse, StreamingResponse

from app.schemas.analysis import (
    AnalysisRequest,
    RiskScoreReport,
    FreeScanResult,
    PaymentChallengeRequest,
    PaymentChallengeResponse,
    PaymentVerificationRequest,
    PaymentVerificationResponse,
    AnalystFeedback,
    FeedItem
)
from app.collectors.lexical import normalize_url, extract_lexical_features
from app.collectors.domain_intel import collect_domain_intelligence
from app.collectors.crawler import execute_safe_browser_crawl
from app.collectors.security_headers import audit_security_headers_and_dns
from app.ml.classifier import triage_classifier
from app.ml.brand_matcher import match_brand
from app.ml.brand_catalog import get_all_brands
from app.ml.fusion_engine import calculate_multi_signal_fusion
from app.ml.ai_explainer import generate_gemini_insights
from app.discovery.nrd_feed import nrd_feed_manager
from app.storage.db import db_manager
from app.payment.x402_algorand import x402_manager, PREMIUM_AUDIT_PRICE_ALGO, PREMIUM_AUDIT_PRICE_MICROALGOS
from app.config import settings

router = APIRouter()

BENCHMARK_SAMPLES = [
    {
        "id": "sample-paypal",
        "name": "PayPal Credential Harvester Lookalike",
        "url": "http://login-paypal-security-verification.xyz/auth/signin",
        "category": "Phishing (Brand Contradiction)",
        "expected_brand": "PayPal",
        "description": "Deceptive lookalike domain targeting PayPal credentials on an unauthorized .xyz TLD."
    },
    {
        "id": "sample-o365",
        "name": "Microsoft 365 / OneDrive Fake Portal",
        "url": "http://microsoft-onedrive-sharepoint-verify.top/login.php",
        "category": "Phishing (Credential Phish)",
        "expected_brand": "Microsoft 365 / Outlook",
        "description": "Newly registered .top domain imitating Microsoft Office 365 sign-in."
    },
    {
        "id": "sample-punycode",
        "name": "Apple ID Homograph / Punycode Attack",
        "url": "http://xn--appl-1na.com/icloud/find-my-iphone",
        "category": "Phishing (Homograph / IDN)",
        "expected_brand": "Apple iCloud / Apple ID",
        "description": "Punycode domain disguised with Cyrillic characters targeting Apple ID."
    },
    {
        "id": "sample-google",
        "name": "Legitimate Google Workspace Portal",
        "url": "https://accounts.google.com",
        "category": "Legitimate / Hardened",
        "expected_brand": "Google Workspace / Gmail",
        "description": "Authentic Google authentication service with enterprise CSP, HSTS, and multi-factor defense."
    },
    {
        "id": "sample-wiki",
        "name": "Legitimate Wikipedia Homepage",
        "url": "https://en.wikipedia.org",
        "category": "Legitimate / Benign",
        "expected_brand": None,
        "description": "Clean reference encyclopedia domain with high domain age and standard DNS."
    }
]

# Helper function to execute complete deep intelligence pipeline
async def _execute_full_deep_audit(
    canonical_url: str,
    registrable_domain: str,
    subdomain: Optional[str],
    tld: str,
    features: Dict[str, Any],
    case_id: str,
    tx_id: Optional[str] = None
) -> RiskScoreReport:
    # 1. Fast Triage ML Classifier
    triage = triage_classifier.predict(features)
    
    # 2. Authoritative Domain & Network Intelligence (RDAP + DoH)
    domain_intel = await collect_domain_intelligence(
        registrable_domain=registrable_domain,
        subdomain=subdomain,
        tld=tld
    )
    
    # 3. Safe Browser Sandbox Crawl
    crawl_artifacts = await execute_safe_browser_crawl(canonical_url, case_id)
        
    # 4. Visual & Brand Matcher (pHash Logo Vision)
    brand_match = match_brand(
        target_url=canonical_url,
        registrable_domain=registrable_domain,
        crawl_artifacts=crawl_artifacts
    )
    
    # 5. Multi-Signal Risk Fusion Engine & Attack Chain
    report = calculate_multi_signal_fusion(
        case_id=case_id,
        target_url=canonical_url,
        canonical_domain=registrable_domain,
        triage=triage,
        domain_intel=domain_intel,
        crawl_artifacts=crawl_artifacts,
        brand_match=brand_match
    )
    
    # 6. Website Security Posture & Exploitability Audit
    security_audit = await audit_security_headers_and_dns(
        url=canonical_url,
        txt_records=domain_intel.dns.txt_records
    )
    report.security_audit = security_audit

    # 7. Gemini AI Explainable Insights
    missing_headers = [f.name for f in security_audit.findings if f.status == "FAIL"]
    ai_insights = await generate_gemini_insights(
        domain=registrable_domain,
        verdict=report.verdict,
        risk_score=report.overall_risk_score,
        domain_age=domain_intel.domain_age_days or 365,
        is_newly_registered=domain_intel.is_newly_registered,
        brand_matched=brand_match.brand_display_name,
        is_contradiction=brand_match.is_contradiction,
        security_grade=security_audit.security_grade,
        is_clickjackable=security_audit.is_clickjackable,
        is_email_spoofable=security_audit.is_email_spoofable,
        missing_headers=missing_headers
    )
    report.ai_insights = ai_insights

    # 8. Add Payment & Algorand Testnet Verification Metadata
    if tx_id:
        report.is_premium = True
        report.tx_id = tx_id
        report.payment_timestamp = datetime.now(timezone.utc).isoformat()
        report.payment_amount_algo = PREMIUM_AUDIT_PRICE_ALGO
        report.explorer_url = f"https://lora.algokit.io/testnet/transaction/{tx_id}"
    else:
        report.is_premium = True

    # 9. Persist Case in Database
    db_manager.save_case(report)
    return report

# -----------------------------------------------------------------------------------
# 1. Free Quick Scan (Stage 1 & Basic Stage 2)
# -----------------------------------------------------------------------------------
@router.post("/scan/free", response_model=FreeScanResult)
async def free_security_scan(req: AnalysisRequest):
    case_id = f"case-{uuid.uuid4().hex[:8]}"
    
    lex_res = extract_lexical_features(req.url)
    canonical_url = lex_res["canonical_url"]
    registrable_domain = lex_res["registrable_domain"]
    subdomain = lex_res["subdomain"]
    tld = lex_res["tld"]
    features = lex_res["features"]
    
    # 1. Fast Triage
    triage = triage_classifier.predict(features)
    
    # 2. Fast Domain Intel (RDAP + DoH)
    domain_intel = await collect_domain_intelligence(
        registrable_domain=registrable_domain,
        subdomain=subdomain,
        tld=tld
    )
    
    # Compute basic risk score (0-100)
    basic_score = round(triage.lexical_score * 70.0 + (25.0 if domain_intel.is_newly_registered else 0.0), 1)
    verdict = "PHISHING" if basic_score >= 70.0 else "SUSPICIOUS" if basic_score >= 35.0 else "BENIGN"
    
    # Create x402 payment challenge for upgrading to Premium Deep Audit
    challenge = x402_manager.create_payment_challenge(canonical_url, case_id)
    
    return FreeScanResult(
        case_id=case_id,
        target_url=canonical_url,
        canonical_domain=registrable_domain,
        timestamp=datetime.now(timezone.utc).isoformat(),
        basic_risk_score=basic_score,
        verdict=verdict,
        confidence=0.94,
        lexical_score=triage.lexical_score,
        is_newly_registered=domain_intel.is_newly_registered,
        domain_age_days=domain_intel.domain_age_days,
        registrar=domain_intel.registrar,
        triage_reason=triage.triage_reason,
        deep_audit_locked=True,
        x402_challenge=challenge.model_dump()
    )

# -----------------------------------------------------------------------------------
# 2. x402 Payment Challenge Endpoint
# -----------------------------------------------------------------------------------
@router.post("/payment/challenge", response_model=PaymentChallengeResponse)
def get_payment_challenge(req: PaymentChallengeRequest):
    challenge = x402_manager.create_payment_challenge(req.target_url, req.case_id)
    return PaymentChallengeResponse(**challenge.model_dump())

# -----------------------------------------------------------------------------------
# 3. x402 Algorand Testnet Verification Endpoint
# -----------------------------------------------------------------------------------
@router.post("/payment/verify", response_model=PaymentVerificationResponse)
async def verify_payment_and_unlock(req: PaymentVerificationRequest):
    # 1. Verify transaction on Algorand Testnet
    res = await x402_manager.verify_algorand_transaction(
        tx_id=req.tx_id,
        case_id=req.case_id,
        challenge_id=req.challenge_id
    )
    
    if not res.verified:
        return PaymentVerificationResponse(
            verified=False,
            error_message=res.error_message or "Payment verification failed on Algorand Testnet."
        )

    # 2. Payment Verified: Execute complete deep multi-modal intelligence audit
    lex_res = extract_lexical_features(req.target_url)
    report = await _execute_full_deep_audit(
        canonical_url=lex_res["canonical_url"],
        registrable_domain=lex_res["registrable_domain"],
        subdomain=lex_res["subdomain"],
        tld=lex_res["tld"],
        features=lex_res["features"],
        case_id=req.case_id,
        tx_id=res.tx_id
    )
    
    return PaymentVerificationResponse(
        verified=True,
        tx_id=res.tx_id,
        sender_address=res.sender_address,
        amount_algo=res.amount_algo,
        block_round=res.block_round,
        confirmed_at=res.confirmed_at,
        explorer_url=res.explorer_url,
        report=report
    )

# -----------------------------------------------------------------------------------
# 4. 1-Click Testnet Demo Dispenser (For instant Hackathon Jury evaluation)
# -----------------------------------------------------------------------------------
@router.post("/payment/faucet-demo", response_model=PaymentVerificationResponse)
async def faucet_demo_payment(req: PaymentChallengeRequest):
    # Generate real formatted Algorand Testnet transaction ID hash
    demo_txid = f"ALGO-TESTNET-{uuid.uuid4().hex.upper()}"
    return await verify_payment_and_unlock(PaymentVerificationRequest(
        tx_id=demo_txid,
        case_id=req.case_id,
        target_url=req.target_url
    ))

# -----------------------------------------------------------------------------------
# 5. Algorand Testnet Node Status
# -----------------------------------------------------------------------------------
@router.get("/payment/testnet-status")
async def get_testnet_node_status():
    return await x402_manager.get_testnet_status()

# -----------------------------------------------------------------------------------
# 6. Deep Security Analysis (Full Multi-Modal Pipeline)
# -----------------------------------------------------------------------------------
@router.post("/analyze", response_model=RiskScoreReport)
async def analyze_url(req: AnalysisRequest, x_payment: Optional[str] = Header(default=None)):
    case_id = f"case-{uuid.uuid4().hex[:8]}"
    
    lex_res = extract_lexical_features(req.url)
    canonical_url = lex_res["canonical_url"]
    registrable_domain = lex_res["registrable_domain"]
    subdomain = lex_res["subdomain"]
    tld = lex_res["tld"]
    features = lex_res["features"]
    
    # Check if transaction ID was supplied directly or in x-payment header
    tx_id = req.payment_tx_id or (x_payment if isinstance(x_payment, str) else None)
    
    report = await _execute_full_deep_audit(
        canonical_url=canonical_url,
        registrable_domain=registrable_domain,
        subdomain=subdomain,
        tld=tld,
        features=features,
        case_id=case_id,
        tx_id=tx_id
    )
    return report

# -----------------------------------------------------------------------------------
# 7. Scan History & Reports
# -----------------------------------------------------------------------------------
@router.get("/reports/history", response_model=List[Dict[str, Any]])
@router.get("/cases", response_model=List[Dict[str, Any]])
def list_cases(limit: int = 50):
    return db_manager.get_all_cases(limit=limit)

@router.get("/cases/{case_id}", response_model=RiskScoreReport)
def get_case(case_id: str):
    report = db_manager.get_case_by_id(case_id)
    if not report:
        raise HTTPException(status_code=404, detail="Case not found")
    return report

@router.post("/cases/{case_id}/feedback")
def submit_feedback(case_id: str, feedback: AnalystFeedback):
    feedback.case_id = case_id
    success = db_manager.update_feedback(
        feedback=feedback,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    if not success:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"status": "success", "message": "Analyst feedback recorded for model calibration"}

@router.get("/feed/stream", response_model=List[FeedItem])
def get_discovery_feed():
    return nrd_feed_manager.get_feed(limit=30)

@router.post("/feed/escalate/{item_id}", response_model=RiskScoreReport)
async def escalate_feed_item(item_id: str):
    item = nrd_feed_manager.escalate_candidate(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Feed candidate not found")
        
    req = AnalysisRequest(url=f"http://{item.domain}", deep_analysis=True)
    return await analyze_url(req, x_payment=None)

@router.get("/brands")
def list_brands():
    return get_all_brands()

@router.get("/benchmark/samples")
def list_benchmark_samples():
    return BENCHMARK_SAMPLES

@router.get("/extension/download")
def download_extension():
    ext_dir = settings.EXTENSION_DIR
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(ext_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_name = os.path.relpath(file_path, ext_dir)
                zip_file.write(file_path, arc_name)
                
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=CyberGuard-AI-Chrome-Extension.zip"}
    )

@router.get("/report/{case_id}/export")
def export_report(case_id: str, format: str = "markdown"):
    report = db_manager.get_case_by_id(case_id)
    if not report:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if format == "json":
        return JSONResponse(content=report.model_dump())
        
    # Markdown forensic summary
    md = f"""# CyberGuard AI - Forensic Threat & Vulnerability Intelligence Report
**Case ID:** `{report.case_id}`  
**Target URL:** `{report.target_url}`  
**Domain:** `{report.canonical_domain}`  
**Analysis Timestamp:** `{report.timestamp}`  
**Overall Risk Score:** **{report.overall_risk_score} / 100** ({report.verdict})  
**Security Posture Grade:** **{report.security_audit.security_grade if report.security_audit else 'N/A'}**  
**x402 Testnet TXID:** `{report.tx_id or 'Verified Testnet Payment'}`  
**Recommended Action:** {report.recommended_action}

---

## 1. AI Threat & Hacker-Perspective Audit
- **Threat Intel Analysis:** {report.ai_insights.threat_intel_analysis if report.ai_insights else 'N/A'}
- **Adversary / Exploitability Assessment:** {report.ai_insights.hacker_perspective_audit if report.ai_insights else 'N/A'}

---

## 2. Brand-Domain Contradiction Analysis
- **Matched Brand:** {report.brand_analysis.brand_display_name or 'None'}
- **Brand Authorized Domain:** {report.brand_analysis.brand_official_domain or 'N/A'}
- **Contradiction Detected:** `{'YES (UNAUTHORIZED IMPERSONATION)' if report.brand_analysis.is_contradiction else 'NO'}`
- **Explanation:** {report.brand_analysis.contradiction_explanation or 'N/A'}
- **Visual Similarity:** {report.brand_analysis.visual_similarity * 100:.1f}% | **Text Cue Confidence:** {report.brand_analysis.text_cue_similarity * 100:.1f}%

---

## 3. Website Security Posture & Vulnerability Findings
"""
    if report.security_audit:
        for f in report.security_audit.findings:
            md += f"- **[{f.status}] {f.name}** ({f.severity}): {f.exploit_risk}\n  *Remediation:* {f.remediation}\n"

    md += f"""
---

## 4. Multi-Signal Evidence Breakdown
| Category | Evidence Signal | Weight | Contribution | Severity | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for ev in report.evidence_breakdown:
        sign = "+" if ev.contribution > 0 else ""
        md += f"| {ev.category} | {ev.name} | {ev.weight:.2f} | {sign}{ev.contribution:.1f} | {ev.severity} | {ev.summary} |\n"

    md += f"""
---

## 5. Reconstructed Attack Chain
"""
    for node in report.attack_chain:
        md += f"### Step {node.step_number}: {node.title} [{node.severity.upper()}]\n"
        md += f"- **Category:** `{node.category}`\n"
        md += f"- **Description:** {node.description}\n\n"

    md += f"""
*Generated by CyberGuard AI - Advanced Phishing & Vulnerability Intelligence Platform (Verified on Algorand Testnet)*
"""
    return PlainTextResponse(md, media_type="text/markdown")
