import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateCajaEtiquetaSchema } from "@/lib/validations/caja-etiqueta";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateCajaEtiquetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  }

  const supabase = await createClient();

  // No se puede cambiar el tipo de una etiqueta que ya tiene movimientos
  // asociados: cambiaría el signo de movimientos históricos ya cargados.
  if (parsed.data.tipo) {
    const { data: etiquetaActual } = await supabase
      .from("caja_etiquetas")
      .select("tipo")
      .eq("id", id)
      .single();

    if (etiquetaActual && etiquetaActual.tipo !== parsed.data.tipo) {
      const { count } = await supabase
        .from("caja_movimientos")
        .select("id", { count: "exact", head: true })
        .eq("etiqueta_id", id);

      if (count && count > 0) {
        return NextResponse.json(
          { error: "No se puede cambiar el tipo de una etiqueta que ya tiene movimientos. Creá otra etiqueta." },
          { status: 400 },
        );
      }
    }
  }

  const { data, error } = await supabase
    .from("caja_etiquetas")
    .update(parsed.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    const message = error.code === "23505" ? "Ya existe una etiqueta con ese nombre." : "No se pudo guardar el cambio. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Etiqueta no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const supabase = await createClient();
  const { error } = await supabase.from("caja_etiquetas").delete().eq("id", id);

  if (error) {
    const message =
      error.code === "23503"
        ? "No se puede borrar: hay movimientos que usan esta etiqueta. Desactivala en su lugar."
        : "No se pudo borrar la etiqueta. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
