import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { buildLineItems } from "../_shared/catalog.ts";
import { money, sendAlert } from "../_shared/alerts.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const text = (max: number) => z.string().trim().min(1).max(max);
const schema = z.object({
  environment: z.enum(["sandbox", "live"]),
  returnUrl: z.string().url().max(500),
  language: z.enum(["en", "es", "pt"]).default("en"),
  plan: z.enum(["starter", "professional", "international", "business_website"]),
  entityType: z.enum(["llc", "corp"]),
  extras: z.array(z.enum(["ein", "annual_report", "registered_agent", "expedited"])).max(4).default([]),
  companyName: text(120),
  altCompanyName: z.string().trim().max(120).optional().default(""),
  businessPurpose: z.string().trim().max(500).optional().default(""),
  owners: z.array(z.object({
    name: text(120),
    ownership: z.number().min(0).max(100),
    role: z.enum(["Member", "Manager", "Member and manager", "President and director", "President", "Vice president", "Secretary", "Treasurer", "Director", "Shareholder only"]),
    address: text(300),
  })).min(1).max(10),
  contactName: text(120),
  contactEmail: z.string().trim().email().max(255),
  contactPhone: text(40),
  country: text(80),
  address: text(300),
  filing: z.object({
    principalAddress: z.object({ street: text(200), city: text(80), region: text(80), zip: text(20), country: text(80) }),
    mailingSameAsPrincipal: z.boolean(),
    management: z.enum(["member", "manager"]).optional(),
    shares: z.number().int().min(1).max(1_000_000_000).optional(),
    effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
  // EIN questions only; SSNs and ITINs are collected by phone, never here.
  ein: z.object({
    responsibleParty: text(120),
    taxId: z.enum(["ssn", "itin", "none"]),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    activity: text(200),
    employees: z.number().int().min(0).max(100_000),
  }).optional(),
  signatureName: text(120),
  agreedToTerms: z.literal(true),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Please check the form and try again." }, 400);
    const d = parsed.data;
    const env = d.environment as StripeEnv;
    const { items, extras, totalCents } = buildLineItems(d.plan, d.entityType, d.extras);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order, error } = await db.from("orders").insert({
      plan: d.plan, entity_type: d.entityType, extras,
      company_name: d.companyName, alt_company_name: d.altCompanyName || null,
      business_purpose: d.businessPurpose || null, owners: d.owners,
      contact_name: d.contactName, contact_email: d.contactEmail, contact_phone: d.contactPhone,
      country: d.country, address: d.address, language: d.language,
      total_cents: totalCents, environment: env,
      filing: d.filing,
      ein: d.ein ?? null,
      // Authorization record (typed signature, time, IP, browser), kept as evidence of the client's consent.
      signature_name: d.signatureName,
      authorized_at: new Date().toISOString(),
      client_ip: req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    }).select("id").single();
    if (error) throw error;

    const stripe = createStripeClient(env);
    const prices = await stripe.prices.list({ lookup_keys: items.map((i) => i.priceId), limit: 20 });
    const byKey = new Map(prices.data.map((p) => [p.lookup_key, p.id]));
    const line_items = items.map((i) => {
      const id = byKey.get(i.priceId);
      if (!id) throw new Error(`Price not found: ${i.priceId}`);
      return { price: id, quantity: 1 };
    });

    const existing = await stripe.customers.list({ email: d.contactEmail, limit: 1 });
    const customer = existing.data[0]?.id ??
      (await stripe.customers.create({ email: d.contactEmail, name: d.contactName, phone: d.contactPhone })).id;

    const planName = { starter: "Starter", professional: "Professional", international: "International+", business_website: "Business + Website" }[d.plan];
    // Shown above the pay button; also the customer's agreement record if a charge is disputed.
    const termsNotice = {
      en: "By paying, you agree to our [Terms of Service](https://agenteregistradofl.com/terms) and [Refund policy](https://agenteregistradofl.com/refund-policy). Full refund until we submit your filing; state fees paid on your behalf are non-refundable.",
      es: "Al pagar, acepta nuestros [Términos del servicio](https://agenteregistradofl.com/terms) y nuestra [Política de reembolsos](https://agenteregistradofl.com/refund-policy). Reembolso completo hasta que presentemos su trámite; las tarifas estatales pagadas en su nombre no son reembolsables.",
      pt: "Ao pagar, você aceita nossos [Termos de serviço](https://agenteregistradofl.com/terms) e nossa [Política de reembolso](https://agenteregistradofl.com/refund-policy). Reembolso total até enviarmos seu registro; as taxas estaduais pagas em seu nome não são reembolsáveis.",
    }[d.language];
    const params = {
      line_items,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: d.returnUrl,
      customer,
      locale: d.language,
      automatic_tax: { enabled: true },
      customer_update: { address: "auto" },
      payment_intent_data: { description: `${planName} — Florida ${d.entityType === "llc" ? "LLC" : "corporation"}: ${d.companyName}` },
      metadata: { orderId: order.id },
      custom_text: { submit: { message: termsNotice } },
    };
    // Tax calculation needs a business address in the payments account. Until it's set,
    // fall back to checkout without tax so customers can still pay.
    let session;
    try {
      session = await stripe.checkout.sessions.create(params as any);
    } catch (e) {
      if (!String((e as Error).message).includes("head office address")) throw e;
      console.warn("Tax not configured yet; creating checkout without automatic tax");
      const { automatic_tax: _t, customer_update: _c, ...rest } = params;
      session = await stripe.checkout.sessions.create(rest as any);
    }

    await db.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
    // A lead: they reached payment but haven't paid yet. A separate alert follows if they pay.
    await sendAlert(`${env === "sandbox" ? "[TEST] " : ""}🟡 New lead — checkout started`, [
      ["Company", d.companyName],
      ["Package", `${planName} · ${d.entityType === "llc" ? "LLC" : "Corporation"}`],
      ["Total", money(totalCents)],
      ["Name", d.contactName],
      ["Phone", d.contactPhone],
      ["Email", d.contactEmail],
      ["Lives in", d.country],
    ]);
    return json({ clientSecret: session.client_secret, orderId: order.id });
  } catch (e) {
    console.error("create-checkout error", e);
    return json({ error: "Could not start checkout. Please try again." }, 500);
  }
});
