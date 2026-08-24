import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { StudentHome } from "./components/StudentHome";
import { SubjectCatalog } from "./components/SubjectCatalog";
import { TextbookScanner } from "./components/TextbookScanner";
import { CircuitSimulation } from "./components/CircuitSimulation";
import { MVPSimulationView } from "./components/MVPSimulationView";
import { AITutorPanel } from "./components/AITutorPanel";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { StudentProgress } from "./components/StudentProgress";
import { NavigationTab, SubjectId } from "./types";
import {
  SUBJECTS,
  PRIMARY_EXPERIMENT,
  OTHER_EXPERIMENTS,
} from "./data/mockData";
import { Bot, Sparkles, X } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>("student");
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>("physics");
  const [activeExperimentId, setActiveExperimentId] = useState<string>("exp-ohms-law");
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [tutorDrawerOpen, setTutorDrawerOpen] = useState<boolean>(false);
  
  const [completedExperimentsCount, setCompletedExperimentsCount] = useState<number>(() => {
    const saved = localStorage.getItem("eduar_completed_experiments");
    return saved ? parseInt(saved, 10) : 1;
  });

  const [recordedDataPointsCount, setRecordedDataPointsCount] = useState<number>(() => {
    const saved = localStorage.getItem("eduar_recorded_points");
    return saved ? parseInt(saved, 10) : 3;
  });

  // Live circuit context for AI Tutor
  const [liveCircuitContext, setLiveCircuitContext] = useState<{
    voltage: number;
    resistance: number;
    current: number;
    switchClosed: boolean;
    experimentTitle?: string;
    subject?: string;
  }>({
    voltage: 5.0,
    resistance: 10.0,
    current: 0.5,
    switchClosed: true,
  });

  const allExperiments = [PRIMARY_EXPERIMENT, ...OTHER_EXPERIMENTS];
  const currentExperiment =
    allExperiments.find((e) => e.id === activeExperimentId) || PRIMARY_EXPERIMENT;

  const handleStartExperiment = (experimentId: string) => {
    setActiveExperimentId(experimentId);
    const exp = allExperiments.find((e) => e.id === experimentId);
    if (exp) {
      setSelectedSubject(exp.subjectId);
    }
    setCurrentTab("lab");
  };

  const handleOpenScanner = () => {
    setScannerOpen(true);
  };

  const handleScannerRecognitionComplete = () => {
    setScannerOpen(false);
    setActiveExperimentId("exp-ohms-law");
    setCurrentTab("lab");
  };

  const handleOpenAITutorWithContext = (contextData?: {
    voltage?: number;
    resistance?: number;
    current?: number;
    switchClosed?: boolean;
    experimentTitle?: string;
    subject?: string;
  }) => {
    if (contextData) {
      setLiveCircuitContext((prev) => ({
        ...prev,
        ...contextData,
        voltage: contextData.voltage ?? prev.voltage,
        resistance: contextData.resistance ?? prev.resistance,
        current: contextData.current ?? prev.current,
        switchClosed: contextData.switchClosed ?? prev.switchClosed,
      }));
    }
    setTutorDrawerOpen(true);
  };

  const handleExperimentComplete = (pointsCount: number) => {
    const newCompletedCount = Math.max(completedExperimentsCount, 1);
    const newPointsCount = Math.max(recordedDataPointsCount, pointsCount);
    setCompletedExperimentsCount(newCompletedCount);
    setRecordedDataPointsCount(newPointsCount);
    localStorage.setItem("eduar_completed_experiments", newCompletedCount.toString());
    localStorage.setItem("eduar_recorded_points", newPointsCount.toString());
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Application Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedSubject={selectedSubject}
        onOpenScanner={handleOpenScanner}
        isLabRunning={currentTab === "lab"}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === "student" && (
          <StudentHome
            subjects={SUBJECTS}
            featuredExperiment={PRIMARY_EXPERIMENT}
            onSelectSubject={(subjectId) => {
              setSelectedSubject(subjectId);
              setCurrentTab("experiments");
            }}
            onStartExperiment={handleStartExperiment}
            onOpenScanner={handleOpenScanner}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === "experiments" && (
          <SubjectCatalog
            subjects={SUBJECTS}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            primaryExperiment={PRIMARY_EXPERIMENT}
            otherExperiments={OTHER_EXPERIMENTS}
            onStartExperiment={handleStartExperiment}
            onOpenScanner={handleOpenScanner}
            onBackToHome={() => setCurrentTab("student")}
          />
        )}

        {currentTab === "lab" && (
          activeExperimentId === "exp-ohms-law" ? (
            <CircuitSimulation
              onOpenAITutor={handleOpenAITutorWithContext}
              onExperimentComplete={handleExperimentComplete}
            />
          ) : (
            <MVPSimulationView
              experiment={currentExperiment}
              onBack={() => setCurrentTab("experiments")}
              onOpenAITutor={handleOpenAITutorWithContext}
              onExperimentComplete={handleExperimentComplete}
            />
          )
        )}

        {currentTab === "tutor" && (
          <div className="max-w-4xl mx-auto pb-12">
            <AITutorPanel contextData={liveCircuitContext} />
          </div>
        )}

        {currentTab === "teacher" && <TeacherDashboard />}

        {currentTab === "progress" && (
          <StudentProgress
            completedExperimentsCount={completedExperimentsCount}
            recordedDataPointsCount={recordedDataPointsCount}
            onLaunchExperiment={() => {
              setActiveExperimentId("exp-ohms-law");
              setCurrentTab("lab");
            }}
          />
        )}
      </main>

      {/* AR Textbook Scanner Modal Overlay */}
      {scannerOpen && (
        <TextbookScanner
          onRecognitionComplete={handleScannerRecognitionComplete}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Floating AI Tutor Side Drawer (When invoked inside Lab or pages) */}
      {tutorDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-900 text-white">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Bot className="w-4 h-4" />
                <span>Live Assistant: Professor AR</span>
              </div>
              <button
                onClick={() => setTutorDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AITutorPanel
                contextData={liveCircuitContext}
                onClose={() => setTutorDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Global Quick Tutor Button (Visible on non-tutor tabs) */}
      {currentTab !== "tutor" && !tutorDrawerOpen && (
        <button
          id="global-floating-tutor-btn"
          onClick={() => setTutorDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-950/30 hover:scale-105 transition-all active:scale-95 cursor-pointer border border-cyan-400/30 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-cyan-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span>Ask Professor AR</span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">EduAR Lab</span>
            <span>•</span>
            <span>Turning Textbooks into Living Labs</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[10px]">
              POC MVP
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Class 10 STEM Multi-Subject Edition</span>
            <span>•</span>
            <span>Physics • Chemistry • Biology • Mathematics • Engineering • Earth Sci • CS • Social Sci</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

