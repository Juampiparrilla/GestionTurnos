import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { ProductosList } from "@/components/productos/productos/productos-list";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";

export default async function ProductosPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: productos }, { data: categorias }, { data: proveedores }, { data: marcasRows }] =
    await Promise.all([
      supabase.from("productos").select("*").order("nombre"),
      supabase.from("categorias").select("*").eq("active", true).order("nombre"),
      supabase.from("proveedores").select("*").eq("active", true).order("nombre"),
      supabase.from("productos").select("marca").not("marca", "is", null),
    ]);

  const marcas = [...new Set((marcasRows ?? []).map((row) => row.marca as string))].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Productos</h1>
        <p className="text-sm text-muted-foreground">Catálogo con costos, precios y presentaciones.</p>
      </div>
      <ProductosList
        productos={(productos as Producto[] | null) ?? []}
        categorias={(categorias as Categoria[] | null) ?? []}
        proveedores={(proveedores as Proveedor[] | null) ?? []}
        marcas={marcas}
      />
    </div>
  );
}
