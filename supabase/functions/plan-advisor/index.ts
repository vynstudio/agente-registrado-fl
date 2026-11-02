import Anthropic from "npm:@anthropic-ai/sdk@0.134.0";
import { z } from "npm:zod@3";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const input = z.object({
  description: z.string().trim().min(20).max(2000),
  language: z.enum(["en", "es", "pt"]).default("en"),
});

const recommendation = z.object({
  entityType: z.enum(["llc", "corp"]),
  plan: z.enum(["starter", "professional", "international", "business_website"]),
  extras: z.array(z.enum(["ein", "annual_report", "registered_agent", "expedited"])),
  summary: z.string(),
  reasons: z.array(z.string()),
  talkToProfessional: z.array(z.string()),
});

// Same shape as `recommendation`, as JSON Schema for Claude's structured output.
const recommendationJsonSchema = {
  type: "object",
  properties: {
    entityType: { type: "string", enum: ["llc", "corp"] },
    plan: { type: "string", enum: ["starter", "professional", "international", "business_website"] },
    extras: { type: "array", items: { type: "string", enum: ["ein", "annual_report", "registered_agent", "expedited"] } },
    summary: { type: "string" },
    reasons: { type: "array", items: { type: "string" } },
    talkToProfessional: { type: "array", items: { type: "string" } },
  },
  required: ["entityType", "plan", "extras", "summary", "reasons", "talkToProfessional"],
  additionalProperties: false,
};

const LANG = { en: "English", es: "Spanish", pt: "Brazilian Portuguese" } as const;

const instructions = (lang: keyof typeof LANG) => `You help visitors of "Agente Registrado Florida", a Florida business formation service, pick a company type and package.
You are NOT a lawyer or accountant and must not give legal or tax advice. Give general, educational guidance only.

Company types:
- llc: Florida LLC. Simple, flexible, good for most small businesses, freelancers, e-commerce, real estate holding, single owners. Florida state fee $125.
- corp: Florida corporation. Better when the owner plans to raise outside investment, issue shares, or wants a classic corporate structure. Florida state fee $70.

Packages (one-time):
- starter ($149): articles filed, operating agreement or bylaws, 1 year registered agent (our Florida address in the registered agent section on Sunbiz; owner and company addresses may still be public). For US residents who already have or don't need an EIN.
- professional ($249): starter + EIN application assistance, expedited same-day submission, certificate of status (+ state fee), one amendment in the first 90 days (+ state fee). For most US-based founders.
- international ($449): professional + EIN assistance for non-US owners without SSN, apostille (+ state fee), certificate of incumbency, one fictitious name (DBA) filing (+ state fee), bank account guidance. For owners living outside the US.
- business_website ($1,199): professional + a 7-page website in Spanish and English, 2 revision rounds, Google Business Profile setup and business email setup, delivered within 21 business days after the client sends content; hosting and updates need a $29/month care plan after launch. For US-based founders who say they want or need a website.
State approval and IRS processing times vary; never promise approval, timing, a bank account or privacy of owner information.

Optional extras (only suggest if clearly useful and not included in the plan): ein (starter only), annual_report (prepay first annual report), registered_agent (already included in all plans, normally don't suggest), expedited (starter only).

Rules:
- If the owner lives outside the US, recommend international.
- Recommend business_website only when the visitor mentions wanting or needing a website, online presence or customers finding them online, and they live in the US.
- Write summary (1-2 sentences), reasons (2-4 short bullets) and talkToProfessional (1-3 short bullets on questions they should ask a CPA or attorney, e.g. taxes, S-corp election, licenses) in ${LANG[lang]}.
- Never promise tax savings or legal outcomes.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Please describe your business in a few sentences." }, 400);
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "The advisor is not configured." }, 500);

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.beta.messages.create(
      {
        model: "claude-opus-5-5",
        max_tokens: 4000,
        output_config: { effort: "low", format: { type: "json_schema", schema: recommendationJsonSchema } },
        // On a safety decline, the API re-runs the request on a fallback model in the same call.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: instructions(parsed.data.language),
        messages: [{ role: "user", content: parsed.data.description }],
      },
      { signal: req.signal },
    );
    if (response.stop_reason === "refusal") {
      return json({ error: "The advisor could not answer right now. Please try again." }, 500);
    }
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const output = recommendation.parse(JSON.parse(text));
    return json({ recommendation: output });
  } catch (e) {
    const status = e instanceof Anthropic.APIError ? e.status : undefined;
    console.error("plan-advisor error", status, (e as Error).message);
    if (status === 429) return json({ error: "The advisor is busy. Please try again in a minute." }, 429);
    if (status === 402) return json({ error: "The advisor is temporarily unavailable." }, 402);
    return json({ error: "The advisor could not answer right now. Please try again." }, 500);
  }
});
