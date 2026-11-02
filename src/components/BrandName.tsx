import { BRAND, useLang } from "@/i18n/LanguageContext";

// Brand name in the visitor's language, with "Florida" highlighted.
const BrandName = () => {
  const { lang } = useLang();
  return <>{BRAND[lang].split(/(Fl[oó]rida)/).map((part, i) =>
    i % 2 ? <span key={i} className="text-lime">{part}</span> : part)}</>;
};

export default BrandName;
