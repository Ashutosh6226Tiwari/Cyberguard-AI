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
  { id: '1', name: 'Lexical Triage', detail: 'Extracting 24-D feature vector & Shannon entropy in <15ms', status: 'idle' },
  { id: '2', name: 'Domain & Infrastructure', detail: 'Authoritative RDAP domain age & Google DNS-over-HTTPS', status: 'idle' },
  { id: '3', name: 'SSL/TLS & Posture', detail: 'Validating certificate chain, HSTS, CSP, and SPF/DMARC', status: 'idle' },
  { id: '4', name: 'Browser Sandbox Crawl', detail: 'Playwright headless DOM inspection & form trap auditing', status: 'idle' },
  { id: '5', name: 'Brand Contradiction', detail: 'Visual logo pHash matching against authorized domains', status: 'idle' },
  { id: '6', name: 'Multi-Signal Fusion & AI', detail: 'Calibrating 0-100 risk score and Gemini threat insights', status: 'idle' }
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>('scanner');
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

  const handleScan = async (url: string, deep: boolean = true, forceRefresh: boolean = false) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    setIsLoading(true);
    setCurrentScanningUrl(cleanUrl);
    setErrorMessage(null);
    setReport(null);
    setFreeScanResult(null);
    setActiveTab('scanner');
    setAgentIsPaid(deep);

    // Initialize pipeline steps
    const steps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'idle' }));
    steps[0].status = 'running';
    setPipelineSteps([...steps]);
    setCurrentAgentStage(0);

    try {
      // Step 1 -> Step 2 transition
      const timer1 = setTimeout(() => {
        steps[0].status = 'completed';
        steps[1].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(1);
      }, 300);

      // Step 2 -> Step 3 transition
      const timer2 = setTimeout(() => {
        steps[1].status = 'completed';
        steps[2].status = 'running';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(2);
      }, 600);

      if (!deep) {
        // Free Quick Scan
        const freeRes = await executeFreeScan(cleanUrl);
        clearTimeout(timer1);
        clearTimeout(timer2);

        steps[0].status = 'completed';
        steps[1].status = 'completed';
        steps[2].status = 'completed';
        setPipelineSteps([...steps]);
        setCurrentAgentStage(3); // Paused for x402 payment
        setFreeScanResult(freeRes);
        setActiveChallenge(freeRes.x402_challenge || null);
      } else {
        // Full Deep Security Audit (x402)
        const timer3 = setTimeout(() => {
          steps[2].status = 'completed';
          steps[3].status = 'running';
          setPipelineSteps([...steps]);
          setCurrentAgentStage(4);
        }, 900);

        const timer4 = setTimeout(() => {
          steps[3].status = 'completed';
          steps[4].status = 'running';
          setPipelineSteps([...steps]);
          setCurrentAgentStage(5);
        }, 1300);

        const result = await analyzeDomain(cleanUrl, true, forceRefresh);

        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);

        const finalSteps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((s) => ({ ...s, status: 'completed' }));
        setPipelineSteps(finalSteps);
        setCurrentAgentStage(6); // Multi-signal complete

        setReport(result);
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
      setFreeScanResult(null);
      loadInitialData();
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '40px', position: 'relative' }}>
      {/* Subtle Background Matrix Canvas */}
      <MatrixBackground opacity={0.22} themeMode={theme} />

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
            onLaunchScanner={() => setActiveTab('scanner')}
            onOpenExtension={() => setActiveTab('extension')}
            onOpenDiscovery={() => setActiveTab('discovery')}
          />
        )}

        {/* Page 2: Live Security Scanner & Embedded Results */}
        {activeTab === 'scanner' && (
          <div>
            <Scanner
              onScan={handleScan}
              isLoading={isLoading}
              benchmarkSamples={benchmarkSamples}
            />

            {/* Pipeline Stepper (Active during scan or when target URL is entered) */}
            {(isLoading || currentScanningUrl) && (
              <PipelineStepper steps={pipelineSteps} />
            )}

            {/* Agentic Workflow HUD */}
            {currentScanningUrl && (
              <AgenticWorkflowHUD
                currentStage={currentAgentStage}
                targetUrl={currentScanningUrl}
                isPaid={agentIsPaid}
                onOpenPaymentModal={handleOpenPaymentForFreeScan}
                txId={report?.tx_id}
              />
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div
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
              </div>
            )}

            {/* Free Scan Result Preview (with x402 Deep Audit CTA) */}
            {freeScanResult && !report && !isLoading && (
              <div className="glass-panel" style={{ padding: '24px', margin: '0 24px 24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ✓ FREE QUICK SCAN COMPLETE (STAGE 1 &amp; 2)
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

            {/* Complete Real Live Scan Report (Displayed directly on Scanner page) */}
            {report && !isLoading && (
              <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Top Risk & Verdict Summary */}
                <RiskSummaryCard
                  report={report}
                  onExportClick={() => setShowExportModal(true)}
                  onSubmitFeedback={handleSubmitFeedback}
                />

                {/* Brand Contradiction & Exploitability Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                  <BrandContradictionCard brand={report.brand_analysis} domainIntel={report.domain_intel} />
                  <SecurityPostureCard audit={report.security_audit} />
                </div>

                {/* Attack Chain & Forensic Evidence */}
                <AttackChainVisualizer nodes={report.attack_chain} />
                <EvidenceTable evidence={report.evidence_breakdown} />
                <TechnicalInspector report={report} />
              </div>
            )}
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
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                  <BrandContradictionCard brand={report.brand_analysis} domainIntel={report.domain_intel} />
                  <SecurityPostureCard audit={report.security_audit} />
                </div>
                <AttackChainVisualizer nodes={report.attack_chain} />
                <EvidenceTable evidence={report.evidence_breakdown} />
                <TechnicalInspector report={report} />
              </>
            ) : (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No active security scan loaded. Go to the Live Scanner to audit a URL.</p>
                <button
                  onClick={() => setActiveTab('scanner')}
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
            onLaunchScanner={() => setActiveTab('scanner')}
            onOpenPaymentModal={() => setShowPaymentModal(true)}
          />
        )}

        {/* Page 5: Chrome Extension */}
        {activeTab === 'extension' && (
          <ChromeExtensionPage onLaunchScanner={() => setActiveTab('scanner')} />
        )}

        {/* Page 6: Reports / Scan History */}
        {activeTab === 'history' && (
          <ScanHistoryPage
            cases={cases}
            onSelectCase={handleSelectCase}
            onLaunchScanner={() => setActiveTab('scanner')}
          />
        )}

        {/* Page 7: About / How It Works */}
        {activeTab === 'about' && (
          <AboutPage onLaunchScanner={() => setActiveTab('scanner')} />
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
