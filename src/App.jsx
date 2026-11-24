import { useState, useEffect, useCallback } from 'react';
import { useGroqChat } from './hooks/useGroqChat';
import Navbar from './components/Navbar';
import LeftSidebar from './components/LeftSidebar';
import ChatPanel from './components/ChatPanel';
import RightSidebar from './components/RightSidebar';
import ViewCodeModal from './components/ViewCodeModal';
import SettingsPanel from './components/SettingsPanel';
import PerplexityExplorer from './components/PerplexityExplorer';
import ApiKeySetupModal from './components/ApiKeySetupModal';
import { MessageSquare, Settings, BarChart2 } from 'lucide-react';

export default function App() {
  // ── UI State ──────────────────────────────────────────────────────────────
  const [currentMode, setCurrentMode]       = useState('chat'); // 'chat' | 'perplexity'
  const [activeTab, setActiveTab]           = useState('chat');
  const [showSettings, setShowSettings]     = useState(false);
  const [showViewCode, setShowViewCode]     = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen]   = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // ── Settings state (passed to SettingsPanel) ──────────────────────────────
  const [fontSize, setFontSize]           = useState('medium');
  const [autoScroll, setAutoScroll]       = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [markdownEnabled, setMarkdownEnabled] = useState(true);
  const [compactMode, setCompactMode]     = useState(false);

  // ── Prompt text state (lifted for RightSidebar to analyze) ───────────────
  const [promptText, setPromptText] = useState('');

  // ── Groq chat hook (single source of truth) ───────────────────────────────
  const {
    messages,
    sendMessage,
    stopGeneration,
    clearConversation,
    regenerateLastResponse,
    isLoading,
    error,

    apiKey,
    setApiKey,
    rememberKey,
    setRememberKey,
    clearApiKey,

    selectedModel,
    setSelectedModel,
    availableModels,
    fetchModels,
    modelsLoading,
    modelsError,

    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    stopSequences,
    setStopSequences,
    contextWindow,
    setContextWindow,

    usage,
    speedMetrics,

    connectionStatus,
    testConnection,
  } = useGroqChat();

  // ── Mobile tabs ───────────────────────────────────────────────────────────
  const mobileTabs = [
    { id: 'chat',     label: 'Chat',     Icon: MessageSquare },
    { id: 'config',   label: 'Config',   Icon: Settings },
    { id: 'analysis', label: 'Analysis', Icon: BarChart2 },
  ];

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleGlobalKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowViewCode(false);
      setShowSettings(false);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      clearConversation();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      setShowSettings(v => !v);
    }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      setShowViewCode(v => !v);
    }
  }, [clearConversation]);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  // ── Determine which panel is visible on mobile ────────────────────────────
  const showLeft  = activeTab === 'config'   || leftSidebarOpen;
  const showRight = activeTab === 'analysis' || rightSidebarOpen;

  return (
    <div className="app-root" style={styles.root}>
      {/* ── Navbar ── */}
      <Navbar
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        selectedModel={selectedModel}
        availableModels={availableModels}
        setSelectedModel={setSelectedModel}
        connectionStatus={connectionStatus}
        onViewCode={() => setShowViewCode(true)}
        onSettings={() => setShowSettings(true)}
      />

      {/* ── Main View: Perplexity Explorer OR 3-Column Chat Lab ── */}
      {currentMode === 'perplexity' ? (
        <div style={styles.perplexityViewWrapper}>
          <PerplexityExplorer onClose={() => setCurrentMode('chat')} />
        </div>
      ) : (
        <main style={styles.main}>
          {/* Left Sidebar */}
          <aside
            style={{
              ...styles.sidebar,
              ...styles.leftSidebar,
              transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              opacity: leftSidebarOpen ? 1 : 0,
              pointerEvents: leftSidebarOpen ? 'auto' : 'none',
            }}
            className="sidebar-left"
          >
            <LeftSidebar
              apiKey={apiKey}
              setApiKey={setApiKey}
              rememberKey={rememberKey}
              setRememberKey={setRememberKey}
              clearApiKey={clearApiKey}
              connectionStatus={connectionStatus}
              testConnection={testConnection}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              availableModels={availableModels}
              fetchModels={fetchModels}
              modelsLoading={modelsLoading}
              modelsError={modelsError}
              temperature={temperature}
              setTemperature={setTemperature}
              maxTokens={maxTokens}
              setMaxTokens={setMaxTokens}
              stopSequences={stopSequences}
              setStopSequences={setStopSequences}
              contextWindow={contextWindow ?? 10}
              setContextWindow={setContextWindow}
              onOpenPerplexity={() => setCurrentMode('perplexity')}
              onOpenApiKeyModal={() => setShowApiKeyModal(true)}
            />
          </aside>

          {/* Center Chat Panel */}
          <section style={styles.center}>
            <ChatPanel
              messages={messages}
              sendMessage={sendMessage}
              stopGeneration={stopGeneration}
              clearConversation={clearConversation}
              regenerateLastResponse={regenerateLastResponse}
              isLoading={isLoading}
              error={error}
              selectedModel={selectedModel}
              apiKey={apiKey}
              leftSidebarOpen={leftSidebarOpen}
              setLeftSidebarOpen={setLeftSidebarOpen}
              rightSidebarOpen={rightSidebarOpen}
              setRightSidebarOpen={setRightSidebarOpen}
              promptText={promptText}
              setPromptText={setPromptText}
              markdownEnabled={markdownEnabled}
              showTimestamps={showTimestamps}
              compactMode={compactMode}
              onOpenPerplexity={() => setCurrentMode('perplexity')}
              onOpenApiKeyModal={() => setShowApiKeyModal(true)}
            />
          </section>

          {/* Right Sidebar */}
          <aside
            style={{
              ...styles.sidebar,
              ...styles.rightSidebar,
              transform: rightSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
              opacity: rightSidebarOpen ? 1 : 0,
              pointerEvents: rightSidebarOpen ? 'auto' : 'none',
            }}
            className="sidebar-right"
          >
            <RightSidebar
              promptText={promptText}
              usage={usage}
              speedMetrics={speedMetrics}
              selectedModel={selectedModel}
              temperature={temperature}
              maxTokens={maxTokens}
              stopSequences={stopSequences}
            />
          </aside>
        </main>
      )}

      {/* ── Mobile Bottom Tab Bar ── */}
      {currentMode === 'chat' && (
        <nav style={styles.mobileTabBar} className="mobile-tab-bar">
          {mobileTabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                ...styles.mobileTab,
                ...(activeTab === id ? styles.mobileTabActive : {}),
              }}
            >
              <Icon size={20} />
              <span style={styles.mobileTabLabel}>{label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ── Modals ── */}
      <ViewCodeModal
        isOpen={showViewCode}
        onClose={() => setShowViewCode(false)}
        selectedModel={selectedModel}
        temperature={temperature}
        maxTokens={maxTokens}
        stopSequences={stopSequences}
        messages={messages}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        showTimestamps={showTimestamps}
        setShowTimestamps={setShowTimestamps}
        markdownEnabled={markdownEnabled}
        setMarkdownEnabled={setMarkdownEnabled}
        compactMode={compactMode}
        setCompactMode={setCompactMode}
      />

      {showApiKeyModal && (
        <ApiKeySetupModal
          onKeyConfirmed={(key, remember) => {
            setApiKey(key);
            if (remember) setRememberKey(true);
            setShowApiKeyModal(false);
          }}
          testConnection={testConnection}
        />
      )}

      {/* ── Global CSS ── */}
      <style>{globalCSS}</style>
    </div>
  );
}

// ── Inline Styles ──────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#080b12',
    color: '#e2e8f0',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  perplexityViewWrapper: {
    flex: 1,
    marginTop: '64px',
    minHeight: 'calc(100vh - 64px)',
    overflowX: 'hidden',
    overflowY: 'visible',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr 300px',
    flex: 1,
    marginTop: '64px',
    height: 'calc(100vh - 64px)',
    overflow: 'hidden',
    position: 'relative',
  },
  sidebar: {
    height: '100%',
    overflowY: 'auto',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  },
  leftSidebar: {
    borderRight: '1px solid rgba(230,36,41,0.1)',
  },
  rightSidebar: {
    borderLeft: '1px solid rgba(230,36,41,0.1)',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    minWidth: 0,
  },
  mobileTabBar: {
    display: 'none',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '56px',
    backgroundColor: 'rgba(8,11,18,0.95)',
    borderTop: '1px solid rgba(230,36,41,0.2)',
    backdropFilter: 'blur(12px)',
    zIndex: 90,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
  },
  mobileTab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'color 0.2s',
    fontSize: '0.65rem',
    fontFamily: 'inherit',
  },
  mobileTabActive: {
    color: '#e62429',
  },
  mobileTabLabel: {
    fontSize: '0.6rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
};

// ── Global CSS ─────────────────────────────────────────────────────────────────
const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red:   #e62429;
    --blue:  #1e6ebf;
    --dark:  #080b12;
  }

  body {
    background: var(--dark);
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(230,36,41,0.3); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(230,36,41,0.6); }

  @media (max-width: 768px) {
    .mobile-tab-bar { display: flex !important; }
    .app-root main {
      grid-template-columns: 1fr !important;
      margin-bottom: 56px;
    }
    .sidebar-left, .sidebar-right {
      display: none !important;
    }
  }
`;
