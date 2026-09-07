import React from 'react';
import { motion } from 'framer-motion';
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
        <div className="nav-tabs-container" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--nav-bar-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'nowrap', overflowX: 'auto' }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'overview' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: activeTab === 'overview' ? '0 0 14px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Home size={14} /> Overview
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (activeTab !== 'scanner' && onLaunchScanner) {
                onLaunchScanner();
              } else {
                setActiveTab('scanner');
              }
            }}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'scanner' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
              color: activeTab === 'scanner' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: activeTab === 'scanner' ? '0 0 14px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Radar size={14} /> Live Scanner
          </motion.button>

          {hasActiveReport && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('results')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'results' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
                color: activeTab === 'results' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: activeTab === 'results' ? '0 0 14px rgba(2, 132, 199, 0.4)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <LayoutDashboard size={14} /> Results
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('x402')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'x402' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
              color: activeTab === 'x402' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: activeTab === 'x402' ? '0 0 14px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Coins size={14} /> x402 / Premium
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('extension')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'extension' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
              color: activeTab === 'extension' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: activeTab === 'extension' ? '0 0 14px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Puzzle size={14} /> Extension
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('history')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'history' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
              color: activeTab === 'history' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: activeTab === 'history' ? '0 0 14px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <History size={14} /> Reports ({caseCount})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('about')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'about' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
              color: activeTab === 'about' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: activeTab === 'about' ? '0 0 14px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <HelpCircle size={14} /> How It Works
          </motion.button>
        </div>

        {/* Global Controls & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Algorand Wallet Connection Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenWalletModal}
            style={{
              padding: '8px 15px',
              borderRadius: '10px',
              border: isConnected ? '1px solid rgba(0, 255, 136, 0.5)' : '1px solid #00f0ff',
              background: isConnected ? 'rgba(0, 255, 136, 0.12)' : 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
              color: isConnected ? '#00ff88' : '#00f0ff',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isConnected ? '0 0 14px rgba(0, 255, 136, 0.3)' : '0 0 16px rgba(0, 240, 255, 0.35)',
              transition: 'all 0.2s'
            }}
            title={isConnected && address ? `Connected: ${address}` : 'Connect Algorand Testnet Wallet'}
          >
            <Wallet size={14} />
            {isConnected && address ? (
              <>
                <span className="mono">{address.slice(0, 5)}...{address.slice(-4)}</span>
                <span style={{ background: 'rgba(0, 255, 136, 0.2)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                  {balanceAlgo.toFixed(1)} ALGO
                </span>
              </>
            ) : (
              <span>Connect Wallet</span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('discovery')}
            style={{
              padding: '8px 13px',
              borderRadius: '10px',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              background: activeTab === 'discovery' ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
              color: '#f97316',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Discovery Feed - Real-time Certificate Transparency stream"
          >
            <Activity size={14} color="#f97316" />
            <span>NRD Feed</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            style={{
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--code-box-bg)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#00f0ff" />}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
