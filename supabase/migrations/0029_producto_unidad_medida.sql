-- ============================================================
-- 0029_producto_unidad_medida.sql
-- Un producto se puede vender por Kg (bolsa cerrada / bolsa abierta /
-- por mayor, como hasta ahora) o por Unidad (solo precio unitario / por
-- mayor -- no tiene sentido "bolsa abierta" para algo que se vende
-- entero, ej. un sachet o un accesorio). El campo `kg` sigue
-- representando la cantidad (kilos o unidades según este campo).
-- ============================================================

alter table public.productos
  add column unidad_medida text not null default 'kg'
    check (unidad_medida in ('kg', 'unidad'));
