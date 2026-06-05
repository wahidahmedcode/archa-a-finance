/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { AssetData, ValuationMetrics } from "../types";

interface AssetsProps {
  activeAsset: AssetData;
  metrics: ValuationMetrics;
  onUpdateMetric: (key: keyof ValuationMetrics, value: number) => void;
}

export default function Assets({ activeAsset, metrics, onUpdateMetric }: AssetsProps) {
  // Local sliders for structural tuning
  const [debtRatio, setDebtRatio] = useState(55); // % Leverage
  const [mYears, setMYears] = useState(activeAsset.id === "obsidian-prism" ? 27.5 : (activeAsset.id === "ivory-monolith" ? 30 : 39));
  const [reserveRatio, setReserveRatio] = useState(15); // % Capital reserve

  // Calculations
  const calculatedTaxSavings = useMemo(() => {
    // Valuation * constant * factor depending on years select
    const baseSavings = metrics.valuation * 0.0544; // Max hypothetical write-off
    const factor = 27.5 / mYears;
    return (baseSavings * factor).toFixed(2);
  }, [metrics.valuation, mYears]);

  const debtServiceCost = useMemo(() => {
    // Interest expense based on leverage
    const principal = metrics.valuation * (debtRatio / 100);
    const rate = 0.042; // Borrowing cost
    return (principal * rate).toFixed(2);
  }, [metrics.valuation, debtRatio]);

  const cashReservesAmount = useMemo(() => {
    return (metrics.valuation * (reserveRatio / 100)).toFixed(2);
  }, [metrics.valuation, reserveRatio]);

  const combinedTaxEfficiency = useMemo(() => {
    // Multi-factor tax efficiency percentage calculation
    const leverageBonus = (debtRatio - 40) * 0.15;
    const yearsPenalty = (27.5 - mYears) * 0.35;
    const baseEfficiency = activeAsset.taxEfficiency;
    return Math.min(100, Math.max(70, baseEfficiency + leverageBonus + yearsPenalty)).toFixed(1);
  }, [debtRatio, mYears, activeAsset]);

  return (
    <div className="space-y-12" id="assets-viewport">
      
      {/* Intro Header */}
      <header className="space-y-4">
        <nav className="font-sans text-xs font-semibold tracking-[0.2em] text-on-surface-variant/60 uppercase">
          AETERNA / PARAMETRIC ASSET AUDIT
        </nav>
        <h1 className="font-display text-4xl font-bold text-on-surface">
          Structural Engineering Panel
        </h1>
        <p className="font-sans text-lg font-light tracking-[0.05em] text-on-surface-variant max-w-3xl">
          Conduct deep analytical exploration of the asset holding frameworks. Optimize leverage parameters, accelerated depreciation schedules, and escrow margins to rebalance core tax-shields.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sliders left column (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="glass-panel p-8 rounded-lg border border-white/5 space-y-8">
            <h3 className="font-sans text-xs font-semibold tracking-widest text-on-surface uppercase mb-6">
              Holding Framework Controls ({activeAsset.ownership})
            </h3>

            {/* Slider 1: Debt Ratio */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
                  Debt-to-Equity Leverage Ratio
                </label>
                <span className="font-mono text-sm text-tertiary font-bold">{debtRatio}%</span>
              </div>
              <input 
                type="range"
                min="10"
                max="90"
                value={debtRatio}
                onChange={(e) => setDebtRatio(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-tertiary focus:outline-none"
              />
              <p className="font-sans text-[11px] font-light text-on-surface-variant/50 uppercase tracking-widest">
                Optimizes return on equity (ROE) balanced against interest servicing thresholds.
              </p>
            </div>

            {/* Slider 2: MACRS Lifespan */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
                  Accelerated Depreciation Schedule Lifecycle
                </label>
                <span className="font-mono text-sm text-tertiary font-bold">{mYears} Years</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[15, 27.5, 39].map((years) => (
                  <button
                    key={years}
                    onClick={() => setMYears(years)}
                    className={`p-3 text-center rounded border font-mono text-xs tracking-widest cursor-pointer transition-all ${
                      mYears === years 
                        ? "border-tertiary text-tertiary bg-tertiary/10" 
                        : "border-white/5 text-on-surface-variant hover:border-white/20"
                    }`}
                  >
                    {years} YR
                  </button>
                ))}
              </div>
              <p className="font-sans text-[11px] font-light text-on-surface-variant/50 uppercase tracking-widest">
                Adjusts capital-expenditure recovery windows relative to Luxembourg offshore treaties.
              </p>
            </div>

            {/* Slider 3: Escrow Reserve */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="font-mono text-xs text-on-surface-variant tracking-wider uppercase">
                  Cash Escrow Reinvestment Target Level
                </label>
                <span className="font-mono text-sm text-tertiary font-bold">{reserveRatio}%</span>
              </div>
              <input 
                type="range"
                min="5"
                max="40"
                value={reserveRatio}
                onChange={(e) => setReserveRatio(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-tertiary focus:outline-none"
              />
              <p className="font-sans text-[11px] font-light text-on-surface-variant/50 uppercase tracking-widest">
                Locks cash distributions temporarily in high-custody capital reserves.
              </p>
            </div>

          </div>

        </div>

        {/* Dynamic breakdown outcome card right column (4/12) */}
        <div className="lg:col-span-4 space-y-8 flex flex-col justify-between">
          
          {/* Dynamic computed parameters card */}
          <div className="glass-panel p-8 rounded-lg border border-white/5 space-y-6 flex-grow flex flex-col justify-center">
            
            <h4 className="font-sans text-xs font-semibold tracking-widest text-on-surface uppercase border-b border-white/5 pb-4">
              Computed Structural Outcomes
            </h4>

            {/* Metric A */}
            <div className="space-y-1">
              <span className="block font-sans text-[10px] tracking-widest text-on-surface-variant uppercase">
                Optimized Portfolio Tax Shield
              </span>
              <span className="block font-display text-3xl font-bold text-on-surface">
                {combinedTaxEfficiency}%
              </span>
            </div>

            {/* Metric B */}
            <div className="space-y-1">
              <span className="block font-sans text-[10px] tracking-widest text-on-surface-variant uppercase">
                Annual MACRS Write-Off
              </span>
              <span className="block font-display text-3xl font-bold text-tertiary">
                ${calculatedTaxSavings}M <span className="text-sm font-sans font-normal text-on-surface-variant">/ Year</span>
              </span>
            </div>

            {/* Metric C */}
            <div className="space-y-1">
              <span className="block font-sans text-[10px] tracking-widest text-on-surface-variant uppercase">
                Calculated Interest Servicing Cost
              </span>
              <span className="block font-display text-3xl font-bold text-on-surface">
                ${debtServiceCost}M <span className="text-sm font-sans font-normal text-on-surface-variant">/ Year</span>
              </span>
            </div>

            {/* Metric D */}
            <div className="space-y-1">
              <span className="block font-sans text-[10px] tracking-widest text-on-surface-variant uppercase">
                Escrow Reinvestment Target Cash
              </span>
              <span className="block font-display text-3xl font-bold text-tertiary">
                ${cashReservesAmount}M
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
