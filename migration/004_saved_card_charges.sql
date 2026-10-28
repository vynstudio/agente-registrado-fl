-- Saved card for state fees and renewals. Checkout charges only our service fees; Stripe keeps
-- the card (we store only Stripe ids and the card brand/last 4), and admins charge the state fee
-- when filing and yearly renewals through the charge-saved-card function.
alter table public.orders
  add column if not exists state_fee_cents integer,
  add column if not exists card_authorization text,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_method_id text,
  add column if not exists card_label text;

create table if not exists public.order_charges (
  id uuid default gen_random_uuid() not null,
  order_id uuid not null references public.orders(id) on delete cascade,
  kind text not null check (kind in ('state_fee', 'annual_report_renewal', 'registered_agent_renewal')),
  period text not null,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  stripe_payment_intent_id text,
  error text,
  charged_by uuid,
  created_at timestamp with time zone default now() not null,
  constraint order_charges_pkey primary key (id),
  -- One state fee per order and one renewal of each kind per year.
  constraint order_charges_once unique (order_id, kind, period)
);

alter table public.order_charges enable row level security;
grant all on table public.order_charges to service_role;
grant select on table public.order_charges to authenticated;
drop policy if exists "Admins can view charges" on public.order_charges;
create policy "Admins can view charges" on public.order_charges
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::public.app_role));
