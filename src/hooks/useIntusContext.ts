import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/runtime-client";

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
  daily_mood?: number;
  mood_history?: Array<{ date: string; mood: number }>;
  active_companion?: string;
  session_history?: Array<{
    date: string;
    summary: string;
    step_proposed?: string;
    step_accepted?: boolean | null;
    theme?: string;
  }>;
}

// Module-level conversation id: fresh on every page load (NOT persisted across sessions).
// This guarantees the backend treats each page load as a new conversation, so a returning
// user (or a user who reset memory) does not accidentally re-load stale Supabase history.
let CURRENT_CONVERSATION_ID = crypto.randomUUID();

export function getConversationId(): string {
  return CURRENT_CONVERSATION_ID;
}

export function regenerateConversationId(): string {
  CURRENT_CONVERSATION_ID = crypto.randomUUID();
  return CURRENT_CONVERSATION_ID;
}

export function useIntusContext() {
  const loadContext = useCallback(async (userId: string): Promise<IntusUserContext> => {
    const [{ data: profile }, { data: context }] = await Promise.all([
      supabase.from("intus_profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("intus_context").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    return { ...(profile ?? {}), ...(context ?? {}) } as unknown as IntusUserContext;
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
    // After wiping server-side memory, force a brand-new conversation id so the
    // RAG backend doesn't reload the old conversation on the next message.
    regenerateConversationId();
  }, []);

  return { loadContext, saveProfile, resetContext, getConversationId, regenerateConversationId };
}
