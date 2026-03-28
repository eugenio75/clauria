
CREATE POLICY "Users can delete own profile"
ON public.intus_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can delete own context"
ON public.intus_context
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
