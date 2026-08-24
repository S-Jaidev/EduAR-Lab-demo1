import React from "react";
import { Experiment } from "../types";
import {
  Play,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  FlaskConical,
  Heart,
  Shapes,
  Cog,
  Globe,
  Binary,
  Landmark,
  BookOpen,
} from "lucide-react";

interface ExperimentCardProps {
  experiment: Experiment;
  isSelected?: boolean;
  onSelect?: (experimentId: string) => void;
  onLaunch?: (experimentId: string) => void;
  compact?: boolean;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  isSelected = false,
  onSelect,
  onLaunch,
  compact = false,
}) => {
  const getSubjectIcon = (subjectId: string) => {
    switch (subjectId) {
      case "physics":
        return <Zap className="w-4 h-4 text-blue-600" />;
      case "chemistry":
        return <FlaskConical className="w-4 h-4 text-emerald-600" />;
      case "biology":
        return <Heart className="w-4 h-4 text-rose-600" />;
      case "mathematics":
        return <Shapes className="w-4 h-4 text-amber-600" />;
      case "engineering":
        return <Cog className="w-4 h-4 text-purple-600" />;
      case "earth-science":
        return <Globe className="w-4 h-4 text-cyan-600" />;
      case "computer-science":
        return <Binary className="w-4 h-4 text-indigo-600" />;
      case "social-science":
        return <Landmark className="w-4 h-4 text-amber-800" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  const isLiveOhm = experiment.id === "exp-ohms-law";

  if (compact) {
    return (
      <div
        id={`exp-card-compact-${experiment.id}`}
        onClick={() => onSelect && onSelect(experiment.id)}
        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? "bg-blue-50/90 border-blue-400 shadow-xs"
            : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {experiment.grade}
              </span>
              {isLiveOhm ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Lab
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-600" />
                  MVP Lab
                </span>
              )}
            </div>
            <h4
              className={`text-xs sm:text-sm font-bold ${
                isSelected ? "text-blue-950" : "text-slate-800"
              }`}
            >
              {experiment.title}
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2">
              {experiment.shortDescription}
            </p>
          </div>
          <ChevronRight
            className={`w-4 h-4 shrink-0 mt-1 ${
              isSelected ? "text-blue-700" : "text-slate-400"
            }`}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      id={`exp-card-${experiment.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              {getSubjectIcon(experiment.subjectId)}
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {experiment.subjectName}
            </span>
          </div>

          {isLiveOhm ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Lab
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-600" />
              MVP Simulation
            </span>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {experiment.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
            {experiment.shortDescription}
          </p>
        </div>

        {/* Formula or Governing Principle Pill */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-slate-500">Law / Model:</span>
          <span className="font-mono font-bold text-blue-950 truncate max-w-[180px]">
            {experiment.formula}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{experiment.durationMinutes} mins</span>
        </div>

        <button
          onClick={() => onLaunch && onLaunch(experiment.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Play className="w-3 h-3 fill-current text-cyan-300" />
          <span>Launch Lab</span>
        </button>
      </div>
    </div>
  );
};
