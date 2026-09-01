import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { MenuSecciones } from "@/components/caja/menu-secciones";
import { DeudasList } from "@/components/caja/deudas/deudas-list";
import type { CajaDeuda } from "@/types/caja";

export default async function CajaDeudasPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/caja");
  }

  const supabase = await createClient();
  const { data: deudas } = await supabase
    .from("caja_deudas")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Deudas</h1>
        <MenuSecciones isAdmin />
      </div>
      <DeudasList deudas={(deudas as CajaDeuda[] | null) ?? []} />
    </div>
  );
}
