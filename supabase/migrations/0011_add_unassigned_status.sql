-- ============================================================
-- 0011_add_unassigned_status.sql
-- Agrega el estado SIN_ASIGNAR como cuarto valor posible de
-- shift_assignments.status. Antes, la única forma de ver una celda
-- "vacía" era que nunca hubiera existido una fila para ese slot; no
-- había forma de volver una celda ya asignada a un estado vacío
-- desde la UI. Ahora es un estado explícito y seleccionable, con el
-- mismo tratamiento visual que la ausencia de fila (guion).
-- ============================================================

-- Se busca el nombre real del check constraint sobre la columna
-- status (en vez de asumir el nombre por defecto de Postgres) para
-- no romper la migración si en algún momento se lo nombró distinto.
do $$
declare
  v_constraint_name text;
begin
  select con.conname into v_constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'shift_assignments'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%status%EMPLEADO%';

  if v_constraint_name is not null then
    execute format('alter table public.shift_assignments drop constraint %I', v_constraint_name);
  end if;
end $$;

alter table public.shift_assignments
  add constraint shift_assignments_status_check
  check (status in ('EMPLEADO', 'FERIADO', 'CERRADO', 'SIN_ASIGNAR'));

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
