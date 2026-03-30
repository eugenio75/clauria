import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "../i18n/LanguageContext";

interface EmailUpgradeProps {
  onComplete: () => void;
  onSkip: () => void;
}

const EmailUpgrade = ({ onComplete, onSkip }: EmailUpgradeProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      toast.success(t("email_upgrade_success"));
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error(t("email_upgrade_error"));
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
            {t("email_upgrade_text")}
          </p>
        </div>
        <div className="flex items-center gap-2 px-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email_upgrade_placeholder")}
            className="flex-1 bg-transparent border-b border-trust-blue/40 text-foreground text-[15px] py-1.5 focus:outline-none focus:border-trust-blue placeholder:text-muted-foreground/50"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            className="text-trust-blue text-sm font-medium disabled:opacity-40"
          >
            {loading ? "..." : t("email_upgrade_save")}
          </button>
        </div>
        <button
          onClick={onSkip}
          className="text-xs text-muted-foreground/60 italic px-1"
        >
          {t("email_upgrade_skip")}
        </button>
      </div>
    </motion.div>
  );
};

export default EmailUpgrade;
