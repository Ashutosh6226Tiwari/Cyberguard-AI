import React from 'react';
import { Shield, Activity, Database, Radar, Home, Puzzle, Sun, Moon, HelpCircle, Coins, History, LayoutDashboard, Terminal, Wallet } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { useAlgorandWallet } from '../context/AlgorandWalletContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  caseCount: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenAbout: () => void;
  onOpenWalletModal?: () => void;
  onLaunchScanner?: () => void;
  hasActiveReport?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  caseCount,
  theme,
  toggleTheme,
  onOpenAbout,
  onOpenWalletModal,
  onLaunchScanner,
  hasActiveReport = false
}) => {
  const { isConnected, address, balanceAlgo } = useAlgorandWallet();
  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '16px 20px', position: 'relative', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        {/* Brand & Project Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('overview')}>
          <div style={{
            background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)'
          }}>
            <Shield size={24} color="#070a10" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h1 className="cyber-font cyber-glitch neon-cyan-glow" style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                CYBERGUARD AI
              </h1>
              <span className="badge-info mono" style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>
                x402 ALGORAND
              </span>
              <InfoTooltip
                title="CyberGuard AI Platform"
                description="Zero-trust autonomous threat intelligence system that reconstructs full phishing attack chains, detects brand lookalikes, and audits web infrastructure exploitability with x402 Algorand micropayments."
                securityImpact="Protects enterprise employees, website owners, and security teams against credential harvesting and malicious brand spoofs."
                goodVsBad="Green scores (<30) indicate verified safety; high scores (>70) indicate malicious attack campaigns."
                position="bottom"
              />
            </div>
            <p className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              [AI-POWERED WEBSITE SECURITY &amp; THREAT INTELLIGENCE]
            </p>
          </div>
        </div>

        {/* Navigation Tabs (All 7 Required Pages) */}
        <div className="nav-tabs-container" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--nav-bar-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', flexWrap: 'nowrap', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'overview' ? '#0284c7' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Home size={14} /> Overview
          </button>

          <button
            onClick={() => {
              if (activeTab !== 'scanner' && onLaunchScanner) {
                onLaunchScanner();
              } else {
                setActiveTab('scanner');
              }
            }}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'scanner' ? '#0284c7' : 'transparent',
              color: activeTab === 'scanner' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Radar size={14} /> Live Scanner
          </button>

          {hasActiveReport && (
            <button
              onClick={() => setActiveTab('results')}
              style={{
                padding: '7px 11px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'results' ? '#0284c7' : 'transparent',
                color: activeTab === 'results' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <LayoutDashboard size={14} /> Results
            </button>
          )}

          <button
            onClick={() => setActiveTab('x402')}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'x402' ? '#0284c7' : 'transparent',
              color: activeTab === 'x402' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Coins size={14} /> x402 / Premium
          </button>

          <button
            onClick={() => setActiveTab('extension')}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'extension' ? '#0284c7' : 'transparent',
              color: activeTab === 'extension' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Puzzle size={14} /> Extension
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'history' ? '#0284c7' : 'transparent',
              color: activeTab === 'history' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <History size={14} /> Reports ({caseCount})
          </button>

          <button
            onClick={() => setActiveTab('about')}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'about' ? '#0284c7' : 'transparent',
              color: activeTab === 'about' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <HelpCircle size={14} /> How It Works
          </button>
        </div>

        {/* Global Controls & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Algorand Wallet Connection Button */}
          <button
            onClick={onOpenWalletModal}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: isConnected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #38bdf8',
              background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
              color: isConnected ? '#10b981' : '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isConnected ? '0 0 12px rgba(16, 185, 129, 0.2)' : '0 0 15px rgba(6, 182, 212, 0.3)',
              transition: 'all 0.15s'
            }}
            title={isConnected && address ? `Connected: ${address}` : 'Connect Algorand Testnet Wallet'}
          >
            <Wallet size={14} />
            {isConnected && address ? (
              <>
                <span className="mono">{address.slice(0, 5)}...{address.slice(-4)}</span>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem' }}>
                  {balanceAlgo.toFixed(1)} ALGO
                </span>
              </>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('discovery')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: activeTab === 'discovery' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'discovery' ? '#38bdf8' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Discovery Feed - Real-time Certificate Transparency stream"
          >
            <Activity size={14} color="#10b981" />
            <span>NRD Feed</span>
          </button>

          <button
            onClick={toggleTheme}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#38bdf8" />}
          </button>
        </div>
      </div>
    </header>
  );
};
