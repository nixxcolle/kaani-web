-- Run in Supabase SQL Editor as the project owner.
-- Removes only the app's obsolete role field; keeps auth.users.role and app_metadata.
begin;
do $$
begin
  if exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'role') then
    if exists (
      select 1 from pg_trigger t join pg_proc p on p.oid = t.tgfoid
      where t.tgrelid in (to_regclass('auth.users'), to_regclass('public.users'))
        and not t.tgisinternal and pg_get_functiondef(p.oid) ~* '\mrole\M'
    ) then
      raise exception 'A signup/profile trigger references role. Review supabase/diagnostics/auth.sql before removing the column.';
    end if;
    alter table public.users drop column role;
  end if;
end $$;
update auth.users
set raw_user_meta_data = raw_user_meta_data - 'role'
where raw_user_meta_data ->> 'role' = 'user';
commit;
