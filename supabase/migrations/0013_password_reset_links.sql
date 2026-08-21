-- ============================================================
-- 0013_password_reset_links.sql
-- Reutiliza la tabla invitations (mismo mecanismo de token de un
-- solo uso, compartido por WhatsApp) para restablecimiento de
-- contraseña de cuentas ya activas, distinguido por "kind".
--
-- El índice de "una invitación activa por usuario" se acota por
-- kind: así un usuario puede tener a la vez una invitación de
-- activación pendiente y, más adelante, un link de restablecimiento,
-- sin que se bloqueen entre sí.
-- ============================================================

alter table public.invitations
  add column kind text not null default 'ACTIVATION'
  check (kind in ('ACTIVATION', 'PASSWORD_RESET'));

drop index if exists uq_invitations_active_per_user;

create unique index uq_invitations_active_per_user_kind
  on public.invitations (user_id, kind)
  where used_at is null and revoked_at is null;
