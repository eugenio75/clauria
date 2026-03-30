import { motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";

const CrisisCard = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-4 my-3 rounded-2xl border-2 border-trust-blue/30 bg-parchment p-6"
    >
      <p className="text-trust-blue font-medium text-lg mb-1">{t("crisis_title")}</p>
      <p className="text-foreground/80 text-sm mb-4">{t("crisis_subtitle")}</p>
      <div className="space-y-3 text-sm">
        <div>
          <a href="tel:0223272327" className="text-trust-blue font-medium hover:underline">
            {t("crisis_phone1_label")}
          </a>
          <p className="text-muted-foreground text-xs">{t("crisis_phone1_note")}</p>
        </div>
        <div>
          <a href="tel:19696" className="text-trust-blue font-medium hover:underline">
            {t("crisis_phone2_label")}
          </a>
          <p className="text-muted-foreground text-xs">{t("crisis_phone2_note")}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CrisisCard;
