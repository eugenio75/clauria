import { motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";

interface MoodCheckInProps {
  onSelect: (mood: number) => void;
}

const moods = [
  { emoji: "😔", value: 1 },
  { emoji: "😟", value: 2 },
  { emoji: "😐", value: 3 },
  { emoji: "🙂", value: 4 },
  { emoji: "😊", value: 5 },
];

const MoodCheckIn = ({ onSelect }: MoodCheckInProps) => {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.15)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="glass rounded-3xl px-8 py-8 max-w-[340px] w-full text-center shadow-xl"
      >
        <p className="font-display text-xl text-foreground mb-6">
          {lang === "it" ? "Come stai oggi?" : "How are you today?"}
        </p>

        <div className="flex justify-center gap-4">
          {moods.map(({ emoji, value }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={() => onSelect(value)}
              className="text-3xl p-2 rounded-full transition-colors hover:bg-muted/50"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MoodCheckIn;
