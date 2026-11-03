// The saved-card authorization the client accepts at checkout, stored on the order as the record of
// consent. Keep the wording in sync with the checkbox in src/pages/Start.tsx and its translations.
import type { Monthly } from "./catalog.ts";

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;
type Lang = "en" | "es" | "pt";

export const MONTHLY_NAMES: Record<Lang, Record<Monthly, string>> = {
  en: { compliance: "Compliance plan", compliance_plus: "Compliance Plus plan" },
  es: { compliance: "plan Cumplimiento", compliance_plus: "plan Cumplimiento Plus" },
  pt: { compliance: "plano Conformidade", compliance_plus: "plano Conformidade Plus" },
};

// With a monthly plan, the plan covers renewals and only Florida's annual report fee is charged yearly.
export function cardAuthorizationText(lang: Lang, stateFeeCents: number, monthly?: { plan: Monthly; cents: number; annualFeeCents: number }) {
  const fee = usd(stateFeeCents);
  if (monthly) {
    const plan = MONTHLY_NAMES[lang][monthly.plan], price = usd(monthly.cents), annual = usd(monthly.annualFeeCents);
    return {
      en: `I authorize Diler Services, LLC to save my card with Stripe and to charge it (1) ${fee} for the Florida state filing fees of this order, when the filing is submitted, (2) ${price} per month for the ${plan}, starting today, until I cancel, and (3) once a year while the plan is active, the Florida annual report fee (${annual}) when the annual report is filed. I can cancel the plan and future charges at any time by contacting Diler Services, LLC.`,
      es: `Autorizo a Diler Services, LLC a guardar mi tarjeta con Stripe y a cobrarle (1) ${fee} por las tarifas estatales de Florida de este pedido, cuando se presente el trámite, (2) ${price} al mes por el ${plan}, desde hoy y hasta que yo cancele, y (3) una vez al año mientras el plan esté activo, la tarifa estatal del informe anual de Florida (${annual}) cuando se presente el informe. Puedo cancelar el plan y los cobros futuros en cualquier momento contactando a Diler Services, LLC.`,
      pt: `Autorizo a Diler Services, LLC a salvar meu cartão na Stripe e a cobrar (1) ${fee} pelas taxas estaduais da Flórida deste pedido, quando o registro for enviado, (2) ${price} por mês pelo ${plan}, a partir de hoje e até que eu cancele, e (3) uma vez por ano enquanto o plano estiver ativo, a taxa estadual do relatório anual da Flórida (${annual}) quando o relatório for enviado. Posso cancelar o plano e as cobranças futuras a qualquer momento entrando em contato com a Diler Services, LLC.`,
    }[lang];
  }
  return {
    en: `I authorize Diler Services, LLC to save my card with Stripe and to charge it (1) ${fee} for the Florida state filing fees of this order, when the filing is submitted, and (2) until I cancel, for the yearly renewal of registered agent service ($119) and annual report filing ($119 plus the Florida annual report fee), with notice before each renewal charge. I can cancel future charges at any time by contacting Diler Services, LLC.`,
    es: `Autorizo a Diler Services, LLC a guardar mi tarjeta con Stripe y a cobrarle (1) ${fee} por las tarifas estatales de Florida de este pedido, cuando se presente el trámite, y (2) hasta que yo cancele, la renovación anual del servicio de agente registrado ($119) y la presentación del informe anual ($119 más la tarifa estatal del informe anual), con aviso antes de cada cobro de renovación. Puedo cancelar los cobros futuros en cualquier momento contactando a Diler Services, LLC.`,
    pt: `Autorizo a Diler Services, LLC a salvar meu cartão na Stripe e a cobrar (1) ${fee} pelas taxas estaduais da Flórida deste pedido, quando o registro for enviado, e (2) até que eu cancele, a renovação anual do serviço de agente registrado ($119) e do relatório anual ($119 mais a taxa estadual do relatório anual), com aviso antes de cada cobrança de renovação. Posso cancelar cobranças futuras a qualquer momento entrando em contato com a Diler Services, LLC.`,
  }[lang];
}
