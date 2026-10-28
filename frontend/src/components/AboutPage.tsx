import React from 'react';
import { Cpu, Shield, Database, Lock, Eye, Terminal, Layers, CheckCircle2, ArrowRight, Network } from 'lucide-react';

export const AboutPage: React.FC<{ onLaunchScanner: () => void; theme?: 'dark' | 'light' }> = ({ onLaunchScanner, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const stages = [
    {
      num: '01',
      name: 'URL & Lexical Feature Engineering',
      model: 'Calibrated Random Forest (100 Trees)',
      dataset: 'UCI PhiUSIIL Dataset (235k+ URLs)',
      detail: 'Extracts a 24-dimensional statistical vector in <15ms: Shannon character entropy on domain/path, brand keywords in subdomains, digit ratios, and TLD risk coefficients.'
    },
    {
      num: '02',
      name: 'Domain & Infrastructure Intelligence',
      model: 'Authoritative RDAP & Google DoH Engine',
      dataset: 'IETF RFC 7480 RDAP Registry Stream',
      detail: 'Queries live ICANN-accredited registries to calculate exact domain age in days, flags Newly Registered Domains (NRDs < 30 days), and resolves DNS A, AAAA, MX, NS, and TXT records.'
    },
    {
      num: '03',
      name: 'SSL/TLS Certificate Verification',
      model: 'SNI Socket Handshake & Chain Analyzer',
      dataset: 'Public CA Root Stores',
      detail: 'Inspects certificate validity, days remaining to expiration, issuer trust level, and flags self-signed or revoked SSL certificates used in MitM downgrade attacks.'
    },
    {
      num: '04',
      name: 'Website Security Posture Audit',
      model: 'Exploitability & Defensive Header Parser',
      dataset: 'OWASP Secure Headers Standard',
      detail: 'Audits HTTP response headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) and email anti-spoofing policies (SPF, DMARC) to generate developer security grades (A+ to F).'
    },
    {
      num: '05',
      name: 'Brand-Domain Contradiction Engine',
      model: 'Perceptual Image Hashing (pHash DCT 64-bit)',
      dataset: 'Enterprise Trademark & Logo Catalog',
      detail: 'Captures rendered DOM screenshots in Playwright sandbox and calculates 64-bit DCT frequency hashes against official logos to stop zero-day impersonation on unauthorized hosts.'
    },
    {
      num: '06',
      name: 'Multi-Signal Fusion & CyberAI',
      model: 'Platt Sigmoid Fusion & Neural LLM',
      dataset: 'Calibrated Threat Probability Matrix',
      detail: 'Aggregates all 5 vectors into a calibrated 0–100 Risk Score, reconstructs the 7-stage attack chain, and outputs plain-language SOC threat intelligence and 1-click remediation code.'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '32px', margin: '0 24px 24px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginBottom: '14px' }}>
          <Cpu size={14} />
          <span>CYBERGUARD AI ARCHITECTURE &amp; METHODOLOGY</span>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '14px' }}>
          How CyberGuard AI Protects Against Zero-Hour Threats
        </h2>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Traditional blocklists take hours or days to propagate. CyberGuard AI uses a <strong>6-stage multi-modal intelligence pipeline</strong> that evaluates unknown URLs on the very first visit in real time.
        </p>

      </div>

      {/* Embedded Live Interactive Architecture Map */}
      <div
        style={{
          marginBottom: '48px',
          border: isDark ? '3px solid #38BDF8' : '4px solid #000000',
          boxShadow: isDark ? '6px 6px 0px 0px #38BDF8' : '8px 8px 0px 0px #000000',
          background: isDark ? '#141A24' : '#FFFFFF',
          borderRadius: '0px',
          overflow: 'hidden'
        }}
      >
        {/* Card Header & Controls */}
        <div
          style={{
            padding: '14px 20px',
            background: isDark ? '#1E293B' : '#38BDF8',
            borderBottom: isDark ? '3px solid #38BDF8' : '4px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Network size={22} color={isDark ? '#38BDF8' : '#000000'} strokeWidth={2.6} />
            <div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  color: isDark ? '#FFFFFF' : '#000000',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                End-to-End System Architecture &amp; Threat Pipeline
              </span>
              <span
                style={{
                  marginLeft: '12px',
                  background: isDark ? '#0F172A' : '#000000',
                  color: '#4ADE80',
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  border: isDark ? '1px solid #4ADE80' : 'none'
                }}
              >
                INTERACTIVE MAP
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => window.open('/architecture.html', '_blank')}
              style={{
                padding: '7px 16px',
                background: isDark ? '#0F172A' : '#FFFFFF',
                border: isDark ? '2px solid #38BDF8' : '2.5px solid #000000',
                boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                color: isDark ? '#38BDF8' : '#000000',
                fontWeight: 900,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Space Grotesk', sans-serif",
                textTransform: 'uppercase'
              }}
              title="Open full-screen interactive map in a new browser tab"
            >
              <span>Open Fullscreen</span>
              <ArrowRight size={14} strokeWidth={2.6} />
            </button>
          </div>
        </div>

        {/* Embedded Interactive Canvas Frame */}
        <div style={{ width: '100%', height: '760px', position: 'relative', background: isDark ? '#0B0F19' : '#FAF8F5' }}>
          <iframe
            src="/architecture.html"
            title="CyberGuard AI System Architecture"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* 6 Stages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {stages.map((st) => (
          <div
            key={st.num}
            style={{
              background: 'var(--code-box-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                  STAGE {st.num}
                </span>
                <span className="mono badge-info" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px' }}>
                  {st.model.split(' ')[0]}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {st.name}
              </h3>

              <div style={{ marginBottom: '10px', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Model / Engine: </span>
                <strong style={{ color: '#38bdf8' }}>{st.model}</strong>
              </div>

              <div style={{ marginBottom: '12px', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ground-Truth Data: </span>
                <span className="mono" style={{ color: '#f59e0b' }}>{st.dataset}</span>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {st.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div style={{ textAlign: 'center', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Test the Complete Multi-Modal Pipeline
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Execute a live security scan on any URL to see all 6 intelligence stages and multi-modal AI forensics in action.
        </p>
        <button
          onClick={onLaunchScanner}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 28px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
          }}
        >
          <Shield size={18} />
          <span>Launch Live Security Scanner</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
