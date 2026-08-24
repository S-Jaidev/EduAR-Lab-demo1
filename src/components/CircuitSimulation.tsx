import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Bot,
  TrendingUp,
  Table,
  PlusCircle,
  HelpCircle,
  Activity,
  Gauge,
  Lightbulb,
  Power,
  Layers,
  ChevronDown,
  Info,
  Maximize2,
  Award,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DataPoint, CircuitState } from "../types";

interface CircuitSimulationProps {
  onOpenAITutor: (contextData?: { voltage: number; resistance: number; current: number; switchClosed: boolean }) => void;
  onExperimentComplete: (dataPointsCount: number) => void;
}

export const CircuitSimulation: React.FC<CircuitSimulationProps> = ({
  onOpenAITutor,
  onExperimentComplete,
}) => {
  // Primary Circuit States
  const [voltage, setVoltage] = useState<number>(() => {
    const saved = localStorage.getItem("eduar_lab_voltage");
    return saved ? parseFloat(saved) : 5.0;
  });
  const [resistance, setResistance] = useState<number>(() => {
    const saved = localStorage.getItem("eduar_lab_resistance");
    return saved ? parseFloat(saved) : 10.0;
  });
  const [switchClosed, setSwitchClosed] = useState<boolean>(() => {
    const saved = localStorage.getItem("eduar_lab_switch");
    return saved !== null ? saved === "true" : true;
  });
  const [wireCurrentMode, setWireCurrentMode] = useState<"electrons" | "conventional">("electrons");

  // Lab Notebook / Observation Table with localStorage persistence
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(() => {
    const saved = localStorage.getItem("eduar_lab_datapoints");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // use default
      }
    }
    return [
      { id: "dp-1", voltage: 2.0, resistance: 10.0, current: 0.2, power: 0.4, timestamp: "09:12" },
      { id: "dp-2", voltage: 4.0, resistance: 10.0, current: 0.4, power: 1.6, timestamp: "09:14" },
      { id: "dp-3", voltage: 6.0, resistance: 10.0, current: 0.6, power: 3.6, timestamp: "09:16" },
    ];
  });

  const [activeTab, setActiveTab] = useState<"visualizer" | "graph" | "journal">("visualizer");
  const [completedCelebration, setCompletedCelebration] = useState<boolean>(false);

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem("eduar_lab_voltage", voltage.toString());
  }, [voltage]);

  useEffect(() => {
    localStorage.setItem("eduar_lab_resistance", resistance.toString());
  }, [resistance]);

  useEffect(() => {
    localStorage.setItem("eduar_lab_switch", switchClosed.toString());
  }, [switchClosed]);

  useEffect(() => {
    localStorage.setItem("eduar_lab_datapoints", JSON.stringify(dataPoints));
  }, [dataPoints]);

  // Physics Calculations
  const calculatedCurrent = switchClosed ? +(voltage / resistance).toFixed(2) : 0.0;
  const calculatedPower = switchClosed ? +(voltage * calculatedCurrent).toFixed(2) : 0.0;

  // Normalized brightness factor (0.0 to 1.0+)
  // At 0.5A (5V, 10ohm), brightness is ~0.5. At 2A+, it's bright and radiant.
  const brightnessFactor = switchClosed ? Math.min(Math.max(calculatedCurrent / 1.2, 0.05), 1.0) : 0.0;

  // Resistor Color Code Bands calculation for visual authenticity
  const getResistorBands = (r: number) => {
    // Standard 4-band approximation
    const colorMap: Record<number, string> = {
      0: "#1e293b", // Black
      1: "#78350f", // Brown
      2: "#dc2626", // Red
      3: "#ea580c", // Orange
      4: "#eab308", // Yellow
      5: "#16a34a", // Green
      6: "#2563eb", // Blue
      7: "#9333ea", // Violet
      8: "#64748b", // Gray
      9: "#f8fafc", // White
    };
    const rInt = Math.round(r);
    const d1 = Math.floor(rInt / 10) % 10;
    const d2 = rInt % 10;
    return {
      band1: colorMap[d1 || 1] || "#78350f",
      band2: colorMap[d2] || "#1e293b",
      band3: colorMap[0] || "#1e293b", // Multiplier (x1)
      band4: "#f59e0b", // Gold tolerance 5%
    };
  };

  const resistorBands = getResistorBands(resistance);

  // Record a measurement in the lab journal
  const handleRecordDataPoint = () => {
    const newPoint: DataPoint = {
      id: `dp-${Date.now()}`,
      voltage: voltage,
      resistance: resistance,
      current: calculatedCurrent,
      power: calculatedPower,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setDataPoints((prev) => [...prev, newPoint]);
  };

  // Clear all experimental readings
  const handleClearReadings = () => {
    setDataPoints([]);
  };

  // Reset values to textbook standard defaults
  const handleResetCircuit = () => {
    setVoltage(5.0);
    setResistance(10.0);
    setSwitchClosed(true);
  };

  // Trigger celebratory completion
  const handleCompleteExperiment = () => {
    setCompletedCelebration(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#3b82f6", "#10b981", "#fbbf24"],
      });
    } catch {
      // Confetti fallback
    }
    onExperimentComplete(dataPoints.length);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Experiment Top Bar & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900">
              Class 10 Physics
            </span>
            <span className="text-xs text-slate-500 font-medium">
              NCERT Chapter 12 • Section 12.4
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            Ohm's Law Interactive Circuit Laboratory (V = I × R)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="lab-ask-tutor-btn"
            onClick={() =>
              onOpenAITutor({
                voltage,
                resistance,
                current: calculatedCurrent,
                switchClosed,
              })
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-cyan-300" />
            <span>Ask AI Tutor</span>
          </button>

          <button
            id="lab-complete-experiment-btn"
            onClick={handleCompleteExperiment}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Lab</span>
          </button>
        </div>
      </div>

      {/* Completion Celebration Notification Banner */}
      {completedCelebration && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300 border border-emerald-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400 text-emerald-300 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-300">
                Experiment Verified & Completed!
              </h3>
              <p className="text-xs text-slate-200">
                You verified $V \propto I$ with {dataPoints.length} recorded data points. Performance logged to your student progress and Teacher Dashboard!
              </p>
            </div>
          </div>
          <button
            onClick={() => setCompletedCelebration(false)}
            className="px-3 py-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-xs font-semibold text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Lab Layout: 3D Circuit Canvas on Left/Top, Controls & Graphs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Interactive Circuit Apparatus Canvas */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Visualizer Container with Vibrant Palette 32px rounded & 4px white border */}
          <div className="relative rounded-[32px] bg-slate-900 border-4 border-white shadow-2xl overflow-hidden text-white p-5 sm:p-7">
            {/* Workbench Header & View Controls */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                  AR_VIRTUAL_WORKBENCH // 2.5D SIMULATION
                </span>
              </div>

              {/* Wire flow toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">Current Mode:</span>
                <button
                  onClick={() =>
                    setWireCurrentMode(wireCurrentMode === "electrons" ? "conventional" : "electrons")
                  }
                  className="px-3 py-1.5 rounded-xl bg-blue-950/90 hover:bg-blue-900 text-xs font-mono text-cyan-300 border border-blue-800 transition-colors cursor-pointer"
                >
                  {wireCurrentMode === "electrons" ? "⚡ Electron Drift (– to +)" : "⚡ Conventional (+ to –)"}
                </button>
              </div>
            </div>

            {/* High-Fidelity Interactive Circuit SVG Canvas */}
            <div className="relative w-full aspect-video min-h-[320px] sm:min-h-[400px] bg-radial from-slate-900/60 to-slate-950/95 rounded-2xl border border-slate-800 flex items-center justify-center p-3 select-none">
              {/* Dynamic Glow Bloom for Bulb */}
              {switchClosed && calculatedCurrent > 0.05 && (
                <div
                  className="absolute pointer-events-none rounded-full transition-all duration-300 glow-bulb"
                  style={{
                    right: "12%",
                    top: "30%",
                    width: `${Math.max(90, brightnessFactor * 260)}px`,
                    height: `${Math.max(90, brightnessFactor * 260)}px`,
                    transform: "translate(50%, -50%)",
                    background: `radial-gradient(circle, rgba(254, 240, 138, ${Math.min(
                      0.85,
                      brightnessFactor * 0.95
                    )}) 0%, rgba(245, 158, 11, ${brightnessFactor * 0.5}) 45%, transparent 70%)`,
                    filter: "blur(24px)",
                  }}
                />
              )}

              <svg
                viewBox="0 0 700 420"
                className="w-full h-full max-w-2xl drop-shadow-2xl"
              >
                <defs>
                  {/* Glowing wire filter */}
                  <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                  <linearGradient id="battery-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="meter-glass" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Circuit Wires (Loop Rect) */}
                {/* Outer Copper Core Wire */}
                <rect
                  x="80"
                  y="70"
                  width="540"
                  height="280"
                  rx="20"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                />
                {/* Active Current Conduit */}
                <rect
                  x="80"
                  y="70"
                  width="540"
                  height="280"
                  rx="20"
                  fill="none"
                  stroke={switchClosed && calculatedCurrent > 0 ? "#0284c7" : "#1e293b"}
                  strokeWidth="4"
                />

                {/* Animated Electron Particle Dots flowing through wire */}
                {switchClosed && calculatedCurrent > 0 && (
                  <rect
                    x="80"
                    y="70"
                    width="540"
                    height="280"
                    rx="20"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="4"
                    className="circuit-line"
                    style={{
                      animationDuration: `${Math.max(0.2, 1.8 / Math.max(calculatedCurrent, 0.2))}s`,
                      animationDirection: wireCurrentMode === "electrons" ? "reverse" : "normal",
                    }}
                  />
                )}

                {/* 1. DC POWER SOURCE / BATTERY (Left Side, centered) */}
                <g transform="translate(45, 150)">
                  {/* Battery Body Base */}
                  <rect
                    x="0"
                    y="0"
                    width="70"
                    height="120"
                    rx="8"
                    fill="url(#battery-grad)"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                  {/* Red Positive Terminal (+) */}
                  <rect x="18" y="-12" width="14" height="12" rx="2" fill="#ef4444" />
                  <text x="25" y="-16" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">+</text>
                  
                  {/* Black Negative Terminal (-) */}
                  <rect x="38" y="-12" width="14" height="12" rx="2" fill="#475569" />
                  <text x="45" y="-16" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">-</text>

                  {/* Battery Cells Graphic */}
                  <rect x="10" y="20" width="50" height="70" rx="4" fill="#0f172a" stroke="#1e293b" />
                  <line x1="20" y1="35" x2="20" y2="75" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                  <line x1="35" y1="45" x2="35" y2="65" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <line x1="50" y1="35" x2="50" y2="75" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

                  {/* Voltage Tag Readout */}
                  <rect x="8" y="94" width="54" height="18" rx="3" fill="#0369a1" />
                  <text
                    x="35"
                    y="107"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {voltage.toFixed(1)} V
                  </text>
                  <text x="35" y="132" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                    DC Source
                  </text>
                </g>

                {/* 2. PRECISION RESISTOR / RHEOSTAT (Top Branch) */}
                <g transform="translate(300, 70)">
                  {/* Wire Connections */}
                  <line x1="-70" y1="0" x2="-45" y2="0" stroke="#cbd5e1" strokeWidth="4" />
                  <line x1="45" y1="0" x2="70" y2="0" stroke="#cbd5e1" strokeWidth="4" />

                  {/* Ceramic Resistor Body */}
                  <rect
                    x="-45"
                    y="-16"
                    width="90"
                    height="32"
                    rx="8"
                    fill="#d6d3d1"
                    stroke="#78716c"
                    strokeWidth="2"
                  />
                  {/* Resistor Color Code Bands */}
                  <rect x="-30" y="-16" width="7" height="32" fill={resistorBands.band1} />
                  <rect x="-15" y="-16" width="7" height="32" fill={resistorBands.band2} />
                  <rect x="0" y="-16" width="7" height="32" fill={resistorBands.band3} />
                  <rect x="22" y="-16" width="7" height="32" fill={resistorBands.band4} />

                  {/* Resistor Label */}
                  <rect x="-40" y="-42" width="80" height="20" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
                  <text x="0" y="-28" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    R = {resistance.toFixed(1)} Ω
                  </text>
                  <text x="0" y="32" fill="#cbd5e1" fontSize="10" textAnchor="middle">
                    Standard Resistor
                  </text>

                  {/* VOLTMETER IN PARALLEL (Attached over the resistor) */}
                  <g transform="translate(0, -90)">
                    {/* Lead wires to resistor */}
                    <path
                      d="M-45 90 L-45 35 L-25 35"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />
                    <path
                      d="M45 90 L45 35 L25 35"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />
                    {/* Voltmeter Dial */}
                    <circle cx="0" cy="35" r="28" fill="#0f172a" stroke="#ef4444" strokeWidth="2.5" />
                    <circle cx="0" cy="35" r="25" fill="#1e293b" />
                    <text x="0" y="30" fill="#ef4444" fontSize="14" fontWeight="bold" textAnchor="middle">
                      V
                    </text>
                    {/* Needle deflection based on voltage */}
                    <line
                      x1="0"
                      y1="35"
                      x2={Math.sin((voltage / 24) * 1.6 - 0.8) * 18}
                      y2={35 - Math.cos((voltage / 24) * 1.6 - 0.8) * 18}
                      stroke="#f87171"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <text x="0" y="52" fill="#fecaca" fontSize="9" fontFamily="monospace" textAnchor="middle">
                      {switchClosed ? `${voltage.toFixed(1)}V` : "0.0V"}
                    </text>
                    <text x="0" y="72" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="middle">
                      [Parallel Voltmeter]
                    </text>
                  </g>
                </g>

                {/* 3. FILAMENT LIGHT BULB (Right Branch) */}
                <g transform="translate(620, 210)">
                  {/* Socket base */}
                  <rect x="-18" y="20" width="36" height="24" rx="3" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
                  <line x1="-16" y1="28" x2="16" y2="28" stroke="#475569" strokeWidth="2" />
                  <line x1="-16" y1="36" x2="16" y2="36" stroke="#475569" strokeWidth="2" />

                  {/* Glass Bulb Dome */}
                  <circle
                    cx="0"
                    cy="0"
                    r="32"
                    fill={
                      switchClosed && calculatedCurrent > 0.05
                        ? `rgba(254, 240, 138, ${Math.min(0.95, brightnessFactor * 0.9 + 0.15)})`
                        : "rgba(30, 41, 59, 0.7)"
                    }
                    stroke={switchClosed && calculatedCurrent > 0.05 ? "#f59e0b" : "#475569"}
                    strokeWidth="2.5"
                  />

                  {/* Filament Internal Leads & Heated Coil */}
                  <path
                    d="M-10 20 L-8 0 L-3 -8 L3 -8 L8 0 L10 20"
                    fill="none"
                    stroke={
                      switchClosed && calculatedCurrent > 0.05
                        ? `rgb(${Math.min(255, 200 + calculatedCurrent * 40)}, ${Math.min(240, 120 + calculatedCurrent * 60)}, 30)`
                        : "#64748b"
                    }
                    strokeWidth={switchClosed && calculatedCurrent > 0.05 ? "3" : "1.5"}
                    strokeLinecap="round"
                  />

                  {/* Radiant rays when bright */}
                  {switchClosed && calculatedCurrent > 0.2 && (
                    <g stroke="#fde047" strokeWidth="2" strokeLinecap="round" opacity={brightnessFactor}>
                      <line x1="-40" y1="0" x2="-48" y2="0" />
                      <line x1="40" y1="0" x2="48" y2="0" />
                      <line x1="0" y1="-40" x2="0" y2="-48" />
                      <line x1="-28" y1="-28" x2="-35" y2="-35" />
                      <line x1="28" y1="-28" x2="35" y2="-35" />
                    </g>
                  )}

                  <text x="0" y="58" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Bulb ({calculatedPower.toFixed(1)}W)
                  </text>
                </g>

                {/* 4. DC SERIES AMMETER (Bottom Branch, Right) */}
                <g transform="translate(440, 350)">
                  {/* Ammeter Outer Housing */}
                  <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#0284c7" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="28" fill="#1e293b" />
                  <text x="0" y="-5" fill="#38bdf8" fontSize="16" fontWeight="bold" textAnchor="middle">
                    A
                  </text>
                  {/* Needle deflection based on current (0 to 3A) */}
                  <line
                    x1="0"
                    y1="10"
                    x2={Math.sin((calculatedCurrent / 3.0) * 1.8 - 0.9) * 22}
                    y2={10 - Math.cos((calculatedCurrent / 3.0) * 1.8 - 0.9) * 22}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Digital current readout */}
                  <rect x="-24" y="14" width="48" height="14" rx="2" fill="#0c4a6e" />
                  <text x="0" y="24.5" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    {calculatedCurrent.toFixed(2)} A
                  </text>
                  <text x="0" y="44" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                    [Series Ammeter]
                  </text>
                </g>

                {/* 5. PLUG KEY / SWITCH (Bottom Branch, Left) */}
                <g
                  transform="translate(220, 350)"
                  onClick={() => setSwitchClosed(!switchClosed)}
                  className="cursor-pointer group"
                >
                  {/* Switch Base */}
                  <rect x="-35" y="-18" width="70" height="36" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  {/* Brass Contacts */}
                  <circle cx="-18" cy="0" r="4.5" fill="#f59e0b" />
                  <circle cx="18" cy="0" r="4.5" fill="#f59e0b" />

                  {/* Switch Arm */}
                  {switchClosed ? (
                    // Closed position (connected)
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
                  ) : (
                    // Open position (tilted up 35 degrees)
                    <line x1="-18" y1="0" x2="10" y2="-18" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                  )}

                  <text
                    x="0"
                    y="30"
                    fill={switchClosed ? "#4ade80" : "#f87171"}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {switchClosed ? "Switch: CLOSED [✓]" : "Switch: OPEN [✕]"}
                  </text>
                  <text x="0" y="42" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    (Click to toggle)
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* High-Contrast Vibrant Stats Bar Below Simulation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Stat 1: Applied Voltage */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                VOLTAGE (V)
              </div>
              <div className="text-2xl sm:text-3xl font-light text-blue-600 mt-1">
                {voltage.toFixed(1)} <span className="text-sm font-normal text-slate-500">V</span>
              </div>
            </div>

            {/* Stat 2: Resistance */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                RESISTANCE (R)
              </div>
              <div className="text-2xl sm:text-3xl font-light text-blue-600 mt-1">
                {resistance.toFixed(1)} <span className="text-sm font-normal text-slate-500">Ω</span>
              </div>
            </div>

            {/* Stat 3: Current Highlight Card */}
            <div className="bg-blue-600 p-4 sm:p-5 rounded-2xl shadow-lg border border-blue-400 text-white">
              <div className="text-xs font-bold text-blue-100 uppercase tracking-widest">
                CURRENT (I = V/R)
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {calculatedCurrent.toFixed(2)} <span className="text-sm font-medium text-blue-200">A</span>
              </div>
            </div>

            {/* Stat 4: Power Output */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                POWER (P = V×I)
              </div>
              <div className="text-2xl sm:text-3xl font-light text-blue-600 mt-1">
                {calculatedPower.toFixed(2)} <span className="text-sm font-normal text-slate-500">W</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Control Sliders, Lab Notebook & V-I Graph */}
        <div className="lg:col-span-4 space-y-6">
          {/* Controls Panel with 24px rounded vibrant card */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>LAB APPARATUS CONTROLS</span>
              </h3>
              <button
                id="reset-circuit-btn"
                onClick={handleResetCircuit}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset to 5V and 10Ω"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Voltage Control Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Voltage (Potential Difference)</span>
                </label>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono font-bold text-xs border border-blue-200">
                  {voltage.toFixed(1)} V
                </span>
              </div>
              <input
                id="voltage-slider"
                type="range"
                min="1.0"
                max="24.0"
                step="0.5"
                value={voltage}
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1.0 V (Single Cell)</span>
                <span>12.0 V</span>
                <span>24.0 V (Max)</span>
              </div>
            </div>

            {/* 2. Resistance Control Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  <span>Resistance (Rheostat / Resistor)</span>
                </label>
                <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 font-mono font-bold text-xs border border-cyan-200">
                  {resistance.toFixed(1)} Ω
                </span>
              </div>
              <input
                id="resistance-slider"
                type="range"
                min="2.0"
                max="50.0"
                step="1.0"
                value={resistance}
                onChange={(e) => setResistance(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              {/* Preset Chips */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Presets:</span>
                {[5, 10, 20, 25, 50].map((resVal) => (
                  <button
                    key={resVal}
                    onClick={() => setResistance(resVal)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                      resistance === resVal
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {resVal}Ω
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Switch Key Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Circuit Switch Key</div>
                <div className="text-[11px] text-slate-500">
                  {switchClosed ? "Current is actively flowing" : "Circuit is broken (0.00 A)"}
                </div>
              </div>
              <button
                id="switch-key-toggle-btn"
                onClick={() => setSwitchClosed(!switchClosed)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  switchClosed
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-rose-600 text-white shadow-xs"
                }`}
              >
                {switchClosed ? "CLOSED [ON]" : "OPEN [OFF]"}
              </button>
            </div>

            {/* Ohm's Law Formula Callout Box */}
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200/80">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                GOVERNING FORMULA
              </div>
              <div className="text-xl font-serif italic text-slate-700 font-bold">
                I = V / R &nbsp;•&nbsp; V = I × R
              </div>
            </div>

            {/* Observation Recorder Action */}
            <button
              id="record-data-point-btn"
              onClick={handleRecordDataPoint}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Record Point in Lab Journal ({dataPoints.length})</span>
            </button>
          </div>

          {/* Concept Mastery Widget */}
          <div className="bg-cyan-50 border border-cyan-200 p-5 rounded-[20px] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest">
                CONCEPT MASTERY
              </div>
              <div className="text-lg font-bold text-cyan-900 mt-0.5">
                Ohm's Law: Active
              </div>
              <p className="text-xs text-cyan-700 mt-0.5">
                Vary potential to observe constant slope (R)
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-cyan-200 border-t-cyan-600 flex items-center justify-center font-bold text-xs text-cyan-900 bg-white shadow-xs">
              95%
            </div>
          </div>

          {/* V-I Graph Plotter & Lab Journal Tabs */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("graph")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === "graph"
                      ? "bg-blue-100 text-blue-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>V-I Graph</span>
                </button>
                <button
                  onClick={() => setActiveTab("journal")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === "journal"
                      ? "bg-blue-100 text-blue-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Journal ({dataPoints.length})</span>
                </button>
              </div>

              {dataPoints.length > 0 && (
                <button
                  id="clear-readings-btn"
                  onClick={handleClearReadings}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-rose-50 font-medium"
                  title="Clear all recorded readings"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* TAB 1: Live V-I Graph Plotter (Proves Ohm's Law Slope) */}
            {activeTab === "graph" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Linear V-I Curve ($V = I \times R$)</span>
                  <span className="font-mono text-blue-900 font-semibold">
                    Slope R ≈ {resistance.toFixed(1)} Ω
                  </span>
                </div>

                {/* SVG Graph Coordinate Plot */}
                <div className="w-full aspect-[4/3] bg-slate-50 rounded-xl border border-slate-200 p-2 relative flex items-center justify-center">
                  <svg viewBox="0 0 240 180" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="30" y1="20" x2="30" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />
                    <line x1="30" y1="150" x2="220" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Horizontal Grid */}
                    <line x1="30" y1="120" x2="220" y2="120" stroke="#e2e8f0" strokeDasharray="2 2" />
                    <line x1="30" y1="90" x2="220" y2="90" stroke="#e2e8f0" strokeDasharray="2 2" />
                    <line x1="30" y1="60" x2="220" y2="60" stroke="#e2e8f0" strokeDasharray="2 2" />
                    <line x1="30" y1="30" x2="220" y2="30" stroke="#e2e8f0" strokeDasharray="2 2" />

                    {/* Vertical Grid */}
                    <line x1="75" y1="20" x2="75" y2="150" stroke="#e2e8f0" strokeDasharray="2 2" />
                    <line x1="120" y1="20" x2="120" y2="150" stroke="#e2e8f0" strokeDasharray="2 2" />
                    <line x1="165" y1="20" x2="165" y2="150" stroke="#e2e8f0" strokeDasharray="2 2" />
                    <line x1="210" y1="20" x2="210" y2="150" stroke="#e2e8f0" strokeDasharray="2 2" />

                    {/* Axis Labels */}
                    <text x="215" y="165" fontSize="8" fill="#64748b" textAnchor="end">Current I (A) →</text>
                    <text x="15" y="25" fontSize="8" fill="#64748b" transform="rotate(-90 20 25)" textAnchor="end">Voltage V (V) →</text>

                    {/* Linear Ohm's Law Line */}
                    <line
                      x1="30"
                      y1="150"
                      x2={30 + Math.min(180, (2.4 / 2.5) * 180)}
                      y2={150 - Math.min(130, ((2.4 * resistance) / 24) * 130)}
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />

                    {/* Plotted Data Points */}
                    {dataPoints.map((pt, i) => {
                      const cx = 30 + (pt.current / 2.5) * 180;
                      const cy = 150 - (pt.voltage / 24) * 130;
                      return (
                        <g key={pt.id}>
                          <circle cx={cx} cy={cy} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                        </g>
                      );
                    })}

                    {/* Live active point marker */}
                    {switchClosed && (
                      <circle
                        cx={30 + (calculatedCurrent / 2.5) * 180}
                        cy={150 - (voltage / 24) * 130}
                        r="5"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}
                  </svg>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The straight-line passing through origin proves current is directly proportional to voltage ($I \propto V$).
                </p>
              </div>
            )}

            {/* TAB 2: Observation Lab Journal Table */}
            {activeTab === "journal" && (
              <div className="space-y-2">
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-2.5">#</th>
                        <th className="py-2 px-2.5">V (Volts)</th>
                        <th className="py-2 px-2.5">I (Amps)</th>
                        <th className="py-2 px-2.5">R = V/I</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {dataPoints.map((pt, idx) => (
                        <tr key={pt.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 text-slate-400">{idx + 1}</td>
                          <td className="py-1.5 px-2.5 text-cyan-700 font-bold">{pt.voltage.toFixed(1)}</td>
                          <td className="py-1.5 px-2.5 text-emerald-700 font-bold">{pt.current.toFixed(2)}</td>
                          <td className="py-1.5 px-2.5 text-slate-800">{(pt.voltage / (pt.current || 1)).toFixed(1)} Ω</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
