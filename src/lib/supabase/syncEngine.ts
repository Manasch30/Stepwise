import { createClient } from './client';
import { useStepwiseStore } from '@/store/useStepwiseStore';

export async function initializeCloudSync() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    await fetchAndHydrateUserData(session.user.id);
  }

  supabase.auth.onAuthStateChange(async (event, currentSession) => {
    if (event === 'SIGNED_IN' && currentSession?.user) {
      await fetchAndHydrateUserData(currentSession.user.id);
    }
  });
}

export async function fetchAndHydrateUserData(userId: string) {
  const supabase = createClient();

  try {
    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Fetch Projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    // 3. Fetch Tech Stack
    const { data: techStack } = await supabase
      .from('tech_stack')
      .select('*')
      .eq('user_id', userId);

    // Hydrate store if data exists
    if (profile || (projects && projects.length > 0)) {
      useStepwiseStore.setState((state) => ({
        userStats: {
          ...state.userStats,
          level: profile?.level || state.userStats.level,
          xp: profile?.xp || state.userStats.xp,
          streak: profile?.streak || state.userStats.streak,
        },
        projects: projects || state.projects,
        techStack: techStack || state.techStack,
      }));
    }
  } catch (err) {
    console.error('Error hydrating user cloud data:', err);
  }
}

export async function pushUserProjectToCloud(project: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  try {
    await supabase.from('projects').upsert({
      id: project.id,
      user_id: user.id,
      title: project.title,
      description: project.description,
      category: project.category,
      progress: project.progress,
      github: project.github,
      status: project.status,
      tech_stack: project.tech_stack,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error syncing project to cloud:', err);
  }
}
