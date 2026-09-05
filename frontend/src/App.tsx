import { useState, useEffect } from 'react';
import { MatrixBackground } from './components/MatrixBackground';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Scanner } from './components/Scanner';
import { PipelineStepper } from './components/PipelineStepper';
import type { PipelineStep } from './components/PipelineStepper';
import { RiskSummaryCard } from './components/RiskSummaryCard';
import { BrandContradictionCard } from './components/BrandContradictionCard';
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
import { X402PaymentModal } from './components/X402PaymentModal';
import { ReportExportModal } from './components/ReportExportModal';
import { AboutModal } from './components/AboutModal';
import { HackerTransitionOverlay } from './components/HackerTransitionOverlay';
import { HackerScanTerminal } from './components/HackerScanTerminal';

import type {
  RiskScoreReport,
  FreeScanResult,
  PaymentChallenge,
  PaymentVerificationResponse,
  CaseSummary,
  FeedItem,
  BenchmarkSample
} from './types';

import {
  analyzeDomain,
  executeFreeScan,
  fetchPaymentChallenge,
  fetchCases,
  fetchCaseById,
  fetchDiscoveryFeed,
  fetchBenchmarkSamples,
  submitAnalystFeedback,
  escalateCandidate
} from './services/api';

const DEFAULT_PIPELINE_STEPS: PipelineStep[] = [
  { id: '1', name: 'Lexical Triage', detail: 'Calibrated Random Forest URL feature model', status: 'idle' },
  { id: '2', name: 'Domain & TLS Intel', detail: 'Asynchronous DNS, RDAP age & TLS validation', status: 'idle' },
  { id: '3', name: 'Decision Boundary', detail: 'Evaluating initial risk & x402 payment challenge', status: 'idle' },
  { id: '4', name: 'Isolated Sandbox Crawl', detail: 'Playwright headless DOM, forms & network capture', status: 'idle' },
  { id: '5', name: 'Brand Contradiction', detail: 'Visual hashing & brand authorization check', status: 'idle' },
  { id: '6', name: 'Multi-Signal Fusion & Audit', detail: 'Calibrated risk scoring & exploitability audit', status: 'idle' }
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('cyberguard_theme') as 'dark' | 'light') || 'dark';
  });

  const [report, setReport] = useState<RiskScoreReport | null>(null);
  const [freeScanResult, setFreeScanResult] = useState<FreeScanResult | null>(null);
  const [currentScanningUrl, setCurrentScanningUrl] = useState<string>('');
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [benchmarkSamples, setBenchmarkSamples] = useState<BenchmarkSample[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTransitioningToScanner, setIsTransitioningToScanner] = useState<boolean>(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(DEFAULT_PIPELINE_STEPS);
  const [currentAgentStage, setCurrentAgentStage] = useState<number>(-1);
  const [agentIsPaid, setAgentIsPaid] = useState<boolean>(false);

  // x402 Payment state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [activeChallenge, setActiveChallenge] = useState<PaymentChallenge | null>(null);

  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Initial load & URL scan param detection
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

  const handleLaunchScanner = () => {
    setIsTransitioningToScanner(true);
  };

  const handleScan = async (url: string, deep: boolean = true, forceRefresh: boolean = false) => {
    setIsLoading(true);
    setCurrentScanningUrl(url);
    setErrorMessage(null);
    setReport(null);
    setFreeScanResult(null);
    setActiveTab('scanner');
    setAgentIsPaid(deep);

    // Animate pipeline stages
    const updatedSteps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'idle' }));
    setPipelineSteps(updatedSteps);

    // Stage 1: Lexical
    setCurrentAgentStage(0);
    updatedSteps[0].status = 'running';
    setPipelineSteps([...updatedSteps]);

    try {
      const timer1 = setTimeout(() => {
        updatedSteps[0].status = 'completed';
        updatedSteps[1].status = 'running';
        setCurrentAgentStage(1);
        setPipelineSteps([...updatedSteps]);
      }, 350);

      const timer2 = setTimeout(() => {
        updatedSteps[1].status = 'completed';
        updatedSteps[2].status = 'running';
        setCurrentAgentStage(2);
        setPipelineSteps([...updatedSteps]);
      }, 750);

      if (!deep) {
        // Free Quick Scan
        const freeRes = await executeFreeScan(url);
        clearTimeout(timer1);
        clearTimeout(timer2);

        updatedSteps[0].status = 'completed';
        updatedSteps[1].status = 'completed';
        updatedSteps[2].status = 'completed';
        setPipelineSteps([...updatedSteps]);
        setCurrentAgentStage(3); // Paused for x402 payment
        setFreeScanResult(freeRes);
        setActiveChallenge(freeRes.x402_challenge || null);
      } else {
        // Full Deep Audit (x402)
        const timer3 = setTimeout(() => {
          updatedSteps[2].status = 'completed';
          updatedSteps[3].status = 'running';
          setCurrentAgentStage(4);
          setPipelineSteps([...updatedSteps]);
        }, 1200);

        const timer4 = setTimeout(() => {
          updatedSteps[3].status = 'completed';
          updatedSteps[4].status = 'running';
          setCurrentAgentStage(5);
          setPipelineSteps([...updatedSteps]);
        }, 1800);

        const result = await analyzeDomain(url, true, forceRefresh);

        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);

        const finalSteps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' }));
        setPipelineSteps(finalSteps);
        setCurrentAgentStage(6); // Multi-signal complete

        setReport(result);
        setActiveTab('results');
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
    if (freeScanResult) {
      if (!activeChallenge) {
        const chal = await fetchPaymentChallenge(freeScanResult.target_url, freeScanResult.case_id);
        setActiveChallenge(chal);
      }
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = (verification: PaymentVerificationResponse) => {
    setAgentIsPaid(true);
    setCurrentAgentStage(6);
    if (verification.report) {
      setReport(verification.report);
      setActiveTab('results');
      loadInitialData();
    }
  };

  const handleSelectCase = async (caseId: string) => {
    try {
      setIsLoading(true);
      const caseReport = await fetchCaseById(caseId);
      setReport(caseReport);
      setActiveTab('results');
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
      setActiveTab('results');
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '40px', position: 'relative' }}>
      {/* Full-Screen Animated Hacker Ingress Transition */}
      {isTransitioningToScanner && (
        <HackerTransitionOverlay
          onComplete={() => {
            setIsTransitioningToScanner(false);
            setActiveTab('scanner');
          }}
        />
      )}

      {/* Hacker Cascading Matrix & Binary Rain Canvas (Adapts to Light / Dark) */}
      <MatrixBackground opacity={0.32} themeMode={theme} />

      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'scanner' && activeTab !== 'scanner') {
            handleLaunchScanner();
          } else {
            setActiveTab(tab);
          }
        }}
        caseCount={cases.length}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAbout={() => setShowAboutModal(true)}
        hasActiveReport={!!report}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {/* Page 1: Overview & Product Landing */}
        {activeTab === 'overview' && (
          <LandingPage
            onLaunchScanner={handleLaunchScanner}
            onOpenExtension={() => setActiveTab('extension')}
            onOpenDiscovery={() => setActiveTab('discovery')}
          />
        )}

        {/* Page 2: Live Security Scanner */}
        {activeTab === 'scanner' && (
          <div>
            <Scanner
              onScan={handleScan}
              isLoading={isLoading}
              benchmarkSamples={benchmarkSamples}
            />

            {/* Agentic Workflow HUD */}
            <AgenticWorkflowHUD
              currentStage={currentAgentStage}
              targetUrl={currentScanningUrl}
              isPaid={agentIsPaid}
              onOpenPaymentModal={handleOpenPaymentForFreeScan}
              txId={report?.tx_id}
            />

            {/* Real-time Telemetry Terminal */}
            <HackerScanTerminal
              targetUrl={currentScanningUrl}
              isScanning={isLoading}
              currentStep={currentAgentStage >= 0 ? currentAgentStage + 1 : 0}
            />

            {/* Free Scan Result Preview (with x402 Deep Audit CTA) */}
            {freeScanResult && !report && (
              <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ✓ FREE SCAN COMPLETE (STAGE 1 &amp; 2)
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      Initial Assessment: {freeScanResult.canonical_domain}
                    </h3>
                  </div>

                  <button
                    onClick={handleOpenPaymentForFreeScan}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 0 20px rgba(2, 132, 199, 0.5)'
                    }}
                  >
                    <span>Unlock Premium Deep Audit (0.1 ALGO via x402)</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.82rem' }}>
                  <div style={{ background: 'var(--code-box-bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Basic Risk Score</div>
                    <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: freeScanResult.basic_risk_score >= 70 ? '#ef4444' : freeScanResult.basic_risk_score >= 35 ? '#f59e0b' : '#10b981' }}>
                      {freeScanResult.basic_risk_score.toFixed(1)} / 100
                    </div>
                  </div>

                  <div style={{ background: 'var(--code-box-bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Verdict</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: freeScanResult.verdict === 'PHISHING' ? '#ef4444' : freeScanResult.verdict === 'SUSPICIOUS' ? '#f59e0b' : '#10b981' }}>
                      {freeScanResult.verdict}
                    </div>
                  </div>

                  <div style={{ background: 'var(--code-box-bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Domain Age Profile</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {freeScanResult.domain_age_days !== undefined ? `${freeScanResult.domain_age_days} Days Old` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page 3: Scan Results Dashboard */}
        {activeTab === 'results' && report && (
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Risk & Verdict Summary */}
            <RiskSummaryCard
              report={report}
              onExportClick={() => setShowExportModal(true)}
              onSubmitFeedback={handleSubmitFeedback}
            />

            {/* Brand Contradiction & Exploitability Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              <BrandContradictionCard brand={report.brand_analysis} />
              <SecurityPostureCard audit={report.security_audit} />
            </div>

            {/* Attack Chain & Forensic Evidence */}
            <AttackChainVisualizer nodes={report.attack_chain} />
            <EvidenceTable evidence={report.evidence_breakdown} />
            <TechnicalInspector report={report} />
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
          <ChromeExtensionPage onLaunchScanner={handleLaunchScanner} />
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
          <AboutPage onLaunchScanner={handleLaunchScanner} />
        )}

        {/* Discovery Feed (Live CT Stream) */}
        {activeTab === 'discovery' && (
          <DiscoveryFeed
            feed={feed}
            onEscalate={handleEscalateFeed}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* x402 Algorand Testnet Payment Modal */}
      <X402PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        challenge={activeChallenge}
        targetUrl={currentScanningUrl || 'https://campuskart.shop'}
        caseId={freeScanResult?.case_id || 'case-live'}
        onPaymentSuccess={handlePaymentSuccess}
      />

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
        />
      )}
    </div>
  );
}

export default App;
