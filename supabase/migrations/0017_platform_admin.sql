-- ============================================================
-- 0017_platform_admin.sql
-- Fase 4 V1: Administrador de Plataforma.
--
-- Diseño elegido: tabla platform_admins SEPARADA de profiles, en vez
-- de volver nullable profiles.organization_id. Un platform admin no
-- pertenece a ninguna organización, y profiles.organization_id es
-- NOT NULL con RLS en 9 tablas que asumen que ese valor siempre
-- existe — tocar eso sería el cambio de mayor riesgo de todo este
-- proyecto. Con una tabla separada, CERO políticas RLS existentes se
-- modifican: el platform admin accede exclusivamente a través de
-- funciones puntuales (security definer) que él mismo valida por
-- adentro, nunca por acceso directo a profiles/boards/turnos/etc.
-- Así se cumple también "no darle acceso operativo innecesario a
-- los turnos de todas las empresas".
-- ============================================================

create table public.platform_admins (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.platform_admins (id)
);

alter table public.platform_admins enable row level security;

-- Cada platform admin solo puede leer su propia fila (para que la
-- app sepa "quién soy"). No hay policy de insert/update: se
-- gestionan por script/servicio, fuera de RLS.
create policy platform_admins_select_self on public.platform_admins
  for select using (id = auth.uid());

grant select on public.platform_admins to supabase_auth_admin;

alter table public.organizations
  add column created_by uuid references public.platform_admins (id);

-- ------------------------------------------------------------
-- is_platform_admin(): lee el claim del JWT, mismo patrón que
-- app_role/organization_id que ya usa toda la app.
-- ------------------------------------------------------------

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'platform_admin')::boolean, false);
$$;

-- ------------------------------------------------------------
-- Custom Access Token Hook: se agrega el claim "platform_admin" sin
-- tocar la lógica existente de organization_id/app_role/active.
-- ------------------------------------------------------------

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb;
  profile record;
  v_platform_admin_active boolean;
begin
  select organization_id, role, active
  into profile
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  claims := coalesce(event -> 'claims', '{}'::jsonb);

  if profile is null then
    claims := jsonb_set(claims, '{organization_id}', 'null');
    claims := jsonb_set(claims, '{app_role}', 'null');
    claims := jsonb_set(claims, '{active}', 'false');
  else
    claims := jsonb_set(claims, '{organization_id}', to_jsonb(profile.organization_id::text));
    claims := jsonb_set(claims, '{app_role}', to_jsonb(profile.role::text));
    claims := jsonb_set(claims, '{active}', to_jsonb(profile.active));
  end if;

  select active into v_platform_admin_active
  from public.platform_admins
  where id = (event ->> 'user_id')::uuid;

  claims := jsonb_set(claims, '{platform_admin}', to_jsonb(coalesce(v_platform_admin_active, false)));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- ------------------------------------------------------------
-- create_organization_with_super_admin(): atómica para la parte de
-- base de datos (organization + profile + invitation en una sola
-- transacción — si cualquiera falla, las tres se revierten solas).
--
-- El usuario de Supabase Auth se crea ANTES, desde el Route Handler
-- (requiere la Admin API, no se puede hacer desde SQL puro). Si esta
-- función falla, el Route Handler borra ese usuario de Auth como
-- compensación — mismo patrón que ya usa POST /api/users.
--
-- El token de invitación se genera en JS (igual que el resto de la
-- app): acá solo entra su hash, nunca el token crudo.
-- ------------------------------------------------------------

create or replace function public.create_organization_with_super_admin(
  p_org_name text,
  p_base_slug text,
  p_super_admin_id uuid,
  p_full_name text,
  p_username text,
  p_dni text,
  p_email text,
  p_invitation_token_hash text,
  p_invitation_expires_at timestamptz
)
returns table (organization_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_slug text;
  v_suffix int := 0;
  v_actor_active boolean;
begin
  select active into v_actor_active from public.platform_admins where id = auth.uid();
  if v_actor_active is distinct from true then
    raise exception 'No autorizado';
  end if;

  v_slug := p_base_slug;
  while exists (select 1 from public.organizations where slug = v_slug) loop
    v_suffix := v_suffix + 1;
    v_slug := p_base_slug || '-' || v_suffix;
  end loop;

  insert into public.organizations (name, slug, created_by)
  values (p_org_name, v_slug, auth.uid())
  returning id into v_org_id;

  insert into public.profiles (
    id, organization_id, username, full_name, dni, email, role, active
  ) values (
    p_super_admin_id, v_org_id, p_username, p_full_name, p_dni, p_email, 'SUPER_ADMIN', true
  );

  insert into public.invitations (
    organization_id, user_id, kind, token_hash, expires_at
  ) values (
    v_org_id, p_super_admin_id, 'ACTIVATION', p_invitation_token_hash, p_invitation_expires_at
  );

  return query select v_org_id;
end;
$$;

revoke all on function public.create_organization_with_super_admin(
  text, text, uuid, text, text, text, text, text, timestamptz
) from public;
grant execute on function public.create_organization_with_super_admin(
  text, text, uuid, text, text, text, text, text, timestamptz
) to authenticated;

-- ------------------------------------------------------------
-- list_organizations_for_platform_admin()
-- ------------------------------------------------------------

create or replace function public.list_organizations_for_platform_admin()
returns table (
  id uuid,
  name text,
  slug text,
  active boolean,
  created_at timestamptz,
  super_admin_name text,
  user_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    o.id,
    o.name,
    o.slug,
    o.active,
    o.created_at,
    (
      select p.full_name from public.profiles p
      where p.organization_id = o.id and p.role = 'SUPER_ADMIN'
      order by p.created_at asc limit 1
    ) as super_admin_name,
    (select count(*) from public.profiles p where p.organization_id = o.id) as user_count
  from public.organizations o
  order by o.created_at desc;
end;
$$;

revoke all on function public.list_organizations_for_platform_admin() from public;
grant execute on function public.list_organizations_for_platform_admin() to authenticated;

-- ------------------------------------------------------------
-- get_organization_detail_for_platform_admin()
-- ------------------------------------------------------------

create or replace function public.get_organization_detail_for_platform_admin(p_organization_id uuid)
returns table (
  id uuid,
  name text,
  slug text,
  active boolean,
  created_at timestamptz,
  super_admin_id uuid,
  super_admin_name text,
  super_admin_email text,
  admin_count bigint,
  employee_count bigint,
  invitation_used_at timestamptz,
  invitation_revoked_at timestamptz,
  invitation_expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_super_admin_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'No autorizado';
  end if;

  select p.id into v_super_admin_id
  from public.profiles p
  where p.organization_id = p_organization_id and p.role = 'SUPER_ADMIN'
  order by p.created_at asc
  limit 1;

  return query
  select
    o.id, o.name, o.slug, o.active, o.created_at,
    v_super_admin_id,
    sa.full_name,
    sa.email,
    (select count(*) from public.profiles p where p.organization_id = o.id and p.role = 'ADMIN'),
    (select count(*) from public.profiles p where p.organization_id = o.id and p.role = 'EMPLEADO'),
    inv.used_at,
    inv.revoked_at,
    inv.expires_at
  from public.organizations o
  left join public.profiles sa on sa.id = v_super_admin_id
  left join lateral (
    select i.used_at, i.revoked_at, i.expires_at
    from public.invitations i
    where i.user_id = v_super_admin_id and i.kind = 'ACTIVATION'
    order by i.created_at desc
    limit 1
  ) inv on true
  where o.id = p_organization_id;
end;
$$;

revoke all on function public.get_organization_detail_for_platform_admin(uuid) from public;
grant execute on function public.get_organization_detail_for_platform_admin(uuid) to authenticated;

-- ------------------------------------------------------------
-- toggle_organization_active()
-- ------------------------------------------------------------

create or replace function public.toggle_organization_active(p_organization_id uuid, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_active boolean;
begin
  select active into v_actor_active from public.platform_admins where id = auth.uid();
  if v_actor_active is distinct from true then
    raise exception 'No autorizado';
  end if;

  update public.organizations set active = p_active where id = p_organization_id;
end;
$$;

revoke all on function public.toggle_organization_active(uuid, boolean) from public;
grant execute on function public.toggle_organization_active(uuid, boolean) to authenticated;

-- ------------------------------------------------------------
-- resend_super_admin_invitation(): reenvía (revoca la anterior y
-- crea una nueva) la invitación de activación del Super Admin
-- inicial de una organización. Mismo patrón que
-- POST /api/users/[id]/invitations, pero autorizado para platform
-- admin en vez de para un admin de la organización.
-- ------------------------------------------------------------

create or replace function public.resend_super_admin_invitation(
  p_organization_id uuid,
  p_invitation_token_hash text,
  p_invitation_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_active boolean;
  v_super_admin_id uuid;
begin
  select active into v_actor_active from public.platform_admins where id = auth.uid();
  if v_actor_active is distinct from true then
    raise exception 'No autorizado';
  end if;

  select p.id into v_super_admin_id
  from public.profiles p
  where p.organization_id = p_organization_id and p.role = 'SUPER_ADMIN'
  order by p.created_at asc
  limit 1;

  if v_super_admin_id is null then
    raise exception 'No se encontró el Super Administrador de esta organización.';
  end if;

  if exists (
    select 1 from public.invitations
    where user_id = v_super_admin_id and kind = 'ACTIVATION' and used_at is not null
  ) then
    raise exception 'Este Super Administrador ya activó su cuenta.';
  end if;

  update public.invitations
  set revoked_at = now()
  where user_id = v_super_admin_id
    and kind = 'ACTIVATION'
    and used_at is null
    and revoked_at is null;

  insert into public.invitations (organization_id, user_id, kind, token_hash, expires_at)
  values (p_organization_id, v_super_admin_id, 'ACTIVATION', p_invitation_token_hash, p_invitation_expires_at);
end;
$$;

revoke all on function public.resend_super_admin_invitation(uuid, text, timestamptz) from public;
grant execute on function public.resend_super_admin_invitation(uuid, text, timestamptz) to authenticated;
