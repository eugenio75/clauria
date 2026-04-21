import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/runtime-client";
import { useLanguage } from "../i18n/LanguageContext";

type AuthMode = "choose" | "signin" | "signup" | "forgot";

interface LoginScreenProps {
  hasGuestSession?: boolean;
  onContinueAsGuest?: () => void;
}

const LoginScreen = ({ hasGuestSession = false, onContinueAsGuest }: LoginScreenProps) => {
  const [mode, setMode] = useState<AuthMode>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [inlineInfo, setInlineInfo] = useState<string | null>(null);
  const { t } = useLanguage();

  const clearMessages = () => {
    setInlineError(null);
    setInlineInfo(null);
  };

  const resetForm = () => {
    setPassword("");
    setConfirmPassword("");
    clearMessages();
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
        options: { redirectTo: `${window.location.origin}/app` },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    clearMessages();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setInlineError("Devi prima confermare la tua email. Controlla la posta.");
        } else {
          setInlineError("Email o password non corretti.");
        }
        return;
      }
      // onAuthStateChange porterà l'utente in app
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password) return;
    if (password.length < 6) {
      setInlineError("La password deve avere almeno 6 caratteri.");
      return;
    }
    if (password !== confirmPassword) {
      setInlineError("Le password non coincidono.");
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) {
        if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("user already")) {
          setInlineError("Questa email è già registrata. Accedi con la tua password.");
        } else {
          setInlineError(error.message);
        }
        return;
      }
      if (data.user && !data.session) {
        setInlineInfo("Ti abbiamo inviato un'email per confermare il tuo account. Controlla la posta (anche lo spam).");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) return;
    setLoading(true);
    clearMessages();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setInlineInfo("Ti abbiamo inviato un link per reimpostare la password. Controlla la posta.");
    } catch (err) {
      console.error(err);
      setInlineError("Impossibile inviare l'email. Riprova tra poco.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6 overflow-y-auto py-8"
      style={{
        background: "radial-gradient(ellipse at 30% 50%, hsl(38,60%,92%), hsl(215,40%,88%), hsl(38,35%,96%))",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[360px] space-y-8 my-auto"
      >
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
          <p className="text-xs text-muted-foreground/50 mt-1">{t("login_safe_space")}</p>
        </div>

        <div className="glass rounded-2xl px-5 py-6 space-y-4 shadow-lg">
          <p className="text-foreground text-[15px] leading-relaxed text-center" style={{ lineHeight: "1.8" }}>
            {mode === "signup" ? "Crea il tuo account" :
             mode === "forgot" ? "Reimposta la password" :
             mode === "signin" ? "Bentornato" :
             t("login_access")}
          </p>

          <AnimatePresence>
            {inlineError && (
              <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="text-sm text-center text-crisis-red/80 leading-relaxed">
                {inlineError}
              </motion.p>
            )}
            {inlineInfo && (
              <motion.p key="info" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="text-sm text-center text-trust-blue/80 leading-relaxed">
                {inlineInfo}
              </motion.p>
            )}
          </AnimatePresence>

          {mode === "choose" && (
            <div className="space-y-2.5">
              <button
                onClick={() => { setMode("signin"); resetForm(); }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-warm-amber text-primary-foreground rounded-xl py-3.5 text-[15px] font-medium transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                <span className="text-lg">✉️</span>
                Accedi con email
              </button>

              <button
                onClick={() => { setMode("signup"); resetForm(); }}
                disabled={loading}
                className="w-full text-center text-sm text-warm-amber font-medium py-2"
              >
                Non hai un account? Registrati
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
                <div className="relative flex justify-center"><span className="bg-white/50 px-3 text-xs text-muted-foreground/50">{t("login_or")}</span></div>
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
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
                <div className="relative flex justify-center"><span className="bg-white/50 px-3 text-xs text-muted-foreground/50">{t("login_or")}</span></div>
              </div>

              <button onClick={handleGuest} disabled={loading}
                className="w-full text-center text-sm text-muted-foreground/60 italic py-2 transition-opacity disabled:opacity-50">
                {t("login_guest")}
              </button>
            </div>
          )}

          {mode === "signin" && (
            <div className="space-y-3">
              <input
                type="email" value={email} autoFocus
                onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                placeholder={t("login_email_placeholder")}
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
              />
              <input
                type="password" value={password}
                onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                placeholder="password"
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
              />
              <button
                onClick={handleSignIn} disabled={loading || !email.trim() || !password}
                className="w-full bg-warm-amber text-primary-foreground rounded-xl py-3.5 text-[15px] font-medium transition-opacity disabled:opacity-50 shadow-sm"
              >
                {loading ? "Accesso..." : "Accedi"}
              </button>
              <div className="flex items-center justify-between pt-1">
                <button onClick={() => { setMode("choose"); resetForm(); }}
                  className="text-xs text-muted-foreground/60 italic">
                  {t("login_back")}
                </button>
                <button onClick={() => { setMode("forgot"); resetForm(); }}
                  className="text-xs text-warm-amber italic">
                  Password dimenticata?
                </button>
              </div>
              <button onClick={() => { setMode("signup"); resetForm(); }}
                className="w-full text-center text-xs text-muted-foreground/70 pt-2">
                Non hai un account? <span className="text-warm-amber font-medium">Registrati</span>
              </button>
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-3">
              <input
                type="email" value={email} autoFocus
                onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                placeholder={t("login_email_placeholder")}
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
              />
              <input
                type="password" value={password}
                onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                placeholder="password (min. 6 caratteri)"
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
              />
              <input
                type="password" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                placeholder="conferma password"
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
              />
              <button
                onClick={handleSignUp} disabled={loading || !email.trim() || !password || !confirmPassword}
                className="w-full bg-warm-amber text-primary-foreground rounded-xl py-3.5 text-[15px] font-medium transition-opacity disabled:opacity-50 shadow-sm"
              >
                {loading ? "Registrazione..." : "Registrati"}
              </button>
              <div className="flex items-center justify-between pt-1">
                <button onClick={() => { setMode("choose"); resetForm(); }}
                  className="text-xs text-muted-foreground/60 italic">
                  {t("login_back")}
                </button>
                <button onClick={() => { setMode("signin"); resetForm(); }}
                  className="text-xs text-warm-amber italic">
                  Hai già un account? Accedi
                </button>
              </div>
            </div>
          )}

          {mode === "forgot" && (
            <div className="space-y-3">
              <p className="text-xs text-center text-muted-foreground/70 italic">
                Inserisci la tua email: ti invieremo un link per reimpostare la password.
              </p>
              <input
                type="email" value={email} autoFocus
                onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                placeholder={t("login_email_placeholder")}
                onKeyDown={(e) => e.key === "Enter" && handleForgot()}
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
              />
              <button
                onClick={handleForgot} disabled={loading || !email.trim()}
                className="w-full bg-warm-amber text-primary-foreground rounded-xl py-3.5 text-[15px] font-medium transition-opacity disabled:opacity-50 shadow-sm"
              >
                {loading ? "Invio..." : "Invia link di reset"}
              </button>
              <button onClick={() => { setMode("signin"); resetForm(); }}
                className="w-full text-center text-xs text-muted-foreground/60 italic pt-1">
                ← Torna ad accedi
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/40 italic">
          {t("login_privacy_line")}
        </p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
