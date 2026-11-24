import { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Zap, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ApiKeySetupModal({ onKeyConfirmed, testConnection }) {
  const [key, setKey]         = useState('');
  const [show, setShow]       = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus]   = useState('idle'); // idle | testing | success | error
  const [errMsg, setErrMsg]   = useState('');

  const handleTest = async () => {
    if (!key.trim()) return;
    setStatus('testing');
    setErrMsg('');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${key.trim()}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }
      setStatus('success');
    } catch (e) {
      setStatus('error');
      setErrMsg(e.message || 'Connection failed. Check your key and try again.');
    }
  };

  const handleConfirm = () => {
    if (!key.trim() || status === 'error') return;
    onKeyConfirmed(key.trim(), remember);
  };

  const canConfirm = key.trim().length > 0 && status !== 'error';

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        {/* Spider web corner decorations */}
        <div style={S.webTL} aria-hidden>
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
            {[20,38,56,74].map(r => (
              <circle key={r} cx="0" cy="0" r={r} stroke="rgba(230,36,41,0.18)" strokeWidth="1" fill="none"/>
            ))}
            {[0,30,60,90,120,150].map(deg => (
              <line key={deg} x1="0" y1="0"
                x2={80*Math.cos(deg*Math.PI/180)} y2={80*Math.sin(deg*Math.PI/180)}
                stroke="rgba(230,36,41,0.15)" strokeWidth="1"/>
            ))}
          </svg>
        </div>
        <div style={S.webBR} aria-hidden>
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
            {[20,38,56,74].map(r => (
              <circle key={r} cx="90" cy="90" r={r} stroke="rgba(22,119,255,0.15)" strokeWidth="1" fill="none"/>
            ))}
            {[180,210,240,270,300,330].map(deg => (
              <line key={deg} x1="90" y1="90"
                x2={90+80*Math.cos(deg*Math.PI/180)} y2={90+80*Math.sin(deg*Math.PI/180)}
                stroke="rgba(22,119,255,0.12)" strokeWidth="1"/>
            ))}
          </svg>
        </div>

        {/* Header */}
        <div style={S.header}>
          <div style={S.spider}>🕷️</div>
          <h1 style={S.title}>SPIDER-VERSE AI LAB</h1>
          <p style={S.subtitle}>Your Friendly Neighborhood AI Playground</p>
          <p style={S.tagline}>Powered by Groq — the fastest LLM inference on the planet</p>
        </div>

        {/* Key input card */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <Zap size={16} color="#e62429" />
            <span style={S.cardTitle}>Enter Your Groq API Key</span>
          </div>

          <p style={S.hint}>
            Free tier available — no credit card needed.{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={S.link}>
              Get your key at console.groq.com <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
            </a>
          </p>

          {/* Input */}
          <div style={S.inputWrap}>
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => { setKey(e.target.value); setStatus('idle'); setErrMsg(''); }}
              onKeyDown={e => { if (e.key === 'Enter' && canConfirm) status === 'success' ? handleConfirm() : handleTest(); }}
              placeholder="gsk_••••••••••••••••••••••••••••••••••••••••••••••••••••"
              style={{
                ...S.input,
                borderColor: status === 'success' ? 'rgba(34,197,94,0.6)'
                  : status === 'error' ? 'rgba(239,68,68,0.6)'
                  : 'rgba(230,36,41,0.35)',
                boxShadow: status === 'success' ? '0 0 0 3px rgba(34,197,94,0.1)'
                  : status === 'error' ? '0 0 0 3px rgba(239,68,68,0.1)'
                  : 'none',
              }}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <button style={S.eyeBtn} onClick={() => setShow(v => !v)} title={show ? 'Hide' : 'Show'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Status feedback */}
          {status === 'success' && (
            <div style={S.successBanner}>
              <CheckCircle size={14} />
              <span>Connected! Your key works perfectly.</span>
            </div>
          )}
          {status === 'error' && (
            <div style={S.errorBanner}>
              <AlertCircle size={14} />
              <span>{errMsg}</span>
            </div>
          )}

          {/* Remember checkbox */}
          <label style={S.checkRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ accentColor: '#e62429', width: 14, height: 14 }}
            />
            <span style={S.checkLabel}>Remember key for this browser session</span>
          </label>

          {/* Buttons */}
          <div style={S.btnRow}>
            <button
              onClick={handleTest}
              disabled={!key.trim() || status === 'testing'}
              style={{
                ...S.testBtn,
                opacity: !key.trim() || status === 'testing' ? 0.5 : 1,
                cursor: !key.trim() || status === 'testing' ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'testing' ? (
                <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Testing…</>
              ) : (
                <>Test Connection</>
              )}
            </button>

            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                ...S.confirmBtn,
                opacity: !canConfirm ? 0.4 : 1,
                cursor: !canConfirm ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'success' ? '🕷️ Launch Lab' : 'Use This Key →'}
            </button>
          </div>

          <p style={S.secNote}>
            🔒 Your key stays in this browser only. It is never sent to any server other than Groq.
          </p>
        </div>

        {/* Features teaser */}
        <div style={S.features}>
          {['⚡ Real-time streaming responses', '🕷️ Spider Sense prompt analyzer', '📊 Speed & token metrics', '💻 View code in Python / JS / cURL'].map(f => (
            <span key={f} style={S.featureChip}>{f}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatSpider { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
      `}</style>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    background: 'rgba(5,8,16,0.97)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
    animation: 'fadeIn 0.4s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'hidden',
  },
  webTL: { position: 'absolute', top: -10, left: -10, pointerEvents: 'none', zIndex: 0 },
  webBR: { position: 'absolute', bottom: -10, right: -10, pointerEvents: 'none', zIndex: 0 },

  header: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  spider: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
    animation: 'floatSpider 3s ease-in-out infinite',
  },
  title: {
    fontFamily: "'Orbitron', 'Courier New', monospace",
    fontSize: '1.6rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    background: 'linear-gradient(90deg, #e62429 0%, #ff6b6b 50%, #1677ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.85rem',
    margin: '6px 0 4px',
    letterSpacing: '0.03em',
  },
  tagline: {
    color: 'rgba(230,36,41,0.7)',
    fontSize: '0.72rem',
    margin: 0,
    letterSpacing: '0.05em',
  },

  card: {
    background: 'rgba(21,27,43,0.9)',
    border: '1px solid rgba(230,36,41,0.3)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 0 40px rgba(230,36,41,0.08), 0 20px 60px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    position: 'relative',
    zIndex: 1,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#e2e8f0',
    letterSpacing: '0.06em',
  },
  hint: {
    fontSize: '0.78rem',
    color: '#64748b',
    lineHeight: 1.5,
    margin: 0,
  },
  link: {
    color: '#1677ff',
    textDecoration: 'none',
  },

  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 44px 12px 14px',
    background: 'rgba(8,11,18,0.8)',
    border: '1.5px solid rgba(230,36,41,0.35)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '0.85rem',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    letterSpacing: '0.03em',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },

  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.35)',
    borderRadius: '8px',
    color: '#4ade80',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '0.78rem',
    lineHeight: 1.5,
  },

  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
  },

  btnRow: {
    display: 'flex',
    gap: '10px',
  },
  testBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '11px 0',
    background: 'rgba(230,36,41,0.1)',
    border: '1px solid rgba(230,36,41,0.4)',
    borderRadius: '10px',
    color: '#f87171',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  confirmBtn: {
    flex: 1.4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '11px 0',
    background: 'linear-gradient(135deg, #e62429, #c41f24)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 700,
    fontFamily: 'inherit',
    letterSpacing: '0.03em',
    boxShadow: '0 4px 20px rgba(230,36,41,0.35)',
    transition: 'all 0.2s',
  },

  secNote: {
    fontSize: '0.68rem',
    color: '#374151',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.5,
  },

  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  featureChip: {
    padding: '5px 12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    fontSize: '0.7rem',
    color: '#64748b',
  },
};
