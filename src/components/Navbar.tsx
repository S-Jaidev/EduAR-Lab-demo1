import React from "react";
import {
  NavigationTab,
  SubjectId,
} from "../types";
import {
  GraduationCap,
  Sparkles,
  Layers,
  Bot,
  BarChart3,
  Award,
  Scan,
  Compass,
  Menu,
  X,
  FlaskConical,
} from "lucide-react";

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  selectedSubject: SubjectId;
  onOpenScanner: () => void;
  isLabRunning?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  selectedSubject,
  onOpenScanner,
  isLabRunning = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "student", label: "Student Home", icon: GraduationCap },
    { id: "experiments", label: "Experiments", icon: Layers },
    { id: "lab", label: "Virtual Lab", icon: FlaskConical },
    { id: "progress", label: "Progress", icon: Award },
    { id: "tutor", label: "AI Tutor", icon: Bot },
    { id: "teacher", label: "Teacher Dashboard", icon: BarChart3 },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-blue-900 text-white border-b border-blue-950/50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick("student")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 text-cyan-400 transform group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Edu<span className="text-cyan-400">AR</span>
                  <span className="text-white ml-1">Lab</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-cyan-300 border border-blue-800 uppercase tracking-wider">
                  CLASS 10 STEM
                </span>
              </div>
              <p className="text-[11px] font-medium text-blue-200 hidden md:block">
                Turning Textbooks into Living Labs
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                    isActive
                      ? "text-white bg-blue-800 font-bold shadow-xs border-b-2 border-cyan-400"
                      : "text-blue-200 hover:text-white hover:bg-blue-800/60"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-cyan-400" : "text-blue-300 group-hover:text-white"
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.id === "lab" && isLabRunning && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs: AR Scanner Quick Trigger & Session Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="cta-scan-textbook"
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Scan className="w-4 h-4 text-slate-950" />
              <span className="whitespace-nowrap">Scan Textbook</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-blue-800 bg-blue-900 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
            Curriculum: Class 10 Physics
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-btn-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "text-white bg-blue-800 font-bold border-l-4 border-cyan-400"
                    : "text-blue-200 hover:bg-blue-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-blue-300"}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === "lab" && isLabRunning && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-cyan-400 text-slate-950 font-bold">
                    Live
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-blue-800">
            <button
              id="mobile-scan-btn"
              onClick={() => {
                onOpenScanner();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-sm"
            >
              <Scan className="w-4 h-4 text-slate-950" />
              <span>Launch AR Textbook Scanner</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
