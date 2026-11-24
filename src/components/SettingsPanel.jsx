import { useState } from "react";
import { X, Type, Clock, AlignLeft, Eye, Keyboard, Info, MessageSquare, ChevronDown, ChevronRight } from "lucide-react";

// ── Primitives ────────────────────────────────────────────────────────────

function Toggle({ value, onChange, label, description }) {
  return (
    <label style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      padding: "8px 0",
      gap: "12px",
    }}>
      <div>
        <span style={{ fontSize: "13px", color: "#cbd5e1", display: "block" }}>{label}</span>
        {description && (
          <span style={{ fontSize: "11px", color: "#4b5563", display: "block", marginTop: "1px" }}>
            {description}
          </span>
        )}
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: "40px",
          height: "22px",
          borderRadius: "11px",
          background: value
            ? "linear-gradient(90deg, #dc2626, #ef4444)"
            : "rgba(55,65,81,0.8)",
          border: value ? "1px solid rgba(220,38,38,0.6)" : "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          transition: "all 0.25s ease",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <div style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: "2px",
          left: value ? "21px" : "2px",
          transition: "left 0.25s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }} />
      </div>
    </label>
  );
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: "6px 0",
              borderRadius: "8px",
              border: isActive
                ? "1px solid rgba(220,38,38,0.5)"
                : "1px solid rgba(255,255,255,0.08)",
              background: isActive ? "rgba(220,38,38,0.15)" : "rgba(255,255,255,0.03)",
              color: isActive ? "#ef4444" : "#6b7280",
              fontSize: "12px",
              fontFamily: isActive ? "'Orbitron', monospace" : "inherit",
              letterSpacing: isActive ? "0.04em" : "normal",
              fontWeight: isActive ? "600" : "400",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionBlock({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "rgba(5,5,15,0.5)",
      border: "1px solid rgba(220,38,38,0.12)",
      borderRadius: "10px",
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "11px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#e2e8f0",
        }}
      >
        <Icon size={14} color="#dc2626" />
        <span style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#dc2626",
          flex: 1,
          textAlign: "left",
        }}>
          {title}
        </span>
        {open ? <ChevronDown size={13} color="#4b5563" /> : <ChevronRight size={13} color="#4b5563" />}
      </button>
      {open && (
        <div style={{
          padding: "0 14px 14px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "2px 0" }} />;
}

// ── Keyboard shortcut table ───────────────────────────────────────────────

const SHORTCUTS = [
  { key: "⌘ / Ctrl + Enter", action: "Send message" },
  { key: "Escape", action: "Close modal / panel" },
  { key: "⌘ / Ctrl + K", action: "Clear conversation" },
  { key: "⌘ / Ctrl + /", action: "Toggle settings panel" },
  { key: "⌘ / Ctrl + Shift + C", action: "View code" },
];

// ── Main Component ────────────────────────────────────────────────────────

export default function SettingsPanel({
  isOpen,
  onClose,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  autoScroll,
  setAutoScroll,
  showTimestamps,
  setShowTimestamps,
  markdownEnabled,
  setMarkdownEnabled,
  compactMode,
  setCompactMode,
}) {
  // Local state for settings that don't have a prop yet
  const [showModelInMessages, setShowModelInMessages] = useState(true);

  return (
    <>
      {/* Backdrop — only visible on mobile-ish or small screens */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 199,
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: "320px",
        maxWidth: "95vw",
        zIndex: 200,
        background: "linear-gradient(180deg, #06000e 0%, #0a0005 50%, #040010 100%)",
        borderLeft: "1px solid rgba(220,38,38,0.25)",
        boxShadow: isOpen ? "-8px 0 40px rgba(220,38,38,0.1)" : "none",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 18px 14px",
          borderBottom: "1px solid rgba(220,38,38,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontFamily: "'Orbitron', monospace",
              fontSize: "16px",
              fontWeight: "900",
              letterSpacing: "0.1em",
              background: "linear-gradient(90deg, #dc2626, #ef4444, #f87171)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textTransform: "uppercase",
            }}>
              ⚙️ Settings
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#4b5563" }}>
              Spider-Verse AI Lab configuration
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close settings"
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "7px",
              color: "#ef4444",
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.08)"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(220,38,38,0.3) transparent",
        }}>

          {/* 1. Display Settings */}
          <SectionBlock icon={Type} title="Display Settings">
            <div style={{ paddingTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Font Size */}
              <div>
                <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
                  Font Size
                </label>
                <RadioGroup
                  value={fontSize}
                  onChange={setFontSize}
                  options={[
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                  ]}
                />
              </div>
              <Divider />
              <Toggle
                value={showTimestamps}
                onChange={setShowTimestamps}
                label="Show Timestamps"
                description="Display time on each message"
              />
              <Divider />
              <Toggle
                value={compactMode}
                onChange={setCompactMode}
                label="Compact Mode"
                description="Reduce spacing between messages"
              />
              <Divider />
              <Toggle
                value={markdownEnabled}
                onChange={setMarkdownEnabled}
                label="Enable Markdown"
                description="Render bold, italics, code blocks"
              />
            </div>
          </SectionBlock>

          {/* 2. Chat Settings */}
          <SectionBlock icon={MessageSquare} title="Chat Settings">
            <div style={{ paddingTop: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <Toggle
                value={autoScroll}
                onChange={setAutoScroll}
                label="Auto-scroll to Bottom"
                description="Scroll down on new messages"
              />
              <Divider />
              <Toggle
                value={showModelInMessages}
                onChange={setShowModelInMessages}
                label="Show Model in Messages"
                description="Display model name under assistant replies"
              />
            </div>
          </SectionBlock>

          {/* 3. Keyboard Shortcuts */}
          <SectionBlock icon={Keyboard} title="Keyboard Shortcuts" defaultOpen={false}>
            <div style={{ paddingTop: "10px" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px",
              }}>
                <tbody>
                  {SHORTCUTS.map((s, i) => (
                    <tr key={i} style={{
                      borderBottom: i < SHORTCUTS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <td style={{ padding: "7px 8px 7px 0", verticalAlign: "middle" }}>
                        <kbd style={{
                          display: "inline-block",
                          padding: "2px 7px",
                          background: "rgba(220,38,38,0.1)",
                          border: "1px solid rgba(220,38,38,0.25)",
                          borderRadius: "4px",
                          fontFamily: "monospace",
                          fontSize: "10px",
                          color: "#fca5a5",
                          whiteSpace: "nowrap",
                        }}>
                          {s.key}
                        </kbd>
                      </td>
                      <td style={{ padding: "7px 0", color: "#9ca3af", verticalAlign: "middle" }}>
                        {s.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionBlock>

          {/* 4. About */}
          <SectionBlock icon={Info} title="About" defaultOpen={false}>
            <div style={{
              paddingTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}>
              {/* Spider-Man logo accent */}
              <div style={{
                textAlign: "center",
                padding: "10px 0 6px",
              }}>
                <span style={{ fontSize: "32px" }}>🕷️</span>
                <p style={{
                  margin: "6px 0 0",
                  fontFamily: "'Orbitron', monospace",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  background: "linear-gradient(90deg, #dc2626, #ef4444)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Spider-Verse AI Lab
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#4b5563" }}>
                  v1.0.0
                </p>
              </div>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                padding: "10px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span style={{ color: "#6b7280" }}>Powered by</span>
                  <span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>Groq API</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span style={{ color: "#6b7280" }}>Frontend</span>
                  <span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>React + Vite</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span style={{ color: "#6b7280" }}>Theme</span>
                  <span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>Spider-Man 🕷️</span>
                </div>
              </div>

              {/* Security note */}
              <div style={{
                padding: "10px",
                background: "rgba(234,179,8,0.06)",
                border: "1px solid rgba(234,179,8,0.2)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "#a16207",
                lineHeight: "1.6",
              }}>
                <strong style={{ display: "block", marginBottom: "3px", color: "#ca8a04" }}>
                  ⚠️ Security Note
                </strong>
                API calls are made directly from your browser. For production use, implement a backend proxy to avoid exposing credentials.
              </div>
            </div>
          </SectionBlock>

        </div>
      </div>
    </>
  );
}
