-- ============================================================
-- 0026_organization_phone.sql
-- Teléfono de contacto de la organización, usado como marca de agua en
-- los reportes de productos (junto al nombre). Opcional -- si no se carga,
-- el PDF solo muestra el nombre.
-- ============================================================

alter table public.organizations
  add column phone text;

-- No existía policy de update para organizations (solo se podía leer la
-- propia) -- se agrega restringida a ADMIN/SUPER_ADMIN de la organización,
-- mismo criterio que el resto de las tablas administrativas.
create policy organizations_update_admin on public.organizations
  for update using (
    id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
