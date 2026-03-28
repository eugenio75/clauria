ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS tone_history jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.intus_context ADD COLUMN IF NOT EXISTS improvement_detected boolean DEFAULT false;