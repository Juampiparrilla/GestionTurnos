-- ============================================================
-- 0021_presentaciones_por_mayor.sql
-- Tercera pista de precio de venta en presentaciones: "por mayor" (venta a
-- otro comercio/revendedor), igual patrón que cerrada/abierta -- su propio
-- % de ganancia, precio calculado y flag de precio manual.
-- Requiere 0020 ya aplicada (usa presentaciones_publico tal como quedó ahí).
-- ============================================================

alter table public.presentaciones
  add column porcentaje_ganancia_por_mayor numeric not null default 0 check (porcentaje_ganancia_por_mayor >= 0),
  add column precio_venta_por_mayor numeric not null default 0 check (precio_venta_por_mayor >= 0),
  add column precio_manual_por_mayor boolean not null default false;

-- Backfill: como no hay % sensato que adivinar para lo ya cargado, el
-- precio de venta por mayor arranca igual al costo (0% de ganancia) --
-- el admin lo ajusta a mano o con el ajuste masivo por proveedor.
update public.presentaciones set precio_venta_por_mayor = costo;

drop view public.presentaciones_publico;

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
  pr.precio_venta_por_mayor,
  pr.precio_por_kg
from public.presentaciones pr
join public.productos p on p.id = pr.producto_id
left join public.marcas mk on mk.id = p.marca_id
where pr.organization_id = (auth.jwt() ->> 'organization_id')::uuid
  and pr.active
  and p.active;

grant select on public.presentaciones_publico to authenticated;

-- Ajuste masivo por proveedor: suma la pista "por mayor" como tercer
-- parámetro opcional, mismo criterio que cerrada/abierta (NULL = no
-- tocar; nunca pisa una presentación con el precio fijado manualmente).
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

  if p_porcentaje_por_mayor is not null then
    update presentaciones pr set
      porcentaje_ganancia_por_mayor = p_porcentaje_por_mayor,
      precio_venta_por_mayor = round(pr.costo * (1 + p_porcentaje_por_mayor / 100), 2)
    from productos p
    where p.id = pr.producto_id and p.proveedor_id = p_proveedor_id
      and pr.precio_manual_por_mayor = false and pr.active and p.active;
    get diagnostics v_rows = row_count;
    v_count := v_count + v_rows;
  end if;

  return v_count;
end;
$$;
