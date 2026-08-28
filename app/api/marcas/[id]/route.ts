import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateMarcaSchema } from "@/lib/validations/marca";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateMarcaSchema.safeParse(body);
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
  const { data, error } = await supabase
    .from("marcas")
    .update(parsed.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    const message = error.code === "23505" ? "Ya existe una marca con ese nombre." : "No se pudo guardar el cambio. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Marca no encontrada." }, { status: 404 });
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
  const { error } = await supabase.from("marcas").delete().eq("id", id);

  if (error) {
    const message =
      error.code === "23503"
        ? "No se puede borrar: hay productos que usan esta marca. Desactivala, o cambiales la marca primero."
        : "No se pudo borrar la marca. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
