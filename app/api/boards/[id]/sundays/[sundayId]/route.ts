import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { setSundaySchema } from "@/lib/validations/sunday";

export const runtime = "nodejs";

function friendlySundayError(message: string): string {
  if (message.includes("uq_sundays_board_date_user")) {
    return "Esa persona ya está asignada a ese domingo.";
  }
  return "No se pudo guardar el cambio. Intentá de nuevo.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sundayId: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { sundayId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = setSundaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sundays")
    .update({ sunday_date: parsed.data.sundayDate, user_id: parsed.data.userId })
    .eq("id", sundayId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: friendlySundayError(error.message) }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Domingo no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sundayId: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { sundayId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sundays")
    .delete()
    .eq("id", sundayId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el domingo." }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Domingo no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
