import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";
import { ADMIN_ORDERS_URL, money, sendAlert } from "../_shared/alerts.ts";
import { sendOrderConfirmation } from "../_shared/client-email.ts";

let _db: SupabaseClient | null = null;
const db = () => (_db ??= createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!));

const PLAN_NAMES: Record<string, string> = { starter: "Starter", professional: "Professional", international: "International+", business_website: "Business + Website" };

// The card Stripe saved at checkout, for the state fee and renewals the client authorized.
async function savedCard(session: any, env: StripeEnv) {
  if (typeof session.payment_intent !== "string") return {};
  const pi = await createStripeClient(env).paymentIntents.retrieve(session.payment_intent, { expand: ["payment_method"] });
  const pm = pi.payment_method;
  if (!pm || typeof pm === "string") return {};
  return {
    stripe_customer_id: typeof session.customer === "string" ? session.customer : pi.customer,
    stripe_payment_method_id: pm.id,
    card_label: pm.card ? `${pm.card.brand} •••• ${pm.card.last4}` : pm.type,
  };
}

async function setStatus(session: any, env: StripeEnv, status: string) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  const card = status === "paid" ? await savedCard(session, env).catch((e) => (console.error("Saved card lookup failed", e), {})) : {};
  const { data: order } = await db().from("orders")
    .update({ status, ...card, ...(status === "paid" && { paid_at: new Date().toISOString() }) })
    .eq("id", orderId).eq("environment", env).neq("status", status)
    .select("*").maybeSingle();
  // Only on the change to "paid" (Stripe may resend an event), so each new client alerts once
  // and gets one confirmation email.
  if (order && status === "paid") {
    await Promise.all([sendOrderConfirmation(order), sendAlert(`${env === "sandbox" ? "[TEST] " : ""}✅ New client — order paid`, [
      ["Company", order.company_name],
      ["Package", `${PLAN_NAMES[order.plan] ?? order.plan} · ${order.entity_type === "llc" ? "LLC" : "Corporation"}`],
      ["Add-ons", order.extras?.join(", ")],
      ["Paid", money(order.total_cents)],
      ["State fee to charge", order.state_fee_cents ? `${money(order.state_fee_cents)} to ${order.card_label ?? "saved card"} when filing` : undefined],
      ["Client", order.contact_name],
      ["Phone", order.contact_phone],
      ["Email", order.contact_email],
      ["Language", order.language?.toUpperCase()],
      ["EIN", order.ein ? (order.ein.taxId === "none" ? "yes (no SSN/ITIN)" : `yes — call client for ${order.ein.taxId.toUpperCase()}`) : undefined],
      ["Details", ADMIN_ORDERS_URL],
    ])]);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), { status: 200 });
  }
  const env: StripeEnv = rawEnv;
  try {
    const event = await verifyWebhook(req, env);
    const s = event.data.object;
    switch (event.type) {
      case "checkout.session.completed":
        await setStatus(s, env, s.payment_status === "unpaid" ? "processing" : "paid");
        break;
      case "checkout.session.async_payment_succeeded":
        await setStatus(s, env, "paid");
        break;
      case "checkout.session.async_payment_failed":
        await setStatus(s, env, "failed");
        break;
      case "checkout.session.expired":
        await setStatus(s, env, "abandoned");
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
