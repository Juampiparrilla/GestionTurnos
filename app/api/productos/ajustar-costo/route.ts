import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { bulkUpdateCostoSchema } from "@/lib/validations/producto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bulkUpdateCostoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("fn_bulk_update_costo", {
    p_producto_ids: parsed.data.productoIds,
    p_porcentaje: parsed.data.porcentaje,
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo aplicar el ajuste. Intentá de nuevo." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, updated: data as number });
}
