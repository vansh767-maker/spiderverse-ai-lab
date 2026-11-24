import { useMemo } from "react";

// ── Detection helpers ─────────────────────────────────────────────────────

function detectFewShot(text) {
  const patterns = [
    /^\s*input\s*:/im,
    /^\s*output\s*:/im,
    /^\s*q\s*:/im,
    /^\s*a\s*:/im,
    /^\s*question\s*:/im,
    /^\s*answer\s*:/im,
    /example\s+\d+\s*:/i,
    /```example[\s\S]*?```/i,
  ];

  // Count distinct non-overlapping matches across all patterns, dedupe by index
  const matchedRanges = [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags + (pattern.global ? "" : "g"));
    for (const match of text.matchAll(regex)) {
      matchedRanges.push([match.index, match.index + match[0].length]);
    }
  }

  // Deduplicate overlapping ranges
  matchedRanges.sort((a, b) => a[0] - b[0]);
  const deduped = [];
  for (const range of matchedRanges) {
    if (!deduped.length || range[0] >= deduped[deduped.length - 1][1]) {
      deduped.push(range);
    }
  }

  const count = deduped.length;
  const detected = count > 0;
  return {
    detected,
    count,
    details: detected
      ? `${count} few-shot indicator${count > 1 ? "s" : ""} detected (Input/Output pairs, Q&A, or example blocks).`
      : "No few-shot patterns detected.",
  };
}

function detectChainOfThought(text) {
  const triggers = [
    /step[\s-]by[\s-]step/i,
    /think\s+through/i,
    /walk\s+me\s+through/i,
    /explain\s+your\s+reasoning/i,
    /show\s+your\s+work/i,
    /let['']?s\s+think/i,
    /think\s+carefully/i,
  ];

  const matched = triggers.filter((r) => r.test(text));
  const detected = matched.length > 0;
  return {
    detected,
    details: detected
      ? `Chain-of-thought cues found: ${matched.map((r) => r.source).join(", ")}.`
      : "No chain-of-thought patterns detected.",
  };
}

function detectRolePlaying(text) {
  const patterns = [
    { regex: /act\s+as\s+(a|an)\s+(\w+(\s+\w+){0,3})/i, group: 2 },
    { regex: /you\s+are\s+(a|an)\s+(\w+(\s+\w+){0,3})/i, group: 2 },
    { regex: /assume\s+the\s+role\s+of\s+(a|an)?\s*(\w+(\s+\w+){0,3})/i, group: 2 },
    { regex: /pretend\s+you\s+are\s+(a|an)?\s*(\w+(\s+\w+){0,3})/i, group: 2 },
    { regex: /behave\s+as\s+(a|an)?\s*(\w+(\s+\w+){0,3})/i, group: 2 },
    { regex: /imagine\s+you\s+are\s+(a|an)?\s*(\w+(\s+\w+){0,3})/i, group: 2 },
    { regex: /you\s+are\s+an?\s+expert\s+in\s+(\w+(\s+\w+){0,3})/i, group: 1 },
    { regex: /as\s+a(?:n)?\s+(\w+(\s+\w+){0,3})/i, group: 1 },
  ];

  for (const { regex, group } of patterns) {
    const match = text.match(regex);
    if (match) {
      const role = match[group]?.trim() || "unspecified role";
      return {
        detected: true,
        role,
        details: `Role-playing prompt detected. Assigned role: "${role}".`,
      };
    }
  }

  return {
    detected: false,
    role: null,
    details: "No role-playing patterns detected.",
  };
}

function detectNegativeConstraints(text) {
  const pattern = /\b(do\s+not|don['']?t|never|avoid|without\s+using|exclude|refrain\s+from)\b/gi;
  const matches = [...text.matchAll(pattern)];
  const examples = [...new Set(matches.map((m) => m[0].toLowerCase()))];
  const detected = matches.length > 0;
  return {
    detected,
    count: matches.length,
    examples,
    details: detected
      ? `${matches.length} negative constraint(s) found: ${examples.slice(0, 5).join(", ")}.`
      : "No negative constraints detected.",
  };
}

function detectFormatConstraints(text) {
  const formatRules = [
    { regex: /\b(in|as|return|output)\s+json\b/i, label: "JSON" },
    { regex: /\b(in|using)\s+markdown\b/i, label: "Markdown" },
    { regex: /\bin\s+a\s+table\b/i, label: "Table" },
    { regex: /\b(only|return|as)\s+code\b|\bcode\s+only\b/i, label: "Code only" },
    { regex: /\bin\s+bullet\s+points?\b|\bas\s+a\s+list\b|\bnumbered\s+list\b/i, label: "List" },
    { regex: /\bin\s+xml\b/i, label: "XML" },
    { regex: /\bas\s+yaml\b/i, label: "YAML" },
  ];

  const formats = formatRules
    .filter(({ regex }) => regex.test(text))
    .map(({ label }) => label);

  const detected = formats.length > 0;
  return {
    detected,
    formats,
    details: detected
      ? `Format constraint(s) detected: ${formats.join(", ")}.`
      : "No format constraints detected.",
  };
}

function computeStats(text) {
  const length = text.length;
  const words = text.trim() === "" ? [] : text.trim().split(/\s+/);
  const wordCount = words.length;
  const tokenCount = Math.ceil(wordCount * 1.3);
  const sentenceCount = (text.match(/[.!?]+(\s|$)/g) || []).length;

  return { length, wordCount, tokenCount, sentenceCount };
}

// ── Hook ─────────────────────────────────────────────────────────────────

/**
 * usePromptAnalyzer
 * Analyses a prompt string on every render and returns a stable analysis object.
 *
 * @param {string} promptText - The prompt text to analyse.
 * @returns {{ analysis: object }}
 */
export function usePromptAnalyzer(promptText) {
  const analysis = useMemo(() => {
    const text = promptText || "";

    return {
      fewShot: detectFewShot(text),
      chainOfThought: detectChainOfThought(text),
      rolePlaying: detectRolePlaying(text),
      negativeConstraints: detectNegativeConstraints(text),
      formatConstraints: detectFormatConstraints(text),
      stats: computeStats(text),
    };
  }, [promptText]);

  return { analysis };
}
