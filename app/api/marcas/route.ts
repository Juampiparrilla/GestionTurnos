import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { createMarcaSchema } from "@/lib/validations/marca";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createMarcaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marcas")
    .insert({
      organization_id: actor.organization_id,
      nombre: parsed.data.nombre,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (error) {
    const message = error.code === "23505" ? "Ya existe una marca con ese nombre." : "No se pudo crear la marca. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
