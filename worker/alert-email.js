// POST /api/alert-email: the Supabase functions send owner alerts here, and Cloudflare Email
// Routing delivers them (from alertas@agenteregistradofl.com) to each ALERT_TO address in
// wrangler.jsonc; every one must be a verified Email Routing destination address and be listed on
// the ALERT_EMAIL binding. Requests must carry the shared ALERT_SECRET.
import { EmailMessage } from "cloudflare:email";

const FROM = "alertas@agenteregistradofl.com";
const FROM_NAME = "Agente Registrado Florida";

const b64 = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text)));
// RFC 2047 encoded header so accents and emoji survive.
const header = (text) => `=?UTF-8?B?${b64(text)}?=`;

const mime = (to, subject, text) => [
  `From: ${header(FROM_NAME)} <${FROM}>`,
  `To: <${to}>`,
  `Subject: ${header(subject)}`,
  `Message-ID: <${crypto.randomUUID()}@agenteregistradofl.com>`,
  `Date: ${new Date().toUTCString()}`,
  "MIME-Version: 1.0",
  "Content-Type: text/plain; charset=UTF-8",
  "Content-Transfer-Encoding: base64",
  "",
  b64(text).replace(/.{76}/g, "$&\r\n"),
].join("\r\n");

const sameSecret = (a, b) => {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export async function alertEmail(request, env) {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!sameSecret(request.headers.get("x-alert-secret"), env.ALERT_SECRET)) return new Response("Forbidden", { status: 403 });
  if (!env.ALERT_EMAIL || !env.ALERT_TO) return new Response("Email alerts not configured", { status: 503 });
  const { subject, text } = await request.json().catch(() => ({}));
  if (typeof subject !== "string" || typeof text !== "string" || !subject || subject.length > 200 || text.length > 10000) {
    return new Response("Bad request", { status: 400 });
  }
  const recipients = env.ALERT_TO.split(",").map((a) => a.trim()).filter(Boolean);
  const results = await Promise.allSettled(recipients.map((to) => env.ALERT_EMAIL.send(new EmailMessage(FROM, to, mime(to, subject, text)))));
  const failed = results.flatMap((r, i) => (r.status === "rejected" ? [`${recipients[i]}: ${r.reason}`] : []));
  if (failed.length) console.error("Alert email failed", failed);
  return new Response(failed.length === recipients.length ? "failed" : "sent", { status: failed.length === recipients.length ? 502 : 200 });
}
