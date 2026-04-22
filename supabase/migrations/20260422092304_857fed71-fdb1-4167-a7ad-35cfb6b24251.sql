DELETE FROM public.message_feedback WHERE conversation_id IN (SELECT id FROM public.conversations WHERE user_id='f66b760d-aa82-42c9-b13f-ad557dd2265d');
DELETE FROM public.messages WHERE conversation_id IN (SELECT id FROM public.conversations WHERE user_id='f66b760d-aa82-42c9-b13f-ad557dd2265d');
DELETE FROM public.conversations WHERE user_id='f66b760d-aa82-42c9-b13f-ad557dd2265d';
DELETE FROM public.intus_context WHERE user_id='f66b760d-aa82-42c9-b13f-ad557dd2265d';
DELETE FROM public.intus_profiles WHERE id='f66b760d-aa82-42c9-b13f-ad557dd2265d';