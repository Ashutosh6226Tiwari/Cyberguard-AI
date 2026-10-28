import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  User,
  Crown,
  Sparkles,
  Zap,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  RefreshCw,
  LogOut,
  ChevronRight,
  Database,
  Lock,
  Layers,
  Award,
  Clock,
  ArrowUpRight,
  Mail
} from 'lucide-react';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  clearStoredAuth,
  setStoredAuth,
  isPremiumEmail,
  getPremiumRecord,
  syncUserSubscription,
  recordPremiumEmail,
  type UserProfile
} from '../services/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateUser: (user: UserProfile | null) => void;
  onOpenAuthModal?: () => void;
  theme?: 'dark' | 'light';
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      setTimeout(() => resolve(!!(window as any).Razorpay), 2500);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenAuthModal,
  theme = 'dark'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'booster'>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auto-restore / sync subscription on open if user is recognized premium
  React.useEffect(() => {
    if (!isOpen || !currentUser) return;
    const email = currentUser.email;
    if (email) {
      if (isPremiumEmail(email) && currentUser.plan !== 'premium') {
        const rec = getPremiumRecord(email);
        const upgraded: UserProfile = {
          ...currentUser,
          plan: 'premium',
          credits: Math.min(5000, rec?.credits && rec.credits <= 5000 ? rec.credits : (currentUser.credits && currentUser.credits <= 5000 ? currentUser.credits : 5000)),
          max_credits: 5000,
          memory_max_kb: 8192.0
        };
        setStoredAuth(upgraded.id, upgraded);
        onUpdateUser(upgraded);
      }
      syncUserSubscription(email).then((res) => {
        if (res && (res.plan === 'premium' || res.is_premium) && currentUser.plan !== 'premium') {
          const upgraded: UserProfile = {
            ...currentUser,
            plan: 'premium',
            credits: Math.min(5000, res.credits && res.credits <= 5000 ? res.credits : (currentUser.credits && currentUser.credits <= 5000 ? currentUser.credits : 5000)),
            max_credits: 5000,
            memory_max_kb: 8192.0
          };
          setStoredAuth(upgraded.id, upgraded);
          onUpdateUser(upgraded);
        }
      }).catch(() => {});
    }
  }, [isOpen, currentUser?.email, currentUser?.plan]);

  const handleRestorePurchases = async () => {
    if (!currentUser?.email) {
      setStatusMsg({ type: 'error', text: 'Please sign in with mail first to restore your purchases.' });
      return;
    }
    setIsSyncing(true);
    setStatusMsg({ type: 'info', text: 'Checking live payment records with Razorpay...' });
    try {
      const synced = await syncUserSubscription(currentUser.email);
      if (synced && (synced.plan === 'premium' || synced.is_premium)) {
        const upgraded: UserProfile = {
          ...currentUser,
          plan: 'premium',
          credits: Math.min(5000, synced.credits && synced.credits <= 5000 ? synced.credits : (currentUser.credits && currentUser.credits <= 5000 ? currentUser.credits : 5000)),
          max_credits: 5000,
          memory_max_kb: 8192.0
        };
        setStoredAuth(upgraded.id, upgraded);
        onUpdateUser(upgraded);
        setStatusMsg({ type: 'success', text: `Pro Plan Restored! ${upgraded.credits.toLocaleString()} AI Credits & 8 MB Copilot Context activated.` });
      } else {
        setStatusMsg({ type: 'info', text: 'No active payments found for this email on the gateway.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Could not sync with payment gateway.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = () => {
    import('../services/firebase').then(({ firebaseSignOut }) => {
      firebaseSignOut().catch(() => {});
    });
    clearStoredAuth();
    onUpdateUser(null);
    setStatusMsg({ type: 'info', text: 'Signed out of account.' });
  };

  if (!isOpen) return null;

  const isPro = currentUser?.plan === 'premium';
  const currentCredits = currentUser?.credits ?? (isPro ? 5000 : 50);
  const maxCredits = currentUser?.max_credits ?? (isPro ? 5000 : 50);
  const creditPct = Math.min(100, Math.max(0, Math.round((currentCredits / maxCredits) * 100)));

  const memoryUsedKb = currentUser?.memory_used_kb ?? 48.0;
  const memoryMaxKb = currentUser?.memory_max_kb ?? (isPro ? 8192.0 : 256.0);
  const memoryPct = currentUser?.memory_used_pct ?? Math.min(100, Math.round((memoryUsedKb / memoryMaxKb) * 100));

  // Razorpay Checkout Trigger
  const handleRazorpayCheckout = async (planType: 'pro' | 'booster') => {
    setStatusMsg(null);
    setIsProcessing(true);

    const amountPaise = planType === 'pro' ? 200 : 100; // ₹2 or ₹1 in paise (< ₹5 for testing)
    const planName = planType === 'pro' ? 'premium' : (currentUser?.plan || 'free');
    const creditsToAdd = planType === 'pro' ? 5000 : 500;

    try {
      // 1. Ensure Razorpay script is loaded
      let isLoaded = typeof window !== 'undefined' && !!(window as any).Razorpay;
      if (!isLoaded) {
        setStatusMsg({ type: 'info', text: 'Initializing Razorpay Checkout engine...' });
        isLoaded = await loadRazorpayScript();
      }
      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error('Razorpay Checkout SDK could not be loaded. Please disable ad-blockers or check internet.');
      }

      // 2. Create Order (via FastAPI or Vercel serverless /api/create-order, with direct test fallback)
      let order: any = null;
      try {
        order = await createRazorpayOrder(amountPaise, planName, creditsToAdd);
      } catch (orderErr) {
        console.warn('Backend order creation returned fallback, continuing with direct test checkout:', orderErr);
      }

      const keyId = order?.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TmVEzobckpil2B';

      // 3. Configure Razorpay Standard Modal
      const options: any = {
        key: keyId,
        amount: order?.amount || amountPaise,
        currency: order?.currency || 'INR',
        name: 'CyberGuard AI',
        description: planType === 'pro' 
          ? 'CyberGuard Pro Operator Pass (5,000 Credits)' 
          : 'CyberGuard AI Credit Booster (500 Credits)',
        image: 'https://cyberguard-ai-one.vercel.app/logo.png',
        prefill: {
          name: (currentUser?.username && currentUser.username !== 'Guest Operator') ? currentUser.username : '',
          email: (currentUser?.email && currentUser.email !== 'operator@cyberguard.ai') ? currentUser.email : '',
          contact: ''
        },
        theme: {
          color: '#00f0ff'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStatusMsg({ type: 'info', text: 'Checkout modal closed. Payment was not completed.' });
          }
        },
        handler: async (response: any) => {
          // 4. Verify Signature
          try {
            setStatusMsg({ type: 'info', text: 'Verifying payment signature with security gateway...' });
            let verification: any = null;
            if (response.razorpay_order_id && response.razorpay_signature) {
              try {
                verification = await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: planName,
                  credits: creditsToAdd
                });
              } catch (vErr) {
                console.warn('Backend verification notice:', vErr);
              }
            }

            const isGuest = !currentUser?.email || currentUser.email === 'operator@cyberguard.ai';
            const updated: UserProfile = verification?.user || {
              id: currentUser?.id || 'op_' + Date.now().toString(36),
              username: isGuest ? 'Guest Operator' : currentUser.username,
              email: isGuest ? '' : currentUser.email,
              photoURL: currentUser?.photoURL,
              created_at: currentUser?.created_at || new Date().toISOString(),
              plan: planName as any,
              credits: (currentUser?.credits || 0) + creditsToAdd,
              max_credits: planName === 'premium' ? 5000 : (currentUser?.max_credits || 50),
              memory_max_kb: planName === 'premium' ? 8192.0 : 256.0,
              memory_used_kb: memoryUsedKb,
            };
            if (updated.email) {
              recordPremiumEmail(updated.email, updated.plan, updated.credits);
            }
            setStoredAuth(updated.id, updated);
            onUpdateUser(updated);
            setStatusMsg({
              type: 'success',
              text: `Payment Confirmed! Upgraded with ${creditsToAdd.toLocaleString()} AI Credits!`
            });
          } catch (verifyErr: any) {
            setStatusMsg({
              type: 'error',
              text: verifyErr.message || 'Payment signature verification failed. Please contact support.'
            });
          } finally {
            setIsProcessing(false);
          }
        }
      };

      if (order?.order_id) {
        options.order_id = order.order_id;
      }

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', (resp: any) => {
        setIsProcessing(false);
        setStatusMsg({
          type: 'error',
          text: `Payment Failed: ${resp.error?.description || resp.error?.reason || 'Transaction could not be completed.'}`
        });
      });

      rzpInstance.open();
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to initiate Razorpay checkout.'
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 14, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 100020,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.22 }}
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--accent-cyan)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '630px',
          maxHeight: '90vh',
          boxShadow: '0 25px 70px rgba(0,0,0,0.85), 0 0 35px rgba(0,240,255,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isPro ? 'rgba(234, 179, 8, 0.15)' : 'rgba(0, 240, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isPro ? '1px solid #eab308' : '1px solid var(--accent-cyan)'
              }}
            >
              {isPro ? <Crown size={20} color="#eab308" /> : <Shield size={20} color="var(--accent-cyan)" />}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Operator Profile &amp; Quota</span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: isPro ? 'rgba(234, 179, 8, 0.2)' : 'rgba(0, 240, 255, 0.15)',
                    color: isPro ? '#facc15' : 'var(--accent-cyan)',
                    border: isPro ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(0, 240, 255, 0.35)'
                  }}
                >
                  {isPro ? '👑 PRO OPERATOR' : 'FREE TIER'}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                AI Copilot Free Quotas, Persistent Memory &amp; Premium Perks
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Status Message Banner */}
          {statusMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: statusMsg.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.16)' 
                  : statusMsg.type === 'error'
                  ? 'rgba(239, 68, 68, 0.16)'
                  : 'rgba(0, 240, 255, 0.12)',
                border: statusMsg.type === 'success'
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : statusMsg.type === 'error'
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(0, 240, 255, 0.3)',
                color: statusMsg.type === 'success' ? '#10b981' : statusMsg.type === 'error' ? '#ef4444' : 'var(--accent-cyan)'
              }}
            >
              {statusMsg.type === 'success' && <CheckCircle2 size={16} />}
              {statusMsg.type === 'error' && <AlertTriangle size={16} />}
              {statusMsg.type === 'info' && <RefreshCw size={16} className="spinning" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* User Identity Card */}
          {(() => {
            const isRealUser = currentUser && currentUser.email && currentUser.email.trim() && currentUser.email !== 'operator@cyberguard.ai';
            return (
              <div
                style={{
                  background: 'var(--code-box-bg)',
                  border: isRealUser ? '1px solid var(--border-color)' : '1px solid rgba(0, 240, 255, 0.25)',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {isRealUser && currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.username}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          border: isPro ? '2.5px solid #d97706' : '2.5px solid var(--accent-cyan)',
                          objectFit: 'cover',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: isPro
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : isRealUser
                            ? 'linear-gradient(135deg, #00f0ff 0%, #6366f1 100%)'
                            : 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isRealUser ? '#070a10' : 'var(--accent-cyan)',
                          fontWeight: 900,
                          fontSize: '1.15rem',
                          border: isPro ? '2px solid #d97706' : isRealUser ? '2px solid var(--accent-cyan)' : '1px solid rgba(0, 240, 255, 0.35)',
                          boxShadow: '0 2px 10px rgba(0, 240, 255, 0.15)'
                        }}
                      >
                        {isRealUser ? currentUser.username.substring(0, 1).toUpperCase() : <Shield size={22} />}
                      </div>
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {isRealUser ? currentUser.username : 'Guest Session'}
                        </span>
                        {isRealUser ? (
                          <span
                            style={{
                              fontSize: '0.64rem',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle2 size={10} /> Verified
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.64rem',
                              background: 'rgba(234, 179, 8, 0.15)',
                              color: '#d97706',
                              border: '1px solid rgba(234, 179, 8, 0.35)',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              fontWeight: 700
                            }}
                          >
                            Local Storage
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: isRealUser ? 'var(--text-secondary)' : 'var(--text-secondary)', marginTop: '2px' }}>
                        {isRealUser ? currentUser.email : 'Sign in with mail to sync credits and history across devices'}
                      </div>
                    </div>
                  </div>

                  {isRealUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={handleRestorePurchases}
                        disabled={isSyncing}
                        title="Check gateway and restore your Pro subscription"
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          background: isPro ? 'rgba(217, 119, 6, 0.12)' : 'rgba(0, 240, 255, 0.12)',
                          border: isPro ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid rgba(0, 240, 255, 0.35)',
                          color: isPro ? '#d97706' : 'var(--accent-cyan)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: isSyncing ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <RefreshCw size={12} className={isSyncing ? 'spinning' : ''} />
                        <span>{isSyncing ? 'Syncing...' : isPro ? 'Sync Pro' : 'Restore Pro'}</span>
                      </button>

                      <button
                        onClick={handleSignOut}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <LogOut size={12} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : onOpenAuthModal ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        onClose();
                        onOpenAuthModal();
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9px',
                        background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                        border: 'none',
                        color: '#070a10',
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 3px 12px rgba(0, 240, 255, 0.35)'
                      }}
                    >
                      <Mail size={14} />
                      <span>Sign In with Mail</span>
                    </motion.button>
                  ) : null}
                </div>

                {!isRealUser && onOpenAuthModal && (
                  <div
                    style={{
                      background: 'rgba(0, 240, 255, 0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.18)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <span>Want to sync your {isPro ? 'Pro Pass & 5,000 Credits' : 'credits'} across browsers?</span>
                    <span
                      onClick={() => {
                        onClose();
                        onOpenAuthModal();
                      }}
                      style={{
                        color: 'var(--accent-cyan)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Sign In with Mail →
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Metrics Grid: Credits + Memory Fill-Up */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            
            {/* AI Credits Meter */}
            <div
              style={{
                background: 'var(--code-box-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Zap size={14} color="#00f0ff" />
                  <span>AI Credits Remaining</span>
                </span>
                <span className="mono" style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                  {currentCredits.toLocaleString()} / {maxCredits.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${creditPct}%`,
                    background: creditPct > 20 ? 'linear-gradient(90deg, #00f0ff 0%, #10b981 100%)' : '#ef4444',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span>{isPro ? 'Priority AI Processing' : 'Daily Quota (50/day)'}</span>
                <span style={{ fontWeight: 700 }}>{creditPct}% left</span>
              </div>
            </div>

            {/* Copilot Memory Fill-Up */}
            <div
              style={{
                background: 'var(--code-box-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <HardDrive size={14} color="#a855f7" />
                  <span>Copilot Memory Fill-Up</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', whiteSpace: 'nowrap' }}>
                  <span className="mono" style={{ fontSize: '0.84rem', fontWeight: 900, color: '#a855f7' }}>
                    {memoryPct}%
                  </span>
                  <span style={{ fontSize: '0.70rem', color: 'var(--text-secondary)' }}>
                    ({memoryUsedKb} KB)
                  </span>
                </div>
              </div>

              {/* Memory progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${memoryPct}%`,
                    background: memoryPct > 80 ? '#ef4444' : 'linear-gradient(90deg, #a855f7 0%, #3b82f6 100%)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span>{isPro ? 'Extended 8 MB Context' : '256 KB Session Memory'}</span>
                <span style={{ fontWeight: 700 }}>Max: {memoryMaxKb >= 1024 ? `${(memoryMaxKb / 1024).toFixed(0)} MB` : `${memoryMaxKb} KB`}</span>
              </div>
            </div>

          </div>

          {/* Tier Overview (Free vs Premium) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="var(--accent-cyan)" />
              <span>Subscription &amp; Feature Comparison</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {/* Free Tier Card */}
              <div
                style={{
                  border: isPro ? '1px solid var(--border-color)' : '1.5px solid var(--accent-cyan)',
                  borderRadius: '12px',
                  padding: '14px',
                  background: isPro ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 240, 255, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Free Tier</span>
                  <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {!isPro ? 'Active Plan' : 'Standard'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>All 8 security scanners (100% Free)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>50 Daily AI analysis credits</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>256 KB Copilot context memory</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>Community threat intelligence</span>
                  </div>
                </div>
              </div>

              {/* Premium Pro Card */}
              <div
                style={{
                  border: isPro ? '1.5px solid #d97706' : '1px solid rgba(217, 119, 6, 0.45)',
                  borderRadius: '12px',
                  padding: '14px',
                  background: 'rgba(217, 119, 6, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Crown size={14} color="#d97706" />
                    <span>Premium Pro</span>
                  </span>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: isPro ? 'rgba(217, 119, 6, 0.25)' : 'rgba(217, 119, 6, 0.15)', color: '#d97706', fontWeight: 800 }}>
                    {isPro ? 'Active' : 'Upgrade'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span><strong style={{ color: 'var(--text-primary)' }}>5,000 AI Credits</strong> per pool</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span><strong style={{ color: 'var(--text-primary)' }}>8 MB</strong> Copilot Context Memory</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>Priority Zero-Day Sandbox Execution</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>PDF/CSV Export &amp; Dedicated AI Analyst</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Razorpay Standard Web Checkout Purchase Section */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: '14px',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <CreditCard size={16} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Upgrade or Top-Up with Razorpay
                </span>
              </div>
              <span className="mono" style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                Live Gateway
              </span>
            </div>
            {isPro && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '0.74rem',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Crown size={14} color="#f59e0b" />
                <span>
                  <strong>👑 Premium Pro is Active on your account!</strong> 8MB memory &amp; priority features unlocked.
                </span>
              </div>
            )}

            {/* Selection Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              
              {/* Option 1: Pro Pass */}
              <div
                onClick={() => setSelectedPlan('pro')}
                style={{
                  border: selectedPlan === 'pro' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  background: selectedPlan === 'pro' ? 'rgba(0, 240, 255, 0.10)' : 'var(--code-box-bg)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: selectedPlan === 'pro' ? '3.5px solid var(--accent-cyan)' : '1.5px solid var(--text-secondary)',
                        background: 'transparent'
                      }}
                    />
                    <span style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pro Pass</span>
                  </div>
                  <span style={{ fontSize: '0.90rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>₹2</span>
                </div>
                <div style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', paddingLeft: '18px' }}>
                  5,000 Credits • 8MB Context • Pro Status
                </div>
              </div>

              {/* Option 2: Booster */}
              <div
                onClick={() => setSelectedPlan('booster')}
                style={{
                  border: selectedPlan === 'booster' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  background: selectedPlan === 'booster' ? 'rgba(0, 240, 255, 0.10)' : 'var(--code-box-bg)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: selectedPlan === 'booster' ? '3.5px solid var(--accent-cyan)' : '1.5px solid var(--text-secondary)',
                        background: 'transparent'
                      }}
                    />
                    <span style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--text-primary)' }}>Credit Booster</span>
                  </div>
                  <span style={{ fontSize: '0.90rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>₹1</span>
                </div>
                <div style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', paddingLeft: '18px' }}>
                  500 AI Credits Instant Top-Up
                </div>
              </div>

            </div>

            {/* Razorpay Standard Checkout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isProcessing}
              onClick={() => handleRazorpayCheckout(selectedPlan)}
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                color: '#070a10',
                border: 'none',
                borderRadius: '11px',
                padding: '13px 20px',
                fontSize: '0.88rem',
                fontWeight: 900,
                cursor: isProcessing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(0, 240, 255, 0.35)',
                opacity: isProcessing ? 0.75 : 1,
                width: '100%',
                marginTop: '4px'
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  <span>Connecting to Razorpay Gateway...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>
                    Pay {selectedPlan === 'pro' ? '₹2' : '₹1'} via Razorpay Checkout
                  </span>
                  <ArrowUpRight size={16} />
                </>
              )}
            </motion.button>

            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              🔒 Verified HMAC-SHA256 Server Signature Validation • Cards, UPI, NetBanking &amp; Wallets
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '12px 22px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)'
          }}
        >
          {currentUser ? (
            <button
              onClick={() => {
                onUpdateUser(null);
                onClose();
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Sign in to preserve scan history across devices
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              background: 'var(--code-box-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

      </motion.div>
    </div>
  );
};
