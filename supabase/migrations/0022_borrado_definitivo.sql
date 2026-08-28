-- ============================================================
-- 0022_borrado_definitivo.sql
-- Suma borrado DEFINITIVO (no solo desactivar) a categorías, proveedores,
-- marcas, productos y presentaciones -- a diferencia del resto de la app
-- (boards, users), que a propósito nunca borra filas. Acá el usuario lo
-- pidió explícitamente: "si tomo la decisión de borrarla ya no tiene que
-- estar en la lista".
--
-- categoria_id/proveedor_id/marca_id en productos quedan SIN cascada: si
-- hay productos usando esa categoría/proveedor/marca, el DELETE falla con
-- una violación de FK (23503) que la API traduce a un mensaje claro --
-- evita que un producto quede huérfano de clasificación sin que nadie se
-- entere. presentaciones sí cascadea con su producto: no tiene sentido que
-- sobrevivan solas.
-- ============================================================

alter table public.presentaciones drop constraint presentaciones_producto_id_fkey;
alter table public.presentaciones
  add constraint presentaciones_producto_id_fkey
  foreign key (producto_id) references public.productos (id) on delete cascade;

create policy categorias_delete_admin on public.categorias
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy proveedores_delete_admin on public.proveedores
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy marcas_delete_admin on public.marcas
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy productos_delete_admin on public.productos
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy presentaciones_delete_admin on public.presentaciones
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
