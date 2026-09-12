import React, { useState } from 'react';
import {
  X,
  Wallet,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Smartphone,
  ArrowRight,
  RefreshCw,
  LogOut,
  QrCode,
  ArrowLeft,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAlgorandWallet, type WalletType, DEFAULT_TESTNET_RECEIVER } from '../context/AlgorandWalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const {
    isConnected,
    address,
    balanceAlgo,
    balanceUsdc,
    walletType,
    isConnecting,
    connectCustomWallet,
    connectPeraWallet,
    connectDeflyWallet,
    connectExodusWallet,
    connectLuteWallet,
    disconnectWallet,
    claimFaucetFunds,
    refreshBalances
  } = useAlgorandWallet();

  const [currentView, setCurrentView] = useState<'select' | 'pera_qr' | 'defly_qr' | 'custom'>('select');
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      connectCustomWallet(customInput.trim());
      setCurrentView('select');
      onClose();
    }
  };

  const handleConnectPera = async () => {
    setCurrentView('pera_qr');
    const result = await connectPeraWallet();
    if (result) {
      setCurrentView('select');
      onClose();
    }
  };

  const handleConnectDefly = async () => {
    setCurrentView('defly_qr');
    const result = await connectDeflyWallet();
    if (result) {
      setCurrentView('select');
      onClose();
    }
  };

  const handleConnectExodus = async () => {
    const result = await connectExodusWallet();
    if (result) {
      setCurrentView('select');
      onClose();
    }
  };

  const handleConnectLute = async () => {
    const result = await connectLuteWallet();
    if (result) {
      setCurrentView('select');
      onClose();
    }
  };

  const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2746fa499d042749f0e019a16c15cf39';

  // Algorand standard deep-link URI for Pera / Defly WalletConnect
  const peraConnectionUri = `algorand://wc?uri=wc:cyberguard-ai-testnet-session-${Date.now()}@2?relay-protocol=irn&projectId=${wcProjectId}&symKey=pera-wc-testnet`;
  const deflyConnectionUri = `defly://wc?uri=wc:cyberguard-ai-testnet-session-${Date.now()}@2?relay-protocol=irn&projectId=${wcProjectId}&symKey=defly-wc-testnet`;

  const shortenedAddress = address
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0b131f',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px',
          padding: '26px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(6, 182, 212, 0.2)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentView !== 'select' && !isConnected ? (
              <button
                onClick={() => setCurrentView('select')}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                title="Back to wallet selection"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.5)', padding: '8px', borderRadius: '10px', color: '#38bdf8' }}>
                <Wallet size={20} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {isConnected ? 'Algorand Wallet Connected' : currentView === 'pera_qr' ? 'Connect Pera Wallet' : currentView === 'defly_qr' ? 'Connect Defly Wallet' : 'Select wallet provider'}
                </h3>
                <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  TESTNET
                </span>
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Protocol: x402 Micropayments | CAIP-2: algorand:testnet
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {isConnected && address ? (
          /* ========================================================================= */
          /* 1. CONNECTED STATE DASHBOARD                                              */
          /* ========================================================================= */
          <div>
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>Active Testnet Session</span>
                </div>
                <span className="badge-info mono" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px' }}>
                  {walletType === 'pera' ? '🟡 Pera Wallet' : walletType === 'defly' ? '🟣 Defly' : walletType === 'exodus' ? '🔷 Exodus' : walletType === 'lute' ? '🟣 Lute' : 'Custom Wallet'}
                </span>
              </div>

              {/* Shortened Address & Copy */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Connected Address:</span>
                  <span className="mono" style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                    {shortenedAddress}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  title="Copy full address"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Balances */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>ALGO Balance</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                    {balanceAlgo.toFixed(2)} ALGO
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>USDC (ASA #10458941)</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                    ${balanceUsdc.toFixed(2)} USDC
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href="https://dispenser.testnet.algorand.network"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#10b981',
                    borderRadius: '10px',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Zap size={14} />
                  <span>Get Free Testnet ALGO</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  onClick={handleRefresh}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Refresh on-chain balance"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>Sync</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`https://lora.algokit.io/testnet/account/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>View on LoRA Explorer</span>
                  <ExternalLink size={13} />
                </a>

                <button
                  onClick={async () => { await disconnectWallet(); }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={14} />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        ) : currentView === 'pera_qr' ? (
          /* ========================================================================= */
          /* 2. PERA WALLETCONNECT QR CODE SCREEN                                      */
          /* ========================================================================= */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '16px', padding: '4px 12px', fontSize: '0.72rem', color: '#eab308', fontWeight: 700, marginBottom: '8px' }}>
                <Smartphone size={14} />
                <span>Pera Mobile WalletConnect</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Scan with Pera Wallet
              </h4>
            </div>

            {/* Pera Network Requirement Note */}
            <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.75rem', color: '#fef08a', lineHeight: 1.4 }}>
              <strong>⚙️ Mobile Network Requirement:</strong> Ensure your Pera Wallet mobile app is set to <strong>TestNet</strong> before scanning: <br />
              <span style={{ color: '#ffffff', opacity: 0.9 }}>
                Pera App &rarr; Settings ⚙️ &rarr; Developer Settings &rarr; Node Settings &rarr; select <strong>TestNet</strong>
              </span>
            </div>

            {/* QR Code Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '16px', borderRadius: '14px', maxWidth: '220px', margin: '0 auto 16px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <QRCodeSVG
                value={peraConnectionUri}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connection Instructions:
              </div>
              <ol style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li>Open the <strong>Pera Wallet</strong> app on your mobile phone.</li>
                <li>Tap the <strong>Scan / QR</strong> button in the top-right corner.</li>
                <li>Point your camera at the QR code above.</li>
                <li>Tap <strong>Approve</strong> in Pera Wallet to authorize the session.</li>
              </ol>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  connectCustomWallet(DEFAULT_TESTNET_RECEIVER || 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY');
                  setCurrentView('select');
                  onClose();
                }}
                style={{
                  width: '100%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} />
                <span>Instant Connect Address (MZM62...6YFY)</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleConnectPera}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={15} />
                  <span>Launch Official Pera Modal</span>
                </button>

                <button
                  onClick={() => setCurrentView('select')}
                  style={{
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : currentView === 'defly_qr' ? (
          /* ========================================================================= */
          /* 3. DEFLY WALLETCONNECT QR CODE SCREEN                                     */
          /* ========================================================================= */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '4px 12px', fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, marginBottom: '8px' }}>
                <Smartphone size={14} />
                <span>Defly Mobile Wallet</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Scan with Defly Wallet
              </h4>
            </div>

            {/* QR Code Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '16px', borderRadius: '14px', maxWidth: '220px', margin: '0 auto 16px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <QRCodeSVG
                value={deflyConnectionUri}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connection Instructions:
              </div>
              <ol style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li>Open the <strong>Defly Wallet</strong> app on your mobile phone.</li>
                <li>Tap <strong>Scan QR</strong> from the top navigation bar.</li>
                <li>Point your camera at the QR code above.</li>
                <li>Tap <strong>Connect</strong> to authorize CyberGuard AI on Testnet.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConnectDefly}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>Authorize Defly Session</span>
              </button>

              <button
                onClick={() => setCurrentView('select')}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 4. WALLET PROVIDER SELECTION LIST (Reference Design)                      */
          /* ========================================================================= */
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
              Choose your preferred wallet provider to authenticate on-chain micropayments. Only supported networks are available.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Option 1: Defly */}
              <button
                onClick={handleConnectDefly}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, fontSize: '0.85rem' }}>
                  ▲
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Defly
                </span>
              </button>

              {/* Option 2: Pera (Primary) */}
              <button
                onClick={handleConnectPera}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ffe600', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', fontWeight: 900, fontSize: '0.85rem' }}>
                  🟡
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Pera
                </span>
              </button>

              {/* Option 3: Exodus */}
              <button
                onClick={handleConnectExodus}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 900, fontSize: '0.85rem' }}>
                  🔷
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Exodus
                </span>
              </button>

              {/* Option 4: Lute */}
              <button
                onClick={handleConnectLute}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontWeight: 900, fontSize: '0.85rem' }}>
                  🟣
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Lute
                </span>
              </button>

              {/* Option 5: Custom Address */}
              <button
                onClick={() => setCurrentView('custom')}
                style={{
                  background: 'transparent',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <Wallet size={15} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Paste Algorand Public Address
                </span>
              </button>
            </div>

            {/* Custom Address Form */}
            {currentView === 'custom' && (
              <form onSubmit={handleCustomSubmit} style={{ marginTop: '14px', background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Enter 58-Character Algorand Testnet Address:
                </label>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY"
                  className="mono"
                  style={{
                    width: '100%',
                    background: 'var(--code-box-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Connect Custom Address
                </button>
              </form>
            )}

            {/* Resources Footer (Exact Reference Layout) */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Resources
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '8px', lineHeight: 1.6 }}>
                <a href="https://goplausible.xyz" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                  &rarr; Learn about x402
                </a>
                <a href="https://github.com/GoPlausible/.github" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                  &rarr; x402 Paywall Examples
                </a>
                <a href="https://facilitator.goplausible.xyz" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                  &rarr; Facilitator API Docs
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
