import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLanguage } from "../i18n/LanguageContext";

type AuthStep = "choose" | "email" | "otp";

const LoginScreen = () => {
  const [step, setStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const { t } = useLanguage();

  const clearError = () => setInlineError(null);

  const handleGuest = async () => {
    setLoading(true);
    clearError();
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    clearError();
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_google"));
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    clearError();
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_apple"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    clearError();
    try {
      const { data, error } = await supabase.functions.invoke("send-login-otp", {
        body: { email: email.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStep("otp");
    } catch (err) {
      console.error(err);
      setInlineError(t("login_error_email"));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    clearError();
    try {
      const { data, error } = await supabase.functions.invoke("verify-login-otp", {
        body: { email: email.trim(), code: otp.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: "magiclink",
        });
        if (verifyError) throw verifyError;

        // Send welcome email for new users (fire and forget)
        if (data?.isNewUser) {
          supabase.functions.invoke("send-welcome-email", {
            body: { email: email.trim() },
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error && err.message.includes("non valido")
        ? t("login_error_otp_invalid")
        : err instanceof Error && err.message.includes("scaduto")
        ? t("login_error_otp_invalid")
        : t("login_error_generic");
      setInlineError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-parchment flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[360px] space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <span className="text-5xl text-trust-blue select-none block">✦</span>
          <h1 className="font-display text-3xl tracking-wide text-foreground">CLAURIA</h1>
          <p className="font-display italic text-muted-foreground text-sm">{t("login_subtitle")}</p>
        </div>

        {/* Auth card */}
        <div className="bg-ai-bubble rounded-2xl shadow-sm px-5 py-6 space-y-4">
          <p className="text-foreground text-[15px] leading-relaxed text-center" style={{ lineHeight: "1.8" }}>
            {t("login_access")}
          </p>

          {/* Inline error message */}
          <AnimatePresence>
            {inlineError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-center text-crisis-red/80 leading-relaxed"
              >
                {inlineError}
              </motion.p>
            )}
          </AnimatePresence>

          {step === "choose" && (
            <div className="space-y-2.5">
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-border/40 text-foreground rounded-xl py-3 text-[15px] font-medium transition-opacity disabled:opacity-50 shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {t("login_google")}
              </button>

              {/* Apple */}
              <button
                onClick={handleApple}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-black text-white rounded-xl py-3 text-[15px] font-medium transition-opacity disabled:opacity-50"
              >
                <svg width="17" height="17" viewBox="0 0 814 1000">
                  <path fill="white" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-114.1C159.5 740.7 114 633 114 531.3c0-175.1 113.4-268.2 224.1-268.2 58.5 0 107.4 38.5 143.8 38.5 34.5 0 89.5-40.8 155.5-40.8 24.6 0 108.2 2.6 168.4 83zm-119.3-254.5c28.1-36.8 47.7-88.6 47.7-140.4 0-7.1-.6-14.3-1.9-20.1-44.9 1.9-98.1 29.9-130.9 71.9-24.5 31.4-47.7 83.2-47.7 135.7 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 40.1 0 89.5-26.8 117.3-66.5z"/>
                </svg>
                {t("login_apple")}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-ai-bubble px-3 text-xs text-muted-foreground/50">{t("login_or")}</span>
                </div>
              </div>

              <button
                onClick={() => { setStep("email"); clearError(); }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-trust-blue text-primary-foreground rounded-xl py-3 text-[15px] font-medium transition-opacity disabled:opacity-50"
              >
                {t("login_email")}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-ai-bubble px-3 text-xs text-muted-foreground/50">{t("login_or")}</span>
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

          {step === "email" && (
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder={t("login_email_placeholder")}
                autoFocus
                className="w-full bg-transparent border-b border-trust-blue/40 text-foreground text-[15px] py-2 focus:outline-none focus:border-trust-blue placeholder:text-muted-foreground/50"
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              />
              <button
                onClick={handleEmailSubmit}
                disabled={loading || !email.trim()}
                className="w-full bg-trust-blue text-primary-foreground rounded-xl py-3 text-[15px] font-medium transition-opacity disabled:opacity-50"
              >
                {loading ? t("login_sending") : t("login_send_code")}
              </button>
              <button
                onClick={() => { setStep("choose"); clearError(); }}
                className="text-xs text-muted-foreground/60 italic"
              >
                {t("login_back")}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("login_otp_instructions")} {email}
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); clearError(); }}
                placeholder="000000"
                autoFocus
                className="w-full text-center tracking-[0.5em] bg-transparent border-b-2 border-trust-blue/40 text-foreground text-xl font-mono py-2 focus:outline-none focus:border-trust-blue placeholder:text-muted-foreground/30"
                onKeyDown={(e) => e.key === "Enter" && handleOtpVerify()}
              />
              <button
                onClick={handleOtpVerify}
                disabled={loading || otp.length < 6}
                className="w-full bg-trust-blue text-primary-foreground rounded-xl py-3 text-[15px] font-medium transition-opacity disabled:opacity-50"
              >
                {loading ? t("login_verifying") : t("login_confirm")}
              </button>
              <button
                onClick={() => { setStep("email"); setOtp(""); clearError(); }}
                className="text-xs text-muted-foreground/60 italic"
              >
                {t("login_change_email")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
