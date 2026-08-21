import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { setSundaySchema } from "@/lib/validations/sunday";

export const runtime = "nodejs";

function friendlySundayError(message: string): string {
  if (message.includes("uq_sundays_board_date_user")) {
    return "Esa persona ya está asignada a ese domingo.";
  }
  return "No se pudo guardar el domingo. Intentá de nuevo.";
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
  const parsed = setSundaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sundays").insert({
    organization_id: actor.organization_id,
    board_id: boardId,
    sunday_date: parsed.data.sundayDate,
    user_id: parsed.data.userId,
    created_by: actor.id,
  });

  if (error) {
    return NextResponse.json({ error: friendlySundayError(error.message) }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
