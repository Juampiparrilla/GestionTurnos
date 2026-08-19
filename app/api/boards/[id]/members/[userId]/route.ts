import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { z } from "zod";

export const runtime = "nodejs";

const patchSchema = z.object({ active: z.boolean() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id: boardId, userId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_members")
    .update({ active: parsed.data.active })
    .eq("board_id", boardId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo actualizar la membresía." },
      { status: 400 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Membresía no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
