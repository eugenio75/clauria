-- Create intus_profiles table
CREATE TABLE public.intus_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  user_name text,
  age_range text,
  life_context text,
  onboarding_complete boolean DEFAULT false
);

-- Create intus_context table
CREATE TABLE public.intus_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  updated_at timestamptz DEFAULT now(),
  current_emotional_theme text,
  ongoing_situation text,
  people_involved jsonb DEFAULT '[]',
  pending_decisions jsonb DEFAULT '[]',
  session_tone text DEFAULT 'stable',
  session_count integer DEFAULT 0,
  recurring_theme_count integer DEFAULT 0,
  last_session_at timestamptz,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.intus_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intus_context ENABLE ROW LEVEL SECURITY;

-- RLS policies for intus_profiles
CREATE POLICY "Users can view own profile" ON public.intus_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.intus_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.intus_profiles FOR UPDATE USING (auth.uid() = id);

-- RLS policies for intus_context
CREATE POLICY "Users can view own context" ON public.intus_context FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own context" ON public.intus_context FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own context" ON public.intus_context FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for intus_context
CREATE TRIGGER update_intus_context_updated_at
  BEFORE UPDATE ON public.intus_context
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();