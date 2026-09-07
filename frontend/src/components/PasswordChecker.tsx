import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Eye, EyeOff, ShieldCheck, ShieldAlert, Lock, Hash, AlertCircle } from 'lucide-react';

interface PasswordCheckerProps {
  theme: 'dark' | 'light';
}

export const PasswordChecker: React.FC<PasswordCheckerProps> = ({ theme }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [entropy, setEntropy] = useState(0);
  const [crackTime, setCrackTime] = useState('Instant');
  const [strengthLabel, setStrengthLabel] = useState('');
  const [pwned, setPwned] = useState<number | null>(null);
  const [isPwned, setIsPwned] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);

  const calcLocalEntropy = (pwd: string) => {
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) pool += 32;
    return pwd.length > 0 ? pwd.length * Math.log2(pool || 1) : 0;
  };

  useEffect(() => {
    const ent = calcLocalEntropy(password);
    setEntropy(ent);

    const timer = setTimeout(() => {
      if (password.length > 3) {
        checkWithBackend(password);
      } else {
        setPwned(null);
        setIsPwned(false);
        setSuggestions([]);
        setStrengthLabel('');
        setCrackTime('Instant');
        setStrength(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [password]);

  const checkWithBackend = async (pwd: string) => {
    setChecking(true);
    try {
      const endpoint = '/api/tools/password-strength';
      const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) };
      let res = await fetch(endpoint, opts).catch(() => fetch('http://127.0.0.1:8000' + endpoint, opts));
      const data = await res.json();
      setStrength(typeof data.score === 'number' ? data.score : 0);
      setStrengthLabel(data.strength || '');
      setCrackTime(data.crack_time_display || 'Unknown');
      if (typeof data.entropy_bits === 'number') setEntropy(data.entropy_bits);
      setIsPwned(!!data.is_pwned);
      setPwned(data.pwned_count ?? 0);
      setSuggestions(data.suggestions || []);
    } catch {
      setPwned(null);
    } finally {
      setChecking(false);
    }
  };

  const getBarColor = (index: number) => {
    if (strength <= index) return 'bg-[var(--bg-primary)] border border-[var(--border-color)]';
    if (strength <= 2) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (strength === 3) return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
    if (strength === 4) return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
    return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black mb-2 cyber-font flex items-center justify-center gap-3">
          <Key className="w-8 h-8 text-cyan-400" />
          <span className="cyber-gradient-text">Password Strength & Breach Checker</span>
        </h1>
        <p className="text-[var(--text-secondary)] font-medium flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" /> Uses k-anonymity — your password is never transmitted
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-4 pl-4 pr-12 text-xl font-mono focus:border-cyan-400 focus:outline-none transition-colors"
            placeholder="Type a password to check..."
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-cyan-400 transition-colors"
          >
            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex gap-2 h-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${getBarColor(i)}`} />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl text-center">
            <span className="block text-xs text-[var(--text-secondary)] uppercase font-bold mb-1">Entropy</span>
            <span className="text-xl font-mono font-bold">{entropy.toFixed(1)} bits</span>
          </div>
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl text-center">
            <span className="block text-xs text-[var(--text-secondary)] uppercase font-bold mb-1">Crack Time</span>
            <span className="text-xl font-mono font-bold text-cyan-400">{crackTime}</span>
          </div>
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl text-center col-span-2 md:col-span-2 flex flex-col justify-center items-center">
            <span className="block text-xs text-[var(--text-secondary)] uppercase font-bold mb-2">Character Types</span>
            <div className="flex gap-2 flex-wrap justify-center">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${/[a-z]/.test(password) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-500'}`}>abc</span>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${/[A-Z]/.test(password) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-500'}`}>ABC</span>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${/[0-9]/.test(password) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-500'}`}>123</span>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${/[^A-Za-z0-9]/.test(password) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-500'}`}>!@#</span>
            </div>
          </div>
        </div>

        {/* Strength label from backend */}
        {strengthLabel && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Strength</span>
            <span className={`text-sm font-bold ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-orange-400' : strength === 3 ? 'text-yellow-400' : 'text-green-400'}`}>{strengthLabel}</span>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {password.length > 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            {/* Breach Status */}
            <div className={`glass-panel p-6 rounded-xl border-2 flex items-start gap-4 ${checking ? 'border-[var(--border-color)]' : isPwned ? 'border-red-500 bg-red-500/5' : 'border-green-500 bg-green-500/5'}`}>
              {checking ? (
                <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-cyan-500 rounded-full animate-spin flex-shrink-0 mt-1" />
              ) : isPwned ? (
                <ShieldAlert className="w-12 h-12 text-red-500 flex-shrink-0" />
              ) : (
                <ShieldCheck className="w-12 h-12 text-green-500 flex-shrink-0" />
              )}
              <div>
                <h3 className={`text-xl font-bold ${checking ? 'text-[var(--text-primary)]' : isPwned ? 'text-red-400' : 'text-green-400'}`}>
                  {checking ? 'Checking HaveIBeenPwned...' : isPwned ? '⚠️ Password Compromised!' : '✅ No Breaches Found'}
                </h3>
                <p className="text-[var(--text-secondary)] mt-1 text-sm">
                  {checking
                    ? 'Querying HIBP k-anonymity API — your password hash is never sent...'
                    : isPwned
                    ? <>This password appeared in <strong className="text-red-400">{(pwned ?? 0).toLocaleString()}</strong> known data breaches. Change it immediately on all sites.</>
                    : 'This password was not found in any known data breach databases.'}
                </p>
              </div>
            </div>

            {/* Improvement Suggestions */}
            {suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-5 rounded-xl">
                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Improvement Suggestions
                </h3>
                <ul className="space-y-2">
                  {suggestions.map((s, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">!</span>
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2 py-2">
        <Hash className="w-3 h-3" /> 🔒 Only first 5 chars of SHA1 hash sent to HIBP API. Your password is never transmitted in plaintext.
      </div>
    </div>
  );
};
