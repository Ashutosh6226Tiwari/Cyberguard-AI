import React, { useState, useEffect, useRef } from 'react';
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
  Zap
} from 'lucide-react';
import type { RiskScoreReport, FreeScanResult, ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';

interface CyberCopilotChatProps {
  report?: RiskScoreReport | FreeScanResult | null;
  isOpen: boolean;
  onToggle: () => void;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
  onOpenAboutTopic?: (topicId: string) => void;
}

export const CyberCopilotChat: React.FC<CyberCopilotChatProps> = ({
  report,
  isOpen,
  onToggle,
  pendingPrompt,
  onClearPendingPrompt,
  onOpenAboutTopic
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const domain = (report as any)?.canonical_domain || (report as any)?.domain;
  const verdict = (report as any)?.verdict;
  const riskScore = (report as any)?.overall_risk_score ?? (report as any)?.fast_risk_score;
  const grade = (report as any)?.security_audit?.security_grade || (report as any)?.security_grade;

  // Initialize or reset welcome message when report changes
  useEffect(() => {
    if (report && domain) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **CyberGuard AI Copilot Active**\n\nI have loaded the live security intelligence for \`${domain}\`:\n- **Verdict:** \`${verdict || 'ANALYZED'}\`\n- **Risk Score:** \`${riskScore ?? 'N/A'}/100\`\n- **Security Posture Grade:** \`${grade || 'N/A'}\`\n\nAsk me how to harden your server, prevent code injection (XSS), fix missing headers, or verify phishing risk.`
        }
      ]);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **CyberGuard AI Defensive Security Copilot**\n\nI am your AI assistant for website security, anti-hacking posture, and phishing defense.\n\nEnter a question below or audit a URL on the scanner to see live contextual guidance!`
        }
      ]);
    }
  }, [domain, verdict, riskScore, grade]);

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

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Auto focus on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to backend API with full report context
      const chatHistory = newHistory.map(m => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(query, report, chatHistory);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.reply }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **Communication Notice:** Backend copilot encountered a temporary delay. Website hardening rules and anti-injection defenses remain active.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const defaultSuggestions = [
    grade && grade !== 'N/A' ? `How to fix Security Grade ${grade}?` : 'How to get an A+ Security Grade?',
    'How do hackers exploit code injection?',
    'Is it safe to enter passwords on this site?',
    'Generate Nginx & Cloudflare hardening headers',
    'Explain Brand Contradiction'
  ];

  // Helper to render simple markdown formatting
  const renderMessageContent = (content: string, msgIdx: number) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderTextWithFormatting(content.substring(lastIndex, match.index), `txt-${msgIdx}-${lastIndex}`));
      }
      const lang = match[1] || 'bash';
      const codeSnippet = match[2];
      const uniqueCodeKey = msgIdx * 100 + blockIndex;

      parts.push(
        <div
          key={`code-${msgIdx}-${blockIndex}`}
          style={{
            background: 'var(--code-box-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            margin: '8px 0',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 10px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '0.68rem',
              color: 'var(--text-muted)'
            }}
          >
            <span className="mono">{lang.toUpperCase()}</span>
            <button
              onClick={() => copyCode(codeSnippet, uniqueCodeKey)}
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedIndex === uniqueCodeKey ? 'var(--accent-green)' : 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: '0.68rem'
              }}
            >
              {copiedIndex === uniqueCodeKey ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedIndex === uniqueCodeKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre
            className="mono"
            style={{
              padding: '10px',
              fontSize: '0.74rem',
              color: 'var(--accent-green)',
              overflowX: 'auto',
              margin: 0,
              lineHeight: 1.4
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
      parts.push(renderTextWithFormatting(content.substring(lastIndex), `txt-${msgIdx}-${lastIndex}`));
    }

    return parts;
  };

  const renderTextWithFormatting = (text: string, keyPrefix: string) => {
    // Process paragraphs and line breaks
    const lines = text.split('\n');
    return (
      <div key={keyPrefix} style={{ lineHeight: 1.55 }}>
        {lines.map((line, lIdx) => {
          if (!line.trim()) return <div key={lIdx} style={{ height: '6px' }} />;

          // Check for bullet
          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
          const displayLine = isBullet ? line.trim().substring(2) : line;

          return (
            <div
              key={lIdx}
              style={{
                display: isBullet ? 'flex' : 'block',
                alignItems: 'flex-start',
                gap: isBullet ? '6px' : '0',
                marginBottom: '3px'
              }}
            >
              {isBullet && <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>•</span>}
              <div>{renderInlineFormatting(displayLine)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderInlineFormatting = (line: string) => {
    // Split on bold **text** or inline `code`
    const tokens = line.split(/(\*\*.*?\*\*|`.*?`)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={i}
            className="mono"
            style={{
              background: 'rgba(0, 240, 255, 0.08)',
              color: 'var(--accent-cyan)',
              padding: '1px 5px',
              borderRadius: '4px',
              fontSize: '0.82em',
              border: '1px solid rgba(0, 240, 255, 0.2)'
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  // Floating trigger button when collapsed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="cyber-copilot-badge"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99990,
          background: 'linear-gradient(135deg, #0284c7 0%, #00f0ff 100%)',
          color: '#070a10',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50px',
          padding: '12px 20px',
          boxShadow: '0 8px 30px rgba(0, 240, 255, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: '0.86rem',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1.0)';
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Bot size={20} color="#070a10" />
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              background: '#10b981',
              borderRadius: '50%',
              boxShadow: '0 0 8px #10b981'
            }}
          />
        </div>
        <span>CYBER AI COPILOT</span>
        {report && (
          <span
            style={{
              background: 'rgba(7, 10, 16, 0.85)',
              color: '#00f0ff',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}
          >
            ACTIVE SCAN
          </span>
        )}
      </button>
    );
  }

  // Open Chat Drawer
  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 99995,
        width: '430px',
        maxWidth: 'calc(100vw - 32px)',
        height: isMinimized ? '58px' : '580px',
        maxHeight: 'calc(100vh - 40px)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-focus)',
        borderRadius: '16px',
        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 240, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--hero-bg)',
          borderBottom: isMinimized ? 'none' : '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isMinimized ? 'pointer' : 'default'
        }}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={18} color="#070a10" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="cyber-font" style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                CYBERGUARD COPILOT
              </span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 6px #10b981'
                }}
              />
            </div>
            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Defensive AI &amp; Exploit Analyst
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            title="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Active Target Banner */}
          {report && domain && (
            <div
              style={{
                padding: '8px 14px',
                background: 'rgba(0, 240, 255, 0.05)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <Terminal size={12} color="var(--accent-cyan)" />
                <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Target: {domain}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {grade && (
                  <span
                    style={{
                      background: 'var(--code-box-bg)',
                      border: '1px solid var(--border-color)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      color: grade.startsWith('A') ? 'var(--accent-green)' : '#ef4444'
                    }}
                  >
                    Grade {grade}
                  </span>
                )}
                {riskScore !== undefined && (
                  <span
                    style={{
                      background: riskScore >= 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: riskScore >= 70 ? '#ef4444' : 'var(--accent-green)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 800
                    }}
                  >
                    {riskScore}/100
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-secondary)'
            }}
          >
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isUser
                        ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                        : 'var(--bg-card)',
                      color: isUser ? '#ffffff' : 'var(--text-secondary)',
                      border: isUser ? 'none' : '1px solid var(--border-color)',
                      boxShadow: 'var(--panel-shadow)',
                      fontSize: '0.82rem',
                      wordBreak: 'break-word'
                    }}
                  >
                    {isUser ? msg.content : renderMessageContent(msg.content, idx)}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  width: 'fit-content',
                  fontSize: '0.78rem',
                  color: 'var(--accent-cyan)'
                }}
              >
                <RefreshCw size={13} className="animate-spin" />
                <span>Copilot is analyzing cybersecurity telemetry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}
          >
            {defaultSuggestions.map((sug, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSendMessage(sug)}
                disabled={isLoading}
                style={{
                  background: 'var(--code-box-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.color = 'var(--accent-cyan)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Zap size={10} color="var(--accent-cyan)" />
                <span>{sug}</span>
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--hero-bg)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={domain ? `Ask Copilot about ${domain}...` : "Ask a cybersecurity question..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'var(--code-box-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                background: !inputValue.trim() || isLoading ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent-cyan)',
                color: !inputValue.trim() || isLoading ? 'var(--text-muted)' : '#070a10',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
