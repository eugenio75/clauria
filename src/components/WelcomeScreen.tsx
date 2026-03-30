import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [page, setPage] = useState(0);
  const { lang, setLang, t } = useLanguage();

  const pages = [
    {
      lines: [t("welcome_p1_l1"), t("welcome_p1_l2")],
    },
    {
      lines: [t("welcome_p2")],
    },
    {
      lines: [t("welcome_p3")],
    },
  ];

  const isLastPage = page === pages.length - 1;

  return (
    <div className="fixed inset-0 bg-parchment flex flex-col items-center justify-center px-8">
      {/* Language selector */}
      <div className="absolute top-6 right-6 flex gap-2">
        <button
          onClick={() => setLang("it")}
          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            lang === "it"
              ? "bg-trust-blue text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          IT
        </button>
        <button
          onClick={() => setLang("en")}
          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            lang === "en"
              ? "bg-trust-blue text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          EN
        </button>
      </div>

      {/* Content */}
      <div className="max-w-[440px] w-full flex flex-col items-center text-center space-y-4 min-h-[200px] justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="text-2xl text-trust-blue select-none mb-6"
        >
          ✦
        </motion.span>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-4"
          >
            {pages[page].lines.map((line, i) => (
              <p
                key={i}
                className="text-foreground text-2xl leading-[2] font-display"
              >
                {line}
              </p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page indicator dots */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
        {pages.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === page ? "bg-trust-blue" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Navigation button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
        {isLastPage ? (
          <button
            onClick={onComplete}
            className="bg-trust-blue text-primary-foreground font-display text-base px-8 py-3 rounded-xl tracking-wide transition-opacity hover:opacity-90"
          >
            {t("welcome_start")}
          </button>
        ) : (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="bg-trust-blue text-primary-foreground font-display text-base px-8 py-3 rounded-xl tracking-wide transition-opacity hover:opacity-90"
          >
            {t("welcome_next")}
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
