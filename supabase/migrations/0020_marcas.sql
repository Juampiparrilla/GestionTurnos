-- ============================================================
-- 0020_marcas.sql
-- Marca pasa de texto libre a entidad con ABM propia (como categorías y
-- proveedores). Se migran los datos ya cargados en productos.marca antes
-- de tirar la columna. También se saca presentaciones.sku (no se usa).
-- ============================================================

create table public.marcas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nombre text not null,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint marcas_org_nombre_unique unique (organization_id, nombre)
);

create index idx_marcas_organization_id on public.marcas (organization_id);

create trigger marcas_set_updated_at
  before update on public.marcas
  for each row execute function public.set_updated_at();

alter table public.marcas enable row level security;

create policy marcas_select_org on public.marcas
  for select using (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

create policy marcas_insert_admin on public.marcas
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy marcas_update_admin on public.marcas
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

grant select on public.marcas to authenticated;

-- ------------------------------------------------------------
-- Migración de datos: una fila en marcas por cada valor distinto ya
-- cargado en productos.marca, y productos.marca_id apuntando a ella.
-- ------------------------------------------------------------

insert into public.marcas (organization_id, nombre)
select distinct organization_id, marca
from public.productos
where marca is not null and marca <> '';

alter table public.productos add column marca_id uuid references public.marcas (id);

update public.productos p
set marca_id = m.id
from public.marcas m
where m.organization_id = p.organization_id and m.nombre = p.marca;

create index idx_productos_marca_id on public.productos (marca_id);

-- presentaciones_publico depende de productos.marca -- hay que tirar la
-- vista antes de poder borrar la columna, y recrearla después ya con
-- marca_id + el nombre de la marca via join (mismo shape hacia afuera:
-- sigue exponiendo "marca" como texto).
drop view public.presentaciones_publico;

alter table public.productos drop column marca;
alter table public.presentaciones drop column sku;

create view public.presentaciones_publico as
select
  pr.id as presentacion_id,
  pr.producto_id,
  p.nombre,
  p.marca_id,
  mk.nombre as marca,
  p.categoria_id,
  p.proveedor_id,
  pr.kg,
  pr.precio_venta_cerrada,
  pr.precio_venta_abierta,
  pr.precio_por_kg
from public.presentaciones pr
join public.productos p on p.id = pr.producto_id
left join public.marcas mk on mk.id = p.marca_id
where pr.organization_id = (auth.jwt() ->> 'organization_id')::uuid
  and pr.active
  and p.active;

grant select on public.presentaciones_publico to authenticated;
