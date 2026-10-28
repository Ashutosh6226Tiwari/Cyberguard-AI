from typing import List, Optional, Dict, Any
from app.schemas.analysis import (
    AttackChainNode,
    DomainIntel,
    CrawlArtifacts,
    BrandMatch,
    TriageScore
)

def reconstruct_attack_chain(
    target_url: str,
    triage: TriageScore,
    domain_intel: DomainIntel,
    crawl: Optional[CrawlArtifacts],
    brand: BrandMatch,
    overall_risk: float
) -> List[AttackChainNode]:
    nodes: List[AttackChainNode] = []
    step = 1

    # Node 1: Ingress / Candidate Domain
    ingress_sev = "danger" if triage.is_suspicious else ("warning" if triage.lexical_score > 0.3 else "info")
    nodes.append(AttackChainNode(
        id=f"node-{step}",
        step_number=step,
        category="ingress",
        title="Candidate Ingress & Lexical Triage",
        description=f"Received candidate target URL. Lexical triage score: {triage.lexical_score:.2f}. {triage.triage_reason}",
        severity=ingress_sev,
        metadata={
            "url": target_url,
            "lexical_score": triage.lexical_score,
            "attributions": triage.feature_attributions
        }
    ))
    step += 1

    # Node 2: Infrastructure Resolution & DNS/TLS
    if not domain_intel.is_registered:
        infra_sev = "info"
        infra_title = "Domain Not Registered (NXDOMAIN)"
        infra_desc = f"Target domain '{domain_intel.registrable_domain}' is not registered in IANA/ICANN RDAP registries. DNS query returned NXDOMAIN."
    elif domain_intel.is_newly_registered:
        infra_sev = "danger"
        infra_title = "Suspicious Early-Warning Infrastructure"
        tls_desc = f"TLS Issuer: {domain_intel.tls_issuer or 'None'} (Valid: {domain_intel.tls_valid})"
        infra_desc = f"Newly registered domain ({domain_intel.domain_age_days}d old) resolved to {len(domain_intel.dns.a_records)} IP(s). {tls_desc}."
    else:
        infra_sev = "safe"
        infra_title = "DNS & Infrastructure Resolution"
        tls_desc = f"TLS Issuer: {domain_intel.tls_issuer or 'None'} (Valid: {domain_intel.tls_valid})"
        infra_desc = f"Established domain ({domain_intel.domain_age_days or 'Verified'}d) resolved across {len(domain_intel.dns.a_records)} A records, {len(domain_intel.dns.ns_records)} NS records. {tls_desc}."

    nodes.append(AttackChainNode(
        id=f"node-{step}",
        step_number=step,
        category="resolution",
        title=infra_title,
        description=infra_desc,
        severity=infra_sev,
        metadata={
            "is_registered": domain_intel.is_registered,
            "registration_status": domain_intel.registration_status,
            "a_records": domain_intel.dns.a_records,
            "ns_records": domain_intel.dns.ns_records,
            "domain_age_days": domain_intel.domain_age_days,
            "is_newly_registered": domain_intel.is_newly_registered,
            "tls_issuer": domain_intel.tls_issuer
        }
    ))
    step += 1

    # Node 3: Navigation & Observed Redirects
    if crawl and len(crawl.redirect_chain) > 1:
        redirect_count = len(crawl.redirect_chain) - 1
        nodes.append(AttackChainNode(
            id=f"node-{step}",
            step_number=step,
            category="redirect",
            title=f"Multi-Hop Redirect Sequence ({redirect_count} hops)",
            description=f"Observed {redirect_count} redirection hop(s) steering traffic to: {crawl.final_url}",
            severity="warning" if redirect_count > 1 else "info",
            metadata={"redirect_chain": crawl.redirect_chain}
        ))
        step += 1

    # Node 4: Landing Page & Brand Simulation
    if not domain_intel.is_registered:
        landing_sev = "safe"
        landing_title = "Host Inactive (No Landing Server)"
        landing_desc = "Domain is not active on any web server. Browser crawl was skipped safely."
    elif brand.matched_brand:
        if brand.is_contradiction:
            landing_sev = "danger"
            landing_title = f"Lookalike Visual Spoofing ({brand.brand_display_name})"
            landing_desc = (
                f"Page DOM and visuals imitate {brand.brand_display_name} (Confidence: {brand.combined_brand_confidence:.0%}) "
                f"while hosted on unauthorized domain '{domain_intel.registrable_domain}'."
            )
        else:
            landing_sev = "safe"
            landing_title = f"Authentic Brand Landing ({brand.brand_display_name})"
            landing_desc = f"Verified authentic {brand.brand_display_name} landing on authorized domain {brand.brand_official_domain}."
    else:
        landing_sev = "info"
        landing_title = "Generic Landing Page Loaded"
        landing_desc = f"Page loaded with title: '{crawl.title if crawl else 'N/A'}'. No prominent high-value brand spoofing matched."

    nodes.append(AttackChainNode(
        id=f"node-{step}",
        step_number=step,
        category="landing",
        title=landing_title,
        description=landing_desc,
        severity=landing_sev,
        metadata={
            "matched_brand": brand.matched_brand,
            "is_contradiction": brand.is_contradiction,
            "brand_confidence": brand.combined_brand_confidence
        }
    ))
    step += 1

    # Node 5: Credential Forms & Exfiltration Hooks (Only if crawl ran)
    if crawl and crawl.has_password_field:
        cross_origin_forms = [f for f in crawl.forms if f.is_cross_origin]
        if cross_origin_forms:
            form_desc = f"Detected password entry form posting credentials to external third-party endpoint: {cross_origin_forms[0].action}"
        else:
            form_desc = "Detected interactive password login form on page."
            
        nodes.append(AttackChainNode(
            id=f"node-{step}",
            step_number=step,
            category="form_hook",
            title="Credential Harvesting Hook Active",
            description=form_desc,
            severity="danger",
            metadata={"forms_count": len(crawl.forms)}
        ))
        step += 1

    # Node Final: Calibrated Verdict & Action
    if not domain_intel.is_registered:
        verdict_sev = "safe"
        verdict_title = "Verdict: UNREGISTERED DOMAIN (INACTIVE)"
        verdict_desc = "Domain is not registered with any registrar. No active cyber threat or phishing server is present."
    elif overall_risk >= 70.0:
        verdict_sev = "danger"
        verdict_title = "Verdict: MALICIOUS PHISHING CAMPAIGN"
        verdict_desc = "High-confidence adversary operation detecting brand imitation, credential harvesting, or deceptive infrastructure."
    elif overall_risk >= 40.0:
        verdict_sev = "warning"
        verdict_title = "Verdict: SUSPICIOUS ACTIVITY UNDER REVIEW"
        verdict_desc = "Multi-signal heuristics identified anomalous attributes (NRD / unusual lexical entropy). Requires analyst triage."
    else:
        verdict_sev = "safe"
        verdict_title = "Verdict: VERIFIED BENIGN / CLEAN POSTURE"
        verdict_desc = "Infrastructure and content signatures match authentic operating baselines with no credential risks."

    nodes.append(AttackChainNode(
        id=f"node-{step}",
        step_number=step,
        category="verdict",
        title=verdict_title,
        description=verdict_desc,
        severity=verdict_sev,
        metadata={"overall_risk_score": overall_risk}
    ))

    return nodes
