import { BRAND, useLang } from "@/i18n/LanguageContext";

// Brand name in the visitor's language, with "Corporate" highlighted.
const BrandName = () => {
  const { lang } = useLang();
  return <>{BRAND[lang].split(/(Corporate)/).map((part, i) =>
    i % 2 ? <span key={i} className="text-lime">{part}</span> : part)}</>;
};

export default BrandName;
