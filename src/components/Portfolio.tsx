/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { assetsCatalog } from "../data/assetsData";
import { AssetData } from "../types";

interface PortfolioProps {
  activeAsset: AssetData;
  onSelectAsset: (asset: AssetData) => void;
  tabSwitchToDashboard: () => void;
}

export default function Portfolio({ activeAsset, onSelectAsset, tabSwitchToDashboard }: PortfolioProps) {
  
  const handleSelect = (asset: AssetData) => {
    onSelectAsset(asset);
    tabSwitchToDashboard();
  };

  return (
    <div className="space-y-12" id="portfolio-viewport">
      
      {/* Intro Header */}
      <header className="space-y-4">
        <nav className="font-sans text-xs font-semibold tracking-[0.2em] text-on-surface-variant/60 uppercase">
          AETERNA / PORTFOLIO DIRECTORY
        </nav>
        <h1 className="font-display text-4xl font-bold text-on-surface">
          Global Luxury Digital Twin Portfolio
        </h1>
        <p className="font-sans text-lg font-light tracking-[0.05em] text-on-surface-variant max-w-3xl">
          Secure ownership ledger and performance tracking for Class A+ architectural monuments. Hover and select an asset to inspect financial and rebalancing options.
        </p>
      </header>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="grid-portfolio-cards">
        {assetsCatalog.map((asset) => {
          const isActive = asset.id === activeAsset.id;
          return (
            <div 
              key={asset.id}
              className={`glass-panel rounded-lg overflow-hidden flex flex-col justify-between border group transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                isActive ? "border-tertiary shadow-[0_0_20px_rgba(0,111,255,0.1)]" : "border-white/5 hover:border-white/20"
              }`}
              onClick={() => handleSelect(asset)}
              id={`portfolio-card-${asset.id}`}
            >
              
              {/* Image with zoom and label */}
              <div className="h-56 overflow-hidden relative border-b border-white/5">
                <img 
                  alt={asset.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={asset.image}
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Class A+ label */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2 py-0.5 border border-tertiary text-tertiary bg-background-obsidian/60 backdrop-blur-md font-sans text-[8px] font-bold tracking-widest uppercase rounded-xs">
                    {asset.grade}
                  </span>
                  {isActive && (
                    <span className="px-2 py-0.5 border border-white/10 text-white bg-tertiary/20 backdrop-blur-md font-sans text-[8px] font-bold tracking-widest uppercase rounded-xs">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 font-mono text-[9px] text-on-surface bg-background-obsidian/50 px-2 py-1 glass-panel">
                  {asset.location}
                </div>
              </div>

              {/* Information body text */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display text-xl text-on-surface font-bold group-hover:text-tertiary transition-colors">
                    {asset.name}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed line-clamp-3">
                    {asset.description}
                  </p>
                </div>

                {/* Micro numerical grid */}
                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center font-mono text-[10px]">
                  <div>
                    <span className="block text-[8px] text-on-surface-variant/60 uppercase tracking-widest mb-1">Valuation</span>
                    <span className="text-on-surface font-semibold">${asset.valuation}M</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-on-surface-variant/60 uppercase tracking-widest mb-1">Target Yield</span>
                    <span className="text-tertiary font-bold">{asset.capRate.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-on-surface-variant/60 uppercase tracking-widest mb-1">Target IRR</span>
                    <span className="text-on-surface font-semibold">{asset.irr}%</span>
                  </div>
                </div>
              </div>

              {/* Status / select overlay edge bar */}
              <div 
                className={`py-3 text-center font-sans text-[10px] tracking-[0.15em] font-semibold transition-all ${
                  isActive 
                    ? "bg-tertiary/10 text-tertiary border-t border-tertiary/25" 
                    : "bg-surface-container-low text-on-surface-variant hover:text-on-surface border-t border-white/5"
                }`}
              >
                {isActive ? "SIMULATING PERFORMANCE" : "TAP TO LOAD SIMULATOR"}
              </div>

            </div>
          );
        })}
      </div>
      
      {/* Portfolio overview breakdown stat blocks */}
      <section className="glass-panel p-8 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-6 text-center border border-white/5">
        <div>
          <span className="block font-sans text-xs tracking-widest text-on-surface-variant uppercase mb-1">Total Portfolio Holding Value</span>
          <span className="font-display text-3xl font-bold text-on-surface">$172.55M</span>
        </div>
        <div className="hidden md:block w-[1px] h-12 bg-white/5 self-center mx-auto" />
        <div>
          <span className="block font-sans text-xs tracking-widest text-on-surface-variant uppercase mb-1">Combined Net Operating Income</span>
          <span className="font-display text-3xl font-bold text-tertiary">$14.99M</span>
        </div>
        <div className="hidden md:block w-[1px] h-12 bg-white/5 self-center mx-auto" />
        <div>
          <span className="block font-sans text-xs tracking-widest text-on-surface-variant uppercase mb-1">Average Weighted Cap Rate</span>
          <span className="font-display text-3xl font-bold text-on-surface">4.57%</span>
        </div>
        <div className="hidden md:block w-[1px] h-12 bg-white/5 self-center mx-auto" />
        <div>
          <span className="block font-sans text-xs tracking-widest text-on-surface-variant uppercase mb-1">Aggregated Asset Class SPVs</span>
          <span className="font-display text-3xl font-bold text-tertiary">3 / Tier-1</span>
        </div>
      </section>

    </div>
  );
}
