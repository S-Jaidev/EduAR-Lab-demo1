import React from "react";
import { Award, Zap, CheckCircle2, Clock, BookOpen, Star, Sparkles, Scan, Bot } from "lucide-react";
import { Badge, Experiment } from "../types";
import { STUDENT_BADGES, PRIMARY_EXPERIMENT } from "../data/mockData";

interface StudentProgressProps {
  completedExperimentsCount: number;
  recordedDataPointsCount: number;
  onLaunchExperiment: () => void;
}

export const StudentProgress: React.FC<StudentProgressProps> = ({
  completedExperimentsCount,
  recordedDataPointsCount,
  onLaunchExperiment,
}) => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Student Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-2xl text-slate-950 shadow-md">
            JS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Jaidev S.</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-900/70 text-cyan-300 border border-cyan-700">
                Grade 10 Scholar
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              NCERT Class 10 Science • Physics Curriculum Stream
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-lg font-bold text-cyan-300">{completedExperimentsCount >= 1 ? "1" : "0"}/1</div>
            <div className="text-[10px] text-slate-400">Labs Completed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-lg font-bold text-amber-300">95%</div>
            <div className="text-[10px] text-slate-400">Mastery Score</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-lg font-bold text-emerald-300">3</div>
            <div className="text-[10px] text-slate-400">AR Badges</div>
          </div>
        </div>
      </div>

      {/* Completed Experiments Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Virtual Laboratory Transcripts</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Academic Year 2026</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                Class 10 Physics
              </span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Complete
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {PRIMARY_EXPERIMENT.title} ({PRIMARY_EXPERIMENT.formula})
            </h3>
            <p className="text-xs text-slate-500">
              Recorded {recordedDataPointsCount} experimental data points. Verified linear relation $I \propto V$.
            </p>
          </div>

          <button
            onClick={onLaunchExperiment}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            Review Simulation
          </button>
        </div>
      </div>

      {/* Earned AR Achievements / Badges */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>AR Badges & Achievements</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STUDENT_BADGES.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                badge.unlocked
                  ? "bg-amber-50/40 border-amber-200 shadow-xs"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                      badge.unlocked ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-slate-400"
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  {badge.unlocked && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Unlocked
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{badge.title}</h3>
                <p className="text-xs text-slate-600">{badge.description}</p>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-200/60 pt-2">
                Category: <strong>{badge.category}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
