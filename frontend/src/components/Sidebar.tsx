import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Radar,
  Home,
  Puzzle,
  HelpCircle,
  History,
  LayoutDashboard,
  Mail,
  Link,
  BarChart2,
  Key,
  Globe,
  Bell,
  X,
  Cpu,
  Bot,
  Network
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  caseCount: number;
  theme?: 'dark' | 'light';
  hasActiveReport?: boolean;
  onLaunchScanner?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  caseCount,
  theme = 'dark',
  hasActiveReport = false,
  onLaunchScanner,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const isLight = theme === 'light';
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'copilot', label: 'Cyber Copilot', icon: Bot, badge: 'AI', badgeBg: '#38BDF8' },
    {
      id: 'scanner',
      label: 'Security Scanner',
      icon: Radar,
      badge: 'LIVE',
      badgeBg: '#6BCB77',
      onClick: () => {
        if (activeTab !== 'scanner' && onLaunchScanner) onLaunchScanner();
        else setActiveTab('scanner');
      }
    },
    { id: 'email-scanner', label: 'Email Scan', icon: Mail },
    { id: 'bulk-scanner', label: 'Bulk Scan', icon: Link },
    { id: 'threat-dashboard', label: 'Threat Intel', icon: BarChart2 },
    { id: 'password-checker', label: 'Password', icon: Key },
    { id: 'ip-reputation', label: 'IP Lookup', icon: Globe },
    { id: 'watchlist', label: 'Watchlist', icon: Bell },
    { id: 'history', label: `History (${caseCount})`, icon: History },
    ...(hasActiveReport ? [{ id: 'results', label: 'Results', icon: LayoutDashboard }] : []),
    { id: 'extension', label: 'Chrome Ext', icon: Puzzle },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: Network,
      badge: 'MAP',
      badgeBg: '#4ADE80',
      onClick: () => window.open('/architecture.html', '_blank')
    },
    { id: 'about', label: 'About & Docs', icon: HelpCircle }
  ];

  const handleItemClick = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else {
      setActiveTab(item.id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Brand Header Card with Neo-brutalist Sticker Badge */}
      <div
        onClick={() => {
          setActiveTab('overview');
          if (onCloseMobile) onCloseMobile();
        }}
        style={{
          background: '#38BDF8',
          border: '3px solid #000000',
          borderRadius: '0px',
          boxShadow: '4px 4px 0px 0px #000000',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '0px',
            background: '#000000',
            border: '2px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Shield size={24} color="#38BDF8" strokeWidth={2.6} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1
              style={{
                fontSize: '1.08rem',
                fontWeight: 900,
                color: '#000000',
                fontFamily: "'Space Grotesk', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: 0
              }}
            >
              CyberGuard AI
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span
              style={{
                fontSize: '0.62rem',
                padding: '2px 8px',
                borderRadius: '0px',
                background: '#FF6B6B',
                border: '1.5px solid #000000',
                fontWeight: 900,
                color: '#000000',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              SOC SUITE // V2
            </span>
          </div>
        </div>

        {/* Close button for slide-out drawer */}
        {onCloseMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseMobile();
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '0px',
              background: '#000000',
              border: '2px solid #000000',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px 0px #000000',
              flexShrink: 0
            }}
            aria-label="Close navigation"
          >
            <X size={16} strokeWidth={2.8} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          paddingRight: '2px',
          paddingBottom: '8px'
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileHover={{ translateY: -2, translateX: -2, boxShadow: '5px 5px 0px 0px #000000' }}
              whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '1px 1px 0px 0px #000000' }}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '0px',
                border: isLight ? '3px solid #000000' : (isActive ? '3px solid #38BDF8' : '3px solid rgba(56, 189, 248, 0.3)'),
                background: isActive ? '#38BDF8' : (isLight ? '#FFFFFF' : 'rgba(22, 27, 34, 0.9)'),
                boxShadow: isActive ? '5px 5px 0px 0px #000000' : (isLight ? '3px 3px 0px 0px #000000' : '3px 3px 0px 0px rgba(0, 0, 0, 0.6)'),
                color: isActive ? '#000000' : (isLight ? '#000000' : '#FFFFFF'),
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                transition: 'background-color 0.1s ease',
                outline: 'none',
                transform: isActive ? 'translate(-1px, -1px)' : 'none'
              }}
            >
              {/* Icon Container */}
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '0px',
                  background: isActive ? '#000000' : (isLight ? '#FFFDF5' : '#0F172A'),
                  border: isLight ? '2px solid #000000' : '2px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon
                  size={16}
                  color={isActive ? '#38BDF8' : (isLight ? '#000000' : '#E2E8F0')}
                  strokeWidth={2.6}
                />
              </div>

              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 900,
                  fontFamily: "'Space Grotesk', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: isActive ? '#000000' : (isLight ? '#000000' : '#FFFFFF')
                }}
              >
                {item.label}
              </span>

              {item.badge && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '2px 6px',
                    borderRadius: '0px',
                    background: item.badgeBg || '#C4B5FD',
                    border: '1.5px solid #000000',
                    fontWeight: 900,
                    color: '#000000',
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Telemetry Card */}
      <div
        style={{
          borderRadius: '0px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '3px solid #000000',
          background: '#C4B5FD',
          boxShadow: '3px 3px 0px 0px #000000'
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '0px',
            background: '#000000',
            border: '2px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Cpu size={15} color="#38BDF8" strokeWidth={2.6} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#000000', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
            CYBER SOC CORE
          </div>
          <div style={{ fontSize: '0.66rem', color: '#000000', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '0px', backgroundColor: '#000000', display: 'inline-block' }} />
            <span>NEO-BRUTALIST SHELL</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 99990
            }}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '300px',
              maxWidth: '85vw',
              background: isLight ? '#FFFDF5' : '#0B0F19',
              borderRight: isLight ? '4px solid #000000' : '4px solid rgba(56, 189, 248, 0.3)',
              boxShadow: isLight ? '10px 0px 0px 0px #000000' : '10px 0px 0px 0px rgba(0, 0, 0, 0.7)',
              padding: '20px 16px',
              zIndex: 99991,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <SidebarContent />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
