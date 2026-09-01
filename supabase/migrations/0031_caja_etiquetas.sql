-- ============================================================
-- 0031_caja_etiquetas.sql
-- Etiquetas de Caja (ingreso/egreso), administrables por ADMIN/SUPER_ADMIN.
-- ============================================================

create table public.caja_etiquetas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nombre text not null,
  tipo text not null check (tipo in ('ingreso', 'egreso')),
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint caja_etiquetas_nombre_unique unique (organization_id, nombre)
);

create index idx_caja_etiquetas_organization_id on public.caja_etiquetas (organization_id);

create trigger caja_etiquetas_set_updated_at
  before update on public.caja_etiquetas
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.caja_etiquetas enable row level security;

-- Cualquier miembro activo de la organización puede leerlas (las necesita
-- para el dropdown de Nuevo movimiento), sin importar el rol.
create policy caja_etiquetas_select_org on public.caja_etiquetas
  for select using (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

create policy caja_etiquetas_insert_admin on public.caja_etiquetas
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy caja_etiquetas_update_admin on public.caja_etiquetas
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
