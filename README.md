# 🕷️ SPIDER-VERSE AI LAB

> **Your Friendly Neighborhood AI Playground** — A futuristic, Spider-Man-themed interactive LLM laboratory featuring real-time streaming, prompt analytics (Spider-Sense), and a deep-dive interactive Perplexity Explorer.

---

## ✨ Features

- **🕸️ Spider-Verse Cybernetic UI/UX:** Futuristic dark mode theme (`#080B12`, `#E62429`, `#1677FF`), glassmorphism cards, glowing HUD indicators, and animated Spider-Sense meters.
- **⚡ Real-Time Streaming AI Playground:** Powered by Groq API (`llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, etc.) with live token streaming, stop generation, regeneration, code copying, and Markdown syntax highlighting.
- **🕷️ Spider-Sense Prompt Analytics:** Live real-time analysis of prompt quality, complexity score, token estimations, and safety evaluations as you type.
- **🔬 Perplexity Explorer:**
  - Interactive token probability breakdown inspired by language model calculations (DistilGPT-2).
  - Step-by-step visual calculations: Reciprocal probabilities $1/P$, multiplication product $\prod (1/P)$, and $N$-th root $\sqrt[N]{\prod 1/P} = \text{Perplexity}$.
  - Hands-on manual simulator: adjust individual token probabilities with sliders and observe how perplexity changes in real time.
- **📱 Fully Responsive Design:** Clean layout that adapts seamlessly across desktop multi-panel view and mobile viewports.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Groq API Key](https://console.groq.com/) (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/vansh767-maker/spiderverse-ai-lab.git

# Navigate into the project directory
cd spiderverse-ai-lab

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser at `http://localhost:5173` to start exploring!

---

## 🛠️ Tech Stack

- **Framework:** React 18
- **Bundler:** Vite 5
- **Icons:** Lucide React
- **Markdown & Code Highlighting:** React Markdown, Remark GFM, React Syntax Highlighter
- **AI Engine:** Groq SDK
- **Styling:** Custom Cyberpunk / Spider-Verse CSS with Google Fonts (Orbitron, Inter, JetBrains Mono)

---

## 📄 License

MIT
