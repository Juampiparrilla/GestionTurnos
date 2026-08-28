-- ============================================================
-- 0023_solo_super_admin_gestiona_usuarios.sql
-- La gestión de usuarios (alta, edición, invitaciones, reseteo de
-- contraseña) pasa a ser exclusiva de SUPER_ADMIN -- ADMIN deja de poder
-- crear/editar perfiles de otros usuarios. Ya se restringió en las rutas
-- de API (requireSuperAdmin) y en el nav; esto endurece la misma regla en
-- RLS, que es la capa de enforcement real.
-- ============================================================

drop policy profiles_insert_admin on public.profiles;
drop policy profiles_update_admin on public.profiles;

create policy profiles_insert_admin on public.profiles
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') = 'SUPER_ADMIN'
  );

create policy profiles_update_admin on public.profiles
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') = 'SUPER_ADMIN'
  );

-- Mismo endurecimiento para las invitaciones de activación de usuario
-- (tabla `invitations`, 0008): son parte de la misma funcionalidad.
drop policy invitations_select_admin on public.invitations;
drop policy invitations_insert_admin on public.invitations;
drop policy invitations_update_admin on public.invitations;

create policy invitations_select_admin on public.invitations
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') = 'SUPER_ADMIN'
  );

create policy invitations_insert_admin on public.invitations
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') = 'SUPER_ADMIN'
  );

create policy invitations_update_admin on public.invitations
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') = 'SUPER_ADMIN'
  );
