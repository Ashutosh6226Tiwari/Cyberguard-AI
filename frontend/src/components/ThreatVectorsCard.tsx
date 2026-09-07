import React from 'react';
import { Activity, ShieldAlert, ShieldCheck, Cpu, Code2, AlertTriangle, CheckCircle2, Globe, FileCode2 } from 'lucide-react';
import type { RiskScoreReport } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface ThreatVectorsCardProps {
  report: RiskScoreReport;
}

export const ThreatVectorsCard: React.FC<ThreatVectorsCardProps> = ({ report }) => {
  const crawl = report.crawl_artifacts;
  const triage = report.triage;

  // Vector scores
  const vectors = [
    {
      name: 'Visual & Brand Impersonation',
      score: report.score_visual_brand ?? 0,
      description: 'Logo & trademark similarity vs host mismatch'
    },
    {
      name: 'Infrastructure & Hosting Risk',
      score: report.score_infrastructure ?? 0,
      description: 'ASN, domain age, NRD, and hosting standing'
    },
    {
      name: 'DOM & Behavioral Exploitation',
      score: report.score_content_behavior ?? 0,
      description: 'Cross-origin forms, credential harvesting, JS obfuscation'
    },
    {
      name: 'Lexical & URL Heuristics',
      score: report.score_lexical ?? 0,
      description: 'Shannon entropy, lookalike TLD, hyphens, subdomains'
    },
    {
      name: 'Threat Reputation Standing',
      score: report.score_reputation ?? 0,
      description: 'Global blocklists, certificate integrity, passive telemetry'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 70) return 'CRITICAL';
    if (score >= 40) return 'ELEVATED';
    return 'CLEAN';
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <Activity size={20} color="#c084fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Multi-Vector Threat Radar &amp; Telemetry
              </h3>
              <InfoTooltip
                title="Multi-Vector Threat Radar"
                description="Deconstructs overall threat risk into 5 independent forensic evaluation vectors."
                securityImpact="Isolates exactly which vector triggers alerts (e.g. clean infrastructure but spoofed brand visuals)."
                goodVsBad="Scores < 25% indicate trustworthy attributes. Scores > 70% represent severe exploitation indicators."
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Granular risk distribution across neural, visual &amp; heuristic detectors
            </p>
          </div>
        </div>

        {report.verdict === 'UNREGISTERED' || report.domain_intel?.is_registered === false ? (
          <span className="badge-info mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
            UNREGISTERED DOMAIN (NXDOMAIN)
          </span>
        ) : (
          <span
            className={report.overall_risk_score >= 70 ? 'badge-critical mono' : report.overall_risk_score >= 40 ? 'badge-high mono' : 'badge-safe mono'}
            style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}
          >
            WEIGHTED RISK: {report.overall_risk_score}/100
          </span>
        )}
      </div>

      {/* 5 Vector Progress Meters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        {vectors.map((vec, idx) => {
          const color = getScoreColor(vec.score);
          const status = getScoreStatus(vec.score);
          return (
            <div key={idx} style={{ background: 'var(--code-box-bg)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {vec.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color, letterSpacing: '0.04em' }}>
                    {status}
                  </span>
                  <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700, color }}>
                    {vec.score}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(75, 85, 99, 0.25)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.max(vec.score, 4)}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '4px',
                    transition: 'width 0.8s ease'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {vec.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Web Crawler DOM & Network Telemetry Bar */}
      <div style={{ background: 'var(--hero-bg)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="#a855f7" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DOM &amp; Crawler Behavioral Signals
            </span>
          </div>
          {crawl?.status_code !== undefined && (
            <span className="mono" style={{ fontSize: '0.68rem', color: crawl.status_code === 200 ? '#10b981' : crawl.status_code === 0 ? '#38bdf8' : '#f59e0b' }}>
              {crawl.status_code === 0 ? 'NXDOMAIN / Host Inactive' : `HTTP ${crawl.status_code} OK`}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
          <div style={{ background: 'var(--code-box-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Credential Hooks:</div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: crawl?.has_password_field ? '#ef4444' : '#10b981' }}>
              {crawl?.has_password_field ? 'Password Field Found' : 'No Password Inputs'}
            </div>
          </div>

          <div style={{ background: 'var(--code-box-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Code Obfuscation:</div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: crawl?.has_obfuscated_js ? '#ef4444' : '#10b981' }}>
              {crawl?.has_obfuscated_js ? 'Obfuscated JS Alert' : 'Clean Scripts'}
            </div>
          </div>

          <div style={{ background: 'var(--code-box-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Redirect Chain:</div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: (crawl?.redirect_chain?.length || 0) > 2 ? '#f59e0b' : '#38bdf8' }}>
              {crawl?.redirect_chain?.length ? `${crawl.redirect_chain.length} Hops` : '0 Hops (Direct)'}
            </div>
          </div>

          <div style={{ background: 'var(--code-box-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>External Assets:</div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {crawl?.external_resource_count ? `${crawl.external_resource_count} Cross-Domain` : 'Isolated'}
            </div>
          </div>
        </div>

        {triage?.triage_reason && (
          <div style={{ marginTop: '10px', padding: '8px 10px', background: 'var(--code-box-bg)', borderRadius: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <AlertTriangle size={13} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span><strong>Heuristic Attribution:</strong> {triage.triage_reason}</span>
          </div>
        )}
      </div>
    </div>
  );
};
