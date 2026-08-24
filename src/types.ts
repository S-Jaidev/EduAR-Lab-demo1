export type SubjectId =
  | "physics"
  | "chemistry"
  | "biology"
  | "mathematics"
  | "engineering"
  | "earth-science"
  | "computer-science"
  | "social-science";

export type NavigationTab =
  | "student"
  | "experiments"
  | "scanner"
  | "lab"
  | "progress"
  | "tutor"
  | "teacher";

export interface Subject {
  id: SubjectId;
  name: string;
  tagline: string;
  iconName: string;
  color: string;
  gradient: string;
  badgeColor: string;
  topicsCount: number;
  experimentsCount: number;
  available: boolean;
  featuredTopic: string;
}

export interface Experiment {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  unit: string;
  title: string;
  grade: string;
  category?: string;
  shortDescription: string;
  longDescription: string;
  formula: string;
  formulaDescription: string;
  objectives: string[];
  equipment: string[];
  durationMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "active" | "mvp" | "in_progress" | "completed" | "not_started";
  simulationType?: string;
  route?: string;
  score?: number;
  arTextbookChapter: string;
}

export interface DataPoint {
  id: string;
  voltage: number;
  resistance: number;
  current: number;
  power: number;
  timestamp: string;
}

export interface CircuitState {
  voltage: number; // in Volts (e.g., 5.0)
  resistance: number; // in Ohms (e.g., 10.0)
  switchClosed: boolean;
  wireCurrentMode: "electrons" | "conventional";
}

export interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  text: string;
  timestamp: string;
  source?: string;
  suggestedAction?: string;
}

export interface TopicPerformance {
  id: string;
  subject: string;
  name: string;
  grade: string;
  comprehensionRate: number; // percentage (e.g. 90)
  completionRate: number; // percentage
  status: "exceptional" | "on_track" | "needs_attention";
  activeStudents: number;
  averageTimeMinutes: number;
}

export interface StudentActivity {
  id: string;
  studentName: string;
  avatar: string;
  action: string;
  topic: string;
  timeAgo: string;
  score?: number;
  status: "in_progress" | "completed" | "flagged";
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
}
