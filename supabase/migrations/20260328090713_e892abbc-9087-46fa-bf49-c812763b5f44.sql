CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_otp_codes_email_code ON public.otp_codes (email, code);

-- Allow edge functions (service role) to manage, deny direct client access
CREATE POLICY "No direct access" ON public.otp_codes FOR ALL USING (false);