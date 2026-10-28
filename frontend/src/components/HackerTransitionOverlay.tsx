import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Lock, Terminal, Activity, Eye, Shield, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import GridScan from './GridScan';

interface HackerTransitionOverlayProps {
  onComplete: () => void;
}

export const HackerTransitionOverlay: React.FC<HackerTransitionOverlayProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [hexCode, setHexCode] = useState('0x0290AC3C');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const logs = [
    { text: '[>] BOOTING 3D CYBERGUARD ENGINE...', icon: <Cpu size={15} color="#00f0ff" /> },
    { text: '[+] INITIALIZING SECURE NEURAL SANDBOX...', icon: <Lock size={15} color="#38bdf8" /> },
    { text: '[+] CALIBRATING 3D GRID SENSORS...', icon: <Terminal size={15} color="#00ff88" /> },
    { text: '[+] ARMING PLAYWRIGHT HEADLESS BROWSER...', icon: <Eye size={15} color="#f59e0b" /> },
    { text: '[+] LOADING PERCEPTUAL PHASH BRAND VISION...', icon: <Shield size={15} color="#c084fc" /> },
    { text: '[✓] ZERO-TRUST ENCLAVE ARMED // ACCESS GRANTED', icon: <Shield size={15} color="#00ff88" /> }
  ];

  // Progress, Hex Generator, and Log timer - 1.2s snappy in-and-out transition based on real timestamps
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1200; // 1.2s snappy sweep

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentPct);

      const randomHex = '0x' + Math.floor(Math.random() * 0xFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
      setHexCode(randomHex);

      const targetLog = Math.min(logs.length - 1, Math.floor((currentPct / 100) * logs.length));
      setLogIndex(targetLog);

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          onCompleteRef.current?.();
        }, 80);
      }
    }, 25);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.25 }}
      onClick={onComplete}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#070a10',
        zIndex: 9999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {/* 3D GridScan Room Background Layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <GridScan
          linesColor="#334155"
          scanColor="#38bdf8"
          cells={8}
          depth={2.2}
          scanDuration={1.2}
          scanDelay={0.1}
          clickEffect="ping"
          scanDirection="pingpong"
          trail={0.25}
          glow={0.8}
          dpr={1}
        />
      </div>

      {/* CRT Scanline Overlay */}
      <div className="cyber-scanlines" style={{ opacity: 0.65, pointerEvents: 'none' }} />

      {/* Central Cyber Command Terminal Hub */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="glass-panel"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '90%',
          maxWidth: '680px',
          padding: '32px 30px',
          background: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.2) 0%, rgba(13, 19, 31, 0.94) 80%)',
          border: '2px solid #38bdf8',
          boxShadow: '0 0 50px rgba(56, 189, 248, 0.4), inset 0 0 30px rgba(56, 189, 248, 0.15)',
          borderRadius: '12px',
          textAlign: 'center',
          backdropFilter: 'blur(12px)'
        }}
      >
        {/* Terminal Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.6)', padding: '6px 18px', borderRadius: '20px', marginBottom: '16px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
          <span className="mono cyber-font" style={{ fontSize: '0.84rem', color: '#38bdf8', fontWeight: 900, letterSpacing: '0.1em' }}>
            CYBERGUARD // 3D GRID SCAN ENCLAVE
          </span>
        </div>

        <h2 className="cyber-font neon-cyan-glow" style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: '6px', lineHeight: 1.2, color: '#ffffff' }}>
          LAUNCHING ZERO-TRUST SCANNER
        </h2>

        <div className="mono" style={{ fontSize: '0.76rem', color: '#38bdf8', marginBottom: '16px' }}>
          MEMORY OFFSET: <span style={{ color: '#00ff88', fontWeight: 700 }}>{hexCode}</span> // 3D LIDAR: <span style={{ color: '#38bdf8', fontWeight: 700 }}>ARMED</span>
        </div>

        {/* Dynamic Log Stream */}
        <div
          className="mono"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '8px',
            padding: '14px 18px',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: '6px',
            textAlign: 'left',
            fontSize: '0.8rem',
            marginBottom: '18px',
            boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.9)'
          }}
        >
          {logs.slice(0, logIndex + 1).map((log, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: idx === logIndex ? '#00ff88' : '#38bdf8' }}>
              {log.icon}
              <span style={{ fontWeight: idx === logIndex ? 800 : 500 }}>{log.text}</span>
            </div>
          ))}
        </div>

        {/* Glowing Progress Bar */}
        <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden', position: 'relative', marginBottom: '10px' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 50%, #bef264 100%)',
              boxShadow: '0 0 15px #38bdf8',
              transition: 'width 0.05s linear'
            }}
          />
        </div>

        {/* Progress Telemetry */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }} className="mono">
          <span>ENTERING 3D RADAR CORRIDOR</span>
          <span style={{ color: '#38bdf8', fontWeight: 900 }}>{progress}% COMPLETE (Click to enter)</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HackerTransitionOverlay;
