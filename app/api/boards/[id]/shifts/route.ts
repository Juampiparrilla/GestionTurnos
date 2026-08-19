import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { createShiftSchema } from "@/lib/validations/shift";

export const runtime = "nodejs";

function friendlyShiftError(message: string): string {
  if (message.includes("shift_configurations_time_check")) {
    return "La hora de inicio debe ser anterior a la de fin.";
  }
  return "No se pudo guardar el turno. Intentá de nuevo.";
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
  const parsed = createShiftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("shift_configurations")
    .select("id", { count: "exact", head: true })
    .eq("board_id", boardId);

  const { error } = await supabase.from("shift_configurations").insert({
    organization_id: actor.organization_id,
    board_id: boardId,
    name: parsed.data.name || null,
    start_time: parsed.data.start_time,
    end_time: parsed.data.end_time,
    sort_order: count ?? 0,
    created_by: actor.id,
  });

  if (error) {
    return NextResponse.json({ error: friendlyShiftError(error.message) }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
