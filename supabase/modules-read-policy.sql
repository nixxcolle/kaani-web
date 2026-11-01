-- Owner-run repair: all rows in this table are public learning materials.
-- Remove the anonymous editing policies identified in the project's diagnostics.
begin;
alter table public.modules enable row level security;
grant usage on schema public to anon, authenticated;
grant select (id, title, description, file_data, file_name, created_at)
  on public.modules to anon, authenticated;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
    and tablename = 'modules' and policyname = 'kaani_public_module_read') then
    create policy kaani_public_module_read on public.modules
      for select to anon, authenticated using (true);
  end if;
end $$;
drop policy if exists "Allow anonymous module creation" on public.modules;
drop policy if exists "Allow users to update modules" on public.modules;
drop policy if exists "Allow users to delete modules" on public.modules;
revoke insert, update, delete on public.modules from anon;
commit;
