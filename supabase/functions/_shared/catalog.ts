// Server-side source of truth for what can be bought and what it costs.
// Keep in sync with src/lib/catalog.ts (display only).
export type Plan = "starter" | "professional" | "international" | "business_website";
export type Entity = "llc" | "corp";
export type Extra = "ein" | "annual_report" | "registered_agent" | "expedited";

export const PLAN_PRICES: Record<Plan, { priceId: string; cents: number }> = {
  starter: { priceId: "plan_starter_onetime", cents: 14900 },
  professional: { priceId: "plan_professional_onetime", cents: 24900 },
  international: { priceId: "plan_international_onetime", cents: 44900 },
  // Professional formation + 7-page bilingual website (care plan billed separately after launch).
  business_website: { priceId: "plan_business_website_onetime", cents: 119900 },
};
// State fees are no longer Stripe checkout prices; priceId is kept for reference only.
export const STATE_FEE: Record<Entity, { priceId: string; cents: number }> = {
  llc: { priceId: "fl_state_fee_llc_onetime", cents: 12500 },
  corp: { priceId: "fl_state_fee_corp_onetime", cents: 7000 },
};
export const EXTRA_PRICES: Record<Extra, { priceId: string; cents: number }> = {
  ein: { priceId: "extra_ein_onetime", cents: 9900 },
  annual_report: { priceId: "extra_annual_report_onetime", cents: 11900 },
  registered_agent: { priceId: "extra_registered_agent_onetime", cents: 11900 },
  expedited: { priceId: "extra_expedited_onetime", cents: 6900 },
};
export const ANNUAL_REPORT_FEE: Record<Entity, { priceId: string; cents: number }> = {
  llc: { priceId: "fl_annual_report_fee_llc_onetime", cents: 13875 },
  corp: { priceId: "fl_annual_report_fee_corp_onetime", cents: 15000 },
};
// Extras already included in a plan can't be bought again.
export const INCLUDED: Record<Plan, Extra[]> = {
  starter: ["registered_agent"],
  professional: ["registered_agent", "ein", "expedited"],
  international: ["registered_agent", "ein", "expedited"],
  business_website: ["registered_agent", "ein", "expedited"],
};

// What the client pays at checkout: our service fees only. State fees are charged later to the
// card saved at checkout (see SAVED_CARD_CHARGES), when we file and pay the State of Florida.
export function buildLineItems(plan: Plan, entity: Entity, extras: Extra[]) {
  const chosen = [...new Set(extras)].filter((e) => !INCLUDED[plan].includes(e));
  const items = [PLAN_PRICES[plan], ...chosen.map((e) => EXTRA_PRICES[e])];
  const stateFeeCents = STATE_FEE[entity].cents + (chosen.includes("annual_report") ? ANNUAL_REPORT_FEE[entity].cents : 0);
  return { items, extras: chosen, totalCents: items.reduce((s, i) => s + i.cents, 0), stateFeeCents };
}

// Charges an admin can make to the client's saved card, as the client authorized at checkout.
// "period" keeps each charge to once per order (state fee) or once per year (renewals).
export type SavedCardCharge = "state_fee" | "annual_report_renewal" | "registered_agent_renewal";
export const SAVED_CARD_CHARGES: Record<SavedCardCharge, {
  label: string;
  cents: (entity: Entity, extras: string[]) => number;
  period: (year: number) => string;
}> = {
  state_fee: {
    label: "Florida state filing fee",
    cents: (entity, extras) => STATE_FEE[entity].cents + (extras.includes("annual_report") ? ANNUAL_REPORT_FEE[entity].cents : 0),
    period: () => "formation",
  },
  annual_report_renewal: {
    label: "Annual report filing (service + Florida annual report fee)",
    cents: (entity) => EXTRA_PRICES.annual_report.cents + ANNUAL_REPORT_FEE[entity].cents,
    period: (year) => String(year),
  },
  registered_agent_renewal: {
    label: "Registered agent service renewal (1 year)",
    cents: () => EXTRA_PRICES.registered_agent.cents,
    period: (year) => String(year),
  },
};
