import { useLang } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";

// Diler Corporate home page only (English site): explains the brand as the founder's
// "corporate department" and speaks to international founders.
const departments = [{
  label: "Formation",
  title: "We set up your company",
  description: "We prepare your Articles of Organization or Incorporation and file them with the State of Florida (Sunbiz), usually within 1 business day.",
}, {
  label: "Official Florida office",
  title: "Your registered agent",
  description: "Florida requires every company to have a registered agent with a Florida street address. We are that official contact: we receive legal notices and state mail for your company and forward them to you.",
}, {
  label: "Compliance",
  title: "We keep you in good standing",
  description: "EIN from the IRS, your Florida annual report before the May 1 deadline, amendments and name changes, so your company stays active.",
}];

const international = [
  "EIN for owners without a US Social Security number",
  "Apostilled formation documents for banks and authorities abroad",
  "Certificate of incumbency and certificate of status",
  "Guidance on opening a US business bank account",
  "Help in English, Spanish and Portuguese",
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const CorporateDepartmentSection = () => {
  const { t } = useLang();
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div {...fadeUp} className="mb-12 max-w-3xl">
          <div className="inline-block px-6 py-2 bg-[#F6F8F7] border border-[#E8E8E8] rounded-[100px] mb-2">
            <p className="text-[12px] font-medium text-[#1F2420]">{t("// Your corporate department //")}</p>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-[40px] font-medium text-foreground leading-tight text-balance">
            {t("What a corporate office does for a large company, we do for yours")}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {departments.map((d, i) => (
            <motion.div key={d.label} {...fadeUp} transition={{ delay: i * 0.08 }}
              className="rounded-[24px] border border-border bg-[#F6F8F7] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">{t(d.label)}</p>
              <h3 className="text-xl font-medium text-foreground mb-3">{t(d.title)}</h3>
              <p className="text-muted-foreground leading-relaxed">{t(d.description)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} className="mt-6 rounded-[24px] bg-foreground text-background p-6 md:p-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-medium leading-tight mb-4 text-balance">
              {t("Built for founders outside the US")}
            </h3>
            <p className="text-background/75 leading-relaxed mb-6">
              {t("You don't need to live in the US or be a US citizen to own a Florida company. Our International+ plan covers what founders abroad need, done online.")}
            </p>
            <Link to="/start" className="inline-flex items-center gap-2 bg-background text-foreground hover:bg-background/90 rounded-full py-2 pr-2 pl-6 text-sm font-medium h-10 transition-colors">
              {t("START MY BUSINESS")}
              <span className="bg-foreground rounded-full p-1.5">
                <ArrowUpRight size={18} className="text-background" />
              </span>
            </Link>
          </div>
          <ul className="space-y-3">
            {international.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <Check size={20} className="shrink-0 mt-0.5 text-accent" aria-hidden="true" />
                <span>{t(item)}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default CorporateDepartmentSection;
