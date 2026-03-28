import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

type AuthStep = "choose" | "email" | "otp";

const LoginScreen = () => {
  const [step, setStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      toast.error("Accesso con Google non riuscito. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      toast.error("Accesso con Apple non riuscito. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });
      if (error) throw error;
      setStep("otp");
      toast.success("Ti abbiamo inviato un codice. Controlla la mail.");
    } catch (err) {
      console.error(err);
      toast.error("Qualcosa non ha funzionato. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });
      if (error) throw error;
      toast.success("Bentornato/a.");
    } catch (err) {
      console.error(err);
      toast.error("Codice non valido. Riprova.");
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
          <h1 className="font-display text-3xl tracking-wide text-foreground">INTUS</h1>
          <p className="font-display italic text-muted-foreground text-sm">Non sei solo.</p>
        </div>

        {/* Auth card */}
        <div className="bg-ai-bubble rounded-2xl shadow-sm px-5 py-6 space-y-4">
          <p className="text-foreground text-[15px] leading-relaxed text-center" style={{ lineHeight: "1.8" }}>
            Accedi per iniziare
          </p>

          {step === "choose" && (
            <div className="space-y-2.5">
              <button
                onClick={handleApple}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background rounded-xl py-3 text-[15px] font-medium transition-opacity disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continua con Apple
              </button>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-white border border-border rounded-xl py-3 text-[15px] font-medium text-foreground transition-opacity disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continua con Google
              </button>

              <button
                onClick={() => setStep("email")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-muted/60 rounded-xl py-3 text-[15px] font-medium text-foreground transition-opacity disabled:opacity-50"
              >
                ✉️ Usa la tua mail
              </button>
            </div>
          )}

          {step === "email" && (
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="la tua email"
                autoFocus
                className="w-full bg-transparent border-b border-trust-blue/40 text-foreground text-[15px] py-2 focus:outline-none focus:border-trust-blue placeholder:text-muted-foreground/50"
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              />
              <button
                onClick={handleEmailSubmit}
                disabled={loading || !email.trim()}
                className="w-full bg-trust-blue text-primary-foreground rounded-xl py-3 text-[15px] font-medium transition-opacity disabled:opacity-50"
              >
                {loading ? "Invio in corso..." : "Invia codice"}
              </button>
              <button
                onClick={() => setStep("choose")}
                className="text-xs text-muted-foreground/60 italic"
              >
                ← Indietro
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Inserisci il codice a 6 cifre che hai ricevuto su {email}
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
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
                {loading ? "Verifico..." : "Conferma"}
              </button>
              <button
                onClick={() => { setStep("email"); setOtp(""); }}
                className="text-xs text-muted-foreground/60 italic"
              >
                ← Cambia email
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
