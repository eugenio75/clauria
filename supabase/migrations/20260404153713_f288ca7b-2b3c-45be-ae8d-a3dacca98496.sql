ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS daily_mood integer;
ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS mood_history jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS active_companion text DEFAULT 'clauria';