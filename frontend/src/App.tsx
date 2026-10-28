import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatrixBackground } from './components/MatrixBackground';
import Galaxy from './components/Galaxy';
import GridScan from './components/GridScan';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Scanner } from './components/Scanner';
import { PipelineStepper } from './components/PipelineStepper';
import type { PipelineStep } from './components/PipelineStepper';
import { RiskSummaryCard } from './components/RiskSummaryCard';
import { BrandContradictionCard } from './components/BrandContradictionCard';
import { InfrastructureIntelCard } from './components/InfrastructureIntelCard';
import { ThreatVectorsCard } from './components/ThreatVectorsCard';
import { SecurityPostureCard } from './components/SecurityPostureCard';
import { AttackChainVisualizer } from './components/AttackChainVisualizer';
import { EvidenceTable } from './components/EvidenceTable';
import { TechnicalInspector } from './components/TechnicalInspector';
import { DiscoveryFeed } from './components/DiscoveryFeed';
import { ChromeExtensionPage } from './components/ChromeExtensionPage';
import { ScanHistoryPage } from './components/ScanHistoryPage';
import { PremiumAuditPage } from './components/PremiumAuditPage';
import { AboutPage } from './components/AboutPage';
import { AgenticWorkflowHUD } from './components/AgenticWorkflowHUD';
import { ScanningTelemetryHUD } from './components/ScanningTelemetryHUD';
import { FreeScanDetailedCard } from './components/FreeScanDetailedCard';
import { ReportExportModal } from './components/ReportExportModal';
import { AboutModal } from './components/AboutModal';
import { HackerTransitionOverlay } from './components/HackerTransitionOverlay';
import { CyberCopilotChat } from './components/CyberCopilotChat';
import { EmailPhishingScanner } from './components/EmailPhishingScanner';
import { BulkScanner } from './components/BulkScanner';
import { ThreatDashboard } from './components/ThreatDashboard';
import { PasswordChecker } from './components/PasswordChecker';
import { IpReputationPage } from './components/IpReputationPage';
import { WatchlistPage } from './components/WatchlistPage';
import { Shield, Zap } from 'lucide-react';

import type {
  RiskScoreReport,
  FreeScanResult,
  PaymentChallenge,
  PaymentVerificationResponse,
  CaseSummary,
  FeedItem,
  BenchmarkSample
} from './types';

import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import {
  analyzeDomain,
  executeFreeScan,
  fetchPaymentChallenge,
  fetchCases,
  fetchCaseById,
  fetchDiscoveryFeed,
  fetchBenchmarkSamples,
  submitAnalystFeedback,
  escalateCandidate,
  fetchCurrentUser,
  getStoredUser,
  setStoredAuth,
  isPremiumEmail,
  getPremiumRecord,
  syncUserSubscription,
  recordScanInHistory,
  type UserProfile
} from './services/api';

const DEFAULT_PIPELINE_STEPS: PipelineStep[] = [
  { id: '1', name: 'Lexical Triage', detail: 'Extracting 24-D feature vector & Shannon entropy in <15ms', status: 'idle' },
  { id: '2', name: 'Domain & Infrastructure', detail: 'Authoritative RDAP domain age & Google DNS-over-HTTPS', status: 'idle' },
  { id: '3', name: 'SSL/TLS & Posture', detail: 'Validating certificate chain, HSTS, CSP, and SPF/DMARC', status: 'idle' },
  { id: '4', name: 'Browser Sandbox Crawl', detail: 'Playwright headless DOM inspection & form trap auditing', status: 'idle' },
  { id: '5', name: 'Brand Contradiction', detail: 'Visual logo pHash matching against authorized domains', status: 'idle' },
  { id: '6', name: 'Multi-Signal Fusion & AI', detail: 'Calibrating 0-100 risk score and AI threat insights', status: 'idle' }
];

export function App() {
  const isCopilotOnly =
    (typeof __COPILOT_BUILD__ !== 'undefined' && Boolean(__COPILOT_BUILD__)) ||
    import.meta.env.VITE_COPILOT_ONLY === 'true' ||
    import.meta.env.VITE_APP_MODE === 'copilot' ||
    (typeof window !== 'undefined' && (
      window.location.hostname.toLowerCase().includes('copilot') ||
      window.location.pathname.toLowerCase() === '/copilot' ||
      window.location.pathname.toLowerCase().startsWith('/copilot/') ||
      window.location.pathname.toLowerCase() === '/chat' ||
      window.location.search.toLowerCase().includes('copilot') ||
      window.location.hash.toLowerCase().includes('copilot')
    ));

  useEffect(() => {
    if (isCopilotOnly) {
      document.title = 'Cyber Copilot | AI Cybersecurity Assistant';
    }
  }, [isCopilotOnly]);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('cyberguard_theme') as 'dark' | 'light') || 'light';
  });

  useEffect(() => {
    if (activeTab === 'copilot') {
      setShowCopilotChat(true);
    }
  }, [activeTab]);

  const [report, setReport] = useState<RiskScoreReport | null>(null);
  const [freeScanResult, setFreeScanResult] = useState<FreeScanResult | null>(null);
  const [currentScanningUrl, setCurrentScanningUrl] = useState<string>('');
  const [scannerFocus, setScannerFocus] = useState<'developer' | 'phishing'>('developer');
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [benchmarkSamples, setBenchmarkSamples] = useState<BenchmarkSample[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(() =>
    DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' }))
  );
  const [currentAgentStage, setCurrentAgentStage] = useState<number>(7);
  const [agentIsPaid, setAgentIsPaid] = useState<boolean>(true);

  // Cinematic hacker transition overlay state
  const [showHackerOverlay, setShowHackerOverlay] = useState<boolean>(false);

  // x402 Payment state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [activeChallenge, setActiveChallenge] = useState<PaymentChallenge | null>(null);

  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [aboutInitialTopic, setAboutInitialTopic] = useState<string>('all');
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showCopilotChat, setShowCopilotChat] = useState<boolean>(false);
  const [pendingCopilotPrompt, setPendingCopilotPrompt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Validate authentication session on mount (Firebase Auth + backend)
  useEffect(() => {
    import('./services/firebase').then(({ auth, onAuthStateChanged, mapFirebaseUser }) => {
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const basic = mapFirebaseUser(fbUser);
          const existing = getStoredUser();
          const isPremium = isPremiumEmail(basic.email) || existing?.plan === 'premium';
          const premRec = getPremiumRecord(basic.email);

          const fullProfile: UserProfile = {
            id: basic.id,
            username: basic.username,
            email: basic.email,
            photoURL: basic.photoURL,
            created_at: basic.created_at,
            plan: isPremium ? 'premium' : (existing?.plan || 'free'),
            credits: isPremium
              ? Math.min(5000, premRec?.credits && premRec.credits <= 5000 ? premRec.credits : (existing?.credits && existing.credits <= 5000 ? existing.credits : 5000))
              : (existing?.credits && existing.credits <= 50 ? existing.credits : 50),
            max_credits: isPremium ? 5000 : 50,
            memory_used_kb: existing?.memory_used_kb ?? 48,
            memory_max_kb: isPremium ? 8192 : 256,
            memory_used_pct: existing?.memory_used_pct ?? 1
          };

          setCurrentUser(fullProfile);
          setStoredAuth(fbUser.uid, fullProfile);

          // Verify with Razorpay in background
          if (basic.email) {
            syncUserSubscription(basic.email).then((synced) => {
              if (synced && (synced.plan === 'premium' || synced.is_premium)) {
                setCurrentUser((prev) => prev ? {
                  ...prev,
                  plan: 'premium',
                  credits: Math.min(5000, synced.credits && synced.credits <= 5000 ? synced.credits : (prev.credits && prev.credits <= 5000 ? prev.credits : 5000)),
                  max_credits: 5000,
                  memory_max_kb: 8192
                } : null);
              }
            }).catch(() => {});
          }
        }
      });
    }).catch(() => {});

    fetchCurrentUser()
      .then((user) => {
        if (user) {
          if (user.email && isPremiumEmail(user.email)) {
            user.plan = 'premium';
            user.credits = Math.min(5000, user.credits && user.credits <= 5000 ? user.credits : 5000);
            user.max_credits = 5000;
            user.memory_max_kb = 8192;
          }
          setCurrentUser(user);
        }
      })
      .catch((err) => {
        console.warn('Auth check skipped:', err);
      });
  }, []);

  const handleLaunchScanner = () => {
    setShowHackerOverlay(true);
  };

  const handleOpenAboutTopic = (topicId?: string) => {
    setAboutInitialTopic(topicId || 'all');
    setShowAboutModal(true);
  };

  const handleAskCopilot = (question: string) => {
    setPendingCopilotPrompt(question);
    setShowCopilotChat(true);
  };

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('cyberguard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initial load
  useEffect(() => {
    loadInitialData();

    const params = new URLSearchParams(window.location.search);
    const scanUrl = params.get('scan');
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (scanUrl) {
      handleScan(scanUrl, true, false);
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [casesData, feedData, samplesData] = await Promise.all([
        fetchCases(),
        fetchDiscoveryFeed(),
        fetchBenchmarkSamples()
      ]);
      setCases(casesData);
      setFeed(feedData);
      setBenchmarkSamples(samplesData);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  };

  const handleScan = async (
    url: string,
    deep: boolean = true,
    forceRefresh: boolean = false,
    focus?: 'developer' | 'phishing'
  ) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    if (focus) {
      setScannerFocus(focus);
    }

    setIsLoading(true);
    setCurrentScanningUrl(cleanUrl);
    setErrorMessage(null);
    setReport(null);
    setFreeScanResult(null);
    setActiveTab('scanner');
    setAgentIsPaid(true);

    // Initialize pipeline steps
    const steps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'idle' }));
    steps[0].status = 'running';
    setPipelineSteps([...steps]);
    setCurrentAgentStage(0);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      if (!deep) {
        // Free Quick Scan (Triage stages 0, 1, 2)
        const freeScanPromise = executeFreeScan(cleanUrl);

        // Stage 0 -> Stage 1 (Lexical Triage)
        await sleep(650);
        steps[0].status = 'completed';
        steps[1].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(1);

        // Stage 1 -> Stage 2 (Google DoH & RDAP)
        await sleep(650);
        steps[1].status = 'completed';
        steps[2].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(2);

        // Stage 2 (SSL/TLS & Posture)
        await sleep(650);
        steps[2].status = 'completed';

        // Remaining deep stages ready for 1-click execution
        steps[3].status = 'idle';
        steps[3].detail = 'Ready // Zero-Cost Playwright Sandbox';
        steps[4].status = 'idle';
        steps[4].detail = 'Ready // Visual Brand Contradiction Vision';
        steps[5].status = 'idle';
        steps[5].detail = 'Ready // Multi-Signal Risk Fusion & AI';
        setPipelineSteps([...steps]);

        const freeRes = await freeScanPromise;
        setCurrentAgentStage(2);
        setFreeScanResult(freeRes);
        setActiveChallenge(null);
        recordScanInHistory({
          domain: freeRes.canonical_domain,
          url: freeRes.target_url,
          verdict: freeRes.verdict,
          riskScore: freeRes.basic_risk_score,
          grade: freeRes.security_audit?.security_grade || (freeRes.tls_valid ? 'B' : 'F')
        });
      } else {
        // Full Deep Security Audit (Stages 0 through 5)
        const analysisPromise = analyzeDomain(cleanUrl, true, forceRefresh);

        // Stage 0: Lexical Triage (<15ms ML tensor)
        await sleep(620);
        steps[0].status = 'completed';
        steps[1].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(1);

        // Stage 1: Google DoH & RDAP Resolution
        await sleep(620);
        steps[1].status = 'completed';
        steps[2].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(2);

        // Stage 2: SSL/TLS & Defensive Posture
        await sleep(620);
        steps[2].status = 'completed';
        steps[3].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(3);

        // Stage 3: Playwright Chromium Sandbox Crawl
        await sleep(650);
        steps[3].status = 'completed';
        steps[4].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(4);

        // Stage 4: pHash Visual Brand Contradiction
        await sleep(650);
        steps[4].status = 'completed';
        steps[5].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(5);

        // Stage 5: Multi-Signal Fusion & Algorand x402 Micropayments
        const [result] = await Promise.all([
          analysisPromise,
          sleep(650)
        ]);

        steps[5].status = 'completed';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(6); // Multi-signal complete

        // Brief celebration pause before revealing dossier
        await sleep(350);

        setReport(result);
        recordScanInHistory({
          domain: result.canonical_domain,
          url: result.target_url,
          verdict: result.verdict,
          riskScore: result.overall_risk_score,
          grade: result.security_audit?.security_grade || 'Audited'
        });
        loadInitialData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during security inspection.');
      const failedSteps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'idle' }));
      setPipelineSteps(failedSteps);
      setCurrentAgentStage(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPaymentForFreeScan = async () => {
    const target = freeScanResult?.target_url || currentScanningUrl;
    if (target) {
      handleScan(target, true, false);
    }
  };

  const handlePaymentSuccess = async (verification: PaymentVerificationResponse) => {
    setAgentIsPaid(true);
    setCurrentAgentStage(6);
    setPipelineSteps(DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' })));

    if (verification.report) {
      setReport(verification.report);
      setFreeScanResult(null);
      loadInitialData();
    } else {
      const urlToAudit = currentScanningUrl || freeScanResult?.target_url || '';
      if (urlToAudit) {
        try {
          setIsLoading(true);
          const fullReport = await analyzeDomain(urlToAudit, true, false, verification.tx_id);
          setReport(fullReport);
          setFreeScanResult(null);
          loadInitialData();
        } catch (e: any) {
          console.error('Error fetching full report after payment verification:', e);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleSelectCase = async (caseId: string) => {
    try {
      setIsLoading(true);
      const caseReport = await fetchCaseById(caseId);
      setReport(caseReport);
      setCurrentScanningUrl(caseReport.target_url);
      setActiveTab('scanner');
      setPipelineSteps(DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' })));
      setCurrentAgentStage(6);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load case');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalateFeed = async (itemId: string) => {
    try {
      setIsLoading(true);
      const res = await escalateCandidate(itemId);
      setReport(res);
      setCurrentScanningUrl(res.target_url);
      setActiveTab('scanner');
      setPipelineSteps(DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' })));
      setCurrentAgentStage(6);
      loadInitialData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Escalation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async (caseId: string, verdict: string, notes?: string) => {
    try {
      await submitAnalystFeedback(caseId, verdict, notes);
      loadInitialData();
    } catch (err: any) {
      alert('Feedback update error: ' + err.message);
    }
  };

  if (isCopilotOnly) {
    return (
      <div
        className={`cyberguard-app copilot-app-root ${theme}`}
        data-theme={theme}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          background: theme === 'dark' ? '#0B0F19' : '#F4F7FB'
        }}
      >
        <CyberCopilotChat
          theme={theme}
          report={report || freeScanResult}
          isOpen={true}
          isStandalone={true}
          onToggle={() => {}}
          pendingPrompt={pendingCopilotPrompt}
          onClearPendingPrompt={() => setPendingCopilotPrompt(null)}
          onOpenAboutTopic={handleOpenAboutTopic}
          onScanReportLoaded={(newReport) => setFreeScanResult(newReport as any)}
          currentUser={currentUser}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onOpenProfileModal={() => setShowProfileModal(true)}
          onToggleTheme={() => {
            const next = theme === 'dark' ? 'light' : 'dark';
            setTheme(next);
            localStorage.setItem('cyberguard_theme', next);
            document.documentElement.setAttribute('data-theme', next);
          }}
        />

        {/* User Authentication & Cloud Sync Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          currentUser={currentUser}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            if (user) setShowProfileModal(true);
          }}
        />

        {/* User Profile, Quota & Razorpay Subscription Modal */}
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={currentUser}
        />

        {/* About & Technical Spec Modal */}
        {showAboutModal && (
          <AboutModal
            isOpen={showAboutModal}
            onClose={() => setShowAboutModal(false)}
            initialTopicId={aboutInitialTopic}
            onAskCopilot={handleAskCopilot}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: theme === 'dark' ? 'transparent' : 'var(--neo-bg, #FFFDF5)', position: 'relative' }}>
      {/* Background: 3D GridScan for Scanner, Galaxy for Overview in Dark Mode, Neo Matrix/Grid for Light Mode */}
      {theme === 'dark' ? (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}>
          {activeTab === 'scanner' ? (
            <GridScan
              linesColor="#334155"
              scanColor="#bef264"
              cells={8}
              depth={2.2}
              scanDuration={1.2}
              scanDelay={0.2}
              clickEffect="ping"
              scanDirection="pingpong"
              trail={0.25}
              glow={0.8}
              dpr={1}
            />
          ) : (
            <Galaxy
              density={0.5}
              glowIntensity={0.2}
              flareIntensity={0.6}
              starSpeed={0.25}
              speed={0.5}
              layers={2}
              dpr={1}
              mouseRepulsion
              clickWarp
              transparent
            />
          )}
        </div>
      ) : (
        <MatrixBackground opacity={0.03} themeMode="light" />
      )}

        {/* Ambient Floating Cyber Orbs */}
        <div className="ambient-orb-cyan" />
        <div className="ambient-orb-purple" />

        {/* Left Cyber Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          caseCount={cases.length}
          theme={theme}
          hasActiveReport={!!report}
          onLaunchScanner={handleLaunchScanner}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Main Console Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            caseCount={cases.length}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenAbout={() => setShowAboutModal(true)}
            onLaunchScanner={handleLaunchScanner}
            hasActiveReport={!!report}
            onOpenCopilot={() => setShowCopilotChat(true)}
            currentUser={currentUser}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onOpenProfileModal={() => setShowProfileModal(true)}
            onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
          />

          {/* Main Content Area */}
          <main style={{ flex: 1, position: 'relative', zIndex: 1, paddingBottom: '40px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
        {/* Page 1: Overview & Product Landing */}
        {activeTab === 'overview' && (
          <LandingPage
            theme={theme}
            onLaunchScanner={handleLaunchScanner}
            onOpenExtension={() => setActiveTab('extension')}
            onOpenDiscovery={() => setActiveTab('discovery')}
            onScanUrl={(url) => handleScan(url, true, false)}
          />
        )}

        {/* Page 2: Live Security Scanner & Embedded Results */}
        {activeTab === 'scanner' && (
          <div className="neo-scanner-zone" data-theme={theme}>
            <Scanner
              onScan={handleScan}
              isLoading={isLoading}
              benchmarkSamples={benchmarkSamples}
              scannerFocus={scannerFocus}
              onScannerFocusChange={setScannerFocus}
              theme={theme}
            />

            {/* Real-time Scanning Telemetry HUD with Animation */}
            <AnimatePresence mode="wait">
              {isLoading && currentScanningUrl && (
                <ScanningTelemetryHUD targetUrl={currentScanningUrl} isDeep={agentIsPaid} theme={theme} />
              )}
            </AnimatePresence>

            {/* Pipeline Stepper (Always visible UI matching user reference) */}
            {!isLoading && (
              <PipelineStepper
                steps={pipelineSteps}
                currentStepIndex={currentScanningUrl && currentAgentStage >= 0 ? currentAgentStage : pipelineSteps.length}
                onUnlock={handleOpenPaymentForFreeScan}
                theme={theme}
              />
            )}

            {/* Agentic Workflow HUD (Always visible UI matching user reference) */}
            <AgenticWorkflowHUD
              currentStage={currentScanningUrl && currentAgentStage >= 0 ? currentAgentStage : 7}
              targetUrl={currentScanningUrl || 'https://psit.ac.in'}
              isPaid={true}
              onOpenPaymentModal={() => {}}
              txId={report?.tx_id}
              theme={theme}
            />

            {/* Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  padding: '14px 20px',
                  margin: '0 24px 20px 24px',
                  color: '#ef4444',
                  fontSize: '0.85rem'
                }}
              >
                <strong>Scan Error: </strong>{errorMessage}
              </motion.div>
            )}

            {/* Comprehensive Free Quick Scan Breakdown (Stages 1-2 & Lexical ML + DNS/TLS) */}
            <AnimatePresence>
              {freeScanResult && !report && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <FreeScanDetailedCard
                    result={freeScanResult}
                    onUnlockDeepAudit={handleOpenPaymentForFreeScan}
                    onOpenAbout={handleOpenAboutTopic}
                    scannerFocus={scannerFocus}
                    onScannerFocusChange={setScannerFocus}
                    theme={theme}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Complete Real Live Scan Report (Displayed directly on Scanner page with Staggered Entrance) */}
            <AnimatePresence>
              {report && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}
                >
                  {/* Top Risk & Verdict Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                  >
                    <RiskSummaryCard
                      report={report}
                      onExportClick={() => setShowExportModal(true)}
                      onSubmitFeedback={handleSubmitFeedback}
                      onOpenAbout={handleOpenAboutTopic}
                    />
                  </motion.div>

                  {/* Brand Contradiction, Infrastructure Intel & Exploitability Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <BrandContradictionCard brand={report.brand_analysis} domainIntel={report.domain_intel} onOpenAbout={handleOpenAboutTopic} />
                      <InfrastructureIntelCard domainIntel={report.domain_intel} crawlArtifacts={report.crawl_artifacts} targetDomain={report.canonical_domain} onOpenAbout={handleOpenAboutTopic} />
                      <ThreatVectorsCard report={report} onOpenAbout={handleOpenAboutTopic} />
                    </div>
                    <SecurityPostureCard audit={report.security_audit} aiInsights={report.ai_insights} domain={report.canonical_domain} onOpenAbout={handleOpenAboutTopic} />
                  </motion.div>

                  {/* Attack Chain & Forensic Evidence */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 }}
                  >
                    <AttackChainVisualizer nodes={report.attack_chain} onOpenAbout={handleOpenAboutTopic} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.28 }}
                  >
                    <EvidenceTable evidence={report.evidence_breakdown} onOpenAbout={handleOpenAboutTopic} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.35 }}
                  >
                    <TechnicalInspector report={report} onOpenAbout={handleOpenAboutTopic} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Page 3: Scan Results Dashboard */}
        {activeTab === 'results' && (
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {report ? (
              <>
                <RiskSummaryCard
                  report={report}
                  onExportClick={() => setShowExportModal(true)}
                  onSubmitFeedback={handleSubmitFeedback}
                  onOpenAbout={handleOpenAboutTopic}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <BrandContradictionCard brand={report.brand_analysis} domainIntel={report.domain_intel} onOpenAbout={handleOpenAboutTopic} />
                    <InfrastructureIntelCard domainIntel={report.domain_intel} crawlArtifacts={report.crawl_artifacts} targetDomain={report.canonical_domain} onOpenAbout={handleOpenAboutTopic} />
                    <ThreatVectorsCard report={report} onOpenAbout={handleOpenAboutTopic} />
                  </div>
                  <SecurityPostureCard audit={report.security_audit} aiInsights={report.ai_insights} domain={report.canonical_domain} onOpenAbout={handleOpenAboutTopic} />
                </div>
                <AttackChainVisualizer nodes={report.attack_chain} onOpenAbout={handleOpenAboutTopic} />
                <EvidenceTable evidence={report.evidence_breakdown} onOpenAbout={handleOpenAboutTopic} />
                <TechnicalInspector report={report} onOpenAbout={handleOpenAboutTopic} />
              </>
            ) : (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No active security scan loaded. Go to the Live Scanner to audit a URL.</p>
                <button
                  onClick={handleLaunchScanner}
                  style={{
                    marginTop: '16px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Go to Live Scanner
                </button>
              </div>
            )}
          </div>
        )}

        {/* Page 4: Premium Audit & x402 Algorand Protocol */}
        {activeTab === 'x402' && (
          <PremiumAuditPage
            onLaunchScanner={handleLaunchScanner}
            onOpenPaymentModal={() => setShowPaymentModal(true)}
          />
        )}

        {/* Page 5: Chrome Extension */}
        {activeTab === 'extension' && (
          <ChromeExtensionPage theme={theme} onLaunchScanner={handleLaunchScanner} />
        )}

        {/* Page 6: Reports / Scan History */}
        {activeTab === 'history' && (
          <ScanHistoryPage
            cases={cases}
            onSelectCase={handleSelectCase}
            onLaunchScanner={handleLaunchScanner}
          />
        )}

        {/* Page 7: About / How It Works */}
        {activeTab === 'about' && (
          <AboutPage theme={theme} onLaunchScanner={handleLaunchScanner} />
        )}

        {/* Discovery Feed (Live CT Stream) */}
        {activeTab === 'discovery' && (
          <DiscoveryFeed
            feed={feed}
            onEscalate={handleEscalateFeed}
            isLoading={isLoading}
          />
        )}

        {/* New Pages */}
        {activeTab === 'email-scanner' && <EmailPhishingScanner theme={theme} onScanUrl={(url) => handleScan(url, true, false)} />}
        {activeTab === 'bulk-scanner' && <BulkScanner theme={theme} onScanUrl={(url) => handleScan(url, true, false)} />}
        {activeTab === 'threat-dashboard' && <ThreatDashboard theme={theme} cases={cases} feed={feed} onScanUrl={(url) => handleScan(url, true, false)} />}
        {activeTab === 'password-checker' && <PasswordChecker theme={theme} />}
        {activeTab === 'ip-reputation' && <IpReputationPage theme={theme} />}
        {activeTab === 'watchlist' && <WatchlistPage theme={theme} onScanUrl={(url) => handleScan(url, true, false)} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Cinematic Matrix Hacker Transition Overlay */}
        <AnimatePresence>
          {showHackerOverlay && (
            <HackerTransitionOverlay
              onComplete={() => {
                setShowHackerOverlay(false);
                setActiveTab('scanner');
              }}
            />
          )}
        </AnimatePresence>

        {/* Export Forensic Report Modal */}
        {showExportModal && report && (
          <ReportExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            report={report}
          />
        )}

        {/* About & Technical Spec Modal */}
        {showAboutModal && (
          <AboutModal
            isOpen={showAboutModal}
            onClose={() => setShowAboutModal(false)}
            initialTopicId={aboutInitialTopic}
            onAskCopilot={handleAskCopilot}
          />
        )}

        {/* Interactive Cyber AI Copilot Chatbot */}
        <CyberCopilotChat
          theme={theme}
          report={report || freeScanResult}
          isOpen={showCopilotChat}
          onToggle={() => setShowCopilotChat((prev) => !prev)}
          pendingPrompt={pendingCopilotPrompt}
          onClearPendingPrompt={() => setPendingCopilotPrompt(null)}
          onOpenAboutTopic={handleOpenAboutTopic}
          onScanReportLoaded={(newReport) => setFreeScanResult(newReport as any)}
          currentUser={currentUser}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onOpenProfileModal={() => setShowProfileModal(true)}
        />

        {/* User Authentication & Cloud Sync Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          currentUser={currentUser}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            if (user) setShowProfileModal(true);
          }}
        />

        {/* User Profile, Quota & Razorpay Subscription Modal */}
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={currentUser}
          onUpdateUser={(user) => {
            setCurrentUser(user);
            if (user) {
              setStoredAuth(user.id, user);
            }
          }}
          onOpenAuthModal={() => setShowAuthModal(true)}
          theme={theme}
        />
        </div>
      </div>
  );
}

export default App;
