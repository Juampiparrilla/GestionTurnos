import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { createCajaDeudaSchema } from "@/lib/validations/caja-deuda";

export const runtime = "nodejs";

export async function GET() {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caja_deudas")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar las deudas." }, { status: 400 });
  }

  return NextResponse.json({ deudas: data });
}

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createCajaDeudaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caja_deudas")
    .insert({
      organization_id: actor.organization_id,
      fecha: d.fecha,
      acreedor: d.acreedor,
      monto: d.monto,
      observacion: d.observacion || null,
      created_by: actor.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear la deuda. Intentá de nuevo." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, deuda: data });
}
