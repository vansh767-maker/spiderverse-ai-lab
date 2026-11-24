import { Clock, Timer, Zap } from "lucide-react";
import { usePromptAnalyzer } from "../hooks/usePromptAnalyzer";

// ── Helpers ───────────────────────────────────────────────────────────────

function PatternRow({ detected, label, badge, description }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "6px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontWeight: "700",
            fontSize: "13px",
            color: detected ? "#22c55e" : "#6b7280",
            minWidth: "14px",
          }}>
            {detected ? "✓" : "✗"}
          </span>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "11px",
            fontWeight: "600",
            color: detected ? "#e2e8f0" : "#6b7280",
            letterSpacing: "0.03em",
          }}>
            {label}
          </span>
        </div>
        {detected && badge && (
          <span style={{
            background: "rgba(220,38,38,0.18)",
            border: "1px solid rgba(220,38,38,0.4)",
            color: "#fca5a5",
            fontSize: "10px",
            fontFamily: "monospace",
            padding: "1px 7px",
            borderRadius: "10px",
            whiteSpace: "nowrap",
          }}>
            {badge}
          </span>
        )}
      </div>
      {detected && description && (
        <p style={{
          margin: "0 0 0 22px",
          fontSize: "11px",
          color: "#9ca3af",
          lineHeight: "1.4",
        }}>
          {description}
        </p>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, value, label }) {
  return (
    <div style={{
      background: "rgba(10,10,20,0.6)",
      border: "1px solid rgba(220,38,38,0.2)",
      borderRadius: "10px",
      padding: "12px 10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      flex: "1",
      minWidth: 0,
    }}>
      <Icon size={14} color="#dc2626" style={{ marginBottom: "2px" }} />
      <span style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "18px",
        fontWeight: "700",
        color: value === "--" ? "#4b5563" : "#f1f5f9",
        letterSpacing: "0.04em",
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: "9px",
        color: "#6b7280",
        textAlign: "center",
        lineHeight: "1.3",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
}

function TokenRow({ label, value, color, bold, maxVal }) {
  const pct = maxVal > 0 ? Math.min((value / maxVal) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px", padding: "5px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#9ca3af" }}>{label}</span>
        <span style={{
          fontFamily: "monospace",
          fontSize: "13px",
          fontWeight: bold ? "700" : "500",
          color: color || "#e2e8f0",
        }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      </div>
      {typeof value === "number" && maxVal > 0 && (
        <div style={{
          height: "3px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "2px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: color || "#e2e8f0",
            borderRadius: "2px",
            transition: "width 0.4s ease",
            opacity: 0.7,
          }} />
        </div>
      )}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <div style={{
      background: "rgba(5,5,15,0.5)",
      border: "1px solid rgba(220,38,38,0.15)",
      borderRadius: "12px",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}>
      <div>
        <h3 style={{
          margin: 0,
          fontFamily: "'Orbitron', monospace",
          fontSize: "11px",
          fontWeight: "700",
          letterSpacing: "0.08em",
          background: "linear-gradient(90deg, #dc2626, #ef4444, #dc2626)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textTransform: "uppercase",
        }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#6b7280" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function RightSidebar({
  promptText = "",
  usage = {},
  speedMetrics = {},
  selectedModel,
  temperature,
  maxTokens,
  stopSequences,
}) {
  const { analysis } = usePromptAnalyzer(promptText);
  const isEmpty = !promptText || promptText.trim() === "";

  const totalTokens =
    (usage.input_tokens || 0) +
    (usage.output_tokens || 0) +
    (usage.reasoning_tokens || 0);

  const maxForBar = Math.max(
    usage.input_tokens || 0,
    usage.output_tokens || 0,
    usage.reasoning_tokens || 0,
    1
  );

  const hasSpeed =
    speedMetrics.timeToFirstToken != null ||
    speedMetrics.totalResponseTime != null ||
    speedMetrics.tokensPerSecond != null;

  return (
    <aside style={{
      width: "280px",
      minWidth: "240px",
      maxWidth: "320px",
      height: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      padding: "14px 10px",
      background: "linear-gradient(180deg, rgba(5,0,10,0.95) 0%, rgba(10,2,2,0.97) 100%)",
      borderLeft: "1px solid rgba(220,38,38,0.2)",
      scrollbarWidth: "thin",
      scrollbarColor: "rgba(220,38,38,0.3) transparent",
    }}>

      {/* ── A. SPIDER SENSE — PROMPT ANALYSIS ── */}
      <Section
        title="🕷️ Spider Sense — Prompt Analysis"
        subtitle="Real-time prompt pattern detection (heuristic estimates)"
      >
        {isEmpty ? (
          <div style={{
            textAlign: "center",
            padding: "20px 0",
            animation: "pulse 2s ease-in-out infinite",
          }}>
            <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>🕷️</span>
            <p style={{ margin: 0, fontSize: "11px", color: "#6b7280", lineHeight: "1.5" }}>
              Start typing to analyze your prompt...
            </p>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
              }
            `}</style>
          </div>
        ) : (
          <>
            <div style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <PatternRow
                detected={analysis.fewShot.detected}
                label="Few-Shot Prompting"
                badge={analysis.fewShot.detected ? `${analysis.fewShot.count} example${analysis.fewShot.count > 1 ? "s" : ""}` : null}
                description={analysis.fewShot.detected ? "Example pairs found in prompt" : null}
              />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
              <PatternRow
                detected={analysis.chainOfThought.detected}
                label="Chain-of-Thought"
                badge={analysis.chainOfThought.detected ? "Step-by-step" : null}
                description={analysis.chainOfThought.detected ? "Step-by-step reasoning detected" : null}
              />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
              <PatternRow
                detected={analysis.rolePlaying.detected}
                label="Role Prompting"
                badge={analysis.rolePlaying.role ? `"${analysis.rolePlaying.role}"` : null}
                description={analysis.rolePlaying.detected ? `Detected role: "${analysis.rolePlaying.role}"` : null}
              />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
              <PatternRow
                detected={analysis.negativeConstraints.detected}
                label="Negative Constraints"
                badge={analysis.negativeConstraints.detected ? `${analysis.negativeConstraints.count} found` : null}
                description={
                  analysis.negativeConstraints.detected
                    ? `"do not / never / avoid" ×${analysis.negativeConstraints.count}`
                    : null
                }
              />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />
              <PatternRow
                detected={analysis.formatConstraints.detected}
                label="Format Constraints"
                badge={
                  analysis.formatConstraints.detected
                    ? analysis.formatConstraints.formats.join(", ")
                    : null
                }
                description={
                  analysis.formatConstraints.detected
                    ? `Formats: ${analysis.formatConstraints.formats.join(", ")}`
                    : null
                }
              />
            </div>

            {/* Stats */}
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "10px",
            }}>
              <p style={{
                margin: "0 0 6px",
                fontFamily: "'Orbitron', monospace",
                fontSize: "9px",
                color: "#6b7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                📊 Prompt Stats
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", lineHeight: "1.8" }}>
                <span style={{ color: "#cbd5e1" }}>{analysis.stats.length}</span> chars
                {" | "}
                <span style={{ color: "#cbd5e1" }}>{analysis.stats.wordCount}</span> words
                {" | "}
                <span style={{ color: "#cbd5e1" }}>~{analysis.stats.tokenCount}</span> tokens
                {" | "}
                <span style={{ color: "#cbd5e1" }}>{analysis.stats.sentenceCount}</span> sentences
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "9px", color: "#4b5563", fontStyle: "italic" }}>
                Token estimates are approximate (words × 1.3)
              </p>
            </div>
          </>
        )}
      </Section>

      {/* ── B. SPIDER SPEED — LAST RESPONSE ── */}
      <Section title="⚡ Spider Speed — Last Response">
        {!hasSpeed ? (
          <p style={{
            margin: 0,
            fontSize: "11px",
            color: "#4b5563",
            textAlign: "center",
            padding: "12px 0",
            lineHeight: "1.5",
          }}>
            No response yet. Send a message to see performance metrics.
          </p>
        ) : (
          <div style={{ display: "flex", gap: "6px" }}>
            <MetricCard
              icon={Clock}
              value={speedMetrics.timeToFirstToken != null ? speedMetrics.timeToFirstToken : "--"}
              label={`Time to\nFirst Token${speedMetrics.timeToFirstToken != null ? " (ms)" : ""}`}
            />
            <MetricCard
              icon={Timer}
              value={speedMetrics.totalResponseTime != null ? speedMetrics.totalResponseTime : "--"}
              label={`Total Time${speedMetrics.totalResponseTime != null ? " (s)" : ""}`}
            />
            <MetricCard
              icon={Zap}
              value={speedMetrics.tokensPerSecond != null ? speedMetrics.tokensPerSecond : "--"}
              label="Tok / Sec"
            />
          </div>
        )}
      </Section>

      {/* ── C. WEB FLUID — TOKEN USAGE ── */}
      <Section
        title="🕸️ Web Fluid — Token Usage"
        subtitle="Session totals (history resent each request)"
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <TokenRow
            label="Input Tokens"
            value={usage.input_tokens ?? 0}
            color="#60a5fa"
            maxVal={maxForBar}
          />
          <TokenRow
            label="Output Tokens"
            value={usage.output_tokens ?? 0}
            color="#4ade80"
            maxVal={maxForBar}
          />
          {(usage.reasoning_tokens > 0) && (
            <TokenRow
              label="Reasoning Tokens"
              value={usage.reasoning_tokens}
              color="#fb923c"
              maxVal={maxForBar}
            />
          )}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "4px 0" }} />
          <TokenRow
            label="Total Tokens"
            value={totalTokens}
            color="#f1f5f9"
            bold
            maxVal={0}
          />
          <div style={{ marginTop: "4px" }}>
            <span style={{ fontSize: "10px", color: "#4b5563", fontStyle: "italic" }}>
              Remaining/min: Not available (Groq does not expose real-time quota)
            </span>
          </div>
        </div>

        <div style={{
          marginTop: "4px",
          padding: "8px",
          background: "rgba(234,179,8,0.06)",
          border: "1px solid rgba(234,179,8,0.15)",
          borderRadius: "6px",
          fontSize: "10px",
          color: "#a16207",
          lineHeight: "1.5",
        }}>
          ⚠️ Conversation history is included in input tokens for each request.
        </div>
      </Section>
    </aside>
  );
}
