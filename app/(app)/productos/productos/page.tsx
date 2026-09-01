import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { ProductosList } from "@/components/productos/productos/productos-list";
import { MenuSecciones } from "@/components/productos/menu-secciones";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";

export default async function ProductosPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: productos }, { data: marcas }, { data: categorias }, { data: proveedores }] = await Promise.all([
    supabase.from("productos").select("*").order("nombre"),
    supabase.from("marcas").select("*").eq("active", true).order("nombre"),
    supabase.from("categorias").select("*").eq("active", true).order("nombre"),
    supabase.from("proveedores").select("*").eq("active", true).order("nombre"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Productos</h1>
        <MenuSecciones />
      </div>
      <ProductosList
        productos={(productos as Producto[] | null) ?? []}
        marcas={(marcas as Marca[] | null) ?? []}
        categorias={(categorias as Categoria[] | null) ?? []}
        proveedores={(proveedores as Proveedor[] | null) ?? []}
        descripcion="Catálogo con costos, precios y presentaciones."
      />
    </div>
  );
}
