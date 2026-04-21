-- Pulizia utenti email maruca per ripartire pulito col nuovo flusso OTP
DO $$
DECLARE
  v_user_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO v_user_ids
  FROM auth.users
  WHERE email IN ('eu.maruca@gmail.com', 'e.maruca@outlook.com');

  IF v_user_ids IS NOT NULL THEN
    DELETE FROM public.messages WHERE conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = ANY(v_user_ids)
    );
    DELETE FROM public.conversations WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.intus_context WHERE user_id = ANY(v_user_ids);
    DELETE FROM public.intus_profiles WHERE id = ANY(v_user_ids);
    DELETE FROM auth.identities WHERE user_id = ANY(v_user_ids);
    DELETE FROM auth.users WHERE id = ANY(v_user_ids);
  END IF;
END $$;

-- Pulizia codici OTP vecchi per le stesse mail
DELETE FROM public.otp_codes WHERE email IN ('eu.maruca@gmail.com', 'e.maruca@outlook.com');