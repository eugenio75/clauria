import { motion } from "framer-motion";
import { COMPANIONS, Companion } from "../types/companion";
import { Lock } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface CompanionSelectorProps {
  currentCompanion: Companion["id"];
  onSelect: (id: Companion["id"]) => void;
  onClose: () => void;
}

const CompanionSelector = ({ currentCompanion, onSelect, onClose }: CompanionSelectorProps) => {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center px-5"
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl text-foreground mb-2"
      >
        {lang === "it" ? "Scegli il tuo compagno" : "Choose your companion"}
      </motion.h2>
      <p className="text-muted-foreground text-sm mb-8">
        {lang === "it" ? "Ognuno ha una voce diversa." : "Each one has a different voice."}
      </p>

      <div className="w-full max-w-[420px] space-y-3">
        {/* Clauria - full width */}
        {COMPANIONS.filter(c => c.id === "clauria").map((companion) => (
          <CompanionCard
            key={companion.id}
            companion={companion}
            isActive={currentCompanion === companion.id}
            lang={lang}
            onSelect={() => { onSelect(companion.id); onClose(); }}
            fullWidth
          />
        ))}

        {/* Others - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {COMPANIONS.filter(c => c.id !== "clauria").map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              isActive={currentCompanion === companion.id}
              lang={lang}
              onSelect={() => { onSelect(companion.id); onClose(); }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-8 text-muted-foreground text-sm"
      >
        {lang === "it" ? "Chiudi" : "Close"}
      </button>
    </motion.div>
  );
};

function CompanionCard({ companion, isActive, lang, onSelect, fullWidth }: {
  companion: Companion;
  isActive: boolean;
  lang: string;
  onSelect: () => void;
  fullWidth?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative w-full bg-gradient-to-br ${companion.bgGradient} rounded-2xl p-4 text-left transition-all border ${
        isActive ? "border-foreground/20 shadow-md" : "border-transparent shadow-sm"
      } ${fullWidth ? "" : ""}`}
    >
      {companion.isPremium && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
          <Lock className="w-3 h-3" /> Premium
        </span>
      )}

      <motion.span
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-3xl block mb-2"
        style={{ color: companion.color }}
      >
        {companion.emoji}
      </motion.span>

      <h3 className="font-display text-lg text-foreground">{companion.name}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        {lang === "it" ? companion.tagline : companion.taglineEn}
      </p>
      <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
        {lang === "it" ? companion.personality : companion.personalityEn}
      </p>
    </motion.button>
  );
}

export default CompanionSelector;
