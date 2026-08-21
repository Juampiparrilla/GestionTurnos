-- ============================================================
-- 0007_clear_user_assignments.sql
-- Al desactivar un usuario, sus asignaciones EMPLEADO vigentes en
-- cualquier tablero deben dejar de mostrarse (el slot vuelve a
-- "Sin asignar"). Se cierra la fila vigente sin insertar una nueva,
-- igual filosofía de versionado que set_shift_assignment().
-- ============================================================

create or replace function public.clear_user_assignments(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_org_id uuid;
  v_actor_org_id uuid;
  v_actor_role public.user_role;
begin
  select organization_id into v_target_org_id from public.profiles where id = p_user_id;
  if v_target_org_id is null then
    raise exception 'Usuario no encontrado';
  end if;

  -- Se lee el rol/organización actuales de profiles (no del JWT, que
  -- puede tardar hasta ~30 min en reflejar un cambio de rol reciente).
  select organization_id, role into v_actor_org_id, v_actor_role
  from public.profiles where id = auth.uid();

  if v_actor_org_id is distinct from v_target_org_id then
    raise exception 'No autorizado';
  end if;

  if v_actor_role is null or v_actor_role not in ('ADMIN', 'SUPER_ADMIN') then
    raise exception 'No autorizado';
  end if;

  update public.shift_assignments
  set valid_to = now()
  where user_id = p_user_id
    and status = 'EMPLEADO'
    and valid_to is null
    and organization_id = v_target_org_id;
end;
$$;

revoke all on function public.clear_user_assignments(uuid) from public;
grant execute on function public.clear_user_assignments(uuid) to authenticated;
