import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { addMemberSchema } from "@/lib/validations/board";

export const runtime = "nodejs";

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
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("board_members")
    .upsert(
      {
        organization_id: actor.organization_id,
        board_id: boardId,
        user_id: parsed.data.userId,
        active: true,
        created_by: actor.id,
      },
      { onConflict: "board_id,user_id" },
    );

  if (error) {
    const message = error.message.includes("usuario inactivo")
      ? "No se puede asignar un usuario inactivo."
      : "No se pudo asignar el usuario al tablero.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
