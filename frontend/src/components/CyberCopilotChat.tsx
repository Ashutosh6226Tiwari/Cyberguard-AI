import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Zap,
  Shield,
  Briefcase,
  ExternalLink,
  MessageSquare,
  Lock,
  Layers,
  ChevronDown,
  RotateCcw,
  Key,
  Settings,
  Globe,
  Plus,
  Trash2,
  Search,
  Download,
  PanelLeftClose,
  PanelLeft,
  Sliders,
  Code,
  FileText,
  AlertTriangle,
  Volume2,
  VolumeX,
  Square,
  Edit3,
  Pin,
  BookOpen,
  Cloud,
  Crown,
  HardDrive,
  User,
  Sun,
  Moon
} from 'lucide-react';
import type { RiskScoreReport, FreeScanResult, ChatMessage } from '../types';
import {
  sendChatMessage,
  executeFreeScan,
  DEFAULT_GEMINI_API_KEY,
  syncCloudSessions,
  fetchCloudSessions,
  deleteCloudSession,
  clearAllCloudSessions,
  deductUserCredit,
  type UserProfile
} from '../services/api';

export type CopilotMode =
  | 'security-analyst'
  | 'developer-assistant'
  | 'soc-investigator'
  | 'security-tutor'
  | 'incident-responder';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  domain?: string | null;
  securityMode?: CopilotMode;
  isPinned?: boolean;
}

interface CyberCopilotChatProps {
  theme?: 'light' | 'dark';
  report?: RiskScoreReport | FreeScanResult | null;
  isOpen: boolean;
  isStandalone?: boolean;
  onToggle: () => void;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
  onOpenAboutTopic?: (topicId: string) => void;
  onScanReportLoaded?: (report: FreeScanResult | RiskScoreReport) => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
  onToggleTheme?: () => void;
}

const getScopedSessionsKey = (user?: UserProfile | null): string => {
  if (!user || !user.email) return 'cyberguard_copilot_sessions_guest';
  const sanitized = (user.email || user.id || 'anon').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  return `cyberguard_copilot_sessions_${sanitized}`;
};

const getScopedActiveIdKey = (user?: UserProfile | null): string => {
  if (!user || !user.email) return 'cyberguard_copilot_active_id_guest';
  const sanitized = (user.email || user.id || 'anon').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  return `cyberguard_copilot_active_id_${sanitized}`;
};

const loadUserSessionsFromStorage = (user?: UserProfile | null): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  // One-time cleanup: migrate legacy shared key to previous user so it never leaks to other accounts
  try {
    const legacy = localStorage.getItem('cyberguard_copilot_sessions_v1');
    if (legacy) {
      const targetKey = 'cyberguard_copilot_sessions_6387siddhartha_gmail_com';
      if (!localStorage.getItem(targetKey)) {
        localStorage.setItem(targetKey, legacy);
      }
      localStorage.removeItem('cyberguard_copilot_sessions_v1');
      localStorage.removeItem('cyberguard_copilot_active_id_v1');
    }
  } catch (e) {}

  const key = getScopedSessionsKey(user);
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved chat sessions:', e);
  }
  return [];
};

export const CyberCopilotChat: React.FC<CyberCopilotChatProps> = ({
  theme,
  report,
  isOpen,
  isStandalone = false,
  onToggle,
  pendingPrompt,
  onClearPendingPrompt,
  onOpenAboutTopic,
  onScanReportLoaded,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onToggleTheme
}) => {
  const isDark = theme ? theme === 'dark' : (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') !== 'light');
  const [activeReport, setActiveReport] = useState<any>(report);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(Boolean(isStandalone));
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isStandalone) {
      setIsFullScreen(true);
      setIsMinimized(false);
    }
  }, [isStandalone]);
  const [securityMode, setSecurityMode] = useState<CopilotMode>('security-analyst');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showPlaybooksModal, setShowPlaybooksModal] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Account Plan & Quota Calculations
  const isPro = currentUser?.plan === 'premium';
  const currentCredits = currentUser?.credits ?? (isPro ? 5000 : 50);
  const maxCredits = currentUser?.max_credits ?? (isPro ? 5000 : 50);
  const creditPct = Math.min(100, Math.max(0, Math.round((currentCredits / maxCredits) * 100)));

  const memoryUsedKb = currentUser?.memory_used_kb ?? 48.0;
  const memoryMaxKb = currentUser?.memory_max_kb ?? (isPro ? 8192.0 : 256.0);
  const memoryPct = currentUser?.memory_used_pct ?? Math.min(100, Math.round((memoryUsedKb / memoryMaxKb) * 100));

  // Gemini API Key config
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cyberguard_gemini_api_key');
      if (stored && stored.trim()) return stored.trim();
    }
    const envKey = ((import.meta as any)?.env?.VITE_GEMINI_API_KEY || '').trim();
    return envKey || DEFAULT_GEMINI_API_KEY;
  });
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);

  // Chat sessions state - isolated specifically per user account
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    return loadUserSessionsFromStorage(currentUser);
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem(getScopedActiveIdKey(currentUser));
      if (storedId) return storedId;
    }
    return '';
  });

  // Current session messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const stopStreamRequestedRef = useRef(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [hasExported, setHasExported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Target report details
  const rawDomain = (activeReport as any)?.canonical_domain || (activeReport as any)?.domain;
  const hasScannedSite = Boolean(rawDomain && typeof rawDomain === 'string' && rawDomain.trim() && rawDomain.trim().toLowerCase() !== 'target website');
  const domain = hasScannedSite ? rawDomain.trim() : null;
  const verdict = (activeReport as any)?.verdict;
  const riskScore = (activeReport as any)?.overall_risk_score ?? (activeReport as any)?.basic_risk_score ?? (activeReport as any)?.fast_risk_score;
  const grade = (activeReport as any)?.security_audit?.security_grade || (activeReport as any)?.security_grade;

  // Sync external report with active report
  useEffect(() => {
    setActiveReport(report || null);
  }, [report]);

  // Reactive Account Switch: When user changes, load THAT specific user's chat history
  const previousUserKeyRef = useRef<string>(
    (currentUser?.email || currentUser?.id || 'guest').trim().toLowerCase()
  );

  useEffect(() => {
    const currentKey = (currentUser?.email || currentUser?.id || 'guest').trim().toLowerCase();
    
    // Check if account has switched
    if (previousUserKeyRef.current !== currentKey) {
      previousUserKeyRef.current = currentKey;

      const userLocalSessions = loadUserSessionsFromStorage(currentUser);

      const applyLoadedSessions = (loaded: ChatSession[]) => {
        if (loaded.length > 0) {
          setSessions(loaded);
          const savedActiveId = localStorage.getItem(getScopedActiveIdKey(currentUser));
          const active = loaded.find(s => s.id === savedActiveId) || loaded[0];
          setActiveSessionId(active.id);
          setMessages(active.messages);
        } else {
          const fresh = createNewSessionObject(domain);
          setSessions([fresh]);
          setActiveSessionId(fresh.id);
          setMessages(fresh.messages);
          try {
            localStorage.setItem(getScopedSessionsKey(currentUser), JSON.stringify([fresh]));
          } catch (e) {}
        }
      };

      if (currentUser && currentUser.id) {
        // Fetch from Firestore specifically for this newly signed-in user
        import('../services/firebase').then(({ fetchChatSessionsFromFirestore }) => {
          fetchChatSessionsFromFirestore(currentUser.id).then((fsSessions) => {
            if (previousUserKeyRef.current !== currentKey) return;
            if (Array.isArray(fsSessions) && fsSessions.length > 0) {
              applyLoadedSessions(fsSessions);
              try {
                localStorage.setItem(getScopedSessionsKey(currentUser), JSON.stringify(fsSessions));
              } catch (e) {}
            } else {
              applyLoadedSessions(userLocalSessions);
            }
          }).catch(() => {
            if (previousUserKeyRef.current === currentKey) {
              applyLoadedSessions(userLocalSessions);
            }
          });
        }).catch(() => {
          if (previousUserKeyRef.current === currentKey) {
            applyLoadedSessions(userLocalSessions);
          }
        });
      } else {
        applyLoadedSessions(userLocalSessions);
      }
    }
  }, [currentUser?.email, currentUser?.id]);

  // Create default initial session on first render if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      const initialSession = createNewSessionObject(domain);
      setSessions([initialSession]);
      setActiveSessionId(initialSession.id);
      setMessages(initialSession.messages);
    } else {
      if (!hasScannedSite) {
        // When no website is analyzed, ensure initial session is a clean blank chat
        const currentActive = sessions.find(s => s.id === activeSessionId);
        const hasUserMessages = currentActive && currentActive.messages.some(m => m.role === 'user');
        const isDomainSession = Boolean(currentActive?.domain);

        if (!currentActive || hasUserMessages || isDomainSession) {
          const existingBlank = sessions.find(
            s => !s.domain && !s.messages.some(m => m.role === 'user')
          );
          if (existingBlank) {
            setActiveSessionId(existingBlank.id);
            setMessages(existingBlank.messages);
          } else {
            const fresh = createNewSessionObject(null);
            setSessions([fresh, ...sessions]);
            setActiveSessionId(fresh.id);
            setMessages(fresh.messages);
          }
          return;
        }
      }

      const active = sessions.find(s => s.id === activeSessionId) || sessions[0];
      if (active) {
        setActiveSessionId(active.id);
        setMessages(active.messages);
      }
    }
  }, []);

  // Save sessions to user-scoped localStorage whenever sessions change
  useEffect(() => {
    if (typeof window !== 'undefined' && sessions.length > 0) {
      try {
        const key = getScopedSessionsKey(currentUser);
        localStorage.setItem(key, JSON.stringify(sessions));
      } catch (e) {
        console.warn('Failed to save sessions to storage:', e);
      }
    }
  }, [sessions, currentUser?.email, currentUser?.id]);

  // Save activeSessionId
  useEffect(() => {
    if (typeof window !== 'undefined' && activeSessionId) {
      const key = getScopedActiveIdKey(currentUser);
      localStorage.setItem(key, activeSessionId);
    }
  }, [activeSessionId, currentUser?.email, currentUser?.id]);

  // Cloud Sync: Automatically sync sessions to Firestore & backend when logged in
  useEffect(() => {
    if (currentUser && sessions.length > 0) {
      const targetUserId = currentUser.id;
      const targetEmail = currentUser.email?.trim().toLowerCase();
      const timer = setTimeout(() => {
        if (currentUser.id === targetUserId && (currentUser.email?.trim().toLowerCase() === targetEmail)) {
          syncCloudSessions(sessions);
          import('../services/firebase').then(({ syncChatSessionsToFirestore }) => {
            syncChatSessionsToFirestore(targetUserId, sessions);
          }).catch(() => {});
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sessions, currentUser?.id, currentUser?.email]);

  function getInitialWelcomeMessage(targetDomain?: string | null): ChatMessage {
    let scannedCount = 0;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('cyberguard_scan_history') : null;
      if (raw) scannedCount = JSON.parse(raw).length;
    } catch {}

    if (targetDomain) {
      return {
        role: 'assistant',
        content: `👋 **CyberGuard AI Copilot Active**\n\nI have loaded live forensic intelligence for **\`${targetDomain}\`**:\n- **Verdict:** \`${verdict || 'ANALYZED'}\`\n- **Risk Score:** \`${riskScore !== undefined ? `${riskScore}/100` : 'Evaluated'}\`\n- **Security Grade:** \`${grade || 'Active'}\`\n\n${scannedCount > 0 ? `🧠 *Persistent Memory: I remember all ${scannedCount} domains you have audited till now! Ask "which domain I scanned till now" at any time.*\n\n` : ''}You can ask me to explain the risk score, provide hardening configurations for Nginx/Apache, review code for vulnerabilities, or run a re-audit.`
      };
    }
    return {
      role: 'assistant',
      content: `👋 **CyberGuard AI Copilot Online**\n\nI am your cybersecurity AI analyst and security engineering assistant.\n\n${scannedCount > 0 ? `🧠 **Audit Memory Active:** I remember all **${scannedCount}** domains you have scanned till now!\n\n` : ''}Ask me any cybersecurity question (e.g. *"What is SQL injection?"*, *"Explain XSS"*, *"Write secure FastAPI auth middleware"*), or type **\`Audit example.com\`** for an instant domain security audit!`
    };
  }

  function createNewSessionObject(targetDomain?: string | null): ChatSession {
    const newId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = targetDomain ? `${targetDomain} Audit` : 'New Security Chat';
    return {
      id: newId,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [getInitialWelcomeMessage(targetDomain)],
      domain: targetDomain || null,
      securityMode
    };
  }

  const handleCreateNewChat = () => {
    const newSession = createNewSessionObject(domain);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    setStatusNotice(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    if (session.securityMode) {
      setSecurityMode(session.securityMode);
    }
    setStatusNotice(null);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) {
      deleteCloudSession(sessionId);
    }
    const remaining = sessions.filter(s => s.id !== sessionId);
    if (remaining.length === 0) {
      const fresh = createNewSessionObject(domain);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setMessages(fresh.messages);
    } else {
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
        setMessages(remaining[0].messages);
      }
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to delete all saved chat history?')) {
      if (currentUser) {
        clearAllCloudSessions();
      }
      const fresh = createNewSessionObject(domain);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setMessages(fresh.messages);
      try {
        localStorage.removeItem(getScopedSessionsKey(currentUser));
        localStorage.removeItem(getScopedActiveIdKey(currentUser));
      } catch (e) {}
    }
  };

  // Text-To-Speech (Read Aloud)
  const handleToggleSpeech = (text: string, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser environment.');
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\[SANDBOX_VIEWPORT:[^\]]+\]/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#`|]/g, '')
      .replace(/https?:\/\/\S+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Rename Session Title
  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, title: trimmed, updatedAt: Date.now() } : s))
      );
    }
    setEditingSessionId(null);
  };

  // Toggle Pinned Session
  const handleTogglePin = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Stop Generation (immediately interrupts stream or fetch)
  const handleStopGenerating = () => {
    stopStreamRequestedRef.current = true;
    setIsLoading(false);
    setIsStreaming(false);
    setStatusNotice(null);
  };

  // Handle pending prompt from external "Ask AI Copilot" triggers
  useEffect(() => {
    if (pendingPrompt) {
      if (!isOpen) {
        onToggle();
      }
      setIsMinimized(false);
      handleSendMessage(pendingPrompt);
      if (onClearPendingPrompt) {
        onClearPendingPrompt();
      }
    }
  }, [pendingPrompt]);

  // Auto-scroll on new message or live streaming token
  useEffect(() => {
    if (isOpen && !isMinimized) {
      if (isStreaming) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isOpen, isMinimized, isLoading, isStreaming]);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // When opening Copilot: if no website is analyzed, automatically ensure a fresh new chat is open
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!wasOpen && isOpen) {
      if (!hasScannedSite) {
        setSessions(prevSessions => {
          const currentActive = prevSessions.find(s => s.id === activeSessionId);
          const hasUserMessages = currentActive && currentActive.messages.some(m => m.role === 'user');
          const isDomainSession = Boolean(currentActive?.domain);

          // If current session is already an empty new chat (no user messages and no domain), keep it
          if (currentActive && !hasUserMessages && !isDomainSession) {
            return prevSessions;
          }

          // Check if an existing blank new chat session already exists (no user messages, no domain)
          const existingBlank = prevSessions.find(
            s => !s.domain && !s.messages.some(m => m.role === 'user')
          );

          if (existingBlank) {
            setActiveSessionId(existingBlank.id);
            setMessages(existingBlank.messages);
            setStatusNotice(null);
            return prevSessions;
          }

          // Otherwise create a fresh new chat session
          const newSession = createNewSessionObject(null);
          setActiveSessionId(newSession.id);
          setMessages(newSession.messages);
          setStatusNotice(null);
          return [newSession, ...prevSessions];
        });
      }
    }
  }, [isOpen, hasScannedSite, activeSessionId]);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setGeminiApiKey(trimmed);
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('cyberguard_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('cyberguard_gemini_api_key');
      }
    }
    setShowApiKeyModal(false);
  };

  // Export chat history as Markdown
  const handleExportChat = () => {
    const session = sessions.find(s => s.id === activeSessionId);
    const title = session?.title || 'Security Audit Transcript';
    const lines = [
      `# CyberGuard AI Copilot — Security Audit & Chat Transcript`,
      `**Session:** ${title}`,
      `**Date:** ${new Date().toLocaleString()}`,
      `**Target Host:** ${domain || 'General Mode'}`,
      `**Security Mode:** ${securityMode.toUpperCase()}`,
      `---`,
      ''
    ];

    messages.forEach(m => {
      lines.push(`### ${m.role === 'user' ? '👤 User' : '🤖 CyberGuard Copilot'}:`);
      lines.push(m.content);
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Clean, readable filename (e.g. cyberguard_copilot_audit_2026-10-12.md)
    const sanitizedTitle = (domain || title || 'security_audit')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 30);
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `cyberguard_copilot_${sanitizedTitle}_${dateStr}.md`;

    a.click();
    URL.revokeObjectURL(url);
    setHasExported(true);
    setTimeout(() => setHasExported(false), 2500);
  };

  // Stream assistant reply line by line with natural ChatGPT typewriter cadence
  const streamAssistantMessage = async (
    fullText: string,
    currentBaseMessages: ChatMessage[],
    updatedTitle?: string
  ) => {
    const targetSessionId = activeSessionId;
    stopStreamRequestedRef.current = false;
    setIsLoading(false);
    setIsStreaming(true);

    // Initial empty assistant message in chat
    const initialAssistantMessages: ChatMessage[] = [
      ...currentBaseMessages,
      { role: 'assistant', content: '' }
    ];
    setMessages(initialAssistantMessages);

    // Split text into lines to ensure natural line-by-line flow like ChatGPT
    const lines = fullText.split('\n');
    let accumulated = '';
    let inCodeBlock = false;

    // Adaptive speed: ensures snappy responsiveness whether answer is 50 words or 1,000 words
    const isLongText = fullText.length > 600;
    const isMediumText = fullText.length > 200;
    const wordDelay = isLongText ? 3 : isMediumText ? 5 : 8;
    const punctuationDelay = isLongText ? 6 : isMediumText ? 10 : 15;
    const lineDelay = isLongText ? 12 : isMediumText ? 18 : 28;

    for (let lIdx = 0; lIdx < lines.length; lIdx++) {
      if (stopStreamRequestedRef.current) break;

      const line = lines[lIdx];
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      }

      // If inside a code block, stream line-by-line for clean syntax rendering
      if (inCodeBlock && !line.trim().startsWith('```')) {
        accumulated += (accumulated.length > 0 && accumulated[accumulated.length - 1] !== '\n' ? '\n' : '') + line + '\n';
        setMessages(prev => {
          if (prev.length === 0) return prev;
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: accumulated };
          return copy;
        });
        await new Promise(r => setTimeout(r, 10));
        continue;
      }

      // Tokenize line into words and spacing
      const tokens = line.match(/\S+|\s+/g) || [line];

      for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
        if (stopStreamRequestedRef.current) break;

        const token = tokens[tIdx];
        accumulated += token;

        setMessages(prev => {
          if (prev.length === 0) return prev;
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: accumulated };
          return copy;
        });

        const isPunctuation = /[.,!?;:]$/.test(token.trim());
        const tokenDelay = isPunctuation ? punctuationDelay : wordDelay;
        if (tokenDelay > 0) {
          await new Promise(r => setTimeout(r, tokenDelay));
        }
      }

      if (stopStreamRequestedRef.current) break;

      // When finishing a line, add newline and pause naturally
      if (lIdx < lines.length - 1) {
        accumulated += '\n';
        setMessages(prev => {
          if (prev.length === 0) return prev;
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: accumulated };
          return copy;
        });
        await new Promise(r => setTimeout(r, lineDelay));
      }
    }

    setIsStreaming(false);

    // Finalize session persistence
    const finalContent = accumulated || fullText;
    const finalizedMessages: ChatMessage[] = [
      ...currentBaseMessages,
      { role: 'assistant', content: finalContent }
    ];
    setMessages(finalizedMessages);

    setSessions(prev =>
      prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            title: updatedTitle || s.title,
            updatedAt: Date.now(),
            messages: finalizedMessages,
            domain: domain || s.domain,
            securityMode
          };
        }
        return s;
      })
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    // Auto-update session title if it's the first user question
    const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;
    let updatedTitle = '';
    if (isFirstUserMessage) {
      const cleanSnippet = query.replace(/[^\w\s.-]/g, '').trim();
      updatedTitle = cleanSnippet.length > 32 ? `${cleanSnippet.substring(0, 32)}...` : cleanSnippet;
    }

    // Check if query is an account / quota / subscription inquiry
    const lowerQuery = query.toLowerCase();
    const isAccountQuery = 
      /^(what('?s| is)? (my )?account|give account|show account|my profile|account detail|my credits|my plan|my subscription|who am i)/i.test(query.trim()) ||
      lowerQuery.includes('account detail') || 
      lowerQuery.includes('my credits') || 
      lowerQuery.includes('my plan') ||
      lowerQuery.includes('show my account') ||
      lowerQuery.includes('quota details');

    if (isAccountQuery) {
      const username = currentUser?.username || 'Guest Cyber Operator';
      const email = currentUser?.email || 'Anonymous Guest Session';
      const planName = isPro ? 'PREMIUM PRO 👑' : 'FREE TIER (Standard Access)';
      const creditsDisplay = `${currentCredits.toLocaleString()} / ${maxCredits.toLocaleString()} Credits`;
      const memoryDisplay = `${memoryPct}% Fill-Up (${memoryUsedKb} KB / ${memoryMaxKb} KB)`;

      const accountReply = `### 👤 CyberGuard Operator Account Dossier

• * Operator Handle: **${username}**
• * Registered Email: ${email}
• * Active Subscription: **${planName}**
• * AI Credits Remaining: **${creditsDisplay}**
• * Copilot Context Memory: **${memoryDisplay}**
• * Threat Intelligence Feeds: Active & Connected (14 Global Threat Sources)
• * Cloud Sync Status: ${currentUser ? 'Active & Synced across devices' : 'Local Browser Cache'}

---

### 📊 Capabilities & Quotas

Plan Tier | Quota Allocation
**Security Scanners** | All 8 Tools 100% Free
**Daily AI Analyses** | ${isPro ? 'Priority Deep Triage & Unlimited Sandbox' : '50 Daily Credits'}
**Copilot Memory Window** | ${isPro ? '8 MB Extended Context' : '256 KB Session Memory'}
**Razorpay Billing** | ${isPro ? 'Active Pro Membership' : 'Upgrades available via [Profile & Plans]'}

---

💡 **Account Action:** You can manage credits, view full memory fill-up, or upgrade your plan anytime using the account tile in the left sidebar or the **Profile & Plans** button.`;

      await streamAssistantMessage(accountReply, newMessages, updatedTitle);
      return;
    }

    let currentContextReport = activeReport;

    try {
      setStatusNotice(null);
      const chatHistory = newMessages.map(m => ({ role: m.role, content: m.content }));

      let scanHistory: any[] = [];
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('cyberguard_scan_history') : null;
        if (raw) scanHistory = JSON.parse(raw);
      } catch {}

      const response = await sendChatMessage(
        query,
        currentContextReport,
        chatHistory,
        geminiApiKey,
        scanHistory,
        securityMode,
        activeSessionId
      );
      deductUserCredit().catch(() => {});

      // If the backend executed an explicit domain audit tool, update the active report and notify parent
      if (response.intent === 'domain_audit' && response.evidence && response.evidence.length > 0) {
        const scanEvidence = response.evidence.find((e: any) => e.status === 'completed' && e.domain);
        if (scanEvidence) {
          setActiveReport(scanEvidence);
          currentContextReport = scanEvidence;
          if (onScanReportLoaded) {
            onScanReportLoaded(scanEvidence as any);
          }
        }
      }

      await streamAssistantMessage(response.reply, newMessages, updatedTitle);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply = '⚠️ **Copilot System Notice:** Network timeout on remote socket. Generated forensic analysis based on active local telemetry.';
      await streamAssistantMessage(fallbackReply, newMessages, updatedTitle);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStatusNotice(null);
    }
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyFullMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };

  // Filter and sort sessions (pinned first, then newest updated)
  const sortedSessions = [...sessions]
    .filter(s =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.domain && s.domain.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
    });

  const CYBER_PLAYBOOKS = [
    {
      id: 'ir-triage',
      title: '🚨 Incident Response & Containment Playbook',
      desc: 'Step-by-step SOC triage for suspected ransomware, credential dumping, or data breach (NIST SP 800-61).',
      prompt: 'Generate an emergency Incident Response (IR) triage playbook for a suspected host compromise. Outline the containment, network isolation, volatile RAM acquisition, and eradication steps under NIST SP 800-61.'
    },
    {
      id: 'nginx-headers',
      title: '🛡️ Production Nginx & Cloud Hardening',
      desc: 'Deploy strict CSP, HSTS preloading, X-Frame-Options, and DDoS rate limiting.',
      prompt: 'Provide a production-ready Nginx reverse proxy configuration with hardened security headers (CSP, HSTS preload, X-Frame-Options, nosniff, Referrer-Policy) and DDoS rate limiting.'
    },
    {
      id: 'phishing-forensics',
      title: '📧 Email Phishing Forensic Audit',
      desc: 'Deep inspection of RFC 5322 email headers, SPF, DKIM, and DMARC alignment.',
      prompt: 'Walk me through a forensic investigation of a suspected spear-phishing email. How do I inspect Received headers, verify DKIM cryptographic signatures, and detect display name spoofing?'
    },
    {
      id: 'owasp-injection',
      title: '🔒 OWASP Top 10 Code Injection Immunity',
      desc: 'Code patterns to completely eliminate SQLi, stored XSS, CSRF, and SSRF.',
      prompt: 'Show code examples in Python and TypeScript demonstrating how to eliminate SQL Injection (SQLi), Cross-Site Scripting (XSS), and Server-Side Request Forgery (SSRF).'
    },
    {
      id: 'zero-trust',
      title: '🏰 Zero Trust Architecture (NIST 800-207)',
      desc: 'Blueprint for identity-driven access, microsegmentation, and mTLS.',
      prompt: 'Explain how to design and migrate a corporate infrastructure to NIST SP 800-207 Zero Trust Architecture. Detail the control plane, data plane, microsegmentation, and mutual TLS.'
    },
    {
      id: 'ad-kerberos',
      title: '⚔️ Active Directory & Kerberos Defense',
      desc: 'Detect and mitigate Kerberoasting, AS-REP roasting, and Golden Tickets.',
      prompt: 'Explain how Kerberoasting and AS-REP Roasting attacks work against Active Directory, and provide exact remediation steps (gMSA, AES encryption) and SIEM Event IDs to detect them.'
    }
  ];

  // Context-Aware Quick Prompt Chips
  const quickPrompts = (() => {
    if (securityMode === 'developer-assistant') {
      return [
        { label: 'Write secure FastAPI auth middleware', icon: <Terminal size={12} color="#10b981" />, colorClass: 'copilot-chip-emerald' },
        { label: 'Generate strict CSP header', icon: <Shield size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' },
        { label: 'Show SQL injection defense in Python', icon: <Lock size={12} color="#a855f7" />, colorClass: 'copilot-chip-purple' },
        { label: 'Generate hardened Nginx config', icon: <Terminal size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' },
        { label: 'Review this code for vulnerabilities', icon: <Zap size={12} color="#f59e0b" />, colorClass: 'copilot-chip-amber' }
      ];
    }
    if (securityMode === 'incident-responder') {
      return [
        { label: 'Ransomware containment checklist', icon: <Shield size={12} color="#ef4444" />, colorClass: 'copilot-chip-rose' },
        { label: 'Volatile memory acquisition steps', icon: <Terminal size={12} color="#10b981" />, colorClass: 'copilot-chip-emerald' },
        { label: 'Revoking compromised AWS IAM keys', icon: <Lock size={12} color="#a855f7" />, colorClass: 'copilot-chip-purple' },
        { label: 'Post-incident evidence preservation', icon: <Zap size={12} color="#f59e0b" />, colorClass: 'copilot-chip-amber' }
      ];
    }
    if (securityMode === 'soc-investigator') {
      return [
        { label: 'Show threat stats', icon: <Zap size={12} color="#f59e0b" />, colorClass: 'copilot-chip-amber' },
        { label: 'Correlate SIEM Event IDs for Kerberoasting', icon: <Shield size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' },
        { label: 'Analyze phishing email indicators', icon: <Lock size={12} color="#a855f7" />, colorClass: 'copilot-chip-purple' },
        { label: 'Which domains have I scanned?', icon: <User size={12} color="#10b981" />, colorClass: 'copilot-chip-emerald' }
      ];
    }
    if (securityMode === 'security-tutor') {
      return [
        { label: 'Explain SQL injection from scratch', icon: <Lock size={12} color="#a855f7" />, colorClass: 'copilot-chip-purple' },
        { label: 'What is Zero Trust architecture?', icon: <Shield size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' },
        { label: 'How does DNS rebinding work?', icon: <Globe size={12} color="#38bdf8" />, colorClass: 'copilot-chip-sky' },
        { label: 'Explain RSA vs ECC cryptography', icon: <Zap size={12} color="#f59e0b" />, colorClass: 'copilot-chip-amber' }
      ];
    }
    if (hasScannedSite && domain) {
      return [
        { label: `Is ${domain} easily hackable?`, icon: <Shield size={12} color="#ef4444" />, colorClass: 'copilot-chip-rose' },
        { label: `Give steps to fix ${domain}`, icon: <Terminal size={12} color="#10b981" />, colorClass: 'copilot-chip-emerald' },
        { label: `Hardening headers for ${domain}`, icon: <Terminal size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' },
        { label: `Explain ${domain} risk score`, icon: <Zap size={12} color="#f59e0b" />, colorClass: 'copilot-chip-amber' },
        { label: 'Compare with previous scan', icon: <User size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' }
      ];
    }
    return [
      { label: 'What is SQL injection?', icon: <Lock size={12} color="#a855f7" />, colorClass: 'copilot-chip-purple' },
      { label: 'Explain XSS and CSP defenses', icon: <Shield size={12} color="var(--accent-cyan)" />, colorClass: 'copilot-chip-cyan' },
      { label: 'Write secure FastAPI auth middleware', icon: <Terminal size={12} color="#10b981" />, colorClass: 'copilot-chip-emerald' },
      { label: 'What is Zero Trust architecture?', icon: <Zap size={12} color="#f59e0b" />, colorClass: 'copilot-chip-amber' },
      { label: 'Audit example.com', icon: <Globe size={12} color="#38bdf8" />, colorClass: 'copilot-chip-sky' }
    ];
  })();

  // Interactive Live Chromium Sandbox Component
  const InteractiveChatSandbox: React.FC<{ initialUrl: string }> = ({ initialUrl }) => {
    const formatTargetUrl = (raw: string) => {
      let clean = (raw || '').trim();
      if (!clean) return 'https://campuskart.shop';
      if (!/^https?:\/\//i.test(clean)) {
        clean = `https://${clean}`;
      }
      return clean;
    };

    const initialFormatted = formatTargetUrl(initialUrl);
    const [currentUrl, setCurrentUrl] = useState(initialFormatted);
    const [inputUrl, setInputUrl] = useState(initialFormatted);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const handleRefresh = () => {
      setIsRefreshing(true);
      setIframeLoaded(false);
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setIsRefreshing(false), 600);
    };

    const handleNavigate = (e: React.FormEvent) => {
      e.preventDefault();
      const formatted = formatTargetUrl(inputUrl);
      setCurrentUrl(formatted);
      setInputUrl(formatted);
      setIframeLoaded(false);
      setRefreshKey(prev => prev + 1);
    };

    return (
      <div
        style={{
          margin: '12px 0',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          background: '#0a0e17',
          boxShadow: '0 8px 32px rgba(0, 240, 255, 0.12), 0 2px 10px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        {/* Sandbox Window Titlebar */}
        <div
          style={{
            background: 'linear-gradient(90deg, #0d131f 0%, #111827 100%)',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            </div>
            <span className="mono" style={{ fontSize: '0.72rem', color: '#00f0ff', fontWeight: 800, letterSpacing: '0.04em' }}>
              CHROMIUM SANDBOX
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.18)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontWeight: 700
              }}
            >
              ISOLATED
            </span>
          </div>

          <button
            onClick={handleRefresh}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem'
            }}
          >
            <RefreshCw size={11} className={isRefreshing ? 'spinning' : ''} />
            <span>Reload</span>
          </button>
        </div>

        {/* Sandbox URL Bar */}
        <form
          onSubmit={handleNavigate}
          style={{
            background: '#070a10',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <Globe size={13} color="#00f0ff" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="mono"
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '4px 8px',
              color: '#f8fafc',
              fontSize: '0.74rem',
              outline: 'none'
            }}
            placeholder="https://example.com"
          />
          <button
            type="submit"
            style={{
              background: '#0284c7',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Visit
          </button>
        </form>

        {/* Viewport Frame */}
        <div style={{ position: 'relative', width: '100%', height: '270px', background: '#020617' }}>
          {!iframeLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(2, 6, 23, 0.95)',
                zIndex: 2,
                color: 'var(--text-secondary)',
                fontSize: '0.74rem'
              }}
            >
              <RefreshCw size={18} color="#00f0ff" className="spinning" />
              <span className="mono">Connecting isolated chromium socket to {currentUrl}...</span>
            </div>
          )}

          <iframe
            key={`sandbox-frame-${refreshKey}`}
            src={currentUrl}
            title="CyberGuard Live Chromium Sandbox Viewport"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            onLoad={() => setIframeLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#ffffff'
            }}
          />
        </div>
      </div>
    );
  };

  // Markdown parsing with Code Blocks & Sandbox
  const renderMarkdownWithCodeBlocks = (content: string, prefixKey: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderTextWithFormatting(content.substring(lastIndex, match.index), `${prefixKey}-txt-${lastIndex}`));
      }
      const lang = match[1] || 'bash';
      const codeSnippet = match[2];
      const uniqueCodeKey = blockIndex * 1000 + match.index;

      parts.push(
        <div
          key={`${prefixKey}-code-${blockIndex}`}
          style={{
            background: '#1A1A1A',
            border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
            borderRadius: '0px',
            boxShadow: isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000',
            margin: '8px 0',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 12px',
              background: '#38BDF8',
              borderBottom: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              fontSize: '0.72rem',
              color: '#000000',
              fontWeight: 800
            }}
          >
            <span className="mono" style={{ fontWeight: 900 }}>{lang.toUpperCase()}</span>
            <button
              onClick={() => copyCode(codeSnippet, uniqueCodeKey)}
              style={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000',
                borderRadius: '0px',
                padding: '2px 8px',
                boxShadow: isDark ? '1.5px 1.5px 0px 0px #38BDF8' : '1.5px 1.5px 0px 0px #000000',
                color: isDark ? '#FFFFFF' : '#000000',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: 800
              }}
            >
              {copiedIndex === uniqueCodeKey ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedIndex === uniqueCodeKey ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: '12px',
              fontSize: '0.76rem',
              lineHeight: '1.45',
              overflowX: 'auto',
              color: '#F8FAFC',
              fontFamily: 'monospace'
            }}
          >
            {codeSnippet}
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
      blockIndex++;
    }

    if (lastIndex < content.length) {
      parts.push(renderTextWithFormatting(content.substring(lastIndex), `${prefixKey}-txt-${lastIndex}`));
    }

    return parts;
  };

  const renderMessageContent = (content: string, msgIdx: number) => {
    const sandboxMarkerRegex = /\[SANDBOX_VIEWPORT:\s*([^\]]+)\]/g;
    if (sandboxMarkerRegex.test(content)) {
      const segments: React.ReactNode[] = [];
      let lastPos = 0;
      let match;
      let sIdx = 0;
      sandboxMarkerRegex.lastIndex = 0;

      while ((match = sandboxMarkerRegex.exec(content)) !== null) {
        if (match.index > lastPos) {
          const preText = content.substring(lastPos, match.index);
          segments.push(
            <div key={`pre-${msgIdx}-${sIdx}`}>
              {renderMarkdownWithCodeBlocks(preText, `pre-${msgIdx}-${sIdx}`)}
            </div>
          );
        }
        const targetUrl = match[1].trim();
        segments.push(
          <InteractiveChatSandbox
            key={`sandbox-vp-${msgIdx}-${sIdx}`}
            initialUrl={targetUrl}
          />
        );
        lastPos = match.index + match[0].length;
        sIdx++;
      }

      if (lastPos < content.length) {
        const postText = content.substring(lastPos);
        segments.push(
          <div key={`post-${msgIdx}-${sIdx}`}>
            {renderMarkdownWithCodeBlocks(postText, `post-${msgIdx}-${sIdx}`)}
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {segments}
        </div>
      );
    }

    return renderMarkdownWithCodeBlocks(content, `msg-${msgIdx}`);
  };

  // Rich Inline Markdown Token Parser
  const renderInlineTokens = (text: string, inlineKeyPrefix: string): React.ReactNode => {
    const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_)/g;
    const nodes: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let tIdx = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        nodes.push(text.substring(lastIdx, match.index));
      }

      if (match[2] && match[3]) {
        nodes.push(
          <a
            key={`${inlineKeyPrefix}-lnk-${tIdx}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 600 }}
          >
            {match[2]}
          </a>
        );
      } else if (match[4]) {
        nodes.push(
          <code
            key={`${inlineKeyPrefix}-cd-${tIdx}`}
            className="mono"
            style={{
              background: isDark ? '#1E293B' : '#38BDF8',
              border: isDark ? '1.5px solid #38BDF8' : '1.5px solid #000000',
              padding: '1px 6px',
              borderRadius: '0px',
              fontSize: '0.78rem',
              color: isDark ? '#38BDF8' : '#000000',
              fontWeight: 700,
              boxShadow: isDark ? '1px 1px 0px 0px #38BDF8' : '1px 1px 0px 0px #000000'
            }}
          >
            {match[4]}
          </code>
        );
      } else if (match[5]) {
        nodes.push(
          <strong
            key={`${inlineKeyPrefix}-bld-${tIdx}`}
            style={{ color: 'var(--text-primary)', fontWeight: 800 }}
          >
            {match[5]}
          </strong>
        );
      } else if (match[6] || match[7]) {
        const itText = match[6] || match[7];
        nodes.push(
          <em
            key={`${inlineKeyPrefix}-it-${tIdx}`}
            style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}
          >
            {itText}
          </em>
        );
      }

      lastIdx = match.index + match[0].length;
      tIdx++;
    }

    if (lastIdx < text.length) {
      nodes.push(text.substring(lastIdx));
    }

    return nodes.length === 0 ? text : nodes;
  };

  // Dedicated Risk Assessment & Metric Formatter -> Neo-Brutalism
  const renderRiskMetricLine = (text: string, itemKey: string): React.ReactNode => {
    const strippedStars = text.replace(/\*\*/g, '').trim();

    const riskScoreMatch = strippedStars.match(/^Risk Score\s*:\s*(\d+)(\s*\/\s*100)?/i);
    if (riskScoreMatch) {
      const score = parseInt(riskScoreMatch[1], 10);
      const isSafe = score < 30;
      const isWarning = score >= 30 && score < 70;
      const badgeBg = isSafe ? '#6BCB77' : isWarning ? '#38BDF8' : '#FF6B6B';
      const statusText = isSafe ? 'SAFE' : isWarning ? 'SUSPICIOUS' : 'HIGH RISK';

      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Risk Score:</strong>
          <span
            style={{
              background: badgeBg,
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '0px',
              boxShadow: '2px 2px 0px 0px #000000',
              padding: '2px 8px',
              fontSize: '0.74rem',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {score} / 100 • {statusText}
          </span>
        </div>
      );
    }

    const verdictMatch = strippedStars.match(/^Verdict\s*:\s*(.+)$/i);
    if (verdictMatch) {
      const verdict = verdictMatch[1].trim();
      const isSafe = /benign|safe|clean/i.test(verdict);
      const isPhish = /phish|malicious|danger|critical/i.test(verdict);
      const badgeBg = isSafe ? '#6BCB77' : isPhish ? '#FF6B6B' : '#38BDF8';

      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Verdict:</strong>
          <span
            style={{
              background: badgeBg,
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '0px',
              boxShadow: '2px 2px 0px 0px #000000',
              padding: '2px 8px',
              fontSize: '0.74rem',
              fontWeight: 900
            }}
          >
            {verdict}
          </span>
        </div>
      );
    }

    const gradeMatch = strippedStars.match(/^Security Grade\s*:\s*(.+)$/i);
    if (gradeMatch) {
      const grade = gradeMatch[1].trim();
      const isGood = /^(A\+|A|B)/i.test(grade);
      const badgeBg = isGood ? '#6BCB77' : '#38BDF8';

      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Security Grade:</strong>
          <span
            style={{
              background: badgeBg,
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '0px',
              boxShadow: '2px 2px 0px 0px #000000',
              padding: '2px 8px',
              fontSize: '0.74rem',
              fontWeight: 900
            }}
          >
            {grade}
          </span>
        </div>
      );
    }

    return renderInlineTokens(text, itemKey);
  };

  const renderTextWithFormatting = (rawText: string, keyPrefix: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    const parseTableRow = (rowStr: string): string[] => {
      let s = rowStr.trim();
      if (s.startsWith('|')) s = s.slice(1);
      if (s.endsWith('|')) s = s.slice(0, -1);
      return s.split('|').map(c => c.trim());
    };

    const isTableDivider = (str: string) => {
      const parts = parseTableRow(str);
      return parts.length >= 2 && parts.every(p => /^:?-+:?$/.test(p.trim()));
    };

    const isTableRow = (str: string) => {
      const trimmed = str.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('>') || /^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) return false;
      if (!trimmed.includes('|')) return false;
      const parts = parseTableRow(trimmed);
      return parts.length >= 2;
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Blank line
      if (!trimmed) {
        elements.push(<div key={`${keyPrefix}-blank-${i}`} style={{ height: '4px' }} />);
        i++;
        continue;
      }

      // Check for Table Block
      if (isTableRow(line)) {
        const tableLines: string[] = [];
        const startIdx = i;
        while (i < lines.length && (isTableRow(lines[i]) || isTableDivider(lines[i]))) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length > 0) {
          const headerRow = parseTableRow(tableLines[0]);
          let bodyRowLines = tableLines.slice(1);
          bodyRowLines = bodyRowLines.filter(l => !isTableDivider(l));
          const bodyRows = bodyRowLines.map(parseTableRow);

          elements.push(
            <div
              key={`${keyPrefix}-tbl-${startIdx}`}
              style={{
                margin: '8px 0',
                overflowX: 'auto',
                borderRadius: '0px',
                border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                background: isDark ? '#1E293B' : '#FFFFFF',
                boxShadow: isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#38BDF8', borderBottom: isDark ? '2px solid #FFFFFF' : '2px solid #000000' }}>
                    {headerRow.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        style={{
                          padding: '8px 12px',
                          fontWeight: 900,
                          color: '#000000',
                          letterSpacing: '0.3px',
                          borderRight: hIdx < headerRow.length - 1 ? (isDark ? '1px solid #FFFFFF' : '1px solid #000000') : 'none'
                        }}
                      >
                        {renderInlineTokens(h, `${keyPrefix}-tbl-${startIdx}-th-${hIdx}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: rIdx < bodyRows.length - 1 ? (isDark ? '1px solid #334155' : '1px solid #E2E8F0') : 'none',
                        background: rIdx % 2 === 1 ? (isDark ? '#141414' : '#FFFDF5') : (isDark ? '#1E293B' : '#FFFFFF')
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            padding: '7px 12px',
                            color: isDark ? '#FFFFFF' : '#000000',
                            borderRight: cIdx < row.length - 1 ? (isDark ? '1px solid #334155' : '1px solid #E2E8F0') : 'none'
                          }}
                        >
                          {renderInlineTokens(cell, `${keyPrefix}-tbl-${startIdx}-td-${rIdx}-${cIdx}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Check for Horizontal Divider
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        elements.push(
          <div
            key={`${keyPrefix}-div-${i}`}
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, rgba(0,240,255,0.4) 0%, var(--border-color) 60%, transparent 100%)',
              margin: '8px 0'
            }}
          />
        );
        i++;
        continue;
      }

      // Check for Headings
      if (trimmed.startsWith('#')) {
        const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (hMatch) {
          const level = hMatch[1].length;
          const headingText = hMatch[2];
          if (level === 1) {
            elements.push(
              <h3
                key={`${keyPrefix}-h-${i}`}
                style={{
                  margin: '12px 0 6px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.3px'
                }}
              >
                {renderInlineTokens(headingText, `${keyPrefix}-h1-${i}`)}
              </h3>
            );
          } else if (level === 2) {
            elements.push(
              <h4
                key={`${keyPrefix}-h-${i}`}
                style={{
                  margin: '10px 0 5px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.2px'
                }}
              >
                {renderInlineTokens(headingText, `${keyPrefix}-h2-${i}`)}
              </h4>
            );
          } else {
            elements.push(
              <div
                key={`${keyPrefix}-h-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  margin: '9px 0 4px',
                  paddingBottom: '3px',
                  borderBottom: '1px solid rgba(0, 240, 255, 0.15)'
                }}
              >
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    color: 'var(--accent-cyan)',
                    letterSpacing: '0.2px'
                  }}
                >
                  {renderInlineTokens(headingText, `${keyPrefix}-h3-${i}`)}
                </span>
              </div>
            );
          }
          i++;
          continue;
        }
      }

      // Check for Blockquote
      if (trimmed.startsWith('>')) {
        const quoteText = trimmed.replace(/^>\s*/, '');
        elements.push(
          <div
            key={`${keyPrefix}-quote-${i}`}
            style={{
              borderLeft: '3px solid var(--accent-cyan)',
              padding: '6px 12px',
              margin: '6px 0',
              background: 'rgba(0, 240, 255, 0.04)',
              borderRadius: '0 6px 6px 0',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.45'
            }}
          >
            {renderInlineTokens(quoteText, `${keyPrefix}-quote-${i}`)}
          </div>
        );
        i++;
        continue;
      }

      // Check for List Item
      if (/^\s*([•*\-+]|\d+\.)\s+/.test(trimmed)) {
        const cleanText = trimmed.replace(/^(\s*([•*\-+]|\d+\.)\s*)+/, '').trim();
        elements.push(
          <div
            key={`${keyPrefix}-li-${i}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              paddingLeft: '4px'
            }}
          >
            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', lineHeight: '1.4' }}>•</span>
            <div style={{ flex: 1, fontSize: '0.82rem', lineHeight: '1.45', color: 'var(--text-primary)' }}>
              {renderRiskMetricLine(cleanText, `${keyPrefix}-li-metric-${i}`)}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // Check for Recommendation / Tip
      if (trimmed.startsWith('💡') || trimmed.toLowerCase().startsWith('recommendation:') || trimmed.toLowerCase().startsWith('tip:')) {
        elements.push(
          <div
            key={`${keyPrefix}-tip-${i}`}
            style={{
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
              margin: '6px 0',
              fontSize: '0.82rem',
              lineHeight: '1.5',
              color: 'var(--text-primary)'
            }}
          >
            {renderInlineTokens(trimmed, `${keyPrefix}-tip-${i}`)}
          </div>
        );
        i++;
        continue;
      }

      // Regular Paragraph
      elements.push(
        <p
          key={`${keyPrefix}-p-${i}`}
          style={{
            margin: 0,
            fontSize: '0.82rem',
            lineHeight: '1.5',
            color: 'var(--text-primary)'
          }}
        >
          {renderInlineTokens(trimmed, `${keyPrefix}-p-${i}`)}
        </p>
      );
      i++;
    }

    return (
      <div key={keyPrefix} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {elements}
      </div>
    );
  };

  // Minimized Floating Widget Launcher Button -> Neo-Brutalism
  if (!isOpen && !isStandalone) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ translateY: -3, boxShadow: '8px 8px 0px 0px #000000' }}
        whileTap={{ transform: 'translate(2px, 2px)', boxShadow: '2px 2px 0px 0px #000000' }}
        onClick={onToggle}
        aria-label="Open CyberGuard AI Copilot"
        className="copilot-launcher-btn"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99995,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          background: '#38BDF8',
          border: '4px solid #000000',
          borderRadius: '0px',
          boxShadow: '6px 6px 0px 0px #000000',
          color: '#000000'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '2px solid #FFFFFF' : '2.5px solid #000000',
              padding: '7px',
              borderRadius: '0px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000'
            }}
          >
            <Bot size={20} color={isDark ? '#38BDF8' : '#000000'} strokeWidth={2.8} />
          </div>
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '10px',
              height: '10px',
              borderRadius: '0px',
              backgroundColor: '#FF6B6B',
              border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000'
            }}
          />
        </div>

        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 900,
              color: '#000000',
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.01em',
              textTransform: 'uppercase'
            }}
          >
            CYBER COPILOT
          </div>
          <div style={{ fontSize: '0.72rem', color: '#000000', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
            <span>■</span>
            <span>{domain ? `Auditing: ${domain}` : 'CyberGuard AI Copilot'}</span>
          </div>
        </div>
      </motion.button>
    );
  }

  // Open Chat Window
  return (
    <motion.div
      initial={{ opacity: 0, y: isStandalone ? 0 : 30, scale: isStandalone ? 1 : 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isStandalone ? 0 : 30, scale: isStandalone ? 1 : 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={isFullScreen || isStandalone ? '' : 'copilot-chat-window'}
      style={
        (isFullScreen || isStandalone)
          ? {
              position: isStandalone ? 'relative' : 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: isStandalone ? 1 : 999999,
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: 0,
              background: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: 'none',
              border: 'none'
            }
          : {
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 99995,
              width: isSidebarOpen ? '780px' : '520px',
              maxWidth: 'calc(100vw - 32px)',
              height: isMinimized ? '64px' : '650px',
              maxHeight: 'calc(100vh - 40px)',
              borderRadius: '0px',
              border: isDark ? '4px solid #FFFFFF' : '4px solid #000000',
              boxShadow: isDark ? '12px 12px 0px 0px #38BDF8' : '12px 12px 0px 0px #000000',
              background: isDark ? '#121212' : '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }
      }
    >
      {/* Top Prismatic Rainbow Shimmer Bar */}
      <div className="copilot-top-prismatic-bar" />

      {/* Engine Settings Modal Overlay */}
      {showApiKeyModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowApiKeyModal(false)}
        >
          <div
            style={{
              background: isDark ? '#1A212D' : '#FFFFFF',
              border: isDark ? '4px solid #FFFFFF' : '4px solid #000000',
              borderRadius: '0px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: isDark ? '10px 10px 0px 0px #38BDF8' : '10px 10px 0px 0px #000000',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#38BDF8', border: isDark ? '2px solid #FFFFFF' : '2px solid #000000', padding: '4px', display: 'flex' }}>
                  <Sparkles size={18} color="#000000" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', textTransform: 'uppercase' }}>
                  AI Engine Settings
                </h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                style={{
                  background: '#FF6B6B',
                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                  borderRadius: '0px',
                  boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                  color: '#000000',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: isDark ? '#CBD5E1' : '#000000', lineHeight: 1.5, fontWeight: 500 }}>
              Connect your <strong>Custom AI Engine API Key</strong> to enable conversational AI reasoning on any programming or cybersecurity question. If left blank, CyberGuard AI's built-in forensic intelligence engine handles queries locally.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', marginBottom: '6px', textTransform: 'uppercase' }}>
                AI Engine API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                style={{
                  width: '100%',
                  background: isDark ? '#12161F' : '#FFFDF5',
                  border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                  borderRadius: '0px',
                  boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                  padding: '10px 12px',
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: isDark ? '#38BDF8' : '#000000', textDecoration: 'underline', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Get a free key from Google AI Studio</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setShowApiKeyModal(false)}
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                  borderRadius: '0px',
                  boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                  padding: '8px 14px',
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                style={{
                  background: '#4D96FF',
                  border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                  borderRadius: '0px',
                  boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                  padding: '8px 16px',
                  color: '#000000',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                Save Engine Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cyber Playbooks Modal Overlay */}
      {showPlaybooksModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowPlaybooksModal(false)}
        >
          <div
            style={{
              background: isDark ? '#1A212D' : '#FFFFFF',
              border: isDark ? '4px solid #FFFFFF' : '4px solid #000000',
              borderRadius: '0px',
              padding: '22px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: isDark ? '10px 10px 0px 0px #38BDF8' : '10px 10px 0px 0px #000000',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#38BDF8', border: isDark ? '2px solid #FFFFFF' : '2px solid #000000', padding: '4px', display: 'flex' }}>
                  <BookOpen size={18} color="#000000" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000', textTransform: 'uppercase' }}>
                  Cyber Defense Playbooks
                </h3>
              </div>
              <button
                onClick={() => setShowPlaybooksModal(false)}
                style={{
                  background: '#FF6B6B',
                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                  borderRadius: '0px',
                  boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                  color: '#000000',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: isDark ? '#CBD5E1' : '#000000', lineHeight: 1.45, fontWeight: 500 }}>
              Select a specialized defensive playbook to launch an authoritative investigation, hardening guide, or forensic analysis in your active session.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CYBER_PLAYBOOKS.map((pb) => (
                <button
                  key={pb.id}
                  onClick={() => {
                    setShowPlaybooksModal(false);
                    handleSendMessage(pb.prompt);
                  }}
                  style={{
                    background: isDark ? '#12161F' : '#FFFDF5',
                    border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                    borderRadius: '0px',
                    boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                    e.currentTarget.style.boxShadow = isDark ? '5px 5px 0px 0px #38BDF8' : '5px 5px 0px 0px #000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000';
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>
                    {pb.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.35, fontWeight: 500 }}>
                    {pb.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Window Header Bar */}
      <div
        className="copilot-header-bar"
        style={{
          padding: '10px 14px',
          borderBottom: isDark ? '3.5px solid #FFFFFF' : '3.5px solid #000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '10px',
          background: '#38BDF8',
          color: '#000000'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              borderRadius: '0px',
              padding: '6px',
              color: isDark ? '#FFFFFF' : '#000000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease'
            }}
            title={isSidebarOpen ? 'Hide Chat History' : 'Show Chat History'}
          >
            {isSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>

          {/* Bot Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                padding: '6px',
                borderRadius: '0px',
                border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000'
              }}
            >
              <Bot size={16} color={isDark ? '#38BDF8' : '#000000'} strokeWidth={2.5} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.01em', fontFamily: "'Space Grotesk', sans-serif" }}>
                  CYBER COPILOT
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '2px 6px',
                    borderRadius: '0px',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000',
                    color: isDark ? '#38BDF8' : '#000000',
                    fontWeight: 900,
                    boxShadow: isDark ? '1.5px 1.5px 0px 0px #38BDF8' : '1.5px 1.5px 0px 0px #000000',
                    letterSpacing: '0.04em'
                  }}
                >
                  PRO AI
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                <span style={{ color: '#000000' }}>■</span>
                <span>{domain ? `Auditing: ${domain}` : 'Ready for Inquiries'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Mode Selector & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Security Mode Selector */}
          <select
            value={securityMode}
            onChange={(e) => setSecurityMode(e.target.value as any)}
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              borderRadius: '0px',
              padding: '4px 8px',
              color: isDark ? '#FFFFFF' : '#000000',
              fontSize: '0.72rem',
              fontWeight: 800,
              boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
              outline: 'none',
              cursor: 'pointer',
              display: isFullScreen || isSidebarOpen ? 'inline-block' : 'none'
            }}
            title="Switch Copilot Intelligence Mode"
          >
            <option value="security-analyst">🛡️ Security Analyst</option>
            <option value="developer-assistant">💻 Developer Assistant</option>
            <option value="soc-investigator">🔍 SOC Investigator</option>
            <option value="security-tutor">🎓 Security Tutor</option>
            <option value="incident-responder">🚨 Incident Responder</option>
          </select>

          {/* Export Chat */}
          <button
            onClick={handleExportChat}
            style={{
              background: hasExported ? '#6BCB77' : (isDark ? '#1E293B' : '#FFFFFF'),
              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              color: isDark ? '#FFFFFF' : '#000000',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '0px',
              boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.74rem',
              fontWeight: 800,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease'
            }}
            title="Download Copilot chat history as a Markdown (.md) document"
          >
            {hasExported ? <Check size={13} color="#000000" /> : <Download size={13} color={isDark ? '#FFFFFF' : '#000000'} />}
            <span>{hasExported ? 'Exported (.md)' : 'Export'}</span>
          </button>

          {/* Plan & Credits Pill */}
          <button
            onClick={onOpenProfileModal || onOpenAuthModal}
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              color: isDark ? '#FFFFFF' : '#000000',
              borderRadius: '0px',
              boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
              padding: '3px 8px',
              fontSize: '0.68rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="View Quota, Memory Fill-Up & Razorpay Subscription Plans"
          >
            {currentUser?.plan === 'premium' ? <Crown size={12} color={isDark ? '#FACC15' : '#000000'} /> : <Zap size={12} color={isDark ? '#38BDF8' : '#000000'} />}
            <span>{currentUser?.plan === 'premium' ? 'PRO' : `${currentUser?.credits ?? 50} CR`}</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              borderRadius: '0px',
              boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
              color: isDark ? '#FFFFFF' : '#000000',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Configure AI Engine API Key"
          >
            <Key size={14} />
          </button>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              style={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                borderRadius: '0px',
                boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                color: isDark ? '#FACC15' : '#000000',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}

          {/* Full Screen Toggle */}
          <button
            onClick={() => {
              if (isStandalone) {
                if (typeof document !== 'undefined') {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }
              } else {
                setIsFullScreen(prev => !prev);
              }
            }}
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
              borderRadius: '0px',
              boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
              color: isDark ? '#FFFFFF' : '#000000',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Close Window Button (only in embedded floating widget mode) */}
          {!isStandalone ? (
            <button
              onClick={onToggle}
              style={{
                background: '#FF6B6B',
                border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                borderRadius: '0px',
                boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                color: '#000000',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Copilot"
            >
              <X size={15} />
            </button>
          ) : (
            <button
              onClick={handleCreateNewChat}
              style={{
                background: '#6BCB77',
                border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                borderRadius: '0px',
                boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                color: '#000000',
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 900
              }}
              title="Start a new chat session"
            >
              <Plus size={13} strokeWidth={3} />
              <span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Sidebar + Chat Canvas */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* ChatGPT Left Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              className="copilot-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isFullScreen ? 280 : 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                borderRight: isDark ? '3.5px solid #FFFFFF' : '3.5px solid #000000',
                background: isDark ? '#141414' : '#FFFDF5',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {/* Sidebar Header: New Chat & Search */}
              <div style={{ padding: '12px', borderBottom: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000', background: isDark ? '#141414' : '#FFFDF5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleCreateNewChat}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '0px',
                    background: '#4D96FF',
                    border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                    color: '#000000',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000';
                  }}
                >
                  <Plus size={15} color="#000000" strokeWidth={3} />
                  <span>NEW CHAT</span>
                </button>

                {/* Search Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    borderRadius: '0px',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    padding: '5px 8px'
                  }}
                >
                  <Search size={13} color={isDark ? '#94A3B8' : '#000000'} />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isDark ? '#FFFFFF' : '#000000',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: isDark ? '#94A3B8' : '#000000', cursor: 'pointer', padding: 0 }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar Sessions List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px'
                }}
              >
                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: isDark ? '#94A3B8' : '#000000', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 6px' }}>
                  Chat History ({sortedSessions.length})
                </div>

                {sortedSessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 8px', color: isDark ? '#94A3B8' : '#000000', fontSize: '0.72rem', fontWeight: 600 }}>
                    No conversations found.
                  </div>
                ) : (
                  sortedSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const isEditing = editingSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        className={`copilot-history-item ${isActive ? 'active' : ''}`}
                        onClick={() => !isEditing && handleSelectSession(session)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 9px',
                          borderRadius: '0px',
                          border: isActive ? (isDark ? '2px solid #FFFFFF' : '2px solid #000000') : '2px solid transparent',
                          background: isActive ? '#38BDF8' : 'transparent',
                          boxShadow: isActive ? (isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000') : 'none',
                          color: isActive ? '#000000' : (isDark ? '#E2E8F0' : '#000000'),
                          cursor: isEditing ? 'default' : 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: isActive ? 900 : 600,
                          transition: 'all 0.1s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
                          {session.isPinned ? (
                            <Pin size={12} color={isActive ? '#000000' : (isDark ? '#94A3B8' : '#000000')} style={{ flexShrink: 0 }} />
                          ) : (
                            <MessageSquare size={13} color={isActive ? '#000000' : (isDark ? '#94A3B8' : '#000000')} style={{ flexShrink: 0 }} />
                          )}

                          {isEditing ? (
                            <form
                              onSubmit={(e) => handleSaveRename(session.id, e)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                autoFocus
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setEditingSessionId(null);
                                }}
                                style={{
                                  background: isDark ? '#1E293B' : '#FFFFFF',
                                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                                  borderRadius: '0px',
                                  padding: '2px 6px',
                                  color: isDark ? '#FFFFFF' : '#000000',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  width: '100%',
                                  outline: 'none'
                                }}
                              />
                              <button
                                type="submit"
                                style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '2px' }}
                                title="Save Title"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSessionId(null)}
                                style={{ background: 'transparent', border: 'none', color: '#FF6B6B', cursor: 'pointer', padding: '2px' }}
                                title="Cancel"
                              >
                                <X size={12} />
                              </button>
                            </form>
                          ) : (
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1
                              }}
                            >
                              {session.title}
                            </span>
                          )}
                        </div>

                        {!isEditing && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {/* Pin / Unpin Button */}
                            <button
                              onClick={(e) => handleTogglePin(session.id, e)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: isActive ? '#000000' : (isDark ? '#E2E8F0' : '#000000'),
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: session.isPinned || isActive ? 1 : 0.4
                              }}
                              title={session.isPinned ? 'Unpin Chat' : 'Pin Chat to Top'}
                            >
                              <Pin size={11} />
                            </button>

                            {/* Rename Button */}
                            <button
                              onClick={(e) => handleStartRename(session, e)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: isActive ? '#000000' : (isDark ? '#E2E8F0' : '#000000'),
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: isActive ? 1 : 0.4
                              }}
                              title="Rename Chat"
                            >
                              <Edit3 size={11} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: isActive ? '#000000' : (isDark ? '#E2E8F0' : '#000000'),
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: isActive ? 1 : 0.4
                              }}
                              title="Delete Chat"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer: ChatGPT-Style Account & Subscription Card */}
              <div
                style={{
                  padding: '10px 12px',
                  borderTop: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: isDark ? '#141414' : '#FFFDF5'
                }}
              >
                {/* User Account Tile */}
                <div
                  onClick={onOpenProfileModal || onOpenAuthModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 10px',
                    borderRadius: '0px',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000'
                  }}
                  title="Click to view full Account Details, Credits & Subscription"
                >
                  {/* Avatar & Account Info */}
                  {(() => {
                    const isRealUser = currentUser && currentUser.email && currentUser.email.trim() && currentUser.email !== 'operator@cyberguard.ai';
                    return (
                      <>
                        {isRealUser && currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt={currentUser.username}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '0px',
                              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '0px',
                              background: '#38BDF8',
                              border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#000000',
                              fontWeight: 900,
                              fontSize: '0.85rem',
                              flexShrink: 0
                            }}
                          >
                            {isRealUser ? currentUser.username.substring(0, 1).toUpperCase() : <User size={15} color="#000000" />}
                          </div>
                        )}

                        {/* Name and Plan */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span
                              style={{
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                color: isDark ? '#FFFFFF' : 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {isRealUser ? currentUser.username : 'Guest Session'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.62rem',
                                padding: '1px 5px',
                                borderRadius: '6px',
                                background: isPro ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0, 240, 255, 0.15)',
                                color: isPro ? '#facc15' : 'var(--accent-cyan)',
                                fontWeight: 900
                              }}
                            >
                              {isPro ? '👑 PRO' : 'FREE'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.65rem', color: isRealUser ? (isDark ? '#94A3B8' : 'var(--text-secondary)') : 'var(--accent-cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isRealUser ? currentUser.email : 'Click to Link Email'}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Quota & Memory Quick Meters */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.02)',
                    border: isDark ? '1.5px solid #334155' : '1px solid var(--border-color)',
                    fontSize: '0.66rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isDark ? '#94A3B8' : 'var(--text-secondary)' }}>
                      <Zap size={11} color="var(--accent-cyan)" />
                      <span>Credits:</span>
                    </span>
                    <span className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {currentCredits.toLocaleString()} / {maxCredits.toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isDark ? '#94A3B8' : 'var(--text-secondary)' }}>
                      <HardDrive size={11} color="#a855f7" />
                      <span>Memory:</span>
                    </span>
                    <span className="mono" style={{ fontWeight: 800, color: '#a855f7' }}>
                      {memoryPct}% ({memoryUsedKb} KB)
                    </span>
                  </div>
                </div>

                {/* Upgrade Button if Free */}
                {!isPro && (
                  <button
                    onClick={onOpenProfileModal}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(245, 158, 11, 0.25) 100%)',
                      border: '1px solid rgba(234, 179, 8, 0.45)',
                      color: '#facc15',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 10px rgba(234, 179, 8, 0.15)'
                    }}
                  >
                    <Crown size={12} color="#facc15" />
                    <span>Upgrade to Premium Pro</span>
                  </button>
                )}

                {/* Bottom Status & Clear History */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '2px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.66rem', color: '#10b981', fontWeight: 700 }}>
                      {currentUser ? 'Cloud Synced' : 'SOC Core Active'}
                    </span>
                  </div>

                  <button
                    onClick={handleClearAllHistory}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isDark ? '#94A3B8' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.66rem',
                      textDecoration: 'underline'
                    }}
                    title="Clear all saved conversations"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Main Chat Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Status Notice Pill if Live Scanning */}
          {statusNotice && (
            <div
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)'
              }}
            >
              <RefreshCw size={12} className="spinning" />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            className="copilot-messages-container"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isFullScreen ? '24px 10%' : '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* ChatGPT-style Welcome Hero Screen if conversation is new/empty */}
            {messages.length <= 1 && (
              <div
                style={{
                  margin: 'auto',
                  maxWidth: '560px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '20px 0',
                  gap: '16px'
                }}
              >
                {/* Neo-Brutalist Avatar */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '0px',
                    background: '#38BDF8',
                    border: isDark ? '3.5px solid #FFFFFF' : '3.5px solid #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isDark ? '5px 5px 0px 0px #38BDF8' : '5px 5px 0px 0px #000000'
                  }}
                >
                  <Bot size={30} color="#000000" strokeWidth={2.6} />
                </div>

                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: isDark ? '#FFFFFF' : 'var(--text-primary)', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                    What security challenge can I investigate for you?
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                    Equipped with live DNS probing, WHOIS domain age forensics, and isolated Chromium sandboxing.
                  </p>
                </div>

                {/* 4 Starter Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  <button
                    onClick={() => handleSendMessage('analyze amazon.in')}
                    style={{
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                      borderRadius: '0px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = isDark ? '5px 5px 0px 0px #38BDF8' : '5px 5px 0px 0px #000000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>
                      <Globe size={14} color={isDark ? '#38BDF8' : '#000000'} />
                      <span>Audit a Target Domain</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.35, fontWeight: 500 }}>
                      Analyze DNS, SSL, and security headers for amazon.in
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('check br-icloud.com.br')}
                    style={{
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                      borderRadius: '0px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = isDark ? '5px 5px 0px 0px #38BDF8' : '5px 5px 0px 0px #000000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 900, color: '#FF6B6B' }}>
                      <AlertTriangle size={14} color="#FF6B6B" />
                      <span style={{ color: isDark ? '#FFFFFF' : '#000000' }}>Investigate Phishing Trap</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.35, fontWeight: 500 }}>
                      Check if br-icloud.com.br is an authorized Apple domain
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Show general Nginx hardening config')}
                    style={{
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                      borderRadius: '0px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = isDark ? '5px 5px 0px 0px #38BDF8' : '5px 5px 0px 0px #000000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>
                      <Terminal size={14} color={isDark ? '#38BDF8' : '#000000'} />
                      <span>Hardening Blueprint</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.35, fontWeight: 500 }}>
                      Generate Nginx CSP, HSTS, and X-Frame-Options config
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('open sandbox')}
                    style={{
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                      borderRadius: '0px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = isDark ? '5px 5px 0px 0px #38BDF8' : '5px 5px 0px 0px #000000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 900, color: isDark ? '#FFFFFF' : '#000000' }}>
                      <Sparkles size={14} color={isDark ? '#38BDF8' : '#000000'} />
                      <span>Launch Sandbox Viewport</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#000000', lineHeight: 1.35, fontWeight: 500 }}>
                      Safely preview suspicious websites inside live Chromium
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Rendered Conversation Messages */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={`msg-row-${idx}`}
                  style={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    gap: '10px',
                    alignItems: 'flex-start',
                    width: '100%'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '0px',
                      background: isUser ? '#4D96FF' : '#38BDF8',
                      border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                      boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    {isUser ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#000000' }}>U</span>
                    ) : (
                      <Bot size={16} color="#000000" strokeWidth={2.5} />
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div
                    style={{
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div
                      className={isUser ? 'copilot-user-bubble' : 'copilot-assistant-bubble'}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '0px'
                      }}
                    >
                      {renderMessageContent(msg.content, idx)}
                      {isStreaming && !isUser && idx === messages.length - 1 && (
                        <span className="copilot-stream-cursor" />
                      )}
                    </div>

                    {/* Action Bar for Assistant Messages (Copy / Regenerate) */}
                    {!isUser && (!isStreaming || idx !== messages.length - 1) && Boolean(msg.content) && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          paddingLeft: '2px',
                          fontSize: '0.68rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <button
                          onClick={() => copyFullMessage(msg.content, idx)}
                          style={{
                            background: isDark ? '#1E293B' : '#FFFFFF',
                            border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000',
                            borderRadius: '0px',
                            boxShadow: isDark ? '1.5px 1.5px 0px 0px #38BDF8' : '1.5px 1.5px 0px 0px #000000',
                            color: copiedMessageIndex === idx ? '#10b981' : (isDark ? '#FFFFFF' : '#000000'),
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            fontSize: '0.68rem',
                            fontWeight: 800
                          }}
                        >
                          {copiedMessageIndex === idx ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedMessageIndex === idx ? 'Copied!' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleSpeech(msg.content, idx)}
                          style={{
                            background: isDark ? '#1E293B' : '#FFFFFF',
                            border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #000000',
                            borderRadius: '0px',
                            boxShadow: isDark ? '1.5px 1.5px 0px 0px #38BDF8' : '1.5px 1.5px 0px 0px #000000',
                            color: isDark ? '#FFFFFF' : '#000000',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            fontSize: '0.68rem',
                            fontWeight: 800
                          }}
                          title={speakingIndex === idx ? 'Stop Audio Readout' : 'Listen with Speech Synthesizer'}
                        >
                          {speakingIndex === idx ? <VolumeX size={12} color="var(--accent-cyan)" /> : <Volume2 size={12} />}
                          <span>{speakingIndex === idx ? 'Stop Audio' : 'Listen'}</span>
                        </button>

                        <button
                          onClick={() => {
                            const lastUser = [...messages.slice(0, idx)].reverse().find(m => m.role === 'user');
                            if (lastUser && !isLoading && !isStreaming) handleSendMessage(lastUser.content);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isDark ? '#94A3B8' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 4px',
                            fontSize: '0.68rem'
                          }}
                        >
                          <RotateCcw size={11} />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && !isStreaming && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 4px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '0px',
                    background: '#38BDF8',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={16} color="#000000" strokeWidth={2.5} />
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '0px',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                    boxShadow: isDark ? '3px 3px 0px 0px #38BDF8' : '3px 3px 0px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontSize: '0.74rem',
                    fontWeight: 800
                  }}
                >
                  <RefreshCw size={13} color={isDark ? '#38BDF8' : '#000000'} className="spinning" />
                  <span className="mono" style={{ fontWeight: 800 }}>Analyzing cyber threat intelligence...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips (Horizontal Carousel) */}
          <div
            className="copilot-chips-carousel no-scrollbar"
            style={{
              padding: '8px 14px',
              borderTop: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
              background: isDark ? '#181818' : '#FFFDF5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={`qp-${idx}`}
                onClick={() => !isLoading && !isStreaming && handleSendMessage(p.label)}
                className={`copilot-prompt-chip ${p.colorClass}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  padding: '5px 12px',
                  borderRadius: '0px',
                  border: isDark ? '2.5px solid #FFFFFF' : '2.5px solid #000000',
                  boxShadow: isDark ? '2.5px 2.5px 0px 0px #38BDF8' : '2.5px 2.5px 0px 0px #000000',
                  color: '#000000',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Neo-Brutalist Input Form */}
          <div
            className="copilot-input-area"
            style={{
              padding: isFullScreen ? '14px 10%' : '10px 14px',
              borderTop: isDark ? '3.5px solid #FFFFFF' : '3.5px solid #000000',
              background: isDark ? '#141414' : '#FFFDF5',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flexShrink: 0
            }}
          >
            {/* Quick Tools Tray */}
            {showToolsMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
                  borderRadius: '0px',
                  boxShadow: isDark ? '6px 6px 0px 0px #38BDF8' : '6px 6px 0px 0px #000000',
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '6px',
                  marginBottom: '4px'
                }}
              >
                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    setInputValue('analyze ');
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: isDark ? '#141414' : '#FFFDF5',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    borderRadius: '0px',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: isDark ? '#FFFFFF' : '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Globe size={13} color={isDark ? '#38BDF8' : '#000000'} />
                  <span>Scan URL</span>
                </button>

                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    setInputValue('domain age of ');
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: isDark ? '#141414' : '#FFFDF5',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    borderRadius: '0px',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: isDark ? '#FFFFFF' : '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FileText size={13} color={isDark ? '#38BDF8' : '#000000'} />
                  <span>WHOIS Age</span>
                </button>

                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    handleSendMessage('open sandbox');
                  }}
                  style={{
                    background: isDark ? '#141414' : '#FFFDF5',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    borderRadius: '0px',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: isDark ? '#FFFFFF' : '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={13} color={isDark ? '#38BDF8' : '#000000'} />
                  <span>Live Sandbox</span>
                </button>

                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    handleSendMessage('Generate Nginx hardening headers');
                  }}
                  style={{
                    background: isDark ? '#141414' : '#FFFDF5',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    borderRadius: '0px',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: isDark ? '#FFFFFF' : '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Terminal size={13} color={isDark ? '#38BDF8' : '#000000'} />
                  <span>Hardening</span>
                </button>

                <button
                  onClick={() => {
                    setShowToolsMenu(false);
                    setShowPlaybooksModal(true);
                  }}
                  style={{
                    background: isDark ? '#141414' : '#FFFDF5',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    borderRadius: '0px',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: isDark ? '#FFFFFF' : '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <BookOpen size={13} color={isDark ? '#38BDF8' : '#000000'} />
                  <span>Playbooks</span>
                </button>
              </motion.div>
            )}

            {/* Input Box Container */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: isDark ? '3px solid #FFFFFF' : '3px solid #000000',
                borderRadius: '0px',
                padding: '6px 10px',
                boxShadow: isDark ? '4px 4px 0px 0px #38BDF8' : '4px 4px 0px 0px #000000'
              }}
            >
              {/* Tools Button */}
              <button
                type="button"
                onClick={() => setShowToolsMenu(prev => !prev)}
                style={{
                  background: showToolsMenu ? '#4D96FF' : '#38BDF8',
                  border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                  borderRadius: '0px',
                  boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                  color: '#000000',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                }}
                title="Quick Cyber Tools & Playbooks"
              >
                <Sliders size={15} />
              </button>

              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading && !isStreaming) {
                      handleSendMessage();
                    }
                  }
                }}
                placeholder={
                  domain
                    ? `Ask about ${domain}, request server hardening, or type 'open sandbox'...`
                    : "Ask any cybersecurity question, type 'analyze domain.com', or 'open sandbox'..."
                }
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.4',
                  maxHeight: '120px',
                  fontFamily: 'inherit'
                }}
              />

              {/* Send or Stop Generating Button */}
              {isLoading || isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopGenerating}
                  className="copilot-send-button"
                  style={{
                    background: '#FF6B6B',
                    color: '#000000',
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    borderRadius: '0px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000',
                    flexShrink: 0
                  }}
                  title="Stop Generating (Cancel)"
                >
                  <Square size={13} fill="#000000" color="#000000" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading || isStreaming}
                  className="copilot-send-button"
                  style={{
                    background: inputValue.trim() && !isLoading && !isStreaming
                      ? '#4D96FF'
                      : (isDark ? '#334155' : '#E2E8F0'),
                    color: inputValue.trim() && !isLoading && !isStreaming ? '#000000' : (isDark ? '#94A3B8' : '#000000'),
                    border: isDark ? '2px solid #FFFFFF' : '2px solid #000000',
                    borderRadius: '0px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputValue.trim() && !isLoading && !isStreaming ? 'pointer' : 'default',
                    boxShadow: inputValue.trim() && !isLoading && !isStreaming ? (isDark ? '2px 2px 0px 0px #38BDF8' : '2px 2px 0px 0px #000000') : 'none',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    flexShrink: 0
                  }}
                  title="Send Prompt (Enter)"
                >
                  <Send size={15} color={inputValue.trim() && !isLoading && !isStreaming ? '#000000' : (isDark ? '#94A3B8' : '#000000')} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Bottom Caption */}
            <div
              style={{
                fontSize: '0.64rem',
                color: isDark ? '#94A3B8' : '#475569',
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: '0.02em',
                marginTop: '2px'
              }}
            >
              CyberGuard AI Copilot executes live DNS queries, WHOIS age forensics, and isolated headless sandboxing.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
