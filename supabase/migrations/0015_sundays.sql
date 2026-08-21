-- ============================================================
-- 0015_sundays.sql
-- Registro de Domingos por tablero: mismo patrón que holidays
-- (0014), pero en tabla separada porque son conceptos distintos en
-- el negocio (cobertura de domingo vs. feriado calendario), aunque
-- la estructura sea igual.
-- ============================================================

create table public.sundays (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_id uuid not null references public.boards (id),
  sunday_date date not null,
  user_id uuid not null references public.profiles (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

create unique index uq_sundays_board_date_user
  on public.sundays (board_id, sunday_date, user_id);

create index idx_sundays_board_date on public.sundays (board_id, sunday_date);

create or replace function public.set_sunday_updated_by()
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

create trigger sundays_set_updated_by
  before update on public.sundays
  for each row execute function public.set_sunday_updated_by();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.sundays enable row level security;

create policy sundays_select_admin on public.sundays
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy sundays_select_member on public.sundays
  for select using (public.is_active_board_member(sundays.board_id));

create policy sundays_insert_admin on public.sundays
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy sundays_update_admin on public.sundays
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy sundays_delete_admin on public.sundays
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
