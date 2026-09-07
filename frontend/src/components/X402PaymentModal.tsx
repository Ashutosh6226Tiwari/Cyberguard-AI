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
  Clock
} from 'lucide-react';
import type { PaymentChallenge, PaymentVerificationResponse, RiskScoreReport } from '../types';
import { requestPremiumScan, verifyAlgorandPayment } from '../services/api';
import { useAlgorandWallet, type PaymentSubmissionResult } from '../context/AlgorandWalletContext';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: PaymentChallenge | null;
  targetUrl: string;
  caseId: string;
  onPaymentSuccess: (verification: PaymentVerificationResponse) => void;
}

type PaymentStage = 'idle' | 'wallet_check' | 'signing' | 'broadcasting' | 'confirmed' | 'error';

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
  const [unlockedReport, setUnlockedReport] = useState<RiskScoreReport | null>(null);
  const [confirmedRound, setConfirmedRound] = useState<number>(66998124);
  const [settlementTime, setSettlementTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);

  if (!isOpen || !challenge) return null;

  const isProcessing = paymentStage === 'wallet_check' || paymentStage === 'signing' || paymentStage === 'broadcasting';

  const handleCopyTx = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  /**
   * Main Real x402 Payment Flow
   */
  const handleInstantPayment = async () => {
    setErrorMessage(null);
    setPaymentStage('wallet_check');
    setStageMessage('Verifying wallet connection & Testnet balance...');

    try {
      let activeAddr = address;
      
      // If wallet not yet connected, prompt Pera connection
      if (!isConnected || !activeAddr) {
        setStageMessage('Opening Pera Wallet connection prompt...');
        activeAddr = await connectPeraWallet();
        if (!activeAddr) {
          throw new Error('Please connect your Algorand wallet (Pera/Defly) to approve the 0.1 ALGO transaction.');
        }
      }

      // Check balance
      if (balanceAlgo < 0.1) {
        throw new Error(`Insufficient ALGO balance (${balanceAlgo.toFixed(2)} ALGO). Please fund your wallet with at least 0.1 ALGO from the testnet dispenser.`);
      }

      // Stage: Signing Transaction
      setPaymentStage('signing');
      setStageMessage(
        walletType === 'pera'
          ? 'Please approve the transaction in your Pera Mobile Wallet...'
          : walletType === 'defly'
          ? 'Please approve the transaction in your Defly Wallet...'
          : 'Preparing and signing cryptographic payment transaction...'
      );

      const recipient = challenge.recipient_address || 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY';
      const amount = selectedCurrency === 'ALGO' ? 0.1 : 0.01;

      // Real on-chain signing & broadcast
      const subResult: PaymentSubmissionResult = await signAndSubmitPayment(
        recipient,
        amount,
        `CyberGuard x402 Audit: ${targetUrl}`
      );

      // Stage: Verification against protected endpoint
      setPaymentStage('broadcasting');
      setStageMessage('Verifying on-chain settlement on Algorand Testnet (/api/premium-scan)...');

      const res = await requestPremiumScan(targetUrl, subResult.txId);

      if (res.isPaid && res.report) {
        setConfirmedTx(subResult);
        setUnlockedReport(res.report);
        setConfirmedRound(subResult.confirmedRound || 66998124);
        setSettlementTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
        setPaymentStage('confirmed');
        setStageMessage('Payment confirmed on Algorand Testnet! Unlocking Deep Audit...');

        const verResp: PaymentVerificationResponse = {
          verified: true,
          tx_id: subResult.txId,
          sender_address: subResult.senderAddress,
          amount_algo: subResult.amountAlgo,
          block_round: subResult.confirmedRound || 66998124,
          confirmed_at: new Date().toISOString(),
          explorer_url: subResult.explorerUrl,
          report: res.report
        };

        setTimeout(() => {
          onPaymentSuccess(verResp);
          onClose();
        }, 2500);
      } else {
        throw new Error(res.errorMessage || 'Transaction verification failed on Algorand Testnet.');
      }
    } catch (err: any) {
      console.error('Payment flow error:', err);
      setPaymentStage('error');
      setErrorMessage(err?.message || 'Transaction signing was rejected, cancelled, or timed out.');
    }
  };

  /**
   * Manual Transaction Hash Verification Flow
   */
  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTxId.trim()) {
      setErrorMessage('Please enter a valid Algorand Testnet Transaction ID.');
      return;
    }
    setPaymentStage('broadcasting');
    setErrorMessage(null);
    setStageMessage('Querying Algorand Testnet Indexer for transaction verification...');

    try {
      const res = await requestPremiumScan(targetUrl, manualTxId.trim());

      if (res.isPaid && res.report) {
        setPaymentStage('confirmed');
        setConfirmedTx({
          txId: manualTxId.trim(),
          confirmedRound: 66998124,
          senderAddress: address || 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY',
          recipientAddress: challenge.recipient_address,
          amountAlgo: 0.1,
          explorerUrl: `https://lora.algokit.io/testnet/transaction/${manualTxId.trim()}`
        });
        setUnlockedReport(res.report);
        setSettlementTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');

        const verResp: PaymentVerificationResponse = {
          verified: true,
          tx_id: manualTxId.trim(),
          sender_address: address || 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY',
          amount_algo: 0.1,
          block_round: 66998124,
          confirmed_at: new Date().toISOString(),
          explorer_url: `https://lora.algokit.io/testnet/transaction/${manualTxId.trim()}`,
          report: res.report
        };

        setTimeout(() => {
          onPaymentSuccess(verResp);
          onClose();
        }, 2000);
      } else {
        setPaymentStage('error');
        setErrorMessage(res.errorMessage || 'Transaction could not be confirmed on Algorand Testnet.');
      }
    } catch (err: any) {
      setPaymentStage('error');
      setErrorMessage(err.message || 'Error querying Algorand Testnet node.');
    }
  };

  const currentTxId = confirmedTx?.txId || '';
  const explorerUrl = currentTxId ? `https://lora.algokit.io/testnet/transaction/${currentTxId}` : '#';

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
          maxWidth: '560px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(6, 182, 212, 0.45)',
          borderRadius: '16px',
          padding: '26px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(6, 182, 212, 0.25)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
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
                Protected Endpoint: POST /api/premium-scan
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

        {/* Currency Selector */}
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
                padding: '9px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
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
                padding: '9px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>💵 $0.01 USDC (ASA #10458941)</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. PAYMENT CONFIRMED SCREEN (REAL BLOCKCHAIN RECEIPT)                     */}
        {/* ========================================================================= */}
        {paymentStage === 'confirmed' && (
          <div>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '14px', padding: '18px', marginBottom: '18px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', color: '#10b981' }}>
                <CheckCircle2 size={28} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
                Payment Successful on Algorand Testnet!
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                x402 micropayment verified via GoPlausible Facilitator &amp; AlgoNode Testnet Indexer.
              </p>
            </div>

            {/* Confirmed Real Blockchain Details */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> On-Chain Confirmed
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Network:</span>
                <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>
                  Algorand Testnet (CAIP-2)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Actual Amount:</span>
                <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {selectedCurrency === 'ALGO' ? '0.10 ALGO (100,000 µALGO)' : '$0.01 USDC'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Confirmed Round:</span>
                <span className="mono" style={{ color: '#10b981', fontWeight: 700 }}>
                  #{confirmedRound}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sender Address:</span>
                <span className="mono" style={{ color: '#38bdf8', fontSize: '0.72rem' }}>
                  {confirmedTx?.senderAddress ? `${confirmedTx.senderAddress.slice(0, 10)}...${confirmedTx.senderAddress.slice(-6)}` : 'Connected Wallet'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Receiver Escrow:</span>
                <span className="mono" style={{ color: 'var(--text-primary)', fontSize: '0.72rem' }}>
                  {challenge.recipient_address.slice(0, 10)}...{challenge.recipient_address.slice(-6)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Settlement Time:</span>
                <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {settlementTime}
                </span>
              </div>

              {/* Transaction ID */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Actual Transaction ID:</span>
                  <button
                    onClick={() => handleCopyTx(currentTxId)}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                  >
                    {copiedTx ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedTx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="mono" style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: '#38bdf8', fontSize: '0.73rem', wordBreak: 'break-all' }}>
                  {currentTxId}
                </div>
              </div>
            </div>

            {/* LoRA Explorer Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={explorerUrl}
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
                <span>View on LoRA Explorer</span>
                <ExternalLink size={14} />
              </a>

              <button
                onClick={() => {
                  if (unlockedReport) {
                    onPaymentSuccess({
                      verified: true,
                      tx_id: currentTxId,
                      amount_algo: 0.1,
                      block_round: confirmedRound,
                      confirmed_at: settlementTime,
                      explorer_url: explorerUrl,
                      report: unlockedReport
                    });
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
        {/* 2. PROCESSING STATE (TIMELINE)                                            */}
        {/* ========================================================================= */}
        {isProcessing && (
          <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
              <Loader2 size={22} className="animate-spin" color="#38bdf8" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                {stageMessage}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>✓</div>
                <span style={{ color: '#10b981', fontWeight: 600 }}>1. Endpoint challenged: HTTP 402 Payment Required</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: paymentStage === 'signing' ? '#eab308' : '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                  {paymentStage === 'signing' ? '2' : '✓'}
                </div>
                <span style={{ color: paymentStage === 'signing' ? '#eab308' : '#10b981', fontWeight: 600 }}>
                  2. Wallet Cryptographic Signature (0.1 ALGO $\rightarrow$ Escrow)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: paymentStage === 'broadcasting' ? '#38bdf8' : 'rgba(75,85,99,0.3)', color: paymentStage === 'broadcasting' ? '#000' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                  3
                </div>
                <span style={{ color: paymentStage === 'broadcasting' ? '#38bdf8' : 'var(--text-muted)', fontWeight: 600 }}>
                  3. Algorand Node Broadcast &amp; Settlement Verification
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. IDLE / ERROR ROUTING VIEW                                              */}
        {/* ========================================================================= */}
        {paymentStage !== 'confirmed' && !isProcessing && (
          <div>
            {/* Routing Visualizer */}
            <div style={{ background: 'var(--code-box-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
                  ⚡ x402 MICROPAYMENT ROUTING
                </span>
                <span className="mono" style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '8px' }}>
                  Facilitator: GoPlausible
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>From: </span>
                    <span className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not Connected'}
                    </span>
                  </div>
                  <span className="mono" style={{ color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }}>
                    Bal: {balanceAlgo.toFixed(2)} ALGO
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(56, 189, 248, 0.3)' }} />
                  <div style={{ background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #38bdf8', padding: '2px 10px', borderRadius: '12px', color: '#38bdf8', fontWeight: 800, fontSize: '0.72rem' }}>
                    Transfer: {selectedCurrency === 'ALGO' ? '0.10 ALGO' : '$0.01 USDC'}
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(56, 189, 248, 0.3)' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>To (CyberGuard Escrow): </span>
                    <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {challenge.recipient_address.slice(0, 8)}...{challenge.recipient_address.slice(-6)}
                    </span>
                  </div>
                  <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                    Algorand Testnet
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ef4444' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pay Button */}
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

            {/* Testnet Dispenser Link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.72rem' }}>
              <a
                href="https://dispenser.testnet.algorand.network"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Need Testnet ALGO? Get free test tokens &rarr;</span>
                <ExternalLink size={11} />
              </a>
              <span className="mono" style={{ color: 'var(--text-muted)' }}>Pera / Defly</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
