import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateCajaMovimientoSchema } from "@/lib/validations/caja-movimiento";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateCajaMovimientoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  }

  const d = parsed.data;
  const updatePayload: Record<string, unknown> = { updated_by: actor.id };
  if (d.tipo !== undefined) updatePayload.tipo = d.tipo;
  if (d.etiquetaId !== undefined) updatePayload.etiqueta_id = d.etiquetaId;
  if (d.monto !== undefined) updatePayload.monto = d.monto;
  if (d.fecha !== undefined) updatePayload.fecha = d.fecha;
  if (d.boardId !== undefined) updatePayload.board_id = d.boardId;
  if (d.shiftConfigurationId !== undefined) updatePayload.shift_configuration_id = d.shiftConfigurationId;
  if (d.observacion !== undefined) updatePayload.observacion = d.observacion || null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caja_movimientos")
    .update(updatePayload)
    .eq("id", id)
    .eq("estado", "activo")
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el cambio. Intentá de nuevo." }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Movimiento no encontrado o ya anulado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, movimiento: data });
}
