-- =============================================
-- DOKET — Supabase PostgreSQL Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS (extends Supabase auth.users)
-- =============================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  business_name text,
  phone text unique not null,
  email text,
  mpesa_shortcode text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- =============================================
-- INVOICES
-- =============================================
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  invoice_number text not null,
  client_name text not null,
  client_email text,
  client_phone text,
  status text check (status in ('draft', 'pending', 'paid', 'overdue')) default 'draft',
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(12, 2) not null default 0,
  tax_rate numeric(5, 2) default 0,
  tax_amount numeric(12, 2) default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  mpesa_link text,
  paid_at timestamptz,
  local_id text unique, -- SQLite local ID for offline sync
  synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoices enable row level security;

create policy "Users can manage own invoices"
  on public.invoices for all
  using (auth.uid() = user_id);

create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_status_idx on public.invoices(status);

-- =============================================
-- INVOICE ITEMS
-- =============================================
create table public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null,
  amount numeric(12, 2) not null,
  local_id text,
  created_at timestamptz default now()
);

alter table public.invoice_items enable row level security;

create policy "Users can manage own invoice items"
  on public.invoice_items for all
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create index invoice_items_invoice_id_idx on public.invoice_items(invoice_id);

-- =============================================
-- RECEIPTS
-- =============================================
create table public.receipts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  receipt_number text,
  vendor text not null,
  amount numeric(12, 2) not null,
  date date not null,
  category text default 'Uncategorized',
  image_url text,
  raw_ocr_text text,
  notes text,
  local_id text unique,
  synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.receipts enable row level security;

create policy "Users can manage own receipts"
  on public.receipts for all
  using (auth.uid() = user_id);

create index receipts_user_id_idx on public.receipts(user_id);
create index receipts_date_idx on public.receipts(date);

-- =============================================
-- SYNC LOGS
-- =============================================
create table public.sync_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  entity_type text check (entity_type in ('invoice', 'receipt')) not null,
  entity_id uuid not null,
  action text check (action in ('create', 'update', 'delete')) not null,
  status text check (status in ('pending', 'success', 'failed')) default 'pending',
  error_message text,
  created_at timestamptz default now(),
  synced_at timestamptz
);

alter table public.sync_logs enable row level security;

create policy "Users can manage own sync logs"
  on public.sync_logs for all
  using (auth.uid() = user_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.handle_updated_at();

create trigger receipts_updated_at before update on public.receipts
  for each row execute function public.handle_updated_at();

-- =============================================
-- NEW USER HANDLER (auto-create profile)
-- =============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, full_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.phone, new.raw_user_meta_data->>'phone', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
