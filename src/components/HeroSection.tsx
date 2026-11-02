import { BRAND, useLang } from "@/i18n/LanguageContext";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Photo from "@/components/Photo";

const HeroSection = () => {
  const { t, lang } = useLang();
  return (
    <section className="relative pb-12 md:pb-16 overflow-hidden bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          {/* Main Headline */}
          <h1 className="text-[44px] sm:text-[60px] md:text-[76px] font-medium text-foreground leading-none mb-6 text-balance">
            {BRAND[lang]}
          </h1>

          {/* Subheadline */}
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            {t("Form your Florida LLC or corporation, get your EIN and stay compliant — from anywhere in the world.")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/start" className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-full py-2 pr-2 pl-6 text-sm font-medium h-10 transition-colors">
              {t("START MY BUSINESS")}
              <span className="bg-background rounded-full p-1.5">
                <ArrowUpRight size={18} className="text-foreground" />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Hero photo - container width. Not animated: it's the largest element, so it shows immediately. */}
      <div className="container mx-auto px-4">
        <div className="relative mt-8">
          <div className="w-full max-w-[1280px] h-[320px] sm:h-[500px] overflow-hidden rounded-[24px]">
            <Photo name="miami-skyline" priority sizes="(min-width: 1312px) 1280px, calc(100vw - 32px)" className="w-full h-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
