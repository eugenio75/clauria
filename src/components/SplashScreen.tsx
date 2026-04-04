import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";

interface SplashScreenProps {
  onComplete: () => void;
  fadingOut?: boolean;
}

const SplashScreen = ({ onComplete, fadingOut = false }: SplashScreenProps) => {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: fadingOut ? 0.4 : 0.5 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: "radial-gradient(ellipse at 30% 50%, hsl(38,60%,92%), hsl(215,40%,88%), hsl(38,35%,96%))",
      }}
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.08, 1] }}
        transition={{
          opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
        }}
        className="text-7xl text-trust-blue mb-6 select-none"
      >
        ✦
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="font-display text-4xl tracking-wide text-foreground mb-3"
      >
        CLAURIA
      </motion.h1>

      {/* Accent bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 60 }}
        transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
        className="h-[2px] bg-warm-amber rounded-full mb-4"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="font-display italic text-muted-foreground text-sm"
      >
        {t("splash_tagline")}
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
