-- ============================================================
-- 0003_boards.sql
-- Tableros (locales) y su membresía.
-- ============================================================

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  name text not null,
  description text,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_boards_organization_id on public.boards (organization_id);

create trigger boards_set_updated_at
  before update on public.boards
  for each row execute function public.set_updated_at();

create table public.board_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_id uuid not null references public.boards (id),
  user_id uuid not null references public.profiles (id),
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),

  constraint board_members_unique unique (board_id, user_id)
);

create index idx_board_members_board_id on public.board_members (board_id);
create index idx_board_members_user_id on public.board_members (user_id);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.boards enable row level security;
alter table public.board_members enable row level security;

-- Boards: ADMIN/SUPER_ADMIN ven todos los tableros de su organización
create policy boards_select_admin on public.boards
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- Boards: cualquier usuario ve los tableros activos donde es miembro activo
create policy boards_select_member on public.boards
  for select using (
    active = true
    and exists (
      select 1 from public.board_members bm
      where bm.board_id = boards.id
        and bm.user_id = auth.uid()
        and bm.active = true
    )
  );

create policy boards_insert_admin on public.boards
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy boards_update_admin on public.boards
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- board_members: ADMIN/SUPER_ADMIN ven y gestionan los de su organización
create policy board_members_select_admin on public.board_members
  for select using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

-- board_members: un usuario ve sus propias membresías (para saber a qué tableros pertenece)
create policy board_members_select_self on public.board_members
  for select using (user_id = auth.uid());

-- board_members: un usuario ve a sus compañeros en los tableros donde es miembro activo
create policy board_members_select_board_peers on public.board_members
  for select using (
    exists (
      select 1 from public.board_members bm2
      where bm2.board_id = board_members.board_id
        and bm2.user_id = auth.uid()
        and bm2.active = true
    )
  );

create policy board_members_insert_admin on public.board_members
  for insert with check (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );

create policy board_members_update_admin on public.board_members
  for update using (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    and (auth.jwt() ->> 'app_role') in ('ADMIN', 'SUPER_ADMIN')
  );
