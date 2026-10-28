import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  Terminal,
  AlertTriangle,
  GitCommit,
  Layers,
  Lock,
  Activity,
  Puzzle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Cpu,
  Coins,
  Search,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

export interface LandingPageProps {
  theme?: 'dark' | 'light';
  onLaunchScanner: () => void;
  onOpenExtension: () => void;
  onOpenDiscovery: () => void;
  onScanUrl?: (url: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme = 'dark',
  onLaunchScanner,
  onOpenExtension,
  onOpenDiscovery,
  onScanUrl
}) => {
  const isLight = theme === 'light';
  const [quickUrl, setQuickUrl] = useState('');
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);
  const [cardViewMode, setCardViewMode] = useState<'stack' | 'grid'>('stack');

  const sampleTargets = [
    {
      url: 'campuskart.shop',
      label: 'Benign Store',
      score: '12.4',
      badge: 'SAFE',
      badgeClass: 'badge-safe',
      type: 'benign'
    },
    {
      url: 'login-paypal-security-verification.xyz',
      label: 'Phish Lookalike',
      score: '94.8',
      badge: 'MALICIOUS',
      badgeClass: 'badge-critical',
      type: 'phish'
    },
    {
      url: 'github.com',
      label: 'Hardened Tech',
      score: '2.1',
      badge: 'GRADE A+',
      badgeClass: 'badge-safe',
      type: 'hardened'
    }
  ];

  const pipelineStages = [
    {
      step: 1,
      name: 'Lexical Triage',
      badge: '< 10ms',
      color: '#00f0ff',
      summary: 'Entropy calculation, Punycode / IDN detection, hyphen clustering, and suspicious TLD classification.',
      detail: 'Instantly tokenizes the input URL across 45 lexical dimensions. Flags excessive subdomain depth, known phishing keywords ("login", "verify", "secure", "billing"), and high Shannon entropy.'
    },
    {
      step: 2,
      name: 'Google DoH & RDAP',
      badge: 'DNS / IP',
      color: '#3b82f6',
      summary: 'Direct DNS-over-HTTPS resolution, autonomous system (ASN) mapping, and registrar creation age lookup.',
      detail: 'Queries Google Cloud DoH resolvers and IANA RDAP feeds. Flags Newly Registered Domains (< 30 days) and high-risk bulletproof hosting infrastructure.'
    },
    {
      step: 3,
      name: 'SSL/TLS & Posture',
      badge: 'HARDENING',
      color: '#00ff88',
      summary: 'Certificate Transparency log validation, HSTS, CSP, X-Frame-Options, and SPF/DMARC spoofing resistance.',
      detail: 'Audits defensive header policies to compute an exploitability grade (A+ through F). Checks if the domain is vulnerable to Clickjacking or email impersonation.'
    },
    {
      step: 4,
      name: 'Playwright Sandbox',
      badge: 'DOM CRAWL',
      color: '#f59e0b',
      summary: 'Headless browser execution capturing DOM elements, password submission hooks, and redirect hops.',
      detail: 'Renders the target in an isolated sandbox. Detects credential harvesting input fields (<input type="password">), external exfiltration action URLs, and anti-analysis cloaking.'
    },
    {
      step: 5,
      name: 'pHash Brand Vision',
      badge: 'LOGO AI',
      color: '#ef4444',
      summary: 'Perceptual hashing (pHash) and visual logo matching comparing rendered page to verified brand catalog.',
      detail: 'Identifies brand visual assets (PayPal, Apple, Microsoft, Chase, Steam). Flags critical Brand-Domain Contradiction when trusted logos are hosted on unauthorized domains.'
    },
    {
      step: 6,
      name: 'Multi-Signal Fusion & AI Reasoning',
      badge: '0-100 VECTOR',
      color: '#c084fc',
      summary: 'Platt-scaled calibrated probability scoring fused with autonomous AI threat intelligence.',
      detail: 'Aggregates all 5 forensic vectors into a unified calibrated threat score with full attack-chain evidence, zero-trust telemetry, and instant 1-click remediation blueprints.'
    }
  ];

  const capabilityCards = [
    {
      id: 'brand-contradiction',
      step: '01',
      title: 'Brand-Domain Contradiction Engine',
      subtitle: 'Visual & Identity Verification',
      badge: 'PROPRIETARY',
      description: 'Detects when a page imitates the logos and visual identity of trusted brands (e.g. PayPal, Apple, Microsoft, Chase) while operating on an unauthorized, deceptive domain.',
      iconDark: <AlertTriangle size={24} color="#f87171" />,
      iconLight: <AlertTriangle size={24} color="#dc2626" />,
      iconBgDark: 'rgba(239, 68, 68, 0.15)',
      iconBgLight: '#fee2e2',
      iconBorderDark: 'rgba(239, 68, 68, 0.4)',
      iconBorderLight: '#fca5a5',
      glowColorDark: 'rgba(239, 68, 68, 0.25)',
      quote: '"Imitates Bank of America, but domain is unauthorized .xyz"',
      quoteColorDark: '#fca5a5',
      quoteColorLight: '#991b1b',
      quoteBgLight: '#fef2f2',
      quoteBorderDark: '#ef4444',
      quoteBorderLight: '#dc2626',
      subtitleColorDark: '#f87171',
      subtitleColorLight: '#b91c1c',
      tags: ['pHash 64-bit DCT', 'Visual Logo Catalog', 'Domain Impersonation', 'Brand Spoof Guard'],
      tooltip: {
        title: 'Brand-Domain Contradiction',
        description: 'Uses perceptual hashing (pHash) and visual logo matching to compare page visuals against a verified brand catalog. Detects deceptive impersonation.',
        securityImpact: 'Stops credential harvesting pages masquerading as banks, payment processors, or cloud portals.',
        goodVsBad: 'Authorized domains match officially registered parent brands; unauthorized domains flag brand contradiction.'
      }
    },
    {
      id: 'attack-chain',
      step: '02',
      title: 'Explainable Attack-Chain Reconstruction',
      subtitle: '7-Stage Forensic Path',
      badge: 'FORENSICS',
      description: 'Reconstructs a step-by-step forensic graph linking Ingress → DNS Infrastructure → Redirects → Landing DOM → Credential Forms → Exfiltration channels.',
      iconDark: <GitCommit size={24} color="#38bdf8" />,
      iconLight: <GitCommit size={24} color="#0284c7" />,
      iconBgDark: 'rgba(56, 189, 248, 0.15)',
      iconBgLight: '#e0f2fe',
      iconBorderDark: 'rgba(56, 189, 248, 0.4)',
      iconBorderLight: '#bae6fd',
      glowColorDark: 'rgba(56, 189, 248, 0.25)',
      quote: 'Step 1 (Ingress) → Step 5 (Credential Hook) → Step 7 (Verdict)',
      quoteColorDark: '#7dd3fc',
      quoteColorLight: '#0369a1',
      quoteBgLight: '#f0f9ff',
      quoteBorderDark: '#38bdf8',
      quoteBorderLight: '#0284c7',
      subtitleColorDark: '#38bdf8',
      subtitleColorLight: '#0284c7',
      tags: ['Ingress Link', 'Google DoH DNS', 'HTTP Redirect Bounces', 'Credential Form Traps'],
      tooltip: {
        title: '7-Stage Attack Chain Reconstruction',
        description: 'Maps the entire adversary lifecycle: Ingress Link, DNS Hosting, HTTP Redirect Bounces, Deceptive Landing DOM, Password Form Injection, and Data Exfiltration.',
        securityImpact: 'Gives SOC analysts explainable, actionable evidence for rapid incident response and threat takedowns.',
        goodVsBad: 'Clean sites have straightforward 2-step resolution; phishing campaigns exhibit multi-hop redirects and credential hooks.'
      }
    },
    {
      id: 'risk-fusion',
      step: '03',
      title: 'Multi-Signal Calibrated Risk Fusion',
      subtitle: '0-100 Probability Vector',
      badge: 'ML CALIBRATION',
      description: 'Fuses 5 independent vectors: Lexical ML features, Domain Age & DNS, DOM password forms, Visual Brand confidence, and Threat Intel into a unified 0–100 risk score.',
      iconDark: <Layers size={24} color="#60a5fa" />,
      iconLight: <Layers size={24} color="#2563eb" />,
      iconBgDark: 'rgba(59, 130, 246, 0.15)',
      iconBgLight: '#eff6ff',
      iconBorderDark: 'rgba(59, 130, 246, 0.4)',
      iconBorderLight: '#bfdbfe',
      glowColorDark: 'rgba(59, 130, 246, 0.25)',
      quote: 'Weighted contribution breakdown (+/- pts) for every signal',
      quoteColorDark: '#86efac',
      quoteColorLight: '#166534',
      quoteBgLight: '#f0fdf4',
      quoteBorderDark: '#22c55e',
      quoteBorderLight: '#16a34a',
      subtitleColorDark: '#4ade80',
      subtitleColorLight: '#15803d',
      tags: ['24-D Lexical Tensor', 'Platt Scaling Calibration', 'Shannon Entropy', 'Point Scoring Breakdown'],
      tooltip: {
        title: 'Calibrated Risk Scoring (0–100)',
        description: 'Combines ML lexical probabilities with forensic evidence points. Employs Platt scaling to prevent false positives and provide calibrated probability.',
        securityImpact: 'Ensures security teams prioritize high-confidence threats without being overwhelmed by alert fatigue.',
        goodVsBad: '0–29: Benign / Safe, 30–69: Suspicious / Under Review, 70–100: Malicious Phishing Campaign.'
      }
    },
    {
      id: 'security-audit',
      step: '04',
      title: 'Website Exploitability & Security Audit',
      subtitle: 'Defensive Posture Rating',
      badge: 'WEBSITE DEFENSE',
      description: 'Website owners can check their own domain defense posture: Clickjacking immunity (X-Frame-Options), Email spoofing resistance (SPF/DMARC), CSP, and HSTS.',
      iconDark: <Lock size={24} color="#4ade80" />,
      iconLight: <Lock size={24} color="#16a34a" />,
      iconBgDark: 'rgba(34, 197, 94, 0.15)',
      iconBgLight: '#f0fdf4',
      iconBorderDark: 'rgba(34, 197, 94, 0.4)',
      iconBorderLight: '#bbf7d0',
      glowColorDark: 'rgba(34, 197, 94, 0.25)',
      quote: 'Security Grades (A+ to F) + Actionable Developer Fixes',
      quoteColorDark: '#fde047',
      quoteColorLight: '#854d0e',
      quoteBgLight: '#fffbeb',
      quoteBorderDark: '#eab308',
      quoteBorderLight: '#d97706',
      subtitleColorDark: '#fbbf24',
      subtitleColorLight: '#b45309',
      actionText: 'Audit Your Own Domain',
      onAction: onLaunchScanner,
      tags: ['HSTS & CSP Headers', 'Clickjacking Immune', 'SPF/DMARC Spoof Defense', 'Executive Security Grade'],
      tooltip: {
        title: 'Website Exploitability Audit',
        description: 'Inspects HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) and DNS records (SPF, DMARC) to calculate an executive security grade.',
        securityImpact: 'Prevents Clickjacking, MIME type sniffing, XSS injection, and email spoofing impersonation.',
        goodVsBad: 'Grade A+/A: Hardened security headers; Grade D/F: Highly vulnerable to injection and spoofing.'
      }
    },
    {
      id: 'nrd-stream',
      step: '05',
      title: 'Newly Registered Domain (NRD) Stream',
      subtitle: 'High-Throughput Early-Warning',
      badge: 'STREAM FEED',
      description: 'High-throughput early-warning stream prioritizing unknown candidates hitting DNS logs and Certificate Transparency feeds before phishing campaigns go viral.',
      iconDark: <Activity size={24} color="#fb923c" />,
      iconLight: <Activity size={24} color="#ea580c" />,
      iconBgDark: 'rgba(249, 115, 22, 0.15)',
      iconBgLight: '#fff7ed',
      iconBorderDark: 'rgba(249, 115, 22, 0.4)',
      iconBorderLight: '#fed7aa',
      glowColorDark: 'rgba(249, 115, 22, 0.25)',
      quote: '< 10ms lexical triage + one-click escalation sandbox',
      quoteColorDark: '#fdba74',
      quoteColorLight: '#9a3412',
      quoteBgLight: '#fff7ed',
      quoteBorderDark: '#f97316',
      quoteBorderLight: '#ea580c',
      subtitleColorDark: '#fb923c',
      subtitleColorLight: '#c2410c',
      actionText: 'Explore NRD Stream',
      onAction: onOpenDiscovery,
      tags: ['CertStream Feed', '< 30d Quarantine', 'Sub-10ms Triage', 'Playwright Sandbox Escalation'],
      tooltip: {
        title: 'Newly Registered Domain (NRD) Pipeline',
        description: 'Ingests real-time domain creation feeds. Over 70% of zero-day attacks occur on domains under 30 days old. Filters malicious targets via sub-10ms lexical heuristics.',
        securityImpact: 'Enables SOC teams to block malicious infrastructure before phishing emails reach inboxes.',
        goodVsBad: 'Candidate domains with high lexical threat scores are escalated for instant Playwright sandbox inspection.'
      }
    },
    {
      id: 'chrome-ext',
      step: '06',
      title: 'Real-Time Chrome Browser Extension',
      subtitle: 'Endpoint Client Protection',
      badge: 'ENDPOINT AGENT',
      description: 'Manifest V3 sidecar auditing active tabs in real-time. Displays threat warning banners, visual trust gauges, and seamless 1-click inspection routing.',
      iconDark: <Puzzle size={24} color="#c084fc" />,
      iconLight: <Puzzle size={24} color="#9333ea" />,
      iconBgDark: 'rgba(192, 132, 252, 0.15)',
      iconBgLight: '#faf5ff',
      iconBorderDark: 'rgba(192, 132, 252, 0.4)',
      iconBorderLight: '#e9d5ff',
      glowColorDark: 'rgba(192, 132, 252, 0.25)',
      quote: 'Active browser background monitoring & instant badge telemetry',
      quoteColorDark: '#d8b4fe',
      quoteColorLight: '#581c87',
      quoteBgLight: '#faf5ff',
      quoteBorderDark: '#a855f7',
      quoteBorderLight: '#9333ea',
      subtitleColorDark: '#c084fc',
      subtitleColorLight: '#7e22ce',
      actionText: 'Download Extension',
      onAction: onOpenExtension,
      tags: ['Manifest V3 Sidecar', 'Silent Tab Audit', 'Visual Trust Gauge', 'Instant Deep-Dive Routing'],
      tooltip: {
        title: 'Real-Time Chrome Browser Extension',
        description: 'Browser sidecar that audits active tabs in real-time. Features badge alerts, threat warnings, and direct 1-click launch to the CyberGuard AI command center.',
        securityImpact: 'Endpoints receive instantaneous zero-hour protection against deceptive links.',
        goodVsBad: 'Green shield = verified safe; Red shield = malicious credential harvester intercepted.'
      }
    }
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      onLaunchScanner();
      setTimeout(() => {
        if (onScanUrl) {
          onScanUrl(quickUrl.trim());
        }
      }, 2900);
    }
  };

  const handleSampleClick = (url: string) => {
    setQuickUrl(url);
    onLaunchScanner();
    setTimeout(() => {
      if (onScanUrl) {
        onScanUrl(url);
      }
    }, 2900);
  };

  return (
    <div style={{ padding: '0 24px 48px 24px', maxWidth: '1360px', margin: '0 auto' }}>
      {/* 1. Live Threat Intelligence Marquee Ticker -> Neo-Brutalism */}
      <div
        style={{
          marginBottom: '24px',
          padding: '12px 18px',
          overflow: 'hidden',
          borderRadius: '0px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: isLight ? '#38BDF8' : 'rgba(10, 16, 28, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: isLight ? '4px solid #000000' : '1.5px solid rgba(255, 255, 255, 0.18)',
          boxShadow: isLight ? '6px 6px 0px 0px #000000' : '0 10px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0.5px rgba(255, 255, 255, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, background: '#000000', color: '#38BDF8', padding: '4px 10px', border: isLight ? '2px solid #000000' : '2px solid #38BDF8' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '0px', backgroundColor: '#FF6B6B', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.76rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            LIVE THREAT TELEMETRY
          </span>
        </div>

        <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
          <div className="ticker-track">
            {/* Ticker items loop */}
            {[1, 2].map((loopIdx) => (
              <div key={loopIdx} style={{ display: 'flex', alignItems: 'center', gap: '28px', paddingRight: '28px' }}>
                <span style={{ fontSize: '0.8rem', color: isLight ? '#000000' : '#E2E8F0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={15} color={isLight ? '#000000' : '#FF6B6B'} strokeWidth={2.6} />
                  <span>INTERCEPTED: login-paypal-security-verification.xyz (Risk: 94.8 | Phish)</span>
                </span>
                <span style={{ color: isLight ? '#000000' : '#38BDF8', fontWeight: 900 }}>■</span>
                <span style={{ fontSize: '0.8rem', color: isLight ? '#000000' : '#E2E8F0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color={isLight ? '#000000' : '#38BDF8'} strokeWidth={2.6} />
                  <span>VERIFIED HARDENED: github.com (Score: 2.1 | A+ Posture)</span>
                </span>
                <span style={{ color: isLight ? '#000000' : '#38BDF8', fontWeight: 900 }}>■</span>
                <span style={{ fontSize: '0.8rem', color: isLight ? '#000000' : '#E2E8F0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={15} color={isLight ? '#000000' : '#FCD34D'} strokeWidth={2.6} />
                  <span>ZERO-TRUST SOC: Multi-Signal Deep Forensics &amp; Brand Vision Active (100% Free)</span>
                </span>
                <span style={{ color: isLight ? '#000000' : '#38BDF8', fontWeight: 900 }}>■</span>
                <span style={{ fontSize: '0.8rem', color: isLight ? '#000000' : '#E2E8F0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={15} color={isLight ? '#000000' : '#38BDF8'} strokeWidth={2.6} />
                  <span>CERTSTREAM INGEST: 4,820 NRD candidates triaged in &lt;10ms</span>
                </span>
                <span style={{ color: isLight ? '#000000' : '#38BDF8', fontWeight: 900 }}>■</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Hero Section with Liquid Glass Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="liquid-glass-hero"
        style={{
          padding: '52px 32px 40px 32px',
          marginBottom: '36px',
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.7) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(56, 189, 248, 0.08) 25%, rgba(168, 85, 247, 0.06) 60%, rgba(255, 255, 255, 0.03) 100%), rgba(6, 11, 22, 0.22)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          border: isLight ? '4px solid #000000' : '1.5px solid rgba(255, 255, 255, 0.28)',
          borderRadius: '0px',
          boxShadow: isLight
            ? '12px 12px 0px 0px #000000'
            : '0 30px 70px -15px rgba(0, 0, 0, 0.7), inset 0 2px 2px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 3px 0 rgba(0, 0, 0, 0.6), inset 2px 0 2px 0 rgba(255, 255, 255, 0.15), inset -2px 0 2px 0 rgba(56, 189, 248, 0.2), 0 0 50px rgba(56, 189, 248, 0.16)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="liquid-glass-sheen" />
        {/* Hacker Badge with Rotated Sticker Effect */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#38BDF8',
            border: isLight ? '3px solid #000000' : '2px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
            borderRadius: '0px',
            padding: '6px 18px',
            fontSize: '0.78rem',
            color: '#000000',
            fontWeight: 900,
            letterSpacing: '0.06em',
            marginBottom: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            transform: 'rotate(-1.5deg)'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '0px', backgroundColor: '#000000', display: 'inline-block' }}></span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>CYBER COMMAND TERMINAL // CORE V2.0</span>
          <InfoTooltip
            title="Cyber Command Core V2.0"
            description="Antigravity-engineered zero-trust cybersecurity operating environment running real-time ML pipelines, live WHOIS RDAP resolvers, and multi-modal brand vision."
            position="bottom"
          />
        </motion.div>

        {/* Main Headline with High-Impact Space Grotesk Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            maxWidth: '1000px',
            margin: '0 auto 18px auto',
            lineHeight: 1.1
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: 'clamp(2.6rem, 6.5vw, 4.8rem)',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: '#000000',
              lineHeight: 1.08,
              marginBottom: '6px',
              background: '#FF6B6B',
              padding: '2px 16px',
              border: isLight ? '4px solid #000000' : '3px solid #000000',
              boxShadow: '6px 6px 0px 0px #000000',
              transform: 'rotate(0.8deg)'
            }}
          >
            NEXT EVOLUTION
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 'clamp(2.6rem, 6.5vw, 4.8rem)',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1.08,
              color: isLight ? '#000000' : '#FFFFFF',
              marginTop: '10px'
            }}
          >
            OF CYBER DEFENSE.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
          style={{
            fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
            color: isLight ? '#000000' : '#94A3B8',
            maxWidth: '780px',
            margin: '0 auto 32px auto',
            lineHeight: 1.55,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif"
          }}
        >
          Where human intelligence meets machine speed. Discover next-generation zero-trust defense, real-time phishing forensics, and autonomous threat mitigation.
        </motion.p>

        {/* Hero Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="hero-action-buttons"
          style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}
        >
          <motion.button
            whileHover={{ translateY: -3, boxShadow: '8px 8px 0px 0px #000000' }}
            whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '2px 2px 0px 0px #000000' }}
            onClick={onLaunchScanner}
            className="hero-pill-btn-primary"
            style={{
              borderRadius: '0px',
              padding: '14px 34px',
              fontSize: '1rem',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              border: '4px solid #000000',
              background: '#FF6B6B',
              color: '#000000',
              boxShadow: '6px 6px 0px 0px #000000'
            }}
          >
            <Zap size={20} color="#000000" strokeWidth={2.8} />
            <span>Explore Technology</span>
            <ArrowRight size={20} color="#000000" strokeWidth={2.8} />
          </motion.button>

          <motion.button
            whileHover={{ translateY: -3, boxShadow: '8px 8px 0px 0px #000000' }}
            whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '2px 2px 0px 0px #000000' }}
            onClick={onOpenExtension}
            className="hero-pill-btn-secondary"
            style={{
              borderRadius: '0px',
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              border: '4px solid #000000',
              background: '#C4B5FD',
              color: '#000000',
              boxShadow: '6px 6px 0px 0px #000000'
            }}
          >
            <Sparkles size={20} color="#000000" strokeWidth={2.8} />
            <span>Discover the Future</span>
          </motion.button>
        </motion.div>

        {/* Interactive Quick-Audit Search Bar (Styled with Neo-Brutalist Border & Hard Shadow) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          style={{
            maxWidth: '780px',
            margin: '0 auto 28px auto'
          }}
        >
          <form
            onSubmit={handleQuickSubmit}
            style={{
              background: isLight ? '#FFFFFF' : 'rgba(15, 23, 42, 0.45)',
              backdropFilter: isLight ? 'none' : 'blur(16px)',
              WebkitBackdropFilter: isLight ? 'none' : 'blur(16px)',
              border: isLight ? '4px solid #000000' : '2px solid rgba(56, 189, 248, 0.65)',
              borderRadius: '0px',
              padding: '8px 8px 8px 18px',
              boxShadow: isLight
                ? '8px 8px 0px 0px #000000'
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.15)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', color: isLight ? '#000000' : '#38BDF8' }}>
              <Search size={22} strokeWidth={2.8} />
            </div>
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Enter domain or link (e.g. login-paypal-security-verification.xyz)"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: isLight ? '#000000' : '#FFFFFF',
                fontSize: '0.96rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                outline: 'none',
                padding: '8px 4px'
              }}
            />
            <motion.button
              whileHover={{ translateY: -2, boxShadow: '4px 4px 0px 0px #000000' }}
              whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '0px 0px 0px 0px #000000' }}
              type="submit"
              style={{
                background: '#38BDF8',
                color: '#000000',
                border: isLight ? '3px solid #000000' : '2px solid #000000',
                borderRadius: '0px',
                padding: '12px 26px',
                fontWeight: 900,
                fontSize: '0.9rem',
                fontFamily: "'Space Grotesk', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isLight ? '3px 3px 0px 0px #000000' : '3px 3px 0px 0px rgba(0, 0, 0, 0.6)',
                flexShrink: 0
              }}
            >
              <Radar size={18} strokeWidth={2.8} />
              <span>Audit Target</span>
            </motion.button>
          </form>

          {/* Quick-test Sample Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '0 6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: isLight ? '#000000' : '#94A3B8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>QUICK SAMPLES:</span>
            {sampleTargets.map((s) => (
              <motion.button
                key={s.url}
                whileHover={{ translateY: -2, boxShadow: '3px 3px 0px 0px #000000' }}
                whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '0px 0px 0px 0px #000000' }}
                onClick={() => handleSampleClick(s.url)}
                type="button"
                style={{
                  background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: isLight ? 'none' : 'blur(12px)',
                  WebkitBackdropFilter: isLight ? 'none' : 'blur(12px)',
                  border: isLight ? '2px solid #000000' : '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: '0px',
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: isLight ? '#000000' : '#F1F5F9',
                  boxShadow: isLight ? '2px 2px 0px 0px #000000' : 'inset 0 1px 0.5px rgba(255, 255, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span style={{ fontWeight: 800 }}>{s.url}</span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    padding: '2px 6px',
                    borderRadius: '0px',
                    fontWeight: 900,
                    border: '1.5px solid #000000',
                    background: s.type === 'phish' ? '#FF6B6B' : s.type === 'hardened' ? '#38BDF8' : '#C4B5FD',
                    color: '#000000'
                  }}
                >
                  {s.badge}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Scan Protocol Notice */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '14px' }}>
            <Zap size={15} color={isLight ? '#000000' : '#38BDF8'} strokeWidth={2.8} />
            <span style={{ fontSize: '0.78rem', color: isLight ? '#000000' : '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              100% Free &amp; Open Access • Full Headless Sandbox, Brand pHash Vision &amp; CyberAI <span style={{ background: '#38BDF8', color: '#000000', padding: '1px 6px', border: '1.5px solid #000000' }}>Unlocked (No Paywalls)</span>
            </span>
          </div>
        </motion.div>

        {/* Telemetry Status Bar with Liquid Glass Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', maxWidth: '980px', margin: '36px auto 0 auto', borderTop: isLight ? '4px solid #000000' : '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '24px' }}>
          <motion.div
            whileHover={{ translateY: -3, boxShadow: '6px 6px 0px 0px #000000' }}
            style={{
              background: isLight ? '#FFFDF5' : 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: isLight ? '3px solid #000000' : '1px solid rgba(255, 255, 255, 0.18)',
              padding: '12px 14px',
              borderRadius: '0px',
              boxShadow: isLight ? '4px 4px 0px 0px #000000' : 'inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 10px 20px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: isLight ? '#000000' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>0.0 – 100</span>
              <InfoTooltip
                title="Calibrated Risk Index"
                description="Consolidated 0–100 threat probability index fusing lexical, hosting, brand, and DOM signals."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: isLight ? '#000000' : '#94A3B8', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '4px' }}>CALIBRATED RISK INDEX</div>
          </motion.div>

          <motion.div
            whileHover={{ translateY: -3, boxShadow: '6px 6px 0px 0px #000000' }}
            style={{
              background: isLight ? '#FFFDF5' : 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: isLight ? '3px solid #000000' : '1px solid rgba(255, 255, 255, 0.18)',
              padding: '12px 14px',
              borderRadius: '0px',
              boxShadow: isLight ? '4px 4px 0px 0px #000000' : 'inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 10px 20px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: isLight ? '#000000' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>7-STAGE</span>
              <InfoTooltip
                title="7-Stage Attack Graph"
                description="Chronological forensic graph linking domain ingress to credential submission forms."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: isLight ? '#000000' : '#94A3B8', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '4px' }}>ATTACK-CHAIN GRAPH</div>
          </motion.div>

          <motion.div
            whileHover={{ translateY: -3, boxShadow: '6px 6px 0px 0px #000000' }}
            style={{
              background: isLight ? '#FFFDF5' : 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: isLight ? '3px solid #000000' : '1px solid rgba(255, 255, 255, 0.18)',
              padding: '12px 14px',
              borderRadius: '0px',
              boxShadow: isLight ? '4px 4px 0px 0px #000000' : 'inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 10px 20px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: isLight ? '#000000' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>&lt; 30 DAYS</span>
              <InfoTooltip
                title="Newly Registered Domains (NRD)"
                description="Domains registered in the last 30 days are automatically placed on heightened surveillance."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: isLight ? '#000000' : '#94A3B8', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '4px' }}>NRD EARLY WARNING</div>
          </motion.div>

          <motion.div
            whileHover={{ translateY: -3, boxShadow: '6px 6px 0px 0px #000000' }}
            style={{
              background: isLight ? '#FFFDF5' : 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: isLight ? '3px solid #000000' : '1px solid rgba(255, 255, 255, 0.18)',
              padding: '12px 14px',
              borderRadius: '0px',
              boxShadow: isLight ? '4px 4px 0px 0px #000000' : 'inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 10px 20px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: isLight ? '#000000' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>ZERO PAYWALL</span>
              <InfoTooltip
                title="100% Free & Open Access"
                description="Community cybersecurity intelligence platform. All deep forensic audits and AI features are 100% free with zero fees."
                position="top"
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#000000', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '4px' }}>COMMUNITY ACCESS</div>
          </motion.div>
        </div>
      </motion.div>

      {/* 3. Interactive 6-Stage Defense Pipeline Visualizer -> Neo-Brutalist Layout */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4 }}
        className="liquid-glass-hero"
        style={{
          padding: '28px',
          marginBottom: '36px',
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.7) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(56, 189, 248, 0.04) 25%, rgba(168, 85, 247, 0.03) 60%, rgba(255, 255, 255, 0.02) 100%), rgba(8, 14, 26, 0.35)',
          backdropFilter: 'blur(24px) saturate(200%) contrast(105%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%) contrast(105%)',
          border: isLight ? '4px solid #000000' : '1.5px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '0px',
          boxShadow: isLight
            ? '10px 10px 0px 0px #000000'
            : '0 30px 60px -15px rgba(0, 0, 0, 0.65), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.5), 0 0 35px rgba(56, 189, 248, 0.12)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={24} color={isLight ? '#000000' : '#38BDF8'} strokeWidth={2.8} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', color: isLight ? '#000000' : '#FFFFFF', letterSpacing: '-0.01em' }}>
              AUTONOMOUS 6-STAGE INSPECTION PIPELINE
            </h2>
            <InfoTooltip
              title="6-Stage Autonomous Engine"
              description="Click any stage below to explore how CyberGuard AI analyzes domains from raw input string to deep cryptographic verification."
              position="bottom"
            />
          </div>
          <span
            style={{
              fontSize: '0.74rem',
              padding: '4px 12px',
              borderRadius: '0px',
              background: '#38BDF8',
              border: isLight ? '2px solid #000000' : '2px solid #000000',
              boxShadow: '2px 2px 0px 0px #000000',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: '#000000'
            }}
          >
            CLICK ANY STAGE TO INSPECT
          </span>
        </div>

        {/* Pipeline Stage Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '22px' }}>
          {pipelineStages.map((stage, idx) => {
            const isSelected = activePipelineStep === idx;
            return (
              <motion.button
                key={stage.step}
                whileHover={{ translateY: -3, boxShadow: '5px 5px 0px 0px #000000' }}
                whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '1px 1px 0px 0px #000000' }}
                onClick={() => setActivePipelineStep(idx)}
                style={{
                  background: isSelected ? '#38BDF8' : (isLight ? '#FFFDF5' : 'rgba(30, 41, 59, 0.7)'),
                  border: isSelected ? '4px solid #000000' : (isLight ? '3px solid #000000' : '2px solid rgba(56, 189, 248, 0.25)'),
                  borderRadius: '0px',
                  padding: '14px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected ? '6px 6px 0px 0px #000000' : (isLight ? '3px 3px 0px 0px #000000' : '3px 3px 0px 0px rgba(0, 0, 0, 0.5)'),
                  transition: 'background-color 0.1s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: isSelected ? '#000000' : (isLight ? '#000000' : '#E2E8F0'), fontFamily: "'Space Grotesk', sans-serif" }}>
                    STAGE 0{stage.step}
                  </span>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      color: '#000000',
                      background: '#FFFFFF',
                      border: '1.5px solid #000000',
                      padding: '2px 6px',
                      borderRadius: '0px',
                      fontWeight: 900,
                      textTransform: 'uppercase'
                    }}
                  >
                    {stage.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: isSelected ? '#000000' : (isLight ? '#000000' : '#FFFFFF'), fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stage.name}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePipelineStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: isLight ? '#FFFDF5' : 'rgba(15, 23, 42, 0.85)',
              border: isLight ? '3px solid #000000' : '2px solid #38BDF8',
              borderRadius: '0px',
              boxShadow: isLight ? '4px 4px 0px 0px #000000' : '4px 4px 0px 0px rgba(0, 0, 0, 0.5)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={20} color={isLight ? '#000000' : '#38BDF8'} strokeWidth={2.8} />
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: isLight ? '#000000' : '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
                Stage 0{pipelineStages[activePipelineStep].step}: {pipelineStages[activePipelineStep].name}
              </span>
            </div>
            <p style={{ fontSize: '0.92rem', color: isLight ? '#000000' : '#E2E8F0', lineHeight: 1.55, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {pipelineStages[activePipelineStep].summary}
            </p>
            <p style={{ fontSize: '0.85rem', color: isLight ? '#000000' : '#94A3B8', lineHeight: 1.6, fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif" }}>
              {pipelineStages[activePipelineStep].detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 4. Brand Contradiction Live Simulation Showcase -> Neo-Brutalism */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4 }}
        className="liquid-glass-hero"
        style={{
          padding: '28px',
          marginBottom: '36px',
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.7) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(56, 189, 248, 0.04) 25%, rgba(168, 85, 247, 0.03) 60%, rgba(255, 255, 255, 0.02) 100%), rgba(8, 14, 26, 0.35)',
          backdropFilter: 'blur(24px) saturate(200%) contrast(105%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%) contrast(105%)',
          border: isLight ? '4px solid #000000' : '1.5px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '0px',
          boxShadow: isLight
            ? '10px 10px 0px 0px #000000'
            : '0 30px 60px -15px rgba(0, 0, 0, 0.65), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.5), 0 0 35px rgba(56, 189, 248, 0.12)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <AlertTriangle size={24} color={isLight ? '#000000' : '#FF6B6B'} strokeWidth={2.8} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', color: isLight ? '#000000' : '#FFFFFF', letterSpacing: '-0.01em' }}>
            WHY TRADITIONAL SECURITY FAILS: BRAND CONTRADICTION
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Legitimate Brand Card */}
          <div style={{
            background: isLight ? '#FFFDF5' : 'rgba(15, 23, 42, 0.85)',
            border: isLight ? '3px solid #000000' : '2px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '0px',
            padding: '22px',
            boxShadow: isLight ? '6px 6px 0px 0px #000000' : '6px 6px 0px 0px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', color: isLight ? '#000000' : '#E2E8F0', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>AUTHORIZED OFFICIAL SITE</span>
              <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '0px', background: '#C4B5FD', border: '2px solid #000000', fontWeight: 900, color: '#000000', textTransform: 'uppercase' }}>100% MATCH</span>
            </div>
            <div style={{ fontSize: '0.96rem', color: isLight ? '#000000' : '#38BDF8', fontWeight: 900, marginBottom: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>
              https://www.paypal.com/signin
            </div>
            <div style={{ fontSize: '0.85rem', color: isLight ? '#000000' : '#CBD5E1', lineHeight: 1.6, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
              • Rendered Visual: <strong style={{ color: isLight ? '#000000' : '#FFFFFF', fontWeight: 900 }}>PayPal</strong> logo verified<br />
              • Domain Match: <strong style={{ color: isLight ? '#000000' : '#FFFFFF', fontWeight: 900 }}>paypal.com</strong> (Officially Authorized)<br />
              • Verdict: <strong style={{ background: '#C4B5FD', color: '#000000', padding: '1px 6px', border: '1.5px solid #000000', fontWeight: 900 }}>SAFE (Risk: 2.4/100)</strong>
            </div>
          </div>

          {/* Adversary Impersonator Card */}
          <div style={{
            background: isLight ? '#FFFDF5' : 'rgba(15, 23, 42, 0.85)',
            border: isLight ? '3px solid #000000' : '2px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '0px',
            padding: '22px',
            boxShadow: isLight ? '6px 6px 0px 0px #000000' : '6px 6px 0px 0px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', color: isLight ? '#000000' : '#E2E8F0', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>ADVERSARY PHISHING HARVESTER</span>
              <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '0px', background: '#FF6B6B', border: '2px solid #000000', fontWeight: 900, color: '#000000', textTransform: 'uppercase' }}>CRITICAL CONTRADICTION</span>
            </div>
            <div style={{ fontSize: '0.96rem', color: isLight ? '#000000' : '#FF6B6B', fontWeight: 900, marginBottom: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>
              https://login-paypal-security-verify.xyz
            </div>
            <div style={{ fontSize: '0.85rem', color: isLight ? '#000000' : '#CBD5E1', lineHeight: 1.6, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
              • Rendered Visual: <strong style={{ color: isLight ? '#000000' : '#FFFFFF', fontWeight: 900 }}>PayPal</strong> logo matched via pHash (99.4%)<br />
              • Domain Match: <strong style={{ color: isLight ? '#000000' : '#FFFFFF', fontWeight: 900 }}>login-paypal-security-verify.xyz</strong> (UNAUTHORIZED)<br />
              • Verdict: <strong style={{ background: '#FF6B6B', color: '#000000', padding: '1px 6px', border: '1.5px solid #000000', fontWeight: 900 }}>BLOCKED (Risk: 96.2/100 | Phish)</strong>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. Cyber Defense Capabilities Header with Card View Mode Switcher -> Neo-Brutalism */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={24} color={isLight ? '#000000' : '#38BDF8'} strokeWidth={2.8} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', color: isLight ? '#000000' : '#FFFFFF', letterSpacing: '-0.01em' }}>
              CYBER DEFENSE CAPABILITY STACK
            </h2>
            <InfoTooltip
              title="Cyber Defense Capability Stack"
              description="Scroll down to peel through each modular defense layer in the zero-trust pipeline, or toggle to the expanded grid view."
              position="right"
            />
          </div>
          <p style={{ fontSize: '0.84rem', color: isLight ? '#000000' : '#94A3B8', marginTop: '4px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
            Scroll through the 6 defensive modules or select any layer to inspect technical forensics
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isLight ? '#FFFDF5' : 'rgba(15, 23, 42, 0.85)', border: isLight ? '3px solid #000000' : '2px solid rgba(56, 189, 248, 0.3)', padding: '4px', borderRadius: '0px', boxShadow: isLight ? '4px 4px 0px 0px #000000' : '4px 4px 0px 0px rgba(0, 0, 0, 0.5)' }}>
          <motion.button
            whileHover={{ translateY: -2 }}
            whileTap={{ transform: 'translate(2px, 2px)' }}
            onClick={() => setCardViewMode('stack')}
            style={{
              background: cardViewMode === 'stack' ? '#38BDF8' : 'transparent',
              color: cardViewMode === 'stack' ? '#000000' : (isLight ? '#000000' : '#E2E8F0'),
              border: cardViewMode === 'stack' ? '2px solid #000000' : 'none',
              borderRadius: '0px',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: cardViewMode === 'stack' ? '2px 2px 0px 0px #000000' : 'none',
              transition: 'background-color 0.1s ease'
            }}
          >
            <Layers size={16} color={cardViewMode === 'stack' ? '#000000' : (isLight ? '#000000' : '#38BDF8')} strokeWidth={2.6} />
            <span>STACKED SCROLL DECK</span>
          </motion.button>

          <motion.button
            whileHover={{ translateY: -2 }}
            whileTap={{ transform: 'translate(2px, 2px)' }}
            onClick={() => setCardViewMode('grid')}
            style={{
              background: cardViewMode === 'grid' ? '#38BDF8' : 'transparent',
              color: cardViewMode === 'grid' ? '#000000' : (isLight ? '#000000' : '#E2E8F0'),
              border: cardViewMode === 'grid' ? '2px solid #000000' : 'none',
              borderRadius: '0px',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: cardViewMode === 'grid' ? '2px 2px 0px 0px #000000' : 'none',
              transition: 'background-color 0.1s ease'
            }}
          >
            <LayoutGrid size={16} color={cardViewMode === 'grid' ? '#000000' : (isLight ? '#000000' : '#38BDF8')} strokeWidth={2.6} />
            <span>EXPANDED 3D GRID</span>
          </motion.button>
        </div>
      </div>

      {/* Quick Jump Navigator Pills */}
      {cardViewMode === 'stack' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '24px', flexWrap: 'nowrap' }}>
          <span style={{ fontSize: '0.76rem', color: isLight ? '#000000' : '#94A3B8', fontWeight: 900, textTransform: 'uppercase', flexShrink: 0, letterSpacing: '0.04em' }}>
            QUICK SCROLL JUMP:
          </span>
          {capabilityCards.map((c, idx) => (
            <motion.button
              key={c.id}
              whileHover={{ translateY: -2, boxShadow: '3px 3px 0px 0px #000000' }}
              whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '0px 0px 0px 0px #000000' }}
              onClick={() => {
                const el = document.getElementById(`stack-card-${c.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              style={{
                background: isLight ? '#FFFFFF' : 'rgba(30, 41, 59, 0.85)',
                border: isLight ? '2px solid #000000' : '2px solid rgba(56, 189, 248, 0.3)',
                color: isLight ? '#000000' : '#FFFFFF',
                borderRadius: '0px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: isLight ? '2px 2px 0px 0px #000000' : '2px 2px 0px 0px rgba(0, 0, 0, 0.5)',
                transition: 'transform 0.1s ease'
              }}
            >
              <span>0{idx + 1} {c.title.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* 6. Card Scroll Animation Stacking Deck or Grid -> Neo-Brutalism */}
      {cardViewMode === 'stack' ? (
        <div className="card-stack-container" style={{ position: 'relative', marginTop: '10px' }}>
          {capabilityCards.map((card, index) => {
            const subtitleColor = isLight ? '#000000' : '#94A3B8';
            const quoteColor = '#000000';
            const quoteBg = '#38BDF8';
            const rightBoxBg = isLight ? '#FFFDF5' : 'rgba(15, 23, 42, 0.85)';
            const rightBoxBorder = isLight ? '3px solid #000000' : '2px solid rgba(56, 189, 248, 0.3)';
            const tagBg = isLight ? '#FFFDF5' : 'rgba(30, 41, 59, 0.8)';
            const tagBorder = isLight ? '2px solid #000000' : '1.5px solid rgba(56, 189, 248, 0.3)';
            const labelColor = isLight ? '#000000' : '#E2E8F0';

            return (
              <motion.div
                id={`stack-card-${card.id}`}
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="glass-panel card-stack-item"
                style={{
                  top: `${90 + index * 24}px`,
                  zIndex: 10 + index,
                  background: isLight ? '#FFFFFF' : 'rgba(18, 24, 38, 0.85)',
                  backdropFilter: isLight ? 'none' : 'blur(16px)',
                  WebkitBackdropFilter: isLight ? 'none' : 'blur(16px)',
                  border: isLight ? '4px solid #000000' : '3px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '0px',
                  padding: '32px 28px',
                  marginBottom: index === capabilityCards.length - 1 ? '70px' : '45px',
                  boxShadow: isLight ? '10px 10px 0px 0px #000000' : '10px 10px 0px 0px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.1)'
                }}
              >
                {/* Card Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isLight ? '3px solid #000000' : '2px solid rgba(56, 189, 248, 0.3)', paddingBottom: '16px', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      background: '#38BDF8',
                      border: isLight ? '3px solid #000000' : '2px solid #000000',
                      padding: '12px',
                      borderRadius: '0px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '3px 3px 0px 0px #000000'
                    }}>
                      {card.iconLight}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', color: subtitleColor, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
                          MODULE // 0{index + 1} OF 06
                        </span>
                        <span style={{ fontSize: '0.66rem', padding: '2px 8px', borderRadius: '0px', fontWeight: 900, background: '#C4B5FD', border: '1.5px solid #000000', color: '#000000' }}>
                          {card.badge}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', color: isLight ? '#000000' : '#FFFFFF', marginTop: '4px', letterSpacing: '-0.01em' }}>
                        {card.title}
                      </h3>
                    </div>
                  </div>

                  <InfoTooltip
                    title={card.tooltip.title}
                    description={card.tooltip.description}
                    securityImpact={card.tooltip.securityImpact}
                    goodVsBad={card.tooltip.goodVsBad}
                    position="bottom"
                  />
                </div>

                {/* Card Body - 2 Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
                  {/* Left Side: Subtitle, Description & Tags */}
                  <div>
                    <div style={{ fontSize: '0.82rem', color: subtitleColor, fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      // {card.subtitle.toUpperCase()}
                    </div>
                    <p style={{ fontSize: '0.94rem', color: isLight ? '#000000' : '#CBD5E1', lineHeight: 1.6, marginBottom: '18px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {card.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                      {card.tags?.map((tag, tIdx) => (
                        <span key={tIdx} style={{
                          background: tagBg,
                          border: tagBorder,
                          borderRadius: '0px',
                          padding: '4px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 900,
                          color: isLight ? '#000000' : '#E2E8F0',
                          boxShadow: isLight ? '2px 2px 0px 0px #000000' : '2px 2px 0px 0px rgba(0, 0, 0, 0.5)'
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.76rem', color: labelColor, fontWeight: 800, textTransform: 'uppercase' }}>
                      • Status: <span style={{ background: '#38BDF8', color: '#000000', padding: '1px 6px', border: '1.5px solid #000000', fontWeight: 900 }}>ACTIVE FORENSIC LAYER</span> // Latency: <span style={{ background: '#C4B5FD', color: '#000000', padding: '1px 6px', border: '1.5px solid #000000', fontWeight: 900 }}>Sub-second</span>
                    </div>
                  </div>

                  {/* Right Side: Adversary Quote, Impact & Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: rightBoxBg, padding: '20px', borderRadius: '0px', border: rightBoxBorder, boxShadow: isLight ? '4px 4px 0px 0px #000000' : '4px 4px 0px 0px rgba(0, 0, 0, 0.5)' }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: labelColor, fontWeight: 900, marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        THREAT INTERCEPTION CRITERIA:
                      </div>
                      <div style={{
                        fontSize: '0.86rem',
                        fontWeight: 900,
                        color: quoteColor,
                        padding: '12px 16px',
                        background: quoteBg,
                        borderRadius: '0px',
                        border: '2px solid #000000',
                        boxShadow: '2px 2px 0px 0px #000000',
                        lineHeight: 1.55
                      }}>
                        {card.quote}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.74rem', color: labelColor, fontWeight: 900, marginBottom: '4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        SECURITY IMPACT:
                      </div>
                      <div style={{ fontSize: '0.88rem', color: isLight ? '#000000' : '#CBD5E1', lineHeight: 1.55, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {card.tooltip.securityImpact}
                      </div>
                    </div>

                    {card.actionText && (
                      <motion.button
                        whileHover={{ translateY: -2, boxShadow: '6px 6px 0px 0px #000000' }}
                        whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '1px 1px 0px 0px #000000' }}
                        onClick={() => card.onAction && card.onAction()}
                        style={{
                          background: '#FF6B6B',
                          border: isLight ? '3px solid #000000' : '2px solid #000000',
                          color: '#000000',
                          borderRadius: '0px',
                          padding: '12px 20px',
                          fontSize: '0.86rem',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '6px',
                          boxShadow: '4px 4px 0px 0px #000000'
                        }}
                      >
                        <span>{card.actionText}</span>
                        <ArrowRight size={17} strokeWidth={2.8} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Expanded 3D Grid View -> Neo-Brutalism */
        <div className="feature-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
          {capabilityCards.map((card, index) => {
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ translateY: -4, boxShadow: isLight ? '12px 12px 0px 0px #000000' : '12px 12px 0px 0px rgba(0, 0, 0, 0.8)' }}
                style={{
                  background: isLight ? '#FFFFFF' : 'rgba(18, 24, 38, 0.85)',
                  backdropFilter: isLight ? 'none' : 'blur(16px)',
                  WebkitBackdropFilter: isLight ? 'none' : 'blur(16px)',
                  border: isLight ? '4px solid #000000' : '3px solid rgba(56, 189, 248, 0.35)',
                  boxShadow: isLight ? '8px 8px 0px 0px #000000' : '8px 8px 0px 0px rgba(0, 0, 0, 0.7)',
                  padding: '24px',
                  borderRadius: '0px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Card Top Row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        background: '#38BDF8',
                        border: isLight ? '3px solid #000000' : '2px solid #000000',
                        padding: '10px',
                        borderRadius: '0px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '3px 3px 0px 0px #000000'
                      }}>
                        {card.iconLight}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', color: isLight ? '#000000' : '#FFFFFF', lineHeight: 1.25 }}>
                            {card.title}
                          </h3>
                          <InfoTooltip
                            title={card.tooltip.title}
                            description={card.tooltip.description}
                            securityImpact={card.tooltip.securityImpact}
                            goodVsBad={card.tooltip.goodVsBad}
                            position="bottom"
                          />
                        </div>
                        <div style={{ fontSize: '0.74rem', color: isLight ? '#000000' : '#94A3B8', fontWeight: 800, marginTop: '2px', textTransform: 'uppercase' }}>
                          {card.subtitle}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.64rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '0px',
                      background: '#C4B5FD',
                      border: '1.5px solid #000000',
                      color: '#000000',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.88rem', color: isLight ? '#000000' : '#CBD5E1', lineHeight: 1.6, marginBottom: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {card.description}
                  </p>
                </div>

                <div>
                  {/* Quote */}
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      color: '#000000',
                      background: '#38BDF8',
                      padding: '10px 14px',
                      borderRadius: '0px',
                      border: '2px solid #000000',
                      boxShadow: '2px 2px 0px 0px #000000',
                      marginBottom: card.actionText ? '12px' : '0'
                    }}
                  >
                    {card.quote}
                  </div>

                  {/* Action Button */}
                  {card.actionText && (
                    <motion.div
                      whileHover={{ x: 4 }}
                      onClick={() => card.onAction && card.onAction()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#000000',
                        fontSize: '0.84rem',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        marginTop: '12px',
                        background: '#FF6B6B',
                        padding: '6px 14px',
                        border: '2px solid #000000',
                        boxShadow: '2px 2px 0px 0px #000000'
                      }}
                    >
                      <span>{card.actionText}</span>
                      <ArrowRight size={15} strokeWidth={2.8} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
