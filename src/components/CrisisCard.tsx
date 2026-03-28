import { motion } from "framer-motion";

const CrisisCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="mx-4 my-3 rounded-2xl border-2 border-trust-blue/30 bg-parchment p-6"
  >
    <p className="text-trust-blue font-medium text-lg mb-1">♡ Non sei solo/a.</p>
    <p className="text-foreground/80 text-sm mb-4">
      C'è qualcuno che vuole ascoltarti adesso.
    </p>
    <div className="space-y-3 text-sm">
      <div>
        <a href="tel:0223272327" className="text-trust-blue font-medium hover:underline">
          Telefono Amico: 02 2327 2327
        </a>
        <p className="text-muted-foreground text-xs">Disponibile 24 ore su 24</p>
      </div>
      <div>
        <a href="tel:19696" className="text-trust-blue font-medium hover:underline">
          Telefono Azzurro: 19696
        </a>
        <p className="text-muted-foreground text-xs">(anche per adulti in crisi)</p>
      </div>
    </div>
  </motion.div>
);

export default CrisisCard;
