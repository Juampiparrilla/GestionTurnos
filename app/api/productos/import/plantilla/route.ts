import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { IMPORT_COLUMNAS, IMPORT_FILA_EJEMPLO } from "@/lib/productos/importar-excel";

export const runtime = "nodejs";

export async function GET() {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Productos");
  sheet.columns = [...IMPORT_COLUMNAS];
  sheet.getRow(1).font = { bold: true };
  sheet.addRow(IMPORT_FILA_EJEMPLO);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="plantilla-productos.xlsx"',
    },
  });
}
