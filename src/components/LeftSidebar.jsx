import { useState } from "react";
import {
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Search,
  Thermometer,
  Maximize2,
  StopCircle,
} from "lucide-react";

/* ─────────────────────────── helpers ─────────────────────────── */

const shortenModelName = (id = "") => {
  // e.g. "llama-3.3-70b-versatile" → "Llama 3.3 70B"
  return id
    .replace(/-/g, " ")
    .replace(/\b(\w)/g, (c) => c.toUpperCase())
    .replace(/\b(\d+)B\b/gi, (m) => m.toUpperCase());
};

/* ───────────────────────── sub-components ─────────────────────── */

function SectionCard({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={styles.card}>
      <button
        style={styles.sectionHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span style={styles.sectionTitle}>
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} color="#ef4444" />
        ) : (
          <ChevronDown size={14} color="#ef4444" />
        )}
      </button>

      <div
        style={{
          ...styles.sectionBody,
          maxHeight: open ? "600px" : "0px",
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════ MAIN COMPONENT ════════════════════════ */

export default function LeftSidebar({
  apiKey,
  setApiKey,
  rememberKey,
  setRememberKey,
  clearApiKey,
  connectionStatus,
  testConnection,
  connectError,
  selectedModel,
  setSelectedModel,
  availableModels = [],
  fetchModels,
  modelsLoading,
  modelsError,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  stopSequences = [],
  setStopSequences,
  webSearchEnabled,
  setWebSearchEnabled,
  contextWindow,
  setContextWindow,
  onOpenPerplexity,
  onOpenApiKeyModal,
}) {
  /* local ui state */
  const [showKey, setShowKey] = useState(false);
  const [stopInput, setStopInput] = useState("");

  /* ── connection status helpers ── */
  const statusColor =
    connectionStatus === "connected"
      ? "#22c55e"
      : connectionStatus === "testing"
      ? "#f59e0b"
      : connectionStatus === "error"
      ? "#ef4444"
      : "#6b7280";

  const statusLabel =
    connectionStatus === "connected"
      ? "Connected"
      : connectionStatus === "testing"
      ? "Testing…"
      : connectionStatus === "error"
      ? "Error"
      : "Not connected";

  /* ── stop-sequence helpers ── */
  const addStopSequence = () => {
    const parts = stopInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = [...new Set([...stopSequences, ...parts])].slice(0, 4);
    setStopSequences(merged);
    setStopInput("");
  };

  const removeStop = (seq) =>
    setStopSequences(stopSequences.filter((s) => s !== seq));

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <aside style={styles.sidebar}>
      <div style={styles.panelLabel}>⚙️ Configuration Lab</div>

      {/* ── Perplexity Explorer Launcher ── */}
      {onOpenPerplexity && (
        <button
          onClick={onOpenPerplexity}
          style={styles.perplexityBanner}
          title="Open interactive Perplexity Explorer"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 6px #e62429)' }}>🕸️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={styles.bannerTitle}>PERPLEXITY EXPLORER</div>
              <div style={styles.bannerSub}>DistilGPT-2 Token Sandbox</div>
            </div>
          </div>
          <span style={styles.bannerArrow}>→</span>
        </button>
      )}

      {/* ── A. API Configuration ── */}
      <SectionCard title="⚡ API Configuration">
        {/* Key input */}
        <label style={styles.label}>Groq API Key</label>
        <div style={styles.inputRow}>
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="gsk_••••••••••••••••••••"
            style={styles.input}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            style={styles.iconBtn}
            onClick={() => setShowKey((v) => !v)}
            title={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Remember checkbox */}
        <label style={styles.checkRow}>
          <input
            type="checkbox"
            checked={rememberKey}
            onChange={(e) => setRememberKey(e.target.checked)}
            style={{ accentColor: "#ef4444" }}
          />
          <span style={styles.checkLabel}>Remember key in this tab</span>
        </label>

        {/* Action buttons */}
        <div style={styles.btnRow}>
          <button style={styles.clearBtn} onClick={clearApiKey}>
            <Trash2 size={12} style={{ marginRight: 4 }} />
            Clear Key
          </button>
          <button
            style={{
              ...styles.testBtn,
              opacity: connectionStatus === "testing" ? 0.7 : 1,
            }}
            onClick={testConnection}
            disabled={connectionStatus === "testing"}
          >
            {connectionStatus === "testing" ? (
              <RefreshCw size={13} className="spin" style={styles.spinIcon} />
            ) : (
              <Wifi size={13} style={{ marginRight: 4 }} />
            )}
            {connectionStatus === "testing" ? "Testing…" : "Test Connection"}
          </button>
        </div>

        {/* Status badge */}
        <div style={{ ...styles.statusBadge, borderColor: statusColor }}>
          {connectionStatus === "connected" ? (
            <Wifi size={12} color={statusColor} />
          ) : (
            <WifiOff size={12} color={statusColor} />
          )}
          <span style={{ color: statusColor, marginLeft: 6, fontSize: "0.72rem" }}>
            {statusLabel}
          </span>
        </div>

        {/* Error box */}
        {connectError && (
          <div style={styles.errorBox}>
            <span>⚠️ {connectError}</span>
          </div>
        )}
      </SectionCard>

      {/* ── B. Model Selection ── */}
      <SectionCard title="🤖 Model Selection">
        {/* Selected model name */}
        <div style={styles.selectedModelBadge}>
          <span style={styles.selectedModelText}>
            {selectedModel ? shortenModelName(selectedModel) : "None selected"}
          </span>
        </div>

        {/* Refresh */}
        <button
          style={styles.refreshBtn}
          onClick={fetchModels}
          disabled={modelsLoading}
        >
          <RefreshCw
            size={13}
            style={{
              marginRight: 5,
              ...(modelsLoading ? styles.spinIcon : {}),
            }}
          />
          {modelsLoading ? "Fetching…" : "Refresh Models"}
        </button>

        {/* Error */}
        {modelsError && !modelsLoading && (
          <div style={styles.errorBox}>
            <span>⚠️ {modelsError}</span>
            <button style={styles.retryLink} onClick={fetchModels}>
              Retry
            </button>
          </div>
        )}

        {/* Model list */}
        {modelsLoading ? (
          <div style={styles.spinnerWrap}>
            <RefreshCw size={20} style={styles.spinIcon} color="#ef4444" />
          </div>
        ) : (
          <div style={styles.modelList}>
            {availableModels.length === 0 && (
              <p style={styles.dimText}>No models loaded yet.</p>
            )}
            {availableModels.map((m) => {
              const id = typeof m === "string" ? m : m.id;
              const selected = id === selectedModel;
              return (
                <button
                  key={id}
                  style={{
                    ...styles.modelCard,
                    ...(selected ? styles.modelCardSelected : {}),
                  }}
                  onClick={() => setSelectedModel(id)}
                >
                  <span style={styles.modelShortName}>
                    {shortenModelName(id)}
                  </span>
                  <span style={styles.modelIdBadge}>{id}</span>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── C. Temperature ── */}
      <SectionCard title="🌡️ Temperature">
        <div style={styles.sliderRow}>
          <Thermometer size={14} color="#f87171" />
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={styles.slider}
          />
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={styles.numInput}
          />
        </div>
        <div style={styles.bigValue}>{temperature.toFixed(1)}</div>
        <p style={styles.dimText}>
          Higher = more creative &nbsp;·&nbsp; Lower = more precise
        </p>
      </SectionCard>

      {/* ── D. Max Tokens ── */}
      <SectionCard title="📏 Max Tokens">
        <div style={styles.sliderRow}>
          <Maximize2 size={14} color="#f87171" />
          <input
            type="range"
            min={100}
            max={4096}
            step={100}
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            style={styles.slider}
          />
          <input
            type="number"
            min={100}
            max={4096}
            step={100}
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            style={styles.numInput}
          />
        </div>
        <div style={styles.bigValue}>{maxTokens.toLocaleString()}</div>
        <p style={styles.dimText}>Maximum tokens in the model's response.</p>
      </SectionCard>

      {/* ── E. Stop Sequences ── */}
      <SectionCard title="🛑 Stop Sequences">
        <div style={styles.stopHeader}>
          <StopCircle size={13} color="#ef4444" />
          <span style={{ marginLeft: 5, fontSize: "0.7rem", color: "#9ca3af" }}>
            {stopSequences.length}/4 sequences
          </span>
        </div>

        {/* Tags */}
        <div style={styles.tagRow}>
          {stopSequences.map((s) => (
            <span key={s} style={styles.tag}>
              {s}
              <button style={styles.tagRemove} onClick={() => removeStop(s)}>
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        {stopSequences.length < 4 && (
          <div style={styles.inputRow}>
            <input
              type="text"
              value={stopInput}
              onChange={(e) => setStopInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStopSequence()}
              placeholder="Enter sequences, comma-separated"
              style={styles.input}
            />
            <button style={styles.iconBtn} onClick={addStopSequence} title="Add">
              +
            </button>
          </div>
        )}
        <p style={styles.dimText}>Signals AI to stop generating.</p>
      </SectionCard>

      {/* ── F. Web Search ── */}
      <SectionCard title="🔍 Web Search">
        <div style={styles.toggleRow}>
          <Search size={14} color={webSearchEnabled ? "#e62429" : "#6b7280"} />
          <span style={{ ...styles.checkLabel, marginLeft: 8, flex: 1 }}>
            Web Search Integration
          </span>
          <button
            type="button"
            onClick={() => setWebSearchEnabled && setWebSearchEnabled(!webSearchEnabled)}
            style={{
              ...styles.toggleTrack,
              background: webSearchEnabled ? "#e62429" : "rgba(107,114,128,0.3)",
              borderColor: webSearchEnabled ? "#ff4d50" : "rgba(107,114,128,0.4)",
              cursor: "pointer",
            }}
            title={webSearchEnabled ? "Disable web search" : "Enable web search"}
          >
            <div
              style={{
                ...styles.toggleThumb,
                transform: webSearchEnabled ? "translateX(16px)" : "translateX(0px)",
                background: webSearchEnabled ? "#fff" : "#6b7280",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
            />
          </button>
        </div>

        {webSearchEnabled ? (
          <div style={styles.warningCallout}>
            <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.7rem", marginBottom: 3 }}>
              ⚠️ Live Search Not Configured
            </div>
            <p style={{ ...styles.dimText, color: "#cbd5e1" }}>
              Standard Groq API models operate strictly on direct neural inference and do not provide native internet browsing without an external tool agent (such as Tavily or SerpAPI). Prompts will be processed using the model&apos;s pre-trained knowledge base.
            </p>
          </div>
        ) : (
          <p style={{ ...styles.dimText, marginTop: 8 }}>
            Toggles web search augmentation when a compatible external search provider is configured.
          </p>
        )}
      </SectionCard>

      {/* ── G. Context Window ── */}
      <SectionCard title="💬 Context Window">
        <div style={styles.sliderRow}>
          <span style={{ fontSize: "0.7rem", color: "#9ca3af", minWidth: 28 }}>
            {contextWindow}
          </span>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={contextWindow}
            onChange={(e) => setContextWindow(parseInt(e.target.value))}
            style={styles.slider}
          />
        </div>
        <div style={styles.bigValue}>{contextWindow} msgs</div>
        <p style={styles.dimText}>Conversation history sent with each request.</p>
      </SectionCard>

      {/* bottom padding */}
      <div style={{ height: 24 }} />
    </aside>
  );
}

/* ═══════════════════════════ STYLES ════════════════════════════════ */

const styles = {
  sidebar: {
    width: "280px",
    minWidth: "240px",
    maxWidth: "320px",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    background: "rgba(21, 27, 43, 0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRight: "1px solid rgba(239,68,68,0.15)",
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    scrollbarWidth: "thin",
    scrollbarColor: "#ef4444 transparent",
    boxSizing: "border-box",
  },

  panelLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    color: "#ef4444",
    textTransform: "uppercase",
    padding: "4px 2px 8px",
    borderBottom: "1px solid rgba(239,68,68,0.2)",
    marginBottom: "2px",
  },

  perplexityBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: 'linear-gradient(135deg, rgba(230, 36, 41, 0.2) 0%, rgba(22, 119, 255, 0.15) 100%)',
    border: '1px solid rgba(230, 36, 41, 0.45)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '4px',
    boxShadow: '0 0 12px rgba(230, 36, 41, 0.15)',
  },
  bannerTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#F5F7FA',
    letterSpacing: '0.05em',
  },
  bannerSub: {
    fontSize: '0.62rem',
    color: '#60a5fa',
    marginTop: '1px',
  },
  bannerArrow: {
    color: '#ef4444',
    fontSize: '0.9rem',
    fontWeight: 700,
  },

  /* card */
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(239,68,68,0.12)",
    borderLeft: "3px solid #ef4444",
    borderRadius: "8px",
    overflow: "hidden",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "9px 10px",
    color: "#e5e7eb",
  },

  sectionTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.72rem",
    letterSpacing: "0.06em",
    color: "#e5e7eb",
    textAlign: "left",
  },

  sectionBody: {
    padding: "0 10px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  /* inputs */
  label: {
    fontSize: "0.68rem",
    color: "#9ca3af",
    display: "block",
    marginBottom: 2,
  },

  inputRow: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },

  input: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "5px",
    color: "#e5e7eb",
    fontSize: "0.72rem",
    padding: "5px 8px",
    outline: "none",
    fontFamily: "monospace",
    minWidth: 0,
  },

  iconBtn: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "5px",
    color: "#f87171",
    cursor: "pointer",
    padding: "5px 7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    flexShrink: 0,
  },

  /* checkbox */
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  checkLabel: {
    fontSize: "0.7rem",
    color: "#9ca3af",
  },

  /* buttons */
  btnRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "5px",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "0.68rem",
    padding: "4px 8px",
  },
  testBtn: {
    display: "flex",
    alignItems: "center",
    background: "rgba(239,68,68,0.18)",
    border: "1px solid rgba(239,68,68,0.45)",
    borderRadius: "5px",
    color: "#f87171",
    cursor: "pointer",
    fontSize: "0.68rem",
    padding: "4px 10px",
    fontWeight: 600,
    flexShrink: 0,
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "5px",
    color: "#f87171",
    cursor: "pointer",
    fontSize: "0.68rem",
    padding: "5px 10px",
    width: "100%",
    justifyContent: "center",
  },
  retryLink: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "0.68rem",
    textDecoration: "underline",
    marginLeft: 6,
    padding: 0,
  },

  /* status */
  statusBadge: {
    display: "flex",
    alignItems: "center",
    border: "1px solid",
    borderRadius: "5px",
    padding: "4px 8px",
    background: "rgba(0,0,0,0.2)",
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "5px",
    padding: "6px 9px",
    fontSize: "0.68rem",
    color: "#fca5a5",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },

  /* model list */
  selectedModelBadge: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "6px",
    padding: "5px 9px",
    textAlign: "center",
  },
  selectedModelText: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.65rem",
    color: "#f87171",
    letterSpacing: "0.04em",
    wordBreak: "break-word",
  },
  spinnerWrap: {
    display: "flex",
    justifyContent: "center",
    padding: "12px 0",
  },
  modelList: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    maxHeight: "220px",
    overflowY: "auto",
    paddingRight: 2,
  },
  modelCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(239,68,68,0.1)",
    borderRadius: "6px",
    padding: "6px 9px",
    cursor: "pointer",
    textAlign: "left",
    color: "#d1d5db",
    transition: "border-color 0.2s, background 0.2s",
    width: "100%",
  },
  modelCardSelected: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.55)",
    color: "#fca5a5",
  },
  modelShortName: {
    fontSize: "0.72rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  modelIdBadge: {
    fontSize: "0.58rem",
    color: "#6b7280",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },

  /* sliders */
  sliderRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  slider: {
    flex: 1,
    accentColor: "#ef4444",
    cursor: "pointer",
    minWidth: 0,
  },
  numInput: {
    width: "54px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "5px",
    color: "#e5e7eb",
    fontSize: "0.72rem",
    padding: "4px 5px",
    outline: "none",
    textAlign: "center",
    flexShrink: 0,
  },
  bigValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "1.1rem",
    color: "#ef4444",
    textAlign: "center",
    letterSpacing: "0.06em",
    lineHeight: 1.2,
  },
  dimText: {
    fontSize: "0.65rem",
    color: "#6b7280",
    margin: 0,
    lineHeight: 1.4,
  },

  /* stop sequences */
  stopHeader: {
    display: "flex",
    alignItems: "center",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    minHeight: "0px",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "4px",
    padding: "2px 7px",
    fontSize: "0.65rem",
    color: "#fca5a5",
    fontFamily: "monospace",
  },
  tagRemove: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: "0 1px",
    fontSize: "0.85rem",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  /* toggle (disabled) */
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "0",
  },
  toggleTrack: {
    marginLeft: "auto",
    width: "36px",
    height: "18px",
    background: "rgba(107,114,128,0.3)",
    borderRadius: "9px",
    position: "relative",
    cursor: "not-allowed",
    border: "1px solid rgba(107,114,128,0.4)",
    flexShrink: 0,
  },
  toggleThumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "12px",
    height: "12px",
    background: "#6b7280",
    borderRadius: "50%",
    transition: "left 0.2s",
  },

  /* spin animation via inline style + keyframes injected globally */
  spinIcon: {
    animation: "spin 1s linear infinite",
    marginRight: 5,
  },

  warningCallout: {
    background: "rgba(245, 158, 11, 0.1)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    borderRadius: "6px",
    padding: "8px 10px",
    marginTop: "8px",
  },
};

/* ── inject global keyframes once ── */
if (typeof document !== "undefined" && !document.getElementById("sidebar-spin-kf")) {
  const style = document.createElement("style");
  style.id = "sidebar-spin-kf";
  style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
  `;
  document.head.appendChild(style);
}
