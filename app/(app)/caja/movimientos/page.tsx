import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MenuSecciones } from "@/components/caja/menu-secciones";
import { MovimientosView } from "@/components/caja/movimientos/movimientos-view";
import type { CajaEtiqueta } from "@/types/caja";
import type { Board, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

export default async function CajaMovimientosPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";
  const supabase = await createClient();

  let boards: Board[] = [];
  if (isAdmin) {
    const { data } = await supabase.from("boards").select("*").order("name");
    boards = (data as Board[] | null) ?? [];
  } else {
    const { data } = await supabase
      .from("board_members")
      .select("boards(*)")
      .eq("user_id", profile.id)
      .eq("active", true);
    boards = ((data ?? []) as unknown as { boards: Board }[]).map((m) => m.boards).filter(Boolean);
  }

  const boardIds = boards.map((b) => b.id);

  const [{ data: etiquetas }, { data: shifts }, { data: directory }] = await Promise.all([
    supabase.from("caja_etiquetas").select("*").order("nombre"),
    boardIds.length > 0
      ? supabase.from("shift_configurations").select("*").in("board_id", boardIds).order("sort_order")
      : Promise.resolve({ data: [] as ShiftConfiguration[] }),
    supabase.rpc("list_org_profiles_directory"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Movimientos de Caja</h1>
        <MenuSecciones isAdmin={isAdmin} />
      </div>
      <MovimientosView
        boards={boards}
        etiquetas={(etiquetas as CajaEtiqueta[] | null) ?? []}
        shifts={(shifts as ShiftConfiguration[] | null) ?? []}
        directory={(directory as OrgDirectoryEntry[] | null) ?? []}
        isAdmin={isAdmin}
      />
    </div>
  );
}
