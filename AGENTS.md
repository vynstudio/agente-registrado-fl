# Agent rules

- Informational service and policy pages use a shared public-page renderer with English-keyed content and a separately imported ES/PT translation map. Why: all five pages share layout and stay within the existing translation fallback convention.

- Site text is translated with `t("English text")` from `src/i18n/LanguageContext.tsx`; the English string is the key in `src/i18n/translations.ts` (es, pt). Why: missing translations fall back to English, so adding copy never breaks a language.
- Prices charged are decided only in `supabase/functions/_shared/catalog.ts` (tested by `catalog.test.ts`, run with deno); `src/lib/catalog.ts` mirrors them for display. Why: the browser must never set what a customer pays.
- Orders are inserted by the `create-checkout` edge function (service role) and marked paid by `payments-webhook` via `metadata.orderId`; only admins can read them. Why: no public write access to orders.
- The AI plan advisor runs in the `plan-advisor` edge function and returns general info only, never legal/tax advice. Why: the business refers clients to partner CPAs/attorneys.
