-- ============================================================
-- 0025_producto_oferta.sql
-- Nuevo toggle "oferta" por producto -- se usa para marcarlo en el listado
-- y como filtro en la sección de Reportes.
-- ============================================================

alter table public.productos add column oferta boolean not null default false;

drop view public.productos_publico;

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
  p.precio_por_kg,
  p.oferta
from public.productos p
left join public.marcas mk on mk.id = p.marca_id
where p.organization_id = (auth.jwt() ->> 'organization_id')::uuid
  and p.active;

grant select on public.productos_publico to authenticated;
