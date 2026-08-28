import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateProveedorSchema } from "@/lib/validations/proveedor";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateProveedorSchema.safeParse(body);
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
  for (const key of ["contacto", "telefono", "email", "notas"] as const) {
    if (key in updatePayload) {
      updatePayload[key] = updatePayload[key] || null;
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proveedores")
    .update(updatePayload)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    const message = error.code === "23505" ? "Ya existe un proveedor con ese nombre." : "No se pudo guardar el cambio. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Proveedor no encontrado." }, { status: 404 });
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
  const { error } = await supabase.from("proveedores").delete().eq("id", id);

  if (error) {
    const message =
      error.code === "23503"
        ? "No se puede borrar: hay productos que usan este proveedor. Desactivalo, o cambiales el proveedor primero."
        : "No se pudo borrar el proveedor. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
