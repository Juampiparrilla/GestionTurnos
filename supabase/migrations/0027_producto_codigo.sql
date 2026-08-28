-- ============================================================
-- 0027_producto_codigo.sql
-- Código único legible por producto (ej. "ALIMENTO-PERRO-ADULTO"),
-- autogenerado a partir del nombre al crear el producto -- no lo carga
-- el usuario. Índice único parcial (permite null en filas viejas que no
-- tenían código).
-- ============================================================

alter table public.productos
  add column codigo text;

create unique index idx_productos_codigo on public.productos (organization_id, codigo)
  where codigo is not null;
