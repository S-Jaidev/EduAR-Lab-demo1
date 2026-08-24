import React, { useState, useEffect } from "react";
import { Subject, Experiment, SubjectId } from "../types";
import { ExperimentCard } from "./ExperimentCard";
import { ExperimentDetail } from "./ExperimentDetail";
import {
  Zap,
  FlaskConical,
  Heart,
  Shapes,
  Cog,
  Globe,
  Binary,
  Landmark,
  ArrowLeft,
  Scan,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface SubjectCatalogProps {
  subjects: Subject[];
  selectedSubject: SubjectId;
  onSelectSubject: (subjectId: SubjectId) => void;
  primaryExperiment: Experiment;
  otherExperiments: Experiment[];
  onStartExperiment: (experimentId: string) => void;
  onOpenScanner: () => void;
  onBackToHome: () => void;
}

export const SubjectCatalog: React.FC<SubjectCatalogProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  primaryExperiment,
  otherExperiments,
  onStartExperiment,
  onOpenScanner,
  onBackToHome,
}) => {
  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];
  const allExperiments = [primaryExperiment, ...otherExperiments];

  // Filter experiments belonging to the selected subject
  const subjectExperiments = allExperiments.filter(
    (exp) => exp.subjectId === selectedSubject
  );

  // If no experiments match, fallback to primary
  const initialExp = subjectExperiments.length > 0 ? subjectExperiments[0] : primaryExperiment;
  const [selectedExpId, setSelectedExpId] = useState<string>(initialExp.id);

  useEffect(() => {
    const exps = allExperiments.filter((exp) => exp.subjectId === selectedSubject);
    if (exps.length > 0) {
      setSelectedExpId(exps[0].id);
    }
  }, [selectedSubject]);

  const activeExp =
    allExperiments.find((e) => e.id === selectedExpId) || initialExp;

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="w-5 h-5" />;
      case "FlaskConical":
        return <FlaskConical className="w-5 h-5" />;
      case "Heart":
        return <Heart className="w-5 h-5" />;
      case "Shapes":
        return <Shapes className="w-5 h-5" />;
      case "Cog":
        return <Cog className="w-5 h-5" />;
      case "Globe":
        return <Globe className="w-5 h-5" />;
      case "Binary":
        return <Binary className="w-5 h-5" />;
      case "Landmark":
        return <Landmark className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={onBackToHome}
            className="hover:text-blue-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900">{currentSubjectObj.name}</span>
          <span>/</span>
          <span className="text-cyan-700 font-medium">{activeExp.unit}</span>
          <span>/</span>
          <span className="text-slate-800 font-medium">{activeExp.title}</span>
        </div>

        {/* Subject switcher pills (all 8 subjects) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto max-w-full">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSubject(s.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                s.id === selectedSubject
                  ? "bg-white text-blue-950 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            {getSubjectIcon(currentSubjectObj.iconName)}
            <span>Curriculum Unit: {activeExp.unit}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {currentSubjectObj.name} Virtual Laboratories
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {currentSubjectObj.tagline} — Interactive laboratory simulations aligned with curriculum standards.
          </p>
        </div>

        <button
          id="catalog-quick-scan-btn"
          onClick={onOpenScanner}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Scan className="w-4 h-4 text-slate-950" />
          <span>Scan Textbook Page</span>
        </button>
      </div>

      {/* Main Grid: Experiment List vs Selected Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Experiments in Selected Subject */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            {currentSubjectObj.name} Experiments ({subjectExperiments.length})
          </h2>

          <div className="space-y-2">
            {subjectExperiments.map((exp) => (
              <ExperimentCard
                key={exp.id}
                experiment={exp}
                isSelected={exp.id === selectedExpId}
                onSelect={(id) => setSelectedExpId(id)}
                onLaunch={(id) => onStartExperiment(id)}
                compact
              />
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Experiment Overview & Start Options */}
        <div className="lg:col-span-8">
          <ExperimentDetail
            experiment={activeExp}
            onLaunchSimulation={(id) => onStartExperiment(id)}
            onOpenScanner={onOpenScanner}
          />
        </div>
      </div>
    </div>
  );
};

