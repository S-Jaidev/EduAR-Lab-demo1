import React, { useState, useEffect, useRef } from "react";
import {
  Scan,
  Camera,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

interface TextbookScannerProps {
  onRecognitionComplete: () => void;
  onClose: () => void;
}

type ScanStage =
  | "ready"
  | "scanning"
  | "analyzing"
  | "recognized"
  | "ar_overlay";

export const TextbookScanner: React.FC<TextbookScannerProps> = ({
  onRecognitionComplete,
  onClose,
}) => {
  const [scanStage, setScanStage] = useState<ScanStage>("ready");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedTokens, setDetectedTokens] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Play audio synthesizer feedback for AR immersion
  const playAudioBeep = (freq: number = 880, type: OscillatorType = "sine", duration: number = 0.1) => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Start live webcam or fallback to interactive sample page
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraActive(false);
      }
    } catch (err: any) {
      console.warn("Camera access not available or denied, using high-fidelity sample textbook:", err);
      setCameraError("Camera unavailable or permission denied. Using textbook sample page.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    // Attempt camera
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Run the simulated multi-stage recognition flow
  const triggerScanProcess = () => {
    setScanStage("scanning");
    setProgress(15);
    setDetectedTokens([]);
    playAudioBeep(600, "sine", 0.15);

    // Stage 1: OCR scan
    setTimeout(() => {
      setProgress(40);
      setDetectedTokens(["NCERT Class 10", "Chapter 12: Electricity"]);
      playAudioBeep(750, "sine", 0.1);
    }, 900);

    // Stage 2: Section & Circuit Diagram detection
    setTimeout(() => {
      setScanStage("analyzing");
      setProgress(75);
      setDetectedTokens([
        "NCERT Class 10",
        "Chapter 12: Electricity",
        "Section 12.4: Ohm's Law",
        "Circuit Diagram (Fig 12.2)",
        "Formula: V = I × R",
      ]);
      playAudioBeep(900, "triangle", 0.15);
    }, 2000);

    // Stage 3: Match confirmed
    setTimeout(() => {
      setScanStage("recognized");
      setProgress(100);
      playAudioBeep(1200, "sine", 0.3);
    }, 3200);

    // Stage 4: Pop up AR overlay
    setTimeout(() => {
      setScanStage("ar_overlay");
    }, 4000);
  };

  // Reset scanner
  const handleResetScan = () => {
    setScanStage("ready");
    setProgress(0);
    setDetectedTokens([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white my-auto animate-in zoom-in-95 duration-200">
        {/* Scanner Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>AR Textbook Scanner</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                  Concept Detection
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Point at Class 10 Science textbook or scan sample page below
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner Main Viewport & AR Overlay */}
        <div className="relative min-h-[380px] sm:min-h-[440px] bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Live Camera Feed if active, else realistic textbook simulation */}
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          ) : (
            /* High-fidelity Realistic Textbook Page Simulation */
            <div className="w-full max-w-2xl bg-amber-50/95 text-slate-900 p-6 sm:p-8 rounded-xl shadow-inner border border-amber-200/80 select-none transform transition-transform">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2 mb-3 text-[11px] text-slate-500 font-mono">
                <span>NCERT SCIENCE • CLASS X</span>
                <span>CHAPTER 12: ELECTRICITY</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                    12.4 OHM'S LAW
                  </h3>
                  <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-mono text-slate-800">
                    Page 203
                  </span>
                </div>

                <p className="text-xs font-serif leading-relaxed text-slate-800 text-justify">
                  Is there a relationship between the potential difference across a conductor and the current through it? Let us explore with an activity.
                </p>

                <div className="p-3 rounded-lg bg-white/90 border border-amber-300/80 shadow-xs space-y-2">
                  <div className="text-[11px] font-bold text-blue-900 font-serif">
                    Activity 12.1 — Circuit Diagram to verify Ohm's Law
                  </div>
                  <div className="flex items-center justify-center py-2">
                    {/* SVG Diagram inside simulated textbook */}
                    <svg viewBox="0 0 320 120" className="w-full max-w-[280px] h-auto">
                      <rect x="20" y="20" width="280" height="80" rx="4" fill="none" stroke="#1e3a8a" strokeWidth="2" />
                      {/* Battery */}
                      <g transform="translate(30, 45)">
                        <line x1="0" y1="0" x2="0" y2="30" stroke="#dc2626" strokeWidth="3" />
                        <line x1="8" y1="5" x2="8" y2="25" stroke="#2563eb" strokeWidth="3" />
                        <text x="4" y="-4" fontSize="8" fill="#1e293b" textAnchor="middle">Battery</text>
                      </g>
                      {/* Key */}
                      <g transform="translate(110, 100)">
                        <circle cx="-8" cy="0" r="3" fill="#1e3a8a" />
                        <circle cx="8" cy="0" r="3" fill="#1e3a8a" />
                        <line x1="-8" y1="0" x2="6" y2="-6" stroke="#1e3a8a" strokeWidth="2" />
                        <text x="0" y="14" fontSize="8" fill="#475569" textAnchor="middle">Plug Key (K)</text>
                      </g>
                      {/* Ammeter */}
                      <g transform="translate(200, 100)">
                        <circle cx="0" cy="0" r="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
                        <text x="0" y="3.5" fontSize="9" fontWeight="bold" fill="#1e3a8a" textAnchor="middle">A</text>
                        <text x="0" y="18" fontSize="7" fill="#475569" textAnchor="middle">Ammeter</text>
                      </g>
                      {/* Resistor & Voltmeter */}
                      <g transform="translate(160, 20)">
                        <rect x="-25" y="-6" width="50" height="12" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
                        <text x="0" y="-10" fontSize="8" fontWeight="bold" fill="#b45309" textAnchor="middle">Resistor (R = V/I)</text>
                        {/* Voltmeter in parallel */}
                        <path d="M-25 0 L-25 -25 L25 -25 L25 0" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" />
                        <circle cx="0" cy="-25" r="9" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
                        <text x="0" y="-22" fontSize="9" fontWeight="bold" fill="#1e3a8a" textAnchor="middle">V</text>
                      </g>
                    </svg>
                  </div>
                  <div className="text-[10px] font-mono text-center text-slate-600 bg-amber-100/60 py-1 rounded">
                    Fig. 12.2: Electric circuit for studying Ohm's Law (V = I × R)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AR Holographic Reticle Frame */}
          <div className="absolute inset-4 sm:inset-8 pointer-events-none flex flex-col justify-between">
            {/* Top Corners */}
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-sm shadow-cyan-500/50" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>AR_TARGET: NCERT_CH12</span>
              </div>
              <div className="w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-sm shadow-cyan-500/50" />
            </div>

            {/* Scanning Laser Beam (Active when scanning/analyzing) */}
            {(scanStage === "scanning" || scanStage === "analyzing") && (
              <div className="w-full relative h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] scanner-line" />
            )}

            {/* Bottom Corners */}
            <div className="flex justify-between items-end">
              <div className="w-10 h-10 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-sm shadow-cyan-500/50" />
              <div className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 bg-slate-950/80 rounded">
                OPTICAL_OCR_AI_v2.4
              </div>
              <div className="w-10 h-10 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-sm shadow-cyan-500/50" />
            </div>
          </div>

          {/* Holographic AR 3D Pop-Out Overlay Card when Recognized */}
          {scanStage === "ar_overlay" && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-2 border-cyan-400 rounded-2xl p-6 text-white shadow-2xl shadow-cyan-500/30 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-bounce">
                  <Zap className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Ohm's Law Detected</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Textbook Concept Recognized!
                  </h3>
                  <p className="text-xs text-slate-300">
                    Chapter 12, Section 12.4: Ohm's Law & Circuit Analysis is ready to launch in full 3D simulation.
                  </p>
                </div>

                {/* Formula Highlight */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-center gap-4 text-sm font-mono">
                  <span className="text-cyan-400 font-bold text-base">V = I × R</span>
                  <span className="text-slate-400 text-xs">|</span>
                  <span className="text-amber-300 font-bold text-base">I = V / R</span>
                </div>

                <button
                  id="ar-scanner-launch-virtual-lab"
                  onClick={() => {
                    stopCamera();
                    onRecognitionComplete();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-900/50 hover:shadow-cyan-900/70 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-cyan-200" />
                  <span>Launch Virtual Lab</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scanner Footer / Status & Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-3">
          {/* Status Text & Progress Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {scanStage === "ready" && (
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Position textbook page or diagram within the frame and click <strong>Start Scan</strong>.
                </span>
              )}
              {scanStage === "scanning" && (
                <span className="text-cyan-300 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  Scanning textbook page & performing OCR feature analysis...
                </span>
              )}
              {scanStage === "analyzing" && (
                <span className="text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Matching textbook diagram to Class 10 Ohm's Law repository...
                </span>
              )}
              {(scanStage === "recognized" || scanStage === "ar_overlay") && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Recognition complete: Chapter 12 Electricity identified!
                </span>
              )}
            </div>

            {/* Progress indicator */}
            {scanStage !== "ready" && (
              <span className="font-mono text-cyan-400 text-[11px] font-bold">
                {progress}%
              </span>
            )}
          </div>

          {/* Detected Tokens Chip Strip */}
          {detectedTokens.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Detected:
              </span>
              {detectedTokens.map((tok, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-cyan-300 border border-slate-700 animate-in fade-in"
                >
                  ✓ {tok}
                </span>
              ))}
            </div>
          )}

          {/* Controls: Start Scan / Reset / Fallback Launch */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              {scanStage === "ready" ? (
                <button
                  id="scanner-start-btn"
                  onClick={triggerScanProcess}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Scan className="w-4 h-4" />
                  <span>Start Scanning Textbook</span>
                </button>
              ) : (
                <button
                  id="scanner-rescan-btn"
                  onClick={handleResetScan}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Again</span>
                </button>
              )}
            </div>

            <button
              id="scanner-direct-launch-btn"
              onClick={() => {
                stopCamera();
                onRecognitionComplete();
              }}
              className="text-xs text-slate-400 hover:text-cyan-300 underline font-medium cursor-pointer"
            >
              Skip scanner & launch lab directly →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
