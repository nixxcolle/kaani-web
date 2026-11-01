-- Run as project owner. Read-only checks; no module contents or user data returned.
select count(*) as owner_visible_modules from public.modules;
select relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
from pg_class where oid = 'public.modules'::regclass;
select policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename = 'modules';
select grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'modules'
and grantee in ('anon', 'authenticated') order by grantee, column_name;

begin;
set local role anon;
select count(*) as anon_visible_modules from public.modules;
rollback;

begin;
set local role authenticated;
select count(*) as authenticated_public_modules from public.modules;
rollback;
