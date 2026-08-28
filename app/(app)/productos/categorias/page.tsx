import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { CategoriasList } from "@/components/productos/categorias/categorias-list";
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
      <div>
        <h1 className="text-xl font-semibold">Categorías</h1>
        <p className="text-sm text-muted-foreground">Clasificación de productos (alimento perro, gato, etc.).</p>
      </div>
      <CategoriasList categorias={(categorias as Categoria[] | null) ?? []} />
    </div>
  );
}
