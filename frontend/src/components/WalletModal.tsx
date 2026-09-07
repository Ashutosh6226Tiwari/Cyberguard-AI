import React, { useState } from 'react';
import {
  X,
  Wallet,
  ShieldCheck,
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
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAlgorandWallet } from '../context/AlgorandWalletContext';

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
    connectDemoWallet,
    connectCustomWallet,
    connectPeraWallet,
    connectDeflyWallet,
    disconnectWallet,
    claimFaucetFunds,
    refreshBalances
  } = useAlgorandWallet();

  const [currentView, setCurrentView] = useState<'select' | 'pera_qr' | 'defly_qr' | 'custom'>('select');
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [faucetClaimed, setFaucetClaimed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimFaucet = () => {
    claimFaucetFunds();
    setFaucetClaimed(true);
    setTimeout(() => setFaucetClaimed(false), 2500);
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

  const handleConnectPeraDirect = async () => {
    setCurrentView('pera_qr');
    const result = await connectPeraWallet();
    if (result) {
      setCurrentView('select');
      onClose();
    }
  };

  const handleConnectDeflyDirect = async () => {
    setCurrentView('defly_qr');
    const result = await connectDeflyWallet();
    if (result) {
      setCurrentView('select');
      onClose();
    }
  };

  // Algorand standard deep-link URI for Pera / Defly WalletConnect
  const peraConnectionUri = `algorand://wc?uri=wc:cyberguard-ai-testnet-session-${Date.now()}@2?relay-protocol=irn&symKey=pera-wc-testnet`;
  const deflyConnectionUri = `defly://wc?uri=wc:cyberguard-ai-testnet-session-${Date.now()}@2?relay-protocol=irn&symKey=defly-wc-testnet`;

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
          maxWidth: '540px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.2)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
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
                <Wallet size={22} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {isConnected ? 'Algorand Wallet Connected' : currentView === 'pera_qr' ? 'Connect Pera Wallet' : currentView === 'defly_qr' ? 'Connect Defly Wallet' : 'Connect Algorand Wallet'}
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
          /* 1. CONNECTED STATE                                                        */
          /* ========================================================================= */
          <div>
            {/* Status Card */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>Active Testnet Session</span>
                </div>
                <span className="badge-info mono" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px' }}>
                  {walletType === 'pera' ? '🟡 Pera Wallet' : walletType === 'defly' ? '🟣 Defly Wallet' : walletType === 'demo' ? '⚡ 1-Click Demo' : 'Custom Wallet'}
                </span>
              </div>

              {/* Address Box */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span className="mono" style={{ fontSize: '0.82rem', color: '#38bdf8', wordBreak: 'break-all' }}>
                  {address}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copy address"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Balances */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>ALGO Balance</div>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                    {balanceAlgo.toFixed(2)} ALGO
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>USDC (ASA #10458941)</div>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                    ${balanceUsdc.toFixed(2)} USDC
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleClaimFaucet}
                  style={{
                    flex: 1,
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
                  <Zap size={15} />
                  <span>{faucetClaimed ? '✓ Claimed +5.0 ALGO!' : '⚡ Faucet (+5 ALGO)'}</span>
                </button>

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
                  <span>View on Lora Explorer</span>
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
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '16px', padding: '4px 12px', fontSize: '0.72rem', color: '#eab308', fontWeight: 700, marginBottom: '10px' }}>
                <Smartphone size={14} />
                <span>Pera Mobile WalletConnect</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Scan with Pera Wallet
              </h4>
            </div>

            {/* QR Code Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '20px', borderRadius: '14px', maxWidth: '240px', margin: '0 auto 20px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <QRCodeSVG
                value={peraConnectionUri}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connection Instructions:
              </div>
              <ol style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li>Open the <strong>Pera Wallet</strong> app on your mobile device.</li>
                <li>Tap the <strong>Scan / QR</strong> button in the top-right corner.</li>
                <li>Point your camera at the QR code above.</li>
                <li>Tap <strong>Approve</strong> in Pera Wallet to establish a session.</li>
              </ol>
            </div>

            {/* Status & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Waiting for wallet connection approval...</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConnectPeraDirect}
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
        ) : currentView === 'defly_qr' ? (
          /* ========================================================================= */
          /* 3. DEFLY WALLETCONNECT QR CODE SCREEN                                     */
          /* ========================================================================= */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '4px 12px', fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, marginBottom: '10px' }}>
                <Smartphone size={14} />
                <span>Defly Mobile Wallet</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Scan with Defly Wallet
              </h4>
            </div>

            {/* QR Code Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '20px', borderRadius: '14px', maxWidth: '240px', margin: '0 auto 20px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <QRCodeSVG
                value={deflyConnectionUri}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connection Instructions:
              </div>
              <ol style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li>Open the <strong>Defly Wallet</strong> app on your mobile device.</li>
                <li>Tap <strong>Scan QR</strong> from the top navigation bar.</li>
                <li>Point your camera at the QR code above.</li>
                <li>Tap <strong>Connect</strong> to authorize CyberGuard AI on Testnet.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConnectDeflyDirect}
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
          /* 4. WALLET PROVIDER SELECTION LIST                                         */
          /* ========================================================================= */
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Select your Algorand wallet provider to authenticate on-chain micropayments for Deep Forensic Security Audits (0.1 ALGO via x402).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1: Pera Wallet (Primary) */}
              <button
                onClick={() => setCurrentView('pera_qr')}
                style={{
                  background: 'radial-gradient(circle at 0% 0%, rgba(234, 179, 8, 0.15) 0%, var(--code-box-bg) 70%)',
                  border: '1px solid rgba(234, 179, 8, 0.5)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ffe600', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', fontWeight: 900, fontSize: '1.2rem', flexShrink: 0 }}>
                    🟡
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Pera Mobile Wallet
                      </span>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '1px 6px', borderRadius: '8px', fontWeight: 700 }}>
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="mono" style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      QR Code &amp; WalletConnect pairing on Testnet
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eab308', fontSize: '0.8rem', fontWeight: 700 }}>
                  <QrCode size={18} />
                  <ArrowRight size={16} />
                </div>
              </button>

              {/* Option 2: Defly Wallet */}
              <button
                onClick={() => setCurrentView('defly_qr')}
                style={{
                  background: 'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.15) 0%, var(--code-box-bg) 70%)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, fontSize: '1.2rem', flexShrink: 0 }}>
                    🟣
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Defly Wallet
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Mobile Algorand DeFi wallet with QR authorization
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontSize: '0.8rem', fontWeight: 700 }}>
                  <QrCode size={18} />
                  <ArrowRight size={16} />
                </div>
              </button>

              {/* Option 3: 1-Click Testnet Demo Dispenser (For instant Evaluation) */}
              <button
                onClick={() => { connectDemoWallet(); onClose(); }}
                style={{
                  background: 'radial-gradient(circle at 0% 0%, rgba(6, 182, 212, 0.15) 0%, var(--code-box-bg) 70%)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                    <Zap size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        1-Click Testnet Demo (Hackathon Jury)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Pre-loaded with 10.0 ALGO &amp; 50.0 USDC for instant testing
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} color="#38bdf8" />
              </button>

              {/* Option 4: Custom Public Address */}
              <button
                onClick={() => setCurrentView('custom')}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Wallet size={18} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Enter Custom Algorand Public Address
                  </span>
                </div>
                <ArrowRight size={15} color="var(--text-muted)" />
              </button>
            </div>

            {/* Custom Address Form */}
            {currentView === 'custom' && (
              <form onSubmit={handleCustomSubmit} style={{ marginTop: '16px', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
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
                    marginBottom: '12px',
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
          </div>
        )}
      </div>
    </div>
  );
};
