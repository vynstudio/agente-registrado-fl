import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

export type Lang = "en" | "es" | "pt";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "pt", label: "PT" },
];

// The site serves the Spanish-speaking market (agenteregistradofl.com): new visitors
// get Spanish; a language picked with the EN/ES/PT buttons is remembered.
const detect = (): Lang => {
  const saved = localStorage.getItem("lang");
  if (saved === "en" || saved === "es" || saved === "pt") return saved;
  return "es";
};

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (text: string) => string }
const LanguageContext = createContext<Ctx>({ lang: "es", setLang: () => {}, t: (s) => s });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(detect);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { localStorage.setItem("lang", l); setLangState(l); };
  // English text is the key; missing translations fall back to English.
  const t = useCallback((text: string) => (lang === "en" ? text : translations[text]?.[lang] ?? text), [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);

// Brand name shown in each site language.
export const BRAND: Record<Lang, string> = { en: "Florida Registered Agent", es: "Agente Registrado Florida", pt: "Agente Registrado da Flórida" };

// Locale used to format dates for each site language.
export const LOCALES: Record<Lang, string> = { en: "en-US", es: "es-US", pt: "pt-BR" };
