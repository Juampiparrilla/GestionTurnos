import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { setAssignmentSchema } from "@/lib/validations/assignment";

export const runtime = "nodejs";

function friendlyAssignmentError(message: string): string {
  if (message.includes("Falta el empleado")) {
    return "Elegí a la persona para asignar.";
  }
  if (message.includes("No autorizado")) {
    return "No autorizado.";
  }
  return "No se pudo guardar la asignación. Intentá de nuevo.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id: boardId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = setAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_shift_assignment", {
    p_board_id: boardId,
    p_shift_configuration_id: parsed.data.shiftConfigurationId,
    p_day_of_week: parsed.data.dayOfWeek,
    p_status: parsed.data.status,
    p_user_id: parsed.data.status === "EMPLEADO" ? parsed.data.userId : null,
  });

  if (error) {
    return NextResponse.json({ error: friendlyAssignmentError(error.message) }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
