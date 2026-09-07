import React, { useState } from 'react';
import { History, FileText, ExternalLink, ShieldAlert, CheckCircle, AlertTriangle, Coins, ArrowRight, Download, Search, Filter, ArrowUpDown, Maximize2, X } from 'lucide-react';
import type { CaseSummary } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanHistoryPageProps {
  cases: CaseSummary[];
  onSelectCase: (caseId: string) => void;
  onLaunchScanner: () => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  cases,
  onSelectCase,
  onLaunchScanner
}) => {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('All');
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleCompare = (caseId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(caseId)) return prev.filter(id => id !== caseId);
      if (prev.length >= 2) return [prev[1], caseId]; // Keep max 2
      return [...prev, caseId];
    });
  };

  const filteredAndSortedCases = cases
    .filter(c => c.canonical_domain.toLowerCase().includes(search.toLowerCase()) || c.target_url.toLowerCase().includes(search.toLowerCase()))
    .filter(c => verdictFilter === 'All' || c.verdict === verdictFilter)
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortNewest ? timeB - timeA : timeA - timeB;
    });

  const getVerdictColor = (verdict: string) => {
    switch(verdict) {
      case 'PHISHING': return '#ef4444';
      case 'SUSPICIOUS': return '#f59e0b';
      case 'BENIGN': return '#10b981';
      case 'UNREGISTERED': return '#3b82f6';
      default: return 'var(--text-secondary)';
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch(verdict) {
      case 'PHISHING': return <span className="badge-critical px-2 py-1 rounded text-xs font-bold border">PHISHING</span>;
      case 'SUSPICIOUS': return <span className="badge-medium px-2 py-1 rounded text-xs font-bold border">SUSPICIOUS</span>;
      case 'BENIGN': return <span className="badge-safe px-2 py-1 rounded text-xs font-bold border">SAFE</span>;
      case 'UNREGISTERED': return <span className="badge-info px-2 py-1 rounded text-xs font-bold border">UNREGISTERED</span>;
      default: return <span className="badge-info px-2 py-1 rounded text-xs font-bold border">{verdict}</span>;
    }
  };

  const compareCases = selectedForCompare.map(id => cases.find(c => c.case_id === id)).filter(Boolean) as CaseSummary[];

  return (
    <div className="glass-panel" style={{ padding: '28px', margin: '0 24px 24px 24px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.5)', padding: '8px', borderRadius: '10px', color: '#38bdf8' }}>
            <History size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Security Reports &amp; Scan History</span>
              <span className="badge-info" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>
                {cases.length} AUDITS LOGGED
              </span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Historical website security assessments, phishing risk evaluations, and verified Algorand Testnet transactions.
            </p>
          </div>
        </div>

        <button
          onClick={onLaunchScanner}
          className="cyber-shimmer-btn"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)'
          }}
        >
          <span>Run New Scan</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Search by domain..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          {['All', 'PHISHING', 'SUSPICIOUS', 'BENIGN', 'UNREGISTERED'].map(v => (
            <button 
              key={v}
              onClick={() => setVerdictFilter(v)}
              className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${verdictFilter === v ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-400/50'}`}
            >
              {v}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setSortNewest(!sortNewest)}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm font-bold hover:border-cyan-400 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortNewest ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* Comparison Panel */}
      <AnimatePresence>
        {compareCases.length === 2 && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="mb-8 p-4 bg-[var(--bg-card)] border-2 border-cyan-500/50 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden"
          >
            <button onClick={() => setSelectedForCompare([])} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-red-500"><X className="w-5 h-5"/></button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Maximize2 className="w-5 h-5 text-cyan-400"/> Compare Domains</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {compareCases.map((c, i) => (
                <div key={c.case_id} className="space-y-4">
                  <div className="text-center pb-4 border-b border-[var(--border-color)]">
                    <div className="text-xl font-bold font-mono text-[var(--text-primary)] mb-2">{c.canonical_domain}</div>
                    {getVerdictBadge(c.verdict)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-[var(--text-secondary)]">Risk Score:</div>
                    <div className="font-mono font-bold" style={{color: getVerdictColor(c.verdict)}}>{c.risk_score.toFixed(1)} / 100</div>
                    
                    <div className="text-[var(--text-secondary)]">Security Grade:</div>
                    <div className="font-mono font-bold text-cyan-400">{c.security_grade || 'N/A'}</div>
                    
                    <div className="text-[var(--text-secondary)]">Date:</div>
                    <div className="font-mono">{new Date(c.created_at).toLocaleDateString()}</div>
                    
                    <div className="text-[var(--text-secondary)]">Premium Audit:</div>
                    <div>{c.is_premium ? '✅ Yes' : '❌ No'}</div>
                  </div>
                  
                  <button onClick={() => onSelectCase(c.case_id)} className="w-full py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm font-bold hover:bg-cyan-500/20 transition-colors">
                    View Full Report
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Cases */}
      {filteredAndSortedCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredAndSortedCases.map((c, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={c.case_id}
                className={`bg-[var(--bg-primary)] border rounded-xl p-4 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${selectedForCompare.includes(c.case_id) ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'border-[var(--border-color)] hover:border-cyan-400/50'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="font-mono font-bold text-lg truncate max-w-[80%]" title={c.canonical_domain}>{c.canonical_domain}</div>
                  <input 
                    type="checkbox"
                    checked={selectedForCompare.includes(c.case_id)}
                    onChange={() => toggleCompare(c.case_id)}
                    className="w-4 h-4 cursor-pointer accent-cyan-500"
                    title="Compare"
                  />
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  {getVerdictBadge(c.verdict)}
                  <div className="font-mono font-black text-lg" style={{color: getVerdictColor(c.verdict)}}>
                    {c.risk_score.toFixed(1)}
                  </div>
                </div>
                
                {/* Score Bar */}
                <div className="w-full h-1.5 bg-gray-700/30 rounded-full mb-4 overflow-hidden">
                  <div className="h-full" style={{ width: `${Math.min(100, Math.max(0, c.risk_score))}%`, backgroundColor: getVerdictColor(c.verdict) }} />
                </div>
                
                <div className="space-y-1 mb-4 text-xs text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grade:</span>
                    <span className="font-bold text-cyan-400">{c.security_grade || 'N/A'}</span>
                  </div>
                  {c.tx_id && (
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-[var(--border-color)]">
                      <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-green-500"/> TX:</span>
                      <a href={`https://lora.algokit.io/testnet/transaction/${c.tx_id}`} target="_blank" rel="noreferrer" className="text-green-500 hover:underline flex items-center gap-1">
                        {c.tx_id.slice(0,8)}... <ExternalLink className="w-3 h-3"/>
                      </a>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => onSelectCase(c.case_id)}
                  className="w-full py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-bold text-cyan-400 hover:border-cyan-400 transition-colors"
                >
                  View Details
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <p>No historical security scans match your filters.</p>
        </div>
      )}
    </div>
  );
};
