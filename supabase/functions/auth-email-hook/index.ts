import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailHookPayload {
  user: {
    email: string;
  };
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

function getSubject(actionType: string): string {
  switch (actionType) {
    case "signup":
      return "CLAURIA — Conferma la tua email";
    case "magiclink":
      return "CLAURIA — Il tuo codice di accesso";
    case "recovery":
      return "CLAURIA — Reimposta la password";
    case "email_change":
      return "CLAURIA — Conferma cambio email";
    case "reauthentication":
      return "CLAURIA — Codice di verifica";
    default:
      return "CLAURIA — Codice di verifica";
  }
}

function getEmailBody(actionType: string, token: string): string {
  const code = token;

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f3ef;font-family:'Georgia','Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ef;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="420" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:28px;color:#6b8cae;">✦</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:22px;font-weight:normal;letter-spacing:2px;color:#2d2d2d;">CLAURIA</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;color:#8a8a8a;font-style:italic;">Non sei solo.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <p style="margin:0;font-size:15px;color:#555555;line-height:1.7;">
                ${actionType === "magiclink" || actionType === "signup"
                  ? "Ecco il tuo codice di accesso:"
                  : actionType === "recovery"
                  ? "Ecco il tuo codice per reimpostare la password:"
                  : "Ecco il tuo codice di verifica:"}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="font-size:32px;letter-spacing:8px;font-family:monospace;color:#2d2d2d;background-color:#f5f3ef;border-radius:12px;padding:16px 24px;display:inline-block;">
                ${code}
              </div>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.6;">
                Il codice scade tra 10 minuti.<br>
                Se non hai richiesto questo codice, ignora questa email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.hostinger.com";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const smtpUsername = Deno.env.get("SMTP_USERNAME") || "";
    const smtpPassword = Deno.env.get("SMTP_PASSWORD") || "";
    const smtpFrom = Deno.env.get("SMTP_FROM") || "CLAURIA <noreply@tenks.co>";

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUsername,
          password: smtpPassword,
        },
      },
    });

    await client.send({
      from: smtpFrom,
      to: user.email,
      subject: getSubject(actionType),
      content: "auto",
      html: getEmailBody(actionType, token),
    });

    await client.close();

    console.log(`Email sent to ${user.email} for action: ${actionType}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SMTP send error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
