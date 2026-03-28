import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const LINES = [
  "Ciao. Sono INTUS.",
  "Sono qui per ascoltarti.",
  "Puoi dirmi quello che hai dentro:\nquello che ti turba, quello che non riesci a risolvere,\nquello che non hai ancora detto a nessuno.",
  "Anche di notte. Anche le cose più difficili.",
];

const LINE_DELAY = 800;

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (visibleLines < LINES.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), LINE_DELAY);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowCta(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-parchment flex flex-col items-center justify-center px-8"
    >
      <div className="max-w-[440px] w-full flex flex-col items-center text-center space-y-6">
        {/* Symbol */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-2xl text-trust-blue select-none mb-4"
        >
          ✦
        </motion.span>

        {/* Lines */}
        {LINES.map((line, i) => (
          <AnimatePresence key={i}>
            {i < visibleLines && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-foreground text-lg leading-[1.9] font-display whitespace-pre-line"
              >
                {line}
              </motion.p>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* CTA */}
      <AnimatePresence>
        {showCta && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
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
