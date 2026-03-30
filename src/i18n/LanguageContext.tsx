import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Language, t as translate, TranslationKey } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => any;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "it",
  setLang: () => {},
  t: (key) => translate("it", key),
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("clauria_lang");
    if (saved === "en" || saved === "it") return saved as Language;
    // Auto-detect from browser
    const browserLang = (navigator.languages?.[0] || navigator.language || "").toLowerCase();
    return browserLang.startsWith("it") ? "it" : "en";
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("clauria_lang", newLang);
  }, []);

  const tFn = useCallback((key: TranslationKey) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
