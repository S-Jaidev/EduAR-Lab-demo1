import React from "react";
import { Subject, Experiment, SubjectId, NavigationTab } from "../types";
import {
  Zap,
  FlaskConical,
  Heart,
  Shapes,
  Cog,
  Globe,
  Binary,
  Landmark,
  Dna,
  Scan,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Play,
  TrendingUp,
  HelpCircle,
  Layers,
  ChevronRight,
} from "lucide-react";

interface StudentHomeProps {
  subjects: Subject[];
  featuredExperiment: Experiment;
  onSelectSubject: (subjectId: SubjectId) => void;
  onStartExperiment: (experimentId: string) => void;
  onOpenScanner: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  subjects,
  featuredExperiment,
  onSelectSubject,
  onStartExperiment,
  onOpenScanner,
  onNavigate,
}) => {
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="w-6 h-6" />;
      case "FlaskConical":
        return <FlaskConical className="w-6 h-6" />;
      case "Heart":
        return <Heart className="w-6 h-6" />;
      case "Dna":
        return <Dna className="w-6 h-6" />;
      case "Shapes":
        return <Shapes className="w-6 h-6" />;
      case "Cog":
        return <Cog className="w-6 h-6" />;
      case "Globe":
        return <Globe className="w-6 h-6" />;
      case "Binary":
        return <Binary className="w-6 h-6" />;
      case "Landmark":
        return <Landmark className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <section
        id="student-hero-banner"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl shadow-blue-950/20 border border-blue-900/50 p-6 sm:p-8 lg:p-10"
      >
        {/* Subtle geometric and grid background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AR Educational Virtual Laboratory</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Turning Textbooks into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Living Labs</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
              Point your camera at standard Class 10 Science textbooks to unlock interactive 3D simulations, real-time physical calculations, and instant AI tutor guidance.
            </p>
          </div>

          {/* Workflow Steps Indicator */}
          <div className="pt-2 pb-2">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-cyan-400/90 mb-2">
              The 5-Step EduAR Learning Cycle:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {[
                { step: "1", title: "Scan", desc: "Textbook page" },
                { step: "2", title: "Recognize", desc: "AI concept match" },
                { step: "3", title: "Simulate", desc: "Interactive 3D" },
                { step: "4", title: "Interact", desc: "Change V & R" },
                { step: "5", title: "Analyze", desc: "V-I Graph & Tutor" },
              ].map((item, idx) => (
                <div
                  key={item.step}
                  className="flex flex-col p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs"
                >
                  <div className="flex items-center justify-between text-cyan-400 text-xs font-bold mb-1">
                    <span>0{item.step}</span>
                    <span className="text-[10px] text-slate-400">Step</span>
                  </div>
                  <span className="font-semibold text-xs text-white">{item.title}</span>
                  <span className="text-[11px] text-slate-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-cta-start-learning"
              onClick={() => onStartExperiment(featuredExperiment.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Learning (Ohm's Law)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              id="hero-cta-scan-page"
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 cursor-pointer"
            >
              <Scan className="w-4 h-4 text-cyan-400" />
              <span>Scan Class 10 Textbook</span>
            </button>

            <button
              id="hero-cta-ai-tutor"
              onClick={() => onNavigate("tutor")}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-cyan-300 border border-slate-700/60 font-medium text-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Experiment: Class 10 Physics Ohm's Law */}
      <section id="featured-experiment-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>Featured AR Laboratory Experiment</span>
            </h2>
            <p className="text-sm text-slate-500">
              Primary demonstration for Class 10 Science (Electricity)
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Interactive 3D Ready
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Experiment Information */}
            <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                    {featuredExperiment.subjectName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                    {featuredExperiment.grade}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    {featuredExperiment.unit}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {featuredExperiment.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {featuredExperiment.shortDescription}
                </p>

                {/* Key Formula Spotlight */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      V
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Fundamental Equation</div>
                      <div className="text-base sm:text-lg font-mono font-bold text-blue-950">
                        {featuredExperiment.formula} &nbsp; <span className="text-xs font-normal text-slate-600">({featuredExperiment.formulaDescription})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Objectives Snapshot */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Core Learning Outcomes:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                      <span>Verify voltage-current direct proportionality ($I = V / R$) with live meter readings.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                      <span>Observe real-time bulb filament brightness and current speed dynamics.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                      <span>Generate a live V-I experimental graph and determine circuit resistance from the slope.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="featured-exp-launch-lab"
                  onClick={() => onStartExperiment(featuredExperiment.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-cyan-300" />
                  <span>Launch Virtual Lab</span>
                </button>

                <button
                  id="featured-exp-scan-textbook"
                  onClick={onOpenScanner}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-colors cursor-pointer"
                >
                  <Scan className="w-4 h-4 text-cyan-700" />
                  <span>Scan Textbook Anchor</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~15 min lab session</span>
                </div>
              </div>
            </div>

            {/* Interactive Visual Preview Box */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-cyan-400">CIRCUIT_SCHEMATIC_v1.0</span>
                  <span className="px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700 text-cyan-300 text-[10px]">
                    AR Ready
                  </span>
                </div>

                {/* Circuit SVG Graphic Miniature */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-inner flex items-center justify-center">
                  <svg viewBox="0 0 280 160" className="w-full h-auto max-w-[260px]">
                    {/* Wires */}
                    <rect x="25" y="25" width="230" height="110" rx="10" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="4 2" />
                    
                    {/* Battery */}
                    <g transform="translate(40, 70)">
                      <rect x="0" y="0" width="30" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="8" y1="5" x2="8" y2="15" stroke="#f43f5e" strokeWidth="2" />
                      <line x1="22" y1="7" x2="22" y2="13" stroke="#38bdf8" strokeWidth="2" />
                      <text x="15" y="-4" fill="#94a3b8" fontSize="8" textAnchor="middle">Battery (V)</text>
                    </g>

                    {/* Resistor */}
                    <g transform="translate(130, 25)">
                      <rect x="-20" y="-8" width="40" height="16" rx="3" fill="#334155" stroke="#fbbf24" strokeWidth="1.5" />
                      <line x1="-12" y1="-4" x2="-12" y2="4" stroke="#ef4444" strokeWidth="1.5" />
                      <line x1="-4" y1="-4" x2="-4" y2="4" stroke="#3b82f6" strokeWidth="1.5" />
                      <line x1="4" y1="-4" x2="4" y2="4" stroke="#10b981" strokeWidth="1.5" />
                      <line x1="12" y1="-4" x2="12" y2="4" stroke="#eab308" strokeWidth="1.5" />
                      <text x="0" y="-12" fill="#fbbf24" fontSize="8" textAnchor="middle">Resistor (R)</text>
                    </g>

                    {/* Bulb */}
                    <g transform="translate(225, 80)">
                      <circle cx="0" cy="0" r="14" fill="#fef08a" fillOpacity="0.8" stroke="#eab308" strokeWidth="2" />
                      <path d="M-6 4 Q0 -6 6 4" fill="none" stroke="#d97706" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="22" fill="#fef08a" fillOpacity="0.15" />
                      <text x="0" y="24" fill="#fef08a" fontSize="8" textAnchor="middle">Bulb (Light)</text>
                    </g>

                    {/* Switch */}
                    <g transform="translate(130, 135)">
                      <circle cx="-12" cy="0" r="3" fill="#38bdf8" />
                      <circle cx="12" cy="0" r="3" fill="#38bdf8" />
                      <line x1="-12" y1="0" x2="10" y2="-1" stroke="#22c55e" strokeWidth="2.5" />
                      <text x="0" y="16" fill="#22c55e" fontSize="8" textAnchor="middle">Key Closed [✓]</text>
                    </g>
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Default V</div>
                    <div className="font-mono font-bold text-cyan-300">5.0 V</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Default R</div>
                    <div className="font-mono font-bold text-amber-300">10.0 Ω</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Current (I)</div>
                    <div className="font-mono font-bold text-emerald-400">0.50 A</div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Textbook Chapter: <strong>Section 12.4</strong></span>
                <span className="text-cyan-400 flex items-center gap-1">
                  Ready to interact <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subject Catalog Cards Grid */}
      <section id="subjects-catalog-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore Subjects & Virtual Labs</h2>
            <p className="text-sm text-slate-500">
              Select a STEM discipline to begin interactive chapter-based experiments
            </p>
          </div>
          <button
            id="view-all-experiments-btn"
            onClick={() => onNavigate("experiments")}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Curricula</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {subjects.map((subject) => {
            const isPhysics = subject.id === "physics";
            return (
              <div
                key={subject.id}
                id={`subject-card-${subject.id}`}
                onClick={() => {
                  if (subject.available) {
                    onSelectSubject(subject.id);
                  }
                }}
                className={`relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 sm:p-6 ${
                  subject.available
                    ? "bg-white border-blue-200/80 shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer group"
                    : "bg-slate-50/70 border-slate-200/80 opacity-80 cursor-default"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                        subject.available
                          ? "bg-gradient-to-br from-blue-700 to-cyan-600 group-hover:scale-105 transition-transform"
                          : "bg-slate-400"
                      }`}
                    >
                      {getSubjectIcon(subject.iconName)}
                    </div>
                    {subject.available ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active MVP
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/70 text-slate-600">
                        Coming Next
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {subject.tagline}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="text-[11px] font-medium text-slate-400">Featured Module:</div>
                    <div className="font-semibold text-slate-700 truncate mt-0.5">
                      {subject.featuredTopic}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {subject.experimentsCount} Experiments
                  </span>
                  {subject.available ? (
                    <span className="font-semibold text-blue-700 group-hover:text-blue-900 flex items-center gap-1">
                      <span>Open Lab</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Curriculum mapped</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Summary & AR Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <Scan className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Textbook OCR & Marker AR</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Detects printed chapter diagrams and instantly overlays dynamic, interactive 3D laboratory apparatus.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Dynamic Physical Engine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates electrical current ($I = V / R$), electron flow speed, bulb luminescence, and linear graph slopes.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Classroom AI Science Tutor</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assists students in real time with Socratic answers grounded in their live virtual laboratory state.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
