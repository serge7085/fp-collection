-- ============================================================================
-- F-P COLLECTION — SCHEMA INITIAL
-- ============================================================================
-- À exécuter dans Supabase Studio > SQL Editor (ou via supabase db push)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- TYPES
-- ---------------------------------------------------------------------------
do $$ begin
  create type admin_role as enum ('super_admin', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('active', 'inactive', 'draft');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- FUNCTION: updated_at auto
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- FUNCTION: slugify (pour URLs SEO genre /products/sac-cuir-milano)
-- ---------------------------------------------------------------------------
create extension if not exists "unaccent";

create or replace function slugify(value text)
returns text as $$
  select trim(both '-' from
    regexp_replace(
      lower(unaccent(coalesce(value, ''))),
      '[^a-z0-9]+', '-', 'g'
    )
  );
$$ language sql immutable;

-- ============================================================================
-- TABLE: admins
-- ============================================================================
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role admin_role not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_admins_updated_at
  before update on admins
  for each row execute function set_updated_at();

-- ============================================================================
-- TABLE: categories
-- ============================================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

create index if not exists idx_categories_slug on categories(slug);

-- ============================================================================
-- TABLE: vendors
-- ============================================================================
create table if not exists vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  photo_url text,
  phone text,
  whatsapp text,
  tiktok_url text,
  instagram_url text,
  facebook_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_vendors_updated_at
  before update on vendors
  for each row execute function set_updated_at();

create index if not exists idx_vendors_slug on vendors(slug);

-- ============================================================================
-- TABLE: products
-- ============================================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  reference text unique,
  price numeric(12,2) not null check (price >= 0),
  promo_price numeric(12,2) check (promo_price is null or promo_price >= 0),
  stock int not null default 0 check (stock >= 0),
  category_id uuid references categories(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  status product_status not null default 'draft',
  is_featured boolean not null default false,
  view_count int not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_vendor on products(vendor_id);
create index if not exists idx_products_status on products(status);
create index if not exists idx_products_featured on products(is_featured) where is_featured = true;
create index if not exists idx_products_name_trgm on products using gin (name gin_trgm_ops);

-- ============================================================================
-- TABLE: product_images
-- ============================================================================
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  url text not null,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on product_images(product_id, display_order);

create unique index if not exists uq_product_primary_image
  on product_images(product_id)
  where is_primary = true;

-- ============================================================================
-- TABLE: settings (singleton — une seule ligne, id fixe)
-- ============================================================================
create table if not exists settings (
  id boolean primary key default true,
  site_name text not null default 'F-P Collection',
  site_tagline text not null default 'L''élégance à votre portée',
  logo_url text,
  favicon_url text,
  whatsapp_number text not null default '22890000000',
  whatsapp_qr_url text,
  whatsapp_message text not null default 'Bonjour, je suis intéressé par un produit vu sur F-P Collection. Pouvez-vous me donner plus d''informations ?',
  tiktok_url text default 'https://www.tiktok.com/@amie.de.dieu01',
  instagram_url text,
  facebook_url text,
  primary_color text not null default '#D4AF37',
  background_color text not null default '#0F0F0F',
  text_color text not null default '#F8F8F8',
  seo_title text,
  seo_description text,
  setup_completed boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = true)
);

create trigger trg_settings_updated_at
  before update on settings
  for each row execute function set_updated_at();

insert into settings (id) values (true)
on conflict (id) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table admins enable row level security;
alter table categories enable row level security;
alter table vendors enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table settings enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admins where id = auth.uid()
  );
$$ language sql security definer stable;

create or replace function is_super_admin()
returns boolean as $$
  select exists (
    select 1 from admins where id = auth.uid() and role = 'super_admin'
  );
$$ language sql security definer stable;

-- ---- admins ----
create policy "admins_select_self_or_admin" on admins
  for select using (id = auth.uid() or is_admin());

create policy "admins_insert_setup_only" on admins
  for insert with check (
    not exists (select 1 from admins)
    or is_super_admin()
  );

create policy "admins_update_super_admin" on admins
  for update using (is_super_admin() or id = auth.uid());

create policy "admins_delete_super_admin" on admins
  for delete using (is_super_admin());

-- ---- categories ----
create policy "categories_public_read" on categories
  for select using (is_active = true or is_admin());

create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

-- ---- vendors ----
create policy "vendors_public_read" on vendors
  for select using (is_active = true or is_admin());

create policy "vendors_admin_write" on vendors
  for all using (is_admin()) with check (is_admin());

-- ---- products ----
create policy "products_public_read" on products
  for select using (status = 'active' or is_admin());

create policy "products_admin_write" on products
  for all using (is_admin()) with check (is_admin());

-- ---- product_images ----
create policy "product_images_public_read" on product_images
  for select using (
    exists (
      select 1 from products p
      where p.id = product_id and (p.status = 'active' or is_admin())
    )
  );

create policy "product_images_admin_write" on product_images
  for all using (is_admin()) with check (is_admin());

-- ---- settings ----
create policy "settings_public_read" on settings
  for select using (true);

create policy "settings_admin_write" on settings
  for update using (is_admin()) with check (is_admin());

-- ============================================================================
-- FUNCTION: increment_product_views
-- ============================================================================
-- Incrémentation atomique du compteur de vues, sûre en cas de requêtes
-- concurrentes (contrairement à un read-then-write depuis l'application).
create or replace function increment_product_views(product_id uuid)
returns void as $$
  update products set view_count = view_count + 1 where id = product_id;
$$ language sql security definer;

-- Doit être appelable par n'importe quel visiteur (pas seulement les admins),
-- puisque c'est déclenché par la simple consultation d'une fiche produit.
grant execute on function increment_product_views(uuid) to anon, authenticated;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "product_images_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_storage_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());

create policy "product_images_storage_admin_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and is_admin());

create policy "product_images_storage_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());

create policy "site_assets_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "site_assets_storage_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and is_admin());

create policy "site_assets_storage_admin_update"
  on storage.objects for update
  using (bucket_id = 'site-assets' and is_admin());

create policy "site_assets_storage_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'site-assets' and is_admin());
