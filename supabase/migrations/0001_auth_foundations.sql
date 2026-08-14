-- ============================================================
-- 0001_auth_foundations.sql
-- Organizaciones, perfiles, roles, RLS y custom access token hook.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------------
-- Tipos
-- ------------------------------------------------------------

create type public.user_role as enum ('SUPER_ADMIN', 'ADMIN', 'EMPLEADO');

-- ------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  username text not null,
  full_name text not null,
  dni text not null,
  email text not null,
  role public.user_role not null default 'EMPLEADO',
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,

  constraint profiles_org_dni_unique unique (organization_id, dni),
  constraint profiles_org_email_unique unique (organization_id, email),
  constraint profiles_org_username_unique unique (organization_id, username)
);

create index idx_profiles_organization_id on public.profiles (organization_id);

-- ------------------------------------------------------------
-- updated_at automático
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Reglas de cambio de rol (defensa en profundidad a nivel DB):
-- - nadie puede modificar su propio rol
-- - solo un SUPER_ADMIN puede asignar el rol SUPER_ADMIN
-- - el service role (scripts administrativos, auth.uid() es null) no está sujeto a esto
-- ------------------------------------------------------------

create or replace function public.enforce_role_change_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.user_role;
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.role is distinct from old.role then
    if auth.uid() = old.id then
      raise exception 'No podés modificar tu propio rol.';
    end if;

    select role into actor_role from public.profiles where id = auth.uid();

    if new.role = 'SUPER_ADMIN' and actor_role is distinct from 'SUPER_ADMIN' then
      raise exception 'Solo un SUPER_ADMIN puede asignar el rol SUPER_ADMIN.';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_enforce_role_change
  before update on public.profiles
  for each row execute function public.enforce_role_change_rules();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;

-- Organizations: solo se ve la propia organización (según el JWT)
create policy organizations_select_own on public.organizations
  for select using (id = (auth.jwt() ->> 'organization_id')::uuid);

-- Profiles: cada usuario siempre puede ver su propia fila (sin depender del
-- JWT, evita recursión de RLS y sirve para leer datos siempre frescos)
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());

-- Profiles: además, se ven los perfiles de la misma organización (vía JWT)
create policy profiles_select_same_org on public.profiles
  for select using (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Solo ADMIN/SUPER_ADMIN puede crear o modificar perfiles de su organización
create policy profiles_insert_admin on public.profiles
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy profiles_update_admin on public.profiles
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- ------------------------------------------------------------
-- Custom Access Token Hook
-- Agrega organization_id, app_role y active al JWT para que las policies
-- de las demás tablas puedan filtrar por tenant sin re-consultar profiles.
--
-- IMPORTANTE: el claim se llama "app_role", NUNCA "role" a secas.
-- "role" es un claim reservado que usa PostgREST/Supabase para decidir a
-- qué rol de Postgres cambiar (normalmente "authenticated"). Sobrescribirlo
-- con nuestro rol de negocio (ej. "SUPER_ADMIN") rompe todas las queries,
-- porque Postgres intenta hacer SET ROLE "SUPER_ADMIN", que no existe.
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

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant select on public.profiles to supabase_auth_admin;

revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
