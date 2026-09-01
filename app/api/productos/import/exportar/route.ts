import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { IMPORT_COLUMNAS } from "@/lib/productos/importar-excel";
import type { Producto } from "@/types/producto";

export const runtime = "nodejs";

export async function GET() {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const supabase = await createClient();
  const [{ data: productos }, { data: marcas }, { data: categorias }, { data: proveedores }] = await Promise.all([
    supabase
      .from("productos")
      .select("*")
      .eq("organization_id", actor.organization_id)
      .eq("active", true)
      .order("nombre"),
    supabase.from("marcas").select("id, nombre").eq("organization_id", actor.organization_id),
    supabase.from("categorias").select("id, nombre").eq("organization_id", actor.organization_id),
    supabase.from("proveedores").select("id, nombre").eq("organization_id", actor.organization_id),
  ]);

  const marcaPorId = new Map((marcas ?? []).map((m) => [m.id as string, m.nombre as string]));
  const categoriaPorId = new Map((categorias ?? []).map((c) => [c.id as string, c.nombre as string]));
  const proveedorPorId = new Map((proveedores ?? []).map((p) => [p.id as string, p.nombre as string]));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Productos");
  sheet.columns = [...IMPORT_COLUMNAS];
  sheet.getRow(1).font = { bold: true };

  for (const p of (productos as Producto[] | null) ?? []) {
    sheet.addRow({
      id: p.id,
      nombre: p.nombre,
      kg: p.kg,
      unidadMedida: p.unidad_medida,
      marca: p.marca_id ? (marcaPorId.get(p.marca_id) ?? "") : "",
      categoria: p.categoria_id ? (categoriaPorId.get(p.categoria_id) ?? "") : "",
      proveedor: p.proveedor_id ? (proveedorPorId.get(p.proveedor_id) ?? "") : "",
      costo: p.costo,
      porcentajeCerrada: p.porcentaje_ganancia_cerrada,
      porcentajeAbierta: p.porcentaje_ganancia_abierta,
      porcentajePorMayor: p.porcentaje_ganancia_por_mayor,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="catalogo-productos.xlsx"',
    },
  });
}
