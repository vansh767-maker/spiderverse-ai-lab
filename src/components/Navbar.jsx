import { useState } from 'react';
import { Code2, Settings, ChevronDown } from 'lucide-react';

// ── Spider SVG Emblem ──────────────────────────────────────────────────────────
function SpiderEmblem({ hovered }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: hovered
          ? 'spin-fast 1.5s linear infinite'
          : 'spin-slow 12s linear infinite',
        filter: hovered
          ? 'drop-shadow(0 0 8px #e62429) drop-shadow(0 0 16px rgba(230,36,41,0.5))'
          : 'drop-shadow(0 0 3px rgba(230,36,41,0.4))',
        transition: 'filter 0.3s ease',
        flexShrink: 0,
      }}
    >
      {/* Web lines */}
      <line x1="32" y1="2"  x2="32" y2="62" stroke="rgba(230,36,41,0.35)" strokeWidth="0.8" />
      <line x1="2"  y1="32" x2="62" y2="32" stroke="rgba(230,36,41,0.35)" strokeWidth="0.8" />
      <line x1="9"  y1="9"  x2="55" y2="55" stroke="rgba(230,36,41,0.35)" strokeWidth="0.8" />
      <line x1="55" y1="9"  x2="9"  y2="55" stroke="rgba(230,36,41,0.35)" strokeWidth="0.8" />

      {/* Concentric web arcs */}
      <circle cx="32" cy="32" r="10" stroke="rgba(230,36,41,0.25)" strokeWidth="0.7" fill="none" />
      <circle cx="32" cy="32" r="18" stroke="rgba(230,36,41,0.2)"  strokeWidth="0.7" fill="none" />
      <circle cx="32" cy="32" r="26" stroke="rgba(230,36,41,0.15)" strokeWidth="0.7" fill="none" />

      {/* Spider body */}
      <ellipse cx="32" cy="30" rx="6"  ry="8"  fill="#e62429" />
      <ellipse cx="32" cy="22" rx="4"  ry="4.5" fill="#c41e22" />

      {/* Eyes */}
      <ellipse cx="30" cy="20.5" rx="1.5" ry="1.2" fill="white" />
      <ellipse cx="34" cy="20.5" rx="1.5" ry="1.2" fill="white" />

      {/* Legs — 4 per side */}
      {/* Left legs */}
      <line x1="26" y1="27" x2="14" y2="20" stroke="#e62429" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="29" x2="13" y2="29" stroke="#e62429" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="31" x2="14" y2="38" stroke="#e62429" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="34" x2="16" y2="44" stroke="#e62429" strokeWidth="1.4" strokeLinecap="round" />

      {/* Right legs */}
      <line x1="38" y1="27" x2="50" y2="20" stroke="#e62429" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="38" y1="29" x2="51" y2="29" stroke="#e62429" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="38" y1="31" x2="50" y2="38" stroke="#e62429" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="38" y1="34" x2="48" y2="44" stroke="#e62429" strokeWidth="1.4" strokeLinecap="round" />

      {/* Abdomen marking */}
      <ellipse cx="32" cy="31" rx="2.5" ry="3" fill="#ff4d50" opacity="0.6" />
    </svg>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  connected:    { color: '#22c55e', label: 'LIVE',          pulse: true  },
  error:        { color: '#ef4444', label: 'ERROR',         pulse: false },
  connecting:   { color: '#eab308', label: 'CONNECTING',    pulse: false },
  disconnected: { color: '#64748b', label: 'NOT CONNECTED', pulse: false },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;
  return (
    <div style={styles.statusBadge}>
      <span
        style={{
          ...styles.statusDot,
          backgroundColor: cfg.color,
          boxShadow: cfg.pulse ? `0 0 0 0 ${cfg.color}` : 'none',
          animation: cfg.pulse ? 'status-pulse 1.8s ease-in-out infinite' : 'none',
        }}
      />
      <span style={{ ...styles.statusLabel, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
export default function Navbar({
  currentMode = 'chat',
  onModeChange,
  selectedModel,
  availableModels,
  setSelectedModel,
  connectionStatus,
  onViewCode,
  onSettings,
}) {
  const [emblemHovered, setEmbledHovered] = useState(false);

  const modelsReady = availableModels && availableModels.length > 0;

  return (
    <>
      <nav style={styles.navbar}>
        {/* ── Left: Emblem + Title ── */}
        <div style={styles.brand}>
          <div
            onMouseEnter={() => setEmbledHovered(true)}
            onMouseLeave={() => setEmbledHovered(false)}
            style={styles.emblemWrapper}
          >
            <SpiderEmblem hovered={emblemHovered} />
          </div>

          <div style={styles.titleBlock}>
            <span style={styles.title}>SPIDER-VERSE AI LAB</span>
            <span style={styles.subtitle}>Your Friendly Neighborhood AI Playground</span>
          </div>
        </div>

        {/* ── Mode Switcher & Model Selector ── */}
        <div style={styles.centerBlock}>
          {onModeChange && (
            <div style={styles.modeToggleGroup}>
              <button
                onClick={() => onModeChange('chat')}
                style={{
                  ...styles.modeToggleBtn,
                  ...(currentMode === 'chat' ? styles.modeToggleBtnActive : {})
                }}
              >
                💬 Chat Lab
              </button>
              <button
                onClick={() => onModeChange('perplexity')}
                style={{
                  ...styles.modeToggleBtn,
                  ...(currentMode === 'perplexity' ? styles.modeToggleBtnActive : {})
                }}
              >
                🕸️ Perplexity Explorer
              </button>
            </div>
          )}

          {currentMode === 'chat' && (
            <div style={styles.selectWrapper}>
              <select
                value={selectedModel || ''}
                onChange={e => setSelectedModel(e.target.value)}
                disabled={!modelsReady}
                style={styles.modelSelect}
              >
                {modelsReady ? (
                  availableModels.map(model => {
                    const id = typeof model === 'string' ? model : model.id;
                    const name = typeof model === 'string' ? model : (model.name || model.id);
                    return (
                      <option key={id} value={id}>{name}</option>
                    );
                  })
                ) : (
                  <option value="">Loading models…</option>
                )}
              </select>
              <ChevronDown size={14} style={styles.selectChevron} />
            </div>
          )}
        </div>

        {/* ── Right: Actions + Status ── */}
        <div style={styles.rightBlock}>
          {/* View Code */}
          <button onClick={onViewCode} style={styles.iconBtn} title="View Code">
            <Code2 size={18} />
            <span style={styles.btnLabel}>Code</span>
          </button>

          {/* Status badge */}
          <StatusBadge status={connectionStatus} />

          {/* Settings */}
          <button onClick={onSettings} style={styles.iconBtn} title="Settings">
            <Settings size={18} style={styles.settingsIcon} />
          </button>
        </div>
      </nav>

      {/* ── Keyframe injections ── */}
      <style>{navbarCSS}</style>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    zIndex: 100,
    backgroundColor: 'rgba(8, 11, 18, 0.9)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(230, 36, 41, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    gap: '16px',
  },

  // Brand
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  emblemWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    lineHeight: 1,
  },
  title: {
    fontFamily: "'Orbitron', 'Courier New', monospace",
    fontSize: '1.1rem',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #e62429 0%, #1e6ebf 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap',
  },
  subtitle: {
    fontSize: '0.7rem',
    color: '#64748b',
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
  },

  // Center
  centerBlock: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '560px',
    margin: '0 auto',
  },
  modeToggleGroup: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(230, 36, 41, 0.25)',
    borderRadius: '10px',
    padding: '3px',
    gap: '2px',
  },
  modeToggleBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '6px 12px',
    borderRadius: '7px',
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: '0.04em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  modeToggleBtnActive: {
    background: 'linear-gradient(135deg, rgba(230, 36, 41, 0.3) 0%, rgba(22, 119, 255, 0.2) 100%)',
    color: '#fff',
    boxShadow: '0 0 10px rgba(230, 36, 41, 0.25)',
    border: '1px solid rgba(230, 36, 41, 0.4)',
  },
  selectWrapper: {
    position: 'relative',
    width: '100%',
  },
  modelSelect: {
    width: '100%',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#e2e8f0',
    border: '1px solid rgba(230,36,41,0.3)',
    borderRadius: '8px',
    padding: '8px 36px 8px 14px',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  selectChevron: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    pointerEvents: 'none',
  },

  // Right
  rightBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94a3b8',
    borderRadius: '8px',
    padding: '7px 12px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: 'inherit',
    transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
  },
  btnLabel: {
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  settingsIcon: {
    transition: 'transform 0.4s ease',
  },

  // Status
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '5px 10px',
    flexShrink: 0,
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    fontFamily: "'Orbitron','Courier New',monospace",
    whiteSpace: 'nowrap',
  },
};

// ── Keyframes ──────────────────────────────────────────────────────────────────
const navbarCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@400;500;600&display=swap');

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes spin-fast {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes status-pulse {
    0%   { box-shadow: 0 0 0 0   rgba(34,197,94,0.7); }
    70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0);   }
    100% { box-shadow: 0 0 0 0   rgba(34,197,94,0);   }
  }

  /* Model select hover/focus */
  select:hover  { border-color: rgba(230,36,41,0.6) !important; background-color: rgba(255,255,255,0.08) !important; }
  select:focus  { border-color: #e62429 !important; box-shadow: 0 0 0 2px rgba(230,36,41,0.2); }
  select option { background-color: #0f1623; color: #e2e8f0; }

  /* Icon button hover */
  nav button:hover { background-color: rgba(230,36,41,0.12) !important; color: #e2e8f0 !important; border-color: rgba(230,36,41,0.3) !important; }

  /* Settings gear hover spin */
  nav button:hover svg.settings-spin { transform: rotate(90deg); }

  /* Responsive: hide subtitle + btn label on small screens */
  @media (max-width: 640px) {
    .nav-subtitle  { display: none !important; }
    .nav-btn-label { display: none !important; }
  }
`;
