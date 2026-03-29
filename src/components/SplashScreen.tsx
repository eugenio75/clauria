import { motion } from "framer-motion";
import { useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  fadingOut?: boolean;
}

const SplashScreen = ({ onComplete, fadingOut = false }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: fadingOut ? 0.4 : 0.5 }}
      className="fixed inset-0 bg-parchment flex flex-col items-center justify-center z-50"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="font-display italic text-muted-foreground text-sm"
      >
        Non sei solo.
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
