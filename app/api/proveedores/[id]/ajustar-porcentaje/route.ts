import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { bulkUpdatePorcentajeSchema } from "@/lib/validations/proveedor";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = bulkUpdatePorcentajeSchema.safeParse({ ...body, proveedorId: id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("fn_bulk_update_porcentaje_proveedor", {
    p_proveedor_id: parsed.data.proveedorId,
    p_porcentaje_cerrada: parsed.data.porcentajeCerrada,
    p_porcentaje_abierta: parsed.data.porcentajeAbierta,
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo aplicar el ajuste. Intentá de nuevo." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, updated: data as number });
}
