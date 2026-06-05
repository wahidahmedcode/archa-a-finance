/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { NavTab } from "../types";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenWallet: () => void;
}

export default function Header({ activeTab, setActiveTab, onOpenWallet }: HeaderProps) {
  const tabs: NavTab[] = ["PORTFOLIO", "DASHBOARD", "ASSETS", "INSIGHTS"];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background-obsidian/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 md:px-20 h-20">
      {/* Brand Logo */}
      <div 
        className="font-display text-2xl font-bold tracking-tighter text-on-surface uppercase cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setActiveTab("DASHBOARD")}
        id="nav-logo"
      >
        AETERNA
      </div>

      {/* Nav Actions */}
      <div className="hidden md:flex gap-10 h-full items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              id={`nav-tab-${tab.toLowerCase()}`}
              className={`font-sans text-xs font-semibold tracking-[0.2em] relative py-2 cursor-pointer transition-colors ${
                isActive ? "text-tertiary" : "text-on-surface-variant hover:text-on-surface"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-tertiary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Auxiliary Actions & Avatar */}
      <div className="flex items-center gap-6">
        {/* Notifications mock icon */}
        <button 
          className="relative text-on-surface-variant hover:text-tertiary transition-colors cursor-pointer group"
          title="System Notifications"
          id="btn-notifications"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-tertiary rounded-full animate-ping" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-tertiary rounded-full" />
          
          {/* Tooltip drawer dropdown */}
          <div className="absolute right-0 top-10 w-64 p-4 rounded bg-surface-container-high border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 text-left text-xs glass-panel shadow-2xl">
            <h4 className="font-bold tracking-wider text-on-surface border-b border-white/5 pb-2 mb-2 uppercase">Aeterna Feed</h4>
            <div className="space-y-2 text-on-surface-variant">
              <p>• Portfolio target scenario synchronized successfully.</p>
              <p>• Luxembourg SPV Year 3 tax yield validated (94.2%).</p>
            </div>
          </div>
        </button>

        {/* Dynamic Wallet Triggered Panel */}
        <button 
          className="text-on-surface-variant hover:text-tertiary transition-colors cursor-pointer group relative"
          onClick={onOpenWallet}
          title="Digital Hedges"
          id="btn-wallet"
        >
          <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          <div className="absolute right-0 top-10 w-48 p-4 rounded bg-surface-container-high border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 text-left text-xs glass-panel shadow-2xl">
            <p className="text-on-surface-variant mb-1">Escrow Cash Ledger</p>
            <p className="font-mono text-tertiary font-bold text-sm">$3,640,000</p>
          </div>
        </button>

        {/* User profile avatar image */}
        <div 
          className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden cursor-pointer hover:border-tertiary transition-all"
          id="user-profile-avatar"
          onClick={() => setActiveTab("INSIGHTS")}
        >
          <img 
            alt="User profile avatar" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuARZyYxuLoI5wBLwuIebHikFl9Eo8KDr6msayxmNvBMt27-fuyyQwtQDhlhx8CCum9_Aw1oiBfZmR7_w44N_ygpBluVvUdDP2_Y3YFG4B9PMCcCnt7teMhvttL7mHXC8GAVDJloPYRCr7cw3Lem_YOfkIOdJEo-eG6Kc2MyPnEZn2Ib_-z6iex6lnuAmLCQPLXX6u3bWMGclSlQ865oIZFJoCwOFIfm3fPCYzyW8nukDo4FHpHme87AL7JbSpLNRvsUqh1S2MEZekll"
          />
        </div>
      </div>
    </nav>
  );
}
