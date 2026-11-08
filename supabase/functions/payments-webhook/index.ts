import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, paymentsEnv, verifyWebhook } from "../_shared/stripe.ts";
import { ADMIN_ORDERS_URL, money, sendAlert } from "../_shared/alerts.ts";
import { sendOrderConfirmation } from "../_shared/client-email.ts";

let _db: SupabaseClient | null = null;
const db = () => (_db ??= createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!));

const PLAN_NAMES: Record<string, string> = { starter: "Starter", professional: "Professional", international: "International+", business_website: "Business + Website" };

const MONTHLY_NAMES: Record<string, string> = { compliance: "Compliance", compliance_plus: "Compliance Plus" };

// The card Stripe saved at checkout, for the state fee and renewals the client authorized.
// A monthly plan checkout keeps it on the subscription instead of a one-time payment.
async function savedCard(session: any, env: StripeEnv) {
  const stripe = createStripeClient(env);
  let pm: any, customer: any;
  if (typeof session.subscription === "string") {
    const sub = await stripe.subscriptions.retrieve(session.subscription, { expand: ["default_payment_method"] });
    [pm, customer] = [sub.default_payment_method, sub.customer];
  } else if (typeof session.payment_intent === "string") {
    const pi = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ["payment_method"] });
    [pm, customer] = [pi.payment_method, pi.customer];
  }
  if (!pm || typeof pm === "string") return {};
  return {
    stripe_customer_id: typeof session.customer === "string" ? session.customer : customer,
    stripe_payment_method_id: pm.id,
    card_label: pm.card ? `${pm.card.brand} •••• ${pm.card.last4}` : pm.type,
    ...(typeof session.subscription === "string" && { stripe_subscription_id: session.subscription, subscription_status: "active" }),
  };
}

// Monthly plan changes after checkout: a failed monthly payment or a cancellation needs a call to the client.
async function subscriptionEvent(subscriptionId: string | undefined, env: StripeEnv, status: string | null, title?: string) {
  if (!subscriptionId) return;
  const q = db().from("orders").select("*").eq("stripe_subscription_id", subscriptionId).eq("environment", env);
  const { data: order } = await (status ? db().from("orders").update({ subscription_status: status })
    .eq("stripe_subscription_id", subscriptionId).eq("environment", env).neq("subscription_status", status).select("*").maybeSingle()
    : q.maybeSingle());
  if (!order || !title) return;
  await sendAlert(`${env === "sandbox" ? "[TEST] " : ""}${title}`, [
    ["Company", order.company_name],
    ["Plan", `${MONTHLY_NAMES[order.monthly_plan] ?? order.monthly_plan} · ${order.card_label ?? ""}`],
    ["Client", `${order.contact_name} · ${order.contact_phone}`],
    ["Details", ADMIN_ORDERS_URL],
  ]);
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
      ["Monthly plan", order.monthly_plan ? MONTHLY_NAMES[order.monthly_plan] : undefined],
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
  // Only the endpoint for the mode this backend runs in (PAYMENTS_ENV) is processed, so in
  // production a test-mode event can never touch an order.
  const env: StripeEnv = paymentsEnv();
  if (new URL(req.url).searchParams.get("env") !== env) {
    return new Response(JSON.stringify({ received: true, ignored: "other payments environment" }), { status: 200 });
  }
  try {
    const event = await verifyWebhook(req, env);
    // Signed with this mode's secret, but double-check Stripe's own flag: a test event never updates a live order.
    if (event.livemode !== (env === "live")) {
      console.warn("Ignored webhook event whose livemode does not match", env);
      return new Response(JSON.stringify({ received: true, ignored: "livemode mismatch" }), { status: 200 });
    }
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
      case "customer.subscription.updated":
        // past_due / unpaid after failed retries; active again once paid.
        await subscriptionEvent(s.id, env, s.status, s.status === "unpaid" ? "⚠️ Monthly plan unpaid — call client" : undefined);
        break;
      case "customer.subscription.deleted":
        await subscriptionEvent(s.id, env, "canceled", "🔴 Monthly plan canceled");
        break;
      case "invoice.payment_failed":
        await subscriptionEvent(s.parent?.subscription_details?.subscription ?? s.subscription, env, null, "⚠️ Monthly plan payment failed");
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
