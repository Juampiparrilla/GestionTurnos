import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateCategoriaSchema } from "@/lib/validations/categoria";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateCategoriaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = { ...parsed.data };
  if ("descripcion" in updatePayload) {
    updatePayload.descripcion = updatePayload.descripcion || null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .update(updatePayload)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    const message = error.code === "23505" ? "Ya existe una categoría con ese nombre." : "No se pudo guardar el cambio. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
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
  const { error } = await supabase.from("categorias").delete().eq("id", id);

  if (error) {
    const message =
      error.code === "23503"
        ? "No se puede borrar: hay productos que usan esta categoría. Desactivala, o cambiales la categoría primero."
        : "No se pudo borrar la categoría. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
