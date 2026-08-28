-- ============================================================
-- 0024_aplanar_productos.sql
-- Se elimina el concepto de "presentación" como entidad separada: cada
-- producto pasa a incluir directamente su kg y las tres pistas de precio
-- (antes vivían en la tabla `presentaciones`). Un producto con varios
-- pesos ahora son simplemente varias filas de `productos` con el mismo
-- nombre/marca -- un solo formulario, un solo paso para cargar cada uno.
--
-- Los datos existentes son de prueba y se descartan (el usuario lo
-- confirmó explícitamente) -- no hace falta migrar filas.
-- ============================================================

drop view public.presentaciones_publico;
drop table public.presentaciones;
drop table public.productos cascade;

create table public.productos (
  id                           uuid primary key default gen_random_uuid(),
  organization_id              uuid not null references public.organizations (id),
  nombre                       text not null,
  marca_id                     uuid references public.marcas (id),
  categoria_id                 uuid references public.categorias (id),
  proveedor_id                 uuid references public.proveedores (id),
  descripcion                  text,
  kg                           numeric not null check (kg > 0),
  costo                        numeric not null check (costo >= 0),
  porcentaje_ganancia_cerrada  numeric not null check (porcentaje_ganancia_cerrada >= 0),
  precio_venta_cerrada         numeric not null check (precio_venta_cerrada >= 0),
  precio_manual_cerrada        boolean not null default false,
  porcentaje_ganancia_abierta  numeric not null check (porcentaje_ganancia_abierta >= 0),
  precio_venta_abierta         numeric not null check (precio_venta_abierta >= 0),
  precio_manual_abierta        boolean not null default false,
  porcentaje_ganancia_por_mayor numeric not null check (porcentaje_ganancia_por_mayor >= 0),
  precio_venta_por_mayor       numeric not null check (precio_venta_por_mayor >= 0),
  precio_manual_por_mayor      boolean not null default false,
  precio_por_kg                numeric generated always as (round(precio_venta_abierta / kg, 2)) stored,
  active                       boolean not null default true,
  created_by                   uuid references public.profiles (id),
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

create index idx_productos_organization_id on public.productos (organization_id);
create index idx_productos_marca_id on public.productos (marca_id);
create index idx_productos_categoria_id on public.productos (categoria_id);
create index idx_productos_proveedor_id on public.productos (proveedor_id);

create trigger productos_set_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
--
-- A diferencia de la version anterior, `productos` ahora SI tiene datos
-- sensibles (costo y los tres %) -- queda restringida a ADMIN/SUPER_ADMIN,
-- igual que antes estaba `presentaciones`. EMPLEADO pasa por la vista
-- `productos_publico` de mas abajo, que nunca expone esas columnas.
-- ------------------------------------------------------------

alter table public.productos enable row level security;

create policy productos_select_admin on public.productos
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

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

create policy productos_delete_admin on public.productos
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

grant select on public.productos to authenticated;

-- ------------------------------------------------------------
-- Vista segura para EMPLEADO: nunca expone costo ni los tres %. Sin
-- security_invoker a propósito -- corre con los privilegios de quien la
-- crea, así el RLS restrictivo de `productos` no se hereda acá.
-- ------------------------------------------------------------

create view public.productos_publico as
select
  p.id as producto_id,
  p.nombre,
  p.marca_id,
  mk.nombre as marca,
  p.categoria_id,
  p.proveedor_id,
  p.kg,
  p.precio_venta_cerrada,
  p.precio_venta_abierta,
  p.precio_venta_por_mayor,
  p.precio_por_kg
from public.productos p
left join public.marcas mk on mk.id = p.marca_id
where p.organization_id = (auth.jwt() ->> 'organization_id')::uuid
  and p.active;

grant select on public.productos_publico to authenticated;

-- ------------------------------------------------------------
-- Ajuste masivo por proveedor: ahora actualiza `productos` directo (ya no
-- hace falta el join con presentaciones). Mismo criterio: cada % es
-- opcional, nunca pisa una fila con el precio fijado manualmente.
-- ------------------------------------------------------------

create or replace function public.fn_bulk_update_porcentaje_proveedor(
  p_proveedor_id uuid,
  p_porcentaje_cerrada numeric default null,
  p_porcentaje_abierta numeric default null,
  p_porcentaje_por_mayor numeric default null
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
    update productos set
      porcentaje_ganancia_cerrada = p_porcentaje_cerrada,
      precio_venta_cerrada = round(costo * (1 + p_porcentaje_cerrada / 100), 2)
    where proveedor_id = p_proveedor_id and precio_manual_cerrada = false and active;
    get diagnostics v_rows = row_count;
    v_count := v_count + v_rows;
  end if;

  if p_porcentaje_abierta is not null then
    update productos set
      porcentaje_ganancia_abierta = p_porcentaje_abierta,
      precio_venta_abierta = round(costo * (1 + p_porcentaje_abierta / 100), 2)
    where proveedor_id = p_proveedor_id and precio_manual_abierta = false and active;
    get diagnostics v_rows = row_count;
    v_count := v_count + v_rows;
  end if;

  if p_porcentaje_por_mayor is not null then
    update productos set
      porcentaje_ganancia_por_mayor = p_porcentaje_por_mayor,
      precio_venta_por_mayor = round(costo * (1 + p_porcentaje_por_mayor / 100), 2)
    where proveedor_id = p_proveedor_id and precio_manual_por_mayor = false and active;
    get diagnostics v_rows = row_count;
    v_count := v_count + v_rows;
  end if;

  return v_count;
end;
$$;

revoke all on function public.fn_bulk_update_porcentaje_proveedor(uuid, numeric, numeric, numeric) from public;
grant execute on function public.fn_bulk_update_porcentaje_proveedor(uuid, numeric, numeric, numeric) to authenticated;
