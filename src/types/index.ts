export type GoalType = 'gate_cs' | 'gate_da' | 'japanese' | 'fitness' | 'projects' | string;

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  target: number; // e.g. target hours or target %
  current: number; // derived current hours or %
  deadline?: string;
  status: 'active' | 'completed' | 'paused';
  icon: string;
  color: string;
  xp: number;
}

export interface Subject {
  id: string;
  goal_id: GoalType;
  track: 'GATE CS' | 'GATE DA' | 'Japanese' | 'Fitness';
  title: string;
  hours_target: number;
  hours_completed: number; // derived from LectureLogs
  checkpoint: number; // 0, 20, 40, 60, 80, 100 (%)
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Topic {
  id: string;
  subject_id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface LectureLog {
  id: string;
  subject_id: string;
  topic_id?: string;
  date: string; // YYYY-MM-DD
  hours: number;
  remarks: string;
  created_at: string;
}

export interface DailyFitnessLog {
  id: string;
  date: string;
  steps: number;
  calories: number;
  protein: number;
  created_at: string;
}

export interface PRRecord {
  id: string;
  exercise: string; // e.g. "Bench Press", "Barbell Squat", "Deadlift", "Overhead Press"
  weight_kg: number;
  reps: number;
  date: string;
  notes?: string;
}

export interface JapaneseResource {
  id: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | string;
  resource_type: 'PDF' | 'Grammar' | 'Reading' | 'Listening' | 'Media' | 'Novel' | string;
  title: string;
  target: number; // total pages or total target hours
  completed: number; // completed pages or hours
  finished: boolean;
}

export interface WeeklyReview {
  id: string;
  week: string; // e.g. "2026-W31"
  study_hours: number;
  jp_hours: number;
  gate_hours: number;
  gym_sessions: number;
  rating: number; // 1-5
  reflection: string;
  date: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  github?: string;
  tech_stack: string[]; // e.g. ["Next.js 15", "TypeScript", "WASM"]
  category: 'Web App' | 'Desktop Tool' | 'AI / ML' | 'Systems' | 'Other';
  status: 'planning' | 'in_progress' | 'completed';
  updated_at?: string;
}

export interface TechStackItem {
  id: string;
  category: 'Frontend & UI' | 'Backend & Databases' | 'Systems & Low Level' | 'AI & Data Science' | 'DevOps & Tooling';
  name: string;
  proficiency: 'Learning' | 'Proficient' | 'Mastered';
  notes?: string;
}

export interface RoadmapItem {
  id: string;
  month: string; // e.g. "August 2026", "September 2026"
  week_number: number; // 1, 2, 3, or 4
  goal: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface RevisionCheckpoints {
  rev1?: boolean;
  rev2?: boolean;
  rev3?: boolean;
  short_notes?: boolean;
  dpp?: boolean;
  weekly_test?: boolean;
  pyq1?: boolean;
  pyq2?: boolean;
  topic_test?: boolean;
  subject_test?: boolean;
  // General Aptitude specific
  class_problems?: boolean;
  cat_lv1?: boolean;
  cat_lv2?: boolean;
  mock_test?: boolean;
}

export interface ChapterRevisionItem {
  id: string;
  category: 'gate_cs' | 'gate_da' | 'general_aptitude';
  subject: string;
  chapter: string;
  checkpoints: RevisionCheckpoints;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export type EventType =
  | 'LECTURE_LOGGED'
  | 'FITNESS_LOGGED'
  | 'RESOURCE_COMPLETED'
  | 'PROJECT_UPDATED'
  | 'WEEKLY_REVIEWED'
  | 'ACHIEVEMENT_UNLOCKED';

export interface AppEvent {
  id: string;
  type: EventType;
  payload: unknown;
  timestamp: string;
  xpEarned: number;
  description: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastLogDate?: string;
}
