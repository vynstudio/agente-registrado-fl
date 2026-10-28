import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { type Entity, type SavedCardCharge, SAVED_CARD_CHARGES } from "../_shared/catalog.ts";
import { ADMIN_ORDERS_URL, money, sendAlert } from "../_shared/alerts.ts";

// Admins only: charges a client's saved card for the state fee (when filing) or a yearly renewal,
// as the client authorized at checkout (orders.card_authorization). The amount comes from the
// catalog, never from the browser, and each charge happens once per order and period.

const corsFor = (req: Request): Record<string, string> => ({
  "Access-Control-Allow-Origin": req.headers.get("origin") ?? "",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

const schema = z.object({
  orderId: z.string().uuid(),
  kind: z.enum(["state_fee", "annual_report_renewal", "registered_agent_renewal"]),
});

Deno.serve(async (req) => {
  const cors = corsFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Unauthorized" }, 401);
  const { data: { user } } = await createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  }).auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);
  const { data: isAdmin } = await db.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Bad request" }, 400);
  const { orderId, kind } = parsed.data as { orderId: string; kind: SavedCardCharge };

  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return json({ error: "Order not found" }, 404);
  if (!["paid", "filed", "completed"].includes(order.status)) return json({ error: "The order isn't paid yet." }, 409);
  if (!order.card_authorization || !order.stripe_payment_method_id || !order.stripe_customer_id) {
    return json({ error: "No saved card with an authorization for this order." }, 409);
  }

  const charge = SAVED_CARD_CHARGES[kind];
  const amount = charge.cents(order.entity_type as Entity, order.extras ?? []);
  const period = charge.period(new Date().getFullYear());

  // Claim the charge first; the unique (order, kind, period) row stops double charging.
  const { data: row, error: claimError } = await db.from("order_charges")
    .insert({ order_id: orderId, kind, period, amount_cents: amount, charged_by: user.id })
    .select("id").single();
  if (claimError) {
    const { data: prior } = await db.from("order_charges").select("id, status").eq("order_id", orderId).eq("kind", kind).eq("period", period).maybeSingle();
    if (prior?.status !== "failed") return json({ error: "This charge was already made." }, 409);
    // A failed attempt can be retried (for example after the client updates their card).
    await db.from("order_charges").update({ status: "pending", error: null, charged_by: user.id, amount_cents: amount }).eq("id", prior.id);
    return run(prior.id);
  }
  return run(row.id);

  async function run(chargeId: string) {
    const env = order.environment as StripeEnv;
    try {
      const pi = await createStripeClient(env).paymentIntents.create({
        amount,
        currency: "usd",
        customer: order.stripe_customer_id,
        payment_method: order.stripe_payment_method_id,
        off_session: true,
        confirm: true,
        description: `${charge.label} — ${order.company_name}`,
        metadata: { orderId, kind, period, chargeId },
      });
      const ok = pi.status === "succeeded";
      await db.from("order_charges").update({
        status: ok ? "succeeded" : "failed",
        stripe_payment_intent_id: pi.id,
        error: ok ? null : `Payment ${pi.status}`,
      }).eq("id", chargeId);
      await sendAlert(`${env === "sandbox" ? "[TEST] " : ""}${ok ? "💳 Saved card charged" : "⚠️ Saved card charge not completed"}`, [
        ["Company", order.company_name],
        ["Charge", `${charge.label}: ${money(amount)}`],
        ["Card", order.card_label],
        ["Result", ok ? "succeeded" : pi.status],
        ["Details", ADMIN_ORDERS_URL],
      ]);
      return json({ ok, status: pi.status, amount_cents: amount });
    } catch (e) {
      // Declines and cards that need the client to confirm (3-D Secure) land here.
      const err = e as { code?: string; decline_code?: string; message?: string; raw?: { payment_intent?: { id?: string } } };
      const message = [err.code, err.decline_code].filter(Boolean).join(" / ") || err.message || "Charge failed";
      await db.from("order_charges").update({
        status: "failed",
        error: message.slice(0, 300),
        stripe_payment_intent_id: err.raw?.payment_intent?.id ?? null,
      }).eq("id", chargeId);
      await sendAlert(`${env === "sandbox" ? "[TEST] " : ""}⚠️ Saved card declined — call client`, [
        ["Company", order.company_name],
        ["Charge", `${charge.label}: ${money(amount)}`],
        ["Card", order.card_label],
        ["Reason", message],
        ["Client", `${order.contact_name} · ${order.contact_phone}`],
      ]);
      return json({ ok: false, error: message }, 402);
    }
  }
});
