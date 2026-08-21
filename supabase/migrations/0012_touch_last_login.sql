-- ============================================================
-- 0012_touch_last_login.sql
-- La columna profiles.last_login_at existe desde la migración
-- inicial pero nunca se escribía: no había policy de UPDATE que
-- permitiera a un usuario tocar su propia fila (solo ADMIN/SUPER_ADMIN
-- pueden hacer UPDATE de profiles), y nada llamaba a actualizarla.
--
-- En vez de abrir una policy de self-update genérica (que expondría
-- toda la fila a edición propia), se agrega una función acotada:
-- solo permite tocar last_login_at de la propia fila.
-- ============================================================

create or replace function public.touch_last_login()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set last_login_at = now() where id = auth.uid();
end;
$$;

revoke all on function public.touch_last_login() from public;
grant execute on function public.touch_last_login() to authenticated;
