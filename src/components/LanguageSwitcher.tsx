import { LANGS, useLang } from "@/i18n/LanguageContext";

const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label="Language" className={`inline-flex items-center rounded-full border border-border p-0.5 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`px-2.5 h-7 rounded-full text-xs font-medium transition-colors ${
            lang === l.code ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
