import { createClient } from './client';
import { useStepwiseStore } from '@/store/useStepwiseStore';

let syncDebounceTimer: NodeJS.Timeout | null = null;

export async function initializeCloudSync() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    await fetchAndHydrateUserData(session.user.id);
  }

  // Subscribe to auth state changes
  supabase.auth.onAuthStateChange(async (event, currentSession) => {
    if (event === 'SIGNED_IN' && currentSession?.user) {
      await fetchAndHydrateUserData(currentSession.user.id);
    }
  });

  // Subscribe to Zustand store changes to automatically push to Supabase
  useStepwiseStore.subscribe((state) => {
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      syncCurrentStateToCloud(state);
    }, 1500); // Debounce 1.5 seconds to avoid spamming network requests
  });
}

export async function fetchAndHydrateUserData(userId: string) {
  const supabase = createClient();

  try {
    const [
      { data: profile },
      { data: subjects },
      { data: revisionMatrix },
      { data: japaneseResources },
      { data: dailyFitnessLogs },
      { data: prRecords },
      { data: projects },
      { data: techStack },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('subjects').select('*').eq('user_id', userId),
      supabase.from('revision_matrix').select('*').eq('user_id', userId),
      supabase.from('japanese_resources').select('*').eq('user_id', userId),
      supabase.from('daily_fitness_logs').select('*').eq('user_id', userId),
      supabase.from('pr_records').select('*').eq('user_id', userId),
      supabase.from('projects').select('*').eq('user_id', userId),
      supabase.from('tech_stack').select('*').eq('user_id', userId),
    ]);

    // Hydrate store state with database records if available
    useStepwiseStore.setState((state) => ({
      userStats: {
        ...state.userStats,
        level: profile?.level ?? state.userStats.level,
        xp: profile?.xp ?? state.userStats.xp,
        streak: profile?.streak ?? state.userStats.streak,
      },
      subjects: subjects && subjects.length > 0 ? subjects : state.subjects,
      revisionMatrix: revisionMatrix && revisionMatrix.length > 0 ? revisionMatrix : state.revisionMatrix,
      japaneseResources: japaneseResources && japaneseResources.length > 0 ? japaneseResources : state.japaneseResources,
      dailyFitnessLogs: dailyFitnessLogs && dailyFitnessLogs.length > 0 ? dailyFitnessLogs : state.dailyFitnessLogs,
      prRecords: prRecords && prRecords.length > 0 ? prRecords : state.prRecords,
      projects: projects && projects.length > 0 ? projects : state.projects,
      techStack: techStack && techStack.length > 0 ? techStack : state.techStack,
    }));
  } catch (err) {
    console.error('Error hydrating user data from Supabase:', err);
  }
}

export async function syncCurrentStateToCloud(state: ReturnType<typeof useStepwiseStore.getState>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return; // Only sync if logged in

  const userId = user.id;

  try {
    // 1. Sync User Stats Profile
    await supabase.from('profiles').upsert({
      id: userId,
      email: user.email,
      level: state.userStats.level,
      xp: state.userStats.xp,
      streak: state.userStats.streak,
      updated_at: new Date().toISOString(),
    });

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
      await supabase.from('projects').upsert(projectPayloads);
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
      await supabase.from('tech_stack').upsert(techPayloads);
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
      await supabase.from('subjects').upsert(subjectPayloads);
    }

    // 5. Sync Daily Fitness Logs
    if (state.dailyFitnessLogs?.length) {
      const fitnessPayloads = state.dailyFitnessLogs.map((f) => ({
        id: f.id,
        user_id: userId,
        date: f.date,
        steps: f.steps,
        calories: f.calories,
        protein: f.protein,
      }));
      await supabase.from('daily_fitness_logs').upsert(fitnessPayloads);
    }

    // 6. Sync PR Records
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
      await supabase.from('pr_records').upsert(prPayloads);
    }
  } catch (err) {
    console.error('Error syncing store state to Supabase:', err);
  }
}
