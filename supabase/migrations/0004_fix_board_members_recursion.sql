-- ============================================================
-- 0004_fix_board_members_recursion.sql
-- Corrige recursión infinita: la policy board_members_select_board_peers
-- consultaba board_members desde una policy de board_members, y
-- boards_select_member también disparaba esa misma evaluación.
-- Se reemplazan ambas por una función security definer, que bypassea
-- RLS internamente y corta la recursión.
-- ============================================================

create or replace function public.is_active_board_member(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.board_members bm
    where bm.board_id = p_board_id
      and bm.user_id = auth.uid()
      and bm.active = true
  );
$$;

revoke all on function public.is_active_board_member(uuid) from public;
grant execute on function public.is_active_board_member(uuid) to authenticated;

drop policy if exists board_members_select_board_peers on public.board_members;
create policy board_members_select_board_peers on public.board_members
  for select using (public.is_active_board_member(board_members.board_id));

drop policy if exists boards_select_member on public.boards;
create policy boards_select_member on public.boards
  for select using (
    active = true and public.is_active_board_member(boards.id)
  );
