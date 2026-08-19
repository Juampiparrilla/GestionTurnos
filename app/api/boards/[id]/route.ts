import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateBoardSchema } from "@/lib/validations/board";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateBoardSchema.safeParse(body);
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
  if ("description" in updatePayload) {
    updatePayload.description = updatePayload.description || null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .update(updatePayload)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo guardar el cambio. Intentá de nuevo." },
      { status: 400 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Tablero no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
