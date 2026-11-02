import { BRAND, useLang } from "@/i18n/LanguageContext";
import { BRAND_CONFIG } from "@/lib/brand";

// Brand name in the visitor's language, with "Florida" or "Corporate" highlighted.
const BrandName = () => {
  const { lang } = useLang();
  return <>{BRAND[lang].split(BRAND_CONFIG.highlight).map((part, i) =>
    i % 2 ? <span key={i} className="text-lime">{part}</span> : part)}</>;
};

export default BrandName;
