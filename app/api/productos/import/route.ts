import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { importProductoRowSchema } from "@/lib/validations/producto";
import { calcularPrecioVenta } from "@/lib/productos/calcular-precio";
import { insertarProducto } from "@/lib/productos/insertar-producto";
import { IMPORT_COLUMNAS, type ImportColumnaKey } from "@/lib/productos/importar-excel";

export const runtime = "nodejs";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type Tabla = "marcas" | "categorias" | "proveedores";

async function resolverEntidad(
  supabase: Supabase,
  cache: Map<string, string>,
  tabla: Tabla,
  nombre: string,
  organizationId: string,
  actorId: string,
): Promise<string> {
  const clave = nombre.toLowerCase();
  const existente = cache.get(clave);
  if (existente) return existente;

  const { data, error } = await supabase
    .from(tabla)
    .insert({ organization_id: organizationId, nombre, created_by: actorId })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo crear "${nombre}".`);
  }

  cache.set(clave, data.id);
  return data.id;
}

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Subí un archivo .xlsx." }, { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  try {
    // exceljs declara su propio tipo ambient `Buffer` (choca con el de
    // @types/node en TS recientes) -- el cast es solo para el checker, en
    // runtime es un Buffer de Node normal.
    await workbook.xlsx.load(Buffer.from(await file.arrayBuffer()) as never);
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo. ¿Es un .xlsx válido?" }, { status: 400 });
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return NextResponse.json({ error: "El archivo no tiene ninguna hoja." }, { status: 400 });
  }

  // Mapea nombre de columna -> índice, en vez de asumir el orden -- así un
  // reordenado accidental de columnas no rompe todo en silencio.
  const headerRow = sheet.getRow(1);
  const columnaPorClave = new Map<ImportColumnaKey, number>();
  headerRow.eachCell((cell, colNumber) => {
    const texto = String(cell.value ?? "").trim();
    const columna = IMPORT_COLUMNAS.find((c) => c.header.toLowerCase() === texto.toLowerCase());
    if (columna) columnaPorClave.set(columna.key, colNumber);
  });

  const faltantes = IMPORT_COLUMNAS.filter((c) => !columnaPorClave.has(c.key));
  if (faltantes.length > 0) {
    return NextResponse.json(
      { error: `Faltan columnas en la planilla: ${faltantes.map((c) => c.header).join(", ")}.` },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const [marcas, categorias, proveedores] = await Promise.all([
    supabase.from("marcas").select("id, nombre").eq("organization_id", actor.organization_id),
    supabase.from("categorias").select("id, nombre").eq("organization_id", actor.organization_id),
    supabase.from("proveedores").select("id, nombre").eq("organization_id", actor.organization_id),
  ]);

  const marcaCache = new Map((marcas.data ?? []).map((m) => [m.nombre.toLowerCase(), m.id as string]));
  const categoriaCache = new Map((categorias.data ?? []).map((c) => [c.nombre.toLowerCase(), c.id as string]));
  const proveedorCache = new Map((proveedores.data ?? []).map((p) => [p.nombre.toLowerCase(), p.id as string]));

  function celda(row: ExcelJS.Row, key: ImportColumnaKey): string {
    const value = row.getCell(columnaPorClave.get(key)!).value;
    if (value === null || value === undefined) return "";
    if (typeof value === "object" && "text" in value) return String(value.text ?? "").trim();
    return String(value).trim();
  }

  function celdaNumero(row: ExcelJS.Row, key: ImportColumnaKey): number {
    const texto = celda(row, key);
    if (!texto) return 0;
    const valor = Number(texto.replace(",", "."));
    return Number.isFinite(valor) ? valor : NaN;
  }

  let creados = 0;
  let actualizados = 0;
  const errores: { fila: number; mensaje: string }[] = [];

  for (let numeroFila = 2; numeroFila <= sheet.rowCount; numeroFila++) {
    const row = sheet.getRow(numeroFila);
    const nombre = celda(row, "nombre");
    if (!nombre && row.actualCellCount === 0) continue; // fila vacía al final de la planilla

    const crudo = {
      id: celda(row, "id"),
      nombre: nombre.toUpperCase(),
      kg: celdaNumero(row, "kg"),
      unidadMedida: celda(row, "unidadMedida").toLowerCase() || "kg",
      marca: celda(row, "marca").toUpperCase(),
      categoria: celda(row, "categoria").toUpperCase(),
      proveedor: celda(row, "proveedor").toUpperCase(),
      costo: celdaNumero(row, "costo"),
      porcentajeCerrada: celdaNumero(row, "porcentajeCerrada"),
      porcentajeAbierta: celdaNumero(row, "porcentajeAbierta"),
      porcentajePorMayor: celdaNumero(row, "porcentajePorMayor"),
    };

    const parsed = importProductoRowSchema.safeParse(crudo);
    if (!parsed.success) {
      errores.push({ fila: numeroFila, mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." });
      continue;
    }

    const d = parsed.data;
    try {
      const [marcaId, categoriaId, proveedorId] = await Promise.all([
        resolverEntidad(supabase, marcaCache, "marcas", d.marca, actor.organization_id, actor.id),
        resolverEntidad(supabase, categoriaCache, "categorias", d.categoria, actor.organization_id, actor.id),
        resolverEntidad(supabase, proveedorCache, "proveedores", d.proveedor, actor.organization_id, actor.id),
      ]);

      const cerrada = calcularPrecioVenta({ costo: d.costo, porcentaje: d.porcentajeCerrada, manual: false, precioManual: 0 });
      const abierta =
        d.unidadMedida === "kg"
          ? calcularPrecioVenta({ costo: d.costo, porcentaje: d.porcentajeAbierta, manual: false, precioManual: 0 })
          : { precio: 0, porcentaje: 0 };
      const porMayor = calcularPrecioVenta({ costo: d.costo, porcentaje: d.porcentajePorMayor, manual: false, precioManual: 0 });

      if (d.id) {
        // Fila con ID -- actualiza ese producto puntual en vez de crear
        // uno nuevo. No toca `codigo` (tampoco lo hace la edición manual),
        // ni oferta/descripción/precio manual -- fuera del alcance del
        // Excel, igual que en el alta.
        const { data: existente } = await supabase
          .from("productos")
          .select("id")
          .eq("id", d.id)
          .eq("organization_id", actor.organization_id)
          .maybeSingle();

        if (!existente) {
          errores.push({ fila: numeroFila, mensaje: "Producto no encontrado (puede haber sido borrado)." });
          continue;
        }

        const { error } = await supabase
          .from("productos")
          .update({
            nombre: d.nombre,
            marca_id: marcaId,
            categoria_id: categoriaId,
            proveedor_id: proveedorId,
            kg: d.kg,
            unidad_medida: d.unidadMedida,
            costo: d.costo,
            porcentaje_ganancia_cerrada: cerrada.porcentaje,
            precio_venta_cerrada: cerrada.precio,
            precio_manual_cerrada: false,
            porcentaje_ganancia_abierta: abierta.porcentaje,
            precio_venta_abierta: abierta.precio,
            precio_manual_abierta: false,
            porcentaje_ganancia_por_mayor: porMayor.porcentaje,
            precio_venta_por_mayor: porMayor.precio,
            precio_manual_por_mayor: false,
          })
          .eq("id", d.id);

        if (error) {
          const mensaje = error.code === "23505" ? "Ya existe un producto con ese nombre y esa cantidad." : "No se pudo actualizar el producto.";
          errores.push({ fila: numeroFila, mensaje });
          continue;
        }

        actualizados++;
        continue;
      }

      const resultado = await insertarProducto(supabase, {
        organization_id: actor.organization_id,
        nombre: d.nombre,
        marca_id: marcaId,
        categoria_id: categoriaId,
        proveedor_id: proveedorId,
        descripcion: null,
        kg: d.kg,
        unidad_medida: d.unidadMedida,
        costo: d.costo,
        porcentaje_ganancia_cerrada: cerrada.porcentaje,
        precio_venta_cerrada: cerrada.precio,
        precio_manual_cerrada: false,
        porcentaje_ganancia_abierta: abierta.porcentaje,
        precio_venta_abierta: abierta.precio,
        precio_manual_abierta: false,
        porcentaje_ganancia_por_mayor: porMayor.porcentaje,
        precio_venta_por_mayor: porMayor.precio,
        precio_manual_por_mayor: false,
        oferta: false,
        created_by: actor.id,
      });

      if (!resultado.ok) {
        const mensaje =
          resultado.motivo === "duplicado"
            ? "Ya existe un producto con ese nombre y esos kg."
            : "No se pudo guardar el producto.";
        errores.push({ fila: numeroFila, mensaje });
        continue;
      }

      creados++;
    } catch (err) {
      errores.push({ fila: numeroFila, mensaje: err instanceof Error ? err.message : "Error inesperado." });
    }
  }

  return NextResponse.json({ ok: true, creados, actualizados, errores });
}
