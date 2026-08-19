import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateShiftSchema } from "@/lib/validations/shift";

export const runtime = "nodejs";

function friendlyShiftError(message: string): string {
  if (message.includes("shift_configurations_time_check")) {
    return "La hora de inicio debe ser anterior a la de fin.";
  }
  return "No se pudo guardar el cambio. Intentá de nuevo.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ shiftId: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { shiftId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateShiftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = { ...parsed.data };
  if ("name" in updatePayload) {
    updatePayload.name = updatePayload.name || null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shift_configurations")
    .update(updatePayload)
    .eq("id", shiftId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: friendlyShiftError(error.message) }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Turno no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
