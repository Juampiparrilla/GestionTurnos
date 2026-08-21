-- ============================================================
-- 0010_auto_clear_assignments.sql
-- Reemplaza la limpieza manual de asignaciones (que solo cubría
-- desactivar un usuario, no quitarlo de un tablero, y no corregía
-- inconsistencias ya existentes) por triggers automáticos: se
-- disparan solos al desactivar un usuario o al quitarlo de un
-- tablero, sin depender de que cada Route Handler se acuerde de
-- llamar a una función. También corrige retroactivamente los datos
-- que ya habían quedado inconsistentes.
-- ============================================================

create or replace function public.trigger_clear_assignments_on_member_removed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.active = false and old.active = true then
    update public.shift_assignments
    set valid_to = now()
    where user_id = new.user_id
      and board_id = new.board_id
      and status = 'EMPLEADO'
      and valid_to is null;
  end if;
  return new;
end;
$$;

drop trigger if exists board_members_clear_assignments on public.board_members;
create trigger board_members_clear_assignments
  after update on public.board_members
  for each row execute function public.trigger_clear_assignments_on_member_removed();

create or replace function public.trigger_clear_assignments_on_user_deactivated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.active = false and old.active = true then
    update public.shift_assignments
    set valid_to = now()
    where user_id = new.id
      and status = 'EMPLEADO'
      and valid_to is null;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_clear_assignments_on_deactivate on public.profiles;
create trigger profiles_clear_assignments_on_deactivate
  after update on public.profiles
  for each row execute function public.trigger_clear_assignments_on_user_deactivated();

-- Limpieza retroactiva: cierra asignaciones vigentes que ya deberían
-- haber desaparecido antes de que existieran estos triggers (usuario
-- inactivo, o ya no es miembro activo del tablero correspondiente).
update public.shift_assignments sa
set valid_to = now()
where valid_to is null
  and status = 'EMPLEADO'
  and (
    exists (
      select 1 from public.profiles p
      where p.id = sa.user_id and p.active = false
    )
    or not exists (
      select 1 from public.board_members bm
      where bm.board_id = sa.board_id
        and bm.user_id = sa.user_id
        and bm.active = true
    )
  );

-- clear_user_assignments() queda obsoleta: la lógica ahora vive en
-- los triggers de arriba, que se disparan solos sin depender de que
-- el código de la app se acuerde de llamarla.
drop function if exists public.clear_user_assignments(uuid);
