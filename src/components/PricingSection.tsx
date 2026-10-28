import { useLang } from "@/i18n/LanguageContext";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PLANS, EXTRAS, money } from "@/lib/catalog";
const PricingSection = () => {
  const { t } = useLang();
  const [starter, professional, international, bundle] = PLANS;
  const starterFeatures = starter.features;
  const coreFeatures = professional.features;
  const customFeatures = international.features;
  
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:max-w-xl"
          >
            {/* Badge */}
            <div className="inline-block px-6 py-2 bg-[#F6F8F7] border border-[#E8E8E8] rounded-[100px] mb-4">
              <p className="text-[12px] font-medium text-[#1F2420]">{t("// Pricing //")}</p>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-[40px] font-medium text-foreground leading-tight">
              {t("Simple pricing, plus state fees")}
            </h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground lg:max-w-xs lg:text-right lg:pt-12"
          >
            {t("One-time formation fee. The Florida state filing fee ($125 for an LLC, $70 for a corporation) is charged to your saved card when we file.")}
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F7F8F7] rounded-[20px] p-2 flex flex-col"
          >
            {/* Title Card */}
            <div 
              className="bg-white rounded-[16px] p-5 mb-2"
              style={{
                boxShadow: '0px 1px 4px rgba(12, 12, 13, 0.1), 0px 1px 4px rgba(12, 12, 13, 0.05)'
              }}
            >
              <h3 className="text-lg font-medium text-foreground mb-4">{t(starter.name)}</h3>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {money(starter.price)}
                </span>
                <span className="text-muted-foreground">{t("+ state fee")}</span>
              </div>

              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/start?plan=starter">{t("GET STARTED")}</Link>
              </Button>
            </div>

            {/* Features */}
            <ul className="space-y-3 px-3 py-4 flex-1">
              {starterFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FF520A' }} />
                  <span className="text-foreground">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Core Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F7F8F7] rounded-[20px] p-2 flex flex-col"
          >
            {/* Title Card */}
            <div 
              className="bg-white rounded-[16px] p-5 mb-2"
              style={{
                boxShadow: '0px 1px 4px rgba(12, 12, 13, 0.1), 0px 1px 4px rgba(12, 12, 13, 0.05)'
              }}
            >
              <h3 className="text-lg font-medium text-foreground mb-4">{t(professional.name)}</h3>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {money(professional.price)}
                </span>
                <span className="text-muted-foreground">{t("+ state fee")}</span>
              </div>

              <Button asChild variant="lime" className="w-full rounded-full">
                <Link to="/start?plan=professional">{t("GET STARTED")}</Link>
              </Button>
            </div>

            {/* Features */}
            <ul className="space-y-3 px-3 py-4 flex-1">
              {coreFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FF520A' }} />
                  <span className="text-foreground">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Custom Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#1F2420] rounded-[20px] p-2 flex flex-col"
          >
            {/* Title Card */}
            <div 
              className="bg-[#2A2F2B] rounded-[16px] p-5 mb-2"
              style={{
                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.3), 0px 1px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h3 className="text-lg font-medium text-white mb-4">{t(international.name)}</h3>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">{money(international.price)}</span>
                <span className="text-white/70">{t("+ state fee")}</span>
              </div>

              <Button asChild variant="heroOutline" className="w-full bg-white text-foreground hover:bg-white/90 rounded-full py-2 pr-[2px] pl-6 relative justify-center">
                <Link to="/start?plan=international">
                  {t("GET STARTED")}
                  <span className="bg-foreground rounded-full p-2 absolute right-2">
                    <ArrowUpRight size={18} className="text-background" />
                  </span>
                </Link>
              </Button>
            </div>

            {/* Features */}
            <ul className="space-y-3 px-3 py-4 flex-1">
              {customFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FF520A' }} />
                  <span className="text-white/90">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Business + Website bundle: formation and a website in one order */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-[20px] border-2 border-[#FF7732] bg-[#FFF6F1] p-2"
        >
          <div className="grid gap-2 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <div className="bg-white rounded-[16px] p-5" style={{ boxShadow: '0px 1px 4px rgba(12, 12, 13, 0.1), 0px 1px 4px rgba(12, 12, 13, 0.05)' }}>
              <p className="inline-block rounded-full bg-[#FF7732] px-3 py-1 text-xs font-semibold text-white mb-3">{t("Company + website")}</p>
              <h3 className="text-lg font-medium text-foreground mb-1">{t(bundle.name)}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t(bundle.tagline)}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">{money(bundle.price)}</span>
                <span className="text-muted-foreground">{t("+ state fee")}</span>
              </div>
              <Button asChild variant="lime" className="w-full rounded-full">
                <Link to="/start?plan=business_website">{t("GET STARTED")}</Link>
              </Button>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 px-3 py-4 content-start">
              {bundle.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FF520A' }} />
                  <span className="text-foreground">{t(feature)}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className="mt-8 rounded-[20px] bg-[#F7F8F7] p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-foreground">{t("Add-ons")}</h3>
              <p className="text-sm text-muted-foreground">{t("Add these at checkout. We prepare documents only and refer you to partner CPAs and attorneys for legal or tax advice.")}</p>
            </div>
            <Link to="/start" className="shrink-0 inline-flex items-center justify-center rounded-full border border-border bg-background px-5 h-10 text-sm font-medium text-foreground hover:bg-muted">
              {t("Not sure? Ask our AI advisor")}
            </Link>
          </div>
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {EXTRAS.map((x) => (
              <li key={x.id} className="rounded-xl bg-background p-3 text-sm">
                <p className="text-foreground">{t(x.name)}</p>
                <p className="font-semibold text-foreground">{money(x.price)}{x.note && <span className="font-normal text-muted-foreground"> {t(x.note)}</span>}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
export default PricingSection;