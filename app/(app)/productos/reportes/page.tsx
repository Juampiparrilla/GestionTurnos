import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { ReportesView } from "@/components/productos/reportes/reportes-view";
import { VolverAProductosLink } from "@/components/productos/volver-a-productos-link";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";

export default async function ReportesPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: productos }, { data: marcas }, { data: categorias }, { data: proveedores }] = await Promise.all([
    supabase.from("productos").select("*").eq("active", true).order("nombre"),
    supabase.from("marcas").select("*").eq("active", true).order("nombre"),
    supabase.from("categorias").select("*").eq("active", true).order("nombre"),
    supabase.from("proveedores").select("*").eq("active", true).order("nombre"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Reportes</h1>
        <VolverAProductosLink />
      </div>
      <ReportesView
        productos={(productos as Producto[] | null) ?? []}
        marcas={(marcas as Marca[] | null) ?? []}
        categorias={(categorias as Categoria[] | null) ?? []}
        proveedores={(proveedores as Proveedor[] | null) ?? []}
        descripcion="Buscá productos por categoría, proveedor, marca, oferta o precio y generá un PDF con el resultado."
      />
    </div>
  );
}
