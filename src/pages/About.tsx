import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";
import Photo from "@/components/Photo";
import { usePageTitle } from "@/hooks/usePageTitle";

const values = [
  {
    title: "Florida filings, done right",
    description: "We prepare and submit your Florida LLC or corporation filing with the State of Florida (Sunbiz) and keep you updated.",
  },
  {
    title: "Built for US and international founders",
    description: "Help in English, Spanish, and Portuguese, whether you live in Florida or abroad.",
  },
  {
    title: "Clear, one-time prices",
    description: "Packages are priced upfront, and the Florida state fee is shown separately at checkout.",
  },
];

const About = () => {
  const { t } = useLang();
  usePageTitle("About us");
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <span className="inline-block mb-6 text-sm text-muted-foreground bg-muted/50 border border-border rounded-full py-1 px-3 font-light">
            {t("About")}
          </span>
          <h1 className="text-[32px] sm:text-[40px] md:text-[52px] font-medium text-foreground leading-[1.1] mb-6">
            {t("Florida business formation for US and international founders")}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            {t("Florida Registered Agent helps entrepreneurs form a Florida LLC or corporation, get an EIN, and keep a registered agent in Florida. We handle the paperwork so you can focus on your business.")}
          </p>
          <div className="h-[220px] sm:h-[380px] overflow-hidden rounded-[24px] mb-12">
            <Photo name="man-leading-team" priority sizes="(min-width: 928px) 896px, calc(100vw - 32px)" className="w-full h-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground mb-2">{t(v.title)}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(v.description)}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            {t("We are not a law firm and do not give legal or tax advice. When you need it, we can refer you to partner CPAs and attorneys.")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to="/start">{t("START NOW")}</Link></Button>
            <Button asChild variant="outline"><Link to="/contact">{t("Contact us")}</Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
