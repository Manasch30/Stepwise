import { createClient } from './client';
import { useStepwiseStore } from '@/store/useStepwiseStore';
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
  AppEvent,
} from '@/types';

let syncDebounceTimer: NodeJS.Timeout | null = null;
let realtimeChannel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
let lastLocalWriteTimestamp = 0;

export async function deleteCloudRecord(tableName: string, id: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return;
  lastLocalWriteTimestamp = Date.now();

  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
    if (error) {
      console.error(`[Supabase Delete] Error deleting from ${tableName}:`, error.message);
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

  // Subscribe to Zustand store changes to automatically push to Supabase
  useStepwiseStore.subscribe((state) => {
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      syncCurrentStateToCloud(state);
    }, 1200);
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
        id: s.id,
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
        id: j.id,
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
      id: pr.id,
      exercise: pr.exercise || 'Bench Press',
      weight_kg: Number(pr.weight ?? pr.weight_kg ?? 0),
      reps: Number(pr.reps ?? 1),
      date: pr.date || new Date().toISOString().split('T')[0],
      notes: pr.notes || '',
    }));

    // 4. Transform Revision Matrix
    const transformedRevision: ChapterRevisionItem[] = (revisionMatrix || []).map((r) => ({
      id: r.id,
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
      id: p.id,
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
      id: t.id,
      name: t.name || '',
      category: t.category || 'Frontend & UI',
      proficiency: t.proficiency || 'Learning',
      notes: t.notes || '',
    }));

    // 7. Transform Daily Fitness Logs
    const transformedFitness: DailyFitnessLog[] = (dailyFitnessLogs || []).map((f) => ({
      id: f.id,
      date: f.date || new Date().toISOString().split('T')[0],
      steps: Number(f.steps || 0),
      calories: Number(f.calories || 0),
      protein: Number(f.protein || 0),
      created_at: f.created_at || new Date().toISOString(),
    }));

    // 8. Transform Lecture Logs
    const transformedLectureLogs: LectureLog[] = (lectureLogs || []).map((l) => ({
      id: l.id,
      subject_id: l.subject_id,
      date: l.date || l.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      hours: Number(l.hours || 0),
      remarks: l.remarks || 'Study session logged',
      created_at: l.created_at || new Date().toISOString(),
    }));

    // 9. Transform Roadmap Goals
    const transformedRoadmap: RoadmapItem[] = (roadmap || []).map((r) => ({
      id: r.id,
      month: r.month || 'August 2026',
      week_number: Number(r.week_number || 1),
      goal: r.goal || '',
      priority: (r.priority || 'medium') as 'low' | 'medium' | 'high',
      completed: !!r.completed,
    }));

    // 10. Reconstruct Event Stream feed from fetched records so Event Bus stream is never empty
    const reconstructedEvents: AppEvent[] = [];
    transformedLectureLogs.forEach((l) => {
      const sub = transformedSubjects.find((s) => s.id === l.subject_id);
      reconstructedEvents.push({
        id: 'evt_lec_' + l.id,
        type: 'LECTURE_LOGGED',
        payload: l,
        timestamp: l.created_at,
        xpEarned: Math.round(l.hours * 10),
        description: `Logged ${l.hours} hrs for ${sub ? sub.title : 'Study Subject'}`,
      });
    });

    transformedFitness.forEach((f) => {
      reconstructedEvents.push({
        id: 'evt_fit_' + f.id,
        type: 'FITNESS_LOGGED',
        payload: f,
        timestamp: f.created_at,
        xpEarned: 25,
        description: `Logged fitness stats (${f.steps} steps, ${f.protein}g protein)`,
      });
    });

    // Sort events newest first
    reconstructedEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Hydrate store state with transformed database records
    useStepwiseStore.setState((state) => ({
      userStats: {
        ...state.userStats,
        level: profile?.level ?? state.userStats.level,
        xp: profile?.xp ?? state.userStats.xp,
        streak: profile?.streak ?? state.userStats.streak,
      },
      subjects: transformedSubjects.length > 0 ? transformedSubjects : state.subjects,
      japaneseResources: transformedJp.length > 0 ? transformedJp : state.japaneseResources,
      dailyFitnessLogs: transformedFitness.length > 0 ? transformedFitness : state.dailyFitnessLogs,
      prRecords: transformedPRs.length > 0 ? transformedPRs : state.prRecords,
      projects: transformedProjects.length > 0 ? transformedProjects : state.projects,
      techStack: transformedTech.length > 0 ? transformedTech : state.techStack,
      revisionMatrix: transformedRevision.length > 0 ? transformedRevision : state.revisionMatrix,
      lectureLogs: transformedLectureLogs.length > 0 ? transformedLectureLogs : state.lectureLogs,
      roadmap: transformedRoadmap.length > 0 ? transformedRoadmap : state.roadmap,
      recentEvents:
        reconstructedEvents.length > 0
          ? reconstructedEvents.slice(0, 50)
          : state.recentEvents,
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
  state: ReturnType<typeof useStepwiseStore.getState>
): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return []; // Only sync if logged in

  const userId = user.id;
  lastLocalWriteTimestamp = Date.now();
  const syncErrors: string[] = [];

  try {
    // 1. Sync User Stats Profile
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

    // 2. Sync Projects
    if (state.projects?.length) {
      const projectPayloads = state.projects.map((p) => ({
        id: p.id,
        user_id: userId,
        title: p.title,
        description: p.description,
        category: p.category,
        progress: p.progress,
        github: p.github,
        status: p.status,
        tech_stack: p.tech_stack || [],
        updated_at: new Date().toISOString(),
      }));
      const { error: projErr } = await supabase.from('projects').upsert(projectPayloads);
      if (projErr) {
        console.error('[Supabase Push] Projects error:', projErr.message);
        syncErrors.push(`projects: ${projErr.message}`);
      }
    }

    // 3. Sync Tech Stack
    if (state.techStack?.length) {
      const techPayloads = state.techStack.map((t) => ({
        id: t.id,
        user_id: userId,
        name: t.name,
        category: t.category,
        proficiency: t.proficiency,
        notes: t.notes,
      }));
      const { error: techErr } = await supabase.from('tech_stack').upsert(techPayloads);
      if (techErr) {
        console.error('[Supabase Push] Tech stack error:', techErr.message);
        syncErrors.push(`tech_stack: ${techErr.message}`);
      }
    }

    // 4. Sync Subjects
    if (state.subjects?.length) {
      const subjectPayloads = state.subjects.map((s) => ({
        id: s.id,
        user_id: userId,
        title: s.title,
        track: s.track,
        hours_target: s.hours_target,
        hours_completed: s.hours_completed,
      }));
      const { error: subErr } = await supabase.from('subjects').upsert(subjectPayloads);
      if (subErr) {
        console.error('[Supabase Push] Subjects error:', subErr.message);
        syncErrors.push(`subjects: ${subErr.message}`);
      }
    }

    // 5. Sync Revision Matrix
    if (state.revisionMatrix?.length) {
      const revisionPayloads = state.revisionMatrix.map((r) => ({
        id: r.id,
        user_id: userId,
        subject: r.subject,
        chapter: r.chapter,
        track: r.category,
        revision1: !!r.checkpoints?.rev1,
        revision2: !!r.checkpoints?.rev2,
        revision3: !!r.checkpoints?.rev3,
        pyqs_done: !!r.checkpoints?.pyq1,
        notes_done: !!r.checkpoints?.short_notes,
      }));
      const { error: revErr } = await supabase.from('revision_matrix').upsert(revisionPayloads);
      if (revErr) {
        console.error('[Supabase Push] Revision matrix error:', revErr.message);
        syncErrors.push(`revision_matrix: ${revErr.message}`);
      }
    }

    // 6. Sync Japanese Resources
    if (state.japaneseResources?.length) {
      const jpPayloads = state.japaneseResources.map((j) => ({
        id: j.id,
        user_id: userId,
        title: j.title,
        type: j.resource_type,
        episodes_or_chapters: j.target,
        completed: j.completed,
        hours_spent: j.completed,
        level: j.level,
      }));
      const { error: jpErr } = await supabase.from('japanese_resources').upsert(jpPayloads);
      if (jpErr) {
        console.error('[Supabase Push] Japanese error:', jpErr.message);
        syncErrors.push(`japanese_resources: ${jpErr.message}`);
      }
    }

    // 7. Sync Daily Fitness Logs
    if (state.dailyFitnessLogs?.length) {
      const fitnessPayloads = state.dailyFitnessLogs.map((f) => ({
        id: f.id,
        user_id: userId,
        date: f.date,
        steps: f.steps,
        calories: f.calories,
        protein: f.protein,
      }));
      const { error: fitErr } = await supabase.from('daily_fitness_logs').upsert(fitnessPayloads);
      if (fitErr) {
        console.error('[Supabase Push] Fitness error:', fitErr.message);
        syncErrors.push(`daily_fitness_logs: ${fitErr.message}`);
      }
    }

    // 8. Sync PR Records
    if (state.prRecords?.length) {
      const prPayloads = state.prRecords.map((pr) => ({
        id: pr.id,
        user_id: userId,
        exercise: pr.exercise,
        weight: pr.weight_kg,
        reps: pr.reps,
        date: pr.date,
        notes: pr.notes,
      }));
      const { error: prErr } = await supabase.from('pr_records').upsert(prPayloads);
      if (prErr) {
        console.error('[Supabase Push] PR records error:', prErr.message);
        syncErrors.push(`pr_records: ${prErr.message}`);
      }
    }

    // 9. Sync Lecture Logs
    if (state.lectureLogs?.length) {
      const logPayloads = state.lectureLogs.map((l) => ({
        id: l.id,
        user_id: userId,
        subject_id: l.subject_id,
        hours: l.hours,
        remarks: l.remarks,
        created_at: l.created_at || new Date().toISOString(),
      }));
      const { error: lecErr } = await supabase.from('lecture_logs').upsert(logPayloads);
      if (lecErr) {
        console.error('[Supabase Push] Lecture logs error:', lecErr.message);
        syncErrors.push(`lecture_logs: ${lecErr.message}`);
      }
    }

    // 10. Sync Roadmap Goals
    if (state.roadmap?.length) {
      const roadmapPayloads = state.roadmap.map((r) => ({
        id: r.id,
        user_id: userId,
        month: r.month,
        week_number: r.week_number,
        goal: r.goal,
        priority: r.priority,
        completed: r.completed,
      }));
      const { error: rmErr } = await supabase.from('roadmap').upsert(roadmapPayloads);
      if (rmErr) {
        console.error('[Supabase Push] Roadmap error:', rmErr.message);
        syncErrors.push(`roadmap: ${rmErr.message}`);
      }
    }
  } catch (err: unknown) {
    console.error('[Supabase Push] Error syncing store state to Supabase:', err);
    syncErrors.push((err as Error).message || 'Unknown sync error');
  }

  return syncErrors;
}
