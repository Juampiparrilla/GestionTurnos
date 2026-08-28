import type { createClient } from "@/lib/supabase/server";
import { generarCodigoBase, generarCodigoConSufijo } from "./generar-codigo";

const MAX_INTENTOS_CODIGO = 20;

export type NuevoProducto = {
  organization_id: string;
  nombre: string;
  marca_id: string | null;
  categoria_id: string | null;
  proveedor_id: string | null;
  descripcion: string | null;
  kg: number;
  costo: number;
  porcentaje_ganancia_cerrada: number;
  precio_venta_cerrada: number;
  precio_manual_cerrada: boolean;
  porcentaje_ganancia_abierta: number;
  precio_venta_abierta: number;
  precio_manual_abierta: boolean;
  porcentaje_ganancia_por_mayor: number;
  precio_venta_por_mayor: number;
  precio_manual_por_mayor: boolean;
  oferta: boolean;
  created_by: string;
};

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Reintenta el insert con distintos sufijos de código si choca con uno ya
// existente (índice único por organización) -- usado tanto por la creación
// manual de un producto como por la importación masiva desde Excel, fila
// por fila, para no duplicar este loop en los dos lugares.
export async function insertarProducto(
  supabase: Supabase,
  producto: NuevoProducto,
): Promise<{ ok: true; producto: Record<string, unknown> } | { ok: false; motivo: "codigo" | "otro" }> {
  const codigoBase = generarCodigoBase(producto.nombre);

  for (let intento = 0; intento < MAX_INTENTOS_CODIGO; intento++) {
    const { data, error } = await supabase
      .from("productos")
      .insert({ ...producto, codigo: generarCodigoConSufijo(codigoBase, intento) })
      .select()
      .single();

    if (!error) {
      return { ok: true, producto: data };
    }
    if (error.code !== "23505") {
      return { ok: false, motivo: "otro" };
    }
  }

  return { ok: false, motivo: "codigo" };
}
