import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAG_URL = Deno.env.get("AZAR_RAG_URL") || "http://209.38.69.178:8000";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, userId, conversationId } = body;

    // Extract last user message
    const lastUserMsg = Array.isArray(messages)
      ? [...messages].reverse().find((m: any) => m?.role === "user")
      : null;
    const userMessage =
      typeof lastUserMsg?.content === "string"
        ? lastUserMsg.content
        : body.user_message || "";

    const convId = conversationId || userId || "anonymous";

    const response = await fetch(`${RAG_URL}/orchestrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: convId,
        user_id: userId,
        user_message: userMessage,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Azar server error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        answer: data.answer,
        message: data.answer,
        content: data.answer,
        reply: data.answer,
        text: data.answer,
        response: data.answer,
        messages: [{ role: "assistant", content: data.answer }],
        meta: data.meta,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("intus-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
