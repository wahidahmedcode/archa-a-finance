import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize the Gemini client lazily on the server
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API endpoint for financial insights
  app.post("/api/insights", async (req: express.Request, res: express.Response) => {
    try {
      const { valuation, noi, capRate, scenario, message } = req.body;

      if (!ai) {
        // Return ultra-premium custom mock advice if key is not selected yet
        return res.json({
          text: `### **PORTFOLIO INTENT & VALUATION REVIEW**
The model is simulating a valuation of **$${valuation}M** at an annualized run-rate NOI of **$${noi}M** (${scenario || "TARGET SCENARIO"} Mode). This yields an implied Cap Rate of **${capRate}%**, which aligns beautifully with Class A+ ultra-luxury real estate benchmarks in high-density European architectural corridors.

### **TAX STRUCTURE & REBALANCE STRATEGY**
To sustain a **94.2% tax efficiency rating** via the *Obsidian Shield Protocol*, we recommend the following strategic actions:
1. **Accelerated Reinvestment**: Channel surplus distributions from the Luxembourg SPV directly into Tier-1 physical hedges.
2. **MACRS Recapture Optimization**: Continue linear 27.5-year depreciation schedules to offset capital gain events at Year 10.

### **RISK MITIGATION SENSITIVITY**
- **Volatility index** remains **LOW** thanks to long-term digital asset-tenancies.
- **Occupancy Risk** remains **MODERATE** due to high demand for neo-modernist spaces.
- **Operational Risk** is stabilized with structural glass-envelopes requiring nominal maintenance.

*Note: Configure your GEMINI_API_KEY in the Secrets panel to unlock custom live intelligence stream from the Aeterna AI Core.*`
        });
      }

      const prompt = `You are the Aeterna Financial Intelligence AI Advisor, a world-class luxury real estate portfolio strategist specializing in ultra-high-net-worth investments.
We are analyzing our primary asset, "The Obsidian Prism" (located at 64th Avenue, Neo-Berlin District, structural rating Class A+).

Here are the current core metrics being modeled in our simulator:
- Current Valuation: $${valuation}M
- Net Operating Income (NOI): $${noi}M
- Capitalization Rate: ${capRate}%
- Selected Simulation Scenario: ${scenario}

The investor has asked you the following: "${message || "What is your strategic evaluation of this asset and how can we optimize rebalancing?"}"

Provide a highly sophisticated, concise, and professional real estate analysis.
Include the following sections:
1. ### **PORTFOLIO INTENT & VALUATION REVIEW**: A summary of what these metrics mean.
2. ### **TAX STRUCTURE & REBALANCE STRATEGY**: Concrete, realistic actions considering the Luxembourg SPV and the MACRS 27.5-Year Linear depreciation schedule.
3. ### **RISK MITIGATION SENSITIVITY**: Analysis of the risks (Volatility Index, Occupancy, Geopolitical, Operational, etc.).

Structure your response perfectly in clean Markdown as shown above. Accentuate with elegant financial terminology. Always maintain an objective, prestigious, elite tone.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error in /api/insights:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Serve static files and/or Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
