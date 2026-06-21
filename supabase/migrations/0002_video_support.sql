-- ============================================================================
-- F-P COLLECTION — AJOUT SUPPORT VIDÉO (produits + vendeurs)
-- ============================================================================
-- À exécuter dans Supabase Studio > SQL Editor, APRÈS 0001_init.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Vidéo de présentation du vendeur (une seule, optionnelle)
-- ---------------------------------------------------------------------------
alter table vendors
  add column if not exists video_url text,
  add column if not exists video_storage_path text;

-- ---------------------------------------------------------------------------
-- Vidéos produit (plusieurs possibles, comme les images)
-- ---------------------------------------------------------------------------
create table if not exists product_videos (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  url text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_videos_product
  on product_videos(product_id, display_order);

alter table product_videos enable row level security;

create policy "product_videos_public_read" on product_videos
  for select using (
    exists (
      select 1 from products p
      where p.id = product_id and (p.status = 'active' or is_admin())
    )
  );

create policy "product_videos_admin_write" on product_videos
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Bucket de stockage dédié aux vidéos (séparé des images : fichiers plus
-- lourds, limite de taille différente)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('product-videos', 'product-videos', true, 52428800) -- 50 Mo max
on conflict (id) do nothing;

create policy "product_videos_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'product-videos');

create policy "product_videos_storage_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'product-videos' and is_admin());

create policy "product_videos_storage_admin_update"
  on storage.objects for update
  using (bucket_id = 'product-videos' and is_admin());

create policy "product_videos_storage_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-videos' and is_admin());
