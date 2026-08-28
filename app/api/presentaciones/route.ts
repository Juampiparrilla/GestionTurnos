import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { createPresentacionSchema } from "@/lib/validations/producto";
import { calcularPrecioVenta } from "@/lib/productos/calcular-precio";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPresentacionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const cerrada = calcularPrecioVenta({
    costo: d.costo,
    porcentaje: d.porcentajeCerrada,
    manual: d.manualCerrada,
    precioManual: d.precioManualCerrada,
  });
  const abierta = calcularPrecioVenta({
    costo: d.costo,
    porcentaje: d.porcentajeAbierta,
    manual: d.manualAbierta,
    precioManual: d.precioManualAbierta,
  });

  const supabase = await createClient();
  const { data: producto } = await supabase
    .from("productos")
    .select("organization_id")
    .eq("id", d.productoId)
    .maybeSingle();

  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("presentaciones")
    .insert({
      organization_id: producto.organization_id,
      producto_id: d.productoId,
      kg: d.kg,
      sku: d.sku || null,
      costo: d.costo,
      porcentaje_ganancia_cerrada: cerrada.porcentaje,
      precio_venta_cerrada: cerrada.precio,
      precio_manual_cerrada: d.manualCerrada,
      porcentaje_ganancia_abierta: abierta.porcentaje,
      precio_venta_abierta: abierta.precio,
      precio_manual_abierta: d.manualAbierta,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear la presentación. Intentá de nuevo." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
