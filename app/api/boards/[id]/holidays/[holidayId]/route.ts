import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { setHolidaySchema } from "@/lib/validations/holiday";

export const runtime = "nodejs";

function friendlyHolidayError(message: string): string {
  if (message.includes("uq_holidays_board_date_user")) {
    return "Esa persona ya está asignada a ese feriado.";
  }
  return "No se pudo guardar el cambio. Intentá de nuevo.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; holidayId: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { holidayId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = setHolidaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("holidays")
    .update({ holiday_date: parsed.data.holidayDate, user_id: parsed.data.userId })
    .eq("id", holidayId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: friendlyHolidayError(error.message) }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Feriado no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; holidayId: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { holidayId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("holidays")
    .delete()
    .eq("id", holidayId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el feriado." }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Feriado no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
