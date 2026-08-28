import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { createProductoSchema } from "@/lib/validations/producto";
import { calcularPrecioVenta } from "@/lib/productos/calcular-precio";
import { generarCodigoBase, generarCodigoConSufijo } from "@/lib/productos/generar-codigo";

export const runtime = "nodejs";

const MAX_INTENTOS_CODIGO = 20;

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProductoSchema.safeParse(body);
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
  const codigoBase = generarCodigoBase(d.nombre);

  for (let intento = 0; intento < MAX_INTENTOS_CODIGO; intento++) {
    const { data, error } = await supabase
      .from("productos")
      .insert({
        organization_id: actor.organization_id,
        nombre: d.nombre,
        codigo: generarCodigoConSufijo(codigoBase, intento),
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
        created_by: actor.id,
      })
      .select()
      .single();

    if (!error) {
      return NextResponse.json({ ok: true, producto: data });
    }
    if (error.code !== "23505") {
      return NextResponse.json({ error: "No se pudo crear el producto. Intentá de nuevo." }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "No se pudo generar un código único. Intentá de nuevo." }, { status: 400 });
}
