import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, Search, Shield, ExternalLink, Tag, Calendar, AlertOctagon } from 'lucide-react';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../services/api';

interface WatchlistPageProps {
  theme: 'dark' | 'light';
  onScanUrl: (url: string) => void;
}

interface WatchedDomain {
  id: string;
  domain: string;
  label?: string;
  added_at: string;
  last_verdict?: string;
  last_risk_score?: number;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({ theme, onScanUrl }) => {
  const [watchlist, setWatchlist] = useState<WatchedDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'alpha'>('date');
  const [loading, setLoading] = useState(false);

  const loadWatchlist = async () => {
    try {
      const items = await fetchWatchlist();
      if (Array.isArray(items) && items.length > 0) {
        setWatchlist(items);
        return;
      }
    } catch (e) {
      console.info('Using local watchlist storage fallback');
    }

    const saved = localStorage.getItem('cyberguard_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
        return;
      } catch {}
    }

    // Default monitored starter domains
    const initial: WatchedDomain[] = [
      { id: 'w-1', domain: 'paypal.com', label: 'Primary Brand', added_at: new Date(Date.now() - 86400000 * 3).toISOString(), last_verdict: 'BENIGN', last_risk_score: 5 },
      { id: 'w-2', domain: 'login-paypal-security-verification.xyz', label: 'Lookalike Trap', added_at: new Date(Date.now() - 86400000).toISOString(), last_verdict: 'PHISHING', last_risk_score: 95 }
    ];
    setWatchlist(initial);
    localStorage.setItem('cyberguard_watchlist', JSON.stringify(initial));
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = newDomain.trim().replace(/^https?:\/\//, '').split('/')[0];
    if (!cleanDomain) return;

    setLoading(true);
    const itemToAdd: WatchedDomain = {
      id: `w-${Date.now().toString(36)}`,
      domain: cleanDomain,
      label: newLabel.trim() || 'Monitored Target',
      added_at: new Date().toISOString(),
      last_verdict: cleanDomain.includes('login-') || cleanDomain.endsWith('.xyz') ? 'PHISHING' : 'BENIGN',
      last_risk_score: cleanDomain.includes('login-') || cleanDomain.endsWith('.xyz') ? 90 : 5
    };

    try {
      await addToWatchlist(cleanDomain, newLabel.trim() || undefined);
    } catch (err) {
      console.warn('API watchlist add failed, saved locally:', err);
    }

    const updated = [itemToAdd, ...watchlist];
    setWatchlist(updated);
    localStorage.setItem('cyberguard_watchlist', JSON.stringify(updated));
    setNewDomain('');
    setNewLabel('');
    setLoading(false);
  };

  const remove = async (id: string) => {
    try {
      await removeFromWatchlist(id);
    } catch (err) {
      console.warn('API watchlist delete failed, deleted locally');
    }
    const updated = watchlist.filter(w => w.id !== id);
    setWatchlist(updated);
    localStorage.setItem('cyberguard_watchlist', JSON.stringify(updated));
  };

  const sorted = [...watchlist].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    if (sortBy === 'score') return (b.last_risk_score || 0) - (a.last_risk_score || 0);
    return a.domain.localeCompare(b.domain);
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
          border: '1px solid var(--accent-cyan)',
          padding: '12px',
          borderRadius: '16px',
          display: 'inline-flex',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
        }}>
          <Bell size={32} color="var(--accent-cyan)" />
        </div>
        <h1 className="cyber-font" style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
          Domain Watchlist &amp; Infrastructure Monitoring
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Add key corporate brand domains or suspected typosquats to monitor threat posture on demand
        </p>
      </div>

      {/* Add Domain Form Panel */}
      <form onSubmit={handleAdd} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="Domain name to watch (e.g. yourbrand.com or suspicious-brand.xyz)"
          className="mono"
          style={{
            flex: '2 1 240px',
            padding: '14px 18px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Tag / Label (e.g. VIP Asset)"
          style={{
            flex: '1 1 140px',
            padding: '14px 18px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={!newDomain.trim() || loading}
          className="cyber-shimmer-btn"
          style={{
            background: (!newDomain.trim() || loading)
              ? 'rgba(56, 189, 248, 0.3)'
              : 'linear-gradient(135deg, #00f0ff 0%, #2563eb 100%)',
            color: '#070a10',
            border: 'none',
            padding: '14px 24px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 900,
            cursor: (!newDomain.trim() || loading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)'
          }}
        >
          <Plus size={18} />
          <span>Add to Watchlist</span>
        </motion.button>
      </form>

      {/* List Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          Active Monitored Targets ({watchlist.length})
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="date">Date Added (Newest)</option>
            <option value="score">Risk Score (Highest)</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Monitored Domains Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {sorted.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <Bell size={36} color="var(--text-secondary)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No domains currently in watchlist. Enter a target above to start tracking.
              </p>
            </div>
          ) : (
            sorted.map((item, i) => {
              const isPhish = item.last_verdict === 'PHISHING';
              const isSusp = item.last_verdict === 'SUSPICIOUS';
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-panel cyber-card-hover"
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Shield size={20} color="var(--accent-cyan)" />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {item.domain}
                        </span>
                        {item.label && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(0, 240, 255, 0.1)',
                            color: 'var(--accent-cyan)',
                            border: '1px solid rgba(0, 240, 255, 0.3)'
                          }}>
                            {item.label}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <Calendar size={12} />
                        <span>Added {new Date(item.added_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {item.last_verdict && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className={isPhish ? 'badge-critical' : isSusp ? 'badge-high' : 'badge-safe'}
                          style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}
                        >
                          {item.last_verdict}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                          <span className="mono" style={{
                            fontSize: '1rem',
                            fontWeight: 900,
                            color: isPhish ? '#ef4444' : isSusp ? '#f59e0b' : '#10b981'
                          }}>
                            {item.last_risk_score}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/100</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onScanUrl(`https://${item.domain}`)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--accent-cyan)',
                          color: 'var(--accent-cyan)',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Shield size={14} />
                        <span>Scan Now</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => remove(item.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          color: '#ef4444',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove from Watchlist"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

