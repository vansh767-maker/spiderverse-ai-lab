import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Plus,
  Trash2,
  Download,
  Square,
  SendHorizontal,
  Copy,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (ts) => {
  const d = ts ? new Date(ts) : new Date()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const estimateTokens = (text) => Math.ceil((text || '').length / 4)

// ─── Spider Web SVG (empty state decoration) ────────────────────────────────

const SpiderWeb = () => (
  <svg width="180" height="180" viewBox="0 0 180 180" fill="none" aria-hidden="true">
    {/* radial lines */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <line
        key={deg}
        x1="90" y1="90"
        x2={90 + 80 * Math.cos((deg * Math.PI) / 180)}
        y2={90 + 80 * Math.sin((deg * Math.PI) / 180)}
        stroke="rgba(230,36,41,0.25)"
        strokeWidth="1"
      />
    ))}
    {/* concentric hexagons approximated as circles */}
    {[20, 38, 56, 74].map((r) => (
      <circle key={r} cx="90" cy="90" r={r} stroke="rgba(230,36,41,0.18)" strokeWidth="1" fill="none" />
    ))}
    <circle cx="90" cy="90" r="4" fill="rgba(230,36,41,0.5)" />
  </svg>
)

// ─── Typing animation ────────────────────────────────────────────────────────

const TypingDots = () => (
  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', padding: '4px 2px' }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#1677FF',
          display: 'inline-block',
          animation: `typingPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </span>
)

// ─── Web-shoot radial burst ──────────────────────────────────────────────────

const WebShootBurst = ({ active }) =>
  active ? (
    <span
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(230,36,41,0.55) 0%, transparent 70%)',
        animation: 'webShoot 0.4s ease-out forwards',
        pointerEvents: 'none',
      }}
    />
  ) : null

// ─── Code block renderer ─────────────────────────────────────────────────────

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false)
  const lang = /language-(\w+)/.exec(className || '')?.[1] || 'text'
  const code = String(children).replace(/\n$/, '')

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{ position: 'relative', marginBlock: 12, borderRadius: 8, overflow: 'hidden' }}>
      {/* language badge + copy */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10,13,22,0.95)',
          padding: '4px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <span style={{ fontSize: 11, color: '#7a8499', fontFamily: 'monospace', textTransform: 'uppercase' }}>
          {lang}
        </span>
        <button onClick={handleCopy} title="Copy code" style={styles.iconBtn}>
          {copied ? (
            <span style={{ fontSize: 11, color: '#4ade80' }}>Copied!</span>
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: 13, padding: '14px 16px' }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// ─── Markdown components map ─────────────────────────────────────────────────

const mdComponents = {
  code({ inline, className, children, ...props }) {
    if (inline) {
      return (
        <code
          style={{
            background: 'rgba(22,119,255,0.15)',
            color: '#7dd3fc',
            padding: '1px 5px',
            borderRadius: 4,
            fontSize: '0.88em',
            fontFamily: 'monospace',
          }}
          {...props}
        >
          {children}
        </code>
      )
    }
    return <CodeBlock className={className}>{children}</CodeBlock>
  },
  p: ({ children }) => <p style={{ margin: '6px 0', lineHeight: 1.65 }}>{children}</p>,
  ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '6px 0' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '6px 0' }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '3px solid #1677FF',
        paddingLeft: 12,
        margin: '8px 0',
        color: '#94a3b8',
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote>
  ),
  h1: ({ children }) => <h1 style={{ fontSize: '1.4em', margin: '10px 0 6px', color: '#e2e8f0' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: '1.2em', margin: '10px 0 6px', color: '#e2e8f0' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: '1.05em', margin: '8px 0 4px', color: '#e2e8f0' }}>{children}</h3>,
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '6px 10px',
        background: 'rgba(22,119,255,0.15)',
        textAlign: 'left',
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '5px 10px' }}>{children}</td>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '12px 0' }} />,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
      {children}
    </a>
  ),
}

// ─── Message card ─────────────────────────────────────────────────────────────

const MessageCard = ({ msg, isLast, isLoading, selectedModel, onRegenerate }) => {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'
  const isError = msg.role === 'error'

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  if (isError) {
    return (
      <div style={styles.errorCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>Error</span>
        </div>
        <p style={{ color: '#fca5a5', margin: 0, fontSize: 13, lineHeight: 1.6 }}>{msg.content}</p>
        {onRegenerate && (
          <button onClick={onRegenerate} style={{ ...styles.chipBtn, marginTop: 10, color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }}>
            <RefreshCw size={12} /> Try Again
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 18,
        position: 'relative',
      }}
    >
      {/* model badge for AI messages */}
      {!isUser && (
        <span style={styles.modelBadge}>🤖 {selectedModel}</span>
      )}

      <div
        style={{
          position: 'relative',
          maxWidth: '80%',
          ...(isUser ? styles.userBubble : styles.aiBubble),
        }}
      >
        {/* copy button */}
        {hovered && (
          <button
            onClick={handleCopy}
            title="Copy"
            style={{
              ...styles.iconBtn,
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 6,
              padding: '3px 6px',
              zIndex: 2,
            }}
          >
            {copied ? <span style={{ fontSize: 10, color: '#4ade80' }}>Copied!</span> : <Copy size={12} />}
          </button>
        )}

        {/* content */}
        {isUser ? (
          <p style={{ margin: 0, lineHeight: 1.65, whiteSpace: 'pre-wrap', paddingRight: hovered ? 28 : 0 }}>
            {msg.content}
          </p>
        ) : (
          <div style={{ color: '#cbd5e1', fontSize: 14, paddingRight: hovered ? 28 : 0 }}>
            {isLast && isLoading && !msg.content ? (
              <TypingDots />
            ) : (
              <>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {msg.content || ''}
                </ReactMarkdown>
                {isLast && isLoading && <TypingDots />}
              </>
            )}
          </div>
        )}

        {/* timestamp */}
        <div style={styles.timestamp}>{formatTime(msg.timestamp)}</div>
      </div>

      {/* regenerate button for last AI message */}
      {!isUser && isLast && !isLoading && hovered && onRegenerate && (
        <button onClick={onRegenerate} style={{ ...styles.chipBtn, marginTop: 6, fontSize: 11 }}>
          <RefreshCw size={11} /> Regenerate
        </button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatPanel({
  messages = [],
  sendMessage,
  stopGeneration,
  clearConversation,
  regenerateLastResponse,
  isLoading,
  error,
  selectedModel,
  apiKey,
  promptText,
  setPromptText,
  markdownEnabled = true,
  showTimestamps = true,
  compactMode = false,
  onOpenPerplexity,
  onOpenApiKeyModal,
}) {
  const [prompt, setPromptLocal] = useState('')

  // If promptText is controlled externally, use it; otherwise use local
  const isControlled = promptText !== undefined && setPromptText !== undefined
  const currentPrompt = isControlled ? promptText : prompt
  const setCurrentPrompt = isControlled
    ? (val) => { setPromptText(val); }
    : setPromptLocal
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [webShoot, setWebShoot] = useState(false)

  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const exportMenuRef = useRef(null)

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // auto-resize textarea
  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  // close export menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // keyboard submit
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = useCallback(() => {
    if (!currentPrompt.trim() || isLoading || !apiKey) return
    // web-shoot burst animation
    setWebShoot(true)
    setTimeout(() => setWebShoot(false), 450)
    sendMessage(currentPrompt.trim())
    setCurrentPrompt('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [currentPrompt, isLoading, apiKey, sendMessage, setCurrentPrompt])

  // ── Export ──
  const exportChat = (fmt) => {
    setShowExportMenu(false)
    if (!messages.length) return
    let content, filename, mime

    if (fmt === 'txt') {
      content = messages.map((m) => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n')
      filename = 'conversation.txt'
      mime = 'text/plain'
    } else {
      content = messages
        .map((m) =>
          m.role === 'user'
            ? `**You:** ${m.content}`
            : `**AI (${selectedModel}):** ${m.content}`
        )
        .join('\n\n---\n\n')
      filename = 'conversation.md'
      mime = 'text/markdown'
    }

    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Example chips ──
  const examplePrompts = [
    'Explain quantum computing',
    'Write a Python script',
    'Analyze this code',
    'What is RAG?',
  ]

  const canSend = currentPrompt.trim().length > 0 && !isLoading && !!apiKey

  const lastAiIndex = [...messages].reverse().findIndex((m) => m.role === 'assistant')
  const lastAiMsgIndex = lastAiIndex === -1 ? -1 : messages.length - 1 - lastAiIndex

  return (
    <div style={styles.root}>
      {/* ── Global keyframe styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        @keyframes typingPulse {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(-4px); }
        }
        @keyframes webShoot {
          0%   { opacity: 1; transform: scale(0.8); }
          100% { opacity: 0; transform: scale(2.5); }
        }
        @keyframes spiderCrawl {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 0.7; }
          50%  { transform: translateY(10px)  rotate(15deg); opacity: 1; }
          100% { transform: translateY(-10px) rotate(0deg); opacity: 0.7; }
        }
        @keyframes stopPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50%       { box-shadow: 0 0 0 7px rgba(239,68,68,0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-textarea:focus {
          outline: none;
          border-color: rgba(230,36,41,0.7) !important;
          box-shadow: 0 0 0 3px rgba(230,36,41,0.15), 0 0 12px rgba(230,36,41,0.12);
        }
        .export-menu-item:hover { background: rgba(22,119,255,0.12); color: #fff; }
        .chip-btn:hover { background: rgba(230,36,41,0.15); border-color: rgba(230,36,41,0.5); }
        .send-btn:hover:not(:disabled) { background: #c41f24 !important; transform: scale(1.07); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .header-btn:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
      `}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🕷️</span>
          <h1 style={styles.headerTitle}>AI INTERACTION LAB</h1>
          {onOpenPerplexity && (
            <button
              onClick={onOpenPerplexity}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 9px',
                borderRadius: 14,
                background: 'rgba(22, 119, 255, 0.12)',
                border: '1px solid rgba(22, 119, 255, 0.35)',
                color: '#60a5fa',
                fontSize: 11,
                fontFamily: "'Orbitron', sans-serif",
                cursor: 'pointer',
                marginLeft: 6
              }}
              title="Open Perplexity Explorer"
            >
              <span>🕸️</span>
              <span>Perplexity Explorer</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* New conversation */}
          <button
            className="header-btn"
            onClick={() => { clearConversation?.(); setShowClearConfirm(false) }}
            title="New Conversation"
            style={styles.headerBtn}
          >
            <Plus size={15} />
            <span style={{ fontSize: 12 }}>New</span>
          </button>

          {/* Clear chat */}
          {showClearConfirm ? (
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                onClick={() => { clearConversation?.(); setShowClearConfirm(false) }}
                style={{ ...styles.headerBtn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }}
              >
                Confirm
              </button>
              <button className="header-btn" onClick={() => setShowClearConfirm(false)} style={styles.headerBtn}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="header-btn"
              onClick={() => setShowClearConfirm(true)}
              title="Clear Chat"
              style={styles.headerBtn}
              disabled={!messages.length}
            >
              <Trash2 size={15} />
            </button>
          )}

          {/* Export */}
          <div style={{ position: 'relative' }} ref={exportMenuRef}>
            <button
              className="header-btn"
              onClick={() => setShowExportMenu((v) => !v)}
              title="Export"
              style={styles.headerBtn}
              disabled={!messages.length}
            >
              <Download size={15} />
              <ChevronDown size={11} />
            </button>
            {showExportMenu && (
              <div style={styles.exportMenu}>
                <button className="export-menu-item" onClick={() => exportChat('txt')} style={styles.exportMenuItem}>
                  Export as TXT
                </button>
                <button className="export-menu-item" onClick={() => exportChat('md')} style={styles.exportMenuItem}>
                  Export as Markdown
                </button>
              </div>
            )}
          </div>

          {/* Stop generation */}
          {isLoading && (
            <button
              onClick={stopGeneration}
              style={{
                ...styles.headerBtn,
                color: '#ef4444',
                borderColor: 'rgba(239,68,68,0.4)',
                animation: 'stopPulse 1.4s ease infinite',
              }}
            >
              <Square size={13} style={{ fill: '#ef4444' }} />
              <span style={{ fontSize: 12 }}>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ CONVERSATION AREA ════════════════════════════════════════════════ */}
      <div style={styles.conversationArea}>
        {messages.length === 0 && !isLoading ? (
          /* Empty state */
          <div style={styles.emptyState}>
            <div style={{ animation: 'spiderCrawl 3s ease-in-out infinite' }}>
              <SpiderWeb />
            </div>
            <div style={{ fontSize: 36, marginTop: -10 }}>🕸️</div>
            <h2 style={styles.emptyTitle}>SPIDER-VERSE AI LAB</h2>
            <p style={styles.emptySubtitle}>Ask me anything, friendly neighborhood style.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              {onOpenPerplexity && (
                <button
                  className="chip-btn"
                  onClick={onOpenPerplexity}
                  style={{
                    ...styles.exampleChip,
                    borderColor: 'rgba(22, 119, 255, 0.45)',
                    background: 'rgba(22, 119, 255, 0.12)',
                    color: '#60a5fa',
                    fontWeight: 600
                  }}
                >
                  🕸️ Perplexity Explorer (DistilGPT-2)
                </button>
              )}
              {examplePrompts.map((p) => (
                <button
                  key={p}
                  className="chip-btn"
                  onClick={() => {
                    setCurrentPrompt(p)
                    textareaRef.current?.focus()
                  }}
                  style={styles.exampleChip}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div style={{ padding: '20px 24px' }}>
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                style={{ animation: 'fadeIn 0.25s ease forwards' }}
              >
                <MessageCard
                  msg={msg}
                  isLast={idx === messages.length - 1}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                  onRegenerate={
                    idx === lastAiMsgIndex && regenerateLastResponse
                      ? regenerateLastResponse
                      : null
                  }
                />
              </div>
            ))}

            {/* Spider crawling loader (before first AI response) */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingLeft: 4 }}>
                <span style={{ fontSize: 22, animation: 'spiderCrawl 1s ease-in-out infinite' }}>🕷️</span>
                <span style={{ color: '#64748b', fontSize: 13 }}>Spinning a response…</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ═══ PROMPT INPUT ═════════════════════════════════════════════════════ */}
      <div style={styles.inputArea}>
        {/* no API key warning */}
        {!apiKey && (
          <div
            style={{ ...styles.noKeyBanner, cursor: onOpenApiKeyModal ? 'pointer' : 'default' }}
            onClick={() => onOpenApiKeyModal && onOpenApiKeyModal()}
          >
            ⚠️ No Groq API key set — <span style={{ textDecoration: 'underline', fontWeight: 600 }}>click here to configure your key</span> or explore in Perplexity mode.
          </div>
        )}

        <div style={styles.inputRow}>
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask your friendly neighborhood AI..."
            rows={1}
            style={styles.textarea}
          />

          {/* Send / Stop button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {isLoading ? (
              <button
                onClick={stopGeneration}
                title="Stop generation"
                style={{
                  ...styles.sendBtn,
                  background: '#ef4444',
                  animation: 'stopPulse 1.4s ease infinite',
                }}
              >
                <Square size={16} style={{ fill: '#fff' }} />
              </button>
            ) : (
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!canSend}
                title="Send (⌘+Enter)"
                style={styles.sendBtn}
              >
                <WebShootBurst active={webShoot} />
                <SendHorizontal size={17} />
              </button>
            )}
          </div>
        </div>

        {/* hints */}
        <div style={styles.inputHints}>
          <span style={{ color: '#3b4a68' }}>
            {currentPrompt.length > 0
              ? `${currentPrompt.length} chars · ~${estimateTokens(currentPrompt)} tokens`
              : ''}
          </span>
          <span style={{ color: '#3b4a68', fontSize: 11 }}>⌘ + Enter to send • Enter for new line</span>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(5,8,15,0.98) 0%, rgba(8,11,18,0.98) 100%)',
    color: '#e2e8f0',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden',
  },

  // ── Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'rgba(8,11,18,0.95)',
    borderBottom: '1px solid rgba(230,36,41,0.2)',
    backdropFilter: 'blur(10px)',
    flexShrink: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 15,
    fontWeight: 900,
    color: '#e2e8f0',
    letterSpacing: '0.12em',
    margin: 0,
    background: 'linear-gradient(90deg, #E62429, #ff6b6b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.15s',
  },
  exportMenu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    background: 'rgba(15,20,35,0.98)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 170,
    zIndex: 100,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  exportMenuItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 13,
    transition: 'all 0.15s',
  },

  // ── Conversation
  conversationArea: {
    flex: 1,
    overflowY: 'auto',
    scrollBehavior: 'smooth',
  },

  // ── Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: '40px 20px',
    textAlign: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: '0.1em',
    color: '#e2e8f0',
    margin: 0,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    margin: 0,
  },
  exampleChip: {
    padding: '7px 14px',
    background: 'rgba(230,36,41,0.08)',
    border: '1px solid rgba(230,36,41,0.25)',
    borderRadius: 20,
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.15s',
  },

  // ── Message bubbles
  userBubble: {
    background: 'linear-gradient(135deg, #E62429, #c41f24)',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '18px 18px 4px 18px',
    fontSize: 14,
    lineHeight: 1.65,
    boxShadow: '0 4px 16px rgba(230,36,41,0.2)',
  },
  aiBubble: {
    background: 'rgba(21,27,43,0.9)',
    borderLeft: '3px solid #1677FF',
    padding: '14px 16px 10px',
    borderRadius: '0 14px 14px 14px',
    fontSize: 14,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(8px)',
  },
  modelBadge: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 5,
    paddingLeft: 6,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 6,
    textAlign: 'right',
  },

  // ── Error card
  errorCard: {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(239,68,68,0.07)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 12,
    marginBottom: 16,
  },

  // ── Input area
  inputArea: {
    flexShrink: 0,
    padding: '14px 20px 16px',
    background: 'rgba(8,11,18,0.95)',
    borderTop: '1px solid rgba(230,36,41,0.15)',
    backdropFilter: 'blur(10px)',
  },
  noKeyBanner: {
    padding: '8px 14px',
    background: 'rgba(234,179,8,0.1)',
    border: '1px solid rgba(234,179,8,0.3)',
    borderRadius: 8,
    color: '#fbbf24',
    fontSize: 12,
    marginBottom: 10,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10,
  },
  textarea: {
    flex: 1,
    resize: 'none',
    minHeight: 44,
    maxHeight: 200,
    padding: '11px 14px',
    background: 'rgba(21,27,43,0.6)',
    border: '1px solid rgba(230,36,41,0.3)',
    borderRadius: 12,
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.6,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    overflowY: 'auto',
  },
  sendBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #E62429, #c41f24)',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    transition: 'all 0.18s',
    boxShadow: '0 4px 14px rgba(230,36,41,0.35)',
    overflow: 'hidden',
  },
  inputHints: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 6,
    fontSize: 11,
    paddingInline: 2,
  },

  // ── Misc
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: 2,
    transition: 'color 0.15s',
  },
  chipBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    color: '#64748b',
    cursor: 'pointer',
    fontSize: 12,
    transition: 'all 0.15s',
  },
}
