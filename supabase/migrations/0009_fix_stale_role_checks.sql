-- ============================================================
-- 0009_fix_stale_role_checks.sql
-- set_shift_assignment y clear_user_assignments autorizaban leyendo
-- auth.jwt() ->> 'app_role', que solo se actualiza cuando el JWT se
-- refresca (hasta ~30 minutos). Un ADMIN recién promovido podía ver
-- la UI de admin (esa parte sí lee el perfil fresco) pero se le
-- rechazaban las escrituras por "No autorizado" hasta que su sesión
-- se refrescara. Se corrige leyendo el rol actual directo de
-- profiles (estas funciones son security definer, no hay riesgo de
-- recursión de RLS al hacerlo).
-- ============================================================

create or replace function public.set_shift_assignment(
  p_board_id uuid,
  p_shift_configuration_id uuid,
  p_day_of_week smallint,
  p_status text,
  p_user_id uuid
)
returns public.shift_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_board_org_id uuid;
  v_actor_org_id uuid;
  v_actor_role public.user_role;
  v_new_row public.shift_assignments;
begin
  select organization_id into v_board_org_id from public.boards where id = p_board_id;
  if v_board_org_id is null then
    raise exception 'Tablero no encontrado';
  end if;

  select organization_id, role into v_actor_org_id, v_actor_role
  from public.profiles where id = auth.uid();

  if v_actor_org_id is distinct from v_board_org_id then
    raise exception 'No autorizado';
  end if;

  if v_actor_role is null or v_actor_role not in ('ADMIN', 'SUPER_ADMIN') then
    raise exception 'No autorizado';
  end if;

  if p_status not in ('EMPLEADO', 'FERIADO', 'CERRADO') then
    raise exception 'Estado inválido';
  end if;

  if p_status = 'EMPLEADO' and p_user_id is null then
    raise exception 'Falta el empleado a asignar';
  end if;

  if p_status != 'EMPLEADO' and p_user_id is not null then
    raise exception 'No corresponde asignar un empleado para este estado';
  end if;

  update public.shift_assignments
  set valid_to = now()
  where board_id = p_board_id
    and shift_configuration_id = p_shift_configuration_id
    and day_of_week = p_day_of_week
    and valid_to is null;

  insert into public.shift_assignments (
    organization_id, board_id, shift_configuration_id, day_of_week,
    status, user_id, created_by
  ) values (
    v_board_org_id, p_board_id, p_shift_configuration_id, p_day_of_week,
    p_status, p_user_id, auth.uid()
  )
  returning * into v_new_row;

  return v_new_row;
end;
$$;

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
