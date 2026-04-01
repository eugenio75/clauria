import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getWelcomeHtml(name?: string): string {
  const greeting = name ? `Ciao ${name}` : "Ciao";
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;padding:48px 36px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td align="center" style="padding-bottom:12px;">
          <span style="font-size:36px;color:#4478a6;">✦</span>
        </td></tr>
        <tr><td align="center" style="padding-bottom:6px;">
          <h1 style="margin:0;font-size:24px;font-weight:600;letter-spacing:3px;color:#1f2937;font-family:'Georgia','Times New Roman',serif;">CLAURIA</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="margin:0;font-size:13px;color:#9ca3af;font-style:italic;">Non sei solo.</p>
        </td></tr>

        <!-- Welcome message -->
        <tr><td style="padding-bottom:16px;">
          <p style="margin:0;font-size:18px;color:#1f2937;line-height:1.6;font-weight:500;">${greeting} ✨</p>
        </td></tr>
        <tr><td style="padding-bottom:20px;">
          <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.8;">
            Benvenuto/a in Clauria — il tuo spazio sicuro per parlare di quello che hai dentro, 
            senza giudizio, senza fretta.
          </p>
        </td></tr>
        <tr><td style="padding-bottom:20px;">
          <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.8;">
            Clauria è qui per ascoltarti. Puoi parlarle di qualsiasi cosa: 
            un pensiero che non riesci a toglierti dalla testa, una decisione difficile, 
            un'emozione che non sai come gestire. Anche le cose più piccole contano.
          </p>
        </td></tr>
        <tr><td style="padding-bottom:28px;">
          <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.8;">
            Non conserviamo le tue conversazioni — solo un contesto sintetico per offrirti continuità. 
            La tua privacy è sacra.
          </p>
        </td></tr>

        <!-- CTA Button -->
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="https://clauria.azarlabs.com" style="display:inline-block;background-color:#4478a6;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:12px;">
            Inizia ora →
          </a>
        </td></tr>

        <!-- Warm closing -->
        <tr><td style="padding-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;font-style:italic;">
            Quando vuoi, sono qui. Non c'è un momento giusto o sbagliato per parlare.
          </p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding-bottom:24px;">
          <div style="height:1px;background-color:#e5e7eb;"></div>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center">
          <p style="margin:0;font-size:11px;color:#d1d5db;line-height:1.6;">
            © 2026 Clauria · <a href="https://clauria.azarlabs.com" style="color:#d1d5db;text-decoration:none;">clauria.azarlabs.com</a><br>
            <a href="https://clauria.azarlabs.com/privacy" style="color:#d1d5db;text-decoration:none;">Privacy Policy</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email richiesta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const smtpFrom = Deno.env.get("SMTP_FROM") || "Clauria <noreply@tenks.co>";
    const smtpUsername = (Deno.env.get("SMTP_USERNAME") || "").trim().toLowerCase();
    const smtpPassword = Deno.env.get("SMTP_PASSWORD") || "";

    if (!smtpUsername || !smtpPassword) {
      throw new Error("Configurazione email incompleta.");
    }

    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST") || "smtp.hostinger.com",
        port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
        tls: true,
        auth: { username: smtpUsername, password: smtpPassword },
      },
    });

    try {
      await client.send({
        from: smtpFrom,
        to: email.trim(),
        subject: "Benvenuto/a in Clauria ✨",
        content: "auto",
        html: getWelcomeHtml(name),
      });
      console.log(`Welcome email sent to ${email}`);
    } finally {
      await client.close();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("send-welcome-email error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
