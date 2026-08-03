import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Goal,
  Subject,
  Topic,
  LectureLog,
  DailyFitnessLog,
  PRRecord,
  JapaneseResource,
  WeeklyReview,
  ProjectItem,
  RoadmapItem,
  ChapterRevisionItem,
  RevisionCheckpoints,
  TechStackItem,
  Book,
  Achievement,
  UserStats,
  AppEvent,
} from '@/types';
import { initialRevisionMatrix } from '@/data/initialRevisionMatrix';
import { eventBus } from '@/lib/eventBus';
import { deleteCloudRecord } from '@/lib/supabase/syncEngine';

interface StepwiseState {
  userStats: UserStats;
  goals: Goal[];
  subjects: Subject[];
  topics: Topic[];
  lectureLogs: LectureLog[];
  dailyFitnessLogs: DailyFitnessLog[];
  prRecords: PRRecord[];
  japaneseResources: JapaneseResource[];
  weeklyReviews: WeeklyReview[];
  projects: ProjectItem[];
  techStack: TechStackItem[];
  roadmap: RoadmapItem[];
  revisionMatrix: ChapterRevisionItem[];
  books: Book[];
  achievements: Achievement[];
  recentEvents: AppEvent[];
  activeToast: { id: string; title: string; message: string; xp: number } | null;

  // Logging Actions (Event Triggers)
  logLecture: (data: { subject_id: string; topic_id?: string; hours: number; remarks: string; date?: string }) => void;
  deleteLectureLog: (id: string) => void;
  logDailyFitness: (data: { steps: number; calories: number; protein: number; date?: string }) => void;
  deleteDailyFitnessLog: (id: string) => void;
  addPRRecord: (data: { exercise: string; weight_kg: number; reps?: number; date?: string; notes?: string }) => void;
  deletePRRecord: (id: string) => void;
  completeJapaneseResource: (id: string, progressDelta?: number) => void;
  updateProject: (id: string, progress: number) => void;
  addProject: (project: Omit<ProjectItem, 'id'>) => void;
  deleteProject: (id: string) => void;
  addBook: (book: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => void;
  updateBookPages: (id: string, pagesRead: number) => void;
  deleteBook: (id: string) => void;
  addTechStackItem: (item: Omit<TechStackItem, 'id'>) => void;
  deleteTechStackItem: (id: string) => void;
  logWeeklyReview: (data: Omit<WeeklyReview, 'id' | 'date'>) => void;
  dismissToast: () => void;
  resetToDefaults: () => void;
  // Dynamic Goal & Resource Management
  addGoal: (goal: Omit<Goal, 'id' | 'current'>) => void;
  updateGoal: (id: string, goalData: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addJapaneseResource: (resource: Omit<JapaneseResource, 'id' | 'completed' | 'finished'>) => void;
  updateJapaneseResource: (id: string, resourceData: Partial<JapaneseResource>) => void;
  deleteJapaneseResource: (id: string) => void;

  addSubject: (subject: Omit<Subject, 'id' | 'hours_completed' | 'checkpoint' | 'status'>) => void;
  updateSubject: (id: string, subjectData: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Direct Month -> 4 Weekly Groups Roadmap Management
  addRoadmapGoal: (goalData: { month: string; week_number: number; goal: string; priority?: 'high' | 'medium' | 'low' }) => void;
  toggleRoadmapGoal: (id: string) => void;
  deleteRoadmapGoal: (id: string) => void;

  // Revision Matrix Checkpoint Management
  toggleRevisionCheckpoint: (id: string, checkpointKey: keyof RevisionCheckpoints) => void;
  addRevisionChapter: (category: 'gate_cs' | 'gate_da' | 'general_aptitude', subject: string, chapter: string) => void;
  deleteRevisionChapter: (id: string) => void;

  // Derived Selectors / Helper Calculators
  getOverallProgress: () => number;
  getTrackProgress: (track: 'GATE CS' | 'GATE DA' | 'Japanese' | 'Fitness') => number;
  getSubjectProgress: (subjectId: string) => number;
}

// Initial Seed Data (Fresh Journey: Level 1, 0 XP, 0 Completed Hours)
const initialGoals: Goal[] = [
  { id: 'gate_cs', title: 'GATE Computer Science 2027', type: 'gate_cs', target: 450, current: 0, status: 'active', icon: 'Cpu', color: '#3b82f6', xp: 1200 },
  { id: 'gate_da', title: 'GATE Data Science & AI 2027', type: 'gate_da', target: 270, current: 0, status: 'active', icon: 'Brain', color: '#8b5cf6', xp: 850 },
  { id: 'japanese', title: 'Japanese N5-N3 Mastery', type: 'japanese', target: 190, current: 0, status: 'active', icon: 'Languages', color: '#ec4899', xp: 900 },
  { id: 'fitness', title: 'Fitness & Physical Strength', type: 'fitness', target: 100, current: 0, status: 'active', icon: 'Dumbbell', color: '#10b981', xp: 750 },
  { id: 'projects', title: 'Open Source & AI System Build', type: 'projects', target: 100, current: 0, status: 'active', icon: 'Code', color: '#f59e0b', xp: 500 },
];

const initialSubjects: Subject[] = [
  // GATE CS
  { id: 'cs_dbms', goal_id: 'gate_cs', track: 'GATE CS', title: 'Database Management Systems (DBMS)', hours_target: 30, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_os', goal_id: 'gate_cs', track: 'GATE CS', title: 'Operating Systems', hours_target: 35, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_dsa', goal_id: 'gate_cs', track: 'GATE CS', title: 'Programming & Data Structures', hours_target: 45, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_algo', goal_id: 'gate_cs', track: 'GATE CS', title: 'Algorithms', hours_target: 40, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_cn', goal_id: 'gate_cs', track: 'GATE CS', title: 'Computer Networks', hours_target: 35, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_toc', goal_id: 'gate_cs', track: 'GATE CS', title: 'Theory of Computation', hours_target: 30, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_compiler', goal_id: 'gate_cs', track: 'GATE CS', title: 'Compiler Design', hours_target: 25, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_coa', goal_id: 'gate_cs', track: 'GATE CS', title: 'Computer Organization & Arch.', hours_target: 30, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_digital', goal_id: 'gate_cs', track: 'GATE CS', title: 'Digital Logic', hours_target: 20, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_math', goal_id: 'gate_cs', track: 'GATE CS', title: 'Discrete Mathematics', hours_target: 35, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'cs_eng_math', goal_id: 'gate_cs', track: 'GATE CS', title: 'Engineering Mathematics', hours_target: 30, hours_completed: 0, checkpoint: 0, status: 'not_started' },

  // GATE DA / AI
  { id: 'da_ml', goal_id: 'gate_da', track: 'GATE DA', title: 'Machine Learning', hours_target: 50, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'da_dl', goal_id: 'gate_da', track: 'GATE DA', title: 'Deep Learning', hours_target: 45, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'da_ai', goal_id: 'gate_da', track: 'GATE DA', title: 'Artificial Intelligence', hours_target: 35, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'da_python', goal_id: 'gate_da', track: 'GATE DA', title: 'Python Programming & SciPy', hours_target: 30, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'da_la', goal_id: 'gate_da', track: 'GATE DA', title: 'Linear Algebra & Optimization', hours_target: 30, hours_completed: 0, checkpoint: 0, status: 'not_started' },
  { id: 'da_prob', goal_id: 'gate_da', track: 'GATE DA', title: 'Probability & Statistics', hours_target: 30, hours_completed: 0, checkpoint: 0, status: 'not_started' },
];

const initialJapaneseResources: JapaneseResource[] = [
  { id: 'jp_n5_grammar', level: 'N5', resource_type: 'PDF', title: 'Minna no Nihongo N5 Grammar', target: 12, completed: 0, finished: false },
  { id: 'jp_n5_kanji', level: 'N5', resource_type: 'PDF', title: 'Kanji Look and Learn N5', target: 10, completed: 0, finished: false },
  { id: 'jp_n4_grammar', level: 'N4', resource_type: 'PDF', title: 'Genki II Grammar Master', target: 15, completed: 0, finished: false },
  { id: 'jp_n4_reading', level: 'N4', resource_type: 'Reading', title: 'Tadoku Graded Readers Level 2', target: 20, completed: 0, finished: false },
  { id: 'jp_n3_reading', level: 'N3', resource_type: 'Reading', title: 'N3 Novel: コンビニ人間 (Convenience Store Woman)', target: 50, completed: 0, finished: false },
  { id: 'jp_n3_listening', level: 'N3', resource_type: 'Listening', title: 'Japanese Podcast Immersion', target: 60, completed: 0, finished: false },
];

const initialDailyFitnessLogs: DailyFitnessLog[] = [
  {
    id: 'fit_1',
    date: new Date().toISOString().split('T')[0],
    steps: 10000,
    calories: 2400,
    protein: 160,
    created_at: new Date().toISOString(),
  },
];

const initialPRRecords: PRRecord[] = [
  { id: 'pr_1', exercise: 'Bench Press', weight_kg: 90, reps: 1, date: '2026-08-01', notes: 'Personal Best 1RM!' },
  { id: 'pr_2', exercise: 'Barbell Squat', weight_kg: 120, reps: 3, date: '2026-07-28', notes: 'Solid depth' },
  { id: 'pr_3', exercise: 'Deadlift', weight_kg: 140, reps: 1, date: '2026-07-25', notes: 'Conventional stance' },
  { id: 'pr_4', exercise: 'Overhead Press', weight_kg: 65, reps: 5, date: '2026-07-20', notes: 'Strict OHP' },
];

const initialLectureLogs: LectureLog[] = [];

const initialAchievements: Achievement[] = [
  { id: 'ach_first_step', title: 'First Logged Session', description: 'Log your first study hour or fitness session', xp: 50, icon: 'Zap', unlocked: false },
  { id: 'ach_streak_3', title: 'Consistent Learner', description: 'Maintain a 3-day study streak', xp: 100, icon: 'Flame', unlocked: false },
  { id: 'ach_dbms_master', title: 'SQL & DBMS Scholar', description: 'Reach 50% completion in DBMS subject', xp: 150, icon: 'Database', unlocked: false },
  { id: 'ach_100_hrs', title: '100 Hours Club', description: 'Accumulate 100 hours of overall study time', xp: 300, icon: 'Clock', unlocked: false },
  { id: 'ach_jp_n5', title: 'N5 Warrior', description: 'Complete all N5 Japanese Grammar resources', xp: 250, icon: 'Award', unlocked: false },
  { id: 'ach_bench_pr', title: '90kg Bench Press', description: 'Hit a 90kg bench press PR in fitness log', xp: 200, icon: 'Trophy', unlocked: false },
];

const initialProjects: ProjectItem[] = [];

const initialTechStack: TechStackItem[] = [
  { id: 'ts_1', category: 'Frontend & UI', name: 'Next.js 15 / React 19 / TypeScript', proficiency: 'Mastered', notes: 'Core stack for modern Web Apps' },
  { id: 'ts_2', category: 'Frontend & UI', name: 'TailwindCSS & Framer Motion', proficiency: 'Mastered', notes: 'Glassmorphic & animated UI design' },
  { id: 'ts_3', category: 'Backend & Databases', name: 'Zustand & LocalStorage / SQLite', proficiency: 'Mastered', notes: 'Event-driven client state persistence' },
  { id: 'ts_4', category: 'Backend & Databases', name: 'Supabase & PostgreSQL', proficiency: 'Proficient', notes: 'Cloud database & real-time sync' },
  { id: 'ts_5', category: 'Systems & Low Level', name: 'C / C++ Programming', proficiency: 'Proficient', notes: 'GATE CS core & performance optimization' },
  { id: 'ts_6', category: 'AI & Data Science', name: 'Python, NumPy & Pandas', proficiency: 'Proficient', notes: 'GATE DA / Machine Learning pipeline' },
];

const initialRoadmap: RoadmapItem[] = [
  { id: 'r1', month: 'August 2026', week_number: 1, goal: 'Finish DBMS Relational Algebra & Normalization', priority: 'high', completed: false },
  { id: 'r2', month: 'August 2026', week_number: 2, goal: 'Operating Systems Virtual Memory & Page Replacement', priority: 'high', completed: false },
  { id: 'r3', month: 'August 2026', week_number: 3, goal: 'Japanese N4 Grammar Completion', priority: 'high', completed: false },
  { id: 'r4', month: 'August 2026', week_number: 4, goal: 'Algorithms & Data Structures Deep Dive', priority: 'medium', completed: false },
  { id: 'r5', month: 'September 2026', week_number: 1, goal: 'GATE Mock Test Series 1', priority: 'high', completed: false },
];

export const useStepwiseStore = create<StepwiseState>()(
  persist(
    (set, get) => ({
      userStats: {
        xp: 0,
        level: 1,
        streak: 0,
      },
      goals: initialGoals,
      subjects: initialSubjects,
      topics: [],
      lectureLogs: initialLectureLogs,
      dailyFitnessLogs: initialDailyFitnessLogs,
      prRecords: initialPRRecords,
      japaneseResources: initialJapaneseResources,
      weeklyReviews: [],
      projects: initialProjects,
      techStack: initialTechStack,
      roadmap: initialRoadmap,
      revisionMatrix: initialRevisionMatrix,
      books: [],
      achievements: initialAchievements,
      recentEvents: [],
      activeToast: null,

      dismissToast: () => set({ activeToast: null }),

      resetToDefaults: () => set({
        userStats: { xp: 0, level: 1, streak: 0 },
        goals: initialGoals,
        subjects: initialSubjects,
        topics: [],
        lectureLogs: initialLectureLogs,
        dailyFitnessLogs: initialDailyFitnessLogs,
        prRecords: initialPRRecords,
        japaneseResources: initialJapaneseResources,
        weeklyReviews: [],
        projects: initialProjects,
        roadmap: initialRoadmap,
        books: [],
        achievements: initialAchievements,
        recentEvents: [],
        activeToast: null,
      }),

      // ==========================================
      // EVENT DRIVEN ACTION: LOG LECTURE
      // ==========================================
      logLecture: ({ subject_id, topic_id, hours, remarks, date }) => {
        const currentDate = date || new Date().toISOString().split('T')[0];
        const newLog: LectureLog = {
          id: 'log_' + Date.now(),
          subject_id,
          topic_id,
          date: currentDate,
          hours: Number(hours),
          remarks,
          created_at: new Date().toISOString(),
        };

        const state = get();
        const updatedLectureLogs = [newLog, ...state.lectureLogs];

        // 1. Recalculate hours & checkpoints for targeted subject
        const updatedSubjects = state.subjects.map((sub) => {
          if (sub.id === subject_id) {
            const newCompleted = sub.hours_completed + Number(hours);
            const ratio = (newCompleted / sub.hours_target) * 100;
            let checkpoint = 0;
            if (ratio >= 100) checkpoint = 100;
            else if (ratio >= 80) checkpoint = 80;
            else if (ratio >= 60) checkpoint = 60;
            else if (ratio >= 40) checkpoint = 40;
            else if (ratio >= 20) checkpoint = 20;

            const status = ratio >= 100 ? 'completed' : 'in_progress';
            return {
              ...sub,
              hours_completed: newCompleted,
              checkpoint,
              status: status as 'not_started' | 'in_progress' | 'completed',
            };
          }
          return sub;
        });

        // 2. Recalculate Goal totals
        const updatedGoals = state.goals.map((goal) => {
          const goalSubjects = updatedSubjects.filter((s) => s.goal_id === goal.id);
          if (goalSubjects.length > 0) {
            const totalDone = goalSubjects.reduce((acc, s) => acc + s.hours_completed, 0);
            return { ...goal, current: Number(totalDone.toFixed(1)) };
          }
          return goal;
        });

        // 3. XP calculation (+10 XP per study hour)
        const xpEarned = Math.round(Number(hours) * 10);
        const newTotalXp = state.userStats.xp + xpEarned;
        const newLevel = Math.floor(newTotalXp / 300) + 1;

        // 4. Streak calculation
        let streak = state.userStats.streak;
        if (state.userStats.lastLogDate !== currentDate) {
          streak += 1;
        }

        const newUserStats: UserStats = {
          xp: newTotalXp,
          level: newLevel,
          streak,
          lastLogDate: currentDate,
        };

        // 5. Subject title lookup
        const subjectObj = updatedSubjects.find((s) => s.id === subject_id);
        const subjectTitle = subjectObj ? subjectObj.title : 'Study Subject';

        // 6. Create Event Payload
        const appEvent: AppEvent = {
          id: 'evt_' + Date.now(),
          type: 'LECTURE_LOGGED',
          payload: newLog,
          timestamp: new Date().toISOString(),
          xpEarned,
          description: `Logged ${hours} hrs for ${subjectTitle}`,
        };

        // 7. Update Store State
        set({
          lectureLogs: updatedLectureLogs,
          subjects: updatedSubjects,
          goals: updatedGoals,
          userStats: newUserStats,
          recentEvents: [appEvent, ...state.recentEvents].slice(0, 50),
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🎉 +${xpEarned} XP Earned!`,
            message: `Logged ${hours} hrs for ${subjectTitle}`,
            xp: xpEarned,
          },
        });

        // Publish to Event Bus
        eventBus.publish(appEvent);
      },

      deleteLectureLog: (id) => {
        const state = get();
        deleteCloudRecord('lecture_logs', id);
        const targetLog = state.lectureLogs.find((l) => l.id === id);

        if (!targetLog) {
          set({ lectureLogs: state.lectureLogs.filter((l) => l.id !== id) });
          return;
        }

        // 1. Recalculate Subject hours
        const updatedSubjects = state.subjects.map((sub) => {
          if (sub.id === targetLog.subject_id) {
            const newCompleted = Math.max(0, sub.hours_completed - targetLog.hours);
            const ratio = sub.hours_target > 0 ? (newCompleted / sub.hours_target) * 100 : 0;
            let checkpoint = 0;
            if (ratio >= 100) checkpoint = 100;
            else if (ratio >= 80) checkpoint = 80;
            else if (ratio >= 60) checkpoint = 60;
            else if (ratio >= 40) checkpoint = 40;
            else if (ratio >= 20) checkpoint = 20;

            const status = ratio >= 100 ? 'completed' : newCompleted > 0 ? 'in_progress' : 'not_started';
            return {
              ...sub,
              hours_completed: newCompleted,
              checkpoint,
              status: status as 'not_started' | 'in_progress' | 'completed',
            };
          }
          return sub;
        });

        // 2. Deduct XP
        const xpDeducted = Math.round(targetLog.hours * 10);
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        set({
          lectureLogs: state.lectureLogs.filter((l) => l.id !== id),
          recentEvents: state.recentEvents.filter(
            (e) => (e.payload as { id?: string })?.id !== id && e.id !== 'evt_lec_' + id
          ),
          subjects: updatedSubjects,
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Session Removed (-${xpDeducted} XP)`,
            message: `Deducted ${targetLog.hours} hrs from subject`,
            xp: -xpDeducted,
          },
        });
      },

      // ==========================================
      // DAILY FITNESS LOGGING (STEPS, CALORIES, PROTEIN)
      // ==========================================
      logDailyFitness: ({ steps, calories, protein, date }) => {
        const currentDate = date || new Date().toISOString().split('T')[0];
        const newLog: DailyFitnessLog = {
          id: 'fit_' + Date.now(),
          steps,
          calories,
          protein,
          date: currentDate,
          created_at: new Date().toISOString(),
        };

        const state = get();
        const xpEarned = 25; // +25 XP per daily fitness log
        const newTotalXp = state.userStats.xp + xpEarned;
        const newLevel = Math.floor(newTotalXp / 300) + 1;

        const appEvent: AppEvent = {
          id: 'evt_' + Date.now(),
          type: 'FITNESS_LOGGED',
          payload: newLog,
          timestamp: new Date().toISOString(),
          xpEarned,
          description: `Daily Fitness Log: ${steps.toLocaleString()} steps, ${calories} kcal, ${protein}g protein`,
        };

        set({
          dailyFitnessLogs: [newLog, ...state.dailyFitnessLogs],
          userStats: {
            ...state.userStats,
            xp: newTotalXp,
            level: newLevel,
          },
          recentEvents: [appEvent, ...state.recentEvents].slice(0, 50),
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🏋️ +${xpEarned} XP Fitness Logged!`,
            message: `${steps.toLocaleString()} steps, ${calories} kcal, ${protein}g protein`,
            xp: xpEarned,
          },
        });

        eventBus.publish(appEvent);
      },

      deleteDailyFitnessLog: (id) => {
        const state = get();
        deleteCloudRecord('daily_fitness_logs', id);
        const targetLog = state.dailyFitnessLogs.find((f) => f.id === id);
        const xpDeducted = targetLog ? 25 : 0;
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        set({
          dailyFitnessLogs: state.dailyFitnessLogs.filter((f) => f.id !== id),
          recentEvents: state.recentEvents.filter(
            (e) => (e.payload as { id?: string })?.id !== id && e.id !== 'evt_fit_' + id
          ),
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Fitness Log Deleted (-25 XP)`,
            message: `Removed daily calorie & step log`,
            xp: -xpDeducted,
          },
        });
      },

      // ==========================================
      // SEPARATE PR RECORD MANAGEMENT
      // ==========================================
      addPRRecord: ({ exercise, weight_kg, reps = 1, date, notes }) => {
        const currentDate = date || new Date().toISOString().split('T')[0];
        const newPR: PRRecord = {
          id: 'pr_' + Date.now(),
          exercise: exercise.trim(),
          weight_kg,
          reps,
          date: currentDate,
          notes: notes?.trim(),
        };

        const state = get();
        const xpEarned = 50; // +50 XP per new PR!
        const newTotalXp = state.userStats.xp + xpEarned;
        const newLevel = Math.floor(newTotalXp / 300) + 1;

        set({
          prRecords: [newPR, ...state.prRecords],
          userStats: {
            ...state.userStats,
            xp: newTotalXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🔥 NEW PR RECORDED! (+50 XP)`,
            message: `${exercise}: ${weight_kg}kg × ${reps} rep(s)`,
            xp: xpEarned,
          },
        });
      },

      deletePRRecord: (id) => {
        const state = get();
        deleteCloudRecord('pr_records', id);
        const xpDeducted = 50;
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        set({
          prRecords: state.prRecords.filter((pr) => pr.id !== id),
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ PR Record Deleted (-50 XP)`,
            message: `Removed personal record`,
            xp: -xpDeducted,
          },
        });
      },

      // ==========================================
      // EVENT DRIVEN ACTION: COMPLETE JAPANESE RESOURCE
      // ==========================================
      completeJapaneseResource: (id, progressDelta = 1) => {
        const state = get();
        let targetResName = '';
        let wasFinished = false;

        const updatedResources = state.japaneseResources.map((res) => {
          if (res.id === id) {
            targetResName = res.title;
            const newCompleted = Math.min(res.target, res.completed + progressDelta);
            const finished = newCompleted >= res.target;
            wasFinished = finished;
            return { ...res, completed: newCompleted, finished };
          }
          return res;
        });

        const xpEarned = wasFinished ? 40 : 15; // +40 XP for PDF finished, +15 for progress
        const newTotalXp = state.userStats.xp + xpEarned;
        const newLevel = Math.floor(newTotalXp / 300) + 1;

        // Recalculate Japanese Goal Progress
        const totalTarget = updatedResources.reduce((acc, r) => acc + r.target, 0);
        const totalDone = updatedResources.reduce((acc, r) => acc + r.completed, 0);
        const jpPercentage = Math.round((totalDone / totalTarget) * 100);

        const updatedGoals = state.goals.map((g) =>
          g.id === 'japanese' ? { ...g, current: jpPercentage } : g
        );

        const appEvent: AppEvent = {
          id: 'evt_' + Date.now(),
          type: 'RESOURCE_COMPLETED',
          payload: { id, progressDelta },
          timestamp: new Date().toISOString(),
          xpEarned,
          description: `Updated Japanese resource: ${targetResName}`,
        };

        set({
          japaneseResources: updatedResources,
          goals: updatedGoals,
          userStats: { ...state.userStats, xp: newTotalXp, level: newLevel },
          recentEvents: [appEvent, ...state.recentEvents].slice(0, 50),
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🌸 +${xpEarned} XP Japanese Progress!`,
            message: `Updated: ${targetResName}`,
            xp: xpEarned,
          },
        });

        eventBus.publish(appEvent);
      },

      // ==========================================
      // EVENT DRIVEN ACTION: UPDATE PROJECT
      // ==========================================
      updateProject: (id, progress) => {
        const state = get();
        let projTitle = '';
        const updatedProjects = state.projects.map((p) => {
          if (p.id === id) {
            projTitle = p.title;
            return { ...p, progress: Math.min(100, Math.max(0, progress)) };
          }
          return p;
        });

        const xpEarned = 20;
        const newTotalXp = state.userStats.xp + xpEarned;

        const appEvent: AppEvent = {
          id: 'evt_' + Date.now(),
          type: 'PROJECT_UPDATED',
          payload: { id, progress },
          timestamp: new Date().toISOString(),
          xpEarned,
          description: `Updated project "${projTitle}" progress to ${progress}%`,
        };

        set({
          projects: updatedProjects,
          userStats: { ...state.userStats, xp: newTotalXp },
          recentEvents: [appEvent, ...state.recentEvents].slice(0, 50),
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `⚡ +${xpEarned} XP Project Milestone!`,
            message: `Updated "${projTitle}" to ${progress}%`,
            xp: xpEarned,
          },
        });

        eventBus.publish(appEvent);
      },

      addProject: (projectData) => {
        const state = get();
        const newProj: ProjectItem = {
          id: 'p_' + Date.now(),
          updated_at: new Date().toISOString().split('T')[0],
          ...projectData,
        };

        const xpEarned = 30;
        const newTotalXp = state.userStats.xp + xpEarned;
        const newLevel = Math.floor(newTotalXp / 300) + 1;

        set({
          projects: [...state.projects, newProj],
          userStats: { ...state.userStats, xp: newTotalXp, level: newLevel },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🚀 +30 XP Project Added!`,
            message: `Created "${projectData.title}" under ${projectData.category}`,
            xp: xpEarned,
          },
        });
      },

      deleteProject: (id) => {
        const state = get();
        deleteCloudRecord('projects', id);
        const xpDeducted = 30;
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        set({
          projects: state.projects.filter((p) => p.id !== id),
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Project Removed (-30 XP)`,
            message: `Deleted project from showcase`,
            xp: -xpDeducted,
          },
        });
      },

      // ==========================================
      // BOOK READING TRACKER ACTIONS
      // ==========================================
      addBook: (bookData) => {
        const state = get();
        const newBook: Book = {
          id: 'bk_' + Date.now(),
          ...bookData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const xpEarned = 30;
        const newTotalXp = state.userStats.xp + xpEarned;
        const newLevel = Math.floor(newTotalXp / 300) + 1;

        set({
          books: [newBook, ...(state.books || [])],
          userStats: { ...state.userStats, xp: newTotalXp, level: newLevel },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `📚 +30 XP Book Added!`,
            message: `Added "${bookData.title}" by ${bookData.author || 'Unknown Author'}`,
            xp: xpEarned,
          },
        });
      },

      updateBookPages: (id, pagesRead) => {
        const state = get();
        let bookTitle = '';
        const updatedBooks = (state.books || []).map((b) => {
          if (b.id === id) {
            bookTitle = b.title;
            const newCompletedPages = Math.min(b.total_pages, Math.max(0, pagesRead));
            const status: Book['status'] =
              newCompletedPages >= b.total_pages ? 'completed' : 'reading';
            return {
              ...b,
              completed_pages: newCompletedPages,
              status,
              updated_at: new Date().toISOString(),
            };
          }
          return b;
        });

        const xpEarned = 15;
        const newTotalXp = state.userStats.xp + xpEarned;
        const newLevel = Math.floor(newTotalXp / 300) + 1;

        const appEvent: AppEvent = {
          id: 'evt_' + Date.now(),
          type: 'BOOK_READ',
          payload: { id, pagesRead },
          timestamp: new Date().toISOString(),
          xpEarned,
          description: `Read up to page ${pagesRead} in "${bookTitle}"`,
        };

        set({
          books: updatedBooks,
          userStats: { ...state.userStats, xp: newTotalXp, level: newLevel },
          recentEvents: [appEvent, ...state.recentEvents].slice(0, 50),
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `📖 +15 XP Reading Progress!`,
            message: `Updated "${bookTitle}" to page ${pagesRead}`,
            xp: xpEarned,
          },
        });

        eventBus.publish(appEvent);
      },

      deleteBook: (id) => {
        const state = get();
        deleteCloudRecord('books', id);
        const targetBook = (state.books || []).find((b) => b.id === id);
        const xpDeducted = 30;
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        set({
          books: (state.books || []).filter((b) => b.id !== id),
          recentEvents: state.recentEvents.filter(
            (e) => (e.payload as { id?: string })?.id !== id
          ),
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Book Removed (-30 XP)`,
            message: targetBook ? `Removed "${targetBook.title}"` : 'Book deleted',
            xp: -xpDeducted,
          },
        });
      },

      addTechStackItem: (itemData) => {
        const state = get();
        const newItem: TechStackItem = {
          id: 'ts_' + Date.now(),
          ...itemData,
        };

        const xpEarned = 15;
        const newTotalXp = state.userStats.xp + xpEarned;

        set({
          techStack: [...state.techStack, newItem],
          userStats: { ...state.userStats, xp: newTotalXp },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `💻 +15 XP Tech Stack Added!`,
            message: `Added ${itemData.name} to ${itemData.category}`,
            xp: xpEarned,
          },
        });
      },

      deleteTechStackItem: (id) => {
        const state = get();
        deleteCloudRecord('tech_stack', id);
        set({
          techStack: state.techStack.filter((t) => t.id !== id),
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Tech Tool Removed`,
            message: `Deleted item from tech stack`,
            xp: 0,
          },
        });
      },

      // ==========================================
      // EVENT DRIVEN ACTION: LOG WEEKLY REVIEW
      // ==========================================
      logWeeklyReview: (data) => {
        const state = get();
        const newReview: WeeklyReview = {
          id: 'rev_' + Date.now(),
          ...data,
          date: new Date().toISOString().split('T')[0],
        };

        const xpEarned = 75; // +75 XP for weekly reflection review
        const newTotalXp = state.userStats.xp + xpEarned;

        const appEvent: AppEvent = {
          id: 'evt_' + Date.now(),
          type: 'WEEKLY_REVIEWED',
          payload: newReview,
          timestamp: new Date().toISOString(),
          xpEarned,
          description: `Logged Weekly Review for ${data.week}`,
        };

        set({
          weeklyReviews: [newReview, ...state.weeklyReviews],
          userStats: { ...state.userStats, xp: newTotalXp },
          recentEvents: [appEvent, ...state.recentEvents].slice(0, 50),
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `📝 +${xpEarned} XP Weekly Review Logged!`,
            message: `Reflection recorded for ${data.week}`,
            xp: xpEarned,
          },
        });

        eventBus.publish(appEvent);
      },

      // ==========================================
      // DYNAMIC GOAL & RESOURCE CRUD ACTIONS
      // ==========================================
      addGoal: (goalData) => {
        const state = get();
        const newGoal: Goal = {
          id: 'goal_' + Date.now(),
          current: 0,
          ...goalData,
        };
        set({
          goals: [...state.goals, newGoal],
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🎯 New Goal Created!`,
            message: `Added goal: ${goalData.title}`,
            xp: 50,
          },
        });
      },

      updateGoal: (id, goalData) => {
        const state = get();
        const updatedGoals = state.goals.map((g) => (g.id === id ? { ...g, ...goalData } : g));
        set({
          goals: updatedGoals,
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `✏️ Goal Updated!`,
            message: `Saved changes to goal`,
            xp: 10,
          },
        });
      },

      deleteGoal: (id) => {
        const state = get();
        const updatedGoals = state.goals.filter((g) => g.id !== id);
        set({
          goals: updatedGoals,
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Goal Removed`,
            message: `Deleted goal from system`,
            xp: 0,
          },
        });
      },

      addJapaneseResource: (resourceData) => {
        const state = get();
        const newRes: JapaneseResource = {
          id: 'jp_' + Date.now(),
          completed: 0,
          finished: false,
          ...resourceData,
        };
        set({
          japaneseResources: [...state.japaneseResources, newRes],
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🌸 Japanese Resource Added!`,
            message: `Added [${resourceData.level}] ${resourceData.title}`,
            xp: 30,
          },
        });
      },

      updateJapaneseResource: (id, resourceData) => {
        const state = get();
        const updatedResources = state.japaneseResources.map((res) => {
          if (res.id === id) {
            const newRes = { ...res, ...resourceData };
            const finished = newRes.completed >= newRes.target;
            return { ...newRes, finished };
          }
          return res;
        });

        // Recalculate Japanese Goal Progress
        const totalTarget = updatedResources.reduce((acc, r) => acc + r.target, 0);
        const totalDone = updatedResources.reduce((acc, r) => acc + r.completed, 0);
        const jpPercentage = totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;

        const updatedGoals = state.goals.map((g) =>
          g.id === 'japanese' ? { ...g, current: jpPercentage } : g
        );

        set({
          japaneseResources: updatedResources,
          goals: updatedGoals,
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `✏️ Resource Updated!`,
            message: `Saved changes to Japanese resource`,
            xp: 10,
          },
        });
      },

      deleteJapaneseResource: (id) => {
        const state = get();
        deleteCloudRecord('japanese_resources', id);
        const targetRes = state.japaneseResources.find((r) => r.id === id);
        const xpDeducted = targetRes ? (targetRes.finished ? 40 : targetRes.completed * 15) : 0;
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        const updated = state.japaneseResources.filter((r) => r.id !== id);
        set({
          japaneseResources: updated,
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Resource Removed (-${xpDeducted} XP)`,
            message: `Resource deleted`,
            xp: -xpDeducted,
          },
        });
      },

      addSubject: (subjectData) => {
        const state = get();
        const newSubject: Subject = {
          id: 'sub_' + Date.now(),
          hours_completed: 0,
          checkpoint: 0,
          status: 'not_started',
          ...subjectData,
        };
        set({
          subjects: [...state.subjects, newSubject],
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `📚 New Subject Added!`,
            message: `Added subject: ${subjectData.title}`,
            xp: 25,
          },
        });
      },

      updateSubject: (id, subjectData) => {
        const state = get();
        const updatedSubjects = state.subjects.map((sub) => {
          if (sub.id === id) {
            const merged = { ...sub, ...subjectData };
            const ratio = merged.hours_target > 0 ? (merged.hours_completed / merged.hours_target) * 100 : 0;
            let checkpoint = 0;
            if (ratio >= 100) checkpoint = 100;
            else if (ratio >= 80) checkpoint = 80;
            else if (ratio >= 60) checkpoint = 60;
            else if (ratio >= 40) checkpoint = 40;
            else if (ratio >= 20) checkpoint = 20;

            const status = ratio >= 100 ? 'completed' : merged.hours_completed > 0 ? 'in_progress' : 'not_started';
            return {
              ...merged,
              checkpoint,
              status: status as 'not_started' | 'in_progress' | 'completed',
            };
          }
          return sub;
        });

        // Recalculate Goal totals
        const updatedGoals = state.goals.map((goal) => {
          const goalSubjects = updatedSubjects.filter((s) => s.goal_id === goal.id);
          if (goalSubjects.length > 0) {
            const totalDone = goalSubjects.reduce((acc, s) => acc + s.hours_completed, 0);
            return { ...goal, current: Number(totalDone.toFixed(1)) };
          }
          return goal;
        });

        set({
          subjects: updatedSubjects,
          goals: updatedGoals,
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `✏️ Subject Goal Updated!`,
            message: `Updated subject settings & targets`,
            xp: 10,
          },
        });
      },

      deleteSubject: (id) => {
        const state = get();
        deleteCloudRecord('subjects', id);
        const targetSub = state.subjects.find((s) => s.id === id);
        const xpDeducted = targetSub ? Math.round(targetSub.hours_completed * 10) : 0;
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        const updatedSubjects = state.subjects.filter((s) => s.id !== id);
        const updatedLogs = state.lectureLogs.filter((l) => l.subject_id !== id);

        set({
          subjects: updatedSubjects,
          lectureLogs: updatedLogs,
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Subject Deleted (-${xpDeducted} XP)`,
            message: `Removed subject and associated logs`,
            xp: -xpDeducted,
          },
        });
      },

      addRoadmapGoal: ({ month, week_number, goal, priority = 'high' }) => {
        const state = get();
        const newItem: RoadmapItem = {
          id: 'road_' + Date.now(),
          month,
          week_number,
          goal: goal.trim(),
          priority,
          completed: false,
        };
        set({
          roadmap: [...state.roadmap, newItem],
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `📋 Week ${week_number} Goal Added!`,
            message: `Added to ${month}: ${goal}`,
            xp: 15,
          },
        });
      },

      toggleRoadmapGoal: (id) => {
        const state = get();
        let xpGained = 0;
        const updatedRoadmap = state.roadmap.map((item) => {
          if (item.id === id) {
            const nowCompleted = !item.completed;
            if (nowCompleted) xpGained = 20;
            return { ...item, completed: nowCompleted };
          }
          return item;
        });

        const newXp = state.userStats.xp + xpGained;
        const newLevel = Math.floor(newXp / 300) + 1;

        set({
          roadmap: updatedRoadmap,
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: xpGained > 0 ? `🎉 Weekly Goal Completed!` : `Weekly Goal Updated`,
            message: xpGained > 0 ? `+20 XP Earned` : `Toggled goal status`,
            xp: xpGained,
          },
        });
      },

      deleteRoadmapGoal: (id) => {
        const state = get();
        deleteCloudRecord('roadmap', id);
        const targetGoal = state.roadmap.find((item) => item.id === id);
        const xpDeducted = targetGoal?.completed ? 20 : 0;
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        const updatedRoadmap = state.roadmap.filter((item) => item.id !== id);
        set({
          roadmap: updatedRoadmap,
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Goal Removed (-${xpDeducted} XP)`,
            message: `Deleted weekly goal`,
            xp: -xpDeducted,
          },
        });
      },

      toggleRevisionCheckpoint: (id, checkpointKey) => {
        const state = get();
        let xpGained = 0;
        let chapterTitle = '';

        const updatedMatrix = state.revisionMatrix.map((item) => {
          if (item.id === id) {
            chapterTitle = item.chapter;
            const currentVal = !!item.checkpoints[checkpointKey];
            const newVal = !currentVal;
            if (newVal) xpGained = 5;

            return {
              ...item,
              checkpoints: {
                ...item.checkpoints,
                [checkpointKey]: newVal,
              },
            };
          }
          return item;
        });

        const newXp = state.userStats.xp + xpGained;
        const newLevel = Math.floor(newXp / 300) + 1;

        set({
          revisionMatrix: updatedMatrix,
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: xpGained > 0 ? `✅ Revision Checkpoint Cleared!` : `Revision Checkpoint Updated`,
            message: xpGained > 0 ? `+5 XP Earned for ${chapterTitle}` : `Toggled ${String(checkpointKey)}`,
            xp: xpGained,
          },
        });
      },

      addRevisionChapter: (category, subject, chapter) => {
        const state = get();
        const newItem: ChapterRevisionItem = {
          id: 'rev_' + Date.now(),
          category,
          subject: subject.toUpperCase().trim(),
          chapter: chapter.trim(),
          checkpoints: {},
        };

        set({
          revisionMatrix: [...state.revisionMatrix, newItem],
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `📚 Revision Chapter Added!`,
            message: `Added: ${chapter} under ${subject}`,
            xp: 10,
          },
        });
      },

      deleteRevisionChapter: (id) => {
        const state = get();
        deleteCloudRecord('revision_matrix', id);
        const targetChapter = state.revisionMatrix.find((c) => c.id === id);
        let clearedCount = 0;
        if (targetChapter?.checkpoints) {
          clearedCount = Object.values(targetChapter.checkpoints).filter(Boolean).length;
        }
        const xpDeducted = clearedCount * 5;
        const newXp = Math.max(0, state.userStats.xp - xpDeducted);
        const newLevel = Math.max(1, Math.floor(newXp / 300) + 1);

        const updatedMatrix = state.revisionMatrix.filter((item) => item.id !== id);
        set({
          revisionMatrix: updatedMatrix,
          userStats: {
            ...state.userStats,
            xp: newXp,
            level: newLevel,
          },
          activeToast: {
            id: 'toast_' + Date.now(),
            title: `🗑️ Chapter Removed (-${xpDeducted} XP)`,
            message: `Deleted chapter from Revision Matrix`,
            xp: -xpDeducted,
          },
        });
      },

      // ==========================================
      // DERIVED METRIC CALCULATORS
      // ==========================================
      getOverallProgress: () => {
        const { subjects, japaneseResources, projects } = get();
        // GATE CS & DA Progress
        const totalGateHoursTarget = subjects.reduce((acc, s) => acc + s.hours_target, 0);
        const totalGateHoursDone = subjects.reduce((acc, s) => acc + s.hours_completed, 0);
        const gateRatio = totalGateHoursTarget > 0 ? (totalGateHoursDone / totalGateHoursTarget) * 100 : 0;

        // Japanese Progress
        const totalJpTarget = japaneseResources.reduce((acc, r) => acc + r.target, 0);
        const totalJpDone = japaneseResources.reduce((acc, r) => acc + r.completed, 0);
        const jpRatio = totalJpTarget > 0 ? (totalJpDone / totalJpTarget) * 100 : 0;

        // Project Progress
        const projRatio = projects.length > 0 ? projects.reduce((acc, p) => acc + p.progress, 0) / projects.length : 0;

        const overall = Math.round(gateRatio * 0.5 + jpRatio * 0.3 + projRatio * 0.2);
        return Math.min(100, Math.max(0, overall));
      },

      getTrackProgress: (track) => {
        const { subjects, japaneseResources } = get();
        if (track === 'Japanese') {
          const totalTarget = japaneseResources.reduce((acc, r) => acc + r.target, 0);
          const totalDone = japaneseResources.reduce((acc, r) => acc + r.completed, 0);
          return totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;
        }
        const trackSubs = subjects.filter((s) => s.track === track);
        if (trackSubs.length === 0) return 0;
        const totalTarget = trackSubs.reduce((acc, s) => acc + s.hours_target, 0);
        const totalDone = trackSubs.reduce((acc, s) => acc + s.hours_completed, 0);
        return totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;
      },

      getSubjectProgress: (subjectId) => {
        const { subjects } = get();
        const sub = subjects.find((s) => s.id === subjectId);
        if (!sub) return 0;
        return sub.hours_target > 0 ? Math.round((sub.hours_completed / sub.hours_target) * 100) : 0;
      },
    }),
    {
      name: 'stepwise-storage-v9',
      partialize: (state) => ({
        userStats: state.userStats,
        goals: state.goals,
        subjects: state.subjects,
        topics: state.topics,
        lectureLogs: state.lectureLogs,
        dailyFitnessLogs: state.dailyFitnessLogs,
        prRecords: state.prRecords,
        japaneseResources: state.japaneseResources,
        weeklyReviews: state.weeklyReviews,
        projects: state.projects,
        techStack: state.techStack,
        roadmap: state.roadmap,
        revisionMatrix: state.revisionMatrix,
        books: state.books,
        achievements: state.achievements,
        recentEvents: (state.recentEvents || []).slice(0, 50),
      }),
    }
  )
);
