/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { assetsCatalog } from "./data/assetsData";
import { NavTab, SimulationScenario, ValuationMetrics, AssetData } from "./types";

import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Portfolio from "./components/Portfolio";
import Assets from "./components/Assets";
import InsightsTerminal from "./components/InsightsTerminal";
import RebalanceDrawer from "./components/RebalanceDrawer";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("DASHBOARD");
  const [activeAsset, setActiveAsset] = useState<AssetData>(assetsCatalog[0]);
  const [scenario, setScenario] = useState<SimulationScenario>("TARGET SCENARIO");

  // Valuation metrics state initialized from the selected asset
  const [metrics, setMetrics] = useState<ValuationMetrics>({
    valuation: assetsCatalog[0].valuation,
    yoyTrend: 12.4,
    noi: assetsCatalog[0].noi,
    capRate: assetsCatalog[0].capRate
  });

  // Keep metrics in sync when the user changes activeAsset
  useEffect(() => {
    setMetrics({
      valuation: activeAsset.valuation,
      yoyTrend: activeAsset.id === "obsidian-prism" ? 12.4 : (activeAsset.id === "ivory-monolith" ? 9.8 : 14.5),
      noi: activeAsset.noi,
      capRate: activeAsset.capRate
    });
  }, [activeAsset]);

  // Handle fine-tuning parameters with automated cascade (recomputing Cap Rate dynamically)
  const handleUpdateMetric = (key: keyof ValuationMetrics, value: number) => {
    setMetrics((prev) => {
      const updated = { ...prev, [key]: value };
      
      // Capitalization Rate = (NOI / Valuation) * 100
      if (key === "valuation" || key === "noi") {
        if (updated.valuation > 0) {
          updated.capRate = (updated.noi / updated.valuation) * 100;
        }
      }
      return updated;
    });
  };

  // Rebalance modal state
  const [rebalanceOpen, setRebalanceOpen] = useState(false);

  // Escrow Wallet panel notification overlay
  const [showWalletNotification, setShowWalletNotification] = useState(false);

  // Exporter compiling dialog state
  const [isCompilingReport, setIsCompilingReport] = useState(false);
  const [compileStep, setCompileStep] = useState("");

  const handleTriggerWallet = () => {
    setShowWalletNotification(true);
    setTimeout(() => setShowWalletNotification(false), 3000);
  };

  // Safe client-side file exporter
  const handleTriggerExport = () => {
    setIsCompilingReport(true);
    setCompileStep("GATHERING TWIN PARAMETERS...");
    
    setTimeout(() => {
      setCompileStep("INTERPOLATING 10-YEAR FORCASTS...");
      
      setTimeout(() => {
        setCompileStep("CERTIFYING COMPLIANCE PROTOCOLS...");
        
        setTimeout(() => {
          setIsCompilingReport(false);
          setCompileStep("");
          
          // Generate customized secure report file
          const reportText = `======================================================================
                  AETERNA INVESTMENT LEDGER - PRECISION REPORT
======================================================================
Generated On     : ${new Date().toISOString()}
Target Asset     : ${activeAsset.name}
Asset Class      : ${activeAsset.grade}
Geographic Axis  : ${activeAsset.location}

Holding Structure: ${activeAsset.ownership}
Tax Protocol     : Obsidian Shield Protocol (Validated Rating: ${activeAsset.taxEfficiency}%)
Schedule Path    : ${activeAsset.depreciation}

---------------------- CORE VALUATION COEFFICIENTS --------------------
Active Simulator Scenario             : ${scenario}
Optimized Project Valuation           : $${metrics.valuation.toFixed(2)} Million
Annualised Net Operating Income (NOI) : $${metrics.noi.toFixed(2)} Million
Calculated Capitalization rate        : ${metrics.capRate.toFixed(2)}%
Year-over-Year (YoY) Velocity Trend   : +${metrics.yoyTrend}%

---------------------- COMPLIANT STRUCTURAL SCHEDULES ------------------
Expected 10-Year Internal Rate (IRR)  : ${(Number(activeAsset.irr) * (metrics.capRate / activeAsset.capRate)).toFixed(1)}%
Equity Multiplier Ratio               : ${(Number(activeAsset.equityMultiple) * (metrics.capRate / activeAsset.capRate)).toFixed(2)}x
Annual Luxembourg Capital Deductible  : $${(metrics.valuation * 0.0363).toFixed(2)} Million / Year

---------------------- QUARTERLY CASH FLOW LOGS -----------------------
Quarterly Distribution Yield Limit    : ${(metrics.capRate * 0.25).toFixed(2)}%

Status Check: ledger files checked. No alignment discrepancies found.
======================================================================
                 OFFICIAL RECORD - AETERNA STRATEGY CORES 
======================================================================`;

          const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `aeterna-${activeAsset.id}-intelligence-report.txt`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-screen text-on-surface select-none relative architectural-grid pb-12 overflow-x-hidden">
      
      {/* Structural Nav Bar header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenWallet={handleTriggerWallet}
      />

      {/* Main Canvas Area */}
      <main className="pt-32 pb-16 px-6 lg:px-20 max-w-[1440px] mx-auto min-h-[calc(100vh-280px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + "-" + activeAsset.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "DASHBOARD" && (
              <Dashboard 
                asset={activeAsset}
                scenario={scenario}
                onChangeScenario={setScenario}
                metrics={metrics}
                onUpdateMetric={handleUpdateMetric}
                onOpenRebalance={() => setRebalanceOpen(true)}
                onTriggerExport={handleTriggerExport}
              />
            )}

            {activeTab === "PORTFOLIO" && (
              <Portfolio 
                activeAsset={activeAsset}
                onSelectAsset={setActiveAsset}
                tabSwitchToDashboard={() => setActiveTab("DASHBOARD")}
              />
            )}

            {activeTab === "ASSETS" && (
              <Assets 
                activeAsset={activeAsset}
                metrics={metrics}
                onUpdateMetric={handleUpdateMetric}
              />
            )}

            {activeTab === "INSIGHTS" && (
              <InsightsTerminal 
                activeAsset={activeAsset}
                metrics={metrics}
                scenario={scenario}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Side Rebalance Simulator panel */}
      <RebalanceDrawer 
        isOpen={rebalanceOpen}
        onClose={() => setRebalanceOpen(false)}
        assetName={activeAsset.name}
      />

      {/* Bottom Floating Wallet Status Action Response Notification overlay */}
      <AnimatePresence>
        {showWalletNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-55 glass-panel border border-tertiary/20 px-6 py-4 rounded shadow-2xl flex items-center gap-3 bg-[#0a0a0a]"
            id="wallet-ledger-notification"
          >
            <span className="material-symbols-outlined text-tertiary animate-pulse">lock</span>
            <div className="font-mono text-xs uppercase">
              <p className="text-on-surface font-semibold">Security Vault Handshake Success</p>
              <p className="text-on-surface-variant/70 text-[10px]">Escrow Liquidity Balanced at $3,640,000</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compilation/Download process spinner modal */}
      <AnimatePresence>
        {isCompilingReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-56 flex items-center justify-center bg-background-obsidian/70 backdrop-blur-md"
            id="report-compilation-overlay"
          >
            <div className="glass-panel p-8 max-w-sm w-full text-center rounded border border-white/10 space-y-6 shadow-2xl">
              <div className="w-12 h-12 border-t-2 border-r-2 border-tertiary rounded-full animate-spin mx-auto" />
              <div className="space-y-2">
                <h4 className="font-display text-lg text-on-surface font-bold uppercase tracking-widest">
                  Compiling Strategy Report
                </h4>
                <p className="font-mono text-[10px] tracking-widest text-[#00f3ff] animate-pulse">
                  {compileStep}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Design-System Architectural Compliant Footer */}
      <footer className="w-full relative border-t border-white/5 bg-background-obsidian/40 flex flex-col md:flex-row justify-between items-center px-6 md:px-20 py-12 gap-8 mt-16">
        <div className="font-display text-2xl font-bold text-on-surface uppercase tracking-tight">
          AETERNA
        </div>
        <div className="text-center md:text-left">
          <p className="font-sans text-[10px] tracking-widest text-on-surface-variant font-medium">
            © 2026 AETERNA DIGITAL CRAFTSMANSHIP. ALL RIGHTS RESERVED.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-sans text-[10px] tracking-[0.15em] font-medium">
          <a className="text-on-surface-variant hover:text-on-surface transition-colors uppercase" href="#">PRIVACY</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors uppercase" href="#">TERMS</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors uppercase" href="#">COMPLIANCE</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors uppercase" href="#">CONTACT</a>
        </div>
      </footer>

    </div>
  );
}
