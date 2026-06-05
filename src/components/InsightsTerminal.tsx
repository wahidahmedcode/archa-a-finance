/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AssetData, ValuationMetrics, SimulationScenario } from "../types";

interface InsightsTerminalProps {
  activeAsset: AssetData;
  metrics: ValuationMetrics;
  scenario: SimulationScenario;
}

export default function InsightsTerminal({ activeAsset, metrics, scenario }: InsightsTerminalProps) {
  const [history, setHistory] = useState<Array<{ sender: "user" | "aeterna"; text: string }>>([
    {
      sender: "aeterna",
      text: `### **AETERNA INTELLIGENCE CORE ONLINE**
Welcome to the Financial Intelligence interface for **${activeAsset.name}**. 

I am synchronized with the simulated parameters:
- **Digital Twin Valuation**: $${metrics.valuation.toFixed(2)}M
- **Annualized Net Operating Income**: $${metrics.noi.toFixed(2)}M
- **Simulation Scenario Mode**: ${scenario}

Select a strategic option below or ask your own bespoke question regarding SPV rebalancing, tax structures, macro factors, and capital shielding.`
    }
  ]);

  const [promptInput, setPromptInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticText, setDiagnosticText] = useState("");

  const suggestedPrompts = [
    "What are the structural risks of depreciating this asset at Year 10?",
    "Provide a Luxembourg SPV distribution yield rebalance plan",
    "How does a 0.5% interest rate cap rise impact our equity multiple?"
  ];

  const triggerAudit = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    setHistory((prev) => [...prev, { sender: "user", text: messageText }]);
    setPromptInput("");
    setIsLoading(true);

    // Micro diagnostic loading cycles
    const loaders = [
      "SYNCHRONIZING LUXEMBOURG SPV TREATY DIRECTORIES...",
      "CALCULATING ACCELERATED MACRS COEFFICIENT GRADIENTS...",
      "QUERYING ADVISORY SCHEMAS VIA AETERNA AI ENGINE...",
      "FORMATTING COMPLIANCE SHEETS..."
    ];

    let lIndex = 0;
    setDiagnosticText(loaders[0]);
    const interval = setInterval(() => {
      lIndex++;
      if (lIndex < loaders.length) {
        setDiagnosticText(loaders[lIndex]);
      }
    }, 1000);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valuation: metrics.valuation,
          noi: metrics.noi,
          capRate: metrics.capRate,
          scenario,
          message: messageText
        })
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.text) {
        setHistory((prev) => [...prev, { sender: "aeterna", text: data.text }]);
      } else if (data.error) {
        setHistory((prev) => [...prev, { sender: "aeterna", text: `### ERROR GENERATING AUDIT\n*Reason: ${data.error}*` }]);
      }
    } catch (err: any) {
      clearInterval(interval);
      setHistory((prev) => [
        ...prev,
        { sender: "aeterna", text: `### ENGINE CONNECTIVITY INTERRUPTION\n*Could not communicate with the Aeterna server framework. Ensure your Express backend server is launched properly on port 3000.*` }
      ]);
    } finally {
      setIsLoading(false);
      setDiagnosticText("");
    }
  };

  // Simple Markdown structure renderer to render server response beautifully without react-markdown bugs
  const renderMarkdownText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={i} className="font-display text-base font-semibold text-tertiary mt-6 mb-3 tracking-wide uppercase">
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={i} className="font-display text-lg font-bold text-on-surface mt-8 mb-4 tracking-wider uppercase border-b border-white/5 pb-2">
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2 key={i} className="font-display text-xl font-bold text-white mt-8 mb-4 tracking-widest uppercase">
            {trimmed.replace("#", "").trim()}
          </h2>
        );
      }

      // Strong list check bold mapping
      let content: React.ReactNode = line;
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const listText = trimmed.substring(1).trim();
        content = <span>• {listText}</span>;
      }

      // Bold highlight converter
      const regex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      const str = typeof content === "string" ? content : (content as any).props?.children || "";

      if (str) {
        while ((match = regex.exec(str)) !== null) {
          if (match.index > lastIndex) {
            parts.push(str.substring(lastIndex, match.index));
          }
          parts.push(
            <strong key={match.index} className="text-white font-semibold">
              {match[1]}
            </strong>
          );
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < str.length) {
          parts.push(str.substring(lastIndex));
        }
      }

      const formattedContent = parts.length > 0 ? parts : content;

      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <div key={i} className="pl-4 font-sans text-xs text-on-surface-variant leading-relaxed my-1.5 uppercase-none">
            • {formattedContent}
          </div>
        );
      }

      return (
        <p key={i} className="font-sans text-xs text-on-surface-variant leading-relaxed my-2">
          {formattedContent}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8" id="insights-viewport">
      
      {/* Intro Header */}
      <header className="space-y-4">
        <nav className="font-sans text-xs font-semibold tracking-[0.2em] text-on-surface-variant/60 uppercase">
          AETERNA / INSIGHT INTELLIGENCE CORE
        </nav>
        <h1 className="font-display text-4xl font-bold text-on-surface">
          Parametric Strategy Oracle
        </h1>
        <p className="font-sans text-lg font-light tracking-[0.05em] text-on-surface-variant max-w-3xl">
          Submit parametric scenarios to the Aeterna cognitive system. Access instantaneous structural auditing, tax shields recommendations, and portfolio optimization modeling.
        </p>
      </header>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chat log & Console left */}
        <div className="lg:col-span-8 flex flex-col h-[550px] glass-panel rounded-lg border border-white/5 relative">
          
          <div className="bg-surface-container-low border-b border-white/10 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
              <span className="font-mono text-[10px] tracking-wider text-on-surface font-semibold uppercase">
                AETERNA AI ENGINE SECURED
              </span>
            </div>
            <span className="font-mono text-[9px] text-on-surface-variant/40 tracking-widest uppercase">
              COVARIANT MATRIX ACTIVE
            </span>
          </div>

          {/* Messages stream area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {history.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "aeterna" && (
                  <div className="w-8 h-8 rounded-full border border-tertiary flex items-center justify-center shrink-0 bg-tertiary/10">
                    <span className="material-symbols-outlined text-sm text-tertiary">psychology</span>
                  </div>
                )}
                
                <div 
                  className={`p-5 rounded-lg max-w-[85%] border shadow-md ${
                    msg.sender === "user"
                      ? "bg-tertiary/5 border-tertiary/30 text-on-surface"
                      : "bg-background-obsidian/40 border-white/5 text-on-surface-variant"
                  }`}
                >
                  {renderMarkdownText(msg.text)}
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-white/5 font-mono text-[9px] text-tertiary font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Diagnostic loading overlay */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full border border-tertiary flex items-center justify-center shrink-0 bg-tertiary/10 animate-spin">
                  <span className="material-symbols-outlined text-sm text-tertiary">sync</span>
                </div>
                <div className="p-5 rounded border border-white/10 bg-background-obsidian/80 glass-panel max-w-[85%] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-tertiary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-tertiary rounded-full animate-bounce delay-150" />
                    <div className="w-2 h-2 bg-tertiary rounded-full animate-bounce delay-300" />
                  </div>
                  <p className="font-mono text-[9px] tracking-wider text-tertiary animate-pulse font-semibold">
                    {diagnosticText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form input bottom area */}
          <div className="bg-surface-container-low border-t border-white/10 p-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                triggerAudit(promptInput);
              }}
              className="flex gap-2"
            >
              <input 
                type="text"
                placeholder={`Ask Oracle about ${activeAsset.name}...`}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                disabled={isLoading}
                className="flex-grow bg-background-obsidian/60 border border-white/10 rounded px-4 py-3 font-mono text-xs text-on-surface focus:outline-none focus:border-tertiary transition-colors"
              />
              <button 
                type="submit"
                disabled={isLoading || !promptInput.trim()}
                className="bg-tertiary text-on-primary font-sans text-xs font-semibold px-6 py-3 hover:opacity-90 transition-all rounded-xs cursor-pointer tracking-widest disabled:opacity-40"
              >
                SUBMIT
              </button>
            </form>
          </div>

        </div>

        {/* Suggested prompts right */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          <div className="glass-panel p-8 rounded-lg border border-white/5 space-y-6">
            <h4 className="font-sans text-xs font-semibold tracking-widest text-on-surface uppercase border-b border-white/5 pb-4">
              Preformed Diagnostic Scenarios
            </h4>
            <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed">
              Click any of the high-prestige parameters below to load it into the engine automatically:
            </p>

            <div className="space-y-4">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => triggerAudit(p)}
                  disabled={isLoading}
                  className="w-full text-left p-4 rounded border border-white/5 bg-background-obsidian/30 hover:border-tertiary/40 transition-all cursor-pointer font-sans text-xs text-on-surface-variant hover:text-tertiary disabled:opacity-50"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Warning notice info block */}
          <div className="glass-panel p-6 rounded-lg border border-white/5 font-sans text-[11px] text-on-surface-variant/70 leading-relaxed uppercase tracking-widest">
            AETERNA ADVISORY NOTICE: MODEL CALCULATIONS ARE SIMULATED SCHEMAS FOR DIGITAL INVESTMENT TWIN ASSESSMENTS AND DIRECT INVESTMENT DECISIONS.
          </div>

        </div>

      </div>

    </div>
  );
}
