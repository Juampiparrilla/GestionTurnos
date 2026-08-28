import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateProductoSchema } from "@/lib/validations/producto";
import { calcularPrecioVenta } from "@/lib/productos/calcular-precio";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateProductoSchema.safeParse(body);
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
  const porMayor = calcularPrecioVenta({
    costo: d.costo,
    porcentaje: d.porcentajePorMayor,
    manual: d.manualPorMayor,
    precioManual: d.precioManualPorMayor,
  });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .update({
      nombre: d.nombre,
      marca_id: d.marcaId || null,
      categoria_id: d.categoriaId || null,
      proveedor_id: d.proveedorId || null,
      descripcion: d.descripcion || null,
      kg: d.kg,
      costo: d.costo,
      porcentaje_ganancia_cerrada: cerrada.porcentaje,
      precio_venta_cerrada: cerrada.precio,
      precio_manual_cerrada: d.manualCerrada,
      porcentaje_ganancia_abierta: abierta.porcentaje,
      precio_venta_abierta: abierta.precio,
      precio_manual_abierta: d.manualAbierta,
      porcentaje_ganancia_por_mayor: porMayor.porcentaje,
      precio_venta_por_mayor: porMayor.precio,
      precio_manual_por_mayor: d.manualPorMayor,
      oferta: d.oferta,
      ...(d.active !== undefined ? { active: d.active } : {}),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el cambio. Intentá de nuevo." }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, producto: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const supabase = await createClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo borrar el producto. Intentá de nuevo." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
