/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SimulationScenario = "CONSERVATIVE" | "TARGET SCENARIO" | "BULL CASE";

export type NavTab = "PORTFOLIO" | "DASHBOARD" | "ASSETS" | "INSIGHTS";

export interface ValuationMetrics {
  valuation: number;    // In Millions (e.g., 42.45)
  yoyTrend: number;     // Percentage (e.g., 12.4)
  noi: number;          // In Millions (e.g., 3.82)
  capRate: number;      // Percentage (e.g., 4.85)
}

export interface ForecastYear {
  year: string;
  projectedValue: number; // For visualization height
  percentIncrease: number;
}

export interface RiskSpectrum {
  market: number;       // Radar coordinate level 1-10
  geopolitical: number; // Radar coordinate level 1-10
  operational: number;  // Radar coordinate level 1-10
  legal: number;        // Radar coordinate level 1-10
  volatilityIndex: "LOW" | "MODERATE" | "HIGH";
  occupancyRisk: "LOW" | "MODERATE" | "HIGH";
}

export interface CashFlowRow {
  period: string;
  grossRevenue: number;
  opex: number;
  distribution: number;
  yieldRate: number;
  status: "DISBURSED" | "PENDING" | "REBALANCING";
}

export interface AssetData {
  id: string;
  name: string;
  location: string;
  grade: string;
  valuation: number;
  noi: number;
  capRate: number;
  irr: number;
  equityMultiple: number;
  image: string;
  description: string;
  ownership: string;
  depreciation: string;
  taxEfficiency: number;
}
