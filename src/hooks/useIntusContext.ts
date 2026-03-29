import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IntusUserContext {
  user_name?: string;
  age_range?: string;
  life_context?: string;
  current_emotional_theme?: string;
  ongoing_situation?: string;
  people_involved?: string[];
  pending_decisions?: string[];
  session_tone?: string;
  session_count?: number;
  last_session_at?: string;
  recurring_theme_count?: number;
  step_proposed?: string;
  step_accepted?: boolean | null;
  next_session_hook?: string;
  session_summary?: string;
  session_history?: Array<{
    date: string;
    summary: string;
    step_proposed?: string;
    step_accepted?: boolean | null;
    theme?: string;
  }>;
}

export function useIntusContext() {
  const loadContext = useCallback(async (userId: string): Promise<IntusUserContext> => {
    const [{ data: profile }, { data: context }] = await Promise.all([
      supabase.from("intus_profiles").select("*").eq("id", userId).single(),
      supabase.from("intus_context").select("*").eq("user_id", userId).single(),
    ]);

    return { ...profile, ...context } as unknown as IntusUserContext;
  }, []);

  const saveProfile = useCallback(async (userId: string, profile: {
    name: string;
    ageRange: string;
    lifeContext: string;
  }) => {
    await supabase.from("intus_profiles").upsert({
      id: userId,
      user_name: profile.name,
      age_range: profile.ageRange,
      life_context: profile.lifeContext,
      onboarding_complete: true,
    });

    await supabase.from("intus_context").upsert(
      {
        user_id: userId,
        session_count: 1,
        last_session_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }, []);

  const resetContext = useCallback(async (userId: string) => {
    await Promise.all([
      supabase.from("intus_profiles").delete().eq("id", userId),
      supabase.from("intus_context").delete().eq("user_id", userId),
    ]);
  }, []);

  return { loadContext, saveProfile, resetContext };
}
