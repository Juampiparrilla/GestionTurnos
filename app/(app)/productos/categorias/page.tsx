import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { CategoriasList } from "@/components/productos/categorias/categorias-list";
import { VolverAProductosLink } from "@/components/productos/volver-a-productos-link";
import type { Categoria } from "@/types/categoria";

export default async function CategoriasPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: categorias } = await supabase.from("categorias").select("*").order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Categorías</h1>
        <VolverAProductosLink />
      </div>
      <CategoriasList
        categorias={(categorias as Categoria[] | null) ?? []}
        descripcion="Clasificación de productos (alimento perro, gato, etc.). Desplegá una para ver sus productos y reasignarlos a otra categoría."
      />
    </div>
  );
}
