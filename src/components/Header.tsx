import { useLang } from "@/i18n/LanguageContext";
import BrandName from "@/components/BrandName";
import BrandMark from "@/components/BrandMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu01Icon, Cancel01Icon } from "hugeicons-react";

const Header = () => {
  const { t } = useLang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Close the mobile menu on Escape or a click/tap outside the header
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [isMenuOpen]);
  const navItems = [
    { label: "Home", href: "/", isInternal: true },
    { label: "About", href: "/about", isInternal: true },
    { label: "Blog", href: "/blog", isInternal: true },
    { label: "Contact us", href: "/contact", isInternal: true },
  ];

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 pt-5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 px-6 bg-background/80 backdrop-blur-md border border-border/50 rounded-[20px] shadow-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8 shrink-0" />
          <span className="text-[17px] font-medium text-foreground leading-tight"><BrandName /></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) =>
            item.isInternal ? (
              <Link
                key={t(item.label)}
                to={item.href}
                className="font-medium text-muted-foreground hover:text-foreground transition-colors text-base"
              >
                {t(item.label)}
              </Link>
            ) : (
              <a
                key={t(item.label)}
                href={item.href}
                className="font-medium text-muted-foreground hover:text-foreground transition-colors text-base"
              >
                {t(item.label)}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
        <div className="hidden md:flex">
          <Link
            to="/start"
            className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-5 h-10 text-sm font-medium transition-colors"
          >
            {t("START NOW")}
          </Link>
        </div>

        <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <Cancel01Icon size={24} /> : <Menu01Icon size={24} />}
        </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden mt-2 mx-4">
          <nav aria-label="Mobile" className="bg-background/95 backdrop-blur-md border border-border/50 rounded-[16px] px-4 py-4 flex flex-col gap-1 shadow-lg">
            {navItems.map((item) =>
              item.isInternal ? (
                <Link
                  key={t(item.label)}
                  to={item.href}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors py-3 px-3 rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.label)}
                </Link>
              ) : (
                <a
                  key={t(item.label)}
                  href={item.href}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors py-3 px-3 rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.label)}
                </a>
              )
            )}
            <div className="pt-2 mt-1 border-t border-border/50">
              <Link
                to="/start"
                onClick={() => setIsMenuOpen(false)}
                className="w-full inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-5 h-11 text-base font-medium transition-colors"
              >
                {t("START NOW")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
