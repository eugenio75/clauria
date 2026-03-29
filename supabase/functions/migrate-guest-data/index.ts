import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { anonUserId, newUserId } = await req.json();

    if (!anonUserId || !newUserId || anonUserId === newUserId) {
      return new Response(
        JSON.stringify({ error: "Invalid parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Copy intus_profiles
    const { data: anonProfile } = await supabase
      .from("intus_profiles")
      .select("*")
      .eq("id", anonUserId)
      .single();

    if (anonProfile) {
      // Check if new user already has a profile
      const { data: existingProfile } = await supabase
        .from("intus_profiles")
        .select("id")
        .eq("id", newUserId)
        .single();

      if (!existingProfile) {
        const { id: _id, created_at: _ca, ...profileData } = anonProfile;
        await supabase.from("intus_profiles").insert({
          id: newUserId,
          ...profileData,
        });
      }

      // Delete anon profile
      await supabase.from("intus_profiles").delete().eq("id", anonUserId);
    }

    // 2. Copy intus_context
    const { data: anonContext } = await supabase
      .from("intus_context")
      .select("*")
      .eq("user_id", anonUserId)
      .single();

    if (anonContext) {
      const { data: existingContext } = await supabase
        .from("intus_context")
        .select("id")
        .eq("user_id", newUserId)
        .single();

      if (!existingContext) {
        const { id: _id, user_id: _uid, ...contextData } = anonContext;
        await supabase.from("intus_context").insert({
          user_id: newUserId,
          ...contextData,
        });
      }

      // Delete anon context
      await supabase.from("intus_context").delete().eq("user_id", anonUserId);
    }

    console.log(`Migrated guest data from ${anonUserId} to ${newUserId}`);

    return new Response(
      JSON.stringify({ success: true, hadProfile: !!anonProfile, hadContext: !!anonContext }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("migrate-guest-data error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
