import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { anularCajaDeudaSchema } from "@/lib/validations/caja-deuda";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = anularCajaDeudaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caja_deudas")
    .update({
      estado: "anulada",
      anulada_por: actor.id,
      anulada_en: new Date().toISOString(),
      motivo_anulacion: parsed.data.motivo || null,
      updated_by: actor.id,
    })
    .eq("id", id)
    .eq("estado", "pendiente")
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo anular la deuda. Intentá de nuevo." }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Deuda no encontrada o ya resuelta." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deuda: data });
}
