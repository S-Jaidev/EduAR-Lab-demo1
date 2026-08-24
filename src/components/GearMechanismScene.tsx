import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  RotateCw,
  RotateCcw,
  Gauge,
  ArrowRightLeft,
  Box,
  Layers,
  Move3d,
  Rotate3d,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
} from "lucide-react";

interface GearMechanismSceneProps {
  driverTeeth: number;
  drivenTeeth: number;
  inputRPM: number;
  outputRPM: number;
  gearRatio: number;
  torqueMultiplier: number;
}

// Generate realistic involute spur gear path centered at (0, 0)
function generateGearPath(
  teeth: number,
  pitchRadius: number,
  addendum: number,
  dedendum: number
): string {
  const outerRadius = pitchRadius + addendum;
  const rootRadius = pitchRadius - dedendum;
  const numTeeth = Math.max(8, teeth);
  const toothAngle = (2 * Math.PI) / numTeeth;

  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < numTeeth; i++) {
    const baseAngle = i * toothAngle;

    // Subdivisions of single tooth profile (in polar angles)
    const a0 = baseAngle;
    const a1 = baseAngle + toothAngle * 0.16;
    const a2 = baseAngle + toothAngle * 0.28;
    const a3 = baseAngle + toothAngle * 0.46;
    const a4 = baseAngle + toothAngle * 0.58;
    const a5 = baseAngle + toothAngle * 0.74;
    const a6 = baseAngle + toothAngle;

    points.push({ x: rootRadius * Math.cos(a0), y: rootRadius * Math.sin(a0) });
    points.push({ x: pitchRadius * Math.cos(a1), y: pitchRadius * Math.sin(a1) });
    points.push({ x: outerRadius * Math.cos(a2), y: outerRadius * Math.sin(a2) });
    points.push({ x: outerRadius * Math.cos(a3), y: outerRadius * Math.sin(a3) });
    points.push({ x: pitchRadius * Math.cos(a4), y: pitchRadius * Math.sin(a4) });
    points.push({ x: rootRadius * Math.cos(a5), y: rootRadius * Math.sin(a5) });
    points.push({ x: rootRadius * Math.cos(a6), y: rootRadius * Math.sin(a6) });
  }

  if (points.length === 0) return "";

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
  }
  d += " Z";
  return d;
}

type ViewMode3D = "isometric" | "oblique" | "deep-3d" | "top-down" | "side-profile";

export const GearMechanismScene: React.FC<GearMechanismSceneProps> = ({
  driverTeeth,
  drivenTeeth,
  inputRPM,
  outputRPM,
  gearRatio,
  torqueMultiplier,
}) => {
  // Continuous rotation angles tracked with requestAnimationFrame
  const driverAngleRef = useRef<number>(0);
  const drivenAngleRef = useRef<number>(0);
  const lastTimestampRef = useRef<number | null>(null);

  // SVG group refs for 60fps continuous hardware-accelerated transform
  const driverMainGroupRef = useRef<SVGGElement | null>(null);
  const drivenMainGroupRef = useRef<SVGGElement | null>(null);
  const driverArrowRef = useRef<SVGGElement | null>(null);
  const drivenArrowRef = useRef<SVGGElement | null>(null);

  // 3D View and visual controls
  const [viewMode, setViewMode] = useState<ViewMode3D>("isometric");
  const [showPitchCircles, setShowPitchCircles] = useState<boolean>(true);
  const [gearThickness, setGearThickness] = useState<number>(22); // mm physical face width
  const [pulseActive, setPulseActive] = useState<boolean>(false);

  // Interactive 3D Orbit Camera State (Mouse drag + Wheel zoom)
  const [rotX, setRotX] = useState<number>(34); // Pitch: -15deg to 75deg
  const [rotY, setRotY] = useState<number>(-16); // Yaw: -180deg to 180deg
  const [zoom, setZoom] = useState<number>(1.0); // Scale: 0.7x to 1.6x
  const [panY, setPanY] = useState<number>(0); // Vertical offset

  // Mouse / Touch Drag State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 34,
    rotY: -16,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active parameter change pulse
  useEffect(() => {
    setPulseActive(true);
    const t = setTimeout(() => setPulseActive(false), 500);
    return () => clearTimeout(t);
  }, [driverTeeth, drivenTeeth, inputRPM]);

  // Adjust preset rotations based on view mode
  const applyPresetView = (mode: ViewMode3D) => {
    setViewMode(mode);
    if (mode === "isometric") {
      setRotX(34);
      setRotY(-16);
      setZoom(1.0);
      setPanY(0);
    } else if (mode === "oblique") {
      setRotX(22);
      setRotY(-8);
      setZoom(1.05);
      setPanY(0);
    } else if (mode === "deep-3d") {
      setRotX(54);
      setRotY(-28);
      setZoom(1.1);
      setPanY(15);
    } else if (mode === "top-down") {
      setRotX(0);
      setRotY(0);
      setZoom(1.0);
      setPanY(0);
    } else if (mode === "side-profile") {
      setRotX(15);
      setRotY(-75);
      setZoom(1.15);
      setPanY(0);
    }
  };

  const resetCamera = () => {
    applyPresetView("isometric");
  };

  // Mouse Drag Handlers for 3D Orbiting
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only trigger drag on left mouse button
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Sensitivity multipliers
      const sensitivityX = 0.45;
      const sensitivityY = 0.35;

      const newRotY = ((dragStartRef.current.rotY + dx * sensitivityX + 180) % 360) - 180;
      const newRotX = Math.max(-20, Math.min(80, dragStartRef.current.rotX - dy * sensitivityY));

      setRotX(Math.round(newRotX));
      setRotY(Math.round(newRotY));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch Handlers for Mobile 3D Orbiting
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        rotX,
        rotY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;

    const sensitivityX = 0.55;
    const sensitivityY = 0.45;

    const newRotY = ((dragStartRef.current.rotY + dx * sensitivityX + 180) % 360) - 180;
    const newRotX = Math.max(-20, Math.min(80, dragStartRef.current.rotX - dy * sensitivityY));

    setRotX(Math.round(newRotX));
    setRotY(Math.round(newRotY));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.06 : 0.06;
    setZoom((prev) => Math.max(0.7, Math.min(1.6, Number((prev + zoomDelta).toFixed(2)))));
  };

  // Attach global mouseup and mousemove listeners for smooth dragging outside canvas bounds
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Geometric scale calculations
  const moduleScale = 3.6;
  const addendum = 6.0;
  const dedendum = 6.5;

  const rDriverPitch = driverTeeth * moduleScale;
  const rDrivenPitch = drivenTeeth * moduleScale;
  const centerDistance = rDriverPitch + rDrivenPitch;

  // ViewBox layout dimensions
  const svgWidth = 880;
  const svgHeight = 500;
  const centerY = 245;

  // Center the gear train inside viewBox
  const driverCenterX = svgWidth / 2 - centerDistance / 2 + (rDrivenPitch - rDriverPitch) * 0.14;
  const drivenCenterX = driverCenterX + centerDistance;
  const contactMeshX = driverCenterX + rDriverPitch;

  // Base 2D paths
  const driverGearPath = useMemo(() => {
    return generateGearPath(driverTeeth, rDriverPitch, addendum, dedendum);
  }, [driverTeeth, rDriverPitch]);

  const drivenGearPath = useMemo(() => {
    return generateGearPath(drivenTeeth, rDrivenPitch, addendum, dedendum);
  }, [drivenTeeth, rDrivenPitch]);

  // Spoke cutouts for larger gears
  const getSpokeCutouts = (teeth: number, pitchR: number) => {
    if (teeth < 20) return null;
    const count = teeth >= 48 ? 6 : teeth >= 36 ? 5 : 4;
    const hubR = 24;
    const rimInnerR = pitchR - 16;
    if (rimInnerR <= hubR + 10) return null;

    const cutouts = [];
    const spanAngle = (2 * Math.PI) / count;
    const holeR = (rimInnerR - hubR) * 0.42;
    const midR = (hubR + rimInnerR) / 2;

    for (let i = 0; i < count; i++) {
      const angle = i * spanAngle + Math.PI / count;
      const cx = midR * Math.cos(angle);
      const cy = midR * Math.sin(angle);
      cutouts.push({ cx, cy, r: holeR });
    }
    return cutouts;
  };

  const driverSpokes = useMemo(
    () => getSpokeCutouts(driverTeeth, rDriverPitch),
    [driverTeeth, rDriverPitch]
  );
  const drivenSpokes = useMemo(
    () => getSpokeCutouts(drivenTeeth, rDrivenPitch),
    [drivenTeeth, rDrivenPitch]
  );

  // Dynamic 3D depth extrusion slices calculated based on physical thickness and camera tilt
  const extrusionSlices = useMemo(() => {
    const count = 12; // High-density layer slicing for smooth solid cylindrical gear walls
    const slices = [];

    // Calculate light and shadow extrusion directional vector based on rotY
    const radY = (rotY * Math.PI) / 180;
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    for (let i = 1; i <= count; i++) {
      const fraction = i / count;
      // Extrusion vector along depth
      const depthDistance = fraction * gearThickness;
      const dx = depthDistance * 0.45 * cosY - depthDistance * 0.25 * sinY;
      const dy = depthDistance * 0.95;
      const brightness = Math.max(0.12, 0.75 - fraction * 0.58);
      slices.push({ dx, dy, brightness, fraction });
    }
    return slices;
  }, [gearThickness, rotY]);

  // Continuous animation loop
  useEffect(() => {
    let animId: number;

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.1);
      lastTimestampRef.current = timestamp;

      // Angular speed in deg/s: RPM * 360 / 60 = RPM * 6
      const driverSpeedDeg = inputRPM * 6;
      const drivenSpeedDeg = outputRPM * 6;

      // Driver rotates Clockwise (+)
      driverAngleRef.current = (driverAngleRef.current + driverSpeedDeg * dt) % 360;

      // Driven rotates Counter-Clockwise (-)
      const phaseOffsetDeg = 180 / drivenTeeth;
      drivenAngleRef.current =
        (drivenAngleRef.current - drivenSpeedDeg * dt + 360) % 360;

      // Apply transforms directly
      if (driverMainGroupRef.current) {
        driverMainGroupRef.current.setAttribute(
          "transform",
          `rotate(${driverAngleRef.current})`
        );
      }
      if (drivenMainGroupRef.current) {
        drivenMainGroupRef.current.setAttribute(
          "transform",
          `rotate(${drivenAngleRef.current + phaseOffsetDeg})`
        );
      }
      if (driverArrowRef.current) {
        driverArrowRef.current.setAttribute(
          "transform",
          `rotate(${driverAngleRef.current * 0.35})`
        );
      }
      if (drivenArrowRef.current) {
        drivenArrowRef.current.setAttribute(
          "transform",
          `rotate(${-drivenAngleRef.current * 0.35})`
        );
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [inputRPM, outputRPM, drivenTeeth]);

  return (
    <div className="space-y-4">
      {/* 3D Simulation Viewport Frame */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl bg-gradient-to-b from-[#050912] via-[#08101c] to-[#03060c] border border-slate-800/90 shadow-2xl overflow-hidden select-none"
      >
        {/* Deep Perspective Ambient Background Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.22) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.22) 1px, transparent 1px)
            `,
            backgroundSize: "36px 36px",
            transform: `perspective(800px) rotateX(${Math.max(10, rotX)}deg) translateY(${30 + panY}px) scale(${zoom})`,
            transformOrigin: "bottom center",
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        />

        {/* Dynamic Studio Spotlights */}
        <div className="absolute -top-12 left-1/5 w-[460px] h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-1/5 w-[460px] h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-[400px] h-52 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control HUD & 3D Camera Controls */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="font-mono text-cyan-300 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Move3d className="w-3.5 h-3.5 text-cyan-400 inline" />
              Interactive 3D Gear Assembly
            </span>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
              Orbit: {rotX}°X, {rotY}°Y • Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Quick Preset Buttons & Camera Tools */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {(
                [
                  { id: "isometric", label: "Isometric" },
                  { id: "deep-3d", label: "Deep 3D" },
                  { id: "side-profile", label: "Side" },
                  { id: "top-down", label: "Plan 2D" },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => applyPresetView(mode.id)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                    viewMode === mode.id
                      ? "bg-cyan-500/25 text-cyan-300 font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Zoom In / Out Buttons */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
                title="Zoom In (or Scroll Up)"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(2))))}
                title="Zoom Out (or Scroll Down)"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetCamera}
                title="Reset Camera View"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pitch Circle Toggle */}
            <button
              onClick={() => setShowPitchCircles((prev) => !prev)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-mono transition-colors cursor-pointer ${
                showPitchCircles
                  ? "bg-cyan-950/80 border-cyan-500/50 text-cyan-300"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {showPitchCircles ? "Pitch: ON" : "Pitch: OFF"}
            </button>
          </div>
        </div>

        {/* 3D Interactive Stage Canvas Container with Mouse Drag & Wheel */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className={`relative w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none transition-cursor ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 50%",
            minHeight: "440px",
          }}
        >
          {/* Floating Interactive Mouse Hint Badge */}
          <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] text-slate-400 font-mono shadow-lg">
            <Rotate3d className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-300">Drag mouse to freely rotate 3D view</span>
            <span className="text-slate-500">• Scroll to zoom</span>
          </div>

          {/* Transforming 3D Canvas Board */}
          <div
            className="w-full"
            style={{
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom}) translateY(${panY}px)`,
              transformStyle: "preserve-3d",
              transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: pulseActive
                ? "drop-shadow(0 0 28px rgba(56, 189, 248, 0.6))"
                : "drop-shadow(0 30px 40px rgba(0, 0, 0, 0.9))",
            }}
          >
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[520px]"
              style={{ overflow: "visible" }}
            >
              <defs>
                {/* 3D Lighting Gradients */}
                {/* Driver Gear Top Brushed Titanium */}
                <linearGradient id="driverTopGradient" x1="15%" y1="10%" x2="85%" y2="90%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="18%" stopColor="#e2e8f0" />
                  <stop offset="42%" stopColor="#64748b" />
                  <stop offset="68%" stopColor="#94a3b8" />
                  <stop offset="88%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                {/* Driver Tooth Bevel Ring */}
                <linearGradient id="driverBevelRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                </linearGradient>

                {/* Driven Gear Top Machined Bronze-Chrome */}
                <linearGradient id="drivenTopGradient" x1="15%" y1="10%" x2="85%" y2="90%">
                  <stop offset="0%" stopColor="#f5f3ff" />
                  <stop offset="22%" stopColor="#ddd6fe" />
                  <stop offset="45%" stopColor="#7c3aed" />
                  <stop offset="68%" stopColor="#c084fc" />
                  <stop offset="88%" stopColor="#faf5ff" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>

                {/* Driven Tooth Bevel Ring */}
                <linearGradient id="drivenBevelRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
                </linearGradient>

                {/* Cylindrical Drive Shaft Gradients (Vertical 3D Extrusion) */}
                <linearGradient id="shaftCylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0c1929" />
                  <stop offset="25%" stopColor="#38bdf8" />
                  <stop offset="55%" stopColor="#f0f9ff" />
                  <stop offset="80%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#082f49" />
                </linearGradient>

                <linearGradient id="drivenShaftCylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e1338" />
                  <stop offset="25%" stopColor="#a855f7" />
                  <stop offset="55%" stopColor="#faf5ff" />
                  <stop offset="80%" stopColor="#7e22ce" />
                  <stop offset="100%" stopColor="#3b0764" />
                </linearGradient>

                {/* 3D Hub Spherical Specular Reflection */}
                <radialGradient id="hubSpecularGrad" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#cbd5e1" stopOpacity="0.8" />
                  <stop offset="75%" stopColor="#1e293b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#090d16" stopOpacity="1" />
                </radialGradient>

                {/* Ground Shadow Filter */}
                <filter id="floorShadow3D" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="18" result="blur" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.9 0"
                  />
                </filter>

                {/* Mesh Point Glow */}
                <filter id="kineticMeshGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* ================= 1. HEAVY CAST BASEPLATE / WORKBENCH MOUNT ================= */}
              <g id="baseplate-mount">
                {/* 3D Baseplate Lower Rim Shadow */}
                <rect
                  x="40"
                  y={centerY - 32}
                  width={svgWidth - 80}
                  height="82"
                  rx="20"
                  fill="#01040a"
                  filter="url(#floorShadow3D)"
                />

                {/* Machined Aluminum Bed Structure */}
                <rect
                  x="40"
                  y={centerY - 24}
                  width={svgWidth - 80}
                  height="64"
                  rx="18"
                  fill="#0a101b"
                  stroke="#1e293b"
                  strokeWidth="2"
                />

                {/* Recessed Center T-Slot Channel */}
                <rect
                  x="60"
                  y={centerY - 10}
                  width={svgWidth - 120}
                  height="20"
                  rx="8"
                  fill="#02050e"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Centerline Metric Scale Ticks */}
                {Array.from({ length: 27 }).map((_, idx) => (
                  <line
                    key={`bed-tick-${idx}`}
                    x1={80 + idx * 28}
                    y1={centerY - 8}
                    x2={80 + idx * 28}
                    y2={idx % 5 === 0 ? centerY + 8 : centerY + 2}
                    stroke={idx % 5 === 0 ? "#64748b" : "#1e293b"}
                    strokeWidth={idx % 5 === 0 ? "1.5" : "1"}
                  />
                ))}

                {/* Center Distance Kinematic Guide Line */}
                <line
                  x1={driverCenterX}
                  y1={centerY}
                  x2={drivenCenterX}
                  y2={centerY}
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.8"
                />
              </g>

              {/* ================= 2. CAST FLOOR CONTACT SHADOWS ================= */}
              <g id="cast-floor-shadows" filter="url(#floorShadow3D)">
                <ellipse
                  cx={driverCenterX + 16}
                  cy={centerY + 38}
                  rx={rDriverPitch + addendum + 8}
                  ry={(rDriverPitch + addendum + 8) * 0.48}
                  fill="#000000"
                />
                <ellipse
                  cx={drivenCenterX + 22}
                  cy={centerY + 42}
                  rx={rDrivenPitch + addendum + 10}
                  ry={(rDrivenPitch + addendum + 10) * 0.48}
                  fill="#000000"
                />
              </g>

              {/* ================= 3. LOWER 3D SHAFT & BEARING PILLOW BLOCKS ================= */}
              <g id="lower-shafts-and-bearings">
                {/* Driver Lower Bearing Block */}
                <g transform={`translate(${driverCenterX}, ${centerY})`}>
                  <rect x="-28" y="10" width="56" height="38" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  <circle cx="-18" cy="28" r="3.5" fill="#cbd5e1" />
                  <circle cx="18" cy="28" r="3.5" fill="#cbd5e1" />
                  {/* Lower Steel Shaft Extension */}
                  <rect x="-12" y="0" width="24" height="46" fill="url(#shaftCylinderGrad)" />
                </g>

                {/* Driven Lower Bearing Block */}
                <g transform={`translate(${drivenCenterX}, ${centerY})`}>
                  <rect x="-30" y="10" width="60" height="40" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  <circle cx="-20" cy="30" r="3.5" fill="#cbd5e1" />
                  <circle cx="20" cy="30" r="3.5" fill="#cbd5e1" />
                  {/* Lower Steel Shaft Extension */}
                  <rect x="-13" y="0" width="26" height="48" fill="url(#drivenShaftCylinderGrad)" />
                </g>
              </g>

              {/* ================= 4. DRIVER GEAR ASSEMBLY (3D SOLID EXTRUDED) ================= */}
              <g id="driver-gear-3d" transform={`translate(${driverCenterX}, ${centerY})`}>
                {/* Rotating Container for Driver Gear */}
                <g ref={driverMainGroupRef}>
                  {/* Dense Multi-layered 3D Depth Slices */}
                  {extrusionSlices.map((slice, idx) => (
                    <g
                      key={`driver-slice-${idx}`}
                      transform={`translate(${slice.dx}, ${slice.dy})`}
                      opacity={0.96}
                    >
                      <path
                        d={driverGearPath}
                        fill="#050a14"
                        stroke={`rgba(${Math.round(45 * slice.brightness)}, ${Math.round(
                          70 * slice.brightness
                        )}, ${Math.round(110 * slice.brightness)}, 0.95)`}
                        strokeWidth="1.4"
                      />
                    </g>
                  ))}

                  {/* Top Faceplate - Brushed Titanium Front Face */}
                  <path
                    d={driverGearPath}
                    fill="url(#driverTopGradient)"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                  />

                  {/* Chamfered Outer Bevel Accent Ring */}
                  <path
                    d={driverGearPath}
                    fill="none"
                    stroke="url(#driverBevelRing)"
                    strokeWidth="2.8"
                  />

                  {/* Inner Recessed Face Well */}
                  <circle
                    cx="0"
                    cy="0"
                    r={Math.max(16, rDriverPitch - 12)}
                    fill="#0e1726"
                    stroke="#475569"
                    strokeWidth="2.5"
                  />

                  {/* Spoke Cutouts with Depth Bevels */}
                  {driverSpokes &&
                    driverSpokes.map((spoke, idx) => (
                      <g key={`driver-spoke-${idx}`}>
                        <circle
                          cx={spoke.cx + 2}
                          cy={spoke.cy + 3}
                          r={spoke.r}
                          fill="#01040a"
                        />
                        <circle
                          cx={spoke.cx}
                          cy={spoke.cy}
                          r={spoke.r}
                          fill="#050811"
                          stroke="#334155"
                          strokeWidth="2"
                        />
                      </g>
                    ))}

                  {/* 3D Machined Central Collar / Hub Boss */}
                  <circle cx="0" cy="0" r="28" fill="#070c17" />
                  <circle cx="0" cy="0" r="25" fill="url(#hubSpecularGrad)" stroke="#cbd5e1" strokeWidth="1.8" />

                  {/* Concentric Machining Rings */}
                  <circle cx="0" cy="0" r="19" fill="none" stroke="#64748b" strokeWidth="0.8" strokeDasharray="3 2" />

                  {/* Hex Flange Bolt Pattern */}
                  {[0, 90, 180, 270].map((deg) => (
                    <circle
                      key={`driver-bolt-${deg}`}
                      cx={18 * Math.cos((deg * Math.PI) / 180)}
                      cy={18 * Math.sin((deg * Math.PI) / 180)}
                      r="2.4"
                      fill="#e2e8f0"
                      stroke="#0f172a"
                      strokeWidth="1.2"
                    />
                  ))}

                  {/* Drive Keyway Slot */}
                  <rect x="-3.5" y="-16" width="7" height="7" fill="#020617" rx="1" />
                </g>

                {/* 3D Vertical Drive Shaft Emerging Forward into 3D Space */}
                <g id="driver-shaft-forward">
                  <rect
                    x="-12"
                    y="-42"
                    width="24"
                    height="42"
                    fill="url(#shaftCylinderGrad)"
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  {/* Top Shaft Crown Bevel */}
                  <ellipse
                    cx="0"
                    cy="-42"
                    rx="12"
                    ry="5.5"
                    fill="#e0f2fe"
                    stroke="#0284c7"
                    strokeWidth="1.4"
                  />
                  {/* Shaft Center Lathe Dimple */}
                  <circle cx="0" cy="-42" r="3" fill="#0369a1" />
                </g>

                {/* Stationary Pitch Circle Overlay */}
                {showPitchCircles && (
                  <circle
                    cx="0"
                    cy="0"
                    r={rDriverPitch}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    opacity="0.85"
                  />
                )}

                {/* Rotational Direction Ring */}
                <g ref={driverArrowRef}>
                  <circle
                    cx="0"
                    cy="0"
                    r={rDriverPitch + addendum + 20}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="18 52"
                    opacity="0.85"
                  />
                </g>
              </g>

              {/* ================= 5. DRIVEN GEAR ASSEMBLY (3D SOLID EXTRUDED) ================= */}
              <g id="driven-gear-3d" transform={`translate(${drivenCenterX}, ${centerY})`}>
                {/* Rotating Container for Driven Gear */}
                <g ref={drivenMainGroupRef}>
                  {/* Multi-layered 3D Depth Slices */}
                  {extrusionSlices.map((slice, idx) => (
                    <g
                      key={`driven-slice-${idx}`}
                      transform={`translate(${slice.dx}, ${slice.dy})`}
                      opacity={0.96}
                    >
                      <path
                        d={drivenGearPath}
                        fill="#0c071d"
                        stroke={`rgba(${Math.round(70 * slice.brightness)}, ${Math.round(
                          35 * slice.brightness
                        )}, ${Math.round(130 * slice.brightness)}, 0.95)`}
                        strokeWidth="1.4"
                      />
                    </g>
                  ))}

                  {/* Top Faceplate - Machined Chrome/Purple Front Face */}
                  <path
                    d={drivenGearPath}
                    fill="url(#drivenTopGradient)"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                  />

                  {/* Chamfered Outer Bevel Accent Ring */}
                  <path
                    d={drivenGearPath}
                    fill="none"
                    stroke="url(#drivenBevelRing)"
                    strokeWidth="2.8"
                  />

                  {/* Inner Recessed Face Well */}
                  <circle
                    cx="0"
                    cy="0"
                    r={Math.max(16, rDrivenPitch - 14)}
                    fill="#150d2e"
                    stroke="#581c87"
                    strokeWidth="2.5"
                  />

                  {/* Spoke Cutouts with Machined Bevels */}
                  {drivenSpokes &&
                    drivenSpokes.map((spoke, idx) => (
                      <g key={`driven-spoke-${idx}`}>
                        <circle
                          cx={spoke.cx + 2}
                          cy={spoke.cy + 3}
                          r={spoke.r}
                          fill="#020510"
                        />
                        <circle
                          cx={spoke.cx}
                          cy={spoke.cy}
                          r={spoke.r}
                          fill="#080415"
                          stroke="#6b21a8"
                          strokeWidth="2"
                        />
                      </g>
                    ))}

                  {/* Central Collar / Hub Boss */}
                  <circle cx="0" cy="0" r="30" fill="#120928" />
                  <circle cx="0" cy="0" r="26" fill="url(#hubSpecularGrad)" stroke="#e9d5ff" strokeWidth="1.8" />

                  {/* Concentric Machining Rings */}
                  <circle cx="0" cy="0" r="20" fill="none" stroke="#9333ea" strokeWidth="0.8" strokeDasharray="3 2" />

                  {/* Hex Flange Bolt Pattern (6-bolt) */}
                  {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <circle
                      key={`driven-bolt-${deg}`}
                      cx={20 * Math.cos((deg * Math.PI) / 180)}
                      cy={20 * Math.sin((deg * Math.PI) / 180)}
                      r="2.4"
                      fill="#f3e8ff"
                      stroke="#1e1b4b"
                      strokeWidth="1.2"
                    />
                  ))}

                  {/* Drive Keyway Slot */}
                  <rect x="-3.5" y="-16" width="7" height="7" fill="#020617" rx="1" />
                </g>

                {/* 3D Vertical Drive Shaft Emerging Forward */}
                <g id="driven-shaft-forward">
                  <rect
                    x="-13"
                    y="-44"
                    width="26"
                    height="44"
                    fill="url(#drivenShaftCylinderGrad)"
                    stroke="#c084fc"
                    strokeWidth="1"
                  />
                  <ellipse
                    cx="0"
                    cy="-44"
                    rx="13"
                    ry="6"
                    fill="#f3e8ff"
                    stroke="#9333ea"
                    strokeWidth="1.4"
                  />
                  <circle cx="0" cy="-44" r="3" fill="#6b21a8" />
                </g>

                {/* Stationary Pitch Circle Overlay */}
                {showPitchCircles && (
                  <circle
                    cx="0"
                    cy="0"
                    r={rDrivenPitch}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    opacity="0.85"
                  />
                )}

                {/* Rotational Direction Ring */}
                <g ref={drivenArrowRef}>
                  <circle
                    cx="0"
                    cy="0"
                    r={rDrivenPitch + addendum + 20}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="18 52"
                    opacity="0.85"
                  />
                </g>
              </g>

              {/* ================= 6. TANGENT CONTACT POINT / PRESSURE ANGLE LINE ================= */}
              <g transform={`translate(${contactMeshX}, ${centerY})`}>
                <line x1="0" y1="-34" x2="0" y2="34" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" />
                <circle cx="0" cy="0" r="14" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.75" />
                <circle cx="0" cy="0" r="4" fill="#38bdf8" filter="url(#kineticMeshGlow)" />
                {/* Kinetic Engagement Sparks */}
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />
                <line x1="-8" y1="8" x2="8" y2="-8" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />
              </g>

              {/* ================= 7. 3D FLOATING HUD LABELS & SPEED READOUTS ================= */}
              {/* Driver Gear Floating 3D Badge */}
              <g transform={`translate(${driverCenterX}, ${Math.max(45, centerY - rDriverPitch - addendum - 46)})`}>
                <rect
                  x="-62"
                  y="-22"
                  width="124"
                  height="44"
                  rx="10"
                  fill="#050b14"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  opacity="0.96"
                />
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  DRIVER (N₁) • {driverTeeth}T
                </text>
                <text
                  x="0"
                  y="13"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  ↻ {inputRPM} RPM (CW)
                </text>
              </g>

              {/* Driven Gear Floating 3D Badge */}
              <g transform={`translate(${drivenCenterX}, ${Math.max(45, centerY - rDrivenPitch - addendum - 46)})`}>
                <rect
                  x="-62"
                  y="-22"
                  width="124"
                  height="44"
                  rx="10"
                  fill="#0b0617"
                  stroke="#9333ea"
                  strokeWidth="1.5"
                  opacity="0.96"
                />
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  fill="#c084fc"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  DRIVEN (N₂) • {drivenTeeth}T
                </text>
                <text
                  x="0"
                  y="13"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  ↺ {outputRPM} RPM (CCW)
                </text>
              </g>

              {/* Pitch Mesh Point Tag */}
              <g transform={`translate(${contactMeshX}, ${centerY + 56})`}>
                <rect
                  x="-48"
                  y="-12"
                  width="96"
                  height="24"
                  rx="6"
                  fill="#030712"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x="0"
                  y="4.5"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  3D Pitch Mesh Line
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* 3D Depth & Tilt Fine-Tuning Slider Drawer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">Extrusion Face Width:</span>
            <span className="text-cyan-300 font-bold">{gearThickness} mm</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono text-[10px]">Thickness:</span>
              <input
                type="range"
                min="12"
                max="32"
                step="2"
                value={gearThickness}
                onChange={(e) => setGearThickness(Number(e.target.value))}
                className="w-20 sm:w-28 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono text-[10px]">Tilt X:</span>
              <input
                type="range"
                min="-15"
                max="75"
                step="1"
                value={rotX}
                onChange={(e) => setRotX(Number(e.target.value))}
                className="w-16 sm:w-20 accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[10px] text-slate-400 w-6">{rotX}°</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono text-[10px]">Orbit Y:</span>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotY}
                onChange={(e) => setRotY(Number(e.target.value))}
                className="w-16 sm:w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[10px] text-slate-400 w-8">{rotY}°</span>
            </div>
          </div>
        </div>

        {/* Floating Real-Time Engineering Telemetry Panel */}
        <div className="relative z-10 p-4 sm:p-5 bg-slate-950/95 backdrop-blur-md border-t border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Gear Ratio */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Gear Ratio (i)
                </span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
                {gearRatio}:1
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {drivenTeeth}T ÷ {driverTeeth}T
              </div>
            </div>

            {/* Input Speed */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Input Speed (ω₁)
                </span>
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                {inputRPM} <span className="text-xs font-normal text-slate-400">RPM</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Clockwise rotation
              </div>
            </div>

            {/* Output Velocity */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Output Speed (ω₂)
                </span>
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
                {outputRPM} <span className="text-xs font-normal text-slate-400">RPM</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Counter-Clockwise
              </div>
            </div>

            {/* Torque Multiplier */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Torque Multiplier
                </span>
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                {torqueMultiplier}×
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Power Conserved (P₁ ≈ P₂)
              </div>
            </div>
          </div>

          {/* Governing Physics & Kinematic Equation Reference Strip */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
              <span className="text-cyan-400 font-bold">Formula:</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold text-white">
                i = N₂ / N₁ = ω₁ / ω₂ = T₂ / T₁
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              {gearRatio > 1
                ? "Speed Reduction (Torque Multiplied, Output Decelerated)"
                : gearRatio < 1
                ? "Speed Overdrive (Output Accelerated, Torque Divided)"
                : "Direct 1:1 Coupling (Equal Velocity & Torque)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
