import React from 'react';
import { TrendingUp, TrendingDown, Layers, HelpCircle } from 'lucide-react';
import type { EvidenceItem } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface EvidenceTableProps {
  evidenceList?: EvidenceItem[];
  evidence?: EvidenceItem[];
  onOpenAbout?: (topicId?: string) => void;
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({ evidenceList, evidence, onOpenAbout }) => {
  const items = evidence || evidenceList || [];

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.2))', padding: '10px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <Layers size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
                Multi-Signal Calibrated Evidence Matrix
              </h3>
              <InfoTooltip
                title="Evidence Factor Matrix"
                description="Lists all independent forensic indicators evaluated by the AI engine with their calibrated point impacts (+/- score points)."
                securityImpact="Positive points (+pts) increase overall threat score; negative points (-pts) prove legitimate domain history and reduce the score."
                goodVsBad="Inspect this table to audit exactly why the AI assigned the specific risk verdict."
              />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Individual independent evidence factors and their calibrated contributions to the overall risk score
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--code-box-bg)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
            {items.length} Extracted Signals
          </span>
          {onOpenAbout && (
            <button
              onClick={() => onOpenAbout('evidence-breakdown')}
              style={{
                background: 'var(--code-box-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s'
              }}
              title="About Evidence Matrix"
            >
              <HelpCircle size={13} color="var(--accent-cyan)" />
              <span>About</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 14px', fontWeight: 700 }}>Category</th>
              <th style={{ padding: '12px 14px', fontWeight: 700 }}>Evidence Indicator</th>
              <th style={{ padding: '12px 14px', fontWeight: 700 }}>Severity</th>
              <th style={{ padding: '12px 14px', fontWeight: 700 }}>Weight</th>
              <th style={{ padding: '12px 14px', fontWeight: 700 }}>Score Impact</th>
              <th style={{ padding: '12px 14px', fontWeight: 700 }}>Forensic Description</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ev, idx) => {
              const isPositive = ev.contribution > 0;
              const isSafe = ev.severity === 'SAFE';

              let badgeClass = 'badge-medium';
              if (ev.severity === 'CRITICAL') badgeClass = 'badge-critical';
              else if (ev.severity === 'HIGH') badgeClass = 'badge-high';
              else if (ev.severity === 'SAFE') badgeClass = 'badge-safe';

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    background: idx % 2 === 0 ? 'var(--code-box-bg)' : 'transparent',
                    transition: 'background 0.15s'
                  }}
                >
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {ev.category}
                  </td>

                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {ev.name}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <span className={badgeClass} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                      {ev.severity}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }} className="mono">
                    {ev.weight.toFixed(2)}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: isSafe ? '#10b981' : (isPositive ? '#ef4444' : '#10b981'),
                      fontWeight: 800
                    }} className="mono">
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{isPositive ? `+${ev.contribution.toFixed(1)}` : `${ev.contribution.toFixed(1)}`} pts</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.45, fontWeight: 500 }}>
                    {ev.summary}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
