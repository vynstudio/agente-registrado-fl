-- Which brand's website an order came from: 'arf' (Agente Registrado Florida, agenteregistradofl.com)
-- or 'diler' (Diler Corporate, dilercorporate.com). Run before deploying the create-checkout
-- function that sends it. Existing orders all came from agenteregistradofl.com.
alter table public.orders
  add column if not exists brand text not null default 'arf';

do $$ begin
  alter table public.orders add constraint orders_brand_check check (brand in ('arf', 'diler'));
exception when duplicate_object then null; end $$;
