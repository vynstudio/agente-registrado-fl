// Emails the client an order confirmation, in the language they ordered in, once the order is paid.
// The site's Cloudflare worker sends it (worker/alert-email.js, /api/client-email), using the same
// ALERT_SECRET as owner alerts. Never blocks the caller: failures are only logged.
import { money } from "./alerts.ts";

type Lang = "en" | "es" | "pt";
type Order = {
  company_name: string;
  plan: string;
  entity_type: string;
  extras: string[] | null;
  total_cents: number;
  contact_name: string;
  contact_email: string;
  language: string | null;
  ein: { taxId?: string } | null;
};

const PLAN_NAMES: Record<string, string> = { starter: "Starter", professional: "Professional", international: "International+", business_website: "Business + Website" };
const PHONE = "(863) 450-1800";

const copy = {
  es: {
    subject: (company: string) => `Recibimos su pedido: ${company}`,
    hello: (name: string) => `Hola ${name}:`,
    thanks: (company: string) => `Gracias por su pago. Recibimos su pedido para ${company}.`,
    package: "Paquete", extras: "Servicios adicionales", paid: "Total pagado",
    entity: { llc: "LLC", corp: "Corporación" } as Record<string, string>,
    extra: { ein: "Solicitud de EIN", annual_report: "Informe anual", registered_agent: "Agente registrado (1 año)", expedited: "Presentación el mismo día" } as Record<string, string>,
    next: "Próximos pasos:",
    file: "Revisamos sus datos y presentamos su trámite ante el Estado de Florida (Sunbiz), normalmente en 1 día hábil. Le avisaremos si falta algo.",
    website: "Le escribiremos en 1 día hábil para pedirle su logo, fotos y textos del sitio web.",
    einCall: (phone: string) => `Le llamaremos al teléfono de su pedido para completar la solicitud del EIN con su SSN o ITIN. Nunca lo envíe por correo. Si prefiere, llámenos al ${phone}.`,
    einForeign: "Tramitaremos su EIN ante el IRS por el proceso para solicitantes sin SSN ni ITIN.",
    docs: "Le enviaremos por correo los documentos aprobados.",
    questions: `¿Preguntas? Llámenos al ${PHONE} o responda a este correo.`,
    receipt: "Stripe le envía aparte el recibo de pago.",
    brand: "Agente Registrado Florida",
  },
  en: {
    subject: (company: string) => `We received your order: ${company}`,
    hello: (name: string) => `Hi ${name},`,
    thanks: (company: string) => `Thank you for your payment. We received your order for ${company}.`,
    package: "Package", extras: "Add-ons", paid: "Total paid",
    entity: { llc: "LLC", corp: "Corporation" } as Record<string, string>,
    extra: { ein: "EIN application", annual_report: "Annual report", registered_agent: "Registered agent (1 year)", expedited: "Same-day submission" } as Record<string, string>,
    next: "Next steps:",
    file: "We review your details and file with the State of Florida (Sunbiz), usually within 1 business day. We'll contact you if anything is missing.",
    website: "We'll email you within 1 business day to collect your logo, photos and website content.",
    einCall: (phone: string) => `We'll call the phone number on your order to complete the EIN application with your SSN or ITIN. Never send it by email. You can also call us at ${phone}.`,
    einForeign: "We'll apply for your EIN with the IRS using the process for applicants without an SSN or ITIN.",
    docs: "We'll email you the approved documents.",
    questions: `Questions? Call us at ${PHONE} or reply to this email.`,
    receipt: "Stripe sends your payment receipt separately.",
    brand: "Florida Registered Agent",
  },
  pt: {
    subject: (company: string) => `Recebemos seu pedido: ${company}`,
    hello: (name: string) => `Olá ${name},`,
    thanks: (company: string) => `Obrigado pelo pagamento. Recebemos seu pedido para ${company}.`,
    package: "Pacote", extras: "Serviços adicionais", paid: "Total pago",
    entity: { llc: "LLC", corp: "Corporação" } as Record<string, string>,
    extra: { ein: "Solicitação de EIN", annual_report: "Relatório anual", registered_agent: "Agente registrado (1 ano)", expedited: "Envio no mesmo dia" } as Record<string, string>,
    next: "Próximos passos:",
    file: "Revisamos seus dados e protocolamos seu pedido no Estado da Flórida (Sunbiz), normalmente em 1 dia útil. Avisaremos se faltar algo.",
    website: "Vamos escrever em 1 dia útil para pedir seu logo, fotos e textos do site.",
    einCall: (phone: string) => `Vamos ligar para o telefone do pedido para concluir a solicitação do EIN com seu SSN ou ITIN. Nunca o envie por e-mail. Se preferir, ligue para ${phone}.`,
    einForeign: "Vamos solicitar seu EIN ao IRS pelo processo para quem não tem SSN nem ITIN.",
    docs: "Enviaremos por e-mail os documentos aprovados.",
    questions: `Dúvidas? Ligue para ${PHONE} ou responda a este e-mail.`,
    receipt: "A Stripe envia o recibo de pagamento separadamente.",
    brand: "Agente Registrado da Flórida",
  },
};

export function orderConfirmation(order: Order) {
  const lang: Lang = order.language === "en" || order.language === "pt" ? order.language : "es";
  const c = copy[lang];
  const extras = (order.extras ?? []).map((e) => c.extra[e] ?? e);
  const steps = [
    c.file,
    ...(order.plan === "business_website" ? [c.website] : []),
    ...(order.ein ? [order.ein.taxId === "none" ? c.einForeign : c.einCall(PHONE)] : []),
    c.docs,
  ];
  const text = [
    c.hello(order.contact_name),
    "",
    c.thanks(order.company_name),
    "",
    `${c.package}: ${PLAN_NAMES[order.plan] ?? order.plan} · ${c.entity[order.entity_type] ?? order.entity_type}`,
    ...(extras.length ? [`${c.extras}: ${extras.join(", ")}`] : []),
    `${c.paid}: ${money(order.total_cents)}`,
    "",
    c.next,
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    c.questions,
    c.receipt,
    "",
    c.brand,
    "Diler Services, LLC",
    "https://agenteregistradofl.com",
  ].join("\n");
  return { to: order.contact_email, fromName: c.brand, subject: c.subject(order.company_name).slice(0, 200), text };
}

export async function sendOrderConfirmation(order: Order) {
  const secret = Deno.env.get("ALERT_SECRET");
  if (!secret) return;
  try {
    const res = await fetch("https://agenteregistradofl.com/api/client-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-alert-secret": secret },
      body: JSON.stringify(orderConfirmation(order)),
    });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  } catch (e) {
    console.error("Order confirmation email failed", e);
  }
}
