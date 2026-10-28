import React, { useState } from 'react';
import { Download, Sparkles, Terminal, Puzzle, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, Zap, Lock, Globe } from 'lucide-react';

interface ChromeExtensionPageProps {
  onLaunchScanner?: (domain: string) => void;
  theme?: 'dark' | 'light';
}

export const ChromeExtensionPage: React.FC<ChromeExtensionPageProps> = ({ onLaunchScanner, theme }) => {
  const isDark = theme ? theme === 'dark' : (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') !== 'light');
  const [downloading, setDownloading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = '/CyberGuard-AI-Chrome-Extension.zip';
    link.download = 'CyberGuard-AI-Chrome-Extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1500);
  };

  const handleCopyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      style={{
        padding: '36px',
        margin: '0 24px 28px 24px',
        background: isDark ? '#141A24' : '#FFFFFF',
        border: isDark ? '3px solid #38BDF8' : '4px solid #000000',
        boxShadow: isDark ? '8px 8px 0px 0px #000000, 0 0 20px rgba(56, 189, 248, 0.15)' : '12px 12px 0px 0px #000000',
        borderRadius: '0px',
        fontFamily: "'Space Grotesk', sans-serif"
      }}
    >
      {/* Top Banner & Hero Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '36px',
          alignItems: 'center',
          marginBottom: '40px'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#38BDF8',
              border: isDark ? '2px solid #FFFFFF' : '2.5px solid #000000',
              boxShadow: isDark ? '2.5px 2.5px 0px 0px #38BDF8' : '2.5px 2.5px 0px 0px #000000',
              borderRadius: '0px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              color: '#000000',
              fontWeight: 900,
              letterSpacing: '0.04em',
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}
          >
            <Sparkles size={15} color="#000000" />
            <span>Real-Time Browser Defense (Manifest V3)</span>
          </div>

          <h1
            style={{
              fontSize: '2.3rem',
              fontWeight: 900,
              color: isDark ? '#FFFFFF' : '#000000',
              lineHeight: 1.15,
              marginBottom: '14px',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}
          >
            CyberGuard AI Chrome Extension
          </h1>

          <p
            style={{
              fontSize: '0.94rem',
              color: isDark ? '#94A3B8' : '#000000',
              lineHeight: 1.6,
              marginBottom: '26px',
              fontWeight: 600
            }}
          >
            Install the high-precision browser shield to get instant early-warning protection whenever you visit lookalike domains, credential phishing traps, or misconfigured servers in real time.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownload}
              style={{
                background: '#4D96FF',
                color: '#000000',
                border: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
                borderRadius: '0px',
                padding: '14px 26px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isDark ? '5px 5px 0px 0px #38BDF8' : '5px 5px 0px 0px #000000',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = isDark ? '7px 7px 0px 0px #38BDF8' : '7px 7px 0px 0px #000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = isDark ? '5px 5px 0px 0px #38BDF8' : '5px 5px 0px 0px #000000';
              }}
            >
              <Download size={20} strokeWidth={2.8} />
              <span>{downloading ? 'Downloading Package...' : 'Download Extension (.ZIP)'}</span>
            </button>

            {onLaunchScanner && (
              <button
                onClick={() => onLaunchScanner('campuskart.shop')}
                style={{
                  background: '#38BDF8',
                  color: '#000000',
                  border: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
                  borderRadius: '0px',
                  padding: '14px 22px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = isDark ? '6px 6px 0px 0px #38BDF8' : '6px 6px 0px 0px #000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000';
                }}
              >
                <span>Test Live Scan</span>
                <ArrowRight size={18} strokeWidth={2.8} />
              </button>
            )}
          </div>
        </div>

        {/* Live Extension Mockup Box (Neo-Brutalism Style) */}
        <div
          style={{
            background: isDark ? '#141A24' : '#FFFDF5',
            border: isDark ? '3.5px solid #38BDF8' : '3.5px solid #000000',
            borderRadius: '0px',
            boxShadow: isDark ? '8px 8px 0px 0px #000000' : '8px 8px 0px 0px #000000',
            overflow: 'hidden'
          }}
        >
          {/* Top Browser Bar Mockup */}
          <div
            style={{
              background: '#38BDF8',
              borderBottom: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                  padding: '5px',
                  boxShadow: isDark ? '1.5px 1.5px 0px 0px #38BDF8' : '1.5px 1.5px 0px 0px #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Puzzle size={16} color={isDark ? '#38BDF8' : '#000000'} strokeWidth={2.8} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.01em' }}>
                  CYBERGUARD AI
                </div>
                <div style={{ fontSize: '0.62rem', color: '#000000', fontWeight: 700 }}>
                  v2.0 ACTIVE THREAT SHIELD
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                color: '#000000',
                background: '#6BCB77',
                border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                padding: '3px 10px',
                borderRadius: '0px',
                fontWeight: 900
              }}
            >
              ● SHIELD ACTIVE
            </span>
          </div>

          <div style={{ padding: '16px' }}>
            {/* Active Tab Card */}
            <div
              style={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                padding: '10px 12px',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: isDark ? '#94A3B8' : '#000000', fontWeight: 900, textTransform: 'uppercase' }}>
                  Current Active Tab Target
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    background: '#6BCB77',
                    border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000',
                    color: '#000000',
                    padding: '1px 6px',
                    boxShadow: isDark ? '1px 1px 0px 0px #38BDF8' : '1px 1px 0px 0px #000000'
                  }}
                >
                  HTTPS
                </span>
              </div>
              <div className="mono" style={{ fontSize: '0.88rem', color: isDark ? '#38BDF8' : '#000000', fontWeight: 800 }}>
                https://campuskart.shop
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                  boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                  padding: '10px 8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.66rem', color: isDark ? '#94A3B8' : '#000000', fontWeight: 900, textTransform: 'uppercase', marginBottom: '3px' }}>
                  Risk Score
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6BCB77' }}>
                  15.6 / 100
                </div>
              </div>
              <div
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                  boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                  padding: '10px 8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.66rem', color: isDark ? '#94A3B8' : '#000000', fontWeight: 900, textTransform: 'uppercase', marginBottom: '3px' }}>
                  Threat Verdict
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4D96FF' }}>
                  BENIGN
                </div>
              </div>
            </div>

            {/* Live Indicator Banner */}
            <div
              style={{
                fontSize: '0.74rem',
                color: isDark ? '#E2E8F0' : '#000000',
                fontWeight: 700,
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} color="#6BCB77" strokeWidth={3} />
              <span>Passive background scanner monitoring active tab navigation</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Setup Instructions */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#38BDF8', border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000', padding: '6px', display: 'flex' }}>
            <Terminal size={18} color="#000000" strokeWidth={2.8} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', textTransform: 'uppercase', margin: 0 }}>
            3-Step Quick Installation Guide
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Step 1 */}
          <div
            style={{
              background: isDark ? '#141A24' : '#FFFDF5',
              padding: '24px',
              border: isDark ? '2.5px solid rgba(56, 189, 248, 0.4)' : '3px solid #000000',
              boxShadow: isDark ? '6px 6px 0px 0px #000000' : '6px 6px 0px 0px #000000',
              borderRadius: '0px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '0px',
                background: '#38BDF8',
                border: isDark ? '2px solid #FFFFFF' : '2.5px solid #000000',
                boxShadow: isDark ? '2.5px 2.5px 0px 0px #38BDF8' : '2.5px 2.5px 0px 0px #000000',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem',
                marginBottom: '16px'
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', marginBottom: '8px', textTransform: 'uppercase' }}>
              Download &amp; Unzip
            </h3>
            <p style={{ fontSize: '0.85rem', color: isDark ? '#CBD5E1' : '#000000', lineHeight: 1.55, fontWeight: 500, margin: 0 }}>
              Click the download button above to retrieve the package, and extract <code className="mono" style={{ background: isDark ? '#1E293B' : '#38BDF8', border: isDark ? '1px solid #38BDF8' : '1px solid #000000', color: isDark ? '#38BDF8' : '#000000', padding: '1px 5px', fontWeight: 700 }}>CyberGuard-AI-Chrome-Extension.zip</code> into an accessible folder.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: isDark ? '#141A24' : '#FFFDF5',
              padding: '24px',
              border: isDark ? '2.5px solid rgba(56, 189, 248, 0.4)' : '3px solid #000000',
              boxShadow: isDark ? '6px 6px 0px 0px #000000' : '6px 6px 0px 0px #000000',
              borderRadius: '0px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '0px',
                background: '#4D96FF',
                border: isDark ? '2px solid #FFFFFF' : '2.5px solid #000000',
                boxShadow: isDark ? '2.5px 2.5px 0px 0px #38BDF8' : '2.5px 2.5px 0px 0px #000000',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem',
                marginBottom: '16px'
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', marginBottom: '8px', textTransform: 'uppercase' }}>
              Open Extensions Page
            </h3>
            <p style={{ fontSize: '0.85rem', color: isDark ? '#CBD5E1' : '#000000', lineHeight: 1.55, fontWeight: 500, marginBottom: '10px' }}>
              Open Google Chrome and navigate to <code className="mono" style={{ background: isDark ? '#1E293B' : '#38BDF8', border: isDark ? '1px solid #38BDF8' : '1px solid #000000', color: isDark ? '#38BDF8' : '#000000', padding: '1px 5px', fontWeight: 700 }}>chrome://extensions</code>, then toggle on <strong>Developer mode</strong> in the top-right corner.
            </p>
            <button
              onClick={handleCopyChromeUrl}
              style={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: isDark ? '2px solid #38BDF8' : '2px solid #000000',
                boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                borderRadius: '0px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                color: isDark ? '#38BDF8' : '#000000'
              }}
            >
              {copiedUrl ? 'Copied URL!' : 'Copy chrome://extensions'}
            </button>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: isDark ? '#141A24' : '#FFFDF5',
              padding: '24px',
              border: isDark ? '2.5px solid rgba(56, 189, 248, 0.4)' : '3px solid #000000',
              boxShadow: isDark ? '6px 6px 0px 0px #000000' : '6px 6px 0px 0px #000000',
              borderRadius: '0px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '0px',
                background: '#6BCB77',
                border: isDark ? '2px solid #FFFFFF' : '2.5px solid #000000',
                boxShadow: isDark ? '2.5px 2.5px 0px 0px #38BDF8' : '2.5px 2.5px 0px 0px #000000',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem',
                marginBottom: '16px'
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', marginBottom: '8px', textTransform: 'uppercase' }}>
              Load Unpacked
            </h3>
            <p style={{ fontSize: '0.85rem', color: isDark ? '#CBD5E1' : '#000000', lineHeight: 1.55, fontWeight: 500, margin: 0 }}>
              Click <strong>"Load unpacked"</strong> in the top-left and select the extracted folder. CyberGuard is now actively protecting your browser in real time!
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Extension Features Banner */}
      <div style={{ marginTop: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div
            style={{
              background: isDark ? '#141A24' : '#FFFFFF',
              border: isDark ? '2px solid rgba(56, 189, 248, 0.35)' : '2.5px solid #000000',
              boxShadow: isDark ? '4px 4px 0px 0px #000000' : '4px 4px 0px 0px #000000',
              padding: '16px',
              borderRadius: '0px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={16} color={isDark ? '#38BDF8' : '#000000'} strokeWidth={2.8} />
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>Real-Time Intercept</div>
            </div>
            <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.45, fontWeight: 500 }}>
              Evaluates tab transitions instantly before credentials can be submitted to hostile sites.
            </div>
          </div>

          <div
            style={{
              background: isDark ? '#141A24' : '#FFFFFF',
              border: isDark ? '2px solid rgba(56, 189, 248, 0.35)' : '2.5px solid #000000',
              boxShadow: isDark ? '4px 4px 0px 0px #000000' : '4px 4px 0px 0px #000000',
              padding: '16px',
              borderRadius: '0px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Globe size={16} color={isDark ? '#38BDF8' : '#000000'} strokeWidth={2.8} />
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>Autonomous Edge DNS</div>
            </div>
            <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.45, fontWeight: 500 }}>
              Built-in heuristic fallback inspects lookalike domains offline without requiring backend reachability.
            </div>
          </div>

          <div
            style={{
              background: isDark ? '#141A24' : '#FFFFFF',
              border: isDark ? '2px solid rgba(56, 189, 248, 0.35)' : '2.5px solid #000000',
              boxShadow: isDark ? '4px 4px 0px 0px #000000' : '4px 4px 0px 0px #000000',
              padding: '16px',
              borderRadius: '0px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Lock size={16} color={isDark ? '#38BDF8' : '#000000'} strokeWidth={2.8} />
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>Zero Data Tracking</div>
            </div>
            <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.45, fontWeight: 500 }}>
              Operates under strict privacy boundaries. Your browsing history is never recorded or exfiltrated.
            </div>
          </div>

          <div
            style={{
              background: isDark ? '#141A24' : '#FFFFFF',
              border: isDark ? '2px solid rgba(56, 189, 248, 0.35)' : '2.5px solid #000000',
              boxShadow: isDark ? '4px 4px 0px 0px #000000' : '4px 4px 0px 0px #000000',
              padding: '16px',
              borderRadius: '0px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={16} color={isDark ? '#38BDF8' : '#000000'} strokeWidth={2.8} />
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>Deep Web App Sync</div>
            </div>
            <div style={{ fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.45, fontWeight: 500 }}>
              One-click jump from any flagged browser tab directly into CyberGuard's full forensic audit console.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
