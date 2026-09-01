import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { ProveedoresList } from "@/components/productos/proveedores/proveedores-list";
import { VolverAProductosLink } from "@/components/productos/volver-a-productos-link";
import type { Proveedor } from "@/types/proveedor";

export default async function ProveedoresPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: proveedores } = await supabase.from("proveedores").select("*").order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Proveedores</h1>
        <VolverAProductosLink />
      </div>
      <ProveedoresList
        proveedores={(proveedores as Proveedor[] | null) ?? []}
        descripcion="Distribuidores a los que se les compra. Ajustá el % de ganancia de todos sus productos, o desplegá uno para ver sus productos y reasignarlos a otro proveedor."
      />
    </div>
  );
}
