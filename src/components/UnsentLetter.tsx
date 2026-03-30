import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";

interface UnsentLetterProps {
  onClose: () => void;
}

const UnsentLetter = ({ onClose }: UnsentLetterProps) => {
  const [text, setText] = useState("");
  const { t } = useLanguage();

  const handleClose = () => {
    setText("");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-parchment flex flex-col p-6 pt-safe"
    >
      <p className="text-sm text-muted-foreground italic text-center mb-6">
        {t("letter_intro")}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-transparent resize-none text-foreground text-lg leading-relaxed focus:outline-none font-sans"
        placeholder={t("letter_placeholder")}
        autoFocus
      />
      <button
        onClick={handleClose}
        className="mt-6 text-sm text-muted-foreground italic text-center hover:text-foreground transition-colors"
      >
        {t("letter_close")}
      </button>
    </motion.div>
  );
};

export default UnsentLetter;
