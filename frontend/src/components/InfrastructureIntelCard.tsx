import React from 'react';
import { Server, Lock, ShieldAlert, MapPin, Database, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import type { DomainIntel, CrawlArtifacts } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface InfrastructureIntelCardProps {
  domainIntel?: DomainIntel;
  crawlArtifacts?: CrawlArtifacts;
  targetDomain?: string;
  onOpenAbout?: (topicId?: string) => void;
}

export const InfrastructureIntelCard: React.FC<InfrastructureIntelCardProps> = ({
  domainIntel,
  crawlArtifacts,
  targetDomain = 'Target Domain',
  onOpenAbout
}) => {
  if (!domainIntel) return null;

  const isUnregistered = domainIntel.is_registered === false;
  const isTlsValid = domainIntel.tls_valid === true;
  const isSelfSigned = !!domainIntel.tls_is_self_signed;
  const daysRemaining = domainIntel.tls_days_remaining;
  const isDaysUrgent = daysRemaining !== undefined && daysRemaining !== null && daysRemaining < 15;
  const isNrd = !!domainIntel.is_newly_registered;

  const geo = domainIntel.ip_geolocation;
  const dns = domainIntel.dns;

  const aRecords = dns?.a_records || [];
  const mxRecords = dns?.mx_records || [];
  const nsRecords = dns?.ns_records || [];

  if (isUnregistered) {
    return (
      <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px', borderRadius: '8px' }}>
              <Server size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Infrastructure &amp; Network Origin Intel
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Authoritative DNS &amp; ICANN Registry Telemetry
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-info mono" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
              UNREGISTERED DOMAIN (NXDOMAIN)
            </span>
            {onOpenAbout && (
              <button
                onClick={() => onOpenAbout('infrastructure-intel')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="About Infrastructure Intel"
              >
                <HelpCircle size={13} color="var(--accent-cyan)" />
                <span>About</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--code-box-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', lineHeight: 1.5 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
            No Active Infrastructure or Server Hosting
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            This domain does not have active DNS A/AAAA records or assigned web servers. It is currently unregistered or inactive on authoritative root resolvers.
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)' }}>DNS Status: <strong style={{ color: '#38bdf8' }}>{dns?.dns_status || 'NXDOMAIN'}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Registrar: <strong style={{ color: 'var(--text-primary)' }}>None (Unregistered)</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>TLS Handshake: <strong style={{ color: 'var(--text-muted)' }}>Inactive / No Server</strong></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <Server size={20} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Infrastructure &amp; Network Origin Intel
              </h3>
              <InfoTooltip
                title="Infrastructure &amp; Network Intel"
                description="Verifies the physical hosting server origin, IP routing, ASN carrier, and TLS/SSL cryptographic integrity."
                securityImpact="Attackers often host phishing pages on bulletproof VPS providers or newly registered domains with free temporary TLS certs."
                goodVsBad="Long-standing enterprise ASNs &amp; verified multi-year certs = High trust. Fast-flux IP hops &amp; newly minted certs = Threat."
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Physical hosting geolocation, routing ASN &amp; cryptographic telemetry
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className={isNrd ? 'badge-critical mono' : 'badge-safe mono'}
            style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}
          >
            {isNrd ? 'SUSPICIOUS NRD INFRASTRUCTURE' : 'VERIFIED HOSTING ORIGIN'}
          </span>
          {onOpenAbout && (
            <button
              onClick={() => onOpenAbout('infrastructure-intel')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="About Infrastructure Intel"
            >
              <HelpCircle size={13} color="var(--accent-cyan)" />
              <span>About</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: 2 Subsections (IP & ASN Origin | TLS Cryptography) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* Box 1: Geolocation & ASN Routing */}
        <div style={{ background: 'var(--code-box-bg)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <MapPin size={15} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Host Geolocation &amp; ASN
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Country / City:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {geo?.country || 'Global Anycast'} {geo?.city && geo.city !== 'Unknown City' ? `(${geo.city})` : ''}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Autonomous System:</span>
              <span className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {geo?.asn || (aRecords[0] ? `IP: ${aRecords[0]}` : 'Unresolved ASN')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Registrar Stand:</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.75rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {domainIntel.registrar || 'ICANN Accredited'}
              </span>
            </div>

            {crawlArtifacts?.crawl_time_ms ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Network RTT:</span>
                <span className="mono" style={{ fontSize: '0.75rem', color: '#10b981' }}>
                  {crawlArtifacts.crawl_time_ms} ms
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Box 2: TLS/SSL Certificate Cryptography */}
        <div style={{ background: 'var(--code-box-bg)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Lock size={15} color={isTlsValid && !isSelfSigned ? '#10b981' : '#ef4444'} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TLS / SSL Certificate Health
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Encryption Status:</span>
              <span style={{ fontWeight: 700, color: isTlsValid ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isTlsValid ? <CheckCircle2 size={13} /> : <ShieldAlert size={13} />}
                {isTlsValid ? 'Active TLS Handshake' : 'No TLS Handshake'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Certificate Issuer:</span>
              <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {domainIntel.tls_issuer || (isTlsValid ? 'Public CA' : 'None Detected')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Validity Window:</span>
              <span style={{ fontWeight: 600, color: isDaysUrgent ? '#f59e0b' : '#38bdf8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {daysRemaining !== undefined && daysRemaining !== null ? `${daysRemaining} days remaining` : (isTlsValid ? 'Active' : 'N/A')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Root Trust:</span>
              <span style={{ fontSize: '0.72rem', color: isSelfSigned ? '#ef4444' : isTlsValid ? '#10b981' : 'var(--text-muted)', fontWeight: 700 }}>
                {isSelfSigned ? 'Self-Signed (High Risk)' : isTlsValid ? 'Public CA Verified' : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live DNS Resolver Matrix */}
      <div style={{ background: 'var(--hero-bg)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active DNS Resolution Matrix
            </span>
          </div>
          <span className="mono" style={{ fontSize: '0.68rem', color: dns?.dns_status === 'RESOLVED' ? '#10b981' : '#f59e0b' }}>
            DNS Status: {dns?.dns_status || 'RESOLVED'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          {/* A Records */}
          <div style={{ background: 'var(--code-box-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>
              A Records (IPv4 Host):
            </div>
            <div className="mono" style={{ fontSize: '0.72rem', color: '#38bdf8', wordBreak: 'break-all' }}>
              {aRecords.length > 0 ? aRecords.slice(0, 2).join(', ') : 'None Found'}
            </div>
          </div>

          {/* MX Records */}
          <div style={{ background: 'var(--code-box-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>
              MX Records (Mail Routing):
            </div>
            <div className="mono" style={{ fontSize: '0.72rem', color: '#a78bfa', wordBreak: 'break-all' }}>
              {mxRecords.length > 0 ? mxRecords.slice(0, 1).join(', ') : 'None Published'}
            </div>
          </div>

          {/* Authoritative Nameservers */}
          <div style={{ background: 'var(--code-box-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>
              Authoritative Nameservers:
            </div>
            <div className="mono" style={{ fontSize: '0.72rem', color: '#34d399', wordBreak: 'break-all' }}>
              {nsRecords.length > 0 ? nsRecords.slice(0, 1).join(', ') : 'None'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

