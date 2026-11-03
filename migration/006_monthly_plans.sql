-- Optional monthly compliance plans (Stripe subscriptions started at checkout).
alter table public.orders
  add column if not exists monthly_plan text check (monthly_plan in ('compliance', 'compliance_plus')),
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text;
create index if not exists orders_stripe_subscription_id_idx on public.orders (stripe_subscription_id);
alter table public.order_charges drop constraint if exists order_charges_kind_check;
alter table public.order_charges add constraint order_charges_kind_check
  check (kind in ('state_fee', 'annual_report_renewal', 'registered_agent_renewal', 'annual_report_state_fee'));
