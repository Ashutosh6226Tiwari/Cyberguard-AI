import React, { useState } from 'react';
import {
  X,
  Coins,
  ShieldCheck,
  ExternalLink,
  Zap,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Wallet,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  QrCode
} from 'lucide-react';
import type { PaymentChallenge, PaymentVerificationResponse } from '../types';
import { verifyAlgorandPayment, executeDemoFaucetPayment } from '../services/api';
import { useAlgorandWallet, type PaymentSubmissionResult } from '../context/AlgorandWalletContext';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: PaymentChallenge | null;
  targetUrl: string;
  caseId: string;
  onPaymentSuccess: (verification: PaymentVerificationResponse) => void;
}

type PaymentStage = 'idle' | 'preparing' | 'signing' | 'broadcasting' | 'confirmed' | 'error';

export const X402PaymentModal: React.FC<X402PaymentModalProps> = ({
  isOpen,
  onClose,
  challenge,
  targetUrl,
  caseId,
  onPaymentSuccess
}) => {
  const {
    isConnected,
    address,
    balanceAlgo,
    balanceUsdc,
    walletType,
    connectDemoWallet,
    connectPeraWallet,
    connectDeflyWallet,
    signAndSubmitPayment
  } = useAlgorandWallet();

  const [selectedCurrency, setSelectedCurrency] = useState<'ALGO' | 'USDC'>('ALGO');
  const [activeMode, setActiveMode] = useState<'instant' | 'manual'>('instant');
  const [manualTxId, setManualTxId] = useState('');
  const [paymentStage, setPaymentStage] = useState<PaymentStage>('idle');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [confirmedTx, setConfirmedTx] = useState<PaymentSubmissionResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);

  if (!isOpen || !challenge) return null;

  const isProcessing = paymentStage === 'preparing' || paymentStage === 'signing' || paymentStage === 'broadcasting';

  const handleCopyTx = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  /**
   * Main x402 Payment Execution Flow
   */
  const handleInstantPayment = async () => {
    setErrorMessage(null);
    setPaymentStage('preparing');
    setStageMessage('Initializing Algorand Testnet node handshake...');

    try {
      // 1. Auto-connect demo if no wallet is connected yet
      if (!isConnected) {
        connectDemoWallet();
      }

      // 2. Stage: Building & Signing Transaction
      setPaymentStage('signing');
      setStageMessage(
        walletType === 'pera'
          ? 'Requesting cryptographic signature in Pera Mobile Wallet...'
          : walletType === 'defly'
          ? 'Authorizing transaction in Defly Wallet...'
          : 'Generating and signing 0.1 ALGO payment transaction...'
      );

      const recipientAddr = challenge.recipient_address || 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY';
      const amount = selectedCurrency === 'ALGO' ? 0.1 : 0.01;

      // Real on-chain signing & broadcasting via Algorand Testnet
      const subResult: PaymentSubmissionResult = await signAndSubmitPayment(
        recipientAddr,
        amount,
        `CyberGuard AI x402 Deep Audit: ${caseId}`
      );

      // 3. Stage: Node Consensus & Verification
      setPaymentStage('broadcasting');
      setStageMessage('Verifying confirmed block round with Algorand Testnet Indexer...');

      const verResult = await verifyAlgorandPayment(
        subResult.txId,
        caseId,
        targetUrl,
        challenge.challenge_id
      );

      if (verResult.verified) {
        setConfirmedTx(subResult);
        setVerificationResult(verResult);
        setPaymentStage('confirmed');
        setStageMessage('Payment confirmed! Unlocking full forensic deep audit...');

        // Smoothly auto-forward after showing the confirmation receipt
        setTimeout(() => {
          onPaymentSuccess(verResult);
          onClose();
        }, 2200);
      } else {
        throw new Error(verResult.error_message || 'Transaction could not be verified on Algorand Testnet.');
      }
    } catch (err: any) {
      console.error('x402 Payment error:', err);
      setPaymentStage('error');
      setErrorMessage(err?.message || 'Payment execution failed or was cancelled.');
    }
  };

  /**
   * Manual TXID Verification Flow
   */
  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTxId.trim()) {
      setErrorMessage('Please enter a valid Algorand Testnet Transaction ID.');
      return;
    }
    setPaymentStage('broadcasting');
    setErrorMessage(null);
    setStageMessage('Querying Algorand Testnet Indexer for transaction proof...');

    try {
      const result = await verifyAlgorandPayment(
        manualTxId.trim(),
        caseId,
        targetUrl,
        challenge.challenge_id
      );

      if (result.verified) {
        setVerificationResult(result);
        setPaymentStage('confirmed');
        setTimeout(() => {
          onPaymentSuccess(result);
          onClose();
        }, 1800);
      } else {
        setPaymentStage('error');
        setErrorMessage(result.error_message || 'Transaction could not be confirmed on Algorand Testnet.');
      }
    } catch (err: any) {
      setPaymentStage('error');
      setErrorMessage(err.message || 'Error querying Algorand Testnet node.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(14px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={() => {
        if (!isProcessing) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(6, 182, 212, 0.45)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(6, 182, 212, 0.25)',
          position: 'relative',
          maxHeight: '92vh',
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
                  x402 Micropayment Required
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

          {!isProcessing && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Currency Selector (ALGO vs USDC) */}
        {paymentStage !== 'confirmed' && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setSelectedCurrency('ALGO')}
              style={{
                flex: 1,
                background: selectedCurrency === 'ALGO' ? 'rgba(6, 182, 212, 0.25)' : 'var(--code-box-bg)',
                border: selectedCurrency === 'ALGO' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                color: selectedCurrency === 'ALGO' ? '#38bdf8' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>⚡ 0.1 ALGO (Native Algorand)</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setSelectedCurrency('USDC')}
              style={{
                flex: 1,
                background: selectedCurrency === 'USDC' ? 'rgba(6, 182, 212, 0.25)' : 'var(--code-box-bg)',
                border: selectedCurrency === 'USDC' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                color: selectedCurrency === 'USDC' ? '#38bdf8' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>💵 $0.01 USDC (ASA #10458941)</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAYMENT CONFIRMED SCREEN (RECEIPT CARD)                                   */}
        {/* ========================================================================= */}
        {paymentStage === 'confirmed' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '14px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#10b981' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
                x402 Micropayment Confirmed!
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Transaction cryptographically verified on Algorand Testnet. Deep audit unlocked.
              </p>
            </div>

            {/* Confirmed Details Table */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
              {/* Confirmed Round */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Confirmed Block Round:</span>
                <span className="mono" style={{ color: '#10b981', fontWeight: 700 }}>
                  #{verificationResult?.block_round || confirmedTx?.confirmedRound || 66998124}
                </span>
              </div>

              {/* Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Settled:</span>
                <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>
                  {selectedCurrency === 'ALGO' ? '0.10 ALGO' : '$0.01 USDC'} (x402 Micropayment)
                </span>
              </div>

              {/* Transaction ID */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Algorand Transaction ID:</span>
                  <button
                    onClick={() => handleCopyTx(verificationResult?.tx_id || confirmedTx?.txId || '')}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                  >
                    {copiedTx ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedTx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="mono" style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: '#38bdf8', fontSize: '0.73rem', wordBreak: 'break-all' }}>
                  {verificationResult?.tx_id || confirmedTx?.txId}
                </div>
              </div>

              {/* Recipient Address */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Escrow Recipient:</span>
                <span className="mono" style={{ color: 'var(--text-primary)', fontSize: '0.72rem' }}>
                  {challenge.recipient_address.slice(0, 10)}...{challenge.recipient_address.slice(-6)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={`https://lora.algokit.io/testnet/transaction/${verificationResult?.tx_id || confirmedTx?.txId}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  background: 'var(--code-box-bg)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>View On-Chain on Lora Explorer</span>
                <ExternalLink size={14} />
              </a>

              <button
                onClick={() => {
                  if (verificationResult) {
                    onPaymentSuccess(verificationResult);
                  }
                  onClose();
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Sparkles size={18} />
                <span>Access Full Deep Forensic Audit Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACTIVE MULTI-STAGE PROGRESS TIMELINE                                      */}
        {/* ========================================================================= */}
        {isProcessing && (
          <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
              <Loader2 size={24} className="animate-spin" color="#38bdf8" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                {stageMessage}
              </span>
            </div>

            {/* 5-Step Visual Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                  ✓
                </div>
                <span style={{ color: '#10b981', fontWeight: 600 }}>1. Algorand Testnet Node Handshake</span>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: paymentStage === 'preparing' ? 'rgba(56, 189, 248, 0.3)' : '#10b981', color: paymentStage === 'preparing' ? '#38bdf8' : '#000', border: paymentStage === 'preparing' ? '1px solid #38bdf8' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                  {paymentStage === 'preparing' ? '2' : '✓'}
                </div>
                <span style={{ color: paymentStage === 'preparing' ? '#38bdf8' : '#10b981', fontWeight: 600 }}>
                  2. Microtransaction Formed (0.1 ALGO $\rightarrow$ Escrow)
                </span>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: paymentStage === 'signing' ? 'rgba(234, 179, 8, 0.3)' : paymentStage === 'broadcasting' ? '#10b981' : 'rgba(75, 85, 99, 0.3)', color: paymentStage === 'signing' ? '#facc15' : paymentStage === 'broadcasting' ? '#000' : 'var(--text-muted)', border: paymentStage === 'signing' ? '1px solid #facc15' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                  {paymentStage === 'broadcasting' ? '✓' : '3'}
                </div>
                <span style={{ color: paymentStage === 'signing' ? '#facc15' : paymentStage === 'broadcasting' ? '#10b981' : 'var(--text-muted)', fontWeight: paymentStage === 'signing' ? 700 : 500 }}>
                  3. {walletType === 'pera' ? 'Pera Mobile Cryptographic Signature' : walletType === 'defly' ? 'Defly Signature Authorization' : 'Cryptographic Transaction Signing'}
                </span>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: paymentStage === 'broadcasting' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(75, 85, 99, 0.3)', color: paymentStage === 'broadcasting' ? '#38bdf8' : 'var(--text-muted)', border: paymentStage === 'broadcasting' ? '1px solid #38bdf8' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                  4
                </div>
                <span style={{ color: paymentStage === 'broadcasting' ? '#38bdf8' : 'var(--text-muted)', fontWeight: paymentStage === 'broadcasting' ? 700 : 500 }}>
                  4. Algonode Broadcast &amp; Block Round Consensus
                </span>
              </div>

              {/* Step 5 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(75, 85, 99, 0.3)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                  5
                </div>
                <span style={{ color: 'var(--text-muted)' }}>
                  5. x402 Deep Forensic Audit Unlocked
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STANDARD PAYMENT ROUTING BOX (WHEN IDLE OR ERROR)                         */}
        {/* ========================================================================= */}
        {paymentStage !== 'confirmed' && !isProcessing && (
          <div>
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
                  <div style={{ background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #38bdf8', padding: '3px 12px', borderRadius: '12px', color: '#38bdf8', fontWeight: 800, fontSize: '0.75rem' }}>
                    Transfer: {selectedCurrency === 'ALGO' ? '0.10 ALGO (100,000 µALGO)' : '$0.01 USDC'}
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(56, 189, 248, 0.3)' }} />
                </div>

                {/* Recipient Treasury Escrow */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>To (CyberGuard Escrow): </span>
                    <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {challenge.recipient_address.slice(0, 10)}...{challenge.recipient_address.slice(-6)}
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

            {/* Action Content */}
            {activeMode === 'instant' ? (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                  Broadcasts an exact micro-transaction of <strong>{selectedCurrency === 'ALGO' ? '0.1 ALGO' : '$0.01 USDC (ASA #10458941)'}</strong> directly to the <strong>Algorand Testnet Node</strong> to instantly verify and unlock the full deep audit report.
                </p>

                <button
                  disabled={isProcessing}
                  onClick={handleInstantPayment}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Pay {selectedCurrency === 'ALGO' ? '0.1 ALGO' : '$0.01 USDC'} &amp; Unlock Premium Deep Audit</span>
                  <ArrowRight size={16} />
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
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={16} />
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
        )}
      </div>
    </div>
  );
};
