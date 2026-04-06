import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

const Landing = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{
        background:
          "radial-gradient(ellipse at 30% 50%, hsl(38,60%,92%), hsl(215,40%,88%), hsl(38,35%,96%))",
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

      <div className="max-w-[520px] w-full flex flex-col items-center text-center space-y-8 py-16">
        {/* Symbol */}
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.08, 1] }}
          transition={{
            opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
          }}
          className="text-5xl text-trust-blue select-none"
        >
          ✦
        </motion.span>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-display text-5xl tracking-wide text-foreground"
        >
          CLAURIA
        </motion.h1>

        {/* Accent bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="h-[2px] bg-warm-amber rounded-full"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="font-display italic text-2xl text-foreground"
        >
          {t("landing_tagline")}
        </motion.p>

        {/* For whom */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-base text-muted-foreground leading-relaxed max-w-[420px]"
        >
          {t("landing_for_whom")}
        </motion.p>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="text-xs text-muted-foreground/60 leading-relaxed max-w-[380px]"
        >
          {t("landing_disclaimer")}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <button
            onClick={() => navigate("/app")}
            className="font-display text-lg px-10 py-3.5 rounded-xl tracking-wide transition-opacity hover:opacity-90 text-primary-foreground shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, hsl(25,65%,42%), hsl(215,55%,45%))",
            }}
          >
            {t("landing_cta")}
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.7 }}
        className="absolute bottom-6 text-center text-xs text-muted-foreground/50 space-y-1"
      >
        <p>{t("landing_footer")}</p>
        <a
          href="/privacy"
          className="underline underline-offset-2 hover:text-muted-foreground/70 transition-colors"
        >
          {t("landing_privacy")}
        </a>
      </motion.footer>
    </div>
  );
};

export default Landing;
