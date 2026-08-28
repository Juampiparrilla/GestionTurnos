import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateProductoSchema } from "@/lib/validations/producto";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateProductoSchema.safeParse(body);
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
  if ("categoriaId" in updatePayload) {
    updatePayload.categoria_id = updatePayload.categoriaId || null;
    delete updatePayload.categoriaId;
  }
  if ("proveedorId" in updatePayload) {
    updatePayload.proveedor_id = updatePayload.proveedorId || null;
    delete updatePayload.proveedorId;
  }
  if ("marca" in updatePayload) {
    updatePayload.marca = updatePayload.marca || null;
  }
  if ("descripcion" in updatePayload) {
    updatePayload.descripcion = updatePayload.descripcion || null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .update(updatePayload)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el cambio. Intentá de nuevo." }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
