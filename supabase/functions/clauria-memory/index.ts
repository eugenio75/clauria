import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const {
      action,
      conversation_id,
      user_id,
      guest_token,
      memory,
      message,
    } = body as {
      action?: string;
      conversation_id?: string | null;
      user_id?: string | null;
      guest_token?: string | null;
      memory?: Record<string, unknown>;
      message?: { role?: string; content?: string; meta?: Record<string, unknown> };
    };

    if (!action || !["load", "save", "append_message"].includes(action)) {
      return json({ error: "Invalid or missing action" }, 400);
    }

    // -------- LOAD --------
    if (action === "load") {
      if (!user_id && !guest_token) {
        return json({ error: "user_id or guest_token required" }, 400);
      }

      let convo: any = null;

      if (user_id) {
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", user_id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        convo = data;
      } else if (guest_token) {
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("guest_token", guest_token)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        convo = data;
      }

      if (!convo) {
        const { data: created, error: createErr } = await supabase
          .from("conversations")
          .insert({
            user_id: user_id ?? null,
            guest_token: guest_token ?? null,
          })
          .select("*")
          .single();
        if (createErr) throw createErr;
        convo = created;
      }

      const { data: messages, error: msgErr } = await supabase
        .from("messages")
        .select("id, role, content, meta, created_at")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (msgErr) throw msgErr;

      return json({
        conversation_id: convo.id,
        memory: {
          profile: convo.profile ?? {},
          onboarding: convo.onboarding ?? {},
          phase: convo.phase ?? "onboarding",
          distress: convo.distress ?? {},
        },
        messages: (messages ?? []).reverse(),
      });
    }

    // -------- SAVE --------
    if (action === "save") {
      if (!conversation_id) {
        return json({ error: "conversation_id required" }, 400);
      }
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (memory && typeof memory === "object") {
        if ("profile" in memory) update.profile = memory.profile;
        if ("onboarding" in memory) update.onboarding = memory.onboarding;
        if ("phase" in memory) update.phase = memory.phase;
        if ("distress" in memory) update.distress = memory.distress;
      }
      const { error } = await supabase
        .from("conversations")
        .update(update)
        .eq("id", conversation_id);
      if (error) throw error;
      return json({ ok: true });
    }

    // -------- APPEND_MESSAGE --------
    if (action === "append_message") {
      if (!conversation_id) {
        return json({ error: "conversation_id required" }, 400);
      }
      if (!message || !message.role || !message.content) {
        return json({ error: "message.role and message.content required" }, 400);
      }
      if (!["user", "assistant"].includes(message.role)) {
        return json({ error: "Invalid message.role" }, 400);
      }
      const { data: inserted, error } = await supabase
        .from("messages")
        .insert({
          conversation_id,
          role: message.role,
          content: message.content,
          meta: message.meta ?? {},
        })
        .select("id")
        .single();
      if (error) throw error;

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation_id);

      return json({ ok: true, message_id: inserted.id });
    }

    return json({ error: "Unhandled action" }, 400);
  } catch (err) {
    console.error("clauria-memory error:", err);
    return json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      500
    );
  }
});
