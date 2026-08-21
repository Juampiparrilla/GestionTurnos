-- ============================================================
-- 0008_invitations.sql
-- Invitaciones de un solo uso, distribuidas por WhatsApp (link
-- compartido manualmente por el admin, sin envío automático de
-- email/WhatsApp). Reemplaza el flujo de invitación por email de
-- Supabase Auth para la creación de usuarios.
--
-- Se guarda sha256(token) en token_hash; el token crudo nunca se
-- persiste, solo vive en la URL que ve el admin/empleado.
-- ============================================================

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  user_id uuid not null references public.profiles (id),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Una sola invitación activa (ni usada ni revocada) por usuario a la vez.
-- "Reenviar" tiene que revocar la anterior antes de poder crear una nueva.
create unique index uq_invitations_active_per_user
  on public.invitations (user_id)
  where used_at is null and revoked_at is null;

create index idx_invitations_user_id on public.invitations (user_id);
create index idx_invitations_organization_id on public.invitations (organization_id);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.invitations enable row level security;

-- Solo ADMIN/SUPER_ADMIN leen/crean/revocan invitaciones de su organización.
-- La validación pública del token (visitante sin sesión) se hace server-side
-- con la service role key, fuera de RLS: el propio token (256 bits al azar,
-- hasheado) es la prueba de autorización para ese lookup puntual.
create policy invitations_select_admin on public.invitations
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy invitations_insert_admin on public.invitations
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy invitations_update_admin on public.invitations
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
