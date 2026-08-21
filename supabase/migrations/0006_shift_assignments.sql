-- ============================================================
-- 0006_shift_assignments.sql
-- Asignaciones de turnos: la "semana tipo" con historial versionado.
--
-- day_of_week: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes,
-- 5=Sábado, 6=Domingo.
--
-- No se hace UPDATE destructivo: cambiar una asignación cierra la
-- fila vigente (valid_to = now()) e inserta una nueva (valid_from =
-- now(), valid_to = null). Un índice único parcial garantiza una sola
-- fila vigente por (board_id, shift_configuration_id, day_of_week).
-- Esto da una UI de "semana tipo" simple (solo se lee valid_to is
-- null) sin perder auditoría/historial.
-- ============================================================

create table public.shift_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_id uuid not null references public.boards (id),
  shift_configuration_id uuid not null references public.shift_configurations (id),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  status text not null check (status in ('EMPLEADO', 'FERIADO', 'CERRADO')),
  user_id uuid references public.profiles (id),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),

  constraint shift_assignments_user_required check (
    (status = 'EMPLEADO' and user_id is not null)
    or (status != 'EMPLEADO' and user_id is null)
  )
);

create unique index uq_shift_assignment_current
  on public.shift_assignments (board_id, shift_configuration_id, day_of_week)
  where valid_to is null;

create index idx_shift_assignments_board_current
  on public.shift_assignments (board_id, day_of_week)
  where valid_to is null;

create index idx_shift_assignments_user_id on public.shift_assignments (user_id);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.shift_assignments enable row level security;

create policy shift_assignments_select_admin on public.shift_assignments
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy shift_assignments_select_member on public.shift_assignments
  for select using (
    valid_to is null and public.is_active_board_member(shift_assignments.board_id)
  );

-- No hay policies de insert/update directas: toda escritura pasa por
-- set_shift_assignment(), que valida el rol y hace el
-- cerrar+insertar de forma atómica salteando RLS a propósito.

-- ------------------------------------------------------------
-- Función: crea/actualiza la asignación vigente de un slot de forma
-- atómica (cierra la vigente si existe + inserta la nueva versión).
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

revoke all on function public.set_shift_assignment(uuid, uuid, smallint, text, uuid) from public;
grant execute on function public.set_shift_assignment(uuid, uuid, smallint, text, uuid) to authenticated;
