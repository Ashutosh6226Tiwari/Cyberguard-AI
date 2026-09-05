import React, { useState, useEffect } from 'react';
import { Radar, Terminal, Shield, Globe, Lock, Eye, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

interface ScanningTelemetryHUDProps {
  targetUrl: string;
  isDeep: boolean;
}

export const ScanningTelemetryHUD: React.FC<ScanningTelemetryHUDProps> = ({ targetUrl, isDeep }) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'DNS Resolution & RDAP Registry Query', detail: 'Resolving A/AAAA, MX, NS, TXT records and calculating ground-truth domain age', icon: Globe },
    { title: 'URL Lexical Feature Vector & Entropy Extraction', detail: 'Extracting 24-dimensional feature tensor and computing Shannon entropy in <15ms', icon: Terminal },
    { title: 'SSL/TLS Certificate & Transport Encryption Audit', detail: 'Verifying SNI chain, certificate validity, expiration, and issuer trustworthiness', icon: Lock },
    { title: isDeep ? 'Isolated Playwright Chromium Sandbox Crawl' : 'Fast Triage & Domain Standing Synthesis', detail: isDeep ? 'Rendering DOM, intercepting form submission targets, and inspecting obfuscated scripts' : 'Evaluating initial heuristic boundary and safety thresholds', icon: Eye },
    { title: isDeep ? 'Visual Perceptual Hashing (pHash) Brand Match' : 'x402 Protocol Payment Challenge Generation', detail: isDeep ? 'Comparing 64-bit DCT logo perceptual hashes against enterprise brand catalog' : 'Emitting HTTP 402 challenge on Algorand Testnet for premium forensics', icon: Shield },
    { title: 'Multi-Signal Fusion & Calibrated Risk Matrix', detail: 'Synthesizing all independent vectors into explainable 0-100 score and threat timeline', icon: Cpu },
  ];

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      setElapsedMs(diff);
      const stepIdx = Math.min(steps.length - 1, Math.floor(diff / 350));
      setCurrentStep(stepIdx);
    }, 50);

    return () => clearInterval(interval);
  }, [targetUrl, isDeep]);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        margin: '0 24px 24px 24px',
        background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15) 0%, var(--bg-card) 85%)',
        border: '1px solid rgba(6, 182, 212, 0.45)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(6, 182, 212, 0.1)',
        borderRadius: '16px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.2)',
            border: '1px solid #38bdf8',
            padding: '8px',
            borderRadius: '10px',
            color: '#38bdf8',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <Radar size={22} className="animate-spin" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Active Cybersecurity Telemetry Pipeline
              </h3>
              <span style={{ fontSize: '0.68rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#f59e0b', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                {isDeep ? 'DEEP MULTI-MODAL AUDIT' : 'FAST TRIAGE SCAN'}
              </span>
            </div>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Target: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{targetUrl}</span>
            </div>
          </div>
        </div>

        {/* Live Metrics */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="mono" style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>TIME: </span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>
          <div className="mono" style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>STAGE: </span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{currentStep + 1}/{steps.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Stage Tracker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        {steps.map((st, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          const IconComponent = st.icon;

          let cardBorder = 'var(--border-color)';
          let cardBg = 'var(--code-box-bg)';
          let iconColor = 'var(--text-muted)';
          let statusText = 'QUEUED';

          if (isDone) {
            cardBorder = 'rgba(16, 185, 129, 0.4)';
            cardBg = 'rgba(16, 185, 129, 0.08)';
            iconColor = '#10b981';
            statusText = 'COMPLETED';
          } else if (isCurrent) {
            cardBorder = 'rgba(56, 189, 248, 0.6)';
            cardBg = 'rgba(56, 189, 248, 0.12)';
            iconColor = '#38bdf8';
            statusText = 'INSPECTION IN PROGRESS...';
          }

          return (
            <div
              key={idx}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ marginTop: '2px', color: iconColor }}>
                {isCurrent ? <Loader2 size={16} className="animate-spin" /> : isDone ? <CheckCircle2 size={16} /> : <IconComponent size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: iconColor, letterSpacing: '0.04em' }}>
                    PHASE {idx + 1}
                  </span>
                  <span className="mono" style={{ fontSize: '0.62rem', color: iconColor, fontWeight: 700 }}>
                    {statusText}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {st.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {st.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
