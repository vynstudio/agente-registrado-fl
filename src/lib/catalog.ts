// Display copy for plans and extras. Prices charged are decided server-side
// (supabase/functions/_shared/catalog.ts) — keep amounts in sync.
export type Plan = "starter" | "professional" | "international" | "business_website";
export type Entity = "llc" | "corp";
export type Extra = "ein" | "annual_report" | "registered_agent" | "expedited";
export type Monthly = "compliance" | "compliance_plus";

export const PLANS: { id: Plan; name: string; price: number; tagline: string; features: string[] }[] = [
  {
    id: "starter",
    name: "Starter",
    price: 149,
    tagline: "For simple new companies with basic needs.",
    features: [
      "Articles prepared and filed with Sunbiz",
      "Operating agreement (LLC) or bylaws (corporation)",
      "1 year of registered agent service",
      "Our address as your registered agent on Sunbiz",
      "Referrals to partner CPAs and attorneys",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 249,
    tagline: "For running your business with more compliance help.",
    features: [
      "Everything in Starter",
      "EIN (tax ID) from the IRS",
      "Expedited same-day submission",
      "Certificate of status (+ state fee)",
      "One amendment or name change in first 90 days (+ state fee)",
    ],
  },
  {
    id: "international",
    name: "International+",
    price: 449,
    tagline: "For founders who live outside the US.",
    features: [
      "Everything in Professional",
      "EIN for non-US owners (no SSN needed)",
      "Apostille of formation documents (+ state fee)",
      "Certificate of incumbency",
      "One fictitious name (DBA) filing (+ state fee)",
      "US business bank account guidance",
    ],
  },
  {
    id: "business_website",
    name: "Business + Website",
    price: 1199,
    tagline: "For founders who want to launch with a professional website.",
    features: [
      "Everything in Professional",
      "7-page website in Spanish and English",
      "2 rounds of revisions",
      "Google Business Profile setup",
      "Business email setup (email service billed by the provider)",
      "Delivered within 21 business days after we receive your content",
      "Hosting, updates and small edits: care plan $29/month after launch",
    ],
  },
];

// Optional monthly plans (Stripe subscription from checkout). Amounts must match MONTHLY_PRICES
// in supabase/functions/_shared/catalog.ts.
export const MONTHLY_PLANS: { id: Monthly; name: string; price: number; tagline: string; features: string[] }[] = [
  {
    id: "compliance",
    name: "Compliance",
    price: 19,
    tagline: "Keep your company active with the state, without tracking deadlines.",
    features: [
      "Registered agent service, renewed every year",
      "Annual report filed with Sunbiz every year (+ state fee)",
      "State notices and legal papers scanned to you the same day",
      "Deadline reminders and Sunbiz status monitoring",
    ],
  },
  {
    id: "compliance_plus",
    name: "Compliance Plus",
    price: 39,
    tagline: "For companies that need a Florida business address.",
    features: [
      "Everything in Compliance",
      "Florida business address for your company",
      "Unlimited mail scanning",
      "Address changes and amendments filed at no service fee (+ state fee)",
      "Certificate of status every year (+ state fee)",
      "Priority phone support in Spanish, English and Portuguese",
    ],
  },
];

export const STATE_FEE: Record<Entity, number> = { llc: 125, corp: 70 };
export const ANNUAL_REPORT_FEE: Record<Entity, number> = { llc: 138.75, corp: 150 };

export const EXTRAS: { id: Extra; name: string; price: number; note?: string }[] = [
  { id: "ein", name: "EIN (tax ID) application", price: 99 },
  { id: "annual_report", name: "Annual report filing", price: 119, note: "+ state fee" },
  { id: "registered_agent", name: "Registered agent service (1 year)", price: 119 },
  { id: "expedited", name: "Expedited same-day submission", price: 69 },
];

export const INCLUDED: Record<Plan, Extra[]> = {
  starter: ["registered_agent"],
  professional: ["registered_agent", "ein", "expedited"],
  international: ["registered_agent", "ein", "expedited"],
  business_website: ["registered_agent", "ein", "expedited"],
};

// A monthly plan covers the annual report, so that add-on isn't sold with one.
export const includedWith = (plan: Plan, monthly: Monthly | null): Extra[] =>
  [...INCLUDED[plan], ...(monthly ? ["annual_report" as const] : [])];

// Today's checkout charge (our service fees plus a monthly plan's first month) and the state fees
// charged later to the saved card. Must match buildLineItems in supabase/functions/_shared/catalog.ts.
export function orderTotal(plan: Plan, entity: Entity, extras: Extra[], monthly: Monthly | null = null) {
  const p = PLANS.find((x) => x.id === plan)!;
  const lines: { label: string; amount: number }[] = [{ label: `${p.name} package`, amount: p.price }];
  const stateLines: { label: string; amount: number }[] = [{ label: "Florida state filing fee", amount: STATE_FEE[entity] }];
  const m = MONTHLY_PLANS.find((x) => x.id === monthly);
  if (m) lines.push({ label: `${m.name} plan (first month)`, amount: m.price });
  for (const e of extras) {
    if (includedWith(plan, monthly).includes(e)) continue;
    const x = EXTRAS.find((y) => y.id === e)!;
    lines.push({ label: x.name, amount: x.price });
    if (e === "annual_report") stateLines.push({ label: "Florida annual report state fee", amount: ANNUAL_REPORT_FEE[entity] });
  }
  const sum = (l: { amount: number }[]) => Math.round(l.reduce((s, x) => s + x.amount, 0) * 100) / 100;
  return { lines, total: sum(lines), stateLines, stateTotal: sum(stateLines) };
}

export const money = (n: number) => `$${n % 1 ? n.toFixed(2) : n}`;
