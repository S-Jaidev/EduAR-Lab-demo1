import React from "react";
import { Experiment } from "../types";
import {
  Play,
  Scan,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Clock,
  Award,
  Layers,
} from "lucide-react";

interface ExperimentDetailProps {
  experiment: Experiment;
  onLaunchSimulation: (experimentId: string) => void;
  onOpenScanner: () => void;
}

export const ExperimentDetail: React.FC<ExperimentDetailProps> = ({
  experiment,
  onLaunchSimulation,
  onOpenScanner,
}) => {
  const isOhm = experiment.id === "exp-ohms-law";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-900">
            {experiment.subjectName}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            {experiment.grade}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            {experiment.unit}
          </span>
          {isOhm ? (
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Live Lab
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              MVP Simulation Ready
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {experiment.title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {experiment.longDescription}
        </p>
      </div>

      {/* Governing Principle / Formula Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md space-y-2">
        <div className="text-[11px] font-semibold text-cyan-300 tracking-wider uppercase">
          Governing Scientific Principle / Formula
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-cyan-300">
            {experiment.formula}
          </div>
          <div className="text-xs text-slate-300 sm:text-right max-w-sm">
            {experiment.formulaDescription}
          </div>
        </div>
      </div>

      {/* Key Learning Objectives */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Key Learning Objectives
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {experiment.objectives.map((obj, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Required Apparatus & Components */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Virtual Apparatus & Materials
        </h3>
        <div className="flex flex-wrap gap-2">
          {experiment.equipment.map((eq, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
            >
              {eq}
            </span>
          ))}
        </div>
      </div>

      {/* Textbook AR Anchor Mapping */}
      <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200/80 flex items-start gap-3 text-xs text-cyan-950">
        <BookOpen className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Curriculum Textbook Anchor: </span>
          <span>{experiment.arTextbookChapter}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
        <button
          id={`launch-exp-btn-${experiment.id}`}
          onClick={() => onLaunchSimulation(experiment.id)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current text-cyan-300" />
          <span>Launch {isOhm ? "Virtual Lab Simulation" : "MVP Simulation"}</span>
        </button>

        <button
          id={`scan-textbook-btn-${experiment.id}`}
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
        >
          <Scan className="w-4 h-4 text-cyan-700" />
          <span>Scan Printed Textbook Page</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>~{experiment.durationMinutes} mins</span>
        </div>
      </div>
    </div>
  );
};
