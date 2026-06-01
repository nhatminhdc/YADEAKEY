-- Chạy trong Supabase SQL Editor (một lần)
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  phone text not null,
  product_name text not null,
  product_slug text not null,
  product_price bigint,
  selected_color text,
  selected_version text,
  notes text,
  source text not null default 'yadea-showroom'
);

create index if not exists purchase_orders_created_at_idx
  on public.purchase_orders (created_at desc);

alter table public.purchase_orders enable row level security;

-- Chỉ server (service role) ghi/đọc — không cho anon client
-- Không tạo policy cho anon/authenticated => client không truy cập được
