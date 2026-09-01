-- ============================================================
-- 0033_caja_deudas.sql
-- Deudas de Caja: plata que le prestaron al negocio (ej. para pagar el
-- alquiler), separado de los movimientos de Ingreso/Egreso porque no es
-- una venta ni un gasto real. Solo ADMIN/SUPER_ADMIN acceden.
-- ============================================================

create table public.caja_deudas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  fecha date not null,
  acreedor text not null,
  monto numeric(12, 2) not null check (monto > 0),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagada', 'anulada')),
  observacion text,
  pagada_por uuid references public.profiles (id),
  pagada_en timestamptz,
  anulada_por uuid references public.profiles (id),
  anulada_en timestamptz,
  motivo_anulacion text,
  created_by uuid not null references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_caja_deudas_org_fecha on public.caja_deudas (organization_id, fecha);

create trigger caja_deudas_set_updated_at
  before update on public.caja_deudas
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.caja_deudas enable row level security;

-- Solo ADMIN/SUPER_ADMIN acceden (ni siquiera lectura para Empleado, a
-- diferencia de caja_etiquetas que sí es legible por toda la organización).
create policy caja_deudas_select_admin on public.caja_deudas
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy caja_deudas_insert_admin on public.caja_deudas
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy caja_deudas_update_admin on public.caja_deudas
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
