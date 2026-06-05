/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface RebalanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
}

export default function RebalanceDrawer({ isOpen, onClose, assetName }: RebalanceDrawerProps) {
  // Percentage models for allocations adding up to 100
  const [realEstate, setRealEstate] = useState(70);
  const [liquidCash, setLiquidCash] = useState(15);
  const preciousMetals = useMemo(() => {
    return Math.max(0, 100 - realEstate - liquidCash);
  }, [realEstate, liquidCash]);

  const [isAligning, setIsAligning] = useState(false);
  const [alignedSuccess, setAlignedSuccess] = useState(false);

  // Dynamic portfolio yield projection based on percentages
  const weightedProjectionWeight = useMemo(() => {
    // RE yields 4.85%, cash yields 2.5%, metals yield 1.0%
    const reYield = realEstate * 0.0485;
    const cashYield = liquidCash * 0.025;
    const metalYield = preciousMetals * 0.01;
    return (reYield + cashYield + metalYield).toFixed(2);
  }, [realEstate, liquidCash, preciousMetals]);

  const handleTriggerRealignment = () => {
    setIsAligning(true);
    setTimeout(() => {
      setIsAligning(false);
      setAlignedSuccess(true);
      setTimeout(() => {
        setAlignedSuccess(false);
        onClose();
      }, 2000);
    }, 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop glass blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background-obsidian/60 backdrop-blur-sm z-55"
          />

          {/* Sliding panel drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 max-w-md w-full bg-surface-container-high border-l border-white/10 z-56 p-8 flex flex-col justify-between glass-panel shadow-2xl"
            id="rebalance-drawer-panel"
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-display text-lg font-bold tracking-widest text-on-surface uppercase">
                  Rebalance Simulator
                </h3>
                <button 
                  onClick={onClose}
                  className="text-on-surface-variant hover:text-tertiary transition-colors cursor-pointer"
                  id="btn-close-rebalance"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed">
                Tweak capital placement ratios for of **{assetName}** to simulate the optimal risk-to-yield ratio.
              </p>
            </div>

            {/* Simulated sliders body */}
            <div className="flex-grow my-8 space-y-6">
              
              {/* Slider 1: Real Estate */}
              <div className="space-y-3">
                <div className="flex justify-between font-mono text-xs tracking-wider">
                  <span className="text-on-surface uppercase">Real Estate Assets ({assetName})</span>
                  <span className="text-tertiary font-bold">{realEstate}%</span>
                </div>
                <input 
                  type="range"
                  min="30"
                  max="80"
                  value={realEstate}
                  onChange={(e) => setRealEstate(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-tertiary focus:outline-none"
                />
              </div>

              {/* Slider 2: Liquid Cash Escrow */}
              <div className="space-y-3">
                <div className="flex justify-between font-mono text-xs tracking-wider">
                  <span className="text-on-surface uppercase">Liquid Cash Escrow</span>
                  <span className="text-tertiary font-bold">{liquidCash}%</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="40"
                  value={liquidCash}
                  onChange={(e) => setLiquidCash(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-tertiary focus:outline-none"
                />
              </div>

              {/* Readonly precious metals */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs tracking-wider">
                  <span className="text-on-surface-variant/70 uppercase">Precious Hedges (Gold/Titanium)</span>
                  <span className="text-on-surface font-semibold">{preciousMetals}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-lg overflow-hidden relative">
                  <div 
                    style={{ width: `${preciousMetals}%` }}
                    className="h-full bg-white/30"
                  />
                </div>
              </div>

              {/* Computed parameter */}
              <div className="glass-panel p-6 rounded-lg border border-white/5 bg-background-obsidian/40 text-center space-y-2 mt-8">
                <span className="block font-sans text-[10px] tracking-widest text-on-surface-variant uppercase">
                  SIMULATED COMBINED PORTFOLIO YIELD
                </span>
                <span className="block font-display text-4xl font-bold text-tertiary">
                  {weightedProjectionWeight}%
                </span>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {alignedSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-500/10 border border-green-500/30 rounded p-4 text-center text-green-300 font-sans text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Ledgers Realigned Successfully
                  </motion.div>
                ) : isAligning ? (
                  <div className="bg-tertiary/10 border border-tertiary/30 rounded p-4 text-center text-tertiary font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    EXECUTING REALIGNMENT SWEEPS...
                  </div>
                ) : (
                  <button 
                    onClick={handleTriggerRealignment}
                    className="w-full py-4 bg-tertiary text-on-primary font-sans text-xs font-semibold tracking-[0.2em] hover:opacity-90 transition-all uppercase rounded-xs cursor-pointer"
                    id="btn-rebalance-submit"
                  >
                    Trigger Portfolio Realignment
                  </button>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
