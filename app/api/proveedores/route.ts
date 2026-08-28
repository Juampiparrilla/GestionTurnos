import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { createProveedorSchema } from "@/lib/validations/proveedor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProveedorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proveedores")
    .insert({
      organization_id: actor.organization_id,
      nombre: parsed.data.nombre,
      contacto: parsed.data.contacto || null,
      telefono: parsed.data.telefono || null,
      email: parsed.data.email || null,
      notas: parsed.data.notas || null,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (error) {
    const message = error.code === "23505" ? "Ya existe un proveedor con ese nombre." : "No se pudo crear el proveedor. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
