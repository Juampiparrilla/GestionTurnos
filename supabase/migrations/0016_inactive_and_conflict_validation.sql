-- ============================================================
-- 0016_inactive_and_conflict_validation.sql
-- Fase 1 de seguridad/consistencia:
--
-- 1) Un usuario inactivo no puede quedar asignado a un turno, feriado
--    o domingo. list_org_profiles_directory() devuelve perfiles
--    inactivos también (se usa para resolver nombres históricos), así
--    que el filtro de la UI por sí solo no alcanza: hace falta un
--    chequeo en el punto de escritura, que es la única fuente de
--    verdad real.
--
-- 2) Una persona no puede quedar asignada (status EMPLEADO) al mismo
--    día en dos horarios distintos si sus turnos se superponen en
--    horario. Se compara contra la asignación vigente de OTROS
--    boards (la del mismo board/turno/día es un reemplazo normal, no
--    un conflicto).
-- ============================================================

create or replace function public.assert_user_active(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active boolean;
begin
  select active into v_active from public.profiles where id = p_user_id;

  if v_active is null then
    raise exception 'Usuario no encontrado.';
  end if;

  if v_active = false then
    raise exception 'No se puede asignar un usuario inactivo.';
  end if;
end;
$$;

revoke all on function public.assert_user_active(uuid) from public;
grant execute on function public.assert_user_active(uuid) to authenticated;

-- ------------------------------------------------------------
-- set_shift_assignment(): agrega validación de usuario activo y de
-- conflicto de horario contra otros tableros.
-- ------------------------------------------------------------

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
  v_start_time time;
  v_end_time time;
begin
  select organization_id into v_board_org_id from public.boards where id = p_board_id;
  if v_board_org_id is null then
    raise exception 'Tablero no encontrado';
  end if;

  -- Se lee el rol/organización actuales de profiles (no del JWT, que
  -- puede tardar hasta ~30 min en reflejar un cambio de rol reciente).
  select organization_id, role into v_actor_org_id, v_actor_role
  from public.profiles where id = auth.uid();

  if v_actor_org_id is distinct from v_board_org_id then
    raise exception 'No autorizado';
  end if;

  if v_actor_role is null or v_actor_role not in ('ADMIN', 'SUPER_ADMIN') then
    raise exception 'No autorizado';
  end if;

  if p_status not in ('EMPLEADO', 'FERIADO', 'CERRADO', 'SIN_ASIGNAR') then
    raise exception 'Estado inválido';
  end if;

  if p_status = 'EMPLEADO' and p_user_id is null then
    raise exception 'Falta el empleado a asignar';
  end if;

  if p_status != 'EMPLEADO' and p_user_id is not null then
    raise exception 'No corresponde asignar un empleado para este estado';
  end if;

  if p_status = 'EMPLEADO' then
    perform public.assert_user_active(p_user_id);

    select start_time, end_time into v_start_time, v_end_time
    from public.shift_configurations
    where id = p_shift_configuration_id;

    if v_start_time is null then
      raise exception 'Turno no encontrado';
    end if;

    if exists (
      select 1
      from public.shift_assignments sa
      join public.shift_configurations sc on sc.id = sa.shift_configuration_id
      where sa.user_id = p_user_id
        and sa.status = 'EMPLEADO'
        and sa.valid_to is null
        and sa.day_of_week = p_day_of_week
        and sa.board_id != p_board_id
        and sc.start_time < v_end_time
        and v_start_time < sc.end_time
    ) then
      raise exception 'Esta persona ya está asignada a otro turno en ese horario.';
    end if;
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

-- ------------------------------------------------------------
-- holidays / sundays: mismo chequeo de usuario activo, vía trigger
-- (estas tablas escriben por RLS directo, no por una función RPC).
-- ------------------------------------------------------------

create or replace function public.trigger_assert_holiday_user_active()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_user_active(new.user_id);
  return new;
end;
$$;

drop trigger if exists holidays_assert_user_active on public.holidays;
create trigger holidays_assert_user_active
  before insert or update on public.holidays
  for each row execute function public.trigger_assert_holiday_user_active();

drop trigger if exists sundays_assert_user_active on public.sundays;
create trigger sundays_assert_user_active
  before insert or update on public.sundays
  for each row execute function public.trigger_assert_holiday_user_active();

-- ------------------------------------------------------------
-- board_members: mismo chequeo, pero solo cuando la fila queda
-- activa (agregar/reactivar a alguien). Sacar a alguien de un
-- tablero pone active = false y no debe bloquearse nunca, ni
-- siquiera si esa persona ya está inactiva.
-- ------------------------------------------------------------

create or replace function public.trigger_assert_board_member_user_active()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.active then
    perform public.assert_user_active(new.user_id);
  end if;
  return new;
end;
$$;

drop trigger if exists board_members_assert_user_active on public.board_members;
create trigger board_members_assert_user_active
  before insert or update on public.board_members
  for each row execute function public.trigger_assert_board_member_user_active();
