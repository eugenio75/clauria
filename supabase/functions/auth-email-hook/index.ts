import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailHookPayload {
  user: { email: string };
  email_data: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type: string;
    site_url?: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

function emailTemplate(content: string): string {
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
        ${content}
        <!-- Footer -->
        <tr><td style="padding-top:24px;padding-bottom:0;">
          <div style="height:1px;background-color:#e5e7eb;"></div>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
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

function getSubjectAndBody(actionType: string, token: string): { subject: string; html: string } {
  switch (actionType) {
    case "signup":
      return {
        subject: "Clauria — Conferma la tua email",
        html: emailTemplate(`
          <tr><td align="center" style="padding-bottom:16px;">
            <p style="margin:0;font-size:16px;color:#374151;line-height:1.6;">Ciao 👋</p>
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.7;">Ecco il tuo codice per confermare la registrazione:</p>
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <div style="font-size:36px;letter-spacing:10px;font-family:'Courier New',monospace;font-weight:700;color:#1f2937;background-color:#f0f4f8;border-radius:12px;padding:20px 32px;display:inline-block;border:2px solid #e5e7eb;">${token}</div>
          </td></tr>
          <tr><td align="center" style="padding-bottom:16px;">
            <p style="margin:0;font-size:14px;color:#4478a6;font-weight:500;">⏱ Valido per 10 minuti</p>
          </td></tr>
          <tr><td align="center">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">🔒 Se non hai richiesto questo codice, ignora questa email.</p>
          </td></tr>
        `),
      };

    case "magiclink":
      return {
        subject: "Il tuo codice di accesso Clauria",
        html: emailTemplate(`
          <tr><td align="center" style="padding-bottom:16px;">
            <p style="margin:0;font-size:16px;color:#374151;line-height:1.6;">Ciao 👋</p>
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.7;">Ecco il tuo codice di accesso a Clauria:</p>
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <div style="font-size:36px;letter-spacing:10px;font-family:'Courier New',monospace;font-weight:700;color:#1f2937;background-color:#f0f4f8;border-radius:12px;padding:20px 32px;display:inline-block;border:2px solid #e5e7eb;">${token}</div>
          </td></tr>
          <tr><td align="center" style="padding-bottom:16px;">
            <p style="margin:0;font-size:14px;color:#4478a6;font-weight:500;">⏱ Valido per 10 minuti</p>
          </td></tr>
          <tr><td align="center">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">🔒 Se non hai richiesto questo codice, ignora questa email.</p>
          </td></tr>
        `),
      };

    case "recovery":
      return {
        subject: "Informazioni sul tuo account Clauria",
        html: emailTemplate(`
          <tr><td style="padding-bottom:16px;">
            <p style="margin:0;font-size:16px;color:#374151;line-height:1.6;">Ciao,</p>
          </td></tr>
          <tr><td style="padding-bottom:20px;">
            <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.8;">
              Abbiamo ricevuto una richiesta di accesso al tuo account Clauria. 
              Ecco il tuo codice di verifica:
            </p>
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <div style="font-size:36px;letter-spacing:10px;font-family:'Courier New',monospace;font-weight:700;color:#1f2937;background-color:#f0f4f8;border-radius:12px;padding:20px 32px;display:inline-block;border:2px solid #e5e7eb;">${token}</div>
          </td></tr>
          <tr><td style="padding-bottom:16px;">
            <p style="margin:0;font-size:14px;color:#4478a6;font-weight:500;">⏱ Valido per 10 minuti</p>
          </td></tr>
          <tr><td>
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.7;">
              🔒 Se non hai effettuato tu questa richiesta, non preoccuparti: il tuo account è al sicuro.<br>
              Per qualsiasi dubbio, scrivici a <a href="mailto:supporto@clauria.azarlabs.com" style="color:#4478a6;text-decoration:none;">supporto@clauria.azarlabs.com</a>
            </p>
          </td></tr>
        `),
      };

    case "email_change":
      return {
        subject: "Conferma il tuo nuovo indirizzo email",
        html: emailTemplate(`
          <tr><td style="padding-bottom:16px;">
            <p style="margin:0;font-size:16px;color:#374151;line-height:1.6;">Ciao,</p>
          </td></tr>
          <tr><td style="padding-bottom:20px;">
            <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.8;">
              Hai richiesto di cambiare il tuo indirizzo email su Clauria. 
              Usa questo codice per confermare:
            </p>
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <div style="font-size:36px;letter-spacing:10px;font-family:'Courier New',monospace;font-weight:700;color:#1f2937;background-color:#f0f4f8;border-radius:12px;padding:20px 32px;display:inline-block;border:2px solid #e5e7eb;">${token}</div>
          </td></tr>
          <tr><td style="padding-bottom:16px;">
            <p style="margin:0;font-size:14px;color:#ef4444;font-weight:500;">⚠ La conferma scade tra 24 ore</p>
          </td></tr>
          <tr><td>
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">🔒 Se non hai richiesto questo cambio, ignora questa email. Il tuo account resta invariato.</p>
          </td></tr>
        `),
      };

    default:
      return {
        subject: "Clauria — Codice di verifica",
        html: emailTemplate(`
          <tr><td align="center" style="padding-bottom:24px;">
            <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.7;">Ecco il tuo codice di verifica:</p>
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <div style="font-size:36px;letter-spacing:10px;font-family:'Courier New',monospace;font-weight:700;color:#1f2937;background-color:#f0f4f8;border-radius:12px;padding:20px 32px;display:inline-block;border:2px solid #e5e7eb;">${token}</div>
          </td></tr>
          <tr><td align="center">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">Il codice scade tra 10 minuti.</p>
          </td></tr>
        `),
      };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailHookPayload = await req.json();
    const { user, email_data } = payload;
    const token = email_data.token || "";
    const actionType = email_data.email_action_type || "magiclink";

    const { subject, html } = getSubjectAndBody(actionType, token);

    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST") || "smtp.hostinger.com",
        port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
        tls: true,
        auth: {
          username: (Deno.env.get("SMTP_USERNAME") || "").trim().toLowerCase(),
          password: Deno.env.get("SMTP_PASSWORD") || "",
        },
      },
    });

    await client.send({
      from: Deno.env.get("SMTP_FROM") || "Clauria <noreply@tenks.co>",
      to: user.email,
      subject,
      content: "auto",
      html,
    });

    await client.close();
    console.log(`Email sent to ${user.email} for action: ${actionType}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("auth-email-hook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
