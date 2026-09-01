import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caja_deudas")
    .update({
      estado: "pagada",
      pagada_por: actor.id,
      pagada_en: new Date().toISOString(),
      updated_by: actor.id,
    })
    .eq("id", id)
    .eq("estado", "pendiente")
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo marcar la deuda como pagada. Intentá de nuevo." }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Deuda no encontrada o ya resuelta." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deuda: data });
}
