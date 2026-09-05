import React, { useState } from 'react';
import { X, Coins, ShieldCheck, ExternalLink, Zap, Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight, Wallet, ArrowDown } from 'lucide-react';
import type { PaymentChallenge, PaymentVerificationResponse } from '../types';
import { verifyAlgorandPayment, executeDemoFaucetPayment } from '../services/api';
import { useAlgorandWallet } from '../context/AlgorandWalletContext';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: PaymentChallenge | null;
  targetUrl: string;
  caseId: string;
  onPaymentSuccess: (verification: PaymentVerificationResponse) => void;
}

export const X402PaymentModal: React.FC<X402PaymentModalProps> = ({
  isOpen,
  onClose,
  challenge,
  targetUrl,
  caseId,
  onPaymentSuccess
}) => {
  const { isConnected, address, balanceAlgo, balanceUsdc, deductBalance, connectDemoWallet } = useAlgorandWallet();
  const [selectedCurrency, setSelectedCurrency] = useState<'ALGO' | 'USDC'>('ALGO');
  const [activeMode, setActiveMode] = useState<'instant' | 'manual'>('instant');
  const [manualTxId, setManualTxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !challenge) return null;

  const handleInstantPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      if (!isConnected) {
        connectDemoWallet();
      }

      // Execute 1-Click Algorand Testnet Dispenser
      const result = await executeDemoFaucetPayment(caseId, targetUrl);
      if (result.verified) {
        deductBalance(selectedCurrency === 'ALGO' ? 0.1 : 0, selectedCurrency === 'USDC' ? 0.01 : 0);
        setVerificationResult(result);
        setTimeout(() => {
          onPaymentSuccess(result);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(result.error_message || 'Verification on Algorand Testnet failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to Algorand Testnet node.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTxId.trim()) {
      setErrorMessage('Please enter a valid Algorand Testnet Transaction ID.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await verifyAlgorandPayment(
        manualTxId.trim(),
        caseId,
        targetUrl,
        challenge.challenge_id
      );
      if (result.verified) {
        setVerificationResult(result);
        setTimeout(() => {
          onPaymentSuccess(result);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(result.error_message || 'Transaction could not be confirmed on Algorand Testnet.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error querying Algorand Testnet Indexer.');
    } finally {
      setIsProcessing(false);
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
          maxWidth: '560px',
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
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.5)', padding: '8px', borderRadius: '10px', color: '#38bdf8' }}>
              <Coins size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  x402 Payment Required
                </h3>
                <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  HTTP 402 PROTOCOL
                </span>
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Algorand Testnet (CAIP-2: algorand:testnet)
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

        {/* Currency Selector (ALGO vs USDC) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={() => setSelectedCurrency('ALGO')}
            style={{
              flex: 1,
              background: selectedCurrency === 'ALGO' ? 'rgba(6, 182, 212, 0.25)' : 'var(--code-box-bg)',
              border: selectedCurrency === 'ALGO' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
              color: selectedCurrency === 'ALGO' ? '#38bdf8' : 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>⚡ 0.1 ALGO (Native)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCurrency('USDC')}
            style={{
              flex: 1,
              background: selectedCurrency === 'USDC' ? 'rgba(6, 182, 212, 0.25)' : 'var(--code-box-bg)',
              border: selectedCurrency === 'USDC' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
              color: selectedCurrency === 'USDC' ? '#38bdf8' : 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>💵 $0.01 USDC (ASA #10458941)</span>
          </button>
        </div>

        {/* HTTP 402 Protocol Challenge & Escrow Transfer Route Box */}
        <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
              ⚡ x402 MICROPAYMENT ROUTING
            </span>
            <span className="mono" style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '8px' }}>
              Facilitator: GoPlausible (Online)
            </span>
          </div>

          {/* Transfer Route Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
            {/* Sender */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>From (Payer Wallet): </span>
                <span className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                  {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : 'Demo Testnet Wallet'}
                </span>
              </div>
              <span className="mono" style={{ color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }}>
                Bal: {balanceAlgo.toFixed(2)} ALGO
              </span>
            </div>

            {/* Transfer arrow & amount */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(56, 189, 248, 0.3)' }} />
              <div style={{ background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #38bdf8', padding: '2px 10px', borderRadius: '12px', color: '#38bdf8', fontWeight: 800, fontSize: '0.72rem' }}>
                Transfer: {selectedCurrency === 'ALGO' ? '0.10 ALGO' : '$0.01 USDC'}
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(56, 189, 248, 0.3)' }} />
            </div>

            {/* Recipient Treasury Escrow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>To (CyberGuard Escrow): </span>
                <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {challenge.recipient_address.slice(0, 12)}...{challenge.recipient_address.slice(-6)}
                </span>
              </div>
              <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                Algorand Testnet
              </span>
            </div>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Target Forensic URL: <strong style={{ color: '#38bdf8' }}>{targetUrl}</strong></span>
            <span className="mono">CAIP-2: algorand:testnet</span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setActiveMode('instant')}
            style={{
              background: activeMode === 'instant' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              border: activeMode === 'instant' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: activeMode === 'instant' ? '#38bdf8' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Zap size={15} /> 1-Click Testnet Sign
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            style={{
              background: activeMode === 'manual' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              border: activeMode === 'manual' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: activeMode === 'manual' ? '#38bdf8' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Lock size={15} /> Enter Testnet TXID
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ef4444' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Confirmation */}
        {verificationResult?.verified && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#10b981' }}>
            <CheckCircle2 size={18} />
            <div>
              <strong>Payment Confirmed on Algorand Testnet!</strong>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Block Round: {verificationResult.block_round} | Unlocking Premium Forensics...
              </div>
            </div>
          </div>
        )}

        {/* Action Content */}
        {activeMode === 'instant' ? (
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
              Broadcasts an exact micro-transaction of <strong>{selectedCurrency === 'ALGO' ? '0.1 ALGO' : '$0.01 USDC (ASA #10458941)'}</strong> directly to the <strong>Algorand Testnet Node</strong> via the <strong>GoPlausible Facilitator</strong> to instantly verify and unlock the full deep audit report.
            </p>

            <button
              disabled={isProcessing || verificationResult?.verified}
              onClick={handleInstantPayment}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: isProcessing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)',
                opacity: isProcessing ? 0.7 : 1
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying on Algorand Block...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Pay {selectedCurrency === 'ALGO' ? '0.1 ALGO' : '$0.01 USDC'} &amp; Unlock Premium Deep Audit</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualVerification}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              If you submitted a {selectedCurrency === 'ALGO' ? '0.1 ALGO' : '0.01 USDC'} transaction via Pera, Defly, or Algorand CLI, paste the transaction hash below:
            </p>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={manualTxId}
                onChange={(e) => setManualTxId(e.target.value)}
                placeholder="e.g. 52-character Algorand TXID or ALGO-TESTNET-..."
                className="mono"
                style={{
                  width: '100%',
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '0.72rem' }}>
              <a
                href="https://dispenser.testnet.algorand.network"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Get Free Testnet ALGO/USDC</span>
                <ExternalLink size={12} />
              </a>
              <span className="mono" style={{ color: 'var(--text-muted)' }}>Pera / Defly Compatible</span>
            </div>

            <button
              type="submit"
              disabled={isProcessing || verificationResult?.verified}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isProcessing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>Verify On-Chain Transaction</span>
            </button>
          </form>
        )}

        {/* Benefits unlocked */}
        <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PREMIUM INTELLIGENCE INCLUDED IN DEEP AUDIT:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#10b981" />
              <span>Full DNS Hierarchy &amp; MX/SPF/DMARC</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#10b981" />
              <span>Playwright Sandbox DOM &amp; Form Traps</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#10b981" />
              <span>Brand-Domain Contradiction (pHash)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#10b981" />
              <span>Gemini AI Threat Explainer &amp; Fixes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
