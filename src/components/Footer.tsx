import { useLang } from "@/i18n/LanguageContext";
import BrandName from "@/components/BrandName";
import { PHONE } from "@/lib/contact";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const columns = [{
  title: "Services",
  links: [
    { label: "Form your company", href: "/start" },
    { label: "Florida LLC vs corporation", href: "/florida-llc-vs-corporation" },
    { label: "EIN application", href: "/ein-application" },
    { label: "Registered agent renewal", href: "/registered-agent-renewal" },
  ],
}, {
  title: "Company",
  links: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact us", href: "/contact" },
  ],
}, {
  title: "Legal",
  links: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund policy", href: "/refund-policy" },
    { label: "Legal disclaimer", href: "/legal-disclaimer" },
    { label: "Privacy policy", href: "/privacy" },
  ],
}];

const Footer = () => {
  const { t } = useLang();
  return <footer className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-muted rounded-[24px] px-6 md:px-8 pt-12 pb-6 lg:px-12">
        {/* Top Section: brand + link columns */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-12 mb-12">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center">
              <span className="text-[17px] font-semibold text-foreground leading-tight"><BrandName /></span>
            </Link>
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
              {t("Form your Florida LLC or corporation, get your EIN and stay compliant — from anywhere in the world.")}
            </p>
            <p className="mt-3 text-[14px] text-muted-foreground">
              {t("Help in English, Spanish, and Portuguese, whether you live in Florida or abroad.")}
            </p>
            <a href={`tel:${PHONE.tel}`} className="mt-3 inline-block text-[15px] font-medium text-foreground hover:text-accent">
              <span className="sr-only">{t("Call us")}: </span>{PHONE.display}
            </a>
            <Link to="/start" className="mt-6 inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-full py-2 pr-2 pl-5 text-sm font-medium h-10 transition-colors">
              {t("START MY BUSINESS")}
              <span className="bg-background rounded-full p-1.5">
                <ArrowUpRight size={16} className="text-foreground" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:contents">
            {columns.map(column => <nav key={column.title} aria-label={t(column.title)}>
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-foreground mb-4">{t(column.title)}</h2>
                <ul className="flex flex-col gap-3">
                  {column.links.map(link => <li key={link.href}>
                      <Link to={link.href} className="text-[15px] text-muted-foreground hover:text-foreground transition-colors">
                        {t(link.label)}
                      </Link>
                    </li>)}
                </ul>
              </nav>)}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-border pt-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8">
          <p className="text-[13px] sm:text-[14px] text-foreground shrink-0">
            {t("© 2026 Florida Registered Agent. All rights reserved.")}
          </p>
          <p className="text-[13px] text-muted-foreground md:text-right md:max-w-xl">
            {t("Operated by Diler Services, LLC. We are not a law firm and do not give legal or tax advice.")}
          </p>
        </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
