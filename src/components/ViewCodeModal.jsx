import { useState, useCallback } from "react";
import { X, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// ── Code generators ───────────────────────────────────────────────────────

function buildMessagesSnippet(messages, lang) {
  const preview = (messages || []).slice(-3);

  if (lang === "python") {
    if (!preview.length) {
      return `        {"role": "user", "content": "Your message here"}`;
    }
    return preview
      .map(
        (m) =>
          `        {"role": "${m.role}", "content": ${JSON.stringify(
            m.content.length > 120 ? m.content.slice(0, 117) + "..." : m.content
          )}}`
      )
      .join(",\n");
  }

  if (lang === "javascript") {
    if (!preview.length) {
      return `    { role: "user", content: "Your message here" }`;
    }
    return preview
      .map((m) => {
        const content =
          m.content.length > 120 ? m.content.slice(0, 117) + "..." : m.content;
        return `    { role: "${m.role}", content: ${JSON.stringify(content)} }`;
      })
      .join(",\n");
  }

  // curl — JSON array
  if (!preview.length) {
    return JSON.stringify([{ role: "user", content: "Your message here" }], null, 4);
  }
  return JSON.stringify(
    preview.map((m) => ({
      role: m.role,
      content:
        m.content.length > 120 ? m.content.slice(0, 117) + "..." : m.content,
    })),
    null,
    4
  );
}

function generatePython({ selectedModel, temperature, maxTokens, stopSequences, messages }) {
  const stop = stopSequences && stopSequences.length ? JSON.stringify(stopSequences) : "None";
  const msgs = buildMessagesSnippet(messages, "python");
  return `import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

stream = client.chat.completions.create(
    model="${selectedModel || "llama3-8b-8192"}",
    messages=[
${msgs}
    ],
    temperature=${temperature ?? 1},
    max_tokens=${maxTokens ?? 1024},
    stop=${stop},
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)
`;
}

function generateJavaScript({ selectedModel, temperature, maxTokens, stopSequences, messages }) {
  const stop =
    stopSequences && stopSequences.length
      ? JSON.stringify(stopSequences)
      : "null";
  const msgs = buildMessagesSnippet(messages, "javascript");
  return `import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Only for local playground use
});

const stream = await client.chat.completions.create({
  model: "${selectedModel || "llama3-8b-8192"}",
  messages: [
${msgs}
  ],
  temperature: ${temperature ?? 1},
  max_tokens: ${maxTokens ?? 1024},
  stop: ${stop},
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
`;
}

function generateCurl({ selectedModel, temperature, maxTokens, stopSequences, messages }) {
  const msgsJson = buildMessagesSnippet(messages, "curl");
  const body = {
    model: selectedModel || "llama3-8b-8192",
    messages: JSON.parse(msgsJson),
    temperature: temperature ?? 1,
    max_tokens: maxTokens ?? 1024,
    stream: true,
    ...(stopSequences && stopSequences.length ? { stop: stopSequences } : {}),
  };
  const bodyStr = JSON.stringify(body, null, 2);
  return `curl https://api.groq.com/openai/v1/chat/completions \\
  -H "Authorization: Bearer $GROQ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${bodyStr}'
`;
}

// ── Copy button ───────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy code"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 12px",
        background: copied ? "rgba(34,197,94,0.15)" : "rgba(220,38,38,0.15)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(220,38,38,0.35)"}`,
        borderRadius: "6px",
        color: copied ? "#4ade80" : "#fca5a5",
        fontSize: "12px",
        fontFamily: "'Orbitron', monospace",
        cursor: "pointer",
        transition: "all 0.2s ease",
        letterSpacing: "0.05em",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy Code"}
    </button>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "python", label: "Python", lang: "python" },
  { id: "javascript", label: "JavaScript", lang: "javascript" },
  { id: "curl", label: "cURL", lang: "bash" },
];

// ── Main Component ────────────────────────────────────────────────────────

export default function ViewCodeModal({
  isOpen,
  onClose,
  selectedModel,
  temperature,
  maxTokens,
  stopSequences,
  messages = [],
}) {
  const [activeTab, setActiveTab] = useState("python");

  if (!isOpen) return null;

  const codeMap = {
    python: generatePython({ selectedModel, temperature, maxTokens, stopSequences, messages }),
    javascript: generateJavaScript({ selectedModel, temperature, maxTokens, stopSequences, messages }),
    curl: generateCurl({ selectedModel, temperature, maxTokens, stopSequences, messages }),
  };

  const activeCode = codeMap[activeTab];
  const activeLang = TABS.find((t) => t.id === activeTab)?.lang || "python";

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div style={{
        width: "100%",
        maxWidth: "900px",
        maxHeight: "90vh",
        background: "linear-gradient(135deg, #0a0010 0%, #0d0005 50%, #050010 100%)",
        border: "1px solid rgba(220,38,38,0.35)",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 0 60px rgba(220,38,38,0.15), 0 0 0 1px rgba(220,38,38,0.08)",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(220,38,38,0.15)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontFamily: "'Orbitron', monospace",
              fontSize: "20px",
              fontWeight: "900",
              letterSpacing: "0.12em",
              background: "linear-gradient(90deg, #dc2626, #ef4444, #f87171)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textTransform: "uppercase",
            }}>
              View Code
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
              Exact API request for the current configuration
            </p>
            <p style={{
              margin: "4px 0 0",
              fontSize: "11px",
              color: "#4b5563",
              fontStyle: "italic",
            }}>
              🔐 API key replaced with environment variable for security.
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close"
            style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: "8px",
              color: "#ef4444",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220,38,38,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(220,38,38,0.1)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "4px",
          padding: "12px 24px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "7px 18px",
                  borderRadius: "8px 8px 0 0",
                  border: isActive
                    ? "1px solid rgba(220,38,38,0.4)"
                    : "1px solid transparent",
                  borderBottom: isActive ? "1px solid #0a0010" : "1px solid transparent",
                  background: isActive
                    ? "rgba(220,38,38,0.12)"
                    : "transparent",
                  color: isActive ? "#ef4444" : "#6b7280",
                  fontFamily: "'Orbitron', monospace",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textTransform: "uppercase",
                  position: "relative",
                  bottom: "-1px",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Code area */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(220,38,38,0.3) transparent",
        }}>
          {/* Copy button row */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 20px 6px",
          }}>
            <CopyButton text={activeCode} />
          </div>

          <div style={{ padding: "0 20px 20px" }}>
            <SyntaxHighlighter
              language={activeLang}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: "10px",
                border: "1px solid rgba(220,38,38,0.15)",
                fontSize: "13px",
                lineHeight: "1.6",
                background: "rgba(2,2,8,0.95)",
                padding: "20px",
              }}
              showLineNumbers
              lineNumberStyle={{
                color: "#374151",
                fontSize: "11px",
                paddingRight: "16px",
                userSelect: "none",
              }}
            >
              {activeCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
