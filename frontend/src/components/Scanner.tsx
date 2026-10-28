import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, RefreshCw, Shield } from 'lucide-react';
import type { BenchmarkSample } from '../types';

interface ScannerProps {
  onScan: (url: string, deep: boolean, forceRefresh: boolean) => void;
  isLoading: boolean;
  benchmarkSamples: BenchmarkSample[];
  scannerFocus?: 'developer' | 'phishing';
  onScannerFocusChange?: (focus: 'developer' | 'phishing') => void;
  theme?: 'dark' | 'light';
}

export const Scanner: React.FC<ScannerProps> = ({
  onScan,
  isLoading,
  benchmarkSamples,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const [url, setUrl] = useState('');
  const [selectedSample, setSelectedSample] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onScan(url.trim(), true, false);
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSample(sampleId);
    const found = benchmarkSamples.find((s) => s.id === sampleId);
    if (found) {
      setUrl(found.url);
    }
  };

  // Comprehensive targets spanning developer hardening & phishing detection
  const quickTargets = [
    { label: 'psit.ac.in (Edu Portal)', url: 'https://psit.ac.in' },
    { label: 'github.com (Hardened A+)', url: 'https://github.com' },
    { label: 'PayPal Spoof (.xyz)', url: 'http://login-paypal-security-verification.xyz/auth/signin' },
    { label: 'Microsoft 365 Fake (.top)', url: 'http://microsoft-onedrive-sharepoint-verify.top/login.php' },
    { label: 'campuskart.shop (43d NRD)', url: 'https://campuskart.shop' },
    { label: 'example.com (Baseline)', url: 'http://example.com' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: isDark ? '#1A1A1A' : '#FFFFFF',
        borderRadius: '0px',
        boxShadow: isDark ? '8px 8px 0px 0px #38BDF8' : '8px 8px 0px 0px #000000',
        border: isDark ? '4px solid #FFFFFF' : '4px solid #000000',
        padding: '28px 24px',
        margin: '0 0 24px 0',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Main Input Row -> Neo-Brutalist Solid Input + Hard Action Button */}
          <div className="scanner-input-row" style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                flex: '1 1 320px',
                display: 'flex',
                alignItems: 'center',
                background: isDark ? '#121212' : '#FFFFFF',
                boxShadow: isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000',
                border: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
                borderRadius: '0px',
                padding: '0 16px',
                height: '54px'
              }}
            >
              <Search size={20} color={isDark ? '#38BDF8' : '#000000'} />
              <input
                type="text"
                placeholder="Enter website domain or URL (e.g. psit.ac.in, github.com, login-paypal-verify.xyz)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: '0.94rem',
                  padding: '12px 14px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600
                }}
              />
              {url && !isLoading && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  style={{
                    background: '#38BDF8',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    padding: '4px 10px',
                    borderRadius: '0px',
                    fontWeight: 800,
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  CLEAR
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ translateY: isLoading || !url.trim() ? 0 : -2, boxShadow: isLoading || !url.trim() ? 'none' : (isDark ? '6px 6px 0px 0px #38BDF8' : '6px 6px 0px 0px #000000') }}
              whileTap={{ transform: isLoading || !url.trim() ? 'none' : 'translate(2px, 2px)', boxShadow: isLoading || !url.trim() ? 'none' : (isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000') }}
              type="submit"
              disabled={isLoading || !url.trim()}
              style={{
                background: isLoading ? (isDark ? '#334155' : '#CBD5E1') : '#4D96FF',
                color: '#FFFFFF',
                border: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
                borderRadius: '0px',
                padding: '0 26px',
                height: '54px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isLoading || !url.trim() ? 'none' : (isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000'),
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '0.02em'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>AUDITING DEFENSE &amp; THREATS...</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  <span>RUN SECURITY SCAN &amp; AUDIT</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Options & Scan Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: isDark ? '#064E3B' : '#6BCB77',
                  boxShadow: isDark ? '3px 3px 0px 0px #34D399' : '3px 3px 0px 0px #000000',
                  border: isDark ? '2px solid #34D399' : '2px solid #000000',
                  borderRadius: '0px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: isDark ? '#34D399' : '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                <Shield size={14} />
                <span>Dual-Engine: Defensive Webmaster Hardening + Phishing Intelligence</span>
              </div>
            </div>

            {/* Benchmark Samples Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: isDark ? '#FFFFFF' : '#000000', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                DEMO TARGET:
              </span>
              <select
                value={selectedSample}
                onChange={(e) => handleSelectSample(e.target.value)}
                disabled={isLoading}
                style={{
                  background: isDark ? '#1E1E1E' : '#FFFFFF',
                  boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                  borderRadius: '0px',
                  color: isDark ? '#FFFFFF' : '#000000',
                  padding: '8px 14px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700
                }}
              >
                <option value="" style={{ background: isDark ? '#1E1E1E' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#000000' }}>Select a Benchmark Case...</option>
                {benchmarkSamples.map((sample) => (
                  <option key={sample.id} value={sample.id} style={{ background: isDark ? '#1E1E1E' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#000000' }}>
                    {sample.name} ({sample.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick 1-Tap Target Benchmark Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.74rem', color: isDark ? '#FFFFFF' : '#000000', fontWeight: 900, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
              QUICK TARGETS:
            </span>
            {quickTargets.map((tgt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ translateY: -1, boxShadow: isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000' }}
                whileTap={{ transform: 'translate(1px, 1px)', boxShadow: isDark ? '1px 1px 0px 0px #38BDF8' : '1px 1px 0px 0px #000000' }}
                type="button"
                onClick={() => { setUrl(tgt.url); }}
                style={{
                  background: url === tgt.url ? '#38BDF8' : (isDark ? '#1E1E1E' : '#FFFDF5'),
                  boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                  color: url === tgt.url ? '#000000' : (isDark ? '#FFFFFF' : '#000000'),
                  borderRadius: '0px',
                  padding: '6px 14px',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                  transition: 'background 0.15s ease',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800
                }}
              >
                <span>{tgt.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </form>
    </motion.div>
  );
};
