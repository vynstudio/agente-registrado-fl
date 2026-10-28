// The saved-card authorization the client accepts at checkout, stored on the order as the record of
// consent. Keep the wording in sync with the checkbox in src/pages/Start.tsx and its translations.
const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function cardAuthorizationText(lang: "en" | "es" | "pt", stateFeeCents: number) {
  const fee = usd(stateFeeCents);
  return {
    en: `I authorize Diler Services, LLC to save my card with Stripe and to charge it (1) ${fee} for the Florida state filing fees of this order, when the filing is submitted, and (2) until I cancel, for the yearly renewal of registered agent service ($119) and annual report filing ($119 plus the Florida annual report fee), with notice before each renewal charge. I can cancel future charges at any time by contacting Diler Services, LLC.`,
    es: `Autorizo a Diler Services, LLC a guardar mi tarjeta con Stripe y a cobrarle (1) ${fee} por las tarifas estatales de Florida de este pedido, cuando se presente el trámite, y (2) hasta que yo cancele, la renovación anual del servicio de agente registrado ($119) y la presentación del informe anual ($119 más la tarifa estatal del informe anual), con aviso antes de cada cobro de renovación. Puedo cancelar los cobros futuros en cualquier momento contactando a Diler Services, LLC.`,
    pt: `Autorizo a Diler Services, LLC a salvar meu cartão na Stripe e a cobrar (1) ${fee} pelas taxas estaduais da Flórida deste pedido, quando o registro for enviado, e (2) até que eu cancele, a renovação anual do serviço de agente registrado ($119) e do relatório anual ($119 mais a taxa estadual do relatório anual), com aviso antes de cada cobrança de renovação. Posso cancelar cobranças futuras a qualquer momento entrando em contato com a Diler Services, LLC.`,
  }[lang];
}
