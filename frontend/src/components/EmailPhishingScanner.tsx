import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Search, ShieldAlert, ShieldCheck, AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';

interface EmailPhishingScannerProps {
  theme: 'dark' | 'light';
  onScanUrl: (url: string) => void;
}

interface ExtractedUrl {
  url: string;
  domain: string;
  status: 'pending' | 'scanning' | 'done';
  verdict?: 'BENIGN' | 'SUSPICIOUS' | 'PHISHING' | 'UNREGISTERED';
  riskScore?: number;
  age?: number | string;
  tls?: boolean;
  registrar?: string;
}

export const EmailPhishingScanner: React.FC<EmailPhishingScannerProps> = ({ theme, onScanUrl }) => {
  const [text, setText] = useState('');
  const [urls, setUrls] = useState<ExtractedUrl[]>([]);
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const extractUrls = (content: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    const matches = content.match(urlRegex) || [];
    return Array.from(new Set(matches)); // unique
  };

  const handleScan = async () => {
    if (!text) return;
    const extracted = extractUrls(text);
    if (extracted.length === 0) {
      alert("No URLs found in the text.");
      return;
    }
    
    setHasScanned(true);
    setScanning(true);
    
    const initialUrls = extracted.map(u => {
      let domain = u;
      try {
        domain = new URL(u).hostname;
      } catch(e) {}
      return { url: u, domain, status: 'scanning' as const };
    });
    
    setUrls(initialUrls);

    // Mock scanning delay per URL
    const updated = [...initialUrls];
    for (let i = 0; i < updated.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      const r = Math.random();
      let verdict: 'BENIGN' | 'SUSPICIOUS' | 'PHISHING' | 'UNREGISTERED' = 'BENIGN';
      let score = Math.floor(Math.random() * 20);
      if (r > 0.8) { verdict = 'PHISHING'; score = 80 + Math.floor(Math.random() * 20); }
      else if (r > 0.6) { verdict = 'SUSPICIOUS'; score = 40 + Math.floor(Math.random() * 30); }
      else if (r > 0.95) { verdict = 'UNREGISTERED'; score = 0; }
      
      updated[i] = {
        ...updated[i],
        status: 'done',
        verdict,
        riskScore: score,
        age: verdict === 'UNREGISTERED' ? 'N/A' : Math.floor(Math.random() * 3000),
        tls: verdict !== 'UNREGISTERED' && Math.random() > 0.1,
        registrar: verdict === 'UNREGISTERED' ? 'N/A' : 'Namecheap, Inc.'
      };
      setUrls([...updated]);
    }
    
    setScanning(false);
  };

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'PHISHING': return <span className="badge-critical px-2 py-1 rounded text-xs font-bold border">PHISHING</span>;
      case 'SUSPICIOUS': return <span className="badge-medium px-2 py-1 rounded text-xs font-bold border">SUSPICIOUS</span>;
      case 'BENIGN': return <span className="badge-safe px-2 py-1 rounded text-xs font-bold border">SAFE</span>;
      case 'UNREGISTERED': return <span className="badge-info px-2 py-1 rounded text-xs font-bold border">UNREGISTERED</span>;
      default: return <span className="text-gray-500 text-xs">SCANNING</span>;
    }
  };

  const stats = {
    total: urls.length,
    phishing: urls.filter(u => u.verdict === 'PHISHING').length,
    suspicious: urls.filter(u => u.verdict === 'SUSPICIOUS').length,
    safe: urls.filter(u => u.verdict === 'BENIGN').length
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black mb-2 cyber-font flex items-center justify-center gap-3">
          <Mail className="w-8 h-8 text-cyan-400" />
          <span className="cyber-gradient-text">Email Link Extractor & Phishing Scanner</span>
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Paste the raw content or HTML of a suspicious email below. We'll extract all links and analyze them instantly.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4 md:p-6 rounded-xl flex flex-col gap-4">
        <textarea 
          className="w-full min-h-[200px] p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors resize-y"
          placeholder="Paste email content here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <button 
            onClick={handleScan}
            disabled={!text || scanning}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cyber-shimmer-btn"
          >
            {scanning ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scanning...</>
            ) : (
              <><Search className="w-5 h-5" /> Extract & Scan Links</>
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {hasScanned && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center border-t-4 border-cyan-500">
                <Search className="text-cyan-500 mb-2 w-6 h-6" />
                <span className="text-2xl font-black cyber-font">{stats.total}</span>
                <span className="text-xs text-[var(--text-secondary)] uppercase">URLs Found</span>
              </div>
              <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center border-t-4 border-red-500">
                <ShieldAlert className="text-red-500 mb-2 w-6 h-6" />
                <span className="text-2xl font-black cyber-font text-red-500">{stats.phishing}</span>
                <span className="text-xs text-[var(--text-secondary)] uppercase">Phishing</span>
              </div>
              <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center border-t-4 border-orange-500">
                <AlertTriangle className="text-orange-500 mb-2 w-6 h-6" />
                <span className="text-2xl font-black cyber-font text-orange-500">{stats.suspicious}</span>
                <span className="text-xs text-[var(--text-secondary)] uppercase">Suspicious</span>
              </div>
              <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center border-t-4 border-green-500">
                <ShieldCheck className="text-green-500 mb-2 w-6 h-6" />
                <span className="text-2xl font-black cyber-font text-green-500">{stats.safe}</span>
                <span className="text-xs text-[var(--text-secondary)] uppercase">Safe</span>
              </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                      <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Domain</th>
                      <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Verdict</th>
                      <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Risk</th>
                      <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Age</th>
                      <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">TLS</th>
                      <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urls.map((u, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors"
                      >
                        <td className="p-4 font-mono text-sm max-w-xs truncate" title={u.url}>{u.domain}</td>
                        <td className="p-4">{getVerdictBadge(u.verdict)}</td>
                        <td className="p-4 font-mono">
                          {u.status === 'scanning' ? (
                            <div className="w-8 h-4 bg-gray-600 animate-pulse rounded" />
                          ) : (
                            <span className={u.riskScore! >= 70 ? 'text-red-500' : u.riskScore! >= 35 ? 'text-orange-500' : 'text-green-500'}>
                              {u.riskScore}/100
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm">{u.age === undefined ? '-' : u.age === 'N/A' ? 'N/A' : `${u.age}d`}</td>
                        <td className="p-4">{u.tls === undefined ? '-' : u.tls ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}</td>
                        <td className="p-4">
                          <button onClick={() => onScanUrl(u.url)} className="text-cyan-400 hover:text-cyan-300 text-sm font-bold flex items-center gap-1">
                            <Shield className="w-4 h-4" /> Deep Scan
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
