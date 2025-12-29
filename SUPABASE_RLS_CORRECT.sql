-- ============================================================================
-- CORRECT SQL FOR DROPSTORE - USES owner_id (not user_id) FOR STORES
-- ============================================================================

-- Stores table (already exists, keeping for reference)
-- Has: owner_id, name, slug, description, logo_url, banner_url, primary_color, etc.

-- Ensure public access policies for published stores
alter table public.stores enable row level security;

-- Stores RLS: owners full access, public can view published
drop policy if exists "store_owner_full_access" on public.stores;
create policy "store_owner_full_access" on public.stores
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "public_view_published_stores" on public.stores;
create policy "public_view_published_stores" on public.stores
  for select using (is_published = true);

-- Products table RLS
alter table public.products enable row level security;

drop policy if exists "product_owner_full_access" on public.products;
create policy "product_owner_full_access" on public.products
  for all using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "public_view_active_products" on public.products;
create policy "public_view_active_products" on public.products
  for select using (
    is_active = true and
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.is_published = true
    )
  );

-- Orders table RLS
alter table public.orders enable row level security;

drop policy if exists "merchant_view_own_orders" on public.orders;
create policy "merchant_view_own_orders" on public.orders
  for select using (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "merchant_update_own_orders" on public.orders;
create policy "merchant_update_own_orders" on public.orders
  for update using (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id and s.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id and s.owner_id = auth.uid()
    )
  );

-- Subscriptions table RLS
alter table public.subscriptions enable row level security;

drop policy if exists "user_view_own_subscriptions" on public.subscriptions;
create policy "user_view_own_subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "system_insert_subscriptions" on public.subscriptions;
create policy "system_insert_subscriptions" on public.subscriptions
  for insert with check (true);

drop policy if exists "user_update_own_subscriptions" on public.subscriptions;
create policy "user_update_own_subscriptions" on public.subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helpful indexes
create index if not exists idx_stores_slug on public.stores(slug);
create index if not exists idx_stores_published on public.stores(is_published);
create index if not exists idx_stores_owner on public.stores(owner_id);
create index if not exists idx_products_store on public.products(store_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_orders_store on public.orders(store_id);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);

-- Comment documenting the schema
comment on column public.stores.owner_id is 'Foreign key to auth.users(id) - the store owner';
comment on column public.products.store_id is 'Foreign key to stores(id) - the store this product belongs to';
comment on column public.orders.store_id is 'Foreign key to stores(id) - the store that received the order';
comment on column public.subscriptions.user_id is 'Foreign key to auth.users(id) - the user with this subscription';
