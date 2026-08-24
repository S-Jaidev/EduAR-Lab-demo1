import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.warn("Failed to initialize Gemini client:", e);
      return null;
    }
  }
  return aiClient;
}

// Fallback intelligent response generator for offline or high-demand periods
function getFallbackTutorResponse(
  question: string,
  context?: { voltage?: number; resistance?: number; current?: number; switchClosed?: boolean }
): string {
  const q = question.toLowerCase();
  const v = context?.voltage ?? 5;
  const r = context?.resistance ?? 10;
  const i = context?.current ?? +(v / r).toFixed(2);
  const isClosed = context?.switchClosed !== false;

  if (!isClosed) {
    return `Notice that the circuit switch is currently **open** (plug key removed). In an open circuit, the electrical loop is broken so the electric field cannot sustain electron flow ($I = 0.00\\text{ A}$). Tap the **Circuit Switch Key** to close the circuit and watch the current surge!`;
  }

  if (q.includes("bright") || q.includes("bulb") || q.includes("glow") || q.includes("light") || q.includes("dim")) {
    const power = (v * i).toFixed(2);
    return `When voltage is **${v}V** and resistance is **${r}Ω**, the current flowing through the filament is **${i}A**.\n\nAccording to Joule's Law of heating and electrical power ($P = V \\times I = I^2 \\times R$), the power dissipated is **${power} Watts**.\n\n• **Increasing Voltage**: Pushes more coulombs per second through the tungsten filament, dissipating more heat and making the bulb glow brighter.\n• **Increasing Resistance**: Reduces the current flow rate, causing the lamp to dim.`;
  }

  if (q.includes("formula") || q.includes("equation") || q.includes("law") || q.includes("statement") || q.includes("definition")) {
    return `**Ohm's Law (Georg Simon Ohm, 1827)**:\nThe electric current ($I$) flowing through a metallic conductor is directly proportional to the potential difference ($V$) across its ends, provided its temperature remains constant.\n\n**Key Formulas**:\n1. $V = I \\times R$ (Potential Difference)\n2. $I = \\frac{V}{R}$ (Electric Current)\n3. $R = \\frac{V}{I}$ (Resistance)\n\nIn your live experiment: $V = ${v}\\text{V}$ and $R = ${r}\\Omega$, producing $I = \\frac{${v}}{${r}} = ${i}\\text{ A}$.`;
  }

  if (q.includes("resistance") || q.includes("resistor") || q.includes("rheostat") || q.includes("maximum") || q.includes("increase")) {
    return `**Resistance ($R$)** is the property of a conductor to resist the flow of charges through it. Its SI unit is the Ohm ($\\Omega$).\n\n• **Direct factors**: Resistance depends on the conductor's length ($R \\propto L$), inversely on its cross-sectional area ($R \\propto \\frac{1}{A}$), and material resistivity ($\\rho$).\n• **Current relationship**: By $I = \\frac{V}{R}$, current is inversely proportional to resistance. At your current ${v}V setting, doubling resistance will halve the current from ${i}A to ${(i / 2).toFixed(2)}A.`;
  }

  if (q.includes("slope") || q.includes("graph") || q.includes("v-i") || q.includes("linear") || q.includes("axis")) {
    return `On a **$V$-$I$ characteristic graph**:\n• Potential Difference ($V$) is plotted on the Y-axis and Current ($I$) on the X-axis.\n• For an ohmic conductor, this yields a straight line passing through the origin $(0,0)$.\n• The **slope of the line** ($\\text{Slope} = \\frac{\\Delta V}{\\Delta I}$) equals the **Resistance ($R$)** in Ohms ($\\Omega$). A steeper slope indicates higher resistance!`;
  }

  if (q.includes("ammeter") || q.includes("voltmeter") || q.includes("connect") || q.includes("series") || q.includes("parallel")) {
    return `**Laboratory Meter Placement Rules**:\n1. **Ammeter**: Always connected in **series** with the circuit because it has very low internal resistance and must measure the entire rate of charge flow through the loop.\n2. **Voltmeter**: Always connected in **parallel** across the resistor or component because it has very high internal resistance and measures the potential difference without drawing significant current.`;
  }

  if (q.includes("temperature") || q.includes("nichrome") || q.includes("wire") || q.includes("joule") || q.includes("heat")) {
    return `When current $I = ${i}\\text{ A}$ passes through the resistor for time $t$, the heat generated is governed by **Joule's Law of Heating**: $H = I^2 \\times R \\times t$.\n\nIn standard conductors, as temperature rises, atomic vibrations increase, resulting in more frequent electron collisions and an increase in resistance. That's why Ohm's Law specifies "at constant temperature".`;
  }

  return `In your active virtual apparatus, an applied potential difference of **${v}V** across a **${r}Ω** resistance produces a measured current of **${i}A** ($I = \\frac{V}{R} = \\frac{${v}}{${r}} = ${i}\\text{ A}$).\n\n💡 **Inquiry Challenge**: Try moving the voltage slider up to **12.0V** or toggling the resistance presets to observe the change in the ammeter gauge and electron drift velocity!`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "EduAR Lab",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Tutor chat endpoint
  app.post("/api/ai-tutor", async (req, res) => {
    const { message, context, history } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing or invalid message parameter." });
      return;
    }

    const client = getGeminiClient();

    if (!client) {
      // Return simulated intelligent physics tutor fallback
      const reply = getFallbackTutorResponse(message, context);
      res.json({
        reply,
        source: "local-tutor-engine",
        status: "success",
      });
      return;
    }

    const v = context?.voltage ?? 5;
    const r = context?.resistance ?? 10;
    const i = context?.current ?? +(v / r).toFixed(2);
    const isClosed = context?.switchClosed !== false;

    const systemInstruction = `You are "Professor AR", the friendly, highly encouraging and scientifically precise AI Laboratory Tutor for "EduAR Lab" (an educational AR learning platform for Class 10 Science).
The student is currently interacting with a virtual 3D Ohm's Law circuit simulation with the following LIVE parameters:
- Applied Voltage (V): ${v} Volts
- Circuit Resistance (R): ${r} Ohms
- Measured Current (I): ${i} Amperes (Calculated via I = V / R)
- Switch Status: ${isClosed ? "CLOSED (Current is flowing)" : "OPEN (Circuit broken, 0A)"}

Guidelines:
1. Explain physics concepts clearly using Ohm's Law ($V = I \\times R$), concise formatting, bullet points, and real-world analogies.
2. Directly reference the student's live laboratory numbers (${v}V, ${r}Ω, ${i}A) to make the learning grounded and immediate.
3. Keep responses pedagogical, engaging, and under 150 words unless the student asks for a deep derivation.
4. Foster inquiry: suggest an interactive action with the sliders (e.g. "Try doubling your voltage to see what happens to the ammeter!").`;

    const conversationPrompt = `Student question: "${message}"`;

    // Resilient fallback candidate models in order of preference
    const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let generatedReply: string | null = null;
    let usedModel: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: conversationPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          generatedReply = response.text;
          usedModel = modelName;
          break;
        }
      } catch (modelErr: any) {
        console.warn(`Model ${modelName} returned temporary error, attempting next candidate:`, modelErr?.message || modelErr);
      }
    }

    if (generatedReply) {
      res.json({
        reply: generatedReply,
        source: usedModel || "gemini",
        status: "success",
      });
      return;
    }

    // If all online models hit temporary demand limits, provide seamless expert physics response
    const fallbackReply = getFallbackTutorResponse(message, context);
    res.json({
      reply: fallbackReply,
      source: "local-physics-intelligence",
      status: "success",
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduAR Lab server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start EduAR Lab server:", err);
});
