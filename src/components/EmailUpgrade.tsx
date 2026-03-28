import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailUpgradeProps {
  onComplete: () => void;
  onSkip: () => void;
}

const EmailUpgrade = ({ onComplete, onSkip }: EmailUpgradeProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      toast.success("Ti abbiamo inviato un link magico. Controlla la mail.");
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Qualcosa non ha funzionato. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] space-y-3">
        <div className="bg-ai-bubble rounded-2xl rounded-tl-sm shadow-sm px-5 py-3.5">
          <p className="text-foreground text-[15px] leading-relaxed" style={{ lineHeight: "1.8" }}>
            Un'ultima cosa — se cambi telefono o reinstalli l'app, voglio poterti ritrovare.
            Lasciami una mail, solo per questo. Non riceverai nulla.
          </p>
        </div>
        <div className="flex items-center gap-2 px-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="la tua email"
            className="flex-1 bg-transparent border-b border-trust-blue/40 text-foreground text-[15px] py-1.5 focus:outline-none focus:border-trust-blue placeholder:text-muted-foreground/50"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            className="text-trust-blue text-sm font-medium disabled:opacity-40"
          >
            {loading ? "..." : "Salva"}
          </button>
        </div>
        <button
          onClick={onSkip}
          className="text-xs text-muted-foreground/60 italic px-1"
        >
          Salta per ora
        </button>
      </div>
    </motion.div>
  );
};

export default EmailUpgrade;
