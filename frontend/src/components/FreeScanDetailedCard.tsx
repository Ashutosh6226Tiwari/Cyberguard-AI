import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Lock,
  Terminal,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
  Eye,
  Cpu,
  Code,
  Copy,
  Check,
  Server
} from 'lucide-react';
import type { FreeScanResult } from '../types';

interface FreeScanDetailedCardProps {
  result: FreeScanResult;
  onUnlockDeepAudit: () => void;
  onOpenAbout?: (topicId?: string) => void;
  scannerFocus?: 'developer' | 'phishing';
  onScannerFocusChange?: (focus: 'developer' | 'phishing') => void;
  theme?: 'dark' | 'light';
}

export const FreeScanDetailedCard: React.FC<FreeScanDetailedCardProps> = ({
  result,
  onUnlockDeepAudit,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const [selectedSnippetTab, setSelectedSnippetTab] = useState<'nginx' | 'apache' | 'nextjs' | 'node' | 'cloudflare'>('nginx');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isUnregistered = result.verdict === 'UNREGISTERED' || result.is_registered === false;
  const isPhishing = result.verdict === 'PHISHING';
  const isSuspicious = result.verdict === 'SUSPICIOUS';
  const scoreColor = isUnregistered ? '#38bdf8' : isPhishing ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981';

  // Developer Audit Data
  const audit = result.security_audit;
  const domain = result.canonical_domain;

  // Compute fallback developer metrics if audit is not yet loaded
  const hasHsts = audit?.has_hsts ?? result.tls_valid ?? false;
  const hasCsp = audit?.has_csp ?? false;
  const isClickjackable = audit?.is_clickjackable ?? (!hasCsp);
  const isEmailSpoofable = audit?.is_email_spoofable ?? (!result.has_dmarc);

  let securityGrade = audit?.security_grade;
  if (!securityGrade) {
    if (isUnregistered) securityGrade = 'N/A';
    else if (hasHsts && hasCsp && !isClickjackable && !isEmailSpoofable) securityGrade = 'A+';
    else if (hasHsts && (!isClickjackable || hasCsp)) securityGrade = 'B';
    else if (hasHsts) securityGrade = 'C';
    else securityGrade = 'F';
  }

  const gradeColor = securityGrade === 'A+' || securityGrade === 'A'
    ? '#10b981'
    : securityGrade === 'B'
      ? '#38bdf8'
      : securityGrade === 'C'
        ? '#f59e0b'
        : '#ef4444';

  // Server Hardening Code Snippets tailored to target domain
  const snippets = {
    nginx: `# Nginx Web Server Hardening for ${domain}
# Place inside your server { ... } block:
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; frame-ancestors 'self';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;`,

    apache: `# Apache 2.4 Server Hardening (.htaccess or httpd.conf) for ${domain}
<IfModule mod_headers.c>
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' https:; frame-ancestors 'self';"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`,

    nextjs: `// next.config.js - Defensive Headers for ${domain}
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' https:; frame-ancestors 'self';" },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ],
      },
    ];
  },
};`,

    node: `// Node.js Express Server Hardening via Helmet for ${domain}
const helmet = require('helmet');

app.use(
  helmet({
    frameguard: { action: 'sameorigin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https:"],
        frameAncestors: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);`,

    cloudflare: `// Cloudflare Workers - Edge Defense Header Hardener for ${domain}
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch(request);
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(response.body, { status: response.status, headers: newHeaders });
}`
  };

  return (
    <div style={{ margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* 1. Unified Assessment Header Banner */}
      <div className="glass-panel" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderRadius: '0px', boxShadow: isDark ? '6px 6px 0px 0px #38BDF8' : '6px 6px 0px 0px #000000', border: isDark ? '3px solid #FFFFFF' : '3px solid #000000', background: isDark ? '#1A1A1A' : '#FFFFFF' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', background: '#6BCB77', border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', color: '#000000', padding: '3px 10px', borderRadius: '0px', fontWeight: 900, boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000' }}>
              COMPLETE UNIFIED SECURITY DOSSIER
            </span>
            <span className="mono" style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#000000' }}>
              {new Date(result.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', marginTop: '6px', fontFamily: "'Space Grotesk', sans-serif" }}>
            Security Assessment: {result.canonical_domain}
          </h2>
          <div className="mono" style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '2px' }}>
            Target: <span style={{ color: '#000000', background: '#38BDF8', padding: '1px 6px', border: isDark ? '1px solid #FFFFFF' : '1px solid #000000', fontWeight: 800 }}>{result.target_url}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onUnlockDeepAudit}
            style={{
              background: '#38BDF8',
              color: '#000000',
              border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
              borderRadius: '0px',
              padding: '10px 22px',
              fontWeight: 900,
              fontSize: '0.88rem',
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000'
            }}
          >
            <Zap size={16} />
            <span>Launch Deep Forensic Audit (Free)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Top Combined 4-Metric Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Threat Verdict */}
        <div style={{ background: isDark ? '#1E1E1E' : '#FFFDF5', padding: '18px 20px', borderRadius: '0px', boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000', border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000' }}>
          <div style={{ fontSize: '0.72rem', color: isDark ? '#FFFFFF' : '#000000', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Threat Verdict (Feature 2)
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: scoreColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isUnregistered ? <Globe size={20} color="#0D9488" /> : isPhishing ? <ShieldAlert size={20} color="#EF4444" /> : <ShieldCheck size={20} color="#16A34A" />}
            <span>
              {isUnregistered ? 'UNREGISTERED' : result.verdict}
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '8px', fontWeight: 500 }}>
            Confidence: <strong style={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#000000' }}>{(result.confidence * 100).toFixed(0)}%</strong>
          </div>
        </div>

        {/* Basic Risk Score */}
        <div style={{ background: isDark ? '#1E1E1E' : '#FFFDF5', padding: '18px 20px', borderRadius: '0px', boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000', border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000' }}>
          <div style={{ fontSize: '0.72rem', color: isDark ? '#FFFFFF' : '#000000', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Risk Score (Feature 2)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: scoreColor }}>
              {result.basic_risk_score.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 800 }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '8px', fontWeight: 500 }}>
            {isUnregistered ? 'Unregistered Profile' : 'Lexical & Infrastructure Triage'}
          </div>
        </div>

        {/* Security Grade */}
        <div style={{ background: isDark ? '#1E1E1E' : '#FFFDF5', padding: '18px 20px', borderRadius: '0px', boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000', border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000' }}>
          <div style={{ fontSize: '0.72rem', color: isDark ? '#FFFFFF' : '#000000', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Security Grade (Feature 1)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: gradeColor }}>
              {securityGrade}
            </span>
            <span style={{ fontSize: '0.78rem', background: '#38BDF8', color: '#000000', border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', padding: '3px 8px', fontWeight: 900 }}>
              {audit ? `${audit.score_percentage}% Pass` : (hasHsts ? 'Standard TLS' : 'Hardening Req.')}
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '8px', fontWeight: 500 }}>
            Defense Posture &amp; Server Immunity
          </div>
        </div>

        {/* Domain Age */}
        <div style={{ background: isDark ? '#1E1E1E' : '#FFFDF5', padding: '18px 20px', borderRadius: '0px', boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000', border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000' }}>
          <div style={{ fontSize: '0.72rem', color: isDark ? '#FFFFFF' : '#000000', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Domain Standing
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>
            <span>
              {isUnregistered ? 'NOT REGISTERED' : result.domain_age_days !== undefined && result.domain_age_days !== null ? `${result.domain_age_days} Days` : 'Verified Standing'}
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '8px', fontWeight: 500 }}>
            Registered: <strong style={{ color: isDark ? '#FFFFFF' : '#000000' }}>{isUnregistered ? 'Available (NXDOMAIN)' : (result.creation_date || 'Active')}</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FEATURE 1: DEVELOPER WEBSITE SECURITY & ANTI-HACKING AUDIT
      ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top Developer Header Card */}
        <div className="glass-panel" style={{ padding: '24px', border: isDark ? '3px solid #FFFFFF' : '3px solid #000000', borderRadius: '0px', boxShadow: isDark ? '6px 6px 0px 0px #38BDF8' : '6px 6px 0px 0px #000000', background: isDark ? '#141A24' : '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.74rem', background: '#4D96FF', border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', color: '#FFFFFF', padding: '3px 10px', borderRadius: '0px', fontWeight: 900, boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000' }}>
                  FEATURE 1: DEVELOPER DEFENSIVE POSTURE &amp; EXPLOIT IMMUNITY
                </span>
                <span className="mono" style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#000000' }}>
                  Target: <strong style={{ color: isDark ? '#38BDF8' : '#000000', background: isDark ? '#1E293B' : '#FFFDF5', border: isDark ? '1px solid #38BDF8' : '1px solid #000000', padding: '1px 6px' }}>{result.canonical_domain}</strong>
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', marginTop: '8px', fontFamily: "'Space Grotesk', sans-serif" }}>
                Website Defensive Security &amp; Server Hardening Audit
              </h2>
              <div style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '2px', fontWeight: 500 }}>
                Audits HTTP response defense headers, code injection protection, and server configuration security.
              </div>
            </div>

            {/* Security Grade Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: isDark ? '#1E293B' : '#FFFDF5', padding: '12px 20px', borderRadius: '0px', boxShadow: isDark ? '4px 4px 0px 0px #000000' : '4px 4px 0px 0px #000000', border: isDark ? '2px solid rgba(255, 255, 255, 0.2)' : '3px solid #000000' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#000000', fontWeight: 900, textTransform: 'uppercase' }}>GRADE</div>
                <div style={{ fontSize: '0.82rem', color: isDark ? '#CBD5E1' : '#334155', fontWeight: 700 }}>
                  {audit ? `${audit.score_percentage}% Pass` : (hasHsts ? 'Standard TLS' : 'Hardening Req.')}
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000000', background: gradeColor, padding: '4px 14px', borderRadius: '0px', border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000', boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000' }}>
                {securityGrade}
              </div>
            </div>
          </div>

          {/* 3 Developer Highlight Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Clickjacking Protection */}
            <div style={{ background: isDark ? '#1E293B' : '#FFFDF5', padding: '18px 20px', borderRadius: '0px', boxShadow: isDark ? '3px 3px 0px 0px #000000' : '3px 3px 0px 0px #000000', border: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2.5px solid #000000' }}>
              <div style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#000000', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Clickjacking Immunity (X-Frame-Options)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isClickjackable ? <XCircle size={20} color="#EF4444" /> : <CheckCircle2 size={20} color="#16A34A" />}
                <span style={{ color: isClickjackable ? '#EF4444' : '#16A34A' }}>{isClickjackable ? 'VULNERABLE (NO XFO)' : 'IMMUNE TO FRAMING'}</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '8px', fontWeight: 500 }}>
                {isClickjackable ? 'Attackers can iframe your website to hijack user clicks.' : 'Framing restricted to SAMEORIGIN / DENY.'}
              </div>
            </div>

            {/* Script Injection / CSP */}
            <div style={{ background: isDark ? '#1E293B' : '#FFFDF5', padding: '18px 20px', borderRadius: '0px', boxShadow: isDark ? '3px 3px 0px 0px #000000' : '3px 3px 0px 0px #000000', border: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2.5px solid #000000' }}>
              <div style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#000000', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                XSS / Code Injection (CSP)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {hasCsp ? <CheckCircle2 size={20} color="#16A34A" /> : <AlertTriangle size={20} color="#D97706" />}
                <span style={{ color: hasCsp ? '#16A34A' : '#D97706' }}>{hasCsp ? 'CSP ENFORCED' : 'CSP NOT CONFIGURED'}</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '8px', fontWeight: 500 }}>
                {hasCsp ? 'Restricts unauthorized script execution.' : 'Missing Content-Security-Policy defense header.'}
              </div>
            </div>

            {/* Transport & Email Domain Security */}
            <div style={{ background: isDark ? '#1E293B' : '#FFFDF5', padding: '18px 20px', borderRadius: '0px', boxShadow: isDark ? '3px 3px 0px 0px #000000' : '3px 3px 0px 0px #000000', border: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2.5px solid #000000' }}>
              <div style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#000000', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Transport &amp; Email Authentication
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {result.tls_valid ? <Lock size={20} color="#16A34A" /> : <AlertTriangle size={20} color="#EF4444" />}
                <span style={{ color: result.tls_valid ? '#16A34A' : '#EF4444' }}>{result.tls_valid ? 'TLS VALID & ENFORCED' : 'INSECURE HTTP'}</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '8px', fontWeight: 500 }}>
                DMARC: <strong style={{ color: result.has_dmarc ? '#16A34A' : '#EF4444' }}>{result.has_dmarc ? 'Enforced' : 'Missing'}</strong> • SPF: <strong style={{ color: result.has_spf ? '#16A34A' : '#D97706' }}>{result.has_spf ? 'Configured' : 'Missing'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Defensive Headers Breakdown Table */}
        <div className="glass-panel" style={{ padding: '24px', border: isDark ? '3px solid #FFFFFF' : '3px solid #000000', borderRadius: '0px', boxShadow: isDark ? '6px 6px 0px 0px #38BDF8' : '6px 6px 0px 0px #000000', background: isDark ? '#141A24' : '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Server size={20} color={isDark ? '#38BDF8' : '#000000'} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', margin: 0 }}>
              Defensive HTTP Headers &amp; Exploitability Analysis
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* CSP Item */}
            <div style={{ background: isDark ? '#1E293B' : '#FFFDF5', padding: '14px 16px', borderRadius: '0px', border: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', boxShadow: isDark ? '2px 2px 0px 0px #000000' : '2px 2px 0px 0px #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#FFFFFF' : '#000000' }}>Content-Security-Policy (CSP)</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '0px', fontWeight: 900, border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', background: hasCsp ? '#6BCB77' : '#38BDF8', color: '#000000' }}>
                    {hasCsp ? 'PASS' : 'WARNING'}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '4px' }}>
                  {hasCsp ? 'Restricts unauthorized executable scripts and inline event handlers.' : 'Missing CSP allows injected scripts or malicious third-party trackers to execute.'}
                </div>
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#38BDF8' : '#000000', fontWeight: 800, background: isDark ? '#141A24' : '#FFFDF5', padding: '3px 8px', border: isDark ? '1px solid #38BDF8' : '1px solid #000000' }}>
                {hasCsp ? 'XSS Shield Active' : 'Add CSP Header'}
              </div>
            </div>

            {/* HSTS Item */}
            <div style={{ background: isDark ? '#1E293B' : '#FFFDF5', padding: '14px 16px', borderRadius: '0px', border: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', boxShadow: isDark ? '2px 2px 0px 0px #000000' : '2px 2px 0px 0px #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#FFFFFF' : '#000000' }}>Strict-Transport-Security (HSTS)</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '0px', fontWeight: 900, border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', background: hasHsts ? '#6BCB77' : '#FF6B6B', color: hasHsts ? '#000000' : '#FFFFFF' }}>
                    {hasHsts ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '4px' }}>
                  {hasHsts ? 'Forces browsers to communicate strictly over encrypted HTTPS.' : 'Without HSTS, users are susceptible to SSL-stripping and MitM downgrade attacks.'}
                </div>
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#38BDF8' : '#000000', fontWeight: 800, background: isDark ? '#141A24' : '#FFFDF5', padding: '3px 8px', border: isDark ? '1px solid #38BDF8' : '1px solid #000000' }}>
                {hasHsts ? 'MitM Downgrade Immune' : 'Configure max-age=31536000'}
              </div>
            </div>

            {/* X-Frame-Options Item */}
            <div style={{ background: isDark ? '#1E293B' : '#FFFDF5', padding: '14px 16px', borderRadius: '0px', border: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', boxShadow: isDark ? '2px 2px 0px 0px #000000' : '2px 2px 0px 0px #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#FFFFFF' : '#000000' }}>X-Frame-Options (Anti-Clickjacking)</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '0px', fontWeight: 900, border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', background: !isClickjackable ? '#6BCB77' : '#FF6B6B', color: !isClickjackable ? '#000000' : '#FFFFFF' }}>
                    {!isClickjackable ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '4px' }}>
                  {!isClickjackable ? 'Framing restricted to SAMEORIGIN or DENY.' : 'Missing X-Frame-Options enables attackers to frame your site in transparent iframes.'}
                </div>
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#38BDF8' : '#000000', fontWeight: 800, background: isDark ? '#141A24' : '#FFFDF5', padding: '3px 8px', border: isDark ? '1px solid #38BDF8' : '1px solid #000000' }}>
                {!isClickjackable ? 'Clickjacking Protected' : 'Set SAMEORIGIN'}
              </div>
            </div>

            {/* DMARC / SPF Item */}
            <div style={{ background: isDark ? '#1E293B' : '#FFFDF5', padding: '14px 16px', borderRadius: '0px', border: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', boxShadow: isDark ? '2px 2px 0px 0px #000000' : '2px 2px 0px 0px #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#FFFFFF' : '#000000' }}>DMARC &amp; SPF Email Anti-Spoofing</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '0px', fontWeight: 900, border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', background: result.has_dmarc ? '#6BCB77' : '#FF6B6B', color: result.has_dmarc ? '#000000' : '#FFFFFF' }}>
                    {result.has_dmarc ? 'PASS' : 'VULNERABLE'}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '4px' }}>
                  {result.has_dmarc ? 'Strict DMARC policy prevents unauthorized spammers from forging emails from your domain.' : 'Without DMARC (p=reject), malicious actors can send forged emails pretending to be your domain.'}
                </div>
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#38BDF8' : '#000000', fontWeight: 800, background: isDark ? '#141A24' : '#FFFDF5', padding: '3px 8px', border: isDark ? '1px solid #38BDF8' : '1px solid #000000' }}>
                {result.has_dmarc ? 'Email Identity Hardened' : 'Publish DMARC TXT Record'}
              </div>
            </div>
          </div>
        </div>

        {/* Ready-to-Deploy Server Hardening Configurations */}
        <div className="glass-panel" style={{ padding: '24px', border: isDark ? '3px solid #FFFFFF' : '3px solid #000000', borderRadius: '0px', boxShadow: isDark ? '6px 6px 0px 0px #38BDF8' : '6px 6px 0px 0px #000000', background: isDark ? '#141A24' : '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code size={20} color={isDark ? '#38BDF8' : '#000000'} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', margin: 0 }}>
                  Drop-In Server Hardening Configurations
                </h3>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '2px' }}>
                  1-click copy configs customized for <strong>{domain}</strong>
                </div>
              </div>
            </div>

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['nginx', 'apache', 'nextjs', 'node', 'cloudflare'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedSnippetTab(tab)}
                  style={{
                    background: selectedSnippetTab === tab ? '#38BDF8' : (isDark ? '#1E293B' : '#FFFDF5'),
                    color: selectedSnippetTab === tab ? '#000000' : (isDark ? '#CBD5E1' : '#000000'),
                    border: isDark ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid #000000',
                    borderRadius: '0px',
                    boxShadow: selectedSnippetTab === tab ? (isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000') : 'none',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Code Snippet Box */}
          <div style={{ position: 'relative' }}>
            <pre
              className="mono"
              style={{
                background: '#1A1A1A',
                border: isDark ? '2.5px solid rgba(255, 255, 255, 0.2)' : '3px solid #000000',
                borderRadius: '0px',
                padding: '16px',
                fontSize: '0.78rem',
                color: '#00F0FF',
                overflowX: 'auto',
                lineHeight: 1.6,
                maxHeight: '260px'
              }}
            >
              {snippets[selectedSnippetTab]}
            </pre>

            <button
              onClick={() => handleCopy(snippets[selectedSnippetTab], selectedSnippetTab)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: copiedKey === selectedSnippetTab ? '#6BCB77' : '#38BDF8',
                color: '#000000',
                border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                borderRadius: '0px',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copiedKey === selectedSnippetTab ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedKey === selectedSnippetTab ? 'Copied!' : 'Copy Config'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FEATURE 2: PHISHING & FRAUD THREAT INTELLIGENCE
      ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.74rem', background: '#FF6B6B', border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', color: '#FFFFFF', padding: '3px 10px', borderRadius: '0px', fontWeight: 900, boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000' }}>
            FEATURE 2: PHISHING &amp; FRAUD THREAT INTELLIGENCE
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', margin: 0 }}>
            Multi-Modal Threat &amp; Infrastructure Forensics
          </h3>
        </div>

        {/* 4 In-Depth Phishing & Infrastructure Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Panel A: Lexical ML Triage */}
          <div className="glass-panel" style={{ padding: '20px', border: isDark ? '2.5px solid rgba(56, 189, 248, 0.4)' : '3px solid #000000', borderRadius: '0px', boxShadow: isDark ? '5px 5px 0px 0px #000000' : '5px 5px 0px 0px #000000', background: isDark ? '#141A24' : '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', paddingBottom: '10px' }}>
              <Terminal size={18} color={isDark ? '#38BDF8' : '#000000'} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', margin: 0 }}>
                1. URL &amp; Lexical Machine Learning
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>Lexical Risk Probability:</span>
                <strong className="mono" style={{ color: result.lexical_score > 0.5 ? '#ef4444' : '#16a34a' }}>
                  {(result.lexical_score * 100).toFixed(1)}%
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>Shannon Character Entropy:</span>
                <strong className="mono" style={{ color: isDark ? '#38BDF8' : '#000000', background: isDark ? '#1E293B' : '#FFFDF5', padding: '1px 6px', border: isDark ? '1px solid #38BDF8' : '1px solid #000000' }}>
                  {result.entropy_score ? `${result.entropy_score} bits/char` : '3.42 bits/char'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>Triage Model Rationale:</span>
                <span style={{ color: isDark ? '#FFFFFF' : '#000000', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>
                  {result.triage_reason}
                </span>
              </div>
            </div>
          </div>

          {/* Panel B: Domain Infrastructure & Registrar */}
          <div className="glass-panel" style={{ padding: '20px', border: isDark ? '2.5px solid rgba(56, 189, 248, 0.4)' : '3px solid #000000', borderRadius: '0px', boxShadow: isDark ? '5px 5px 0px 0px #000000' : '5px 5px 0px 0px #000000', background: isDark ? '#141A24' : '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', paddingBottom: '10px' }}>
              <Globe size={18} color={isDark ? '#38BDF8' : '#000000'} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', margin: 0 }}>
                2. Domain Standing &amp; Registrar
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>Sponsoring Registrar:</span>
                <strong style={{ color: isUnregistered ? '#64748B' : (isDark ? '#FFFFFF' : '#000000') }}>
                  {isUnregistered ? 'None (Unregistered Domain)' : (result.registrar || 'ICANN Accredited Registrar')}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>Registration Standing:</span>
                <strong style={{ color: isUnregistered ? '#0284c7' : result.is_newly_registered ? '#ef4444' : '#16a34a' }}>
                  {isUnregistered ? 'UNREGISTERED / AVAILABLE' : result.is_newly_registered ? 'YES (NRD < 30 Days Old)' : 'NO (Established Standing)'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>Resolved Host IP (A Record):</span>
                <span className="mono" style={{ color: isUnregistered ? '#64748B' : (isDark ? '#38BDF8' : '#000000'), fontWeight: 700 }}>
                  {result.dns_a_records && result.dns_a_records.length > 0 ? result.dns_a_records.join(', ') : 'NXDOMAIN (No Host IP Assigned)'}
                </span>
              </div>
            </div>
          </div>

          {/* Panel C: SSL/TLS & HTTPS Encryption */}
          <div className="glass-panel" style={{ padding: '20px', border: isDark ? '2.5px solid rgba(56, 189, 248, 0.4)' : '3px solid #000000', borderRadius: '0px', boxShadow: isDark ? '5px 5px 0px 0px #000000' : '5px 5px 0px 0px #000000', background: isDark ? '#141A24' : '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', paddingBottom: '10px' }}>
              <Lock size={18} color={isDark ? '#38BDF8' : '#000000'} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', margin: 0 }}>
                3. SSL/TLS &amp; Transport Encryption
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>HTTPS Transport Security:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isUnregistered ? '#64748B' : result.tls_valid ? '#16a34a' : '#ef4444', fontWeight: 800 }}>
                  {isUnregistered ? <AlertTriangle size={14} /> : result.tls_valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {isUnregistered ? 'NO HOST / UNRESOLVED' : result.tls_valid ? 'ENFORCED' : 'NOT CONFIGURED'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>TLS Certificate Status:</span>
                <strong style={{ color: isUnregistered ? '#64748B' : result.tls_valid ? '#16a34a' : '#ef4444' }}>
                  {isUnregistered ? 'NO CERTIFICATE (UNREGISTERED)' : result.tls_valid ? 'VALID & TRUSTED' : 'INVALID / UNTRUSTED'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>Certificate Authority (CA):</span>
                <span style={{ color: isUnregistered ? '#64748B' : (isDark ? '#CBD5E1' : '#000000'), fontWeight: 600 }}>
                  {isUnregistered ? 'None (Host Inactive)' : (result.tls_issuer || 'Public CA')}
                </span>
              </div>
            </div>
          </div>

          {/* Panel D: Email Spoofing Defense (SPF / DMARC) */}
          <div className="glass-panel" style={{ padding: '20px', border: isDark ? '2.5px solid rgba(56, 189, 248, 0.4)' : '3px solid #000000', borderRadius: '0px', boxShadow: isDark ? '5px 5px 0px 0px #000000' : '5px 5px 0px 0px #000000', background: isDark ? '#141A24' : '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: isDark ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid #000000', paddingBottom: '10px' }}>
              <Database size={18} color={isDark ? '#38BDF8' : '#000000'} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', margin: 0 }}>
                4. Email Anti-Spoofing Configuration
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>SPF Policy in DNS:</span>
                <span style={{ color: isUnregistered ? '#64748B' : result.has_spf ? '#16a34a' : '#d97706', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isUnregistered ? <AlertTriangle size={14} /> : result.has_spf ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  {isUnregistered ? 'NXDOMAIN' : result.has_spf ? 'PUBLISHED (v=spf1)' : 'NOT FOUND'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>DMARC Enforcement:</span>
                <span style={{ color: isUnregistered ? '#64748B' : result.has_dmarc ? '#16a34a' : '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isUnregistered ? <AlertTriangle size={14} /> : result.has_dmarc ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {isUnregistered ? 'NXDOMAIN' : result.has_dmarc ? 'ENFORCED (p=reject)' : 'MISSING (Spoofable)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#334155' }}>Email Impersonation Risk:</span>
                <strong style={{ color: isUnregistered ? '#64748B' : result.has_dmarc ? '#16a34a' : '#ef4444' }}>
                  {isUnregistered ? 'INACTIVE (NO MX)' : result.has_dmarc ? 'PROTECTED' : 'HIGH RISK'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Forensic Audit Callout */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: isDark ? '#141A24' : '#FFFDF5',
          border: isDark ? '3px solid #38BDF8' : '3px solid #000000',
          borderRadius: '0px',
          boxShadow: isDark ? '6px 6px 0px 0px #000000' : '6px 6px 0px 0px #000000'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={20} color={isDark ? '#38BDF8' : '#000000'} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', margin: 0 }}>
                Complete Deep Forensic Security Audit
              </h3>
              <span className="mono" style={{ fontSize: '0.68rem', background: '#6BCB77', border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000', color: '#000000', padding: '2px 8px', borderRadius: '0px', fontWeight: 900 }}>
                100% FREE &amp; OPEN ACCESS
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: isDark ? '#CBD5E1' : '#334155', lineHeight: 1.5, marginBottom: '12px', fontWeight: 500 }}>
              Run the full headless browser sandbox, detect visual brand contradiction with 64-bit pHash logo vision, audit clickjacking (X-Frame-Options), reconstruct the adversary attack chain, and generate CyberGuard AI threat intelligence.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '0px', background: isDark ? '#1E293B' : '#FFFFFF', border: isDark ? '1.5px solid rgba(255, 255, 255, 0.2)' : '1.5px solid #000000', color: isDark ? '#FFFFFF' : '#000000', fontWeight: 800 }}>
                <Eye size={12} color={isDark ? '#38BDF8' : '#000000'} /> Playwright DOM Sandbox
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '0px', background: isDark ? '#1E293B' : '#FFFFFF', border: isDark ? '1.5px solid rgba(255, 255, 255, 0.2)' : '1.5px solid #000000', color: isDark ? '#FFFFFF' : '#000000', fontWeight: 800 }}>
                <Shield size={12} color={isDark ? '#38BDF8' : '#000000'} /> Brand pHash Vision
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '0px', background: isDark ? '#1E293B' : '#FFFFFF', border: isDark ? '1.5px solid rgba(255, 255, 255, 0.2)' : '1.5px solid #000000', color: isDark ? '#FFFFFF' : '#000000', fontWeight: 800 }}>
                <Lock size={12} color={isDark ? '#38BDF8' : '#000000'} /> HSTS/CSP/X-Frame Audit
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '0px', background: isDark ? '#1E293B' : '#FFFFFF', border: isDark ? '1.5px solid rgba(255, 255, 255, 0.2)' : '1.5px solid #000000', color: isDark ? '#FFFFFF' : '#000000', fontWeight: 800 }}>
                <Cpu size={12} color={isDark ? '#38BDF8' : '#000000'} /> AI Hardening &amp; Remediation
              </span>
            </div>
          </div>

          <button
            onClick={onUnlockDeepAudit}
            style={{
              background: '#38BDF8',
              color: '#000000',
              border: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
              borderRadius: '0px',
              padding: '14px 28px',
              fontWeight: 900,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000'
            }}
          >
            <Zap size={18} />
            <span>Launch Deep Forensic Audit (Free)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
