-- ============================================================
-- 0028_producto_nombre_kg_unique.sql
-- Evita cargar el mismo producto (mismo nombre y mismo kg) dos veces en
-- la misma organización -- ej. "COMPLETE CACHORRO RAZA PEQUEÑA" 20kg
-- cargado por duplicado.
--
-- IMPORTANTE: si ya existen productos duplicados, este ALTER TABLE va a
-- fallar. Antes de correrlo, buscá los duplicados con:
--   select organization_id, nombre, kg, count(*)
--   from productos
--   group by organization_id, nombre, kg
--   having count(*) > 1;
-- y borrá o cambiale el nombre/kg a las filas de más.
-- ============================================================

alter table public.productos
  add constraint productos_org_nombre_kg_unique unique (organization_id, nombre, kg);
