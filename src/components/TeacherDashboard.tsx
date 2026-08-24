import React, { useState } from "react";
import {
  BarChart3,
  Users,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Clock,
  Filter,
  Download,
  Search,
} from "lucide-react";
import { TopicPerformance, StudentActivity } from "../types";
import { INITIAL_TOPIC_PERFORMANCES, INITIAL_STUDENT_ACTIVITIES } from "../data/mockData";

export const TeacherDashboard: React.FC = () => {
  const [topicPerformances] = useState<TopicPerformance[]>(INITIAL_TOPIC_PERFORMANCES);
  const [activities] = useState<StudentActivity[]>(INITIAL_STUDENT_ACTIVITIES);
  const [selectedClass, setSelectedClass] = useState<string>("Class 10 - Section A");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Teacher Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
              Instructor Analytics
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Academic Term 2026 • Science Department
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            EduAR Lab — Class Engagement & Mastery Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-800"
          >
            <option>Class 10 - Section A (Physics)</option>
            <option>Class 10 - Section B (Physics)</option>
            <option>Class 11 - Advanced STEM</option>
          </select>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Total Students */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Enrolled
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">32</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span>100% active in AR lab</span>
            </div>
          </div>
        </div>

        {/* 2. Experiments Started */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Labs Started
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-800 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">29</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              90.6% participation rate
            </div>
          </div>
        </div>

        {/* 3. Experiments Completed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Labs Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">25</div>
            <div className="text-xs text-emerald-600 font-semibold mt-0.5">
              86.2% completion efficiency
            </div>
          </div>
        </div>

        {/* 4. Average Comprehension Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-900">78%</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span>+14% vs traditional theory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner: Topic Needing Attention */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <span>Curriculum Diagnostic Alert</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Topic needing attention: <strong>Projectile Motion (70% Average Comprehension)</strong>
            </h3>
            <p className="text-xs text-slate-600">
              Several students had difficulty resolving orthogonal initial velocity components and angle trajectories.
            </p>
          </div>
        </div>

        <button className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap cursor-pointer">
          Assign Targeted AR Review
        </button>
      </div>

      {/* Main Analysis Section: Topic Mastery Breakdown + Live Student Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Engagement & Comprehension Rates (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-800" />
                <span>Topic Engagement & Comprehension Analytics</span>
              </h3>
              <p className="text-xs text-slate-500">
                Performance measured through virtual lab trials and V-I graph slopes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {topicPerformances.map((topic) => {
              const isOhm = topic.id === "topic-ohms-law";
              const isAlert = topic.status === "needs_attention";

              return (
                <div
                  key={topic.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isAlert
                      ? "bg-amber-50/50 border-amber-200"
                      : isOhm
                      ? "bg-blue-50/40 border-blue-200"
                      : "bg-slate-50/60 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {topic.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                          {topic.grade}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {topic.activeStudents} students active • Avg time: {topic.averageTimeMinutes}m
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-extrabold ${
                          isAlert
                            ? "text-amber-700"
                            : isOhm
                            ? "text-blue-900"
                            : "text-emerald-700"
                        }`}
                      >
                        {topic.comprehensionRate}%
                      </span>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Comprehension
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Meter */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAlert
                          ? "bg-amber-500"
                          : isOhm
                          ? "bg-gradient-to-r from-blue-700 to-cyan-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${topic.comprehensionRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Student Activity Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-700" />
                <span>Live Student Activity Stream</span>
              </h3>
              <p className="text-xs text-slate-500">Real-time lab interactions and submissions</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
              >
                <div className="w-8 h-8 rounded-full bg-blue-900 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {act.avatar}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{act.studentName}</span>
                    <span className="text-[10px] text-slate-400">{act.timeAgo}</span>
                  </div>
                  <p className="text-slate-600">{act.action}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">
                      {act.topic}
                    </span>
                    {act.score && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Score: {act.score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
