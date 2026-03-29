
ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS session_summary text;
ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS step_proposed text;
ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS step_accepted boolean;
ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS next_session_hook text;
ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS session_history jsonb DEFAULT '[]'::jsonb;
