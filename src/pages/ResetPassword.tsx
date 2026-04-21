import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/runtime-client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Quando l'utente clicca il link nell'email, Supabase imposta una sessione di recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Verifica anche se la sessione è già attiva (es. ricaricamento)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }
    if (password !== confirm) {
      setError("Le password non coincidono.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/app");
      }, 1800);
    } catch (err) {
      console.error(err);
      setError("Impossibile aggiornare la password. Richiedi un nuovo link.");
    } finally {
      setLoading(false);
    }
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
        <div className="text-center space-y-3">
          <span className="text-5xl text-trust-blue select-none block">✦</span>
          <h1 className="font-display text-3xl tracking-wide text-foreground">CLAURIA</h1>
          <p className="font-display italic text-muted-foreground text-sm">Reimposta la tua password</p>
        </div>

        <div className="glass rounded-2xl px-5 py-6 space-y-4 shadow-lg">
          {done ? (
            <p className="text-center text-foreground text-[15px] leading-relaxed">
              Password aggiornata. Ti riporto al login...
            </p>
          ) : !ready ? (
            <p className="text-center text-muted-foreground text-sm leading-relaxed">
              Verifico il tuo link...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="nuova password"
                autoFocus
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                placeholder="conferma password"
                className="w-full bg-transparent border-b-2 border-warm-amber/30 text-foreground text-[15px] py-2 focus:outline-none focus:border-warm-amber transition-colors placeholder:text-muted-foreground/50"
              />
              {error && (
                <p className="text-sm text-center text-crisis-red/80 leading-relaxed">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full bg-warm-amber text-primary-foreground rounded-xl py-3.5 text-[15px] font-medium transition-opacity disabled:opacity-50 shadow-sm"
              >
                {loading ? "Salvo..." : "Salva nuova password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
