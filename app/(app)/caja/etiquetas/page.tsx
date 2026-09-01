import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { MenuSecciones } from "@/components/caja/menu-secciones";
import { EtiquetasList } from "@/components/caja/etiquetas/etiquetas-list";
import type { CajaEtiqueta } from "@/types/caja";

export default async function CajaEtiquetasPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/caja");
  }

  const supabase = await createClient();
  const [{ data: etiquetas }, { data: movimientos }] = await Promise.all([
    supabase.from("caja_etiquetas").select("*").order("nombre"),
    supabase.from("caja_movimientos").select("etiqueta_id"),
  ]);

  const etiquetasEnUso = new Set((movimientos ?? []).map((m) => m.etiqueta_id as string));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Etiquetas de Caja</h1>
        <MenuSecciones isAdmin />
      </div>
      <EtiquetasList etiquetas={(etiquetas as CajaEtiqueta[] | null) ?? []} etiquetasEnUso={etiquetasEnUso} />
    </div>
  );
}
