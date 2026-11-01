begin;
create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  category text not null check (category in ('Vegetables & Fruits','Rice & Grains','Livestock & Poultry','Fish & Seafood','Processed Products','Others')),
  type text not null check (type in ('Farm Product','Fishery Product','Processed Product')),
  price numeric(12,2) not null check (price > 0 and price <= 1000000000),
  unit text not null check (length(trim(unit)) between 1 and 120),
  stock numeric(13,3) not null check (stock >= 0 and stock <= 1000000000),
  status text not null check (status in ('Available','Out of Stock','Unavailable')),
  seller_name text not null check (length(trim(seller_name)) between 1 and 120),
  seller_phone text not null check (seller_phone ~ '^\+?[0-9 ()-]{7,25}$' and length(regexp_replace(seller_phone,'[^0-9]','','g')) >= 7),
  location text not null check (length(trim(location)) between 1 and 200),
  description text not null default '' check (length(description) <= 3000),
  photo_path text not null,
  photo_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default clock_timestamp(),
  check (photo_path like owner_id::text || '/' || id::text || '/%' and photo_path !~ '\.\.'),
  check (photo_url = 'https://isdbsiocqiaxttlfysqq.supabase.co/storage/v1/object/public/product-photos/' || photo_path),
  check (status <> 'Available' or stock > 0)
);
create index if not exists marketplace_products_owner on public.marketplace_products(owner_id);
alter table public.marketplace_products enable row level security;
grant usage on schema public to anon, authenticated;
grant select on public.marketplace_products to anon, authenticated;
grant insert, update, delete on public.marketplace_products to authenticated;
revoke insert, update, delete on public.marketplace_products from anon;

create or replace function public.guard_marketplace_product() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.owner_id <> old.owner_id or new.id <> old.id then
      raise exception 'Product ownership cannot be changed';
    end if;
    new.created_at := old.created_at;
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'product-photos' and name = new.photo_path) then
    raise exception 'Upload the product photo before saving';
  end if;
  new.updated_at := clock_timestamp();
  return new;
end $$;
drop trigger if exists marketplace_product_guard on public.marketplace_products;
create trigger marketplace_product_guard before insert or update on public.marketplace_products
for each row execute function public.guard_marketplace_product();

drop policy if exists marketplace_read on public.marketplace_products;
create policy marketplace_read on public.marketplace_products for select to anon, authenticated using (true);
drop policy if exists marketplace_insert on public.marketplace_products;
create policy marketplace_insert on public.marketplace_products for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists marketplace_update on public.marketplace_products;
create policy marketplace_update on public.marketplace_products for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists marketplace_delete on public.marketplace_products;
create policy marketplace_delete on public.marketplace_products for delete to authenticated using ((select auth.uid()) = owner_id);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('product-photos','product-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists marketplace_photo_upload on storage.objects;
create policy marketplace_photo_upload on storage.objects for insert to authenticated
with check (bucket_id = 'product-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists marketplace_photo_delete on storage.objects;
create policy marketplace_photo_delete on storage.objects for delete to authenticated
using (bucket_id = 'product-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  and not exists (select 1 from public.marketplace_products where photo_path = storage.objects.name));
drop policy if exists marketplace_photo_owner_read on storage.objects;
create policy marketplace_photo_owner_read on storage.objects for select to authenticated
using (bucket_id = 'product-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Other pre-existing broad Storage policies must not allow access to another seller's files.
drop policy if exists marketplace_photo_insert_boundary on storage.objects;
create policy marketplace_photo_insert_boundary on storage.objects as restrictive for insert to public
with check (bucket_id <> 'product-photos' or ((select auth.uid()) is not null and (storage.foldername(name))[1] = (select auth.uid())::text));
drop policy if exists marketplace_photo_delete_boundary on storage.objects;
create policy marketplace_photo_delete_boundary on storage.objects as restrictive for delete to public
using (bucket_id <> 'product-photos' or ((select auth.uid()) is not null and (storage.foldername(name))[1] = (select auth.uid())::text
  and not exists (select 1 from public.marketplace_products where photo_path = storage.objects.name)));
drop policy if exists marketplace_photo_update_boundary on storage.objects;
create policy marketplace_photo_update_boundary on storage.objects as restrictive for update to public
using (bucket_id <> 'product-photos') with check (bucket_id <> 'product-photos');

-- Realtime delivers catalogue changes; focus refresh and polling also cover missed events.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'marketplace_products') then
    alter publication supabase_realtime add table public.marketplace_products;
  end if;
end $$;
commit;
