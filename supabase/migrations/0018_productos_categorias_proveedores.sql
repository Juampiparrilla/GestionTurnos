-- ============================================================
-- 0018_productos_categorias_proveedores.sql
-- Módulo Productos: categorías y proveedores del catálogo de la
-- forrajería. Mismo patrón multi-tenant que boards (0003): organization_id
-- propio, RLS por JWT claims, escritura solo ADMIN/SUPER_ADMIN.
-- ============================================================

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nombre text not null,
  descripcion text,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categorias_org_nombre_unique unique (organization_id, nombre)
);

create index idx_categorias_organization_id on public.categorias (organization_id);

create trigger categorias_set_updated_at
  before update on public.categorias
  for each row execute function public.set_updated_at();

create table public.proveedores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nombre text not null,
  contacto text,
  telefono text,
  email text,
  notas text,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint proveedores_org_nombre_unique unique (organization_id, nombre)
);

create index idx_proveedores_organization_id on public.proveedores (organization_id);

create trigger proveedores_set_updated_at
  before update on public.proveedores
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
--
-- Ni categorías ni proveedores tienen datos sensibles (costo/ganancia
-- viven en `presentaciones`, migración 0019), así que cualquier miembro
-- activo de la organización las puede leer. Solo ADMIN/SUPER_ADMIN
-- gestiona (crea/edita) -- mismo criterio que boards_insert_admin.
-- ------------------------------------------------------------

alter table public.categorias enable row level security;
alter table public.proveedores enable row level security;

create policy categorias_select_org on public.categorias
  for select using (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

create policy categorias_insert_admin on public.categorias
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy categorias_update_admin on public.categorias
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy proveedores_select_org on public.proveedores
  for select using (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

create policy proveedores_insert_admin on public.proveedores
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy proveedores_update_admin on public.proveedores
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
