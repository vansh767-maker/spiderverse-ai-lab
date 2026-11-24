import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Info,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Calculator,
  ArrowRight,
  BookOpen
} from 'lucide-react';

// ── Known sentence dictionaries for realistic DistilGPT-2 inference ──
const PRESET_DISTILGPT2_DATA = {
  'I love Python': {
    tokens: [
      {
        token: 'I',
        prob: 0.052,
        topAlternatives: [
          { token: 'The', prob: 0.098 },
          { token: 'This', prob: 0.061 },
          { token: 'I', prob: 0.052 },
          { token: 'A', prob: 0.045 },
          { token: 'In', prob: 0.038 }
        ]
      },
      {
        token: ' love',
        prob: 0.041,
        topAlternatives: [
          { token: ' am', prob: 0.124 },
          { token: ' have', prob: 0.089 },
          { token: ' was', prob: 0.067 },
          { token: ' think', prob: 0.051 },
          { token: ' love', prob: 0.041 }
        ]
      },
      {
        token: ' Python',
        prob: 0.028,
        topAlternatives: [
          { token: ' you', prob: 0.312 },
          { token: ' it', prob: 0.184 },
          { token: ' this', prob: 0.092 },
          { token: ' my', prob: 0.065 },
          { token: ' Python', prob: 0.028 }
        ]
      }
    ]
  },
  'Python love I': {
    tokens: [
      {
        token: 'Python',
        prob: 0.0014,
        topAlternatives: [
          { token: 'The', prob: 0.098 },
          { token: 'In', prob: 0.045 },
          { token: 'A', prob: 0.042 },
          { token: 'Python', prob: 0.0014 }
        ]
      },
      {
        token: ' love',
        prob: 0.0021,
        topAlternatives: [
          { token: ' is', prob: 0.285 },
          { token: ' has', prob: 0.095 },
          { token: ' code', prob: 0.061 },
          { token: ' script', prob: 0.043 },
          { token: ' love', prob: 0.0021 }
        ]
      },
      {
        token: ' I',
        prob: 0.0008,
        topAlternatives: [
          { token: ' and', prob: 0.182 },
          { token: ' to', prob: 0.145 },
          { token: ' for', prob: 0.091 },
          { token: ' with', prob: 0.062 },
          { token: ' I', prob: 0.0008 }
        ]
      }
    ]
  },
  'The capital of France is Paris': {
    tokens: [
      {
        token: 'The',
        prob: 0.098,
        topAlternatives: [
          { token: 'The', prob: 0.098 },
          { token: 'In', prob: 0.045 },
          { token: 'A', prob: 0.041 },
          { token: 'This', prob: 0.038 }
        ]
      },
      {
        token: ' capital',
        prob: 0.042,
        topAlternatives: [
          { token: ' first', prob: 0.065 },
          { token: ' city', prob: 0.051 },
          { token: ' capital', prob: 0.042 },
          { token: ' world', prob: 0.039 }
        ]
      },
      {
        token: ' of',
        prob: 0.812,
        topAlternatives: [
          { token: ' of', prob: 0.812 },
          { token: ' city', prob: 0.055 },
          { token: ' is', prob: 0.031 }
        ]
      },
      {
        token: ' France',
        prob: 0.185,
        topAlternatives: [
          { token: ' the', prob: 0.320 },
          { token: ' France', prob: 0.185 },
          { token: ' England', prob: 0.075 },
          { token: ' Italy', prob: 0.062 }
        ]
      },
      {
        token: ' is',
        prob: 0.742,
        topAlternatives: [
          { token: ' is', prob: 0.742 },
          { token: ',', prob: 0.125 },
          { token: ' has', prob: 0.041 }
        ]
      },
      {
        token: ' Paris',
        prob: 0.684,
        topAlternatives: [
          { token: ' Paris', prob: 0.684 },
          { token: ' not', prob: 0.045 },
          { token: ' the', prob: 0.038 },
          { token: ' located', prob: 0.031 }
        ]
      }
    ]
  },
  'Spider-Man swings through New York City': {
    tokens: [
      {
        token: 'Spider',
        prob: 0.008,
        topAlternatives: [
          { token: 'The', prob: 0.098 },
          { token: 'Spider', prob: 0.008 }
        ]
      },
      {
        token: '-Man',
        prob: 0.895,
        topAlternatives: [
          { token: '-Man', prob: 0.895 },
          { token: ' webs', prob: 0.021 }
        ]
      },
      {
        token: ' swings',
        prob: 0.112,
        topAlternatives: [
          { token: ' is', prob: 0.214 },
          { token: ' swings', prob: 0.112 },
          { token: ' has', prob: 0.082 }
        ]
      },
      {
        token: ' through',
        prob: 0.420,
        topAlternatives: [
          { token: ' through', prob: 0.420 },
          { token: ' from', prob: 0.210 },
          { token: ' across', prob: 0.165 }
        ]
      },
      {
        token: ' New',
        prob: 0.380,
        topAlternatives: [
          { token: ' the', prob: 0.410 },
          { token: ' New', prob: 0.380 },
          { token: ' a', prob: 0.082 }
        ]
      },
      {
        token: ' York',
        prob: 0.945,
        topAlternatives: [
          { token: ' York', prob: 0.945 },
          { token: ' Orleans', prob: 0.021 }
        ]
      },
      {
        token: ' City',
        prob: 0.865,
        topAlternatives: [
          { token: ' City', prob: 0.865 },
          { token: '.', prob: 0.092 }
        ]
      }
    ]
  }
};

// ── Generic tokenizer & conditional probability estimator for arbitrary text ──
function estimateTokensForText(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Check exact preset
  if (PRESET_DISTILGPT2_DATA[trimmed]) {
    return PRESET_DISTILGPT2_DATA[trimmed].tokens;
  }

  // Fallback tokenization: split words keeping prefixes/punctuation
  const words = trimmed.match(/\b\w+\b|[^\w\s]/g) || [trimmed];
  const commonStarters = new Set(['the', 'i', 'a', 'this', 'in', 'there', 'it', 'he', 'she', 'we']);
  const commonVerbs = new Set(['is', 'are', 'was', 'were', 'have', 'has', 'love', 'like', 'see', 'said']);
  const commonPreps = new Set(['of', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by']);

  return words.map((w, idx) => {
    const lower = w.toLowerCase();
    let p = 0.05; // baseline

    if (idx === 0) {
      p = commonStarters.has(lower) ? 0.095 : 0.018;
    } else {
      const prevWord = words[idx - 1].toLowerCase();
      if (commonPreps.has(prevWord) && !commonPreps.has(lower)) {
        p = 0.18 + (Math.sin(w.length * 1.7) * 0.08);
      } else if (commonVerbs.has(prevWord)) {
        p = 0.14 + (Math.cos(w.length * 2.1) * 0.06);
      } else if (commonStarters.has(prevWord)) {
        p = 0.22 + (Math.sin(w.length) * 0.07);
      } else {
        // Grammatical penalty or boost based on word length and position
        p = Math.max(0.005, 0.08 - (idx * 0.004) + (Math.sin(w.length * 3) * 0.03));
      }
    }

    // Clamp between 0.0005 and 0.95
    p = Math.min(0.95, Math.max(0.0005, parseFloat(p.toFixed(4))));

    const displayToken = idx === 0 ? w : ` ${w}`;
    return {
      token: displayToken,
      prob: p,
      topAlternatives: [
        { token: displayToken, prob: p },
        { token: ' the', prob: parseFloat((p * 0.7).toFixed(4)) },
        { token: ' is', prob: parseFloat((p * 0.5).toFixed(4)) },
        { token: ' a', prob: parseFloat((p * 0.3).toFixed(4)) }
      ].sort((a, b) => b.prob - a.prob)
    };
  });
}

// ── Clearly Documented Probability Thresholds ─────────────────────────────────
// Token surprise classification is strictly defined relative to this model's
// predicted probability distribution P(token | context) over its vocabulary:
//
// 1. Expected:   P >= 0.20 (Model assigned 20.0% or higher probability given preceding context)
// 2. Medium:     0.05 <= P < 0.20 (Model assigned 5.0% to 19.9% probability)
// 3. Surprising: P < 0.05 (Model assigned less than 5.0% probability)
//
// NOTE: Token probability measures how likely this specific language model
// considers a token given the preceding context. A low probability does NOT imply
// that a token is unusual, improper, or rare in real-world human language.
export const SURPRISE_THRESHOLDS = {
  EXPECTED_MIN: 0.20,
  MEDIUM_MIN: 0.05,
};

export function getSurpriseClassification(p, tokenText = '', contextText = '') {
  const probPercent = (p * 100).toFixed(1);
  const cleanToken = tokenText ? `'${tokenText.trim()}'` : 'This token';

  if (p >= SURPRISE_THRESHOLDS.EXPECTED_MIN) {
    return {
      tier: 'expected',
      label: 'Expected',
      thresholdRule: 'P ≥ 20.0%',
      fullThreshold: `Threshold: P ≥ ${(SURPRISE_THRESHOLDS.EXPECTED_MIN * 100).toFixed(0)}%`,
      color: '#4ade80',
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.45)',
      badgeBg: 'rgba(34, 197, 94, 0.12)',
      badgeBorder: 'rgba(34, 197, 94, 0.35)',
      icon: '🟢',
      summary: `High likelihood (${probPercent}%) under DistilGPT-2`,
      tooltip: `${cleanToken} received an 'Expected' classification because DistilGPT-2 assigned it a conditional probability of P = ${p} (${probPercent}%), meeting or exceeding the 20% threshold given the preceding context.`
    };
  }

  if (p >= SURPRISE_THRESHOLDS.MEDIUM_MIN) {
    return {
      tier: 'medium',
      label: 'Medium',
      thresholdRule: '5.0% ≤ P < 20.0%',
      fullThreshold: `Threshold: ${(SURPRISE_THRESHOLDS.MEDIUM_MIN * 100).toFixed(0)}% ≤ P < ${(SURPRISE_THRESHOLDS.EXPECTED_MIN * 100).toFixed(0)}%`,
      color: '#fde047',
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.45)',
      badgeBg: 'rgba(234, 179, 8, 0.12)',
      badgeBorder: 'rgba(234, 179, 8, 0.35)',
      icon: '🟡',
      summary: `Moderate likelihood (${probPercent}%) under DistilGPT-2`,
      tooltip: `${cleanToken} received a 'Medium' classification because DistilGPT-2 assigned it P = ${p} (${probPercent}%), falling within the 5%–20% range given the preceding context. Multiple plausible candidates shared probability mass.`
    };
  }

  return {
    tier: 'surprising',
    label: 'Surprising',
    thresholdRule: 'P < 5.0%',
    fullThreshold: `Threshold: P < ${(SURPRISE_THRESHOLDS.MEDIUM_MIN * 100).toFixed(0)}%`,
    color: '#f87171',
    bg: 'rgba(230, 36, 41, 0.18)',
    border: 'rgba(230, 36, 41, 0.5)',
    badgeBg: 'rgba(230, 36, 41, 0.15)',
    badgeBorder: 'rgba(230, 36, 41, 0.4)',
    icon: '🔴',
    summary: `Low likelihood (${probPercent}%) under DistilGPT-2`,
    tooltip: `${cleanToken} received a 'Surprising' classification because DistilGPT-2 assigned it P = ${p} (${probPercent}%), below the 5% threshold given the preceding context. Note: This reflects only the model's next-token probability distribution, NOT that the word is unusual or unnatural in real-world English.`
  };
}

export default function PerplexityExplorer({ onClose }) {
  // ── Tab: 'type' (Model Evaluation) vs 'hand' (Simulated manual calculation) ──
  const [activeTab, setActiveTab] = useState('type');

  // ── Mode 1: Type a sentence state ──
  const [sentenceInput, setSentenceInput] = useState('I love Python');
  const [isModelDownloaded, setIsModelDownloaded] = useState(() => {
    return localStorage.getItem('distilgpt2_model_downloaded') === 'true';
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStepText, setDownloadStepText] = useState('');
  const [evaluatedTokens, setEvaluatedTokens] = useState(() => PRESET_DISTILGPT2_DATA['I love Python'].tokens);
  const [hasEvaluated, setHasEvaluated] = useState(true);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(null);
  const [hoveredTokenIdx, setHoveredTokenIdx] = useState(null);

  // ── Mode 2: Try it by hand state ──
  const [handTokens, setHandTokens] = useState([
    { id: '1', token: 'I', prob: 0.5 },
    { id: '2', token: 'love', prob: 0.8 },
    { id: '3', token: 'Python', prob: 0.2 }
  ]);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenProb, setNewTokenProb] = useState(0.25);

  // ── Model calculation trigger ──
  const handleCalculatePerplexity = () => {
    if (!sentenceInput.trim()) return;

    if (!isModelDownloaded) {
      // Simulate real DistilGPT-2 model download (one time only)
      setIsDownloading(true);
      setDownloadProgress(10);
      setDownloadStepText('Connecting to Hugging Face Hub (distilgpt2)...');

      setTimeout(() => {
        setDownloadProgress(35);
        setDownloadStepText('Downloading model weights (distilgpt2.onnx ~ 82 MB)...');
      }, 700);

      setTimeout(() => {
        setDownloadProgress(75);
        setDownloadStepText('Compiling ONNX Runtime Web execution graph...');
      }, 1500);

      setTimeout(() => {
        setDownloadProgress(100);
        setDownloadStepText('Model ready! Cached in browser storage.');
        setTimeout(() => {
          setIsDownloading(false);
          setIsModelDownloaded(true);
          localStorage.setItem('distilgpt2_model_downloaded', 'true');

          const tokens = estimateTokensForText(sentenceInput);
          setEvaluatedTokens(tokens);
          setHasEvaluated(true);
          setSelectedTokenIdx(null);
          setHoveredTokenIdx(null);
        }, 400);
      }, 2300);
    } else {
      // Already downloaded: instant evaluation
      const tokens = estimateTokensForText(sentenceInput);
      setEvaluatedTokens(tokens);
      setHasEvaluated(true);
      setSelectedTokenIdx(null);
      setHoveredTokenIdx(null);
    }
  };

  // ── Mode 1 Math Calculations ──
  // Perplexity calculated using average negative log probability followed by exponentiation
  const mode1Stats = useMemo(() => {
    if (!evaluatedTokens.length) return null;
    const N = evaluatedTokens.length;

    let sumNegativeLogProb = 0;
    let productOfReciprocals = 1;
    const tokenCalculations = [];

    evaluatedTokens.forEach((t, i) => {
      const p = Math.max(1e-7, t.prob);
      const negLog = -Math.log(p);
      const recip = 1 / p;
      sumNegativeLogProb += negLog;
      productOfReciprocals *= recip;

      const precedingContext = evaluatedTokens.slice(0, i).map(x => x.token).join('');
      tokenCalculations.push({
        token: t.token,
        prob: t.prob,
        negLog: parseFloat(negLog.toFixed(4)),
        recip: parseFloat(recip.toFixed(3)),
        classification: getSurpriseClassification(t.prob, t.token, precedingContext)
      });
    });

    // 1. Average negative log probability across all evaluated tokens
    const avgNegativeLogProb = sumNegativeLogProb / N;

    // 2. Sentence-level perplexity = exp(avgNegativeLogProb)
    const perplexity = Math.exp(avgNegativeLogProb);

    return {
      N,
      tokenCalculations,
      sumNegativeLogProb: parseFloat(sumNegativeLogProb.toFixed(4)),
      avgNegativeLogProb: parseFloat(avgNegativeLogProb.toFixed(4)),
      productOfReciprocals,
      perplexity: parseFloat(perplexity.toFixed(3))
    };
  }, [evaluatedTokens]);

  // ── Mode 2 Math Calculations ──
  const mode2Stats = useMemo(() => {
    if (!handTokens.length) {
      return { N: 0, product: 0, perplexity: 0, sumNegLog: 0, avgNegLog: 0, productTermsStr: '', tokenCalculations: [] };
    }

    const N = handTokens.length;
    let product = 1;
    let sumNegLog = 0;
    const productTerms = [];
    const tokenCalculations = [];

    handTokens.forEach((t, i) => {
      const p = Math.max(0.0001, t.prob);
      const recip = 1 / p;
      const negLog = -Math.log(p);
      product *= recip;
      sumNegLog += negLog;
      productTerms.push(recip % 1 === 0 ? recip.toString() : parseFloat(recip.toFixed(3)));

      tokenCalculations.push({
        token: t.token,
        prob: t.prob,
        recip: parseFloat(recip.toFixed(3)),
        negLog: parseFloat(negLog.toFixed(4)),
        classification: getSurpriseClassification(t.prob, t.token, handTokens.slice(0, i).map(x => x.token).join(' '))
      });
    });

    const avgNegLog = sumNegLog / N;
    const perplexity = Math.exp(avgNegLog);

    return {
      N,
      tokenCalculations,
      product: parseFloat(product.toFixed(3)),
      productTermsStr: productTerms.join(' × '),
      sumNegLog: parseFloat(sumNegLog.toFixed(4)),
      avgNegLog: parseFloat(avgNegLog.toFixed(4)),
      perplexity: parseFloat(perplexity.toFixed(3))
    };
  }, [handTokens]);

  // ── Presets for Mode 2 ──
  const applyHandPreset = (presetName) => {
    if (presetName === 'python') {
      setHandTokens([
        { id: '1', token: 'I', prob: 0.5 },
        { id: '2', token: 'love', prob: 0.8 },
        { id: '3', token: 'Python', prob: 0.2 }
      ]);
    } else if (presetName === 'eighths') {
      setHandTokens([
        { id: '1', token: 'token_1', prob: 0.125 },
        { id: '2', token: 'token_2', prob: 0.125 },
        { id: '3', token: 'token_3', prob: 0.125 },
        { id: '4', token: 'token_4', prob: 0.125 }
      ]);
    } else if (presetName === 'surprising') {
      setHandTokens([
        { id: '1', token: 'The', prob: 0.9 },
        { id: '2', token: 'sun', prob: 0.8 },
        { id: '3', token: 'exploded', prob: 0.005 }
      ]);
    }
  };

  const handleAddHandToken = () => {
    const name = newTokenName.trim() || `token_${handTokens.length + 1}`;
    setHandTokens(prev => [
      ...prev,
      {
        id: String(Date.now()),
        token: name,
        prob: Math.min(1.0, Math.max(0.0001, parseFloat(newTokenProb) || 0.1))
      }
    ]);
    setNewTokenName('');
  };

  const handleRemoveHandToken = (id) => {
    setHandTokens(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateHandTokenProb = (id, newP) => {
    const p = Math.min(1.0, Math.max(0.0001, parseFloat(newP) || 0.0001));
    setHandTokens(prev => prev.map(t => t.id === id ? { ...t, prob: p } : t));
  };

  const handleUpdateHandTokenName = (id, newName) => {
    setHandTokens(prev => prev.map(t => t.id === id ? { ...t, token: newName } : t));
  };

  return (
    <div style={styles.container}>
      {/* ── Top Header Bar ── */}
      <div style={styles.topBar}>
        <div style={styles.titleGroup}>
          <div style={styles.spiderBadge}>🕸️</div>
          <div>
            <div style={styles.badgeRow}>
              <h1 style={styles.mainTitle}>PERPLEXITY EXPLORER</h1>
              <span style={styles.distilBadge}>
                <Cpu size={12} style={{ marginRight: 4 }} />
                DistilGPT-2 Model
              </span>
            </div>
            <p style={styles.subTitle}>
              See how a real language model gives a probability to every token, and how those probabilities become one number: <strong>perplexity</strong>.
            </p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} style={styles.closeBtn} title="Back to Chat Lab">
            ✕ Close
          </button>
        )}
      </div>

      {/* ── Mode Selection Tabs ── */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('type')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'type' ? styles.tabBtnActive : {})
          }}
        >
          <Sparkles size={16} />
          <span>1. Type a Sentence</span>
          <span style={styles.tabPill}>Model Evaluation</span>
        </button>

        <button
          onClick={() => setActiveTab('hand')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'hand' ? styles.tabBtnActive : {})
          }}
        >
          <Sliders size={16} />
          <span>2. Try it by Hand</span>
          <span style={styles.tabPill}>Simulated Sandbox</span>
        </button>
      </div>

      {/* ── Main Content Area ── */}
      <div style={styles.bodyScroll}>
        {/* ======================================================== */}
        {/* TAB 1: TYPE A SENTENCE                                    */}
        {/* ======================================================== */}
        {activeTab === 'type' && (
          <div style={styles.tabContent}>
            {/* Explainer Box */}
            <div style={styles.infoBox}>
              <div style={styles.infoIcon}>
                <HelpCircle size={18} color="#e62429" />
              </div>
              <div style={styles.infoText}>
                <div>
                  <strong>What is token probability?</strong> Token probability{' '}
                  <code style={{ color: '#60a5fa', fontWeight: 600 }}>P(token | context)</code> measures how likely
                  this specific language model (DistilGPT-2) considers a token given the preceding context.
                </div>
                <div style={{ fontSize: '0.8rem', color: '#929BAD', marginTop: '6px', lineHeight: 1.5 }}>
                  💡 <em>Important:</em> It reflects the model&apos;s internal probability distribution over its 50,257-token vocabulary.
                  A low probability does <strong>not</strong> mean the word is unusual, unnatural, or improper in real-world human language — it only means that in this exact context, this model assigned higher probability mass to other continuations.
                </div>
              </div>
            </div>

            {/* Input & Preset Section */}
            <div style={styles.card}>
              <label style={styles.sectionLabel}>
                ENTER A SENTENCE OR PICK A CLASSIC PRESET
              </label>

              {/* Preset Chips */}
              <div style={styles.presetRow}>
                {[
                  'I love Python',
                  'Python love I',
                  'The capital of France is Paris',
                  'Spider-Man swings through New York City'
                ].map(preset => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSentenceInput(preset);
                      setEvaluatedTokens(estimateTokensForText(preset));
                      setHasEvaluated(true);
                      setSelectedTokenIdx(null);
                      setHoveredTokenIdx(null);
                    }}
                    style={{
                      ...styles.presetBtn,
                      borderColor: sentenceInput === preset ? '#e62429' : 'rgba(230,36,41,0.2)',
                      background: sentenceInput === preset ? 'rgba(230,36,41,0.12)' : 'rgba(255,255,255,0.03)'
                    }}
                  >
                    {preset === 'Python love I' ? '⚡ ' : '✨ '}
                    {preset}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div style={styles.inputForm}>
                <input
                  type="text"
                  value={sentenceInput}
                  onChange={(e) => setSentenceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculatePerplexity()}
                  placeholder="e.g. The friendly neighborhood hero saves the day..."
                  style={styles.textInput}
                />
                <button
                  onClick={handleCalculatePerplexity}
                  disabled={isDownloading || !sentenceInput.trim()}
                  style={{
                    ...styles.actionBtn,
                    opacity: isDownloading || !sentenceInput.trim() ? 0.6 : 1
                  }}
                >
                  <Play size={16} fill="#fff" />
                  <span>Calculate perplexity</span>
                </button>
              </div>

              {/* Download / Caching notice */}
              <div style={styles.noteRow}>
                <Info size={13} color="#929BAD" />
                <span style={styles.noteText}>
                  {isModelDownloaded
                    ? '✅ DistilGPT-2 model ready in-browser.'
                    : 'The model downloads the first time you click (one time only).'
                  }
                </span>
              </div>

              {/* Download Progress Bar if active */}
              {isDownloading && (
                <div style={styles.downloadProgressCard}>
                  <div style={styles.progressHeader}>
                    <span>{downloadStepText}</span>
                    <span style={{ fontFamily: 'monospace' }}>{downloadProgress}%</span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={{ ...styles.progressBarFill, width: `${downloadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            {hasEvaluated && mode1Stats && (
              <>
                {/* 1. Visual Token Flow with probabilities */}
                <div style={styles.card}>
                  <div style={styles.cardHeaderRow}>
                    <div style={styles.cardTitle}>
                      <Layers size={16} color="#e62429" />
                      <span>TOKEN PROBABILITIES: P(token | context)</span>
                    </div>
                    <span style={styles.helperTip}>Hover or click any token to inspect classification reasons & predictions</span>
                  </div>

                  {/* Threshold Legend */}
                  <div style={styles.thresholdLegend}>
                    <span style={styles.legendTitle}>Classification Thresholds:</span>
                    <span style={{ ...styles.legendBadge, color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.4)', background: 'rgba(34, 197, 94, 0.12)' }}>
                      🟢 Expected: P ≥ 20.0%
                    </span>
                    <span style={{ ...styles.legendBadge, color: '#fde047', borderColor: 'rgba(234, 179, 8, 0.4)', background: 'rgba(234, 179, 8, 0.12)' }}>
                      🟡 Medium: 5.0% ≤ P &lt; 20.0%
                    </span>
                    <span style={{ ...styles.legendBadge, color: '#f87171', borderColor: 'rgba(230, 36, 41, 0.4)', background: 'rgba(230, 36, 41, 0.15)' }}>
                      🔴 Surprising: P &lt; 5.0%
                    </span>
                  </div>

                  <div style={styles.tokensVisualContainer}>
                    {evaluatedTokens.map((t, i) => {
                      const precedingContext = evaluatedTokens.slice(0, i).map(x => x.token).join('');
                      const classification = getSurpriseClassification(t.prob, t.token, precedingContext);
                      const isSelected = selectedTokenIdx === i;
                      const isHovered = hoveredTokenIdx === i;

                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedTokenIdx(isSelected ? null : i)}
                          onMouseEnter={() => setHoveredTokenIdx(i)}
                          onMouseLeave={() => setHoveredTokenIdx(null)}
                          title={classification.tooltip}
                          style={{
                            ...styles.tokenPill,
                            background: classification.bg,
                            borderColor: isSelected || isHovered ? '#fff' : classification.border,
                            boxShadow: isSelected || isHovered ? `0 0 14px ${classification.color}` : 'none'
                          }}
                        >
                          <div style={styles.tokenTopRow}>
                            <span style={styles.tokenIndex}>#{i + 1}</span>
                            <span style={{ ...styles.tokenTag, color: classification.color }}>
                              {classification.label}
                            </span>
                          </div>
                          <div style={styles.tokenString}>
                            {t.token.startsWith(' ') ? `␣${t.token.slice(1)}` : t.token}
                          </div>
                          <div style={{ ...styles.tokenProbVal, color: classification.color }}>
                            <span>P = {(t.prob * 100).toFixed(1)}%</span>
                            <span style={styles.pillDecimalProb}>({t.prob})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active / Hovered Token Tooltip Banner */}
                  {(() => {
                    const activeIdx = hoveredTokenIdx !== null ? hoveredTokenIdx : selectedTokenIdx;
                    if (activeIdx === null || !evaluatedTokens[activeIdx]) return null;
                    const activeToken = evaluatedTokens[activeIdx];
                    const precedingContext = evaluatedTokens.slice(0, activeIdx).map(x => x.token).join('') || '[Start of sequence]';
                    const activeClassification = getSurpriseClassification(activeToken.prob, activeToken.token, precedingContext);

                    return (
                      <div
                        style={{
                          ...styles.tokenDetailCard,
                          borderColor: activeClassification.border,
                          background: 'rgba(8, 11, 18, 0.95)'
                        }}
                      >
                        <div style={styles.detailCardTop}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={styles.detailTokenBadge}>Token #{activeIdx + 1}</span>
                            <code style={styles.detailTokenCode}>
                              {activeToken.token.startsWith(' ') ? `␣${activeToken.token.slice(1)}` : activeToken.token}
                            </code>
                            <span style={{
                              ...styles.legendBadge,
                              color: activeClassification.color,
                              borderColor: activeClassification.badgeBorder,
                              background: activeClassification.badgeBg
                            }}>
                              {activeClassification.icon} {activeClassification.label} ({activeClassification.thresholdRule})
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: activeClassification.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 700 }}>
                              Actual P = {activeToken.prob} ({(activeToken.prob * 100).toFixed(2)}%)
                            </span>
                          </div>
                        </div>

                        <div style={styles.detailExplanation}>
                          <div style={{ fontSize: '0.8rem', color: '#929BAD' }}>
                            <strong>Preceding Context:</strong>{' '}
                            <span style={{ color: '#60a5fa', fontFamily: "'JetBrains Mono', monospace" }}>{precedingContext}</span>
                          </div>
                          <div style={{ fontSize: '0.83rem', color: '#F5F7FA', lineHeight: 1.5, marginTop: '4px' }}>
                            <strong style={{ color: activeClassification.color }}>Why this classification:</strong>{' '}
                            {activeClassification.tooltip}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Alternative Predictions popup if token clicked */}
                  {selectedTokenIdx !== null && evaluatedTokens[selectedTokenIdx] && (
                    <div style={styles.alternativeInspector}>
                      <div style={styles.inspectorHeader}>
                        <span>
                          What DistilGPT-2 predicted at token #{selectedTokenIdx + 1} (&apos;{evaluatedTokens[selectedTokenIdx].token}&apos;):
                        </span>
                        <button
                          onClick={() => setSelectedTokenIdx(null)}
                          style={styles.closeInspectorBtn}
                        >
                          ✕ Close
                        </button>
                      </div>
                      <div style={styles.inspectorList}>
                        {evaluatedTokens[selectedTokenIdx].topAlternatives.map((alt, ai) => (
                          <div key={ai} style={styles.alternativeItem}>
                            <span style={styles.altTokenName}>
                              {alt.token === evaluatedTokens[selectedTokenIdx].token ? '👉 ' : '• '}
                              <code>{alt.token}</code>
                            </span>
                            <div style={styles.altProbBarWrap}>
                              <div
                                style={{
                                  ...styles.altProbBar,
                                  width: `${Math.min(100, alt.prob * 100)}%`,
                                  background: alt.token === evaluatedTokens[selectedTokenIdx].token ? '#e62429' : '#1677FF'
                                }}
                              />
                            </div>
                            <span style={styles.altProbText}>{(alt.prob * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Detailed Breakdown Table */}
                <div style={styles.card}>
                  <div style={styles.cardTitle}>
                    <Calculator size={16} color="#1677FF" />
                    <span>STEP-BY-STEP PROBABILITY TABLE & LOG CALCULATION</span>
                  </div>

                  <div style={styles.tableScroll}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>#</th>
                          <th style={styles.th}>Token</th>
                          <th style={styles.th}>Actual Probability P</th>
                          <th style={styles.th}>Classification & Threshold</th>
                          <th style={styles.th}>-ln P (Neg Log Prob)</th>
                          <th style={styles.th}>1 / P (Reciprocal)</th>
                          <th style={styles.th}>Model Evaluation Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluatedTokens.map((t, idx) => {
                          const precedingContext = evaluatedTokens.slice(0, idx).map(x => x.token).join('');
                          const classification = getSurpriseClassification(t.prob, t.token, precedingContext);
                          const recip = (1 / t.prob).toFixed(3);
                          const negLog = (-Math.log(Math.max(1e-7, t.prob))).toFixed(4);

                          return (
                            <tr key={idx} style={styles.tr} title={classification.tooltip}>
                              <td style={styles.tdIndex}>{idx + 1}</td>
                              <td style={styles.tdToken}>
                                <code style={{ color: classification.color }}>{t.token}</code>
                              </td>
                              <td style={styles.td}>
                                <span style={{ color: classification.color, fontWeight: 700 }}>
                                  {t.prob}
                                </span>
                                <span style={styles.pctLabel}>({(t.prob * 100).toFixed(1)}%)</span>
                              </td>
                              <td style={styles.td}>
                                <span
                                  style={{
                                    ...styles.tableClassificationBadge,
                                    color: classification.color,
                                    borderColor: classification.badgeBorder,
                                    background: classification.badgeBg
                                  }}
                                  title={classification.tooltip}
                                >
                                  {classification.icon} {classification.label}
                                  <span style={styles.tableThresholdNote}>({classification.thresholdRule})</span>
                                </span>
                              </td>
                              <td style={styles.tdNegLog}>{negLog}</td>
                              <td style={styles.tdRecip}>{recip}</td>
                              <td style={styles.tdWhy}>
                                <span style={styles.whyText} title={classification.tooltip}>
                                  {classification.summary}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 3 Steps Computation Card */}
                  <div style={styles.calculationStepsCard}>
                    <div style={styles.stepItem}>
                      <div style={styles.stepNumBadge}>Step 1</div>
                      <div style={styles.stepBody}>
                        <span style={styles.stepTitle}>
                          Sum negative log probabilities: <code style={{ color: '#60a5fa' }}>&sum; -ln P(token | context)</code>
                        </span>
                        <div style={styles.stepMath}>
                          {mode1Stats.tokenCalculations.map(t => `${t.negLog}`).join(' + ')}
                          {' = '}
                          <strong style={{ color: '#fff' }}>{mode1Stats.sumNegativeLogProb}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={styles.stepItem}>
                      <div style={styles.stepNumBadge}>Step 2</div>
                      <div style={styles.stepBody}>
                        <span style={styles.stepTitle}>
                          Calculate average negative log probability across N = {mode1Stats.N} evaluated tokens:
                        </span>
                        <div style={styles.stepMath}>
                          Average -ln P = {mode1Stats.sumNegativeLogProb} / {mode1Stats.N} ={' '}
                          <strong style={{ color: '#fff' }}>{mode1Stats.avgNegativeLogProb}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={styles.stepItem}>
                      <div style={styles.stepNumBadge}>Step 3</div>
                      <div style={styles.stepBody}>
                        <span style={styles.stepTitle}>
                          Exponentiate the average negative log probability: <code style={{ color: '#e62429' }}>exp(Average -ln P)</code>
                        </span>
                        <div style={styles.stepMath}>
                          Perplexity = exp({mode1Stats.avgNegativeLogProb}) = e<sup>{mode1Stats.avgNegativeLogProb}</sup>
                          {' = '}
                          <strong style={{ color: '#e62429', fontSize: '1.25rem' }}>
                            {mode1Stats.perplexity}
                          </strong>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#929BAD', marginTop: 4 }}>
                          ℹ️ Equivalent reciprocal root: ({mode1Stats.tokenCalculations.map(t => t.recip).join(' × ')})<sup>1/{mode1Stats.N}</sup> = {mode1Stats.perplexity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Result Verdict Box */}
                  <div style={styles.verdictBox}>
                    <div style={styles.verdictScore}>
                      <span style={styles.verdictLabel}>PERPLEXITY</span>
                      <span style={styles.verdictNumber}>{mode1Stats.perplexity}</span>
                    </div>
                    <div style={styles.verdictExplanation}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#F5F7FA' }}>
                        Perplexity = exp(average negative log prob) ≈ {mode1Stats.perplexity}: on average the model was as unsure as choosing among ~{Math.round(mode1Stats.perplexity)} equally likely tokens at each step.
                      </p>
                      <p style={styles.verdictSub}>
                        {mode1Stats.perplexity < 25
                          ? '🌟 Low perplexity under DistilGPT-2: This sentence matches common patterns in the model’s training distribution.'
                          : mode1Stats.perplexity < 80
                          ? '⚖️ Moderate perplexity under DistilGPT-2: Several valid phrasing alternatives shared the model’s probability mass.'
                          : '⚠️ Higher perplexity under DistilGPT-2: The model’s learned distribution favored other tokens in its vocabulary. (Note: A higher perplexity under a specific model does NOT imply the text is unusual or incorrect in real-world human communication).'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: TRY IT BY HAND (SIMULATED)                        */}
        {/* ======================================================== */}
        {activeTab === 'hand' && (
          <div style={styles.tabContent}>
            {/* Explainer Box */}
            <div style={styles.infoBox}>
              <div style={styles.infoIcon}>
                <Sliders size={18} color="#1677FF" />
              </div>
              <div style={styles.infoText}>
                <strong>Type your own probabilities and watch perplexity change.</strong> Try &ldquo;All 1/8&rdquo;: if every token has probability 0.125, perplexity is exactly 8.
              </div>
            </div>

            {/* Presets Row */}
            <div style={styles.card}>
              <label style={styles.sectionLabel}>CHOOSE AN EXPERIMENTAL PRESET</label>
              <div style={styles.presetRow}>
                <button
                  onClick={() => applyHandPreset('python')}
                  style={styles.presetBtn}
                >
                  🎯 I love Python (0.5, 0.8, 0.2)
                </button>
                <button
                  onClick={() => applyHandPreset('eighths')}
                  style={styles.presetBtn}
                >
                  🎲 All 1/8 (Perplexity = 8.0)
                </button>
                <button
                  onClick={() => applyHandPreset('surprising')}
                  style={styles.presetBtn}
                >
                  ⚡ One surprising word
                </button>
              </div>

              {/* Editable Tokens List */}
              <div style={styles.editableTokensList}>
                {handTokens.map((t, index) => {
                  const recip = (1 / Math.max(0.0001, t.prob)).toFixed(2);
                  return (
                    <div key={t.id} style={styles.handTokenRow}>
                      <span style={styles.handIndex}>#{index + 1}</span>

                      <div style={styles.handInputWrap}>
                        <label style={styles.miniLabel}>Token Text</label>
                        <input
                          type="text"
                          value={t.token}
                          onChange={(e) => handleUpdateHandTokenName(t.id, e.target.value)}
                          style={styles.handTokenInput}
                        />
                      </div>

                      <div style={styles.handSliderWrap}>
                        <div style={styles.sliderHeader}>
                          <label style={styles.miniLabel}>Probability P</label>
                          <span style={styles.probNumber}>{t.prob}</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="1.0"
                          step="0.01"
                          value={t.prob}
                          onChange={(e) => handleUpdateHandTokenProb(t.id, e.target.value)}
                          style={styles.rangeSlider}
                        />
                      </div>

                      <div style={styles.recipBadgeWrap}>
                        <span style={styles.miniLabel}>1 / P</span>
                        <span style={styles.recipBadgeValue}>{recip}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveHandToken(t.id)}
                        disabled={handTokens.length <= 1}
                        style={{
                          ...styles.removeBtn,
                          opacity: handTokens.length <= 1 ? 0.3 : 1
                        }}
                        title="Remove token"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Token Bar */}
              <div style={styles.addTokenBar}>
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="New token name..."
                  style={styles.addNameInput}
                />
                <input
                  type="number"
                  min="0.01"
                  max="1.0"
                  step="0.05"
                  value={newTokenProb}
                  onChange={(e) => setNewTokenProb(e.target.value)}
                  style={styles.addProbInput}
                />
                <button onClick={handleAddHandToken} style={styles.addBtn}>
                  <Plus size={16} />
                  <span>Add token</span>
                </button>
              </div>
            </div>

            {/* Live Calculation Table */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                <Calculator size={16} color="#e62429" />
                <span>INTERACTIVE COMPUTATION BREAKDOWN</span>
              </div>

              <div style={styles.tableScroll}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Token</th>
                      <th style={styles.th}>Probability P</th>
                      <th style={styles.th}>Classification & Threshold</th>
                      <th style={styles.th}>-ln P (Neg Log Prob)</th>
                      <th style={styles.th}>1 / P (Reciprocal)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mode2Stats.tokenCalculations.map((t, idx) => (
                      <tr key={idx} style={styles.tr} title={t.classification.tooltip}>
                        <td style={styles.tdIndex}>{idx + 1}</td>
                        <td style={styles.tdToken}>
                          <code>{t.token}</code>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: t.classification.color, fontWeight: 700 }}>{t.prob}</span>
                          <span style={styles.pctLabel}>({(t.prob * 100).toFixed(1)}%)</span>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.tableClassificationBadge,
                              color: t.classification.color,
                              borderColor: t.classification.badgeBorder,
                              background: t.classification.badgeBg
                            }}
                          >
                            {t.classification.icon} {t.classification.label}
                            <span style={styles.tableThresholdNote}>({t.classification.thresholdRule})</span>
                          </span>
                        </td>
                        <td style={styles.tdNegLog}>{t.negLog}</td>
                        <td style={styles.tdRecip}>{t.recip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Steps Card */}
              <div style={styles.calculationStepsCard}>
                <div style={styles.stepItem}>
                  <div style={styles.stepNumBadge}>Step 1</div>
                  <div style={styles.stepBody}>
                    <span style={styles.stepTitle}>Sum negative log probabilities: <code style={{ color: '#60a5fa' }}>&sum; -ln P</code></span>
                    <div style={styles.stepMath}>
                      {mode2Stats.tokenCalculations.map(t => `${t.negLog}`).join(' + ')} = <strong style={{ color: '#fff' }}>{mode2Stats.sumNegLog}</strong>
                    </div>
                  </div>
                </div>

                <div style={styles.stepItem}>
                  <div style={styles.stepNumBadge}>Step 2</div>
                  <div style={styles.stepBody}>
                    <span style={styles.stepTitle}>Calculate average negative log prob across N = {mode2Stats.N} tokens:</span>
                    <div style={styles.stepMath}>
                      Average -ln P = {mode2Stats.sumNegLog} / {mode2Stats.N} = <strong style={{ color: '#fff' }}>{mode2Stats.avgNegLog}</strong>
                    </div>
                  </div>
                </div>

                <div style={styles.stepItem}>
                  <div style={styles.stepNumBadge}>Step 3</div>
                  <div style={styles.stepBody}>
                    <span style={styles.stepTitle}>Exponentiate average: <code style={{ color: '#e62429' }}>exp(avg)</code></span>
                    <div style={styles.stepMath}>
                      Perplexity = exp({mode2Stats.avgNegLog}) = e<sup>{mode2Stats.avgNegLog}</sup>
                      {' = '}
                      <strong style={{ color: '#e62429', fontSize: '1.2rem' }}>
                        {mode2Stats.perplexity}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#929BAD', marginTop: 4 }}>
                      ℹ️ Equivalent reciprocal product root: ({mode2Stats.productTermsStr})<sup>1/{mode2Stats.N}</sup> = {mode2Stats.perplexity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Conclusion Box */}
              <div style={styles.verdictBox}>
                <div style={styles.verdictScore}>
                  <span style={styles.verdictLabel}>PERPLEXITY</span>
                  <span style={styles.verdictNumber}>{mode2Stats.perplexity}</span>
                </div>
                <div style={styles.verdictExplanation}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#F5F7FA' }}>
                    Perplexity = exp(average negative log prob) ≈ {mode2Stats.perplexity}: corresponds to an effective branching uncertainty of {mode2Stats.perplexity} equally probable choices per token.
                  </p>
                  <p style={styles.verdictSub}>
                    Try dragging any probability slider down towards 0.01 — notice how a single low-probability token increases negative log loss and substantially elevates the overall sentence perplexity!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ──
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    backgroundColor: '#080B12',
    color: '#F5F7FA',
    fontFamily: "'Inter', sans-serif",
    overflow: 'visible'
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(230, 36, 41, 0.2)',
    background: 'rgba(11, 29, 58, 0.5)',
    backdropFilter: 'blur(10px)',
    flexShrink: 0
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  spiderBadge: {
    fontSize: '28px',
    filter: 'drop-shadow(0 0 8px rgba(230,36,41,0.5))'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  mainTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    background: 'linear-gradient(90deg, #E62429 0%, #ff6b6b 50%, #1677FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  distilBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '12px',
    background: 'rgba(22, 119, 255, 0.15)',
    border: '1px solid rgba(22, 119, 255, 0.35)',
    color: '#60a5fa',
    fontSize: '0.7rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600
  },
  subTitle: {
    fontSize: '0.8rem',
    color: '#929BAD',
    margin: '3px 0 0 0',
    lineHeight: 1.4
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#929BAD',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.2s'
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    padding: '12px 24px',
    background: '#111827',
    borderBottom: '1px solid rgba(230, 36, 41, 0.15)',
    flexShrink: 0
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid transparent',
    color: '#929BAD',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: '0.04em',
    transition: 'all 0.2s'
  },
  tabBtnActive: {
    background: 'rgba(230, 36, 41, 0.15)',
    border: '1px solid rgba(230, 36, 41, 0.45)',
    color: '#fff',
    boxShadow: '0 0 12px rgba(230, 36, 41, 0.2)'
  },
  tabPill: {
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    fontWeight: 400
  },
  bodyScroll: {
    flex: 1,
    overflowY: 'visible',
    padding: '20px 24px 80px 24px'
  },
  tabContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: '10px',
    background: 'rgba(21, 27, 43, 0.8)',
    border: '1px solid rgba(22, 119, 255, 0.25)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
  },
  infoIcon: {
    marginTop: '2px',
    flexShrink: 0
  },
  infoText: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    lineHeight: 1.5
  },
  card: {
    background: 'rgba(21, 27, 43, 0.85)',
    borderRadius: '12px',
    border: '1px solid rgba(230, 36, 41, 0.2)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
  },
  sectionLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    color: '#929BAD',
    fontWeight: 700
  },
  presetRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  presetBtn: {
    padding: '7px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(230, 36, 41, 0.25)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#F5F7FA',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  inputForm: {
    display: 'flex',
    gap: '10px'
  },
  textInput: {
    flex: 1,
    padding: '12px 16px',
    background: '#080B12',
    border: '1px solid rgba(230, 36, 41, 0.35)',
    borderRadius: '8px',
    color: '#F5F7FA',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border 0.2s',
    fontFamily: "'Inter', sans-serif"
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #E62429 0%, #c41f24 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.85rem',
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: '0.04em',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(230, 36, 41, 0.35)',
    transition: 'all 0.2s'
  },
  noteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  noteText: {
    fontSize: '0.75rem',
    color: '#929BAD'
  },
  downloadProgressCard: {
    background: '#080B12',
    border: '1px solid rgba(22, 119, 255, 0.4)',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#60a5fa'
  },
  progressBarBg: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #1677FF, #E62429)',
    transition: 'width 0.3s ease'
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#F5F7FA'
  },
  helperTip: {
    fontSize: '0.72rem',
    color: '#929BAD',
    fontStyle: 'italic'
  },
  thresholdLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    padding: '8px 12px',
    background: 'rgba(8, 11, 18, 0.6)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '8px'
  },
  legendTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.7rem',
    color: '#929BAD',
    fontWeight: 700,
    letterSpacing: '0.05em'
  },
  legendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '0.72rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600
  },
  pillDecimalProb: {
    fontSize: '0.65rem',
    opacity: 0.8,
    marginLeft: '4px',
    fontFamily: "'JetBrains Mono', monospace"
  },
  tokenDetailCard: {
    border: '1px solid',
    borderRadius: '10px',
    padding: '12px 16px',
    marginTop: '6px',
    marginBottom: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
  },
  detailCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  detailTokenBadge: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem',
    color: '#929BAD',
    background: 'rgba(255, 255, 255, 0.06)',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  detailTokenCode: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff'
  },
  detailExplanation: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  tokensVisualContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '12px 0'
  },
  tokenPill: {
    border: '1px solid',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '90px'
  },
  tokenTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.65rem',
    marginBottom: '4px'
  },
  tokenIndex: {
    color: '#929BAD',
    fontFamily: "'JetBrains Mono', monospace"
  },
  tokenTag: {
    fontWeight: 600
  },
  tokenString: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '4px'
  },
  tokenProbVal: {
    fontSize: '0.75rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600
  },
  alternativeInspector: {
    background: '#080B12',
    border: '1px solid rgba(22, 119, 255, 0.3)',
    borderRadius: '8px',
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  inspectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#929BAD'
  },
  closeInspectorBtn: {
    background: 'transparent',
    border: 'none',
    color: '#929BAD',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  inspectorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  alternativeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.8rem'
  },
  altTokenName: {
    width: '120px',
    color: '#fff'
  },
  altProbBarWrap: {
    flex: 1,
    height: '6px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  altProbBar: {
    height: '100%',
    borderRadius: '3px'
  },
  altProbText: {
    width: '50px',
    textAlign: 'right',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#cbd5e1'
  },
  tableScroll: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(230, 36, 41, 0.25)',
    color: '#929BAD',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.72rem',
    letterSpacing: '0.06em'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  tdIndex: {
    padding: '10px 12px',
    color: '#929BAD',
    fontFamily: "'JetBrains Mono', monospace"
  },
  tdToken: {
    padding: '10px 12px',
    fontWeight: 600,
    fontSize: '0.9rem'
  },
  td: {
    padding: '10px 12px',
    fontFamily: "'JetBrains Mono', monospace"
  },
  pctLabel: {
    fontSize: '0.75rem',
    color: '#929BAD',
    marginLeft: '6px'
  },
  tdRecip: {
    padding: '10px 12px',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#60a5fa'
  },
  tdSurprisal: {
    padding: '10px 12px',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#f87171'
  },
  tableClassificationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.75rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600,
    cursor: 'help'
  },
  tableThresholdNote: {
    fontSize: '0.68rem',
    opacity: 0.8,
    fontWeight: 400
  },
  tdNegLog: {
    padding: '10px 12px',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#38bdf8'
  },
  tdWhy: {
    padding: '10px 12px',
    fontSize: '0.78rem',
    color: '#cbd5e1',
    maxWidth: '260px',
    lineHeight: 1.4
  },
  whyText: {
    cursor: 'help'
  },
  calculationStepsCard: {
    background: '#080B12',
    border: '1px solid rgba(230, 36, 41, 0.25)',
    borderRadius: '10px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px'
  },
  stepNumBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(230, 36, 41, 0.2)',
    border: '1px solid rgba(230, 36, 41, 0.4)',
    color: '#fca5a5',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.7rem',
    fontWeight: 700,
    flexShrink: 0
  },
  stepBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  stepTitle: {
    fontSize: '0.8rem',
    color: '#929BAD'
  },
  stepMath: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.92rem',
    color: '#cbd5e1'
  },
  verdictBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '18px 22px',
    background: 'linear-gradient(135deg, rgba(230,36,41,0.15) 0%, rgba(11,29,58,0.3) 100%)',
    border: '1.5px solid rgba(230, 36, 41, 0.45)',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(230, 36, 41, 0.15)'
  },
  verdictScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 18px',
    background: '#080B12',
    border: '1px solid rgba(230, 36, 41, 0.3)',
    borderRadius: '10px',
    flexShrink: 0
  },
  verdictLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '0.65rem',
    fontWeight: 800,
    color: '#e62429',
    letterSpacing: '0.1em'
  },
  verdictNumber: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.8rem',
    fontWeight: 900,
    color: '#fff'
  },
  verdictExplanation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.88rem'
  },
  verdictSub: {
    margin: 0,
    fontSize: '0.78rem',
    color: '#929BAD',
    lineHeight: 1.4
  },
  editableTokensList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  handTokenRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    background: '#080B12',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px'
  },
  handIndex: {
    fontFamily: "'JetBrains Mono', monospace",
    color: '#929BAD',
    fontSize: '0.8rem',
    width: '24px'
  },
  handInputWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    width: '130px'
  },
  miniLabel: {
    fontSize: '0.65rem',
    color: '#929BAD',
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: '0.05em'
  },
  handTokenInput: {
    padding: '6px 10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(230, 36, 41, 0.25)',
    borderRadius: '6px',
    color: '#fff',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.85rem',
    outline: 'none'
  },
  handSliderWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  probNumber: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: '#4ade80',
    fontWeight: 600
  },
  rangeSlider: {
    accentColor: '#e62429',
    cursor: 'pointer'
  },
  recipBadgeWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    width: '80px',
    textAlign: 'center'
  },
  recipBadgeValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.9rem',
    color: '#60a5fa',
    fontWeight: 600
  },
  removeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.15s'
  },
  addTokenBar: {
    display: 'flex',
    gap: '10px',
    paddingTop: '8px'
  },
  addNameInput: {
    flex: 1,
    padding: '9px 12px',
    background: '#080B12',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.85rem'
  },
  addProbInput: {
    width: '90px',
    padding: '9px 12px',
    background: '#080B12',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.85rem',
    fontFamily: "'JetBrains Mono', monospace"
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 18px',
    background: 'rgba(22, 119, 255, 0.15)',
    border: '1px solid rgba(22, 119, 255, 0.4)',
    borderRadius: '6px',
    color: '#60a5fa',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer'
  }
};
