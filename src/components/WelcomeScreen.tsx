import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import { COMPANIONS } from "../types/companion";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const letterVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: "easeOut" as const },
  }),
};

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [page, setPage] = useState(0);
  const { lang, setLang, t } = useLanguage();

  const pages = [
    { lines: [t("welcome_p1_l1"), t("welcome_p1_l2")] },
    { lines: [t("welcome_p2")] },
    { lines: [t("welcome_p3")] },
  ];

  const isLastPage = page === pages.length - 1;
  const clauriaName = "CLAURIA";

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8"
      style={{
        background: "radial-gradient(ellipse at 30% 50%, hsl(38,60%,92%), hsl(215,40%,88%), hsl(38,35%,96%))",
      }}
    >
      {/* Language selector */}
      <div className="absolute top-6 right-6 flex gap-2">
        <button
          onClick={() => setLang("it")}
          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            lang === "it"
              ? "bg-warm-amber text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          IT
        </button>
        <button
          onClick={() => setLang("en")}
          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            lang === "en"
              ? "bg-warm-amber text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          EN
        </button>
      </div>

      {/* Content */}
      <div className="max-w-[440px] w-full flex flex-col items-center text-center space-y-4 min-h-[280px] justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-4"
          >
            {page === 0 ? (
              <>
                {/* Animated symbol */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-4xl text-trust-blue select-none block mb-4"
                >
                  ✦
                </motion.span>

                <p className="text-foreground text-2xl leading-[2] font-display">
                  {lang === "en" ? "Hi." : "Ciao."}
                </p>
                <p className="text-foreground leading-[1.6] font-display">
                  <span className="text-2xl">{lang === "en" ? "I am " : "Sono "}</span>
                  <span className="text-4xl font-semibold tracking-wide">
                    {clauriaName.split("").map((letter, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={letterVariants}
                        className="inline-block"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </span>
                </p>
                <p className="text-foreground text-2xl leading-[2] font-display mt-2">
                  {t("welcome_p1_l2")}
                </p>
              </>
            ) : (
              pages[page].lines.map((line, i) => (
                <p key={i} className="text-foreground text-xl leading-[2] font-display">
                  {line}
                </p>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page indicator dots */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
        {pages.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === page ? "bg-warm-amber" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Navigation button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
        {isLastPage ? (
          <button
            onClick={onComplete}
            className="font-display text-base px-8 py-3 rounded-xl tracking-wide transition-opacity hover:opacity-90 text-primary-foreground"
            style={{
              background: "linear-gradient(135deg, hsl(25,65%,42%), hsl(215,55%,45%))",
            }}
          >
            {t("welcome_start")}
          </button>
        ) : (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="bg-warm-amber text-primary-foreground font-display text-base px-8 py-3 rounded-xl tracking-wide transition-opacity hover:opacity-90"
          >
            {t("welcome_next")}
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
