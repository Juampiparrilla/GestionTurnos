-- ============================================================
-- 0032_caja_movimientos.sql
-- Movimientos de Caja (ingresos/egresos) por local y turno.
--
-- Balance nunca se persiste: se deriva de sum(monto) filtrado por tipo y
-- estado = 'activo'. Un movimiento nunca se borra físicamente: se anula
-- (estado = 'anulado') y queda en el historial.
-- ============================================================

create table public.caja_movimientos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  tipo text not null check (tipo in ('ingreso', 'egreso')),
  etiqueta_id uuid not null references public.caja_etiquetas (id),
  monto numeric(12, 2) not null check (monto > 0),
  fecha date not null,
  board_id uuid not null references public.boards (id),
  shift_configuration_id uuid references public.shift_configurations (id),
  observacion text,
  origen text not null default 'manual' check (origen in ('manual', 'venta', 'ajuste')),
  estado text not null default 'activo' check (estado in ('activo', 'anulado')),
  anulado_por uuid references public.profiles (id),
  anulado_en timestamptz,
  motivo_anulacion text,
  created_by uuid not null references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_caja_movimientos_org_fecha on public.caja_movimientos (organization_id, fecha);
create index idx_caja_movimientos_board_id on public.caja_movimientos (board_id);
create index idx_caja_movimientos_etiqueta_id on public.caja_movimientos (etiqueta_id);

create trigger caja_movimientos_set_updated_at
  before update on public.caja_movimientos
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.caja_movimientos enable row level security;

-- ADMIN/SUPER_ADMIN ven todos los movimientos de su organización
create policy caja_movimientos_select_admin on public.caja_movimientos
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- Cualquier miembro activo del local ve los movimientos de ese local
create policy caja_movimientos_select_member on public.caja_movimientos
  for select using (public.is_active_board_member(caja_movimientos.board_id));

-- ADMIN/SUPER_ADMIN pueden cargar en cualquier local de la organización
create policy caja_movimientos_insert_admin on public.caja_movimientos
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- Un miembro activo del local puede cargar movimientos de ese local
create policy caja_movimientos_insert_member on public.caja_movimientos
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and public.is_active_board_member(caja_movimientos.board_id)
  );

-- Editar/anular: solo ADMIN/SUPER_ADMIN
create policy caja_movimientos_update_admin on public.caja_movimientos
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
