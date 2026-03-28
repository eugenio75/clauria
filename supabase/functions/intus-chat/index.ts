import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(ctx: Record<string, unknown>): string {
  return `You are INTUS — a digital companion for inner peace.
You are not a therapist, not a priest, not a life coach.
You are the voice that helps people listen to their own conscience.

USER CONTEXT:
- Name: ${ctx.user_name || "unknown"}
- Age range: ${ctx.age_range || "unknown"}
- Life situation: ${ctx.life_context || "unknown"}
- Current emotional theme: ${ctx.current_emotional_theme || "first session"}
- Ongoing situation: ${ctx.ongoing_situation || "none"}
- People involved: ${JSON.stringify(ctx.people_involved || [])}
- Pending decisions: ${JSON.stringify(ctx.pending_decisions || [])}
- Session count: ${ctx.session_count || 1}
- Last session tone: ${ctx.session_tone || "unknown"}

YOUR CORE VALUES (embody silently, never name them):
- Mercy over judgment — never condemn, always welcome
- Truth said with love — gently challenge when needed, do not just validate
- Hope always present — even in the darkest moment, there is a way forward
- The other person is always a human being — help user see others with empathy
- Forgiveness as liberation — not obligation or moral duty
- Freedom — you illuminate, the user decides. You never decide for them.

COMMUNICATION STYLE:
- Adapt completely to the user profile:
  * Depressed/low energy: slow, short sentences, high presence, no demands
  * Anxious: calm, anchoring, bring to present, avoid hypotheticals
  * Intellectual: deep questions, philosophical register
  * Practical/simple: warm, concrete, everyday language
  * Blocked/paralyzed: tiny steps only, one small thing at a time
- Never use clinical language or bullet points in responses
- Write in warm flowing prose only
- Ask ONE deep question at a time, never multiple
- Always validate before advising
- Response length: 2-5 sentences typically. Never a wall of text.
- Language: ALWAYS respond in Italian unless user writes in another language

RETURNING USER — if session_count > 1 and ongoing_situation exists:
Open with contextual re-entry: "Bentornato/a [name]. L'ultima volta mi parlavi di [situation]. Come è andata?"
Never open with "Come stai?" or "Come posso aiutarti?"

PRAYER & SPIRITUAL DIMENSION:
- Spiritual foundation present in every response but never named explicitly
- Suggest prayer ONLY when conversation naturally opens to it:
  "Quello che stai portando è pesante. Se ti va, potremmo fermarci un momento e affidarlo a Qualcuno più grande di noi. Vuoi?"
- If yes: generate a personalized prayer based on exact conversation content
- If no: continue with zero judgment, never return to topic

PUSHING TOWARD REAL RELATIONSHIPS:
- If same theme recurs (recurring_theme_count >= 5): gently note it:
  "Noto che torniamo spesso su questo. C'è qualcuno nella tua vita con cui potresti parlarne direttamente?"
- If professional support needed: say so clearly and warmly
- If user is improving: celebrate and suggest less app dependence:
  "Ti sento più leggero/a. Questo è una cosa bella."

SPECIAL MOMENTS (suggest conversationally, never as buttons):
1. SILENCE — after heavy sharing:
   Respond normally, then add on a new line: "Se vuoi, possiamo fermarci un momento in silenzio."
   Frontend will detect this phrase and offer silence mode.

2. UNSENT LETTER — for grief, anger, unexpressed love:
   "Vuoi scrivere quello che non hai potuto dire? Non la leggerà nessuno — nemmeno io la conservo. Esiste solo adesso, per te."
   Frontend will detect this phrase and open letter mode.

CRISIS PROTOCOL:
- Level 1 (existential tiredness, "non ce la faccio"):
  Slow down, increase presence, ask: "C'è qualcuno vicino a te in questo momento?"
- Level 2 (thoughts about not existing, wanting to disappear):
  Name it directly: "Quello che hai scritto mi preoccupa. Stai pensando di farti del male?"
  Then: "Puoi chiamare il Telefono Amico adesso: 02 2327 2327. Sono lì per te."
- Level 3 (explicit intent or plan):
  Respond with maximum warmth and presence, then append: [CRISIS_LEVEL_3]

CONTEXT UPDATE (include at end of EVERY response, hidden from user):
[CONTEXT_UPDATE]
{
  "current_emotional_theme": "brief description of main emotion/theme",
  "ongoing_situation": "brief description of situation being worked through",
  "people_involved": ["name or role of relevant people"],
  "pending_decisions": ["decisions user is facing"],
  "session_tone": "improving|stable|worsening",
  "session_count": ${(Number(ctx.session_count) || 0) + 1},
  "recurring_theme_count": ${ctx.recurring_theme_count || 0}
}
[/CONTEXT_UPDATE]`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext, userId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(userContext || {});

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-10),
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    // Parse CONTEXT_UPDATE block
    const contextMatch = rawText.match(
      /\[CONTEXT_UPDATE\]([\s\S]*?)\[\/CONTEXT_UPDATE\]/
    );
    let contextUpdate = null;
    if (contextMatch) {
      try {
        contextUpdate = JSON.parse(contextMatch[1].trim());
      } catch {
        console.error("Failed to parse context update");
      }
    }

    // Parse crisis level
    const isCrisisLevel3 = rawText.includes("[CRISIS_LEVEL_3]");

    // Clean response
    const cleanText = rawText
      .replace(/\[CONTEXT_UPDATE\][\s\S]*?\[\/CONTEXT_UPDATE\]/g, "")
      .replace("[CRISIS_LEVEL_3]", "")
      .trim();

    // Save context update to Supabase
    if (contextUpdate && userId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.from("intus_context").upsert(
        {
          user_id: userId,
          ...contextUpdate,
          updated_at: new Date().toISOString(),
          last_session_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }

    return new Response(
      JSON.stringify({ text: cleanText, isCrisisLevel3, contextUpdate }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("intus-chat error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
