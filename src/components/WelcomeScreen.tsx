import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const LINES = [
  { text: "Ciao. Sono CLAURIA.", fadeMs: 1200, waitMs: 2000 },
  { text: "Sono qui per ascoltarti.", fadeMs: 1200, waitMs: 2000 },
  { text: "Puoi dirmi quello che hai dentro:", fadeMs: 1200, waitMs: 1500 },
  { text: "quello che ti turba,", fadeMs: 1000, waitMs: 1200 },
  { text: "quello che non riesci a risolvere,", fadeMs: 1000, waitMs: 1200 },
  { text: "quello che non hai ancora detto a nessuno.", fadeMs: 1000, waitMs: 2000 },
  { text: "Anche di notte. Anche le cose più difficili.", fadeMs: 1200, waitMs: 2000 },
];

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (visibleLines === 0) {
      // Initial delay before first sentence starts — ensures splash has fully faded
      const timer = setTimeout(() => setVisibleLines(1), 600);
      return () => clearTimeout(timer);
    }
    if (visibleLines > 0 && visibleLines <= LINES.length) {
      if (visibleLines < LINES.length) {
        const { fadeMs, waitMs } = LINES[visibleLines - 1];
        const timer = setTimeout(() => setVisibleLines((v) => v + 1), fadeMs + waitMs);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setShowCta(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [visibleLines]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-parchment flex flex-col items-center justify-center px-8"
    >
      <div className="max-w-[440px] w-full flex flex-col items-center text-center space-y-4">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="text-2xl text-trust-blue select-none mb-6"
        >
          ✦
        </motion.span>

        {LINES.map((line, i) => (
          <AnimatePresence key={i}>
            {i + 1 <= visibleLines && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: line.fadeMs / 1000, ease: "easeInOut" }}
                className="text-foreground text-[1.15rem] leading-[2] font-display"
              >
                {line.text}
              </motion.p>
            )}
          </AnimatePresence>
        ))}
      </div>

      <AnimatePresence>
        {showCta && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onClick={onComplete}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 text-sm text-muted-foreground/60 italic font-display tracking-wide"
          >
            Inizia
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WelcomeScreen;
