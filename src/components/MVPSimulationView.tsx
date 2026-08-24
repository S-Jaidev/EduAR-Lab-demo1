import React, { useState, useEffect } from "react";
import { Experiment } from "../types";
import { GearMechanismScene } from "./GearMechanismScene";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Sparkles,
  Bot,
  Award,
  CheckCircle2,
  Sliders,
  Eye,
  Info,
  Layers,
  Activity,
  Plus,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";

interface MVPSimulationViewProps {
  experiment: Experiment;
  onBack: () => void;
  onOpenAITutor: (contextData?: any) => void;
  onExperimentComplete: (pointsCount: number) => void;
}

export const MVPSimulationView: React.FC<MVPSimulationViewProps> = ({
  experiment,
  onBack,
  onOpenAITutor,
  onExperimentComplete,
}) => {
  const [completedCelebration, setCompletedCelebration] = useState(false);
  const [observationPoints, setObservationPoints] = useState<string[]>([]);

  // Simulation-specific interactive states:
  // Chemistry (Titration)
  const [titrantAdded, setTitrantAdded] = useState<number>(18.5); // mL
  const [isDispensing, setIsDispensing] = useState<boolean>(false);

  // Biology (Heart)
  const [heartBPM, setHeartBPM] = useState<number>(75);
  const [activeCirculationMode, setActiveCirculationMode] = useState<"both" | "pulmonary" | "systemic">("both");

  // Math (Linear Graph)
  const [slopeM, setSlopeM] = useState<number>(2.0);
  const [interceptC, setInterceptC] = useState<number>(1.0);

  // Engineering (Gears)
  const [driverTeeth, setDriverTeeth] = useState<number>(24);
  const [drivenTeeth, setDrivenTeeth] = useState<number>(48);
  const [inputRPM, setInputRPM] = useState<number>(120);

  // Earth Science (Layers)
  const [probeDepthKm, setProbeDepthKm] = useState<number>(2900);

  // Computer Science (Binary)
  const [registerA, setRegisterA] = useState<number[]>([0, 0, 1, 0, 1, 0, 1, 0]); // 42
  const [registerB, setRegisterB] = useState<number[]>([0, 0, 0, 1, 0, 1, 0, 1]); // 21
  const [logicOp, setLogicOp] = useState<"ADD" | "AND" | "OR" | "XOR">("ADD");

  // Social Science (Timeline)
  const [selectedEraIndex, setSelectedEraIndex] = useState<number>(1);

  // Periodic droplet simulation for Chemistry
  useEffect(() => {
    let interval: any;
    if (isDispensing && titrantAdded < 35) {
      interval = setInterval(() => {
        setTitrantAdded((prev) => +(Math.min(35, prev + 0.2)).toFixed(1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isDispensing, titrantAdded]);

  // Derived Calculations
  // Chemistry: equivalence at 20.0 mL
  const calculatedPH =
    titrantAdded < 19.5
      ? +(1.5 + (titrantAdded / 20.0) * 2.0).toFixed(2)
      : titrantAdded <= 20.5
      ? +(7.0 + (titrantAdded - 20.0) * 3.0).toFixed(2)
      : +(11.0 + Math.min(2.5, (titrantAdded - 20.0) * 0.2)).toFixed(2);
  const isPink = calculatedPH >= 8.2;

  // Engineering
  const gearRatio = +(drivenTeeth / driverTeeth).toFixed(2);
  const outputRPM = +(inputRPM / gearRatio).toFixed(1);
  const torqueMultiplier = gearRatio;

  // Earth Science
  const currentLayer =
    probeDepthKm < 35
      ? { name: "Continental / Oceanic Crust", temp: "200°C – 400°C", state: "Solid Silicate Rock", pressure: "1 – 10 kbar" }
      : probeDepthKm < 2890
      ? { name: "Mantle (Asthenosphere & Mesosphere)", temp: "1,000°C – 3,700°C", state: "Semi-Solid Viscous Peridotite", pressure: "140 GPa" }
      : probeDepthKm < 5150
      ? { name: "Outer Liquid Core", temp: "4,000°C – 5,000°C", state: "Liquid Molten Iron & Nickel", pressure: "140 – 330 GPa" }
      : { name: "Inner Solid Core", temp: "5,400°C – 6,000°C", state: "Solid Dense Iron-Nickel Crystal", pressure: "330 – 360 GPa" };

  // Computer Science
  const valA = registerA.reduce((acc, bit, idx) => acc + bit * Math.pow(2, 7 - idx), 0);
  const valB = registerB.reduce((acc, bit, idx) => acc + bit * Math.pow(2, 7 - idx), 0);
  const computedResult =
    logicOp === "ADD" ? valA + valB : logicOp === "AND" ? valA & valB : logicOp === "OR" ? valA | valB : valA ^ valB;
  const resultBits = (computedResult & 255)
    .toString(2)
    .padStart(8, "0")
    .split("")
    .map(Number);

  // Social Science
  const eras = [
    { year: "1789", event: "French Revolution & Rights of Man", impact: "Erosion of absolute monarchy and birth of democratic citizenship principles." },
    { year: "1848", event: "The Revolutions of 1848 & Nationalism", impact: "Pan-European wave of democratic revolts demanding constitutional governance." },
    { year: "1914–1919", event: "World War I & Treaty of Versailles", impact: "Collapse of 4 empires and restructuring of global nation-state borders." },
    { year: "1947", event: "Indian Independence & Decolonization", impact: "Birth of the world's largest constitutional democracy and end of colonial hegemony." },
  ];

  const handleRecordReading = () => {
    let reading = "";
    if (experiment.subjectId === "chemistry") {
      reading = `V(NaOH) = ${titrantAdded}mL → pH = ${calculatedPH} (${isPink ? "Pink/Equivalence" : "Colorless/Acidic"})`;
    } else if (experiment.subjectId === "biology") {
      reading = `BPM = ${heartBPM} → Cardiac Output = ${(heartBPM * 0.07).toFixed(2)} L/min (${activeCirculationMode} loop)`;
    } else if (experiment.subjectId === "mathematics") {
      reading = `Equation: y = ${slopeM}x + ${interceptC} → Root x₀ = ${(-interceptC / (slopeM || 1)).toFixed(2)}`;
    } else if (experiment.subjectId === "engineering") {
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      reading = `Driver: ${driverTeeth}T, Driven: ${drivenTeeth}T | Input: ${inputRPM} RPM → Output: ${outputRPM} RPM | Ratio: ${gearRatio}:1, Torque: ${torqueMultiplier}× (${timeStr})`;
    } else if (experiment.subjectId === "earth-science") {
      reading = `Depth: ${probeDepthKm} km → Layer: ${currentLayer.name} (T = ${currentLayer.temp})`;
    } else if (experiment.subjectId === "computer-science") {
      reading = `Reg A (${valA}) ${logicOp} Reg B (${valB}) = Result: ${computedResult} (0b${resultBits.join("")})`;
    } else {
      reading = `Era ${eras[selectedEraIndex].year}: ${eras[selectedEraIndex].event}`;
    }

    setObservationPoints((prev) => [reading, ...prev]);
  };

  const handleCompleteLab = () => {
    setCompletedCelebration(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22d3ee", "#3b82f6", "#10b981", "#fbbf24"],
    });
    onExperimentComplete(Math.max(4, observationPoints.length));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={onBack}
            className="hover:text-blue-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Curriculum</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900">{experiment.subjectName}</span>
          <span>/</span>
          <span className="text-cyan-700 font-medium">{experiment.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAITutor({ experimentTitle: experiment.title, subject: experiment.subjectName })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-600" />
            <span>Ask Tutor</span>
          </button>

          <button
            onClick={handleCompleteLab}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete Lab</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Strip */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MVP Interactive Simulation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{experiment.title}</h1>
          <p className="text-xs text-slate-300 max-w-2xl">{experiment.shortDescription}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shrink-0 font-mono">
          <div className="text-[10px] text-cyan-400 font-semibold uppercase">Active Model</div>
          <div className="text-white font-bold text-sm mt-0.5">{experiment.formula}</div>
        </div>
      </div>

      {/* Main Simulation Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-600" />
                <span>Simulation Controls</span>
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                Interactive
              </span>
            </div>

            {/* Simulation-specific Controls */}
            {experiment.subjectId === "chemistry" && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>NaOH Dispensed (Titrant):</span>
                    <span className="font-bold font-mono text-blue-900">{titrantAdded} mL</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    step="0.5"
                    value={titrantAdded}
                    onChange={(e) => setTitrantAdded(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 mL (Acidic)</span>
                    <span className="text-emerald-600 font-semibold">20 mL (Equivalence)</span>
                    <span>35 mL (Basic)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsDispensing(!isDispensing)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer ${
                      isDispensing ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-blue-900 hover:bg-blue-800 text-white"
                    }`}
                  >
                    {isDispensing ? "Stop Burette Dispense" : "Auto-Dispense Burette"}
                  </button>
                  <button
                    onClick={() => setTitrantAdded(0)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {experiment.subjectId === "biology" && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Heart Rate (BPM):</span>
                    <span className="font-bold font-mono text-rose-600">{heartBPM} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    step="5"
                    value={heartBPM}
                    onChange={(e) => setHeartBPM(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>50 (Rest)</span>
                    <span>75 (Normal)</span>
                    <span>160 (High Cardio)</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Circulation Pathway Filter:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["both", "pulmonary", "systemic"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setActiveCirculationMode(mode)}
                        className={`py-1.5 rounded-lg capitalize font-semibold text-[11px] transition-colors cursor-pointer ${
                          activeCirculationMode === mode
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {experiment.subjectId === "mathematics" && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Slope Parameter (m):</span>
                    <span className="font-bold font-mono text-amber-700">{slopeM}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.5"
                    value={slopeM}
                    onChange={(e) => setSlopeM(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Y-Intercept (c):</span>
                    <span className="font-bold font-mono text-blue-900">{interceptC}</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={interceptC}
                    onChange={(e) => setInterceptC(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                  />
                </div>
              </div>
            )}

            {experiment.subjectId === "engineering" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Driver Gear Teeth:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[12, 24, 36, 48].map((t) => (
                      <button
                        key={t}
                        onClick={() => setDriverTeeth(t)}
                        className={`py-1 rounded-lg font-mono font-bold text-xs ${
                          driverTeeth === t ? "bg-purple-900 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t}T
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Driven Gear Teeth:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[12, 24, 48, 60].map((t) => (
                      <button
                        key={t}
                        onClick={() => setDrivenTeeth(t)}
                        className={`py-1 rounded-lg font-mono font-bold text-xs ${
                          drivenTeeth === t ? "bg-purple-900 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t}T
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Input Motor Speed:</span>
                    <span className="font-mono font-bold text-purple-900">{inputRPM} RPM</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={inputRPM}
                    onChange={(e) => setInputRPM(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                  />
                </div>
              </div>
            )}

            {experiment.subjectId === "earth-science" && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Seismic Probe Depth:</span>
                    <span className="font-mono font-bold text-cyan-800">{probeDepthKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6371"
                    step="50"
                    value={probeDepthKm}
                    onChange={(e) => setProbeDepthKm(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 km (Crust)</span>
                    <span>2900 km (Mantle)</span>
                    <span>6371 km (Center)</span>
                  </div>
                </div>
              </div>
            )}

            {experiment.subjectId === "computer-science" && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-600 block mb-1">Register A (8-bit):</span>
                  <div className="grid grid-cols-8 gap-1">
                    {registerA.map((bit, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const next = [...registerA];
                          next[idx] = next[idx] === 1 ? 0 : 1;
                          setRegisterA(next);
                        }}
                        className={`py-1.5 font-mono font-bold rounded text-xs transition-colors cursor-pointer ${
                          bit === 1 ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {bit}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 text-right">Dec: {valA}</span>
                </div>

                <div>
                  <span className="font-semibold text-slate-600 block mb-1">Register B (8-bit):</span>
                  <div className="grid grid-cols-8 gap-1">
                    {registerB.map((bit, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const next = [...registerB];
                          next[idx] = next[idx] === 1 ? 0 : 1;
                          setRegisterB(next);
                        }}
                        className={`py-1.5 font-mono font-bold rounded text-xs transition-colors cursor-pointer ${
                          bit === 1 ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {bit}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 text-right">Dec: {valB}</span>
                </div>

                <div>
                  <span className="font-semibold text-slate-600 block mb-1">ALU Operation:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(["ADD", "AND", "OR", "XOR"] as const).map((op) => (
                      <button
                        key={op}
                        onClick={() => setLogicOp(op)}
                        className={`py-1 font-mono font-bold text-xs rounded transition-colors cursor-pointer ${
                          logicOp === op ? "bg-indigo-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {experiment.subjectId === "social-science" && (
              <div className="space-y-3 text-xs">
                <span className="font-semibold text-slate-600 block mb-1">Select Historical Epoch:</span>
                <div className="space-y-1.5">
                  {eras.map((era, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedEraIndex(idx)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedEraIndex === idx
                          ? "bg-amber-100 text-amber-950 font-bold border border-amber-300"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-[10px] text-amber-800 font-bold">{era.year}</div>
                      <div className="truncate">{era.event}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Record Reading CTA */}
            <button
              onClick={handleRecordReading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-300" />
              <span>Record Reading in Observation Journal</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual Stage & Telemetry Display */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-lg p-6 text-white min-h-[380px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="font-mono text-cyan-400 uppercase tracking-wider">
                {experiment.subjectName} • Live Canvas
              </span>
              <span className="px-2.5 py-0.5 rounded bg-blue-900/60 border border-blue-700 text-cyan-300 text-[10px]">
                Active Telemetry
              </span>
            </div>

            {/* Custom Visual Renderers for each Subject */}
            <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center">
              {experiment.subjectId === "chemistry" && (
                <div className="space-y-4 text-center">
                  <div className="inline-flex items-center justify-center gap-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="text-left space-y-1">
                      <div className="text-[11px] text-slate-400">Solution pH Level:</div>
                      <div className={`text-3xl font-extrabold font-mono ${isPink ? "text-pink-400" : "text-cyan-400"}`}>
                        pH {calculatedPH}
                      </div>
                      <div className="text-xs text-slate-300">
                        {isPink ? "Basic (Pink Indicator Formed)" : "Acidic (Colorless Form)"}
                      </div>
                    </div>

                    <div
                      className={`w-20 h-24 rounded-b-2xl border-2 border-slate-600 flex items-end p-2 transition-all duration-500 ${
                        isPink ? "bg-pink-500/30 border-pink-400 shadow-lg shadow-pink-500/20" : "bg-cyan-500/10"
                      }`}
                    >
                      <div
                        className={`w-full rounded transition-all duration-300 ${
                          isPink ? "bg-pink-500 h-16 shadow-md" : "bg-cyan-400/40 h-12"
                        }`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Neutralization: HCl + NaOH → NaCl + H₂O
                  </p>
                </div>
              )}

              {experiment.subjectId === "biology" && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-6">
                    <div className="text-left space-y-1">
                      <div className="text-[11px] text-slate-400">Cardiac Output:</div>
                      <div className="text-3xl font-extrabold font-mono text-rose-400">
                        {(heartBPM * 0.07).toFixed(2)} L/min
                      </div>
                      <div className="text-xs text-slate-300">
                        Stroke Volume: ~70 mL/beat | Rhythm: {heartBPM} BPM
                      </div>
                    </div>

                    <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-500 flex items-center justify-center animate-pulse">
                      <Activity className="w-8 h-8 text-rose-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Pulmonary Loop (Lungs) & Systemic Loop (Body Tissues)
                  </p>
                </div>
              )}

              {experiment.subjectId === "mathematics" && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="text-xs text-slate-400 mb-1">Evaluated Linear Equation:</div>
                    <div className="text-3xl font-extrabold font-mono text-cyan-300">
                      y = {slopeM}x {interceptC >= 0 ? `+ ${interceptC}` : `- ${Math.abs(interceptC)}`}
                    </div>
                    <div className="text-xs text-slate-300 mt-2">
                      X-Intercept (Root): x₀ = {(-interceptC / (slopeM || 1)).toFixed(2)} | Slope angle: {(Math.atan(slopeM) * (180 / Math.PI)).toFixed(1)}°
                    </div>
                  </div>
                </div>
              )}

              {experiment.subjectId === "engineering" && (
                <div className="w-full">
                  <GearMechanismScene
                    driverTeeth={driverTeeth}
                    drivenTeeth={drivenTeeth}
                    inputRPM={inputRPM}
                    outputRPM={outputRPM}
                    gearRatio={gearRatio}
                    torqueMultiplier={torqueMultiplier}
                  />
                </div>
              )}

              {experiment.subjectId === "earth-science" && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2 max-w-md">
                    <div className="text-[11px] text-cyan-400 uppercase font-bold">Detected Stratum at {probeDepthKm} km</div>
                    <div className="text-xl font-bold text-white">{currentLayer.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <div>Temperature: <span className="font-bold text-amber-400">{currentLayer.temp}</span></div>
                      <div>Pressure: <span className="font-bold text-cyan-300">{currentLayer.pressure}</span></div>
                    </div>
                    <div className="text-xs text-slate-400">State: {currentLayer.state}</div>
                  </div>
                </div>
              )}

              {experiment.subjectId === "computer-science" && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
                    <div className="text-xs text-slate-400">
                      ALU Evaluation: {valA} ({logicOp}) {valB}
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-indigo-300">
                      Decimal: {computedResult} &nbsp; | &nbsp; Hex: 0x{(computedResult & 255).toString(16).toUpperCase()}
                    </div>
                    <div className="flex justify-center gap-1 pt-2">
                      {resultBits.map((b, i) => (
                        <span key={i} className={`px-2 py-1 rounded font-mono font-bold text-xs ${b === 1 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {experiment.subjectId === "social-science" && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2 max-w-lg">
                    <div className="text-xs font-bold text-amber-400 font-mono">EPOCH: {eras[selectedEraIndex].year}</div>
                    <div className="text-xl font-bold text-white">{eras[selectedEraIndex].event}</div>
                    <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
                      {eras[selectedEraIndex].impact}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Observation Log Strip */}
            <div className="relative z-10 border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Recorded Data Readings: <strong>{observationPoints.length}</strong></span>
              <button
                onClick={handleCompleteLab}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                Finish & Mark Completed →
              </button>
            </div>
          </div>

          {/* Observations Table */}
          {observationPoints.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Laboratory Observation Log
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {observationPoints.map((pt, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 flex items-center justify-between">
                    <span>{pt}</span>
                    <span className="text-[10px] text-slate-400 font-sans">Point #{observationPoints.length - i}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
