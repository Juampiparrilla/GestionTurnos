import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { MarcasList } from "@/components/productos/marcas/marcas-list";
import { MenuSecciones } from "@/components/productos/menu-secciones";
import type { Marca } from "@/types/marca";

export default async function MarcasPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: marcas } = await supabase.from("marcas").select("*").order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Marcas</h1>
        <MenuSecciones />
      </div>
      <MarcasList
        marcas={(marcas as Marca[] | null) ?? []}
        descripcion="Marcas de alimento (Belcan, Agility, etc.). Desplegá una para ver sus productos y reasignarlos a otra marca."
      />
    </div>
  );
}
