import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateOTP(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

function getEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f3ef;font-family:'Georgia','Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ef;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="420" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td align="center" style="padding-bottom:24px;"><span style="font-size:28px;color:#6b8cae;">✦</span></td></tr>
        <tr><td align="center" style="padding-bottom:8px;"><h1 style="margin:0;font-size:22px;font-weight:normal;letter-spacing:2px;color:#2d2d2d;">CLAURIA</h1></td></tr>
        <tr><td align="center" style="padding-bottom:32px;"><p style="margin:0;font-size:14px;color:#8a8a8a;font-style:italic;">Non sei solo.</p></td></tr>
        <tr><td align="center" style="padding-bottom:16px;"><p style="margin:0;font-size:15px;color:#555555;line-height:1.7;">Ecco il tuo codice di accesso:</p></td></tr>
        <tr><td align="center" style="padding-bottom:32px;"><div style="font-size:32px;letter-spacing:8px;font-family:monospace;color:#2d2d2d;background-color:#f5f3ef;border-radius:12px;padding:16px 24px;display:inline-block;">${code}</div></td></tr>
        <tr><td align="center"><p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.6;">Il codice scade tra 10 minuti.<br>Se non hai richiesto questo codice, ignora questa email.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function extractEmailAddress(value?: string | null): string | null {
  if (!value) return null;

  const angleMatch = value.match(/<([^>]+)>/);
  if (angleMatch?.[1]?.includes("@")) {
    return angleMatch[1].trim().toLowerCase();
  }

  const plain = value.trim().toLowerCase();
  return plain.includes("@") ? plain : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email richiesta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Invalidate old codes for this email
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("email", email.trim().toLowerCase())
      .eq("used", false);

    // Store new code
    const { error: insertError } = await supabase.from("otp_codes").insert({
      email: email.trim().toLowerCase(),
      code,
      expires_at: expiresAt,
    });

    if (insertError) throw insertError;

    // Send via SMTP
    const smtpFrom = Deno.env.get("SMTP_FROM") || "CLAURIA <noreply@tenks.co>";
    const smtpUsernameRaw = (Deno.env.get("SMTP_USERNAME") || "").trim();
    const smtpUsername = smtpUsernameRaw.includes("@")
      ? smtpUsernameRaw.toLowerCase()
      : extractEmailAddress(smtpFrom) || smtpUsernameRaw;
    const smtpPassword = Deno.env.get("SMTP_PASSWORD") || "";

    if (!smtpUsername || !smtpPassword) {
      throw new Error("Configurazione email incompleta. Verifica SMTP_USERNAME e SMTP_PASSWORD.");
    }

    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST") || "smtp.hostinger.com",
        port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
        tls: true,
        auth: {
          username: smtpUsername,
          password: smtpPassword,
        },
      },
    });

    try {
      await client.send({
        from: smtpFrom,
        to: email.trim(),
        subject: "CLAURIA — Il tuo codice di accesso",
        content: "auto",
        html: getEmailHtml(code),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("535") || message.toLowerCase().includes("authentication failed")) {
        throw new Error("Autenticazione SMTP fallita. Verifica che l'utente SMTP sia l'indirizzo email completo della casella e che la password sia corretta.");
      }
      throw error;
    } finally {
      await client.close();
    }

    console.log(`OTP sent to ${email}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-login-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
