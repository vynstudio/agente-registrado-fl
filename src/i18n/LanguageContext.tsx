import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { translations } from "./translations";
import { BRAND_CONFIG } from "@/lib/brand";

export type Lang = "en" | "es" | "pt";
const LABELS: Record<Lang, string> = { en: "EN", es: "ES", pt: "PT" };
// Languages the current brand offers (src/lib/brand.ts): Agente Registrado Florida has
// ES/EN/PT, Diler Corporate is English only.
export const LANGS: { code: Lang; label: string }[] = BRAND_CONFIG.langs.map((code) => ({ code, label: LABELS[code] }));

// New visitors get the brand's first language (Spanish on agenteregistradofl.com);
// a language picked with the EN/ES/PT buttons is remembered.
const detect = (): Lang => {
  try {
    const saved = localStorage.getItem("lang");
    if (BRAND_CONFIG.langs.includes(saved as Lang)) return saved as Lang;
  } catch { /* storage blocked */ }
  return BRAND_CONFIG.langs[0];
};

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (text: string) => string }
const LanguageContext = createContext<Ctx>({ lang: BRAND_CONFIG.langs[0], setLang: () => {}, t: (s) => s });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(detect);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => {
    try { localStorage.setItem("lang", l); } catch { /* storage blocked: still switch for this visit */ }
    setLangState(l);
  };
  // English text is the key; missing translations fall back to English.
  // {brand} and {domain} in a text become the current brand's name and domain.
  const t = useCallback((text: string) => {
    const out = lang === "en" ? text : translations[text]?.[lang] ?? text;
    return out.includes("{") ? out.split("{brand}").join(BRAND[lang]).split("{domain}").join(BRAND_CONFIG.domain) : out;
  }, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);

// Brand name shown in each site language.
export const BRAND: Record<Lang, string> = BRAND_CONFIG.name;

// Locale used to format dates for each site language.
export const LOCALES: Record<Lang, string> = { en: "en-US", es: "es-US", pt: "pt-BR" };
