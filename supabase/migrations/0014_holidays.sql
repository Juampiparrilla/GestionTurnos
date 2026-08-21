-- ============================================================
-- 0014_holidays.sql
-- Registro de feriados por tablero: quién cubre una fecha real
-- (no un día de la semana). Es independiente de la grilla semanal
-- tipo (shift_assignments), que sigue usando su propio estado
-- FERIADO por día de la semana sin cambios.
--
-- updated_at/updated_by se actualizan solos vía trigger (leyendo
-- auth.uid()), para que "última modificación" sea confiable sin
-- depender de que cada Route Handler se acuerde de setearlos.
-- ============================================================

create table public.holidays (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_id uuid not null references public.boards (id),
  holiday_date date not null,
  user_id uuid not null references public.profiles (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

create unique index uq_holidays_board_date_user
  on public.holidays (board_id, holiday_date, user_id);

create index idx_holidays_board_date on public.holidays (board_id, holiday_date);

create or replace function public.set_holiday_updated_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

create trigger holidays_set_updated_by
  before update on public.holidays
  for each row execute function public.set_holiday_updated_by();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.holidays enable row level security;

create policy holidays_select_admin on public.holidays
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy holidays_select_member on public.holidays
  for select using (public.is_active_board_member(holidays.board_id));

create policy holidays_insert_admin on public.holidays
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy holidays_update_admin on public.holidays
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy holidays_delete_admin on public.holidays
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
