import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useLanguage } from "../i18n/LanguageContext";

type AuthMode = "choose" | "email" | "otp";

interface LoginScreenProps {
  hasGuestSession?: boolean;
  onContinueAsGuest?: () => void;
}

const LoginScreen = ({ hasGuestSession = false, onContinueAsGuest }: LoginScreenProps) => {
  const [mode, setMode] = useState<AuthMode>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [inlineInfo, setInlineInfo] = useState<string | null>(null);
  const { t } = useLanguage();

  const clearMessages = () => {
    setInlineError(null);
    setInlineInfo(null);
  };

  const handleGuest = async () => {
    clearMessages();
    if (hasGuestSession) {
      onContinueAsGuest?.();
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      onContinueAsGuest?.();
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    clearMessages();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    clearMessages();
    try {
      const { error } = await supabase.functions.invoke("send-login-otp", {
        body: { email: email.trim() },
      });
      if (error) throw error;
      setMode("otp");
      setInlineInfo("Ti abbiamo inviato un codice a 6 cifre. Controlla la mail.");
    } catch (err) {
      console.error(err);
      setInlineError("Impossibile inviare il codice. Riprova tra poco.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    clearMessages();
    try {
      const { data, error } = await supabase.functions.invoke("verify-login-otp", {
        body: { email: email.trim(), code: otp.trim() },
      });
      if (error) throw error;
      if (!data?.tokenHash) throw new Error("Token mancante");

      // Verifica il token hash per creare la sessione
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: data.tokenHash,
        type: "magiclink",
      });
      if (verifyError) throw verifyError;

      // onAuthStateChange porterà l'utente in app
    } catch (err) {
      console.error(err);
      setInlineError("Codice non valido o scaduto.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp("");
    await handleSendOtp();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{
        background: "radial-gradient(ellipse at 30% 50%, hsl(38,60%,92%), hsl(215,40%,88%), hsl(38,35%,96%))",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[360px] space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <motion.span
            animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl text-trust-blue select-none block"
          >
            ✦
          </motion.span>
          <h1 className="font-display text-3xl tracking-wide text-foreground">CLAURIA</h1>
          <p className="font-display italic text-muted-foreground text-sm">{t("login_subtitle")}</p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            {t("login_safe_space")}
          </p>
        </div>

        {/* Auth card */}
        <div className="glass rounded-2xl px-5 py-6 space-y-4 shadow-lg">
          <p className="text-foreground text-[15px] leading-relaxed text-center" style={{ lineHeight: "1.8" }}>
            {t("login_access")}
          </p>

          {/* Inline messages */}
          <AnimatePresence>
            {inlineError && (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-center text-crisis-red/80 leading-relaxed"
              >
                {inlineError}
              </motion.p>
            )}
            {inlineInfo && (
              <motion.p
                key="info"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-center text-trust-blue/80 leading-relaxed"
              >
                {inlineInfo}
              </motion.p>
            )}
          </AnimatePresence>

          {mode === "choose" && (
            <div className="space-y-2.5">
              <button
                onClick={() => { setMode("email"); clearMessages(); }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-warm-amber text-primary-foreground rounded-xl py-3.5 text-[15px] font-medium transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                <span className="text-lg">✉️</span>
                {t("login_email")}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white/50 px-3 text-xs text-muted-foreground/50">{t("login_or")}</span>
                </div>
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-border/30 text-foreground rounded-xl py-3.5 text-[15px] font-medium transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {t("login_google")}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white/50 px-3 text-xs text-muted-foreground/50">{t("login_or")}</span>
                </div>
              </div>

              <button
                onClick={handleGuest}
                disabled={loading}
                className="w-full text-center text-sm text-muted-foreground/60 italic py-2 transition-opacity disabled:opacity-50"
              >
                {t("login_guest")}
              </button>
            </div>
          )}

          {mode === "email" && (
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                placeholder={t("login_email_placeholder")}
                autoFocus
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />
              <button
                onClick={handleSendOtp}
                disabled={loading || !email.trim()}
                className="w-full bg-warm-amber text-primary-foreground rounded-xl py-3.5 text-[15px] font-medium transition-opacity disabled:opacity-50 shadow-sm"
              >
                {loading ? t("login_sending") : "Invia codice"}
              </button>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => { setMode("choose"); clearMessages(); }}
                  className="text-xs text-muted-foreground/60 italic"
                >
                  {t("login_back")}
                </button>
              </div>
            </div>
          )}

          {mode === "otp" && (
            <div className="space-y-3">
              <p className="text-xs text-center text-muted-foreground/70 italic">
                Codice inviato a {email}
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); clearMessages(); }}
                placeholder="000000"
                autoFocus
                className="w-full text-center tracking-[0.5em] bg-transparent border-b-2 border-warm-amber/30 text-foreground text-2xl font-mono py-3 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/30"
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full bg-warm-amber text-primary-foreground rounded-xl py-3.5 text-[15px] font-medium transition-opacity disabled:opacity-50 shadow-sm"
              >
                {loading ? "Verifico..." : "Conferma"}
              </button>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => { setMode("email"); setOtp(""); clearMessages(); }}
                  className="text-xs text-muted-foreground/60 italic"
                >
                  ← Cambia email
                </button>
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-xs text-warm-amber italic disabled:opacity-50"
                >
                  Invia di nuovo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trust line */}
        <p className="text-center text-xs text-muted-foreground/40 italic">
          {t("login_privacy_line")}
        </p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
