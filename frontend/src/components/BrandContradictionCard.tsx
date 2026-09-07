import React from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import type { BrandMatch, DomainIntel } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface BrandContradictionCardProps {
  brand: BrandMatch;
  domainIntel?: DomainIntel;
}

export const BrandContradictionCard: React.FC<BrandContradictionCardProps> = ({ brand, domainIntel }) => {
  const hasBrand = !!brand?.matched_brand;
  const isContradiction = !!brand?.is_contradiction;

  const targetDomain = domainIntel?.registrable_domain || 'Target Domain';
  const isUnregistered = domainIntel?.is_registered === false;
  const domainAge = isUnregistered
    ? 'Unregistered / Available'
    : domainIntel?.domain_age_days !== undefined && domainIntel?.domain_age_days !== null
    ? `${domainIntel.domain_age_days} days`
    : 'Verified';
  const isNrd = !!domainIntel?.is_newly_registered;
  const registrar = isUnregistered ? 'None (Unregistered Domain)' : (domainIntel?.registrar || 'ICANN Accredited Registrar');
  const tld = domainIntel?.tld || targetDomain.split('.').pop() || 'com';

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: isContradiction ? 'rgba(239, 68, 68, 0.15)' : (hasBrand ? 'rgba(16, 185, 129, 0.15)' : 'rgba(75, 85, 99, 0.2)'),
            padding: '8px',
            borderRadius: '8px'
          }}>
            {isContradiction ? (
              <ShieldAlert size={20} color="#ef4444" />
            ) : (
              <ShieldCheck size={20} color={hasBrand ? '#10b981' : '#9ca3af'} />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Brand-Domain Contradiction Engine
              </h3>
              <InfoTooltip
                title="Brand-Domain Contradiction"
                description="Compares the brand identity implied by page visuals, logos, and trademarks against the actual hosting domain owner."
                securityImpact="If a page looks like PayPal or Microsoft but is hosted on an unauthorized lookalike domain, it is a high-confidence phishing attack."
                goodVsBad="Consistent = Legitimately operated by the brand. Mismatch = Critical Phishing Impersonation."
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Verifying claimed brand visual &amp; semantic identity vs actual domain ownership
            </p>
          </div>
        </div>

        {isUnregistered ? (
          <span className="badge-info mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            UNREGISTERED / AVAILABLE DOMAIN
          </span>
        ) : isContradiction ? (
          <span className="badge-critical mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            CRITICAL CONTRADICTION DETECTED
          </span>
        ) : hasBrand ? (
          <span className="badge-safe mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            AUTHENTIC BRAND DOMAIN
          </span>
        ) : (
          <span className="badge-info mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            GENERIC / UNBRANDED DOMAIN
          </span>
        )}
      </div>

      {/* Side-by-Side Identity Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        {/* Left: Claimed Brand Profile */}
        <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
            Visual &amp; Claimed Brand
          </div>
          {hasBrand ? (
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
                {brand.brand_display_name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Official Domain: <span className="mono" style={{ color: '#10b981' }}>{brand.brand_official_domain}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', flexWrap: 'wrap' }}>
                <span className="badge-info" style={{ padding: '2px 8px', borderRadius: '6px' }}>
                  Visual Match: {((brand.visual_similarity || 0) * 100).toFixed(0)}%
                </span>
                <span className="badge-info" style={{ padding: '2px 8px', borderRadius: '6px' }}>
                  Text Cues: {((brand.text_cue_similarity || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '10px 0' }}>
              No target enterprise trademark spoofing detected.
            </div>
          )}
        </div>

        {/* Center: Contradiction Bridge Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ArrowRight size={22} color={isContradiction ? '#ef4444' : '#10b981'} />
          <span style={{ fontSize: '0.65rem', color: isContradiction ? '#ef4444' : '#10b981', fontWeight: 700 }}>
            {isContradiction ? 'MISMATCH' : 'CONSISTENT'}
          </span>
        </div>

        {/* Right: Actual Hosting Domain */}
        <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
            Actual Infrastructure Origin
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }} className="mono">
            {targetDomain}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Domain Age: <strong style={{ color: isNrd ? '#ef4444' : '#10b981' }}>{domainAge}</strong>
            {isNrd && <span style={{ color: '#ef4444' }}> (NRD)</span>}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Registrar: {registrar} | TLD: .{tld}
          </div>
        </div>
      </div>

      {/* Rationale Explanation Box */}
      {isContradiction && brand?.contradiction_explanation && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '4px solid #ef4444',
          borderRadius: '6px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <AlertTriangle size={18} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fca5a5', marginBottom: '2px' }}>
              Explainable Contradiction Finding:
            </div>
            <div style={{ fontSize: '0.82rem', color: '#fecaca', lineHeight: 1.4 }}>
              {brand.contradiction_explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
