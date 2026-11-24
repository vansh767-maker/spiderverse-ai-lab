import { useState, useCallback, useRef, useEffect } from "react";

const FALLBACK_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-8b-8192",
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "llama-3.2-90b-vision-preview",
  "llama-3.2-11b-vision-preview",
];

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

function loadFromStorage(key, defaultValue, storage = localStorage) {
  try {
    const stored = storage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value, storage = localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export function useGroqChat() {
  // ── API key ──────────────────────────────────────────────────────────────
  const [rememberKey, setRememberKey] = useState(() =>
    loadFromStorage("groq_remember_key", false)
  );

  const [apiKey, setApiKeyState] = useState(() => {
    const remember = loadFromStorage("groq_remember_key", false);
    if (remember) {
      return sessionStorage.getItem("groq_api_key") || "";
    }
    return "";
  });

  const setApiKey = useCallback(
    (key) => {
      setApiKeyState(key);
      if (rememberKey) {
        sessionStorage.setItem("groq_api_key", key);
      }
    },
    [rememberKey]
  );

  const handleSetRememberKey = useCallback((val) => {
    setRememberKey(val);
    saveToStorage("groq_remember_key", val);
    if (!val) {
      sessionStorage.removeItem("groq_api_key");
    } else {
      setApiKeyState((prev) => {
        sessionStorage.setItem("groq_api_key", prev);
        return prev;
      });
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    sessionStorage.removeItem("groq_api_key");
  }, []);

  // ── Model settings ────────────────────────────────────────────────────────
  const [selectedModel, setSelectedModelState] = useState(() =>
    loadFromStorage("groq_model", FALLBACK_MODELS[0])
  );

  const setSelectedModel = useCallback((model) => {
    setSelectedModelState(model);
    saveToStorage("groq_model", model);
  }, []);

  const [availableModels, setAvailableModels] = useState(FALLBACK_MODELS);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState(null);

  // ── Inference settings ────────────────────────────────────────────────────
  const [temperature, setTemperatureState] = useState(() =>
    loadFromStorage("groq_temperature", 0.7)
  );
  const setTemperature = useCallback((val) => {
    setTemperatureState(val);
    saveToStorage("groq_temperature", val);
  }, []);

  const [maxTokens, setMaxTokensState] = useState(() =>
    loadFromStorage("groq_max_tokens", 300)
  );
  const setMaxTokens = useCallback((val) => {
    setMaxTokensState(val);
    saveToStorage("groq_max_tokens", val);
  }, []);

  const [stopSequences, setStopSequences] = useState([]);
  const [contextWindow, setContextWindow] = useState(null); // null = all messages
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Metrics ───────────────────────────────────────────────────────────────
  const [usage, setUsage] = useState({
    input_tokens: 0,
    output_tokens: 0,
    reasoning_tokens: 0,
  });
  const [speedMetrics, setSpeedMetrics] = useState({
    timeToFirstToken: null,
    totalResponseTime: null,
    tokensPerSecond: null,
  });

  // ── Connection status ─────────────────────────────────────────────────────
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle | connected | error

  // ── Abort ref ─────────────────────────────────────────────────────────────
  const abortControllerRef = useRef(null);

  // ── Fetch models ──────────────────────────────────────────────────────────
  const fetchModels = useCallback(
    async (key = apiKey) => {
      if (!key) return;
      setModelsLoading(true);
      setModelsError(null);
      try {
        const res = await fetch(`${GROQ_BASE_URL}/models`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const ids = (data.data || [])
          .map((m) => m.id)
          .filter(Boolean)
          .sort();
        setAvailableModels(ids.length ? ids : FALLBACK_MODELS);
      } catch (err) {
        setModelsError(err.message);
        setAvailableModels(FALLBACK_MODELS);
      } finally {
        setModelsLoading(false);
      }
    },
    [apiKey]
  );

  // ── Test connection ───────────────────────────────────────────────────────
  const testConnection = useCallback(
    async (key = apiKey) => {
      if (!key) {
        setConnectionStatus("error");
        return false;
      }
      setConnectionStatus("idle");
      try {
        const res = await fetch(`${GROQ_BASE_URL}/models`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setConnectionStatus("connected");
        return true;
      } catch {
        setConnectionStatus("error");
        return false;
      }
    },
    [apiKey]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const buildApiMessages = useCallback(
    (msgs) => {
      const sliced =
        contextWindow && contextWindow > 0
          ? msgs.slice(-contextWindow)
          : msgs;
      return sliced.map(({ role, content }) => ({ role, content }));
    },
    [contextWindow]
  );

  // ── Core streaming send ───────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (userContent, overrideMessages) => {
      if (!apiKey) {
        setError("API key is required.");
        return;
      }
      if (isLoading) return;

      setError(null);

      const userMsg = {
        role: "user",
        content: userContent,
        timestamp: Date.now(),
      };

      const baseMessages =
        overrideMessages !== undefined ? overrideMessages : messages;
      const nextMessages = [...baseMessages, userMsg];

      // Append user message + placeholder assistant message
      const assistantPlaceholder = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
      setMessages([...nextMessages, assistantPlaceholder]);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const startTime = performance.now();
      let firstTokenTime = null;
      let accumulatedContent = "";
      let finalUsage = null;

      try {
        const body = {
          model: selectedModel,
          messages: buildApiMessages(nextMessages),
          temperature,
          max_tokens: maxTokens,
          stream: true,
          ...(stopSequences.length > 0 && {
            stop: stopSequences.slice(0, 4),
          }),
        };

        const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));

              // Capture usage from final chunk
              if (json.usage) {
                finalUsage = json.usage;
              }

              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                if (firstTokenTime === null) {
                  firstTokenTime = performance.now();
                }
                accumulatedContent += delta;

                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: accumulatedContent,
                  };
                  return updated;
                });
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // stopped by user — keep whatever was accumulated
        } else {
          setError(err.message);
          // Remove placeholder on hard error
          setMessages((prev) => prev.slice(0, -1));
        }
      } finally {
        const endTime = performance.now();
        const totalSec = (endTime - startTime) / 1000;
        const ttft =
          firstTokenTime !== null ? firstTokenTime - startTime : null;

        const outputTokens = finalUsage?.completion_tokens ?? 0;

        setSpeedMetrics({
          timeToFirstToken: ttft !== null ? Math.round(ttft) : null,
          totalResponseTime: parseFloat(totalSec.toFixed(2)),
          tokensPerSecond:
            outputTokens && totalSec > 0
              ? parseFloat((outputTokens / totalSec).toFixed(1))
              : null,
        });

        if (finalUsage) {
          setUsage({
            input_tokens: finalUsage.prompt_tokens ?? 0,
            output_tokens: finalUsage.completion_tokens ?? 0,
            reasoning_tokens:
              finalUsage.completion_tokens_details?.reasoning_tokens ?? 0,
          });
        }

        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      apiKey,
      isLoading,
      messages,
      selectedModel,
      temperature,
      maxTokens,
      stopSequences,
      buildApiMessages,
    ]
  );

  // ── Stop generation ───────────────────────────────────────────────────────
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // ── Clear conversation ────────────────────────────────────────────────────
  const clearConversation = useCallback(() => {
    setMessages([]);
    setUsage({ input_tokens: 0, output_tokens: 0, reasoning_tokens: 0 });
    setSpeedMetrics({
      timeToFirstToken: null,
      totalResponseTime: null,
      tokensPerSecond: null,
    });
    setError(null);
  }, []);

  // ── Regenerate last response ──────────────────────────────────────────────
  const regenerateLastResponse = useCallback(() => {
    // Find the last user message, strip the last assistant message, resend
    const lastUserIdx = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;

    const userMsgIdx = messages.length - 1 - lastUserIdx;
    const userMsg = messages[userMsgIdx];
    const historyBeforeUser = messages.slice(0, userMsgIdx);

    sendMessage(userMsg.content, historyBeforeUser);
  }, [messages, sendMessage]);

  // ── Fetch models when apiKey changes ─────────────────────────────────────
  useEffect(() => {
    if (apiKey) {
      fetchModels(apiKey);
    }
  }, [apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Chat
    messages,
    sendMessage,
    stopGeneration,
    clearConversation,
    regenerateLastResponse,
    isLoading,
    error,

    // API key
    apiKey,
    setApiKey,
    rememberKey,
    setRememberKey: handleSetRememberKey,
    clearApiKey,

    // Models
    selectedModel,
    setSelectedModel,
    availableModels,
    fetchModels,
    modelsLoading,
    modelsError,

    // Settings
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    stopSequences,
    setStopSequences,
    contextWindow,
    setContextWindow,
    webSearchEnabled,
    setWebSearchEnabled,

    // Metrics
    usage,
    speedMetrics,

    // Connection
    connectionStatus,
    testConnection,
  };
}
