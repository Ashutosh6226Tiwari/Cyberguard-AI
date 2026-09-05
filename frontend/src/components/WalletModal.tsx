import React, { useState } from 'react';
import { X, Wallet, ShieldCheck, CheckCircle2, Copy, Check, ExternalLink, Zap, Smartphone, ArrowRight, RefreshCw, LogOut } from 'lucide-react';
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
    connectDemoWallet,
    connectCustomWallet,
    connectPeraWallet,
    disconnectWallet,
    claimFaucetFunds
  } = useAlgorandWallet();

  const [activeTab, setActiveTab] = useState<'options' | 'custom'>('options');
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [faucetClaimed, setFaucetClaimed] = useState(false);

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

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      connectCustomWallet(customInput.trim());
      onClose();
    }
  };

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
          background: 'var(--bg-card)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.2)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.5)', padding: '8px', borderRadius: '10px', color: '#38bdf8' }}>
              <Wallet size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {isConnected ? 'Algorand Wallet Connected' : 'Connect Algorand Wallet'}
                </h3>
                <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  TESTNET
                </span>
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                CAIP-2: algorand:testnet
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
          /* Connected State */
          <div>
            {/* Address Box */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Testnet Address</span>
                <span className="badge-safe mono" style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px' }}>
                  {walletType === 'pera' ? 'Pera Wallet' : walletType === 'demo' ? '1-Click Demo' : 'Custom Wallet'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                <span className="mono" style={{ fontSize: '0.8rem', color: '#38bdf8', wordBreak: 'break-all' }}>
                  {address}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copy address"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Balances */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ALGO Balance</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                    {balanceAlgo.toFixed(2)} ALGO
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>USDC Balance (ASA #10458941)</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                    ${balanceUsdc.toFixed(2)} USDC
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleClaimFaucet}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Zap size={16} />
                <span>{faucetClaimed ? '✓ Claimed +5.0 Testnet ALGO & +25.0 USDC!' : '⚡ Claim +5.0 Testnet ALGO Faucet Funds'}</span>
              </button>

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
                  <span>Explorer</span>
                  <ExternalLink size={13} />
                </a>

                <button
                  onClick={disconnectWallet}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    padding: '10px 18px',
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
        ) : (
          /* Disconnected State - Choose Method */
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Connect your Algorand Testnet wallet to authorize autonomous micropayments for deep forensic security audits (0.1 ALGO via x402).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1: 1-Click Demo Wallet (Instant) */}
              <button
                onClick={() => { connectDemoWallet(); onClose(); }}
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                  border: '1px solid #38bdf8',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#0284c7', color: '#ffffff', padding: '10px', borderRadius: '10px' }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      1-Click Testnet Demo Wallet (Recommended for Jury)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Pre-funded with 10.0 ALGO &amp; 50.0 USDC for instant evaluation
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} color="#38bdf8" />
              </button>

              {/* Option 2: Pera / Defly Wallet */}
              <button
                onClick={async () => { await connectPeraWallet(); onClose(); }}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '10px', borderRadius: '10px' }}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Pera / Defly Mobile Wallet
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Connect via mobile app QR code &amp; sign transactions
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} color="var(--text-secondary)" />
              </button>

              {/* Option 3: Custom Address */}
              <button
                onClick={() => setActiveTab('custom')}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '10px', borderRadius: '10px' }}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Custom Algorand Address
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Enter your personal Algorand Testnet public key
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {/* Custom Input Drawer */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCustomSubmit} style={{ marginTop: '16px', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Enter 58-Character Algorand Testnet Address:
                </label>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 7K9X4M2K5P8R1T3V..."
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
