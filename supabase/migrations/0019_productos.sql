-- ============================================================
-- 0019_productos.sql
-- Módulo Productos: productos y presentaciones (bolsas). Cada
-- presentación tiene DOS pistas de precio de venta -- bolsa cerrada (se
-- vende la bolsa entera) y bolsa abierta (se vende suelto por kg, con más
-- margen) -- cada una con su % de ganancia y su propio flag de "precio
-- manual" (el ajuste masivo por proveedor no toca una pista fijada a
-- mano). precio_por_kg es una columna generada: precio_venta_abierta / kg.
-- ============================================================

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nombre text not null,
  -- Marca (ej. "Belcan", "Agility"): texto libre con autocompletado desde
  -- valores ya cargados en el formulario -- sin ABM propia, a diferencia
  -- de categoría/proveedor.
  marca text,
  categoria_id uuid references public.categorias (id),
  proveedor_id uuid references public.proveedores (id),
  descripcion text,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_productos_organization_id on public.productos (organization_id);
create index idx_productos_categoria_id on public.productos (categoria_id);
create index idx_productos_proveedor_id on public.productos (proveedor_id);

create trigger productos_set_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

create table public.presentaciones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  producto_id uuid not null references public.productos (id),
  kg numeric not null check (kg > 0),
  sku text,
  costo numeric not null check (costo >= 0),
  porcentaje_ganancia_cerrada numeric not null check (porcentaje_ganancia_cerrada >= 0),
  precio_venta_cerrada numeric not null check (precio_venta_cerrada >= 0),
  precio_manual_cerrada boolean not null default false,
  porcentaje_ganancia_abierta numeric not null check (porcentaje_ganancia_abierta >= 0),
  precio_venta_abierta numeric not null check (precio_venta_abierta >= 0),
  precio_manual_abierta boolean not null default false,
  precio_por_kg numeric generated always as (round(precio_venta_abierta / kg, 2)) stored,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_presentaciones_organization_id on public.presentaciones (organization_id);
create index idx_presentaciones_producto_id on public.presentaciones (producto_id);

create trigger presentaciones_set_updated_at
  before update on public.presentaciones
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
--
-- `productos` no tiene datos sensibles, cualquier miembro de la
-- organización la lee. `presentaciones` SÍ tiene costo y los dos % de
-- ganancia -- esa la lee directo SOLO ADMIN/SUPER_ADMIN; EMPLEADO pasa
-- por la vista `presentaciones_publico` de más abajo, que nunca expone
-- esas columnas.
-- ------------------------------------------------------------

alter table public.productos enable row level security;
alter table public.presentaciones enable row level security;

create policy productos_select_org on public.productos
  for select using (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

create policy productos_insert_admin on public.productos
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy productos_update_admin on public.productos
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy presentaciones_select_admin on public.presentaciones
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy presentaciones_insert_admin on public.presentaciones
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy presentaciones_update_admin on public.presentaciones
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- ------------------------------------------------------------
-- Vista segura para EMPLEADO: nunca expone costo ni los % de ganancia.
-- A propósito SIN `security_invoker` -- corre con los privilegios de quien
-- la crea (dueño de la vista), así el RLS restrictivo de `presentaciones`
-- (solo ADMIN/SUPER_ADMIN) no se hereda acá. El propio filtro por
-- organization_id + active reemplaza a RLS para esta vista puntual.
-- ------------------------------------------------------------

create view public.presentaciones_publico as
select
  pr.id as presentacion_id,
  pr.producto_id,
  p.nombre,
  p.marca,
  p.categoria_id,
  p.proveedor_id,
  pr.kg,
  pr.precio_venta_cerrada,
  pr.precio_venta_abierta,
  pr.precio_por_kg
from public.presentaciones pr
join public.productos p on p.id = pr.producto_id
where pr.organization_id = (auth.jwt() ->> 'organization_id')::uuid
  and pr.active
  and p.active;

grant select on public.presentaciones_publico to authenticated;

-- ------------------------------------------------------------
-- Ajuste masivo de % de ganancia por proveedor. Hace falta como función
-- porque PostgREST no permite una expresión por fila (costo * ...) en un
-- `.update()` directo. SECURITY INVOKER (no DEFINER): corre con los
-- privilegios de quien llama, así el propio RLS de `presentaciones` ya
-- impide que un no-admin actualice nada -- no hay que reimplementar el
-- chequeo de rol a mano.
-- ------------------------------------------------------------

create or replace function public.fn_bulk_update_porcentaje_proveedor(
  p_proveedor_id uuid,
  p_porcentaje_cerrada numeric default null,
  p_porcentaje_abierta numeric default null
) returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count integer := 0;
  v_rows integer;
begin
  if p_porcentaje_cerrada is not null then
    update presentaciones pr set
      porcentaje_ganancia_cerrada = p_porcentaje_cerrada,
      precio_venta_cerrada = round(pr.costo * (1 + p_porcentaje_cerrada / 100), 2)
    from productos p
    where p.id = pr.producto_id and p.proveedor_id = p_proveedor_id
      and pr.precio_manual_cerrada = false and pr.active and p.active;
    get diagnostics v_rows = row_count;
    v_count := v_count + v_rows;
  end if;

  if p_porcentaje_abierta is not null then
    update presentaciones pr set
      porcentaje_ganancia_abierta = p_porcentaje_abierta,
      precio_venta_abierta = round(pr.costo * (1 + p_porcentaje_abierta / 100), 2)
    from productos p
    where p.id = pr.producto_id and p.proveedor_id = p_proveedor_id
      and pr.precio_manual_abierta = false and pr.active and p.active;
    get diagnostics v_rows = row_count;
    v_count := v_count + v_rows;
  end if;

  return v_count;
end;
$$;

revoke all on function public.fn_bulk_update_porcentaje_proveedor(uuid, numeric, numeric) from public;
grant execute on function public.fn_bulk_update_porcentaje_proveedor(uuid, numeric, numeric) to authenticated;
