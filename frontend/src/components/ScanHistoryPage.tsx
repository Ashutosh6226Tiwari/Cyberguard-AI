import React from 'react';
import { History, FileText, ExternalLink, ShieldAlert, CheckCircle, AlertTriangle, Coins, ArrowRight, Download } from 'lucide-react';
import type { CaseSummary } from '../types';

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
  return (
    <div className="glass-panel" style={{ padding: '28px', margin: '0 24px 24px 24px' }}>
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

      {/* Cases Table */}
      {cases.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Target Domain</th>
                <th style={{ padding: '12px 14px' }}>Risk Score</th>
                <th style={{ padding: '12px 14px' }}>Verdict</th>
                <th style={{ padding: '12px 14px' }}>Security Grade</th>
                <th style={{ padding: '12px 14px' }}>Payment / x402</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const isCritical = c.risk_score >= 70;
                const isSuspicious = c.risk_score >= 35 && c.risk_score < 70;
                const verdictColor = isCritical ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981';

                return (
                  <tr
                    key={c.case_id}
                    style={{
                      borderBottom: '1px solid rgba(75, 85, 99, 0.2)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.canonical_domain}</div>
                      <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {c.target_url}
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div className="mono" style={{ fontWeight: 800, fontSize: '0.95rem', color: verdictColor }}>
                        {c.risk_score.toFixed(1)} / 100
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          background: isCritical ? 'rgba(239, 68, 68, 0.15)' : isSuspicious ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          border: `1px solid ${verdictColor}`,
                          color: verdictColor,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        {c.verdict}
                      </span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span className="mono" style={{ fontWeight: 800, color: '#38bdf8' }}>
                        Grade {c.security_grade || 'A+'}
                      </span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      {c.tx_id ? (
                        <a
                          href={`https://lora.algokit.io/testnet/transaction/${c.tx_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            textDecoration: 'none'
                          }}
                        >
                          <Coins size={11} />
                          <span>{c.tx_id.slice(0, 14)}...</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Free Scan</span>
                      )}
                    </td>

                    <td style={{ padding: '14px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectCase(c.case_id)}
                        style={{
                          background: 'rgba(6, 182, 212, 0.15)',
                          border: '1px solid rgba(6, 182, 212, 0.4)',
                          color: '#38bdf8',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <p>No historical security scans recorded yet. Enter a URL to run an assessment.</p>
        </div>
      )}
    </div>
  );
};
