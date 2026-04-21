
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  profile JSONB DEFAULT '{}',
  onboarding JSONB DEFAULT '{"step":0,"name_collected":false,"age_collected":false,"work_collected":false,"completed":false}',
  phase TEXT DEFAULT 'onboarding',
  distress JSONB DEFAULT '{}'
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.message_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  rating SMALLINT CHECK (rating IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON public.messages(conversation_id);
CREATE INDEX ON public.conversations(user_id);
CREATE INDEX ON public.conversations(guest_token);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users see own messages" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "service role full access conversations" ON public.conversations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service role full access messages" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service role full access feedback" ON public.message_feedback
  FOR ALL USING (true) WITH CHECK (true);
