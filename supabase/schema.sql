-- ========================================================
-- STEPWISE OS - SUPABASE POSTGRESQL SCHEMA WITH RLS
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Tied to Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  streak INT DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. SUBJECTS TABLE (GATE CS & DA)
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  track TEXT,
  hours_target INT NOT NULL DEFAULT 40,
  hours_completed NUMERIC DEFAULT 0,
  pyq_target INT DEFAULT 100,
  pyq_completed INT DEFAULT 0,
  revision_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subjects"
  ON public.subjects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 3. REVISION MATRIX TABLE
CREATE TABLE IF NOT EXISTS public.revision_matrix (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  track TEXT NOT NULL,
  revision1 BOOLEAN DEFAULT FALSE,
  revision2 BOOLEAN DEFAULT FALSE,
  revision3 BOOLEAN DEFAULT FALSE,
  pyqs_done BOOLEAN DEFAULT FALSE,
  notes_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.revision_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own revision matrix"
  ON public.revision_matrix FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 4. JAPANESE RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.japanese_resources (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  episodes_or_chapters INT NOT NULL DEFAULT 1,
  completed INT NOT NULL DEFAULT 0,
  hours_spent NUMERIC NOT NULL DEFAULT 0,
  level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.japanese_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own japanese resources"
  ON public.japanese_resources FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 5. DAILY FITNESS LOGS TABLE
CREATE TABLE IF NOT EXISTS public.daily_fitness_logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INT DEFAULT 0,
  calories INT DEFAULT 0,
  protein INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.daily_fitness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own fitness logs"
  ON public.daily_fitness_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 6. PR RECORDS TABLE (Personal Records)
CREATE TABLE IF NOT EXISTS public.pr_records (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  reps INT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pr_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own PR records"
  ON public.pr_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 7. PROJECTS SHOWCASE TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  github TEXT,
  status TEXT CHECK (status IN ('planning', 'in_progress', 'completed')),
  tech_stack TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 8. TECH STACK MATRIX TABLE
CREATE TABLE IF NOT EXISTS public.tech_stack (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tech stack"
  ON public.tech_stack FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 9. LECTURE LOGS TABLE (Study Sessions)
CREATE TABLE IF NOT EXISTS public.lecture_logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  topic_id TEXT,
  hours NUMERIC NOT NULL DEFAULT 0,
  remarks TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lecture_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lecture logs"
  ON public.lecture_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 10. ROADMAP GOALS TABLE (Monthly / Weekly Goals)
CREATE TABLE IF NOT EXISTS public.roadmap (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  week_number INT NOT NULL DEFAULT 1,
  goal TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.roadmap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own roadmap"
  ON public.roadmap FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
