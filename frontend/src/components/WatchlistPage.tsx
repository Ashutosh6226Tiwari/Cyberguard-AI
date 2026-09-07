import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, Search, Shield } from 'lucide-react';

interface WatchlistPageProps {
  theme: 'dark' | 'light';
  onScanUrl: (url: string) => void;
}

interface WatchedDomain {
  id: string;
  domain: string;
  label: string;
  addedAt: string;
  lastVerdict?: 'BENIGN' | 'SUSPICIOUS' | 'PHISHING';
  lastScore?: number;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({ theme, onScanUrl }) => {
  const [watchlist, setWatchlist] = useState<WatchedDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'alpha'>('date');

  useEffect(() => {
    const saved = localStorage.getItem('watchlist_domains');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    } else {
      setWatchlist([
        { id: '1', domain: 'mycompany.com', label: 'Corporate', addedAt: new Date().toISOString(), lastVerdict: 'BENIGN', lastScore: 5 },
        { id: '2', domain: 'mycompany-login.xyz', label: 'Lookalike', addedAt: new Date(Date.now() - 86400000).toISOString(), lastVerdict: 'PHISHING', lastScore: 95 }
      ]);
    }
  }, []);

  const saveWatchlist = (list: WatchedDomain[]) => {
    setWatchlist(list);
    localStorage.setItem('watchlist_domains', JSON.stringify(list));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    
    const domain = newDomain.replace(/^https?:\/\//, '').split('/')[0];
    const newItem: WatchedDomain = {
      id: Math.random().toString(36).substr(2, 9),
      domain,
      label: newLabel || 'Untagged',
      addedAt: new Date().toISOString()
    };
    
    saveWatchlist([newItem, ...watchlist]);
    setNewDomain('');
    setNewLabel('');
  };

  const remove = (id: string) => {
    saveWatchlist(watchlist.filter(w => w.id !== id));
  };

  const sorted = [...watchlist].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    if (sortBy === 'score') return (b.lastScore || 0) - (a.lastScore || 0);
    return a.domain.localeCompare(b.domain);
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-2 cyber-font flex items-center justify-center gap-3">
          <Bell className="w-8 h-8 text-cyan-400" />
          <span className="cyber-gradient-text">Domain Watchlist & Alerts</span>
        </h1>
        <p className="text-[var(--text-secondary)]">Monitor important domains or track suspicious infrastructure.</p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleAdd} className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="Domain to watch (e.g. example.com)"
          className="flex-1 w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-4 py-3 font-mono focus:border-cyan-400 focus:outline-none"
        />
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label (optional)"
          className="w-full md:w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-4 py-3 focus:border-cyan-400 focus:outline-none"
        />
        <button type="submit" disabled={!newDomain} className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0">
          <Plus className="w-5 h-5" /> Add to Watchlist
        </button>
      </motion.form>

      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold">Watched Domains ({watchlist.length})</h2>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-sm outline-none">
          <option value="date">Sort by Date Added</option>
          <option value="score">Sort by Risk Score</option>
          <option value="alpha">Sort Alphabetically</option>
        </select>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {sorted.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 glass-panel rounded-xl">
              <Bell className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">No domains being watched.<br/>Add domains above to monitor them.</p>
            </motion.div>
          ) : (
            sorted.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 cyber-card-hover"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-lg truncate">{item.domain}</span>
                    <span className="bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-0.5 rounded text-xs text-[var(--text-secondary)]">{item.label}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Added: {new Date(item.addedAt).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-6">
                  {item.lastVerdict && (
                    <div className="text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold border block mb-1 ${item.lastVerdict === 'PHISHING' ? 'badge-critical' : item.lastVerdict === 'SUSPICIOUS' ? 'badge-medium' : 'badge-safe'}`}>
                        {item.lastVerdict}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">Score: {item.lastScore}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => onScanUrl(item.domain)} className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-colors tooltip-trigger" title="Scan Now">
                      <Shield className="w-5 h-5" />
                    </button>
                    <button onClick={() => remove(item.id)} className="p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:border-red-500 hover:text-red-500 transition-colors" title="Remove">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
