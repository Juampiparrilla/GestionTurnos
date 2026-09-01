import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/require-role";
import { createCajaEtiquetaSchema } from "@/lib/validations/caja-etiqueta";

export const runtime = "nodejs";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("caja_etiquetas").select("*").order("nombre");

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar las etiquetas." }, { status: 400 });
  }

  return NextResponse.json({ etiquetas: data });
}

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createCajaEtiquetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caja_etiquetas")
    .insert({
      organization_id: actor.organization_id,
      nombre: parsed.data.nombre,
      tipo: parsed.data.tipo,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (error) {
    const message = error.code === "23505" ? "Ya existe una etiqueta con ese nombre." : "No se pudo crear la etiqueta. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
