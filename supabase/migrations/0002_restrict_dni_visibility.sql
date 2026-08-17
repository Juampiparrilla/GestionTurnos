-- ============================================================
-- 0002_restrict_dni_visibility.sql
-- Restringe la lectura de perfiles ajenos (con DNI y email) a
-- ADMIN/SUPER_ADMIN. Un EMPLEADO solo ve su propio perfil completo
-- (via profiles_select_self); para un directorio básico de
-- compañeros de organización (sin DNI/email) se usa la función
-- list_org_profiles_directory().
-- ============================================================

drop policy if exists profiles_select_same_org on public.profiles;

create policy profiles_select_same_org on public.profiles
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create or replace function public.list_org_profiles_directory()
returns table (
  id uuid,
  organization_id uuid,
  username text,
  full_name text,
  role public.user_role,
  active boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.organization_id, p.username, p.full_name, p.role, p.active
  from public.profiles p
  where p.organization_id = (auth.jwt() ->> 'organization_id')::uuid;
$$;

revoke all on function public.list_org_profiles_directory() from public;
grant execute on function public.list_org_profiles_directory() to authenticated;
