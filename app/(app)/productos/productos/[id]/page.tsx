import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { ProductoDetail } from "@/components/productos/productos/producto-detail";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto, Presentacion } from "@/types/producto";

export default async function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/");
  }

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: producto }, { data: marcas }, { data: categorias }, { data: proveedores }, { data: presentaciones }] =
    await Promise.all([
      supabase.from("productos").select("*").eq("id", id).maybeSingle(),
      supabase.from("marcas").select("*").eq("active", true).order("nombre"),
      supabase.from("categorias").select("*").eq("active", true).order("nombre"),
      supabase.from("proveedores").select("*").eq("active", true).order("nombre"),
      supabase.from("presentaciones").select("*").eq("producto_id", id).order("kg"),
    ]);

  if (!producto) {
    notFound();
  }

  return (
    <ProductoDetail
      producto={producto as Producto}
      presentaciones={(presentaciones as Presentacion[] | null) ?? []}
      marcas={(marcas as Marca[] | null) ?? []}
      categorias={(categorias as Categoria[] | null) ?? []}
      proveedores={(proveedores as Proveedor[] | null) ?? []}
    />
  );
}
