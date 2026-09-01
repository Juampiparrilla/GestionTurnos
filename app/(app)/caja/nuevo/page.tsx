import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MenuSecciones } from "@/components/caja/menu-secciones";
import { NuevoMovimientoForm } from "@/components/caja/nuevo/nuevo-movimiento-form";
import type { CajaEtiqueta } from "@/types/caja";
import type { Board } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

export default async function NuevoMovimientoPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";
  const supabase = await createClient();

  let boards: Board[] = [];
  if (isAdmin) {
    const { data } = await supabase.from("boards").select("*").eq("active", true).order("name");
    boards = (data as Board[] | null) ?? [];
  } else {
    const { data } = await supabase
      .from("board_members")
      .select("boards(*)")
      .eq("user_id", profile.id)
      .eq("active", true);
    boards = ((data ?? []) as unknown as { boards: Board }[])
      .map((m) => m.boards)
      .filter((b): b is Board => Boolean(b) && b.active);
  }

  const boardIds = boards.map((b) => b.id);

  const [{ data: etiquetas }, { data: shifts }] = await Promise.all([
    supabase.from("caja_etiquetas").select("*").eq("active", true).order("nombre"),
    boardIds.length > 0
      ? supabase.from("shift_configurations").select("*").in("board_id", boardIds).eq("active", true).order("sort_order")
      : Promise.resolve({ data: [] as ShiftConfiguration[] }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Nuevo movimiento</h1>
        <MenuSecciones isAdmin={isAdmin} />
      </div>
      {boards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No estás asignado a ningún local todavía. Pedile a un administrador que te agregue a un local en
          Horarios.
        </p>
      ) : (
        <NuevoMovimientoForm
          etiquetas={(etiquetas as CajaEtiqueta[] | null) ?? []}
          boards={boards}
          shifts={(shifts as ShiftConfiguration[] | null) ?? []}
        />
      )}
    </div>
  );
}
