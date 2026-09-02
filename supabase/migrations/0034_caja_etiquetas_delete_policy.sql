-- ============================================================
-- 0034_caja_etiquetas_delete_policy.sql
-- Faltaba la policy de DELETE en caja_etiquetas: sin ella, RLS bloquea el
-- borrado silenciosamente (0 filas afectadas) aunque la etiqueta no esté
-- en uso, y el botón de borrar nunca funciona.
-- ============================================================

create policy caja_etiquetas_delete_admin on public.caja_etiquetas
  for delete using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
