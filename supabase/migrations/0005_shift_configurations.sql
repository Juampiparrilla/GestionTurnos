-- ============================================================
-- 0005_shift_configurations.sql
-- Turnos configurables por tablero.
--
-- Decisión V1: un turno no puede cruzar la medianoche (start_time <
-- end_time, ambos dentro del mismo día). Se documenta como límite
-- conocido; usar TIME (no TIMESTAMP) no impide extenderlo después.
-- ============================================================

create table public.shift_configurations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_id uuid not null references public.boards (id),
  name text,
  start_time time not null,
  end_time time not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shift_configurations_time_check check (start_time < end_time)
);

create index idx_shift_configurations_board_id on public.shift_configurations (board_id);

create trigger shift_configurations_set_updated_at
  before update on public.shift_configurations
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.shift_configurations enable row level security;

-- ADMIN/SUPER_ADMIN ven y gestionan los turnos de su organización
create policy shift_configurations_select_admin on public.shift_configurations
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- Cualquier miembro activo del tablero ve sus turnos activos
create policy shift_configurations_select_member on public.shift_configurations
  for select using (
    active = true and public.is_active_board_member(shift_configurations.board_id)
  );

create policy shift_configurations_insert_admin on public.shift_configurations
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy shift_configurations_update_admin on public.shift_configurations
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
