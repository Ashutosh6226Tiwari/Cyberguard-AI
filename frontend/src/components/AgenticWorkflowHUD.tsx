import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import PaperCrumpleCard from './PaperCrumpleCard';

export interface AgenticStep {
  id: string;
  stage: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'paused_for_payment' | 'failed';
  detail?: string;
  timestamp?: string;
}

interface AgenticWorkflowHUDProps {
  currentStage: number; // 0 to 7
  targetUrl: string;
  isPaid: boolean;
  onOpenPaymentModal: () => void;
  txId?: string;
  theme?: 'dark' | 'light';
}

export const AgenticWorkflowHUD: React.FC<AgenticWorkflowHUDProps> = ({
  currentStage,
  targetUrl,
  isPaid,
  onOpenPaymentModal,
  txId,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const steps: AgenticStep[] = [
    {
      id: 'step-1',
      stage: 'INGRESS & LEXICAL ML',
      action: 'Extracting 24-D Lexical Tensor & Shannon Entropy',
      status: currentStage > 0 ? 'completed' : currentStage === 0 ? 'running' : 'pending',
      detail: 'Evaluates URL structure, brand-in-subdomain, and character entropy in <15ms.'
    },
    {
      id: 'step-2',
      stage: 'AUTHORITATIVE RDAP & DNS',
      action: 'Querying IETF RDAP Registry & Google DoH Servers',
      status: currentStage > 1 ? 'completed' : currentStage === 1 ? 'running' : 'pending',
      detail: 'Resolves exact domain registration date, registrar name, and DNS A/NS/MX records.'
    },
    {
      id: 'step-3',
      stage: 'DECISION BOUNDARY',
      action: 'Initial Risk Calculation & Deep Audit Escalation',
      status: currentStage > 2 ? 'completed' : currentStage === 2 ? 'running' : 'pending',
      detail: 'Determines whether deep sandbox, visual logo pHash, and exploitability audit are needed.'
    },
    {
      id: 'step-4',
      stage: 'DEEP FORENSIC ESCALATION',
      action: 'Executing Zero-Cost Deep Sandbox & Vision Analysis',
      status: currentStage > 3 ? 'completed' : currentStage === 3 ? 'running' : 'pending',
      detail: 'Free and open-access execution: Playwright headless DOM interception and visual brand matching.'
    },
    {
      id: 'step-5',
      stage: 'ISOLATED SANDBOX & VISION',
      action: 'Executing Playwright Headless Browser & pHash Logo Audit',
      status: currentStage > 4 ? 'completed' : currentStage === 4 ? 'running' : 'pending',
      detail: 'Renders complete DOM in isolated container, checks credential traps, and compares logos against brand catalog.'
    }
  ];

  return (
    <div
      style={{
        background: isDark ? '#1A1A1A' : '#FFFFFF',
        borderRadius: '0px',
        boxShadow: isDark ? '8px 8px 0px 0px #38BDF8' : '8px 8px 0px 0px #000000',
        border: isDark ? '4px solid #FFFFFF' : '4px solid #000000',
        padding: '24px 26px',
        marginBottom: '24px',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* HUD Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '0px',
              background: '#38BDF8',
              border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
              boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Bot size={22} color="#000000" strokeWidth={2.6} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '1.08rem',
                  fontWeight: 900,
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.01em'
                }}
              >
                Autonomous Cyber Intelligence Agent
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '3px 10px',
                  borderRadius: '0px',
                  background: '#6BCB77',
                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                  boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                  fontWeight: 900,
                  color: '#000000',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                100% FREE &amp; OPEN
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#334155', marginTop: '4px', fontWeight: 600 }}>
              Target: <span style={{ color: '#000000', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", background: '#38BDF8', padding: '2px 8px', border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000' }}>{targetUrl || 'Ready for URL analysis'}</span>
            </div>
          </div>
        </div>

        {/* Status Indicator -> Neo-Brutalist Sticker Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.68rem',
              color: isDark ? '#38BDF8' : '#000000',
              fontWeight: 900,
              background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0, 0, 0, 0.05)',
              border: isDark ? '1.5px solid #38BDF8' : '1.5px solid #000000',
              padding: '3px 8px',
              borderRadius: '0px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            <Sparkles size={11} color={isDark ? '#38BDF8' : '#000000'} />
            HOLD &amp; DRAG TO CRUMPLE
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.76rem',
              color: isDark ? '#FFFFFF' : '#000000',
              background: isDark ? '#121212' : '#FFFFFF',
              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
              padding: '6px 14px',
              borderRadius: '0px',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span>AGENT ACTIVE &amp; UNRESTRICTED</span>
          </div>
        </div>
      </div>

      {/* Workflow Stage Grid -> Neo-Brutalist Crumplable Paper Stage Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {steps.map((step, idx) => (
          <PaperCrumpleCard
            key={step.id}
            headerBadge={`STAGE ${idx + 1}: ${step.stage}`}
            title={step.action}
            detail={step.detail || ''}
            status={step.status === 'paused_for_payment' ? 'warning' : step.status}
            isDark={isDark}
            width={360}
            height={170}
            sceneHeight={195}
          />
        ))}
      </div>
    </div>
  );
};

export default AgenticWorkflowHUD;
