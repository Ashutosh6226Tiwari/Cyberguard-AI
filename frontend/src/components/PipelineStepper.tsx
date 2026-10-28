import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Sparkles } from 'lucide-react';
import PaperCrumpleCard from './PaperCrumpleCard';

export interface PipelineStep {
  id: string;
  name: string;
  detail: string;
  status: 'idle' | 'running' | 'completed' | 'warning' | 'locked';
}

interface PipelineStepperProps {
  steps: PipelineStep[];
  currentStepIndex: number;
  onUnlock?: () => void;
  theme?: 'dark' | 'light';
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ steps, currentStepIndex, onUnlock, theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: isDark ? '#1A1A1A' : '#FFFFFF',
        borderRadius: '0px',
        boxShadow: isDark ? '8px 8px 0px 0px #38BDF8' : '8px 8px 0px 0px #000000',
        border: isDark ? '4px solid #FFFFFF' : '4px solid #000000',
        padding: '22px 24px',
        margin: '0 0 24px 0',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '0px',
              background: '#38BDF8',
              border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
              boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={18} color="#000000" strokeWidth={2.6} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 900,
                color: isDark ? '#FFFFFF' : '#000000',
                letterSpacing: '-0.01em',
                fontFamily: "'Space Grotesk', sans-serif",
                margin: 0
              }}
            >
              MULTI-STAGE INTELLIGENCE PIPELINE EXECUTION
            </h3>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <span
            style={{
              fontSize: '0.74rem',
              color: '#000000',
              fontWeight: 800,
              background: '#C4B5FD',
              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
              padding: '4px 12px',
              borderRadius: '0px',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            {currentStepIndex >= 0 && currentStepIndex < steps.length
              ? `STAGE 0${currentStepIndex + 1} OF 0${steps.length}`
              : currentStepIndex >= steps.length
              ? 'PIPELINE COMPLETE // ALL SIGNALS FUSED'
              : 'STANDBY // READY'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {steps.map((step, idx) => (
          <PaperCrumpleCard
            key={step.id}
            stepNumber={`0${idx + 1}`}
            title={step.name}
            detail={step.detail}
            status={step.status}
            isDark={isDark}
            onClick={step.status === 'locked' && onUnlock ? onUnlock : undefined}
            width={340}
            height={150}
            sceneHeight={175}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PipelineStepper;
