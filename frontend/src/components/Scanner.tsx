import React, { useState } from 'react';
import { Search, Play, RefreshCw, Sparkles, Zap, Shield, Coins } from 'lucide-react';
import type { BenchmarkSample } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface ScannerProps {
  onScan: (url: string, deep: boolean, forceRefresh: boolean) => void;
  isLoading: boolean;
  benchmarkSamples: BenchmarkSample[];
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, isLoading, benchmarkSamples }) => {
  const [url, setUrl] = useState('');
  const [scanMode, setScanMode] = useState<'free' | 'deep'>('deep');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [selectedSample, setSelectedSample] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onScan(url.trim(), scanMode === 'deep', forceRefresh);
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSample(sampleId);
    const found = benchmarkSamples.find((s) => s.id === sampleId);
    if (found) {
      setUrl(found.url);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Input Row (Stacks vertically on mobile) */}
          <div className="scanner-input-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: 'var(--code-box-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0 16px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Enter domain or URL (e.g. campuskart.shop, github.com, login-paypal.xyz)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="mono"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  padding: '14px 12px'
                }}
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="scanner-submit-btn"
              style={{
                background: isLoading ? '#374151' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0 22px',
                height: '48px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isLoading ? 'none' : '0 0 18px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>{scanMode === 'deep' ? 'Execute Deep Audit (x402)' : 'Run Free Quick Scan'}</span>
                </>
              )}
            </button>
          </div>

          {/* Options & Scan Mode Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setScanMode('deep')}
                style={{
                  background: scanMode === 'deep' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  border: scanMode === 'deep' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: scanMode === 'deep' ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Shield size={14} />
                <span>Premium Deep Audit (x402)</span>
              </button>

              <button
                type="button"
                onClick={() => setScanMode('free')}
                style={{
                  background: scanMode === 'free' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  border: scanMode === 'free' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: scanMode === 'free' ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} />
                <span>Free Quick Scan (Triage)</span>
              </button>
            </div>

            {/* Benchmark Samples Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Demo Target:
              </span>
              <select
                value={selectedSample}
                onChange={(e) => handleSelectSample(e.target.value)}
                disabled={isLoading}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select a Benchmark Case...</option>
                {benchmarkSamples.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    {sample.name} ({sample.category})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
