import { createClient } from './client';
import { useStepwiseStore, initialSubjects } from '@/store/useStepwiseStore';
import {
  Subject,
  JapaneseResource,
  PRRecord,
  ChapterRevisionItem,
  ProjectItem,
  TechStackItem,
  DailyFitnessLog,
  LectureLog,
  RoadmapItem,
  Book,
  AppEvent,
} from '@/types';
import { initialRevisionMatrix } from '@/data/initialRevisionMatrix';

let syncDebounceTimer: NodeJS.Timeout | null = null;
let realtimeChannel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
let lastLocalWriteTimestamp = 0;

function getScopedId(id: string, userId: string): string {
  if (!id || !userId) return id;
  if (id.startsWith(`${userId}_`)) return id;
  return `${userId}_${id}`;
}

function getUnscopedId(id: string, userId: string): string {
  if (!id || !userId) return id;
  if (id.startsWith(`${userId}_`)) return id.slice(userId.length + 1);
  return id;
}

function deduplicatePayloads<T extends { id: string }>(payloads: T[]): T[] {
  const map = new Map<string, T>();
  payloads.forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
}

export async function deleteCloudRecord(tableName: string, id: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return;
  lastLocalWriteTimestamp = Date.now();
  const userId = session.user.id;
  const scopedId = getScopedId(id, userId);

  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .or(`id.eq.${id},id.eq.${scopedId}`)
      .eq('user_id', userId);
    if (error) {
      console.error(`[Supabase Delete] Error deleting from ${tableName}:`, error.message);
    } else {
      lastLocalWriteTimestamp = Date.now();
      // Sync updated state (including adjusted XP) to cloud
      syncCurrentStateToCloud(useStepwiseStore.getState());
    }
  } catch (err) {
    console.error(`[Supabase Delete] Exception deleting from ${tableName}:`, err);
  }
}

export async function manualCloudSync(): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { success: false, message: 'Please sign in to sync with cloud.' };
  }

  try {
    const errors = await syncCurrentStateToCloud(useStepwiseStore.getState());
    await fetchAndHydrateUserData(session.user.id);

    if (errors.length > 0) {
      return {
        success: false,
        message: `Sync partially failed due to Supabase DB schema:\n\n${errors.join('\n')}\n\nPlease run the SQL schema in supabase/schema.sql in your Supabase SQL Editor!`,
      };
    }

    return { success: true, message: 'Cloud Sync Successful! All tables synchronized.' };
  } catch (err: unknown) {
    return { success: false, message: (err as Error).message || 'Failed to sync with cloud.' };
  }
}

export async function initializeCloudSync() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    await fetchAndHydrateUserData(session.user.id);
    setupRealtimeSubscription(session.user.id);
  }

  // Subscribe to auth state changes
  supabase.auth.onAuthStateChange(async (event, currentSession) => {
    if (event === 'SIGNED_IN' && currentSession?.user) {
      await fetchAndHydrateUserData(currentSession.user.id);
      setupRealtimeSubscription(currentSession.user.id);
    } else if (event === 'SIGNED_OUT') {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    }
  });

  // Dirty table tracking for delta syncing
  const dirtyTables = new Set<string>();
  let previousSyncState: ReturnType<typeof useStepwiseStore.getState> | null = null;

  // Subscribe to Zustand store changes to automatically push only modified tables to Supabase
  useStepwiseStore.subscribe((state) => {
    if (!previousSyncState) {
      previousSyncState = state;
      return;
    }

    if (state.userStats !== previousSyncState.userStats) dirtyTables.add('profiles');
    if (state.projects !== previousSyncState.projects) dirtyTables.add('projects');
    if (state.techStack !== previousSyncState.techStack) dirtyTables.add('tech_stack');
    if (state.subjects !== previousSyncState.subjects) dirtyTables.add('subjects');
    if (state.revisionMatrix !== previousSyncState.revisionMatrix) dirtyTables.add('revision_matrix');
    if (state.japaneseResources !== previousSyncState.japaneseResources) dirtyTables.add('japanese_resources');
    if (state.dailyFitnessLogs !== previousSyncState.dailyFitnessLogs) dirtyTables.add('daily_fitness_logs');
    if (state.prRecords !== previousSyncState.prRecords) dirtyTables.add('pr_records');
    if (state.lectureLogs !== previousSyncState.lectureLogs) dirtyTables.add('lecture_logs');
    if (state.roadmap !== previousSyncState.roadmap) dirtyTables.add('roadmap');
    if (state.books !== previousSyncState.books) dirtyTables.add('books');

    previousSyncState = state;

    if (dirtyTables.size === 0) return;

    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      const tablesToSync = new Set(dirtyTables);
      dirtyTables.clear();
      syncCurrentStateToCloud(state, tablesToSync);
    }, 1500);
  });
}

export function setupRealtimeSubscription(userId: string) {
  const supabase = createClient();

  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  // Subscribe to PostgreSQL Realtime database changes
  realtimeChannel = supabase
    .channel(`realtime:user_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
      },
      () => {
        // Ignore echo-back events triggered by local writes in the last 3 seconds
        if (Date.now() - lastLocalWriteTimestamp < 3000) {
          return;
        }
        // Re-hydrate store when database updates from remote device
        fetchAndHydrateUserData(userId);
      }
    )
    .subscribe();
}

export async function fetchAndHydrateUserData(userId: string) {
  const supabase = createClient();

  try {
    const [
      { data: profile, error: profileErr },
      { data: subjects, error: subErr },
      { data: revisionMatrix, error: revErr },
      { data: japaneseResources, error: jpErr },
      { data: dailyFitnessLogs, error: fitErr },
      { data: prRecords, error: prErr },
      { data: projects, error: projErr },
      { data: techStack, error: techErr },
      { data: lectureLogs, error: lecErr },
      { data: roadmap, error: rmErr },
      { data: books, error: bkErr },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('subjects').select('*').eq('user_id', userId),
      supabase.from('revision_matrix').select('*').eq('user_id', userId),
      supabase.from('japanese_resources').select('*').eq('user_id', userId),
      supabase.from('daily_fitness_logs').select('*').eq('user_id', userId),
      supabase.from('pr_records').select('*').eq('user_id', userId),
      supabase.from('projects').select('*').eq('user_id', userId),
      supabase.from('tech_stack').select('*').eq('user_id', userId),
      supabase.from('lecture_logs').select('*').eq('user_id', userId),
      supabase.from('roadmap').select('*').eq('user_id', userId),
      supabase.from('books').select('*').eq('user_id', userId),
    ]);

    if (profileErr) console.warn('[Supabase Sync] Profile fetch notice:', profileErr.message);
    if (subErr) console.warn('[Supabase Sync] Subjects fetch notice:', subErr.message);
    if (revErr) console.warn('[Supabase Sync] Revision matrix fetch notice:', revErr.message);
    if (jpErr) console.warn('[Supabase Sync] Japanese resources fetch notice:', jpErr.message);
    if (fitErr) console.warn('[Supabase Sync] Daily fitness fetch notice:', fitErr.message);
    if (prErr) console.warn('[Supabase Sync] PR records fetch notice:', prErr.message);
    if (projErr) console.warn('[Supabase Sync] Projects fetch notice:', projErr.message);
    if (techErr) console.warn('[Supabase Sync] Tech stack fetch notice:', techErr.message);
    if (lecErr) console.warn('[Supabase Sync] Lecture logs fetch notice:', lecErr.message);
    if (rmErr) console.warn('[Supabase Sync] Roadmap fetch notice:', rmErr.message);
    if (bkErr) console.warn('[Supabase Sync] Books fetch notice:', bkErr.message);

    const isNewUserDb =
      (!projects || projects.length === 0) &&
      (!subjects || subjects.length === 0) &&
      (!revisionMatrix || revisionMatrix.length === 0);

    // 1. Transform Subjects
    const transformedSubjects: Subject[] = (subjects || []).map((s) => {
      const hoursCompleted = Number(s.hours_completed || 0);
      const hoursTarget = Number(s.hours_target || 30);
      const ratio = hoursTarget > 0 ? Math.min(100, Math.floor((hoursCompleted / hoursTarget) * 100)) : 0;
      let checkpoint = 0;
      if (ratio >= 100) checkpoint = 100;
      else if (ratio >= 80) checkpoint = 80;
      else if (ratio >= 60) checkpoint = 60;
      else if (ratio >= 40) checkpoint = 40;
      else if (ratio >= 20) checkpoint = 20;

      const status = ratio >= 100 ? 'completed' : hoursCompleted > 0 ? 'in_progress' : 'not_started';
      const track = (s.track || 'GATE CS') as 'GATE CS' | 'GATE DA' | 'Japanese' | 'Fitness';
      const goalId = track === 'GATE CS' ? 'gate_cs' : track === 'GATE DA' ? 'gate_da' : 'projects';

      return {
        id: getUnscopedId(s.id, userId),
        goal_id: goalId,
        track,
        title: s.title,
        hours_target: hoursTarget,
        hours_completed: hoursCompleted,
        checkpoint,
        status,
      };
    });

    // 2. Transform Japanese Resources
    const transformedJp: JapaneseResource[] = (japaneseResources || []).map((j) => {
      const target = Number(j.episodes_or_chapters ?? j.target ?? 30);
      const completed = Number(j.completed ?? j.hours_spent ?? 0);
      return {
        id: getUnscopedId(j.id, userId),
        level: j.level || 'N5',
        resource_type: j.type || j.resource_type || 'PDF',
        title: j.title || 'Japanese Resource',
        target,
        completed,
        finished: completed >= target,
      };
    });

    // 3. Transform PR Records
    const transformedPRs: PRRecord[] = (prRecords || []).map((pr) => ({
      id: getUnscopedId(pr.id, userId),
      exercise: pr.exercise || 'Bench Press',
      weight_kg: Number(pr.weight ?? pr.weight_kg ?? 0),
      reps: Number(pr.reps ?? 1),
      date: pr.date || new Date().toISOString().split('T')[0],
      notes: pr.notes || '',
    }));

    // 4. Transform Revision Matrix
    const transformedRevision: ChapterRevisionItem[] = (revisionMatrix || []).map((r) => ({
      id: getUnscopedId(r.id, userId),
      category: (r.track || r.category || 'gate_cs') as 'gate_cs' | 'gate_da' | 'general_aptitude',
      subject: r.subject || '',
      chapter: r.chapter || '',
      checkpoints: r.checkpoints || {
        rev1: !!r.revision1,
        rev2: !!r.revision2,
        rev3: !!r.revision3,
        pyq1: !!r.pyqs_done,
        short_notes: !!r.notes_done,
      },
    }));

    // 5. Transform Projects
    const transformedProjects: ProjectItem[] = (projects || []).map((p) => ({
      id: getUnscopedId(p.id, userId),
      title: p.title || 'Untitled Project',
      description: p.description || '',
      category: p.category || 'Web App',
      progress: Number(p.progress || 0),
      github: p.github || '',
      status: p.status || 'in_progress',
      tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
      updated_at: p.updated_at || new Date().toISOString(),
    }));

    // 6. Transform Tech Stack
    const transformedTech: TechStackItem[] = (techStack || []).map((t) => ({
      id: getUnscopedId(t.id, userId),
      name: t.name || '',
      category: t.category || 'Frontend & UI',
      proficiency: t.proficiency || 'Learning',
      notes: t.notes || '',
    }));

    // 7. Transform Daily Fitness Logs
    const transformedFitness: DailyFitnessLog[] = (dailyFitnessLogs || []).map((f) => ({
      id: getUnscopedId(f.id, userId),
      date: f.date || new Date().toISOString().split('T')[0],
      steps: Number(f.steps || 0),
      calories: Number(f.calories || 0),
      protein: Number(f.protein || 0),
      created_at: f.created_at || new Date().toISOString(),
    }));

    // 8. Transform Lecture Logs
    const transformedLectureLogs: LectureLog[] = (lectureLogs || []).map((l) => ({
      id: getUnscopedId(l.id, userId),
      subject_id: getUnscopedId(l.subject_id, userId),
      date: l.date || l.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      hours: Number(l.hours || 0),
      remarks: l.remarks || 'Study session logged',
      created_at: l.created_at || new Date().toISOString(),
    }));

    // 9. Transform Roadmap Goals
    const transformedRoadmap: RoadmapItem[] = (roadmap || []).map((r) => ({
      id: getUnscopedId(r.id, userId),
      month: r.month || 'August 2026',
      week_number: Number(r.week_number || 1),
      goal: r.goal || '',
      priority: (r.priority || 'medium') as 'low' | 'medium' | 'high',
      completed: !!r.completed,
    }));

    // 10. Transform Books
    const transformedBooks: Book[] = (books || []).map((b) => ({
      id: getUnscopedId(b.id, userId),
      title: b.title || 'Untitled Book',
      author: b.author || 'Unknown Author',
      category: b.category || 'General Reading',
      total_pages: Number(b.total_pages || 100),
      completed_pages: Number(b.completed_pages || 0),
      status: (b.status || 'reading') as 'reading' | 'completed' | 'paused',
      notes: b.notes || '',
      created_at: b.created_at || new Date().toISOString(),
      updated_at: b.updated_at || new Date().toISOString(),
    }));

    const deduplicateTransformed = <T extends { id: string }>(items: T[]): T[] => {
      const map = new Map<string, T>();
      items.forEach((item) => map.set(item.id, item));
      return Array.from(map.values());
    };

    const cleanSubjects = deduplicateTransformed(transformedSubjects);
    const cleanJp = deduplicateTransformed(transformedJp);
    const cleanPRs = deduplicateTransformed(transformedPRs);
    const cleanRevision = deduplicateTransformed(transformedRevision);
    const cleanProjects = deduplicateTransformed(transformedProjects);
    const cleanTech = deduplicateTransformed(transformedTech);
    const cleanFitness = deduplicateTransformed(transformedFitness);
    const cleanLectureLogs = deduplicateTransformed(transformedLectureLogs);
    const cleanRoadmap = deduplicateTransformed(transformedRoadmap);
    const cleanBooks = deduplicateTransformed(transformedBooks);

    // 11. Reconstruct Event Stream feed from fetched records so Event Bus stream is never empty
    const reconstructedEvents: AppEvent[] = [];
    cleanLectureLogs.forEach((l) => {
      const sub = cleanSubjects.find((s) => s.id === l.subject_id);
      reconstructedEvents.push({
        id: 'evt_lec_' + l.id,
        type: 'LECTURE_LOGGED',
        payload: l,
        timestamp: l.created_at,
        xpEarned: Math.round(l.hours * 10),
        description: `Logged ${l.hours} hrs for ${sub ? sub.title : 'Study Subject'}`,
      });
    });

    cleanFitness.forEach((f) => {
      reconstructedEvents.push({
        id: 'evt_fit_' + f.id,
        type: 'FITNESS_LOGGED',
        payload: f,
        timestamp: f.created_at,
        xpEarned: 25,
        description: `Logged fitness stats (${f.steps} steps, ${f.protein}g protein)`,
      });
    });

    // Deduplicate and sort events newest first
    const eventMap = new Map<string, AppEvent>();
    reconstructedEvents.forEach((evt) => eventMap.set(evt.id, evt));
    const finalEvents = Array.from(eventMap.values());
    finalEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // When Supabase query succeeds (non-null), remote data is authoritative for user state.
    // For subjects, if remote returns 0 rows (new user), fall back to initial default GATE subjects!
    const currentState = useStepwiseStore.getState();
    const finalSubjects =
      subjects !== null && cleanSubjects.length > 0
        ? cleanSubjects
        : currentState.subjects && currentState.subjects.length > 0
        ? currentState.subjects
        : initialSubjects;
    const finalTechStack = techStack !== null ? cleanTech : (useStepwiseStore.getState().techStack || []);
    const finalJp = japaneseResources !== null ? cleanJp : (useStepwiseStore.getState().japaneseResources || []);
    const finalProjects = projects !== null ? cleanProjects : (useStepwiseStore.getState().projects || []);
    const finalRoadmap = roadmap !== null ? cleanRoadmap : (useStepwiseStore.getState().roadmap || []);
    const finalBooks = books !== null ? cleanBooks : (useStepwiseStore.getState().books || []);
    const finalPRs = prRecords !== null ? cleanPRs : (useStepwiseStore.getState().prRecords || []);
    const finalFitness = dailyFitnessLogs !== null ? cleanFitness : (useStepwiseStore.getState().dailyFitnessLogs || []);
    const finalLectureLogs = lectureLogs !== null ? cleanLectureLogs : (useStepwiseStore.getState().lectureLogs || []);

    // Merge & deduplicate Revision Matrix: start with initial default chapters, overlay Supabase records
    const revisionMap = new Map<string, ChapterRevisionItem>();
    initialRevisionMatrix.forEach((r) => revisionMap.set(r.id, r));
    if (revisionMatrix !== null && cleanRevision.length > 0) {
      cleanRevision.forEach((r) => {
        const existing = revisionMap.get(r.id);
        if (existing) {
          revisionMap.set(r.id, {
            ...existing,
            ...r,
            checkpoints: {
              ...existing.checkpoints,
              ...r.checkpoints,
            },
          });
        } else {
          revisionMap.set(r.id, r);
        }
      });
    }
    const finalRevisionMatrix = Array.from(revisionMap.values());

    // Hydrate store state with transformed database records
    useStepwiseStore.setState((state) => ({
      userStats: {
        ...state.userStats,
        level: profile?.level ?? state.userStats.level,
        xp: profile?.xp ?? state.userStats.xp,
        streak: profile?.streak ?? state.userStats.streak,
      },
      subjects: finalSubjects,
      japaneseResources: finalJp,
      dailyFitnessLogs: finalFitness,
      prRecords: finalPRs,
      projects: finalProjects,
      techStack: finalTechStack,
      revisionMatrix: finalRevisionMatrix,
      lectureLogs: finalLectureLogs,
      roadmap: finalRoadmap,
      books: finalBooks,
      recentEvents:
        finalEvents.length > 0
          ? finalEvents.slice(0, 50)
          : (lectureLogs !== null && lectureLogs.length === 0 ? [] : state.recentEvents),
    }));

    // If new user with empty tables in Supabase, seed current state into Supabase immediately!
    if (isNewUserDb) {
      await syncCurrentStateToCloud(useStepwiseStore.getState());
    }
  } catch (err) {
    console.error('[Supabase Sync] Error hydrating user data:', err);
  }
}

export async function syncCurrentStateToCloud(
  state: ReturnType<typeof useStepwiseStore.getState>,
  targetTables?: Set<string> | string[]
): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return []; // Only sync if logged in

  const userId = user.id;
  lastLocalWriteTimestamp = Date.now();
  const syncErrors: string[] = [];

  const targetSet = targetTables
    ? targetTables instanceof Set
      ? targetTables
      : new Set(targetTables)
    : null;

  const shouldSync = (tableName: string) => !targetSet || targetSet.has(tableName);

  try {
    // 1. Sync User Stats Profile
    if (shouldSync('profiles')) {
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        email: user.email,
        level: state.userStats.level,
        xp: state.userStats.xp,
        streak: state.userStats.streak,
        updated_at: new Date().toISOString(),
      });
      if (profileErr) {
        console.error('[Supabase Push] Profile error:', profileErr.message);
        syncErrors.push(`profiles: ${profileErr.message}`);
      }
    }

    // 2. Sync Projects
    if (shouldSync('projects') && state.projects && state.projects.length > 0) {
      const projectPayloads = deduplicatePayloads(
        state.projects.map((p) => ({
          id: getScopedId(p.id, userId),
          user_id: userId,
          title: p.title,
          description: p.description,
          category: p.category,
          progress: p.progress,
          github: p.github,
          status: p.status,
          tech_stack: p.tech_stack || [],
          updated_at: new Date().toISOString(),
        }))
      );
      const { error: projErr } = await supabase.from('projects').upsert(projectPayloads);
      if (projErr) {
        console.error('[Supabase Push] Projects error:', projErr.message);
        syncErrors.push(`projects: ${projErr.message}`);
      }
    }

    // 3. Sync Tech Stack
    if (shouldSync('tech_stack') && state.techStack && state.techStack.length > 0) {
      const techPayloads = deduplicatePayloads(
        state.techStack.map((t) => ({
          id: getScopedId(t.id, userId),
          user_id: userId,
          name: t.name,
          category: t.category,
          proficiency: t.proficiency,
          notes: t.notes,
        }))
      );
      const { error: techErr } = await supabase.from('tech_stack').upsert(techPayloads);
      if (techErr) {
        console.error('[Supabase Push] Tech stack error:', techErr.message);
        syncErrors.push(`tech_stack: ${techErr.message}`);
      }
    }

    // 4. Sync Subjects
    if (shouldSync('subjects') && state.subjects && state.subjects.length > 0) {
      const subjectPayloads = deduplicatePayloads(
        state.subjects.map((s) => ({
          id: getScopedId(s.id, userId),
          user_id: userId,
          title: s.title,
          track: s.track,
          hours_target: s.hours_target,
          hours_completed: s.hours_completed,
        }))
      );
      const { error: subErr } = await supabase.from('subjects').upsert(subjectPayloads);
      if (subErr) {
        console.error('[Supabase Push] Subjects error:', subErr.message);
        syncErrors.push(`subjects: ${subErr.message}`);
      }
    }

    // 5. Sync Revision Matrix
    if (shouldSync('revision_matrix') && state.revisionMatrix && state.revisionMatrix.length > 0) {
      const revisionPayloads = deduplicatePayloads(
        state.revisionMatrix.map((r) => ({
          id: getScopedId(r.id, userId),
          user_id: userId,
          subject: r.subject,
          chapter: r.chapter,
          track: r.category,
          revision1: !!r.checkpoints?.rev1,
          revision2: !!r.checkpoints?.rev2,
          revision3: !!r.checkpoints?.rev3,
          pyqs_done: !!r.checkpoints?.pyq1,
          notes_done: !!r.checkpoints?.short_notes,
        }))
      );
      const { error: revErr } = await supabase.from('revision_matrix').upsert(revisionPayloads);
      if (revErr) {
        console.error('[Supabase Push] Revision matrix error:', revErr.message);
        syncErrors.push(`revision_matrix: ${revErr.message}`);
      }
    }

    // 6. Sync Japanese Resources
    if (shouldSync('japanese_resources') && state.japaneseResources && state.japaneseResources.length > 0) {
      const jpPayloads = deduplicatePayloads(
        state.japaneseResources.map((j) => ({
          id: getScopedId(j.id, userId),
          user_id: userId,
          title: j.title,
          type: j.resource_type,
          episodes_or_chapters: j.target,
          completed: j.completed,
          hours_spent: j.completed,
          level: j.level,
        }))
      );
      const { error: jpErr } = await supabase.from('japanese_resources').upsert(jpPayloads);
      if (jpErr) {
        console.error('[Supabase Push] Japanese error:', jpErr.message);
        syncErrors.push(`japanese_resources: ${jpErr.message}`);
      }
    }

    // 7. Sync Daily Fitness Logs
    if (shouldSync('daily_fitness_logs') && state.dailyFitnessLogs && state.dailyFitnessLogs.length > 0) {
      const fitnessPayloads = deduplicatePayloads(
        state.dailyFitnessLogs.map((f) => ({
          id: getScopedId(f.id, userId),
          user_id: userId,
          date: f.date,
          steps: f.steps,
          calories: f.calories,
          protein: f.protein,
        }))
      );
      const { error: fitErr } = await supabase.from('daily_fitness_logs').upsert(fitnessPayloads);
      if (fitErr) {
        console.error('[Supabase Push] Fitness error:', fitErr.message);
        syncErrors.push(`daily_fitness_logs: ${fitErr.message}`);
      }
    }

    // 8. Sync PR Records
    if (shouldSync('pr_records') && state.prRecords && state.prRecords.length > 0) {
      const prPayloads = deduplicatePayloads(
        state.prRecords.map((pr) => ({
          id: getScopedId(pr.id, userId),
          user_id: userId,
          exercise: pr.exercise,
          weight: pr.weight_kg,
          reps: pr.reps,
          date: pr.date,
          notes: pr.notes,
        }))
      );
      const { error: prErr } = await supabase.from('pr_records').upsert(prPayloads);
      if (prErr) {
        console.error('[Supabase Push] PR records error:', prErr.message);
        syncErrors.push(`pr_records: ${prErr.message}`);
      }
    }

    // 9. Sync Lecture Logs
    if (shouldSync('lecture_logs') && state.lectureLogs && state.lectureLogs.length > 0) {
      const logPayloads = deduplicatePayloads(
        state.lectureLogs.map((l) => ({
          id: getScopedId(l.id, userId),
          user_id: userId,
          subject_id: getScopedId(l.subject_id, userId),
          hours: l.hours,
          remarks: l.remarks,
          created_at: l.created_at || new Date().toISOString(),
        }))
      );
      const { error: lecErr } = await supabase.from('lecture_logs').upsert(logPayloads);
      if (lecErr) {
        console.error('[Supabase Push] Lecture logs error:', lecErr.message);
        syncErrors.push(`lecture_logs: ${lecErr.message}`);
      }
    }

    // 10. Sync Roadmap Goals
    if (shouldSync('roadmap') && state.roadmap && state.roadmap.length > 0) {
      const roadmapPayloads = deduplicatePayloads(
        state.roadmap.map((r) => ({
          id: getScopedId(r.id, userId),
          user_id: userId,
          month: r.month,
          week_number: r.week_number,
          goal: r.goal,
          priority: r.priority,
          completed: r.completed,
        }))
      );
      const { error: rmErr } = await supabase.from('roadmap').upsert(roadmapPayloads);
      if (rmErr) {
        console.error('[Supabase Push] Roadmap error:', rmErr.message);
        syncErrors.push(`roadmap: ${rmErr.message}`);
      }
    }

    // 11. Sync Books
    if (shouldSync('books') && state.books && state.books.length > 0) {
      const bookPayloads = deduplicatePayloads(
        state.books.map((b) => ({
          id: getScopedId(b.id, userId),
          user_id: userId,
          title: b.title,
          author: b.author,
          category: b.category,
          total_pages: b.total_pages,
          completed_pages: b.completed_pages,
          status: b.status,
          notes: b.notes,
          created_at: b.created_at,
          updated_at: b.updated_at,
        }))
      );
      const { error: bkErr } = await supabase.from('books').upsert(bookPayloads);
      if (bkErr) {
        console.error('[Supabase Push] Books error:', bkErr.message);
        syncErrors.push(`books: ${bkErr.message}`);
      }
    }
  } catch (err: unknown) {
    console.error('[Supabase Push] Error syncing store state to Supabase:', err);
    syncErrors.push((err as Error).message || 'Unknown sync error');
  }

  return syncErrors;
}

export async function wipeUserDataAndResetAccount(): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    useStepwiseStore.getState().resetToDefaults();
    return { success: true, message: 'Local state reset to defaults.' };
  }

  const userId = session.user.id;

  try {
    const tables = [
      'profiles',
      'projects',
      'tech_stack',
      'subjects',
      'revision_matrix',
      'japanese_resources',
      'daily_fitness_logs',
      'pr_records',
      'lecture_logs',
      'roadmap',
      'books',
    ];

    for (const table of tables) {
      await supabase.from(table).delete().eq(table === 'profiles' ? 'id' : 'user_id', userId);
    }

    // Reset store state
    useStepwiseStore.getState().resetToDefaults();

    // Re-push clean initial defaults to Supabase
    await syncCurrentStateToCloud(useStepwiseStore.getState());

    return { success: true, message: 'All cloud database data wiped and reset to fresh defaults!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Supabase Account Reset Error]:', errorMsg);
    return { success: false, message: `Reset failed: ${errorMsg}` };
  }
}

export async function deleteUserAccountAndSignOut(): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const userId = session.user.id;
    const tables = [
      'profiles',
      'projects',
      'tech_stack',
      'subjects',
      'revision_matrix',
      'japanese_resources',
      'daily_fitness_logs',
      'pr_records',
      'lecture_logs',
      'roadmap',
      'books',
    ];

    for (const table of tables) {
      await supabase.from(table).delete().eq(table === 'profiles' ? 'id' : 'user_id', userId);
    }

    await supabase.auth.signOut();
  }

  useStepwiseStore.getState().resetToDefaults();
  return { success: true, message: 'User account data permanently deleted.' };
}
