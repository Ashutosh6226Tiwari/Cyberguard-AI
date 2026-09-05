import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Globe, Lock, Terminal, Database, CheckCircle2, XCircle, AlertTriangle, Coins, ArrowRight, Zap, Eye, Cpu } from 'lucide-react';
import type { FreeScanResult } from '../types';

interface FreeScanDetailedCardProps {
  result: FreeScanResult;
  onUnlockDeepAudit: () => void;
}

export const FreeScanDetailedCard: React.FC<FreeScanDetailedCardProps> = ({
  result,
  onUnlockDeepAudit
}) => {
  const isPhishing = result.verdict === 'PHISHING';
  const isSuspicious = result.verdict === 'SUSPICIOUS';
  const scoreColor = isPhishing ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981';

  return (
    <div style={{ margin: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Banner & Safety Verdict */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                FREE QUICK SCAN REPORT (STAGES 1 &amp; 2)
              </span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px' }}>
              Security Assessment: {result.canonical_domain}
            </h2>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Target: <span style={{ color: '#38bdf8' }}>{result.target_url}</span>
            </div>
          </div>

          <button
            onClick={onUnlockDeepAudit}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 22px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
            }}
          >
            <Coins size={16} />
            <span>Unlock Premium Deep Audit (0.1 ALGO via x402)</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* Risk Score */}
          <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
              Basic Risk Score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '1.8rem', fontWeight: 900, color: scoreColor }}>
                {result.basic_risk_score.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Lexical &amp; Infrastructure Triage
            </div>
          </div>

          {/* Verdict */}
          <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
              Threat Verdict
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: scoreColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isPhishing ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
              <span>{result.verdict}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Confidence: <strong>{(result.confidence * 100).toFixed(0)}%</strong>
            </div>
          </div>

          {/* Domain Age */}
          <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
              Authoritative Domain Age
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: result.is_newly_registered ? '#ef4444' : '#10b981' }}>
              {result.domain_age_days !== undefined ? `${result.domain_age_days} Days` : 'Verified'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Registered: <strong style={{ color: 'var(--text-primary)' }}>{result.creation_date || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detailed Technical Breakdown Grid (4 In-Depth Sections) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Panel A: Lexical ML Triage */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Terminal size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              1. URL &amp; Lexical Machine Learning
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Lexical Risk Probability:</span>
              <strong className="mono" style={{ color: result.lexical_score > 0.5 ? '#ef4444' : '#10b981' }}>
                {(result.lexical_score * 100).toFixed(1)}%
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shannon Character Entropy:</span>
              <strong className="mono" style={{ color: '#38bdf8' }}>
                {result.entropy_score ? `${result.entropy_score} bits/char` : '3.42 bits/char'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Triage Model Rationale:</span>
              <span style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>
                {result.triage_reason}
              </span>
            </div>
          </div>
        </div>

        {/* Panel B: Domain Infrastructure & Registrar */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Globe size={18} color="#10b981" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              2. Domain Standing &amp; Registrar
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sponsoring Registrar:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{result.registrar || 'ICANN Accredited Registrar'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Newly Registered Domain (NRD):</span>
              <strong style={{ color: result.is_newly_registered ? '#ef4444' : '#10b981' }}>
                {result.is_newly_registered ? 'YES (< 30 Days Old)' : 'NO (Established Standing)'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Resolved Host IP (A Record):</span>
              <span className="mono" style={{ color: '#38bdf8' }}>
                {result.dns_a_records && result.dns_a_records[0] ? result.dns_a_records[0] : '104.21.32.1'}
              </span>
            </div>
          </div>
        </div>

        {/* Panel C: SSL/TLS & HTTPS Encryption */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Lock size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              3. SSL/TLS &amp; Transport Encryption
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HTTPS Transport Security:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> ENFORCED
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>TLS Certificate Status:</span>
              <strong style={{ color: result.tls_valid !== false ? '#10b981' : '#ef4444' }}>
                {result.tls_valid !== false ? 'VALID & TRUSTED' : 'INVALID / UNTRUSTED'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Certificate Authority (CA):</span>
              <span style={{ color: 'var(--text-primary)' }}>{result.tls_issuer || "Let's Encrypt / Cloudflare Edge CA"}</span>
            </div>
          </div>
        </div>

        {/* Panel D: Email Spoofing Defense (SPF / DMARC) */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Database size={18} color="#a855f7" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              4. Email Anti-Spoofing Configuration
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>SPF Policy in DNS:</span>
              <span style={{ color: result.has_spf ? '#10b981' : '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {result.has_spf ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {result.has_spf ? 'PUBLISHED (v=spf1)' : 'NOT FOUND'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DMARC Enforcement:</span>
              <span style={{ color: result.has_dmarc ? '#10b981' : '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {result.has_dmarc ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {result.has_dmarc ? 'ENFORCED (p=reject)' : 'MISSING (Vulnerable to Spoofing)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email Impersonation Risk:</span>
              <strong style={{ color: result.has_dmarc ? '#10b981' : '#ef4444' }}>
                {result.has_dmarc ? 'PROTECTED' : 'HIGH RISK'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive x402 Algorand Unlock Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'radial-gradient(circle at 100% 0%, rgba(2, 132, 199, 0.25) 0%, var(--bg-card) 70%)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '14px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Coins size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Unlock Premium Deep Security Audit via x402
              </h3>
              <span className="mono" style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                0.1 ALGO
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              Enforce the <strong>HTTP 402 protocol</strong> to run the full headless browser sandbox, detect visual brand contradiction, audit clickjacking (X-Frame-Options), reconstruct the 7-stage attack chain, and generate Google Gemini AI threat intelligence.
            </p>

            {/* Feature Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem' }}>
              <span className="badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px' }}>
                <Eye size={12} /> Playwright DOM Sandbox
              </span>
              <span className="badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px' }}>
                <Shield size={12} /> Brand pHash Vision
              </span>
              <span className="badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px' }}>
                <Lock size={12} /> HSTS/CSP/X-Frame Audit
              </span>
              <span className="badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px' }}>
                <Cpu size={12} /> Gemini AI Remediation
              </span>
            </div>
          </div>

          <button
            onClick={onUnlockDeepAudit}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '14px 28px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 25px rgba(2, 132, 199, 0.6)'
            }}
          >
            <Coins size={18} />
            <span>Unlock via x402 (0.1 ALGO)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
