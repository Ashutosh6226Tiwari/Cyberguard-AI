import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, MapPin, ShieldAlert, List, Server, CheckCircle, XCircle } from 'lucide-react';

interface IpReputationPageProps {
  theme: 'dark' | 'light';
}

export const IpReputationPage: React.FC<IpReputationPageProps> = ({ theme }) => {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleLookup = async (lookupIp: string) => {
    if (!lookupIp) return;
    setIp(lookupIp);
    setLoading(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    
    const isBad = lookupIp === '185.15.59.224' || Math.random() > 0.7;
    
    setData({
      ip: lookupIp,
      geo: {
        country: isBad ? 'Russia' : 'United States',
        flag: isBad ? '🇷🇺' : '🇺🇸',
        region: isBad ? 'Moscow' : 'California',
        city: isBad ? 'Moscow' : 'Mountain View',
        isp: isBad ? 'Hostkey B.v.' : 'Google LLC',
        asn: isBad ? 'AS58224' : 'AS15169'
      },
      risk: {
        level: isBad ? 'HIGH' : 'LOW',
        score: isBad ? 85 : 5,
        isProxy: isBad,
        isTor: false,
        isHosting: true
      },
      blacklists: [
        { name: 'Spamhaus ZEN', listed: isBad },
        { name: 'AbuseIPDB', listed: isBad },
        { name: 'AlienVault OTX', listed: false },
        { name: 'Project Honeypot', listed: false }
      ],
      rdns: isBad ? 'No PTR record' : 'dns.google'
    });
    
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black mb-2 cyber-font flex items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-cyan-400" />
          <span className="cyber-gradient-text">IP Reputation Lookup</span>
        </h1>
        <p className="text-[var(--text-secondary)]">Analyze IP addresses for threat intelligence, geolocation, and blacklist status.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="flex-1 bg-[var(--bg-primary)] border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-4 px-6 text-lg font-mono focus:border-cyan-400 focus:outline-none transition-colors"
            placeholder="Enter IPv4 or IPv6 address (e.g. 8.8.8.8)"
            onKeyDown={(e) => e.key === 'Enter' && handleLookup(ip)}
          />
          <button
            onClick={() => handleLookup(ip)}
            disabled={!ip || loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cyber-shimmer-btn min-w-[160px]"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Search className="w-5 h-5" /> Analyze</>}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-[var(--text-secondary)] py-1">Quick examples:</span>
          <button onClick={() => handleLookup('8.8.8.8')} className="px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full text-xs font-mono hover:border-cyan-400 transition-colors">8.8.8.8 (Google)</button>
          <button onClick={() => handleLookup('1.1.1.1')} className="px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full text-xs font-mono hover:border-cyan-400 transition-colors">1.1.1.1 (Cloudflare)</button>
          <button onClick={() => handleLookup('185.15.59.224')} className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/50 rounded-full text-xs font-mono hover:bg-red-500/20 transition-colors">185.15.59.224 (Malicious)</button>
        </div>
      </motion.div>

      <AnimatePresence>
        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-[var(--border-color)] pb-3"><MapPin className="w-5 h-5 text-cyan-400" /> Geolocation</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-[var(--text-secondary)] uppercase">Country</span>
                  <span className="text-lg font-medium">{data.geo.flag} {data.geo.country}</span>
                </div>
                <div>
                  <span className="block text-xs text-[var(--text-secondary)] uppercase">Region / City</span>
                  <span className="text-lg font-medium">{data.geo.city}, {data.geo.region}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-[var(--text-secondary)] uppercase">ISP / ASN</span>
                  <span className="text-lg font-medium font-mono">{data.geo.isp} ({data.geo.asn})</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-[var(--border-color)] pb-3"><ShieldAlert className="w-5 h-5 text-orange-400" /> Risk Assessment</h2>
              <div className="flex items-center gap-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${data.risk.level === 'HIGH' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}>
                  <div className="text-center">
                    <span className="block text-2xl font-black">{data.risk.score}</span>
                    <span className="text-[10px] uppercase font-bold">Risk Score</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className={`inline-block px-3 py-1 rounded text-sm font-bold border ${data.risk.level === 'HIGH' ? 'badge-critical' : 'badge-safe'}`}>
                    {data.risk.level} RISK
                  </span>
                  <div className="flex gap-2">
                    {data.risk.isProxy && <span className="px-2 py-1 bg-orange-500/20 text-orange-500 text-xs rounded border border-orange-500/50">Proxy/VPN</span>}
                    {data.risk.isTor && <span className="px-2 py-1 bg-purple-500/20 text-purple-500 text-xs rounded border border-purple-500/50">TOR Node</span>}
                    {data.risk.isHosting && <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded border border-blue-500/50">Data Center</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-[var(--border-color)] pb-3"><List className="w-5 h-5 text-purple-400" /> Blacklist Status</h2>
              <div className="space-y-3">
                {data.blacklists.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <span className="font-medium text-sm">{b.name}</span>
                    {b.listed ? <XCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl space-y-4 h-max">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-[var(--border-color)] pb-3"><Server className="w-5 h-5 text-green-400" /> Reverse DNS (PTR)</h2>
              <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-center">
                <span className="font-mono text-lg">{data.rdns}</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
