import { motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";

interface SilenceModeProps {
  onReturn: () => void;
}

const SilenceMode = ({ onReturn }: SilenceModeProps) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-30 bg-parchment flex flex-col items-center justify-center cursor-pointer"
      onClick={onReturn}
    >
      <span className="text-6xl text-trust-blue animate-gentle-pulse select-none">✦</span>
      <p className="mt-8 text-muted-foreground text-sm">{t("silence_tap")}</p>
    </motion.div>
  );
};

export default SilenceMode;
