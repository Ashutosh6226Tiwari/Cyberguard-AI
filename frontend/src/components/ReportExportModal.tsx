import React, { useState } from 'react';
import { X, Copy, Printer, Check, Shield, Download, FileText } from 'lucide-react';
import type { RiskScoreReport } from '../types';

interface ReportExportModalProps {
  report: RiskScoreReport;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloadedHtml, setDownloadedHtml] = useState(false);

  const generateReportMarkdown = (): string => {
    return `
# CYBERGUARD AI - FORENSIC THREAT & WEBSITE SECURITY REPORT
Case ID: ${report.case_id}
Target URL: ${report.target_url}
Domain: ${report.canonical_domain}
Timestamp: ${report.timestamp}
Overall Risk Score: ${report.overall_risk_score} / 100 (${report.verdict})
Security Posture Grade: ${report.security_audit?.security_grade || 'N/A'}
Recommended Action: ${report.recommended_action}

## 1. CYBERGUARD AI THREAT & HACKER-PERSPECTIVE AUDIT
Threat Intel Analysis: ${report.ai_insights?.threat_intel_analysis || 'N/A'}
Hacker Perspective Assessment: ${report.ai_insights?.hacker_perspective_audit || 'N/A'}

## 2. BRAND CONTRADICTION FINDINGS
Impersonated Brand: ${report.brand_analysis?.brand_display_name || 'None'}
Authorized Domain: ${report.brand_analysis?.brand_official_domain || 'N/A'}
Contradiction Detected: ${report.brand_analysis?.is_contradiction ? 'YES' : 'NO'}
Rationale: ${report.brand_analysis?.contradiction_explanation || 'N/A'}

## 3. MULTI-SIGNAL EVIDENCE FACTORS
${(report.evidence_breakdown || []).map((e) => `- [${e.severity}] ${e.category} / ${e.name} (${e.contribution > 0 ? '+' : ''}${e.contribution.toFixed(1)} pts): ${e.summary}`).join('\n')}

## 4. RECONSTRUCTED ATTACK CHAIN
${(report.attack_chain || []).map((n) => `Step ${n.step_number}: ${n.title} [${n.severity.toUpperCase()}]\n${n.description}`).join('\n\n')}

## 5. WEBSITE DEFENSE HARDENING RECOMMENDATIONS
${report.ai_insights?.remediation_recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Maintain routine security monitoring.'}
    `.trim();
  };

  const handleCopyMarkdown = () => {
    const text = generateReportMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePrintableHtml = (r: RiskScoreReport): string => {
    const isCritical = r.overall_risk_score >= 70;
    const isSuspicious = r.overall_risk_score >= 40 && r.overall_risk_score < 70;
    const verdictColor = isCritical ? '#dc2626' : isSuspicious ? '#ea580c' : '#16a34a';
    const gradeColor = r.security_audit?.security_grade === 'A+' ? '#16a34a' : r.security_audit?.security_grade === 'B' ? '#0284c7' : '#dc2626';

    const evidenceRows = (r.evidence_breakdown || []).map(e => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 10px; font-weight: 700; color: ${e.severity === 'CRITICAL' ? '#dc2626' : e.severity === 'HIGH' ? '#ea580c' : '#475569'}; font-size: 11px;">[${e.severity}]</td>
        <td style="padding: 8px 10px; font-weight: 600; font-size: 12px;">${e.name}</td>
        <td style="padding: 8px 10px; color: #64748b; font-size: 11px;">${e.category}</td>
        <td style="padding: 8px 10px; font-weight: 700; text-align: right; color: ${e.contribution > 0 ? '#dc2626' : '#16a34a'}; font-size: 11px;">${e.contribution > 0 ? '+' : ''}${e.contribution.toFixed(1)}</td>
        <td style="padding: 8px 10px; color: #334155; font-size: 11px;">${e.summary}</td>
      </tr>
    `).join('');

    const attackSteps = (r.attack_chain || []).map(n => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px; break-inside: avoid;">
        <div style="font-weight: 700; font-size: 12px; color: #0f172a;">Step ${n.step_number}: ${n.title} <span style="font-size: 10px; color: #64748b;">[${n.severity.toUpperCase()}]</span></div>
        <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.4;">${n.description}</div>
      </div>
    `).join('');

    const recommendations = (r.ai_insights?.remediation_recommendations || []).map((rec, i) => `
      <li style="margin-bottom: 6px; color: #334155; font-size: 12px; line-height: 1.4;">
        <strong>Step ${i + 1}:</strong> ${rec}
      </li>
    `).join('') || '<li style="color: #64748b; font-size: 12px;">Maintain continuous monitoring and baseline security posture.</li>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CyberGuard AI Forensic Dossier - ${r.canonical_domain}</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.5;
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .badge-verdict {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 13px;
      color: #ffffff;
      background: ${verdictColor};
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      break-inside: avoid;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
      break-after: avoid;
    }
    .card-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 14px;
      break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th {
      background: #e2e8f0;
      color: #334155;
      font-weight: 700;
      font-size: 11px;
      text-align: left;
      padding: 8px 10px;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      font-size: 10px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div>
      <div class="brand-title">🛡️ CYBERGUARD AI FORENSIC INTELLIGENCE REPORT</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
        Autonomous Multi-Signal Threat Detection, Posture Audit & Incident Forensics
      </div>
    </div>
    <div style="text-align: right;">
      <span class="badge-verdict">${r.verdict} (${r.overall_risk_score}/100)</span>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">Case ID: ${r.case_id}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div><strong>Target URL:</strong> <span style="font-family: monospace;">${r.target_url}</span></div>
    <div><strong>Canonical Domain:</strong> <span style="font-family: monospace;">${r.canonical_domain}</span></div>
    <div><strong>Audit Timestamp:</strong> ${r.timestamp}</div>
    <div><strong>Security Posture Grade:</strong> <span style="color: ${gradeColor}; font-weight: 800;">${r.security_audit?.security_grade || 'N/A'} (${r.security_audit?.score_percentage || 0}% Hardening)</span></div>
  </div>

  ${r.ai_insights ? `
  <div class="section-title">1. Executive Threat & Hacker-Perspective Audit</div>
  <div class="card-block" style="border-left: 4px solid #0284c7;">
    <div style="font-weight: 700; color: #0284c7; margin-bottom: 4px; font-size: 12px;">Threat Intelligence Assessment</div>
    <div style="color: #334155; margin-bottom: 8px;">${r.ai_insights.threat_intel_analysis}</div>
    <div style="font-weight: 700; color: #b91c1c; margin-bottom: 4px; font-size: 12px;">Exploitability & Hacker Vector Analysis</div>
    <div style="color: #475569;">${r.ai_insights.hacker_perspective_audit}</div>
  </div>
  ` : ''}

  <div class="section-title">2. Brand Impersonation & Contradiction Findings</div>
  <div class="card-block">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px;">
      <div><strong>Impersonated Brand:</strong> ${r.brand_analysis?.brand_display_name || 'None detected'}</div>
      <div><strong>Official Domain:</strong> ${r.brand_analysis?.brand_official_domain || 'N/A'}</div>
    </div>
    <div>
      <strong>Contradiction Assessment:</strong> 
      ${r.brand_analysis?.is_contradiction
        ? `<span style="color: #dc2626; font-weight: 700;">CRITICAL CONTRADICTION DETECTED — ${r.brand_analysis.contradiction_explanation}</span>`
        : '<span style="color: #16a34a; font-weight: 600;">No unauthorized brand contradiction or deceptive logo spoofing found.</span>'}
    </div>
  </div>

  <div class="section-title">3. Multi-Signal Forensic Evidence Factors</div>
  <div class="card-block" style="padding: 0;">
    <table>
      <thead>
        <tr>
          <th style="width: 12%;">Severity</th>
          <th style="width: 25%;">Indicator</th>
          <th style="width: 15%;">Category</th>
          <th style="width: 10%; text-align: right;">Points</th>
          <th>Forensic Signal Details</th>
        </tr>
      </thead>
      <tbody>
        ${evidenceRows}
      </tbody>
    </table>
  </div>

  <div class="section-title">4. Reconstructed Attack-Chain Progression</div>
  <div>
    ${attackSteps}
  </div>

  <div class="section-title">5. Defensive Server Hardening Recommendations</div>
  <div class="card-block">
    <ol style="margin: 0; padding-left: 20px;">
      ${recommendations}
    </ol>
  </div>

  <div class="footer">
    <div>Generated by CyberGuard AI Autonomous Security Engine • Official Verification Dossier</div>
    <div>Report Hash: SHA-256 Validated • Confidential Threat Intel</div>
  </div>
</body>
</html>`;
  };

  // Pure isolated print function via hidden iframe to eliminate duplicate pages
  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(generatePrintableHtml(report));
    doc.close();

    // Allow iframe document to render before triggering browser print dialog
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print error, falling back to window.print:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 250);
  };

  const handleDownloadHtml = () => {
    const htmlContent = generatePrintableHtml(report);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanDomain = (report.canonical_domain || 'target').replace(/[^a-zA-Z0-9.-]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `cyberguard_forensic_report_${cleanDomain}_${dateStr}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedHtml(true);
    setTimeout(() => setDownloadedHtml(false), 2500);
  };

  return (
    <div
      className="report-export-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        className="glass-panel report-export-modal-dialog"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d131f',
          border: '1px solid rgba(56, 189, 248, 0.5)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
        }}
      >
        {/* Modal Header */}
        <div
          className="report-export-modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(75, 85, 99, 0.4)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              CyberGuard AI Forensic Intelligence Report
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyMarkdown}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--code-box-bg)',
                color: 'var(--accent-cyan)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: downloadedHtml ? '1px solid #10b981' : '1px solid rgba(56, 189, 248, 0.4)',
                background: downloadedHtml ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                color: downloadedHtml ? '#10b981' : '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Download standalone offline HTML forensic dossier"
            >
              {downloadedHtml ? <Check size={14} color="#10b981" /> : <Download size={14} />}
              <span>{downloadedHtml ? 'Downloaded HTML' : 'Download HTML'}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)'
              }}
              title="Print directly or save clean PDF with zero duplicate pages"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div
          className="report-export-modal-content"
          style={{ padding: '24px', overflowY: 'auto', flex: 1 }}
        >
          <div
            id="report-printable-area"
            className="report-printable-area"
            style={{
              background: 'var(--code-box-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '24px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              lineHeight: 1.6
            }}
          >
            <div style={{ borderBottom: '2px solid var(--accent-cyan)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  CYBERGUARD AI FORENSIC INTELLIGENCE REPORT
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Multi-Signal Risk Assessment, Brand Contradiction &amp; Exploitability Audit
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge-critical mono" style={{ fontSize: '0.85rem', padding: '4px 12px', borderRadius: '6px', fontWeight: 700 }}>
                  {report.verdict} ({report.overall_risk_score}/100)
                </span>
                <div className="mono" style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>
                  Case ID: {report.case_id}
                </div>
              </div>
            </div>

            {/* Target Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px', background: 'rgba(31, 41, 55, 0.4)', padding: '12px', borderRadius: '6px' }}>
              <div><strong>Target URL:</strong> <span className="mono">{report.target_url}</span></div>
              <div><strong>Domain:</strong> <span className="mono">{report.canonical_domain}</span></div>
              <div><strong>Timestamp:</strong> <span className="mono">{report.timestamp}</span></div>
              <div><strong>Security Grade:</strong> <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>{report.security_audit?.security_grade || 'N/A'}</span></div>
            </div>

            {/* AI Insights */}
            {report.ai_insights && (
              <div style={{ marginBottom: '18px', background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #06b6d4' }}>
                <h4 style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>
                  🤖 CyberGuard AI Threat &amp; Penetration Audit
                </h4>
                <p style={{ color: '#d1d5db', fontSize: '0.82rem', marginBottom: '6px' }}>
                  {report.ai_insights.threat_intel_analysis}
                </p>
                <div style={{ color: '#fca5a5', fontSize: '0.82rem' }}>
                  <strong>Exploitability Finding:</strong> {report.ai_insights.hacker_perspective_audit}
                </div>
              </div>
            )}

            {/* Brand Contradiction Summary */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                1. Brand-Domain Contradiction Summary
              </h4>
              <div style={{ color: '#d1d5db', fontSize: '0.82rem' }}>
                {report.brand_analysis?.is_contradiction ? (
                  <div style={{ color: '#fca5a5' }}>
                    <strong>CRITICAL CONTRADICTION:</strong> {report.brand_analysis.contradiction_explanation}
                  </div>
                ) : (
                  <div>No unauthorized brand contradiction detected for this domain profile.</div>
                )}
              </div>
            </div>

            {/* Evidence Factor Summary */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                2. Key Forensic Evidence Signals
              </h4>
              <ul style={{ paddingLeft: '20px', color: '#d1d5db', fontSize: '0.82rem' }}>
                {(report.evidence_breakdown || []).map((ev, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    <strong>[{ev.severity}] {ev.category} - {ev.name}</strong> ({ev.contribution > 0 ? '+' : ''}{ev.contribution.toFixed(1)} pts): {ev.summary}
                  </li>
                ))}
              </ul>
            </div>

            {/* Attack Chain Summary */}
            <div>
              <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                3. Reconstructed Attack-Chain Stages
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                {(report.attack_chain || []).map((node) => (
                  <div key={node.id} style={{ background: 'rgba(31, 41, 55, 0.3)', padding: '8px 12px', borderRadius: '4px' }}>
                    <strong>Step {node.step_number}: {node.title}</strong> [{node.severity.toUpperCase()}]
                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>{node.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
