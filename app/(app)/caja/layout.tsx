import type { ReactNode } from "react";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SectionTabs } from "@/components/section-tabs";
import { NuevoMovimientoFab } from "@/components/caja/nuevo/nuevo-movimiento-fab";
import type { CajaEtiqueta } from "@/types/caja";
import type { Board } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

export default async function CajaLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  // Datos del botón flotante "Nuevo movimiento" (celular): mismos locales que
  // ve cada rol en la pantalla de Movimientos.
  let boards: Board[] = [];
  let etiquetas: CajaEtiqueta[] = [];
  let shifts: ShiftConfiguration[] = [];

  if (profile) {
    const supabase = await createClient();

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

    if (boards.length > 0) {
      const boardIds = boards.map((b) => b.id);
      const [{ data: etiquetasData }, { data: shiftsData }] = await Promise.all([
        supabase.from("caja_etiquetas").select("*").order("nombre"),
        supabase.from("shift_configurations").select("*").in("board_id", boardIds).order("sort_order"),
      ]);
      etiquetas = (etiquetasData as CajaEtiqueta[] | null) ?? [];
      shifts = (shiftsData as ShiftConfiguration[] | null) ?? [];
    }
  }

  return (
    <div className="space-y-4 max-md:pb-16">
      <SectionTabs
        label="Secciones de Caja"
        tabs={[
          { href: "/caja", label: "Resumen", exact: true },
          { href: "/caja/movimientos", label: "Movimientos" },
          ...(isAdmin
            ? [
                { href: "/caja/etiquetas", label: "Etiquetas" },
                { href: "/caja/deudas", label: "Deudas" },
              ]
            : []),
        ]}
      />
      {children}
      {boards.length > 0 && <NuevoMovimientoFab boards={boards} etiquetas={etiquetas} shifts={shifts} />}
    </div>
  );
}
