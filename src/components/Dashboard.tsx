/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SimulationScenario, ValuationMetrics, ForecastYear, CashFlowRow, AssetData } from "../types";

interface DashboardProps {
  asset: AssetData;
  scenario: SimulationScenario;
  onChangeScenario: (scenario: SimulationScenario) => void;
  metrics: ValuationMetrics;
  onUpdateMetric: (key: keyof ValuationMetrics, value: number) => void;
  onOpenRebalance: () => void;
  onTriggerExport: () => void;
}

export default function Dashboard({
  asset,
  scenario,
  onChangeScenario,
  metrics,
  onUpdateMetric,
  onOpenRebalance,
  onTriggerExport
}: DashboardProps) {
  // Local toggles for editing card metrics
  const [editingKey, setEditingKey] = useState<keyof ValuationMetrics | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Toggle for loading historical data
  const [showHistorical, setShowHistorical] = useState(false);

  // Computed coefficients for Scenario adjustments
  const scenarioMultiplier = useMemo(() => {
    switch (scenario) {
      case "CONSERVATIVE": return 0.75;
      case "BULL CASE": return 1.35;
      case "TARGET SCENARIO":
      default: return 1.0;
    }
  }, [scenario]);

  // IRR & Equity Multiple computed based on scenario & Cap rate
  const computedIRR = useMemo(() => {
    const baseIrr = asset.id === "obsidian-prism" ? 18.2 : (asset.id === "ivory-monolith" ? 16.5 : 19.8);
    return (baseIrr * scenarioMultiplier * (metrics.capRate / asset.capRate)).toFixed(1);
  }, [scenarioMultiplier, metrics.capRate, asset]);

  const computedEquityMultiple = useMemo(() => {
    const baseEm = asset.id === "obsidian-prism" ? 2.45 : (asset.id === "ivory-monolith" ? 2.10 : 2.80);
    return (baseEm * scenarioMultiplier * (metrics.capRate / asset.capRate)).toFixed(2);
  }, [scenarioMultiplier, metrics.capRate, asset]);

  // Generate 10 bars for the Year Yield Forecasting chart
  const forecastBars = useMemo(() => {
    const baseHeights = [25, 33, 40, 50, 60, 75, 85, 95, 100, 30]; // % relative heights
    return baseHeights.map((h, index) => {
      let multiplier = scenarioMultiplier;
      // Last bar (Year 10 exit value) gets higher/lower extreme
      if (index === 9) {
        multiplier *= 1.1;
      }
      const adjustedValue = Math.min(100, Math.max(10, h * multiplier));
      return {
        year: index === 9 ? "EXIT (Y10)" : `YEAR ${index}`,
        height: adjustedValue,
        isExit: index === 9,
        isHighlight: index >= 3 && index <= 7
      };
    });
  }, [scenarioMultiplier]);

  // Radar chart points based on scenario
  const radarPoints = useMemo(() => {
    let market = 70;
    let geopolitical = 40;
    let operational = 65;
    let legal = 45;

    if (scenario === "CONSERVATIVE") {
      market = 85; 
      geopolitical = 65;
      operational = 50;
      legal = 60;
    } else if (scenario === "BULL CASE") {
      market = 50;
      geopolitical = 25;
      operational = 80;
      legal = 30;
    }

    // Convert polar points to polygon coordinates for centered SVG area (W: 200, H: 200)
    // Center at (100, 100). Max radius is 80.
    // Coordinates mapping:
    // Top (MARKET): 0 deg -> (100, 100 - r)
    // Right (OPERATIONAL): 90 deg -> (100 + r, 100)
    // Bottom (GEOPOLITICAL): 180 deg -> (100, 100 + r)
    // Left (LEGAL): 270 deg -> (100 - r, 100)
    const pMarket = `${100}, ${100 - (market / 100) * 80}`;
    const pOperational = `${100 + (operational / 100) * 80}, ${100}`;
    const pGeopolitical = `${100}, ${100 + (geopolitical / 100) * 80}`;
    const pLegal = `${100 - (legal / 100) * 80}, ${100}`;

    return `${pMarket} ${pOperational} ${pGeopolitical} ${pLegal}`;
  }, [scenario]);

  // Base Cash Flow Ledger Rows dynamically affected by Valuation Metrics
  const ledgerRows = useMemo<CashFlowRow[]>(() => {
    const baseRevenue = metrics.noi * 1.3;
    const baseOpex = metrics.noi * 0.3;

    const rows: CashFlowRow[] = [
      {
        period: "Q3 2024",
        grossRevenue: baseRevenue * 0.325,
        opex: -baseOpex * 0.325,
        distribution: metrics.noi * 0.325,
        yieldRate: metrics.capRate,
        status: "DISBURSED"
      },
      {
        period: "Q2 2024",
        grossRevenue: baseRevenue * 0.309,
        opex: -baseOpex * 0.320,
        distribution: metrics.noi * 0.309,
        yieldRate: metrics.capRate * 0.95,
        status: "DISBURSED"
      },
      {
        period: "Q1 2024",
        grossRevenue: baseRevenue * 0.293,
        opex: -baseOpex * 0.315,
        distribution: metrics.noi * 0.293,
        yieldRate: metrics.capRate * 0.91,
        status: "DISBURSED"
      },
      {
        period: "Q4 2023",
        grossRevenue: baseRevenue * 0.285,
        opex: -baseOpex * 0.310,
        distribution: metrics.noi * 0.285,
        yieldRate: metrics.capRate * 0.87,
        status: "DISBURSED"
      }
    ];

    if (showHistorical) {
      // Prepend or append historical blocks
      const extraYears = ["2023 Full Year", "2022 Full Year", "2021 Full Year", "2020 Realized"];
      extraYears.forEach((year, i) => {
        const factor = 1 - (i + 1) * 0.08;
        rows.push({
          period: year,
          grossRevenue: baseRevenue * factor,
          opex: -baseOpex * factor,
          distribution: metrics.noi * factor,
          yieldRate: metrics.capRate * factor,
          status: "DISBURSED"
        });
      });
    }

    return rows;
  }, [metrics, showHistorical]);

  // Toggle dynamic edit modal overlay
  const handleOpenEdit = (key: keyof ValuationMetrics) => {
    setEditingKey(key);
    setInputValue(metrics[key].toString());
  };

  const handleSaveEdit = () => {
    if (editingKey) {
      const val = parseFloat(inputValue);
      if (!isNaN(val) && val >= 0) {
        onUpdateMetric(editingKey, val);
      }
      setEditingKey(null);
    }
  };

  return (
    <div className="space-y-16" id="dashboard-viewport">
      
      {/* Header Section */}
      <header className="mb-16">
        <nav className="flex gap-2 mb-4 font-sans text-xs font-semibold tracking-[0.2em] text-on-surface-variant/60">
          <span>PORTFOLIO</span>
          <span>/</span>
          <span className="text-on-surface-variant uppercase">{asset.name}</span>
          <span>/</span>
          <span className="text-tertiary">FINANCIALS</span>
        </nav>
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
          <div className="space-y-4">
            <h1 className="font-display text-4xl lg:text-5xl font-semibold text-on-surface leading-tight">
              Financial Intelligence: <span className="italic font-normal">{asset.name}</span>
            </h1>
            <p className="font-sans text-lg font-light tracking-[0.05em] text-on-surface-variant max-w-2xl">
              Precision-driven performance metrics for the sector-leading ultra-luxury asset.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Export trigger */}
            <button 
              id="btn-export"
              className="px-8 py-3 border border-tertiary text-tertiary font-sans text-xs font-semibold hover:bg-tertiary/5 transition-all tracking-[0.2em] cursor-pointer"
              onClick={onTriggerExport}
            >
              EXPORT REPORT
            </button>
            
            {/* Rebalance trigger */}
            <button 
              id="btn-rebalance"
              className="px-8 py-3 bg-tertiary text-on-primary font-sans text-xs font-semibold hover:opacity-90 transition-all tracking-[0.2em] cursor-pointer"
              onClick={onOpenRebalance}
            >
              REBALANCE
            </button>
          </div>
        </div>
      </header>

      {/* Key Financial Metrics Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16" id="section-metrics-cards">
        
        {/* CURRENT VALUATION */}
        <div 
          className="glass-panel p-8 rounded-lg relative group overflow-hidden border border-white/5 cursor-pointer hover:border-tertiary/40 transition-all duration-300"
          onClick={() => handleOpenEdit("valuation")}
          id="card-val-metrics"
        >
          <div className="flex justify-between items-center mb-4">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] text-on-surface-variant/70">CURRENT VALUATION</p>
            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-60 text-tertiary transition-opacity">edit</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl lg:text-6xl font-bold text-on-surface">${metrics.valuation.toFixed(2)}</span>
            <span className="font-display text-2xl font-light text-on-surface-variant">M</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-tertiary">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="font-mono text-sm tracking-widest font-semibold">+{metrics.yoyTrend}% YOY</span>
          </div>
        </div>

        {/* NET OPERATING INCOME */}
        <div 
          className="glass-panel p-8 rounded-lg relative group overflow-hidden border border-white/5 cursor-pointer hover:border-tertiary/40 transition-all duration-300"
          onClick={() => handleOpenEdit("noi")}
          id="card-noi-metrics"
        >
          <div className="flex justify-between items-center mb-4">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] text-on-surface-variant/70">NET OPERATING INCOME</p>
            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-60 text-tertiary transition-opacity">edit</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl lg:text-6xl font-bold text-on-surface">${metrics.noi.toFixed(2)}</span>
            <span className="font-display text-2xl font-light text-on-surface-variant">M</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span className="font-mono text-sm tracking-widest font-semibold">ANNUALIZED RUN-RATE</span>
          </div>
        </div>

        {/* CAPITALIZATION RATE */}
        <div 
          className="glass-panel p-8 rounded-lg relative group overflow-hidden border border-white/5 cursor-pointer hover:border-tertiary/40 transition-all duration-300"
          onClick={() => handleOpenEdit("capRate")}
          id="card-caprate-metrics"
        >
          <div className="flex justify-between items-center mb-4">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] text-on-surface-variant/70">CAPITALIZATION RATE</p>
            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-60 text-tertiary transition-opacity">edit</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl lg:text-6xl font-bold text-on-surface">{metrics.capRate.toFixed(2)}</span>
            <span className="font-display text-3xl font-light text-on-surface-variant">%</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">target</span>
            <span className="font-mono text-sm tracking-widest font-semibold text-tertiary">OPTIMIZED BENCHMARK</span>
          </div>
        </div>

      </section>

      {/* Popover slider panel for manual editing */}
      <AnimatePresence>
        {editingKey && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background-obsidian/60 backdrop-blur-md"
            id="panel-metric-popup-editor"
          >
            <div className="glass-panel p-8 max-w-sm w-full rounded-lg border border-white/10 shadow-2xl">
              <h3 className="font-display text-lg text-on-surface font-bold uppercase tracking-widest mb-4">
                Tune Metric Value
              </h3>
              <p className="font-sans text-xs text-on-surface-variant/80 mb-4 uppercase">
                Adjust the reactive asset coefficient for calculations:
              </p>
              
              <div className="mb-6">
                <label className="block text-xs font-semibold tracking-widest text-on-surface-variant mb-2 uppercase">
                  {editingKey}
                </label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="range"
                    min="1"
                    max={editingKey === "valuation" ? "200" : (editingKey === "noi" ? "20" : "15")}
                    step="0.05"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-tertiary focus:outline-none"
                  />
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-20 bg-surface-container-low border border-white/10 rounded p-1 font-mono text-xs text-tertiary text-center focus:outline-none focus:border-tertiary"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button 
                  className="px-4 py-2 border border-white/5 text-on-surface-variant text-xs font-semibold tracking-wider hover:text-on-surface uppercase rounded"
                  onClick={() => setEditingKey(null)}
                >
                  CANCEL
                </button>
                <button 
                  className="px-4 py-2 bg-tertiary text-on-primary text-xs font-semibold tracking-wider hover:opacity-95 uppercase rounded"
                  onClick={handleSaveEdit}
                  id="btn-confirm-tune"
                >
                  CONFIRM
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yield Forecasting & Risk Analysis Spectrum Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16" id="section-graphics-forecasting">
        
        {/* Yield Forecasting Interactive Chart */}
        <div className="lg:col-span-8 glass-panel p-8 md:p-10 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
            <h3 className="font-sans text-xs font-semibold text-on-surface tracking-[0.25em] uppercase">10-Year Yield Forecasting</h3>
            <div className="flex gap-1 p-1 bg-surface-container-lowest rounded-full border border-white/5 w-max">
              {(["CONSERVATIVE", "TARGET SCENARIO", "BULL CASE"] as SimulationScenario[]).map((scen) => (
                <button
                  key={scen}
                  id={`btn-${scen.toLowerCase().replace(" ", "-")}`}
                  className={`px-4 py-1.5 rounded-full font-sans text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                    scenario === scen 
                      ? "bg-tertiary/20 text-tertiary shadow" 
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                  onClick={() => onChangeScenario(scen)}
                >
                  {scen}
                </button>
              ))}
            </div>
          </div>

          {/* SVG-based Dynamic Bar Chart */}
          <div className="relative h-64 w-full flex items-end gap-1 px-2" id="forecasting-chart-container">
            {forecastBars.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full relative group">
                {/* Visual bar height container with tooltip */}
                <motion.div 
                  initial={{ height: "0%" }}
                  animate={{ height: `${bar.height}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  style={{
                    backgroundColor: bar.isExit 
                      ? "rgba(255, 255, 255, 0.05)" 
                      : bar.isHighlight 
                        ? `rgba(0, 220, 230, ${0.2 + (i * 0.15)})`
                        : "rgba(0, 220, 230, 0.1)"
                  }}
                  className={`w-full rounded-t-xs hover:brightness-130 transition-all duration-300 relative border-t ${
                    bar.isExit ? "border-white/10" : "border-tertiary/40"
                  }`}
                >
                  {/* Glowing highlights for premium touch */}
                  {bar.isHighlight && (
                    <span className="absolute inset-x-0 top-0 h-1 bg-tertiary shadow-[0_0_10px_#00dce6]" />
                  )}
                  {bar.isExit && (
                    <span className="absolute inset-x-0 top-0 h-[1.5px] bg-white/20" />
                  )}

                  {/* Micro-hover metric banner */}
                  <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 transform -translate-x-1/2 bg-background-obsidian border border-white/10 px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap text-tertiary shadow-xl pointer-events-none transition-opacity duration-350 z-10">
                    Year Yield: {(metrics.capRate * (bar.height / 50)).toFixed(2)}%
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6 font-mono text-[9px] text-on-surface-variant/40 tracking-wider">
            <span>YEAR 0</span>
            <span>YEAR 2</span>
            <span>YEAR 4</span>
            <span>YEAR 6</span>
            <span>YEAR 8</span>
            <span>EXIT (Y10)</span>
          </div>

          <div className="grid grid-cols-2 mt-12 gap-8 border-t border-white/5 pt-8">
            <div>
              <p className="font-sans text-[10px] font-light tracking-widest text-on-surface-variant mb-1 uppercase">PROJECTED IRR</p>
              <p className="font-display text-2xl lg:text-3xl text-on-surface font-semibold">{computedIRR}%</p>
            </div>
            <div>
              <p className="font-sans text-[10px] font-light tracking-widest text-on-surface-variant mb-1 uppercase">EQUITY MULTIPLE</p>
              <p className="font-display text-2xl lg:text-3xl text-on-surface font-semibold">{computedEquityMultiple}x</p>
            </div>
          </div>
        </div>

        {/* Risk Analysis Heatmap & Radar Spectrum */}
        <div className="lg:col-span-4 glass-panel p-8 md:p-10 rounded-lg flex flex-col justify-between min-h-[500px]" id="card-risk-spectrum">
          <h3 className="font-sans text-xs font-semibold text-on-surface tracking-[0.25em] uppercase mb-10">Risk Analysis Spectrum</h3>
          
          {/* Radar Spider Web Grid Area */}
          <div className="flex-grow flex items-center justify-center relative min-h-[200px]">
            <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-[0_0_10px_rgba(0,220,230,0.15)]">
              {/* Outer boundary lines (Spider Net Circle ticks) */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255, 255, 255, 0.04)" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255, 255, 255, 0.04)" />
              <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(255, 255, 255, 0.04)" />

              {/* Spider skeleton axes lines */}
              <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255, 255, 255, 0.06)" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255, 255, 255, 0.06)" />

              {/* Dynamic radar polygon shape mapping to coordinates */}
              <motion.polygon 
                points={radarPoints}
                fill="rgba(0, 220, 230, 0.15)"
                stroke="#00dce6"
                strokeWidth="1.5"
                animate={{ points: radarPoints }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
              />
            </svg>

            {/* Labels placed absolutely around the radar circle */}
            <span className="absolute top-1 font-mono text-[9px] tracking-wider text-on-surface-variant font-semibold">MARKET</span>
            <span className="absolute bottom-1 font-mono text-[9px] tracking-wider text-on-surface-variant font-semibold">GEOPOLITICAL</span>
            <span className="absolute right-1 font-mono text-[9px] tracking-wider text-on-surface-variant font-semibold">OPERATIONAL</span>
            <span className="absolute left-1 font-mono text-[9px] tracking-wider text-on-surface-variant font-semibold">LEGAL</span>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center text-sm font-mono text-xs">
              <span className="text-on-surface-variant tracking-wider">Volatility Index</span>
              <span className="text-tertiary font-bold tracking-widest font-sans text-xs">
                {scenario === "CONSERVATIVE" ? "MODERATE" : "LOW"}
              </span>
            </div>
            <div className="h-[1px] bg-white/5 w-full" />
            <div className="flex justify-between items-center text-sm font-mono text-xs">
              <span className="text-on-surface-variant tracking-wider">Occupancy Risk</span>
              <span className="text-on-surface font-semibold tracking-widest font-sans text-xs text-right">
                {scenario === "CONSERVATIVE" ? "HIGH" : (scenario === "BULL CASE" ? "LOW" : "MODERATE")}
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* Tax & Structural Breakdown Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16" id="section-breakdown-image">
        
        {/* Structural Breakdown parameters */}
        <div className="glass-panel p-8 md:p-10 rounded-lg flex flex-col justify-center">
          <h3 className="font-sans text-xs font-semibold text-on-surface tracking-[0.25em] uppercase mb-8">Structural Breakdown</h3>
          <div className="space-y-6">
            
            {/* OWNERSHIP STRUCTURE */}
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <div>
                <p className="font-sans text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase">OWNERSHIP STRUCTURE</p>
                <p className="font-sans text-base text-on-surface mt-2 font-medium">{asset.ownership}</p>
              </div>
              <span className="material-symbols-outlined text-tertiary animate-pulse">verified_user</span>
            </div>

            {/* DEPRECIATION SCHEDULE */}
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <div>
                <p className="font-sans text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase">DEPRECIATION SCHEDULE</p>
                <p className="font-sans text-base text-on-surface mt-2 font-medium">{asset.depreciation}</p>
              </div>
              <span className="font-mono text-sm font-bold text-tertiary">
                ${(metrics.valuation * 0.0363).toFixed(2)}M / Yr
              </span>
            </div>

            {/* TAX EFFICIENCY METRIC */}
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <div>
                <p className="font-sans text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase">TAX EFFICIENCY METRIC</p>
                <p className="font-sans text-base text-on-surface mt-2 font-medium">Obsidian Shield Protocol</p>
              </div>
              <span className="font-mono text-sm font-bold text-tertiary">{asset.taxEfficiency}%</span>
            </div>

          </div>
        </div>

        {/* Visual Asset Card with hover zoom */}
        <div className="rounded-lg overflow-hidden relative group h-[380px] border border-white/5" id="card-physical-asset-image">
          <img 
            alt={asset.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            src={asset.image}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-obsidian via-black/30 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <div className="space-y-2">
              <span className="px-2 py-1 border border-tertiary text-tertiary font-sans text-[8px] font-bold tracking-widest uppercase block w-max bg-background-obsidian/30 glass-panel">
                {asset.grade}
              </span>
              <h4 className="font-display text-2xl font-bold text-on-surface">{asset.name}</h4>
              <p className="font-mono text-xs text-on-surface-variant/80 tracking-wide">{asset.location}</p>
            </div>
            
            <div className="bg-background-obsidian/40 rounded-full p-2 glass-panel border border-white/10">
              <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
            </div>
          </div>
        </div>

      </section>

      {/* Cash Flow Ledger Table Ledger */}
      <section className="mb-16" id="section-cashflow-ledger">
        <h3 className="font-sans text-xs font-semibold text-on-surface tracking-[0.25em] uppercase mb-8">Quarterly Cash Flow Ledger</h3>
        
        <div className="glass-panel rounded-lg overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-white/10 text-on-surface-variant">
                  <th className="p-6 font-sans text-[10px] font-bold tracking-widest uppercase text-left">PERIOD</th>
                  <th className="p-6 font-sans text-[10px] font-bold tracking-widest uppercase text-left">GROSS REVENUE</th>
                  <th className="p-6 font-sans text-[10px] font-bold tracking-widest uppercase text-left">OPEX</th>
                  <th className="p-6 font-sans text-[10px] font-bold tracking-widest uppercase text-left">DISTRIBUTION</th>
                  <th className="p-6 font-sans text-[10px] font-bold tracking-widest uppercase text-left">YIELD</th>
                  <th className="p-6 font-sans text-[10px] font-bold tracking-widest uppercase text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-sm text-on-surface">
                {ledgerRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6 font-sans font-medium text-on-surface">{row.period}</td>
                    <td className="p-6">${Math.round(row.grossRevenue).toLocaleString()}</td>
                    <td className="p-6 text-red-400">(${Math.round(Math.abs(row.opex)).toLocaleString()})</td>
                    <td className="p-6 text-tertiary">${Math.round(row.distribution).toLocaleString()}</td>
                    <td className="p-6">{row.yieldRate.toFixed(1)}%</td>
                    <td className="p-6 text-right">
                      <span className="px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] rounded-full font-sans font-semibold tracking-widest">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Collapse/Expand historical ledger trigger */}
          <div className="p-6 bg-surface-container-lowest text-center border-t border-white/5">
            <button 
              className="font-sans text-xs font-semibold tracking-[0.2em] text-on-surface-variant hover:text-tertiary transition-all cursor-pointer"
              onClick={() => setShowHistorical(!showHistorical)}
              id="btn-load-historical"
            >
              {showHistorical ? "COLLAPSE HISTORY" : "LOAD HISTORICAL DATA (2020-2023)"}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
