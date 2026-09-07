import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, ShieldAlert, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface ThreatDashboardProps {
  theme: 'dark' | 'light';
}

export const ThreatDashboard: React.FC<ThreatDashboardProps> = ({ theme }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [stats, setStats] = useState({
    total: 145023,
    phishing: 12431,
    suspicious: 34502,
    benign: 98090
  });

  const topBrands = [
    { name: 'Microsoft / Office 365', count: 4210, percent: 85 },
    { name: 'PayPal', count: 3105, percent: 70 },
    { name: 'Chase Bank', count: 1840, percent: 45 },
    { name: 'Facebook / Meta', count: 1200, percent: 30 },
    { name: 'Amazon', count: 950, percent: 25 },
  ];

  const riskyTlds = [
    { name: '.top', count: 5200, percent: 90 },
    { name: '.xyz', count: 4100, percent: 75 },
    { name: '.shop', count: 2800, percent: 55 },
    { name: '.online', count: 2100, percent: 40 },
    { name: '.site', count: 1500, percent: 30 },
  ];

  const recentThreats = [
    { domain: 'login-microsoft-secure.xyz', verdict: 'PHISHING', score: 95, time: '2 mins ago' },
    { domain: 'verify-account-chase-update.top', verdict: 'PHISHING', score: 92, time: '5 mins ago' },
    { domain: 'campuskart.shop', verdict: 'BENIGN', score: 15, time: '12 mins ago' },
    { domain: 'auth-paypal-secure-portal.click', verdict: 'SUSPICIOUS', score: 78, time: '18 mins ago' },
    { domain: 'amazon-support-help-desk.online', verdict: 'PHISHING', score: 88, time: '22 mins ago' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
      setStats(prev => ({
        total: prev.total + Math.floor(Math.random() * 10),
        phishing: prev.phishing + (Math.random() > 0.7 ? 1 : 0),
        suspicious: prev.suspicious + (Math.random() > 0.5 ? 1 : 0),
        benign: prev.benign + Math.floor(Math.random() * 5)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-black cyber-font">Threat Intelligence Center</h1>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--border-color)]">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="font-bold text-sm tracking-widest text-green-500">LIVE</span>
          <span className="text-xs text-[var(--text-secondary)] font-mono ml-2 border-l border-[var(--border-color)] pl-3 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> {lastUpdated}
          </span>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-xl border-l-4 border-cyan-500">
          <div className="flex justify-between items-start mb-2">
            <Shield className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="text-3xl font-black font-mono mb-1">{stats.total.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Total Scans</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-xl border-l-4 border-red-500">
          <div className="flex justify-between items-start mb-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div className="text-3xl font-black font-mono mb-1 text-red-500">{stats.phishing.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Phishing Detected</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-xl border-l-4 border-orange-500">
          <div className="flex justify-between items-start mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-3xl font-black font-mono mb-1 text-orange-500">{stats.suspicious.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Suspicious Flagged</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-xl border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-2">
            <ShieldCheck className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-3xl font-black font-mono mb-1 text-green-500">{stats.benign.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Benign Confirmed</div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> Top Impersonated Brands</h2>
          <div className="space-y-4">
            {topBrands.map((brand, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold">{brand.name}</span>
                  <span className="text-[var(--text-secondary)] font-mono">{brand.count.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${brand.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Risky TLD Distribution</h2>
          <div className="space-y-4">
            {riskyTlds.map((tld, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold font-mono">{tld.name}</span>
                  <span className="text-[var(--text-secondary)] font-mono">{tld.count.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${tld.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-panel p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Recent Threats Detected</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-primary)]">
                <th className="p-3 text-sm font-semibold text-[var(--text-secondary)] rounded-tl-lg">Domain</th>
                <th className="p-3 text-sm font-semibold text-[var(--text-secondary)]">Verdict</th>
                <th className="p-3 text-sm font-semibold text-[var(--text-secondary)]">Risk</th>
                <th className="p-3 text-sm font-semibold text-[var(--text-secondary)] rounded-tr-lg">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentThreats.map((t, i) => (
                <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-card-hover)]">
                  <td className="p-3 font-mono text-sm">{t.domain}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${t.verdict === 'PHISHING' ? 'badge-critical' : t.verdict === 'SUSPICIOUS' ? 'badge-medium' : 'badge-safe'}`}>
                      {t.verdict}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold">{t.score}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)]">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
