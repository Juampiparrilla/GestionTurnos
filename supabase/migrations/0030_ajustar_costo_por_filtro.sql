-- ============================================================
-- 0030_ajustar_costo_por_filtro.sql
-- Ajuste masivo de COSTO sobre un conjunto de productos elegido a mano en
-- pantalla (buscador + filtros), a diferencia de fn_bulk_update_porcentaje_
-- proveedor que ajusta el % de ganancia de todos los productos de un
-- proveedor. Acá el % se aplica sobre el costo actual de cada producto
-- (ej. el proveedor subió los precios un 15%), y las tres pistas de precio
-- se recalculan con el % de ganancia que ya tenía cada una -- sin pisar
-- las que están fijadas manualmente, mismo criterio que el otro ajuste.
-- ============================================================

create or replace function public.fn_bulk_update_costo(
  p_producto_ids uuid[],
  p_porcentaje numeric
) returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_rows integer;
begin
  update productos p set
    costo = c.costo_nuevo,
    precio_venta_cerrada = case
      when p.precio_manual_cerrada then p.precio_venta_cerrada
      else round(c.costo_nuevo * (1 + p.porcentaje_ganancia_cerrada / 100), 2)
    end,
    porcentaje_ganancia_cerrada = case
      when p.precio_manual_cerrada and c.costo_nuevo > 0
        then round(((p.precio_venta_cerrada - c.costo_nuevo) / c.costo_nuevo) * 100, 2)
      else p.porcentaje_ganancia_cerrada
    end,
    precio_venta_abierta = case
      when p.unidad_medida <> 'kg' or p.precio_manual_abierta then p.precio_venta_abierta
      else round(c.costo_nuevo * (1 + p.porcentaje_ganancia_abierta / 100), 2)
    end,
    porcentaje_ganancia_abierta = case
      when p.unidad_medida = 'kg' and p.precio_manual_abierta and c.costo_nuevo > 0
        then round(((p.precio_venta_abierta - c.costo_nuevo) / c.costo_nuevo) * 100, 2)
      else p.porcentaje_ganancia_abierta
    end,
    precio_venta_por_mayor = case
      when p.precio_manual_por_mayor then p.precio_venta_por_mayor
      else round(c.costo_nuevo * (1 + p.porcentaje_ganancia_por_mayor / 100), 2)
    end,
    porcentaje_ganancia_por_mayor = case
      when p.precio_manual_por_mayor and c.costo_nuevo > 0
        then round(((p.precio_venta_por_mayor - c.costo_nuevo) / c.costo_nuevo) * 100, 2)
      else p.porcentaje_ganancia_por_mayor
    end
  from (
    select id, round(costo * (1 + p_porcentaje / 100), 2) as costo_nuevo
    from productos
    where id = any(p_producto_ids) and active
  ) c
  where p.id = c.id;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

revoke all on function public.fn_bulk_update_costo(uuid[], numeric) from public;
grant execute on function public.fn_bulk_update_costo(uuid[], numeric) to authenticated;
