import { Language } from "../i18n/translations";

/**
 * Generates a short, warm, specific reaction to the user's life context
 * before the fixed onboarding transition question.
 */
export function getWarmReaction(lifeContext: string, lang: Language): string {
  const lc = lifeContext.toLowerCase().trim();

  const patterns: Array<{ keywords: string[]; it: string; en: string }> = [
    { keywords: ["consulente", "consultant"], it: "Tante persone, tante situazioni.", en: "So many people, so many situations." },
    { keywords: ["insegnante", "teacher", "prof", "docente"], it: "Un lavoro che dà molto.", en: "A job that gives a lot." },
    { keywords: ["operaio", "fabbrica", "cantiere", "worker", "factory"], it: "Giornate impegnative.", en: "Demanding days." },
    { keywords: ["pensionat", "retired", "nonna", "nonno", "grandma", "grandpa", "chiesa", "church"], it: "Una vita piena di persone e di dono.", en: "A life full of people and giving." },
    { keywords: ["studente", "student", "universit", "scuola", "school", "liceo", "college"], it: "Un periodo intenso.", en: "An intense time." },
    { keywords: ["a casa", "casalinga", "stay at home", "at home", "homemaker"], it: "Un momento di pausa.", en: "A moment of pause." },
    { keywords: ["medico", "doctor", "infermier", "nurse", "ospedale", "hospital"], it: "Un lavoro che chiede tanto.", en: "A job that asks a lot." },
    { keywords: ["avvocat", "lawyer", "legal"], it: "Tante responsabilità.", en: "A lot of responsibility." },
    { keywords: ["artist", "music", "musica", "pittore", "painter", "scrittore", "writer"], it: "Un mondo di espressione.", en: "A world of expression." },
    { keywords: ["mamma", "papà", "madre", "padre", "mom", "dad", "parent", "genitor"], it: "Il lavoro più importante.", en: "The most important job." },
    { keywords: ["imprendit", "entrepreneur", "azienda", "business"], it: "Tante sfide ogni giorno.", en: "So many challenges every day." },
    { keywords: ["volontari", "volunteer"], it: "Un dono prezioso.", en: "A precious gift." },
    { keywords: ["disoccupat", "unemployed", "cerco lavoro", "looking for work", "senza lavoro"], it: "Un momento di attesa.", en: "A time of waiting." },
    { keywords: ["cambiamento", "transition", "cambio", "change"], it: "I cambiamenti portano sempre qualcosa.", en: "Change always brings something." },
  ];

  for (const p of patterns) {
    if (p.keywords.some((kw) => lc.includes(kw))) {
      return lang === "it" ? p.it : p.en;
    }
  }

  // Fallback: warm and human, never clinical
  return lang === "it" ? "Ogni giornata ha il suo peso." : "Every day carries its own weight.";
}
